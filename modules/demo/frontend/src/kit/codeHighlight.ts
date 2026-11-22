import type { HLJSApi, LanguageFn } from "highlight.js";
import { GUESS_LANGUAGE_BYTES } from "./detect";
import type { TokenKind } from "../highlight";

/**
 * La coloration des blocs de code d'un message — langues courantes, chargées
 * à la DEMANDE.
 *
 * Guide pour un agent : brique du KIT. `highlight.js` et chaque langue
 * s'importent par `import()` au premier bloc coloré : tant qu'aucun message
 * n'a de code, la page n'en charge pas un octet (D33). La sortie de
 * `hljs.highlight()` est une chaîne de `<span class="hljs-…">` et de texte
 * échappé ; `tokensOfHtml` la LIT jeton par jeton (sans jamais l'injecter
 * dans la page) et projette chaque portée sur le vocabulaire de couleurs de
 * `highlight.ts` (`.tok-<kind>`) — un seul jeu de couleurs pour toute la
 * démo. Le surligneur TypeScript des leçons (`highlight.ts`) garde son rôle.
 * Une langue absente de la liste rend `null` : le bloc reste en texte brut.
 */

/** Les teintes d'un jeton de code : celles des leçons, plus le diff. */
export type CodeKind = TokenKind | "added" | "removed";

/** Un morceau du code et sa teinte. */
export interface ICodeToken {
  kind: CodeKind;
  text: string;
}

/** Au-dessous de cette pertinence, la langue devinée n'est pas crue. */
const GUESS_MIN_RELEVANCE = 5;

/** Les chargeurs des langues permises : un `import()` littéral chacune. */
const LOADERS: Readonly<
  Partial<Record<string, () => Promise<{ default: LanguageFn }>>>
> = {
  typescript: () => import("highlight.js/lib/languages/typescript"),
  javascript: () => import("highlight.js/lib/languages/javascript"),
  json: () => import("highlight.js/lib/languages/json"),
  bash: () => import("highlight.js/lib/languages/bash"),
  css: () => import("highlight.js/lib/languages/css"),
  xml: () => import("highlight.js/lib/languages/xml"),
  sql: () => import("highlight.js/lib/languages/sql"),
  python: () => import("highlight.js/lib/languages/python"),
  yaml: () => import("highlight.js/lib/languages/yaml"),
  diff: () => import("highlight.js/lib/languages/diff"),
};

/** Les étiquettes usuelles d'un bloc ```langue, ramenées à la langue chargée. */
const ALIASES: Readonly<Record<string, string>> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  node: "javascript",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  html: "xml",
  svg: "xml",
  py: "python",
  yml: "yaml",
  patch: "diff",
};

/** La langue chargée qui répond à une étiquette, ou `null` si elle n'est pas permise. */
export function canonicalLanguage(label: string): string | null {
  const name = ALIASES[label] ?? label;
  return Object.hasOwn(LOADERS, name) ? name : null;
}

/** `highlight.js/lib/core`, importé une fois ; reprend après un échec réseau. */
let core: Promise<HLJSApi> | null = null;

/** Les langues déjà enregistrées auprès du cœur. */
const registered = new Map<string, Promise<void>>();

// #region chat-lazy-highlight
/** Charge le cœur de `highlight.js`, au premier appel seulement. */
function loadCore(): Promise<HLJSApi> {
  if (core === null) {
    core = import("highlight.js/lib/core").then((module) => module.default);
    core.catch(() => {
      core = null;
    });
  }
  return core;
}
// #endregion

/** Charge et enregistre une langue, une seule fois. */
function register(hljs: HLJSApi, name: string): Promise<void> {
  const known = registered.get(name);
  if (known !== undefined) return known;
  const load = LOADERS[name];
  const pending =
    load === undefined
      ? Promise.resolve()
      : load().then((module) => hljs.registerLanguage(name, module.default));
  registered.set(name, pending);
  pending.catch(() => registered.delete(name));
  return pending;
}

/** Le texte d'une entité que `highlight.js` échappe. */
const ENTITIES: Readonly<Record<string, string>> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
};

/** Rend leur caractère aux cinq entités de `highlight.js`. */
function unescapeEntities(text: string): string {
  return text.includes("&")
    ? text.replace(
        /&(?:amp|lt|gt|quot|#x27);/g,
        (entity) => ENTITIES[entity] ?? entity,
      )
    : text;
}

/** La portée `hljs-xxx` d'une classe, projetée sur une teinte (`héritée` si inconnue). */
function kindOf(classes: string, inherited: CodeKind): CodeKind {
  const first = classes.split(" ", 1)[0] ?? "";
  switch (first.replace(/^hljs-/, "")) {
    case "comment":
    case "quote":
    case "doctag":
      return "comment";
    case "string":
    case "regexp":
    case "char":
    case "template-variable":
      return "string";
    case "keyword":
    case "built_in":
    case "literal":
    case "selector-tag":
    case "tag":
    case "section":
    case "name":
      return "keyword";
    case "meta":
      return "decorator";
    case "title":
    case "type":
    case "class":
    case "attr":
    case "attribute":
    case "variable":
    case "property":
    case "selector-id":
    case "selector-class":
      return "type";
    case "number":
    case "symbol":
    case "bullet":
    case "link":
      return "number";
    case "addition":
      return "added";
    case "deletion":
      return "removed";
    default:
      return inherited;
  }
}

/**
 * Lit la sortie HTML de `hljs.highlight()` en jetons à plat. Le texte y est
 * échappé (`<` y est toujours une balise) : aucun HTML n'est interprété, les
 * balises ne servent qu'à ouvrir et fermer une teinte. Sans perte : la
 * concaténation des jetons redonne le code.
 */
export function tokensOfHtml(html: string): ICodeToken[] {
  const tokens: ICodeToken[] = [];
  const stack: CodeKind[] = [];
  const OPEN = '<span class="';
  let i = 0;
  while (i < html.length) {
    if (html.startsWith(OPEN, i)) {
      const quote = html.indexOf('"', i + OPEN.length);
      const close = html.indexOf(">", quote);
      stack.push(
        kindOf(html.slice(i + OPEN.length, quote), stack.at(-1) ?? "plain"),
      );
      i = close + 1;
    } else if (html.startsWith("</span>", i)) {
      stack.pop();
      i += "</span>".length;
    } else {
      const stop = html.indexOf("<", i);
      const end = stop < 0 ? html.length : stop;
      const kind = stack.at(-1) ?? "plain";
      const text = unescapeEntities(html.slice(i, end));
      const last = tokens.at(-1);
      if (last?.kind === kind) last.text += text;
      else tokens.push({ kind, text });
      i = end;
    }
  }
  return tokens;
}

/**
 * Colore un bloc de code. Charge `highlight.js` (et la langue) au PREMIER
 * appel ; sans étiquette, la langue se devine sur les `GUESS_LANGUAGE_BYTES`
 * premiers octets, parmi les langues permises.
 *
 * @param code - le code, déjà borné par l'appelant
 * @param language - la langue de l'étiquette, ou `null` pour la deviner
 * @returns les jetons, ou `null` si la langue est inconnue ou non devinée
 *   (le bloc reste alors en texte brut)
 */
export async function highlightCode(
  code: string,
  language: string | null,
): Promise<ICodeToken[] | null> {
  const hljs = await loadCore();
  let name = language === null ? null : canonicalLanguage(language);
  if (name === null && language !== null) return null;
  if (name === null) {
    const names = Object.keys(LOADERS);
    await Promise.all(names.map((each) => register(hljs, each)));
    const guess = hljs.highlightAuto(
      code.slice(0, GUESS_LANGUAGE_BYTES),
      names,
    );
    if (guess.language === undefined || guess.relevance < GUESS_MIN_RELEVANCE)
      return null;
    name = guess.language;
  } else {
    await register(hljs, name);
  }
  return tokensOfHtml(
    hljs.highlight(code, { language: name, ignoreIllegals: true }).value,
  );
}
