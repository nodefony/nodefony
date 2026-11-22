/**
 * Coloration du code TypeScript des pages d'apprentissage — sans bibliothèque :
 * les extraits sont courts, et une dépendance de coloration pèserait plus que
 * tout le reste de la page.
 *
 * Guide pour un agent : la découpe est SANS PERTE — la concaténation des
 * jetons redonne le texte source à l'octet près (le test du module l'exige).
 * Les décorateurs ont leur propre couleur : c'est ce que la démo enseigne.
 */

/** Nature d'un jeton, qui décide de sa couleur (`.tok-<kind>` dans la CSS). */
export type TokenKind =
  "comment" | "string" | "keyword" | "decorator" | "type" | "number" | "plain";

/** Un morceau du texte source et sa nature. */
export interface IToken {
  kind: TokenKind;
  text: string;
  /** Position du jeton dans le source — une clé stable pour l'affichage. */
  at: number;
}

const KEYWORDS: ReadonlySet<string> = new Set([
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "declare",
  "default",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "interface",
  "keyof",
  "let",
  "new",
  "null",
  "of",
  "override",
  "private",
  "protected",
  "public",
  "readonly",
  "return",
  "satisfies",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "type",
  "typeof",
  "undefined",
  "void",
  "while",
]);

/**
 * Un jeton reconnu : commentaire, chaîne, décorateur, nombre, identifiant. Les chaînes simples et doubles ne franchissent pas la ligne :
 * l'apostrophe d'un texte reste du texte.
 */
const TOKEN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(@[A-Za-z_]\w*)|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

/**
 * La nature d'un jeton reconnu, lue sur son premier caractère : chaque
 * alternative de `TOKEN` commence par un caractère qui lui est propre.
 */
function tokenKind(text: string): TokenKind {
  if (text.startsWith("//") || text.startsWith("/*")) return "comment";
  if (/^["'`]/.test(text)) return "string";
  if (text.startsWith("@")) return "decorator";
  if (/^\d/.test(text)) return "number";
  if (KEYWORDS.has(text)) return "keyword";
  return /^[A-Z]/.test(text) ? "type" : "plain";
}

/**
 * Découpe un extrait en jetons colorables.
 *
 * @param source - le code à colorer
 * @returns les jetons, dans l'ordre ; leur concaténation vaut `source`
 */
export function highlight(source: string): IToken[] {
  const tokens: IToken[] = [];
  let last = 0;
  for (const match of source.matchAll(TOKEN)) {
    const start = match.index;
    if (start > last)
      tokens.push({ kind: "plain", text: source.slice(last, start), at: last });
    const text = match[0];
    tokens.push({ kind: tokenKind(text), text, at: start });
    last = start + text.length;
  }
  if (last < source.length)
    tokens.push({ kind: "plain", text: source.slice(last), at: last });
  return tokens;
}
