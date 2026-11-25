import { Service, Module, injectable } from "nodefony";
import { ormRegistry } from "@nodefony/orm-core";
import {
  FetchPublicError,
  SsrfError,
  fetchPublic,
  type IFetchPublicOptions,
  type IFetchPublicResult,
} from "@nodefony/security";
import { DEMO_CONNECTOR } from "../config/config";
import { RateLimiter } from "../kit/rateLimit";
import { MESSAGE_ENTITY, type MessageRow } from "../entity/rooms";
import type { ChatLinkPreview } from "../../frontend/src/chat/chatContract";
import { messageLinks } from "../../frontend/src/kit/messageLinks";

/** Le service d'aperçu de lien est enregistré sous ce nom. */
export const LINK_PREVIEW_SERVICE = "linkPreview";

/** Aperçus servis par appelant (compte, sinon adresse) et par minute. */
export const LINK_PREVIEW_QUOTA = 30;

/** Durée de la fenêtre du quota, en ms. */
export const LINK_PREVIEW_WINDOW_MS = 60_000;

/** Adresses gardées en mémoire : au-delà, les plus anciennes sortent. */
export const LINK_PREVIEW_CACHE_MAX = 500;

/** Durée de garde d'une issue durable (`read`, `internal`, `not-html`), en ms. */
export const LINK_PREVIEW_TTL_MS = 15 * 60_000;

/** Durée de garde d'un échec passager (`timeout`, `unreachable`), en ms. */
export const LINK_PREVIEW_FAILURE_TTL_MS = 60_000;

/** Octets de page lus au plus : le `<head>` tient très en deçà. */
export const LINK_PREVIEW_MAX_BYTES = 262_144;

/** Délai TOTAL de la lecture d'un site tiers, en ms. */
export const LINK_PREVIEW_TIMEOUT_MS = 4000;

/** Redirections suivies au plus. */
export const LINK_PREVIEW_MAX_REDIRECTS = 3;

/** Caractères d'une page analysés au plus. */
const SCAN_MAX = 262_144;

/** Longueur maximale d'une balise lue ; au-delà, elle est ignorée. */
const TAG_MAX = 2048;

/** Longueurs gardées de ce que la page montre. */
const TITLE_MAX = 140;
const DESCRIPTION_MAX = 300;
const SITE_MAX = 80;

/** Pourquoi un aperçu n'est pas rendu — le contrôleur en fait un statut. */
export type LinkPreviewRefusalReason = "not-found" | "rate-limited";

/**
 * Un aperçu refusé AVANT toute lecture du site tiers : le message ou son lien
 * n'existe pas, ou la session a épuisé son quota. Le service dit POURQUOI,
 * le contrôleur dit COMMENT (404, 429 avec `Retry-After`).
 */
export class LinkPreviewRefusal extends Error {
  override readonly name = "LinkPreviewRefusal";
  readonly reason: LinkPreviewRefusalReason;
  /** Secondes à attendre (`rate-limited`) ; `0` sinon. */
  readonly retryAfterS: number;

  constructor(
    reason: LinkPreviewRefusalReason,
    message: string,
    retryAfterS = 0,
  ) {
    super(message);
    this.reason = reason;
    this.retryAfterS = retryAfterS;
  }
}

/** Ce qu'une page dit d'elle-même ; `null` quand elle ne le dit pas. */
export interface IPageMeta {
  title: string | null;
  description: string | null;
  site: string | null;
}

/** La primitive de lecture sortante, telle que le service l'appelle (injectable en test). */
export type PublicFetcher = (
  url: string,
  options: IFetchPublicOptions,
) => Promise<IFetchPublicResult>;

/** Les dépendances du service — toutes remplaçables dans un test. */
export interface ILinkPreviewDeps {
  /** La lecture sortante ; par défaut `fetchPublic` de `@nodefony/security`. */
  fetcher?: PublicFetcher;
  /** Le texte d'un message d'un salon, ou `null` ; par défaut la base de la démo. */
  messageText?: (roomId: string, messageId: string) => Promise<string | null>;
  /** L'horloge, en ms. */
  now?: () => number;
}

// ─── Extraction : pure, bornée, sans analyseur DOM ───────────────────────────

/** Un seul passage, jamais de récursion : `&amp;lt;` donne `&lt;`, pas `<`. */
const ENTITY = /&(?:#x([0-9a-f]{1,6})|#(\d{1,7})|([a-z][a-z0-9]{1,9}));/gi;

/**
 * Les entités nommées décodées : les jeux de HTML 4.01 §24 — Latin-1 (96
 * noms, tout le français), « spéciaux » (32 : Œ œ € guillemets tirets…) —,
 * plus `hellip`, `trade`, `bull` et les capitales `AMP LT GT QUOT`. Les
 * points de code sont relus dans la liste WHATWG
 * (`html.spec.whatwg.org/entities.json`), jamais tapés à la main. La casse
 * COMPTE : `&Eacute;` est É, `&eacute;` est é. Un nom hors table reste tel
 * quel, jamais deviné.
 */
const NAMED_ENTITIES: ReadonlyMap<string, string> = pairsOf(
  "nbsp a0 iexcl a1 cent a2 pound a3 curren a4 yen a5 brvbar a6 sect a7 " +
    "uml a8 copy a9 ordf aa laquo ab not ac shy ad reg ae macr af deg b0 " +
    "plusmn b1 sup2 b2 sup3 b3 acute b4 micro b5 para b6 middot b7 cedil b8 " +
    "sup1 b9 ordm ba raquo bb frac14 bc frac12 bd frac34 be iquest bf " +
    "Agrave c0 Aacute c1 Acirc c2 Atilde c3 Auml c4 Aring c5 AElig c6 " +
    "Ccedil c7 Egrave c8 Eacute c9 Ecirc ca Euml cb Igrave cc Iacute cd " +
    "Icirc ce Iuml cf ETH d0 Ntilde d1 Ograve d2 Oacute d3 Ocirc d4 " +
    "Otilde d5 Ouml d6 times d7 Oslash d8 Ugrave d9 Uacute da Ucirc db " +
    "Uuml dc Yacute dd THORN de szlig df agrave e0 aacute e1 acirc e2 " +
    "atilde e3 auml e4 aring e5 aelig e6 ccedil e7 egrave e8 eacute e9 " +
    "ecirc ea euml eb igrave ec iacute ed icirc ee iuml ef eth f0 ntilde f1 " +
    "ograve f2 oacute f3 ocirc f4 otilde f5 ouml f6 divide f7 oslash f8 " +
    "ugrave f9 uacute fa ucirc fb uuml fc yacute fd thorn fe yuml ff " +
    "quot 22 amp 26 lt 3c gt 3e apos 27 OElig 152 oelig 153 Scaron 160 " +
    "scaron 161 Yuml 178 circ 2c6 tilde 2dc ensp 2002 emsp 2003 thinsp 2009 " +
    "zwnj 200c zwj 200d lrm 200e rlm 200f ndash 2013 mdash 2014 lsquo 2018 " +
    "rsquo 2019 sbquo 201a ldquo 201c rdquo 201d bdquo 201e dagger 2020 " +
    "Dagger 2021 permil 2030 lsaquo 2039 rsaquo 203a euro 20ac hellip 2026 " +
    "trade 2122 bull 2022 AMP 26 LT 3c GT 3e QUOT 22",
);

/** « nom pointHexa nom pointHexa … » → la table des entités. */
function pairsOf(list: string): Map<string, string> {
  const words = list.split(" ");
  const map = new Map<string, string>();
  for (let i = 0; i + 1 < words.length; i += 2) {
    const name = words.find((_, k) => k === i);
    const point = words.find((_, k) => k === i + 1);
    if (name !== undefined && point !== undefined)
      map.set(name, String.fromCodePoint(parseInt(point, 16)));
  }
  return map;
}

/** Contrôles, barres de direction et séparateurs invisibles : un titre n'en porte pas. */
const INVISIBLE = /[\p{Cc}\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]+/gu;

/** Décode les entités HTML d'un texte, en un passage. */
function decodeEntities(raw: string): string {
  return raw.replace(
    ENTITY,
    (whole: string, hex?: string, dec?: string, name?: string) => {
      if (name !== undefined) return NAMED_ENTITIES.get(name) ?? whole;
      const point = hex !== undefined ? parseInt(hex, 16) : Number(dec);
      const valid =
        point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff);
      return valid ? String.fromCodePoint(point) : "�";
    },
  );
}

/** Une référence de caractère restée APRÈS le décodage : un encodage double. */
const LEFTOVER = new RegExp(ENTITY.source, "i");

/**
 * Le texte à montrer entre la balise Open Graph et la balise ordinaire :
 * `og:` d'abord, SAUF s'il garde une entité après décodage alors que l'autre
 * n'en garde pas. C'est l'encodage DOUBLE d'un éditeur — vu chez GitHub :
 * `og:description` porte `d&amp;#39;administration` quand `description` porte
 * `d&#39;administration`. Le décodage reste en UN passage : décoder deux
 * fois corromprait une page qui écrit vraiment `&lt;` en toutes lettres.
 */
function readable(
  og: string | null,
  plain: string | null,
  max: number,
): string | null {
  const first = og === null ? null : tidy(og, max);
  const second = plain === null ? null : tidy(plain, max);
  if (first === null) return second;
  return LEFTOVER.test(first) && second !== null && !LEFTOVER.test(second)
    ? second
    : first;
}

/**
 * Un texte de page rendu affichable : entités décodées, contrôles et blancs
 * ramenés à une espace, coupé à `max` sans scinder une paire de substitution.
 * `null` si rien ne reste.
 */
function tidy(raw: string, max: number): string | null {
  const bounded = raw.length > max * 4 ? raw.slice(0, max * 4) : raw;
  const text = decodeEntities(bounded)
    .replace(INVISIBLE, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text === "") return null;
  if (text.length <= max) return text;
  let cut = max - 1;
  const last = text.charCodeAt(cut - 1);
  if (last >= 0xd800 && last <= 0xdbff) cut--;
  return `${text.slice(0, cut).trimEnd()}…`;
}

const SPACE = /\s/;

/** Une balise lue : ses attributs à plat (`nom, valeur, nom, valeur…`) et où reprendre. */
interface IReadTag {
  attrs: string[];
  next: number;
  /** Caractères parcourus : le budget total de l'analyse s'y décompte. */
  spent: number;
}

/**
 * Lit les attributs d'une balise à partir de `from`, sans regex : bornée à
 * `TAG_MAX` caractères, elle rend toujours un `next` qui avance.
 */
function readTag(html: string, from: number, end: number): IReadTag {
  const attrs: string[] = [];
  const limit = Math.min(end, from + TAG_MAX);
  let i = from;
  while (i < limit) {
    const ch = html.charAt(i);
    if (ch === ">") return { attrs, next: i + 1, spent: i + 1 - from };
    if (SPACE.test(ch) || ch === "/") {
      i++;
      continue;
    }
    const nameStart = i;
    while (i < limit) {
      const c = html.charAt(i);
      if (SPACE.test(c) || c === "=" || c === ">" || c === "/") break;
      i++;
    }
    const name = html.slice(nameStart, i).toLowerCase();
    while (i < limit && SPACE.test(html.charAt(i))) i++;
    let value = "";
    if (html.charAt(i) === "=") {
      i++;
      while (i < limit && SPACE.test(html.charAt(i))) i++;
      const quote = html.charAt(i);
      if (quote === '"' || quote === "'") {
        let j = i + 1;
        while (j < limit && html.charAt(j) !== quote) j++;
        if (j >= limit) return { attrs, next: from + 1, spent: limit - from };
        value = html.slice(i + 1, j);
        i = j + 1;
      } else {
        const valueStart = i;
        while (i < limit) {
          const c = html.charAt(i);
          if (SPACE.test(c) || c === ">") break;
          i++;
        }
        value = html.slice(valueStart, i);
      }
    }
    if (name !== "") attrs.push(name, value);
  }
  return { attrs, next: from + 1, spent: limit - from };
}

/** La valeur d'un attribut lu par `readTag`, ou `null`. */
function attribute(attrs: readonly string[], name: string): string | null {
  for (let i = 0; i < attrs.length; i += 2) {
    if (attrs[i] === name) return attrs[i + 1] ?? "";
  }
  return null;
}

/** Le nom (en minuscules) de la balise qui s'ouvre à `from`, ou `/nom` si elle se ferme. */
function tagName(html: string, from: number): string {
  let i = from;
  if (html.charAt(i) === "/") i++;
  const start = i;
  while (i < from + 12) {
    const code = html.charCodeAt(i);
    const letter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
    const digit = code >= 48 && code <= 57;
    if (!letter && !digit) break;
    i++;
  }
  const name = html.slice(start, i).toLowerCase();
  return html.charAt(from) === "/" ? `/${name}` : name;
}

const SCRIPT_END = /<\/script[\s>]/gi;
const STYLE_END = /<\/style[\s>]/gi;
const TITLE_END = /<\/title[\s>]/gi;

/** Où se ferme le contenu brut d'une balise (`script`, `style`, `title`), ou `end`. */
function rawEnd(
  closing: RegExp,
  html: string,
  from: number,
  end: number,
): number {
  closing.lastIndex = from;
  const found = closing.exec(html);
  return found === null || found.index > end ? end : found.index;
}

/**
 * Ce qu'une page dit d'elle-même : titre (`og:title`, sinon `<title>`),
 * description (`og:description`, sinon `meta description`) et nom du site
 * (`og:site_name`). Lecture d'une seule traversée, bornée à 256 Kio, SANS
 * analyseur DOM ni regex à retour arrière : une page forgée coûte le temps de
 * la lire, pas plus. S'arrête à `</head>` ou `<body`. Tout texte rendu est
 * décodé, nettoyé de ses contrôles et coupé.
 *
 * @param html - le début de la page, décodé en texte
 * @returns ce que la page annonce ; `null` pour ce qu'elle ne dit pas
 */
export function extractPageMeta(html: string): IPageMeta {
  const end = Math.min(html.length, SCAN_MAX);
  let ogTitle: string | null = null;
  let pageTitle: string | null = null;
  let ogDescription: string | null = null;
  let metaDescription: string | null = null;
  let ogSite: string | null = null;
  let pos = 0;
  // Budget TOTAL de caractères lus par `readTag` : une page forgée de balises
  // ouvertes sans fin coûte au plus deux fois sa taille.
  let budget = 2 * SCAN_MAX;
  while (pos < end) {
    const lt = html.indexOf("<", pos);
    if (lt === -1 || lt >= end) break;
    if (html.charAt(lt + 1) === "!") {
      if (html.startsWith("<!--", lt)) {
        const close = html.indexOf("-->", lt + 4);
        pos = close === -1 ? end : close + 3;
      } else {
        const gt = html.indexOf(">", lt);
        pos = gt === -1 ? end : gt + 1;
      }
      continue;
    }
    const name = tagName(html, lt + 1);
    if (name === "body" || name === "/head") break;
    pos = lt + 1 + name.length;
    // Les autres balises ne disent rien d'utile : on ne les lit pas.
    if (
      name !== "meta" &&
      name !== "title" &&
      name !== "script" &&
      name !== "style"
    )
      continue;
    const tag = readTag(html, pos, end);
    budget -= tag.spent;
    if (budget < 0) break;
    pos = tag.next;
    if (name === "meta") {
      const key = (
        attribute(tag.attrs, "property") ??
        attribute(tag.attrs, "name") ??
        ""
      ).toLowerCase();
      const content = attribute(tag.attrs, "content");
      if (content === null) continue;
      if (key === "og:title") ogTitle ??= content;
      else if (key === "og:description") ogDescription ??= content;
      else if (key === "description") metaDescription ??= content;
      else if (key === "og:site_name") ogSite ??= content;
    } else if (name === "title") {
      // Seul le premier titre compte : les suivants ne sont pas cherchés (un
      // `<title>` répété ne coûterait sinon une recherche chacun).
      if (pageTitle === null) {
        const window = html.slice(pos, Math.min(end, pos + 2000));
        TITLE_END.lastIndex = 0;
        const closing = TITLE_END.exec(window);
        const length = closing === null ? window.length : closing.index;
        pageTitle = window.slice(0, length);
        pos += length;
      }
    } else if (name === "script") {
      pos = rawEnd(SCRIPT_END, html, pos, end);
    } else {
      pos = rawEnd(STYLE_END, html, pos, end);
    }
  }
  return {
    title: readable(ogTitle, pageTitle, TITLE_MAX),
    description: readable(ogDescription, metaDescription, DESCRIPTION_MAX),
    site: ogSite !== null ? tidy(ogSite, SITE_MAX) : null,
  };
}

// ─── Le service ──────────────────────────────────────────────────────────────

/** Une issue gardée, avec sa date de péremption. */
class CacheEntry {
  constructor(
    readonly preview: ChatLinkPreview,
    readonly expires: number,
  ) {}
}

/** Le charset annoncé par `Content-Type`, ou `utf-8`. */
function charsetOf(contentType: string): string {
  const at = contentType.toLowerCase().indexOf("charset=");
  if (at === -1) return "utf-8";
  const [first = ""] = contentType.slice(at + 8).split(";");
  const label = first.trim().replace(/^"|"$/g, "");
  return label === "" ? "utf-8" : label;
}

/** Le texte d'une page, selon le charset de l'en-tête ; `utf-8` si le label est inconnu. */
function decodeBody(body: Uint8Array, contentType: string): string {
  try {
    return new TextDecoder(charsetOf(contentType)).decode(body);
  } catch {
    return new TextDecoder("utf-8").decode(body);
  }
}

/** L'hôte d'une adresse, pour nommer le site quand la page ne le dit pas. */
function hostOf(href: string): string {
  try {
    return new URL(href).hostname;
  } catch {
    return "";
  }
}

/**
 * L'aperçu d'un lien d'un message — titre et description de la page liée,
 * lus par le SERVEUR (jamais par le navigateur du lecteur).
 *
 * Guide pour un agent : la route ne reçoit jamais une adresse, elle désigne
 * le n-ième lien d'un message ; ce service relit le message en base et prend
 * ce lien avec la MÊME règle que la page (`messageLinks` de
 * `frontend/src/kit/messageLinks.ts` : les liens des blocs de texte seuls), sinon il deviendrait un lecteur du réseau
 * interne offert à tout le salon. La lecture passe par `fetchPublic`
 * (`@nodefony/security`) : IP vérifiée puis épinglée à chaque saut, trois
 * redirections au plus, 256 Kio, 4 s en tout, privées REFUSÉES même en
 * développement (jamais `allowPrivate`). L'issue de la lecture est une DONNÉE
 * (`ChatLinkPreview`) ; seuls un message ou un lien absent et un quota épuisé
 * sont des refus (`LinkPreviewRefusal`, que le contrôleur traduit en 404 et
 * 429). Pas d'image : aller la chercher offrirait l'adresse IP des lecteurs
 * au site tiers. Garde 500 adresses 15 min (60 s pour un échec passager) ;
 * 30 aperçus par minute et par appelant. Injecté par
 * `@Inject("LinkPreviewService")`.
 */
@injectable()
class LinkPreviewService extends Service {
  readonly #fetcher: PublicFetcher;
  readonly #messageText: (
    roomId: string,
    messageId: string,
  ) => Promise<string | null>;
  readonly #now: () => number;
  /** `Map` à ordre d'insertion : la première clé est la plus ancienne. */
  readonly #cache = new Map<string, CacheEntry>();
  readonly #quota: RateLimiter;

  /**
   * @param module - le module qui le déclare ; absent dans un test
   * @param deps - lecture sortante, lecture du message et horloge (tests)
   */
  constructor(module?: Module, deps: ILinkPreviewDeps = {}) {
    super(
      LINK_PREVIEW_SERVICE,
      module?.container ?? undefined,
      module?.notificationsCenter,
    );
    this.#fetcher = deps.fetcher ?? fetchPublic;
    this.#messageText = deps.messageText ?? readMessageText;
    this.#now = deps.now ?? Date.now;
    this.#quota = new RateLimiter(
      LINK_PREVIEW_QUOTA,
      LINK_PREVIEW_WINDOW_MS,
      this.#now,
    );
  }

  /**
   * L'aperçu du lien de rang `index` d'un message d'un salon.
   *
   * @param callerKey - ce qui désigne l'appelant pour le quota : son compte, sinon son adresse
   * @param roomId - le salon, DÉJÀ jugé admis par l'appelant
   * @param messageId - le message ; il doit appartenir à ce salon
   * @param index - le rang du lien, comme la page le compte
   * @throws LinkPreviewRefusal `rate-limited` au-delà du quota ; `not-found` si le message ou le lien n'existe pas
   */
  async preview(
    callerKey: string,
    roomId: string,
    messageId: string,
    index: number,
  ): Promise<ChatLinkPreview> {
    // #region link-preview-pick
    this.#spend(callerKey);
    const text = await this.#messageText(roomId, messageId);
    if (text === null)
      throw new LinkPreviewRefusal("not-found", "message introuvable");
    // `at` d'un indice négatif compterait depuis la fin : jamais un rang.
    const href = index < 0 ? undefined : messageLinks(text).at(index);
    if (href === undefined)
      throw new LinkPreviewRefusal("not-found", "lien introuvable");
    // #endregion

    const now = this.#now();
    const kept = this.#cache.get(href);
    if (kept !== undefined) {
      if (kept.expires > now) return kept.preview;
      this.#cache.delete(href);
    }
    const preview = await this.#read(href);
    const transient =
      preview.state === "timeout" || preview.state === "unreachable";
    // Réinsérer (supprimer puis poser) garde l'ordre d'insertion = ordre d'âge.
    this.#cache.delete(href);
    if (this.#cache.size >= LINK_PREVIEW_CACHE_MAX) {
      const oldest = this.#cache.keys().next();
      if (oldest.done !== true) this.#cache.delete(oldest.value);
    }
    this.#cache.set(
      href,
      new CacheEntry(
        preview,
        this.#now() +
          (transient ? LINK_PREVIEW_FAILURE_TTL_MS : LINK_PREVIEW_TTL_MS),
      ),
    );
    return preview;
  }

  /** Compte un aperçu pour cet appelant, ou refuse (429) quand la minute est épuisée. */
  #spend(key: string): void {
    const wait = this.#quota.take(key);
    if (wait > 0)
      throw new LinkPreviewRefusal(
        "rate-limited",
        "trop d'aperçus de lien : réessaie dans un instant",
        wait,
      );
  }

  /** Lit le site tiers et dit ce qu'il en est — jamais une exception. */
  async #read(href: string): Promise<ChatLinkPreview> {
    const host = hostOf(href);
    let page: IFetchPublicResult;
    // #region link-preview-read
    try {
      page = await this.#fetcher(href, {
        maxRedirects: LINK_PREVIEW_MAX_REDIRECTS,
        maxBytes: LINK_PREVIEW_MAX_BYTES,
        timeoutMs: LINK_PREVIEW_TIMEOUT_MS,
        allowHttp: true,
        allowPrivate: false,
        headers: {
          accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
          "user-agent": "NodefonyDemoLinkPreview/1.0",
        },
      });
    } catch (error) {
      if (error instanceof SsrfError)
        return {
          state: error.reason === "unresolvable" ? "unreachable" : "internal",
          url: href,
          site: host,
        };
      if (error instanceof FetchPublicError && error.reason === "timeout")
        return { state: "timeout", url: href, site: host };
      return { state: "unreachable", url: href, site: host };
    }
    // #endregion
    if (page.status < 200 || page.status >= 300)
      return { state: "unreachable", url: href, site: host };
    const contentType = page.headers["content-type"] ?? "";
    if (!/^(text\/html|application\/xhtml\+xml)\b/i.test(contentType))
      return { state: "not-html", url: href, site: host };
    const meta = extractPageMeta(decodeBody(page.body, contentType));
    const site = meta.site ?? host;
    return {
      state: "read",
      url: href,
      site,
      title: meta.title ?? site,
      description: meta.description,
    };
  }
}

/**
 * Le texte d'un message d'un salon, lu sur la base de la démo — le même
 * connecteur que `RoomService`.
 *
 * @throws Error si le connecteur `demo` n'est pas ouvert
 */
async function readMessageText(
  roomId: string,
  messageId: string,
): Promise<string | null> {
  if (!ormRegistry.has(DEMO_CONNECTOR))
    throw new Error(
      `aperçu de lien : le connecteur « ${DEMO_CONNECTOR} » n'est pas ouvert`,
    );
  const row = await ormRegistry
    .get(DEMO_CONNECTOR)
    .getRepository<MessageRow>(MESSAGE_ENTITY)
    .findOne({ id: messageId, roomId });
  return row === null ? null : row.text;
}

export default LinkPreviewService;
