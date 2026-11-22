import { describe, expect, it } from "vitest";
import { LinkParams } from "../frontend/src/chat/chatSchemas";
import {
  CSV_MAX_ROWS,
  detectBlocks,
  type NatureBlock,
} from "../frontend/src/kit/detect";
import {
  collectLinks,
  parseInline,
  parseMarkdown,
  type MdInline,
} from "../frontend/src/kit/markdown";
import { LINK_INDEX_MAX } from "../frontend/src/chat/chatContract";

/**
 * Attaques sur le CONTRAT de la page du chat : ce que `detectBlocks`,
 * `parseInline` et `LinkParams` promettent dans leur TSDoc, face à un message
 * hostile de 64 Kio (`MESSAGE_MAX_BYTES`). Matrice écrite depuis le contrat
 * (bornes, invariants), jamais depuis le corps des fonctions : un test qui
 * lit l'implémentation prouve ce qu'elle fait, pas ce qu'elle doit tenir.
 *
 * Guide pour un agent : `kit/detect.ts` (`detectBlocks`, bornes `CSV_MAX_ROWS`…)
 * et `kit/markdown.ts` (`parseInline`, `collectLinks`) sont purs et partagés
 * par la page ; `chat/chatSchemas.ts` porte `LinkParams`. Ces tests tournent
 * sans serveur (`npm test`). Un test qui rougit ici est un trou de la page,
 * pas un test à assouplir. Le temps se prouve par un PLAFOND absolu large et
 * par un rapport de croissance (quadruplement de l'entrée), jamais par un
 * seuil serré qu'un runner lent ferait mentir.
 */

/** Un message de la taille maximale que le salon accepte. */
const SIZE = 65_536;

/** Le temps de `work`, le meilleur de trois passes (ms) : le bruit ne l'allonge pas. */
function bestOf(work: () => unknown): number {
  let best = Infinity;
  for (let pass = 0; pass < 3; pass++) {
    const start = performance.now();
    work();
    best = Math.min(best, performance.now() - start);
  }
  return best;
}

/** Les entrées hostiles : un seul caractère répété jusqu'à la borne du salon. */
const HOSTILE: Array<[string, string]> = [
  ["crochets ouvrants", "["],
  ["virgules", ","],
  ["apostrophes inverses", "`"],
  ["espaces", " "],
  ["étoiles", "*"],
  ["tirets bas", "_"],
  ["parenthèses", "("],
];

/** Tous les morceaux d'un arbre en ligne, à plat. */
function flatten(nodes: readonly MdInline[]): MdInline[] {
  const all: MdInline[] = [];
  for (const node of nodes) {
    all.push(node);
    if (typeof node !== "string" && "children" in node)
      all.push(...flatten(node.children));
  }
  return all;
}

/** Les adresses des liens d'une ligne. */
function hrefsOf(src: string): string[] {
  const found: string[] = [];
  for (const node of flatten(parseInline(src)))
    if (typeof node !== "string" && node.type === "link") found.push(node.href);
  return found;
}

describe("detectBlocks — un message hostile coûte un temps borné", () => {
  for (const [label, unit] of HOSTILE) {
    it(`64 Kio de ${label} : sous le plafond, et croissance linéaire`, () => {
      const small = unit.repeat(SIZE / 4);
      const full = unit.repeat(SIZE);
      const tSmall = bestOf(() => detectBlocks(small));
      const tFull = bestOf(() => detectBlocks(full));
      expect(tFull, `${label} : ${tFull.toFixed(1)} ms`).toBeLessThan(1500);
      // Quatre fois l'entrée : linéaire ≈ ×4, quadratique ≈ ×16. Le rapport
      // ne se juge que si la petite passe est assez longue pour être mesurée.
      if (tSmall > 5)
        expect(
          tFull / tSmall,
          `${label} : ×${(tFull / tSmall).toFixed(1)}`,
        ).toBeLessThan(12);
    });
  }

  it("un JSON de 10 000 niveaux ne lève pas et rend des blocs", () => {
    for (const text of [
      "[".repeat(10_000) + "]".repeat(10_000),
      '{"a":'.repeat(10_000) + "1" + "}".repeat(10_000),
    ]) {
      const blocks = detectBlocks(text);
      expect(blocks.length).toBeGreaterThan(0);
      expect(blocks.map((b) => b.source).join("")).toBe(text);
    }
  });

  it("un CSV de 5 000 lignes : au plus CSV_MAX_ROWS rendues, le total reste juste", () => {
    const lines = ["nom,valeur,note"];
    for (let i = 0; i < 4999; i++) lines.push(`ligne${i},${i},x`);
    const text = lines.join("\n");
    const table = detectBlocks(text).find(
      (b): b is Extract<NatureBlock, { nature: "csv" }> => b.nature === "csv",
    );
    expect(table, "un CSV de 5 000 lignes est reconnu").toBeDefined();
    expect(table?.header).toEqual(["nom", "valeur", "note"]);
    expect(table?.rows.length).toBeLessThanOrEqual(CSV_MAX_ROWS);
    // En-tête à part : 4 999 lignes de données, annoncées en entier.
    expect(table?.total).toBe(4999);
  });
});

describe("detectBlocks — aucun caractère du message n'est perdu", () => {
  /** Des messages sans clôture ```` ``` ```` ni `$$` : leurs `source` se recollent EXACTEMENT. */
  const plain: Array<[string, string]> = [
    ["texte", "bonjour\nle monde\n\nfin"],
    ["JSON", '{"a":[1,2,{"b":null}],"c":"d"}'],
    ["JSON suivi de texte", '{"a":1}\n\nmerci'],
    ["CSV virgule", "a,b\n1,2\n3,4"],
    ["CSV point-virgule", "a;b\n1;2\n3;4"],
    ["CSV tabulation", "a\tb\n1\t2\n3\t4"],
    ["diff", "@@ -1 +1 @@\n-a\n+b"],
    ["fins de ligne mêlées", "un\r\ndeux\rtrois\n"],
    ["Unicode", "é 😀 \u202E rtl \u0000 nul"],
  ];
  for (const [label, text] of plain) {
    it(`${label} : les sources recollées redonnent le message`, () => {
      const blocks = detectBlocks(text);
      expect(blocks.map((b) => b.source).join("")).toBe(text);
    });
  }

  it("avec des clôtures : chaque source est une tranche du texte, dans l'ordre", () => {
    const text = [
      "avant",
      "```js",
      "const a = 1;",
      "```",
      "milieu",
      "$$",
      "x^2",
      "$$",
      "après",
    ].join("\n");
    const blocks = detectBlocks(text);
    let from = 0;
    for (const block of blocks) {
      const at = text.indexOf(block.source, from);
      expect(
        at,
        `« ${block.source} » est une tranche du texte`,
      ).toBeGreaterThanOrEqual(0);
      from = at + block.source.length;
    }
    // Le corps du code et la formule sont retrouvés : rien n'a été avalé.
    expect(blocks.some((b) => b.nature === "code")).toBe(true);
    expect(blocks.some((b) => b.nature === "math")).toBe(true);
  });

  it("un texte vide ou blanc ne produit aucun bloc", () => {
    expect(detectBlocks("")).toEqual([]);
    expect(detectBlocks("   \n\t ")).toEqual([]);
  });
});

describe("parseInline — un lien n'ouvre que vers le web, tel qu'écrit", () => {
  const hostile = [
    "[x](javascript:alert(1))",
    "[x](JaVaScRiPt:alert(1))",
    "[x](data:text/html,<script>alert(1)</script>)",
    "[x](vbscript:msgbox(1))",
    "[x](file:///etc/passwd)",
    "[x](//evil.test/)",
    "[x]( https://evil.test/ )",
    "javascript:alert(1)",
    "data:text/html;base64,PHNjcmlwdD4=",
    '[x](https://a.test/" onclick="alert(1))',
    "[<img src=x onerror=alert(1)>](https://a.test/)",
  ];
  for (const src of hostile) {
    it(`${JSON.stringify(src).slice(0, 60)} : aucun lien hors http(s), ni espace, ni balise`, () => {
      for (const href of hrefsOf(src)) {
        expect(href).toMatch(/^https?:\/\/[^\s<>"]+$/iu);
        // Verbatim : l'adresse n'est jamais réécrite, seulement relevée.
        expect(src.includes(href)).toBe(true);
      }
    });
  }

  it("IDN, ponycode et adresse avec identifiants : relevées telles qu'écrites, jamais réécrites", () => {
    for (const src of [
      "[x](https://пример.рф/)",
      "[x](https://xn--e1afmkfd.xn--p1ai/)",
      "[x](https://bücher.example/)",
      "[x](http://user@host.test/)",
      "[x](http://user:pass@host.test/)",
      "https://trusted.test@evil.test/",
    ]) {
      for (const href of hrefsOf(src)) expect(src.includes(href)).toBe(true);
    }
  });

  it("parenthèses imbriquées : le lien reste borné par le texte, sans exception", () => {
    for (const src of [
      "[a](https://x.test/(b(c)d))",
      "[a](https://x.test/" + "(".repeat(5000) + ")",
      "[a](" + "(".repeat(5000) + ")",
      "[[[[a]]]](https://x.test/)",
    ]) {
      expect(() => parseInline(src)).not.toThrow();
      for (const href of hrefsOf(src)) expect(src.includes(href)).toBe(true);
    }
  });

  for (const [label, unit] of HOSTILE) {
    it(`64 Kio de ${label} : sous le plafond`, () => {
      const full = unit.repeat(SIZE);
      const elapsed = bestOf(() => parseMarkdown(full));
      expect(elapsed, `${label} : ${elapsed.toFixed(1)} ms`).toBeLessThan(1500);
    });
  }

  it("collectLinks : le rang d'un lien suit l'ordre de la page, code et citations compris", () => {
    const text = [
      "[a](https://un.test/) puis https://deux.test/.",
      "",
      "```",
      "[b](https://dans-un-bloc.test/)",
      "```",
      "",
      "> [c](https://cite.test/)",
      "",
      "- [d](https://liste.test/)",
    ].join("\n");
    expect(collectLinks(parseMarkdown(text))).toEqual([
      "https://un.test/",
      "https://deux.test/",
      "https://cite.test/",
      "https://liste.test/",
    ]);
  });
});

describe("LinkParams — l'indice d'un lien est un entier décimal borné", () => {
  const parse = (index: string) =>
    LinkParams.safeParse({ room: "lobby", message: "m-1", index });

  for (const ok of ["0", "1", "42", String(LINK_INDEX_MAX)]) {
    it(`« ${ok} » est accepté`, () => {
      const result = parse(ok);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.index).toBe(Number(ok));
    });
  }

  for (const bad of [
    "-1",
    String(LINK_INDEX_MAX + 1),
    "100",
    "1e2",
    " 1",
    "0x10",
    "1.5",
    "NaN",
    "Infinity",
    "١",
  ]) {
    it(`« ${bad} » est refusé`, () => {
      expect(parse(bad).success).toBe(false);
    });
  }

  it("un champ en trop est refusé (strictObject)", () => {
    expect(
      LinkParams.safeParse({
        room: "lobby",
        message: "m-1",
        index: "0",
        url: "http://127.0.0.1/",
      }).success,
    ).toBe(false);
  });
});
