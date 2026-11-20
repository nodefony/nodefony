import { describe, expect, it } from "vitest";
import {
  FetchPublicError,
  SsrfError,
  type IFetchPublicOptions,
  type IFetchPublicResult,
} from "@nodefony/security";
import LinkPreviewService, {
  LINK_PREVIEW_CACHE_MAX,
  LINK_PREVIEW_FAILURE_TTL_MS,
  LINK_PREVIEW_QUOTA,
  LINK_PREVIEW_TTL_MS,
  LINK_PREVIEW_WINDOW_MS,
  LinkPreviewRefusal,
  extractPageMeta,
  type PublicFetcher,
} from "../nodefony/service/LinkPreviewService";

/**
 * L'aperçu d'un lien SANS réseau ni base : la lecture sortante, le message et
 * l'horloge sont injectés. Ce que le service décide — quel lien, quelle
 * issue, combien de temps on la garde, qui a épuisé son quota — se prouve
 * ici ; que la lecture sortante refuse bien le réseau interne se prouve dans
 * `@nodefony/security` (`fetchPublic.attack.test.ts`), et la route de bout en
 * bout dans `chat.e2e.test.ts`.
 *
 * Guide pour un agent : `extractPageMeta` est pure, elle se teste avec une
 * page en texte ; le service se construit sans module (`new
 * LinkPreviewService(undefined, { fetcher, messageText, now })`).
 */

const encoder = new TextEncoder();

/** Une réponse HTML minimale. */
function page(
  html: string,
  extra: Partial<IFetchPublicResult> & { contentType?: string } = {},
): IFetchPublicResult {
  const { contentType = "text/html; charset=utf-8", ...rest } = extra;
  return {
    status: 200,
    headers: { "content-type": contentType },
    body: encoder.encode(html),
    truncated: false,
    url: new URL("https://example.test/"),
    redirects: 0,
    ...rest,
  };
}

interface IHarness {
  service: LinkPreviewService;
  calls: Array<{ url: string; options: IFetchPublicOptions }>;
  clock: { now: number };
}

/** Un service dont la lecture rend `answer`, et qui trouve `text` pour tout message. */
function harness(
  answer: (url: string) => IFetchPublicResult | Error,
  text: string | null = "voir https://example.test/a",
): IHarness {
  const calls: IHarness["calls"] = [];
  const clock = { now: 1_000_000 };
  const fetcher: PublicFetcher = async (url, options) => {
    calls.push({ url, options });
    const result = answer(url);
    if (result instanceof Error) throw result;
    return result;
  };
  const service = new LinkPreviewService(undefined, {
    fetcher,
    messageText: async () => text,
    now: () => clock.now,
  });
  return { service, calls, clock };
}

const ask = (h: IHarness, index = 0, who = "s1") =>
  h.service.preview(who, "lobby", "m1", index);

describe("LinkPreviewService — l'issue de la lecture est une donnée", () => {
  it("read : titre, description et site de la page, entités décodées", async () => {
    const h = harness(() =>
      page(
        `<!doctype html><html><head><title>ignoré</title>
         <meta property="og:title" content="Caf&eacute; &amp; Cie &#8212; l&#x27;accueil">
         <meta name="description" content="Une  description
           sur deux lignes">
         <meta property="og:site_name" content="Le Site">
         </head><body><meta property="og:title" content="après le head"></body>`,
      ),
    );
    expect(await ask(h)).toEqual({
      state: "read",
      url: "https://example.test/a",
      site: "Le Site",
      title: "Café & Cie — l'accueil",
      description: "Une description sur deux lignes",
    });
  });

  it("read : sans og:title, le <title> ; sans site, l'hôte ; sans titre, le site", async () => {
    const withTitle = harness(() =>
      page("<head><TITLE> Mon  titre </TITLE></head>"),
    );
    expect(await ask(withTitle)).toMatchObject({
      state: "read",
      title: "Mon titre",
      site: "example.test",
      description: null,
    });
    const bare = harness(() => page("<head></head><body>rien</body>"));
    expect(await ask(bare)).toMatchObject({
      state: "read",
      title: "example.test",
    });
  });

  it("la lecture est appelée avec les bornes de la décision, privées REFUSÉES", async () => {
    const h = harness(() => page("<title>t</title>"));
    await ask(h);
    expect(h.calls).toHaveLength(1);
    const { url, options } = h.calls[0] ?? { url: "", options: {} };
    expect(url).toBe("https://example.test/a");
    expect(options).toMatchObject({
      maxRedirects: 3,
      maxBytes: 262_144,
      timeoutMs: 4000,
      allowHttp: true,
    });
    // Jamais de levée de la garde, même en développement.
    expect(options.allowPrivate).not.toBe(true);
    expect(options.vettedAddresses).toBeUndefined();
    const sent = Object.keys(options.headers ?? {}).map((k) => k.toLowerCase());
    expect(sent).not.toContain("cookie");
    expect(sent).not.toContain("authorization");
  });

  it("internal : la garde SSRF a refusé la cible (y compris après redirection)", async () => {
    const h = harness(() => new SsrfError("cible non publique interdite"));
    expect(await ask(h)).toEqual({
      state: "internal",
      url: "https://example.test/a",
      site: "example.test",
    });
  });

  it("unreachable : hôte inconnu, réseau, statut d'erreur — jamais `internal`", async () => {
    for (const answer of [
      new SsrfError("hôte non résolvable", "unresolvable"),
      new FetchPublicError("network", "ECONNREFUSED"),
      new FetchPublicError("too-many-redirects", "plus de 3"),
      page("erreur", { status: 500 }),
      page("absent", { status: 404 }),
    ]) {
      const h = harness(() => answer);
      expect(await ask(h)).toMatchObject({ state: "unreachable" });
    }
  });

  it("timeout : le délai total est dépassé", async () => {
    const h = harness(() => new FetchPublicError("timeout", "délai"));
    expect(await ask(h)).toMatchObject({ state: "timeout" });
  });

  it("not-html : image, JSON, PDF, ou type absent", async () => {
    for (const contentType of [
      "image/png",
      "application/json",
      "application/pdf",
    ]) {
      const h = harness(() => page("x", { contentType }));
      expect(await ask(h)).toMatchObject({ state: "not-html" });
    }
    const none = harness(() => ({ ...page("<title>t</title>"), headers: {} }));
    expect(await ask(none)).toMatchObject({ state: "not-html" });
  });

  it("le charset annoncé est respecté ; un label inconnu retombe sur utf-8", async () => {
    const latin = harness(() => ({
      ...page(""),
      headers: { "content-type": "text/html; charset=iso-8859-1" },
      body: Uint8Array.from([
        ...encoder.encode("<title>caf"),
        0xe9,
        ...encoder.encode("</title>"),
      ]),
    }));
    expect(await ask(latin)).toMatchObject({ title: "café" });
    const odd = harness(() =>
      page("<title>ok</title>", {
        contentType: "text/html; charset=nope-9000",
      }),
    );
    expect(await ask(odd)).toMatchObject({ state: "read", title: "ok" });
  });
});

describe("LinkPreviewService — quel lien, et seulement celui du message", () => {
  it("prend le lien de rang `index`, comme la page les compte", async () => {
    const h = harness(
      () => page("<title>t</title>"),
      "[a](https://un.test/) et https://deux.test/x.\n\n```\nhttps://code.test/\n```",
    );
    expect(await ask(h, 0)).toMatchObject({ url: "https://un.test/" });
    expect(await ask(h, 1)).toMatchObject({ url: "https://deux.test/x" });
    // Le bloc de code n'est pas un lien de la page : il n'a pas de rang.
    await expect(ask(h, 2)).rejects.toMatchObject({ reason: "not-found" });
  });

  it("une adresse dans un JSON ou un tableau n'a pas de rang : la page ne la rend pas cliquable", async () => {
    const h = harness(
      () => page("<title>t</title>"),
      '{"home": "https://json.test/"}\n\nvoir https://texte.test/',
    );
    expect(await ask(h, 0)).toMatchObject({ url: "https://texte.test/" });
    await expect(ask(h, 1)).rejects.toMatchObject({ reason: "not-found" });
  });

  it("message absent ou sans lien : not-found, et aucune lecture sortante", async () => {
    const gone = harness(() => page("x"), null);
    await expect(ask(gone)).rejects.toBeInstanceOf(LinkPreviewRefusal);
    const bare = harness(() => page("x"), "aucun lien ici");
    await expect(ask(bare)).rejects.toMatchObject({ reason: "not-found" });
    expect(gone.calls).toHaveLength(0);
    expect(bare.calls).toHaveLength(0);
  });
});

describe("LinkPreviewService — la garde en mémoire", () => {
  it("une même adresse n'est lue qu'une fois pendant 15 minutes", async () => {
    const h = harness(() => page("<title>t</title>"));
    await ask(h);
    h.clock.now += LINK_PREVIEW_TTL_MS - 1;
    await ask(h);
    expect(h.calls).toHaveLength(1);
    h.clock.now += 2;
    await ask(h);
    expect(h.calls).toHaveLength(2);
  });

  it("un échec passager n'est gardé qu'une minute", async () => {
    const h = harness(() => new FetchPublicError("timeout", "délai"));
    await ask(h);
    h.clock.now += LINK_PREVIEW_FAILURE_TTL_MS - 1;
    await ask(h);
    expect(h.calls).toHaveLength(1);
    h.clock.now += 2;
    await ask(h);
    expect(h.calls).toHaveLength(2);
  });

  it("`internal` est durable : un refus de cible ne se rejoue pas chaque minute", async () => {
    const h = harness(() => new SsrfError("interdite"));
    await ask(h);
    h.clock.now += LINK_PREVIEW_FAILURE_TTL_MS * 5;
    await ask(h);
    expect(h.calls).toHaveLength(1);
  });

  it("500 adresses au plus : la plus ancienne sort la première", async () => {
    const links = Array.from(
      { length: LINK_PREVIEW_CACHE_MAX + 1 },
      (_, i) => `https://site${i}.test/`,
    );
    const h = harness(() => page("<title>t</title>"), links.join(" "));
    // Un quota assez large : seul le cache est ici sous test.
    for (let i = 0; i < links.length; i++) await ask(h, i, `s${i}`);
    expect(h.calls).toHaveLength(links.length);
    await ask(h, links.length - 1, "z");
    expect(h.calls).toHaveLength(links.length); // la plus récente est gardée
    await ask(h, 0, "z");
    expect(h.calls).toHaveLength(links.length + 1); // la plus ancienne est sortie
  });
});

describe("LinkPreviewService — 30 aperçus par minute et par appelant", () => {
  it("le 31e est refusé avec le délai d'attente ; une autre session n'est pas touchée", async () => {
    const h = harness(() => page("<title>t</title>"));
    for (let i = 0; i < LINK_PREVIEW_QUOTA; i++) await ask(h, 0, "a");
    const refused = await ask(h, 0, "a").catch((e: unknown) => e);
    if (!(refused instanceof LinkPreviewRefusal))
      throw new Error("un refus de quota était attendu");
    expect(refused.reason).toBe("rate-limited");
    const wait = refused.retryAfterS;
    expect(wait).toBeGreaterThanOrEqual(1);
    expect(wait).toBeLessThanOrEqual(LINK_PREVIEW_WINDOW_MS / 1000);
    await expect(ask(h, 0, "b")).resolves.toMatchObject({ state: "read" });
  });

  it("la minute écoulée, la session repart", async () => {
    const h = harness(() => page("<title>t</title>"));
    for (let i = 0; i < LINK_PREVIEW_QUOTA; i++) await ask(h, 0, "a");
    await expect(ask(h, 0, "a")).rejects.toMatchObject({
      reason: "rate-limited",
    });
    h.clock.now += LINK_PREVIEW_WINDOW_MS;
    await expect(ask(h, 0, "a")).resolves.toMatchObject({ state: "read" });
  });

  it("un refus de quota arrive AVANT la lecture du message et du site", async () => {
    let reads = 0;
    const service = new LinkPreviewService(undefined, {
      fetcher: async () => page("<title>t</title>"),
      messageText: async () => {
        reads++;
        return "https://example.test/";
      },
    });
    for (let i = 0; i < LINK_PREVIEW_QUOTA; i++)
      await service.preview("a", "lobby", "m", 0);
    const before = reads;
    await service.preview("a", "lobby", "m", 0).catch(() => undefined);
    expect(reads).toBe(before);
  });
});

describe("extractPageMeta — pure, bornée, sans analyseur DOM", () => {
  it("un `og:` encodé DEUX fois cède à la balise ordinaire (vu chez GitHub)", () => {
    // Recopié de la page de nodefony-core sur GitHub.
    const meta = extractPageMeta(
      `<meta name="description" content="console d&#39;administration. ESM">` +
        `<meta property="og:description" content="console d&amp;#39;administration. ESM">` +
        `<title>t</title><meta property="og:title" content="Un &amp;amp; deux">`,
    );
    expect(meta.description).toBe("console d'administration. ESM");
    // Le titre ordinaire n'a rien de mieux à dire que `t` sans entité : il gagne.
    expect(meta.title).toBe("t");
  });

  it("les entités françaises, la casse comptant ; un nom inconnu reste tel quel", () => {
    expect(
      extractPageMeta(
        `<title>&Eacute;t&eacute; &OElig;uvre 10&nbsp;&euro; &AMP; &inconnue;</title>`,
      ).title,
    ).toBe("Été Œuvre 10 € & &inconnue;");
  });

  it("seul, un `og:` garde son unique décodage : `&amp;lt;` reste « &lt; »", () => {
    const meta = extractPageMeta(
      `<meta property="og:description" content="la balise &amp;lt;b&amp;gt;">`,
    );
    expect(meta.description).toBe("la balise &lt;b&gt;");
  });

  it("lit les attributs entre guillemets, apostrophes ou nus, dans n'importe quel ordre", () => {
    const meta = extractPageMeta(
      `<META CONTENT='Titre A' PROPERTY=og:title><meta content=Desc name=description>`,
    );
    expect(meta).toEqual({
      title: "Titre A",
      description: "Desc",
      site: null,
    });
  });

  it("ignore commentaires, scripts et styles ; s'arrête au corps", () => {
    const meta = extractPageMeta(
      `<!-- <meta property="og:title" content="commentaire"> -->
       <script>var s = '<meta property="og:title" content="script">';</script>
       <style>/* <title>style</title> */</style>
       <title>Vrai titre</title>
       <body><title>autre</title></body>`,
    );
    expect(meta.title).toBe("Vrai titre");
  });

  it("le premier titre l'emporte", () => {
    expect(extractPageMeta(`<title>un</title><title>deux</title>`).title).toBe(
      "un",
    );
  });

  it("contrôles, barres de direction et blancs : ramenés à une espace, rien d'invisible ne reste", () => {
    const meta = extractPageMeta(`<title>a\u0000b\u202Ec\u200Bd\n\t e</title>`);
    expect(meta.title).toBe("a b c d e");
  });

  it("entités : un seul passage, jamais de double décodage, points de code invalides remplacés", () => {
    const meta = extractPageMeta(
      `<title>&amp;lt; &#0; &#xD800; &#x110000; &#65; &inconnue;</title>`,
    );
    expect(meta.title).toBe("&lt; � � � A &inconnue;");
  });

  it("titre et description sont coupés, sans scinder une paire de substitution", () => {
    const long = `${"x".repeat(138)}😀😀😀`;
    const meta = extractPageMeta(`<title>${long}</title>`);
    expect(meta.title?.length).toBeLessThanOrEqual(140);
    expect(meta.title?.endsWith("…")).toBe(true);
    // Aucune moitié de paire de substitution isolée.
    expect(meta.title).not.toMatch(/[\ud800-\udbff](?![\udc00-\udfff])/u);
    const description = extractPageMeta(
      `<meta name="description" content="${"d".repeat(1000)}">`,
    ).description;
    expect(description?.length).toBeLessThanOrEqual(300);
  });

  it("sans rien d'utile : tout est `null`", () => {
    expect(extractPageMeta("")).toEqual({
      title: null,
      description: null,
      site: null,
    });
    expect(extractPageMeta("<html><body>texte</body></html>").title).toBeNull();
  });

  const hostile: Array<[string, string]> = [
    ["balises meta ouvertes", "<meta "],
    ["balises meta à guillemet ouvert", '<meta content="'],
    ["chevrons", "<"],
    ["titres répétés", "<title>"],
    ["scripts répétés", "<script>"],
    ["commentaires non fermés", "<!--"],
    ["entités", "&#x41;&amp;&"],
    ["attributs sans fin", "<meta a=b c=d e=f g=h i=j "],
  ];
  for (const [label, unit] of hostile) {
    it(`une page forgée de ${label} (256 Kio) est lue en temps borné`, () => {
      const html = unit.repeat(Math.ceil(262_144 / unit.length));
      const start = performance.now();
      expect(() => extractPageMeta(html)).not.toThrow();
      const elapsed = performance.now() - start;
      expect(elapsed, `${label} : ${elapsed.toFixed(0)} ms`).toBeLessThan(1000);
    });
  }
});
