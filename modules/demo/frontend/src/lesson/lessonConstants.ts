import { highlight } from "../highlight";

/**
 * Les constantes qu'emploie un extrait de code, avec leur VALEUR et leur
 * fichier — lues dans les sources cités, jamais recopiées : un extrait qui
 * montre `@controller(PARTNER_PATH)` dit aussi que `PARTNER_PATH` vaut
 * `"/demo/api/partner"`.
 *
 * Guide pour un agent : une constante est un identifiant en MAJUSCULES avec
 * un souligné (`ROOM_CHANNEL`), hors chaînes et commentaires. Sa définition
 * est une ligne `const NOM = <chaîne | nombre | gabarit>` d'un fichier cité ;
 * un gabarit (`` `${PARTNER_PATH}/whoami` ``) est résolu à travers les autres
 * constantes. Le test du module exige que chaque constante citée se résolve.
 */

/** Une constante d'un extrait, résolue. */
export interface ILessonConstant {
  name: string;
  /** Valeur telle qu'elle s'écrirait en TypeScript (`"chat:room"`, `2000`). */
  value: string;
  /** Fichier qui la définit. */
  file: string;
}

/** Un identifiant de constante : majuscules, chiffres, au moins un souligné. */
const CONSTANT_NAME = /^[A-Z][A-Z0-9]*_[A-Z0-9_]+$/;

/** Profondeur maximale d'un gabarit qui cite une constante qui en cite une… */
const MAX_DEPTH = 4;

/**
 * Les constantes employées par un extrait, dans l'ordre d'apparition, sans
 * doublon — celles des chaînes et des commentaires ne comptent pas, ni une
 * PROPRIÉTÉ (`Number.POSITIVE_INFINITY`) : elle n'est définie par aucun
 * fichier de la leçon.
 */
export function constantNames(code: string): string[] {
  const tokens = highlight(code);
  // Le morceau qui précède : `at(-1)` rendrait le DERNIER, d'où la borne.
  const before = (index: number): string =>
    index > 0 ? (tokens.at(index - 1)?.text ?? "") : "";
  const names = tokens
    .filter(
      (token, index) =>
        token.kind === "type" &&
        CONSTANT_NAME.test(token.text) &&
        !before(index).endsWith("."),
    )
    .map((token) => token.text);
  return [...new Set(names)];
}

/** L'expression qui définit `name` dans `source`, ou `null`. */
function definition(source: string, name: string): string | null {
  const match = new RegExp(
    `^\\s*(?:export\\s+)?const\\s+${name}\\b[^=\\n]*=\\s*([^;\\n]+);`,
    "m",
  ).exec(source);
  const expression = match?.at(1);
  return expression === undefined ? null : expression.trim();
}

/** La valeur littérale d'une expression, ou `null` si elle n'en est pas une. */
function literal(
  expression: string,
  resolve: (name: string) => string | null,
): string | null {
  if (/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|-?\d[\d_.]*)$/.test(expression)) {
    return expression;
  }
  // Un tableau de littéraux, sur une ligne : chaque élément doit en être un.
  // Une virgule DANS une chaîne coupe l'élément en deux morceaux qui n'en
  // sont plus : le tableau n'a alors pas de valeur, jamais une fausse.
  const items = /^\[(.*)\]$/.exec(expression)?.[1];
  if (items !== undefined) {
    const parts = items
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part !== "");
    const values = parts.map((part) => literal(part, resolve));
    return values.every((value) => value !== null)
      ? `[${values.join(", ")}]`
      : null;
  }
  const template = /^`([^`]*)`$/.exec(expression)?.[1];
  if (template === undefined) return null;
  // Chaque constante du gabarit, résolue d'abord : une seule manque, et le
  // gabarit n'a pas de valeur.
  const values = new Map<string, string>();
  for (const [, inner = ""] of template.matchAll(/\$\{(\w+)\}/g)) {
    const value = resolve(inner);
    if (value === null) return null;
    // Une chaîne s'insère sans ses guillemets ; un nombre tel quel.
    values.set(inner, /^["']/.test(value) ? value.slice(1, -1) : value);
  }
  return JSON.stringify(
    template.replace(
      /\$\{(\w+)\}/g,
      (_whole, inner: string) => values.get(inner) ?? "",
    ),
  );
}

/**
 * Résout chaque constante d'un extrait dans les sources cités.
 *
 * @param code - l'extrait affiché
 * @param sources - le texte des fichiers cités, par chemin
 * @returns les constantes résolues ; une constante introuvable est absente
 */
export function resolveConstants(
  code: string,
  sources: Readonly<Record<string, string>>,
): ILessonConstant[] {
  const lookup = (name: string, depth: number): ILessonConstant | null => {
    if (depth > MAX_DEPTH) return null;
    for (const [file, source] of Object.entries(sources)) {
      const expression = definition(source, name);
      if (expression === null) continue;
      const value = literal(
        expression,
        (inner) => lookup(inner, depth + 1)?.value ?? null,
      );
      return value === null ? null : { name, value, file };
    }
    return null;
  };
  return constantNames(code)
    .map((name) => lookup(name, 0))
    .filter((constant): constant is ILessonConstant => constant !== null);
}
