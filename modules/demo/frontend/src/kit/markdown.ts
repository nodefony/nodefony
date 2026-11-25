/**
 * Un Markdown réduit, lu À L'IDENTIQUE par chaque page : gras, italique,
 * code, bloc de code, lien, liste, citation — et les gestes de l'éditeur qui
 * l'écrivent.
 *
 * Guide pour un agent : brique du KIT, partagée par les démos. Le texte
 * voyage BRUT (le serveur ne le transforme pas) ; chaque page l'analyse avec
 * ces fonctions pures, puis le rend en éléments React (`MarkdownText.tsx`) —
 * jamais en HTML injecté. Un lien ne s'ouvre que vers `http:` ou `https:` :
 * `javascript:` reste du texte. L'appelant borne le texte (le salon : 64 Kio,
 * `MESSAGE_MAX_BYTES`), donc l'analyse aussi. L'éditeur
 * (`MarkdownEditor.tsx`) n'écrit qu'avec les fonctions de `chat-format`.
 */

/** Un morceau de ligne. */
export type MdInline =
  | string
  | { type: "strong" | "em"; children: MdInline[] }
  | { type: "code"; value: string }
  | { type: "link"; href: string; children: MdInline[] }
  | { type: "br" }
  | { type: "mention"; name: string }
  | { type: "color"; value: string }
  | { type: "date"; iso: string; hasTime: boolean }
  | { type: "math"; tex: string };

/** Un bloc du message. */
export type MdBlock =
  | { type: "p" | "quote"; children: MdInline[] }
  | { type: "pre"; value: string }
  | { type: "ul" | "ol"; items: MdInline[][] };

/** Vrai pour les seuls liens permis : `http:` ou `https:`, sans espace. */
function isSafeUrl(href: string): boolean {
  return /^https?:\/\/[^\s<>"]+$/i.test(href);
}

/** Une puce, ou un numéro de liste. */
const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBER = /^\s*\d{1,9}[.)]\s+(.*)$/;

/** Caractères qu'une barre oblique inverse rend littéraux. */
const ESCAPABLE = "\\`*_[]()>#+-.!~$";

/** Une formule en ligne tient en 200 caractères au plus. */
export const INLINE_MATH_MAX = 200;

/** `@nom` : lettres, chiffres, `_`, puis aussi `.` et `-` à l'intérieur. */
const MENTION = /@[\p{L}\p{N}_][\p{L}\p{N}_.-]{0,63}/uy;

/** `#rgb` ou `#rrggbb`, qui ne se prolonge pas en mot. */
const COLOR = /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![\p{L}\p{N}_])/uy;

/** Une date ISO 8601, complète (`2026-11-13`) ou avec heure (`…T14:30[:05][Z|+01:00]`). */
const ISO_DATE =
  /(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:?\d{2})?)?(?![\p{L}\p{N}_])/uy;

/** Vrai si la date existe vraiment (31 février, 25 h : refusés). */
function isRealDate(match: RegExpExecArray): boolean {
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return false;
  if (day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return false;
  const hour = match.at(4);
  if (hour === undefined) return true;
  return (
    Number(hour) < 24 &&
    Number(match.at(5)) < 60 &&
    Number(match.at(6) ?? 0) < 60
  );
}

/** Une date ISO 8601 qui existe vraiment, lue à la position `at`, ou `null`. */
function matchIsoDate(
  src: string,
  at: number,
): { iso: string; hasTime: boolean } | null {
  ISO_DATE.lastIndex = at;
  const match = ISO_DATE.exec(src);
  if (match === null || !isRealDate(match)) return null;
  return { iso: match[0], hasTime: match.at(4) !== undefined };
}

/**
 * `www.` suivi d'un domaine : segments de lettres, chiffres, `_` et `-`
 * séparés par des points (GFM, « extended www autolink »). Sensible à la
 * casse, comme la norme.
 */
const WWW_DOMAIN = /www\.[\p{L}\p{N}_-]+(?:\.[\p{L}\p{N}_-]+)*/uy;

/**
 * La fin d'une adresse nue commencée en `from` : jusqu'au premier blanc,
 * `<`, `>` ou `"`, sans la ponctuation finale, qui appartient à la phrase.
 * Une seule règle pour `https://…` et `www.…`.
 */
function bareLinkEnd(src: string, from: number): number {
  let end = from;
  while (end < src.length && !/[\s<>"]/.test(src[end] ?? " ")) end += 1;
  while (end > from && ".,;:!?)".includes(src[end - 1] ?? "")) end -= 1;
  return end;
}

/**
 * Un lien est-il une adresse NUE, écrite telle quelle (`https://…`, ou
 * `www.…` dont la norme a complété le schéma) plutôt qu'un `[texte](…)` ? La
 * page la rend en pastille de domaine.
 */
export function isBareLink(link: {
  href: string;
  children: readonly MdInline[];
}): boolean {
  const [only] = link.children;
  return (
    link.children.length === 1 &&
    typeof only === "string" &&
    (only === link.href || `http://${only}` === link.href)
  );
}

/**
 * Une adresse `www.…` lue à la position `at`, telle qu'écrite, ou `null` : le
 * domaine ne porte pas de `_` dans ses deux derniers segments (GFM).
 */
function matchWwwLink(src: string, at: number): string | null {
  WWW_DOMAIN.lastIndex = at;
  const domain = WWW_DOMAIN.exec(src);
  if (domain === null) return null;
  const lastTwo = domain[0].split(".").slice(-2);
  if (lastTwo.some((part) => part.includes("_"))) return null;
  const shown = src.slice(at, bareLinkEnd(src, at));
  return isSafeUrl(`http://${shown}`) ? shown : null;
}

/** Une lettre ou un chiffre : `_` collé à un mot (snake_case) reste du texte. */
function isWordChar(char: string | undefined): boolean {
  return char !== undefined && /[\p{L}\p{N}]/u.test(char);
}

// #region chat-markdown
/**
 * Les morceaux d'une ligne : `**gras**`, `*italique*` ou `_italique_`,
 * `` `code` ``, `[texte](https://…)`, les adresses nues `https://…` et `www.…`, et les natures en ligne :
 * `@nom`, couleur `#rgb`/`#rrggbb`, date ISO 8601, formule `$tex$`.
 * Un marqueur sans fermeture reste du texte.
 *
 * @param inLink - déjà dans un lien : pas de lien imbriqué
 */
export function parseInline(src: string, inLink = false): MdInline[] {
  const out: MdInline[] = [];
  let text = "";
  const flush = () => {
    if (text !== "") out.push(text);
    text = "";
  };
  let i = 0;
  while (i < src.length) {
    const char = src[i] ?? "";
    const next = src.charAt(i + 1);
    if (char === "\\" && next !== "" && ESCAPABLE.includes(next)) {
      text += next;
      i += 2;
      continue;
    }
    if (char === "`") {
      const close = src.indexOf("`", i + 1);
      if (close > i + 1) {
        flush();
        out.push({ type: "code", value: src.slice(i + 1, close) });
        i = close + 1;
        continue;
      }
    }
    if (char === "*" && next === "*") {
      const close = src.indexOf("**", i + 2);
      const inner = src.slice(i + 2, close);
      if (close > i + 2 && inner.trim() === inner) {
        flush();
        out.push({ type: "strong", children: parseInline(inner, inLink) });
        i = close + 2;
        continue;
      }
    }
    if (
      (char === "*" || char === "_") &&
      !(char === "_" && isWordChar(src[i - 1]))
    ) {
      let close = src.indexOf(char, i + 1);
      // `_` fermant collé à un mot : pas une fermeture.
      if (char === "_")
        while (close > 0 && isWordChar(src[close + 1]))
          close = src.indexOf(char, close + 1);
      const inner = src.slice(i + 1, close);
      if (close > i + 1 && inner.trim() === inner) {
        flush();
        out.push({ type: "em", children: parseInline(inner, inLink) });
        i = close + 1;
        continue;
      }
    }
    if (char === "[" && !inLink) {
      const middle = src.indexOf("](", i + 1);
      const close = middle < 0 ? -1 : src.indexOf(")", middle + 2);
      const href = close < 0 ? "" : src.slice(middle + 2, close);
      if (close > 0 && middle > i + 1 && isSafeUrl(href)) {
        flush();
        out.push({
          type: "link",
          href,
          children: parseInline(src.slice(i + 1, middle), true),
        });
        i = close + 1;
        continue;
      }
    }
    if (
      !inLink &&
      (char === "h" || char === "H") &&
      !isWordChar(src[i - 1]) &&
      /^https?:\/\//i.test(src.slice(i, i + 8))
    ) {
      const end = bareLinkEnd(src, i);
      const href = src.slice(i, end);
      if (isSafeUrl(href)) {
        flush();
        out.push({ type: "link", href, children: [href] });
        i = end;
        continue;
      }
    }
    // `www.exemple.fr` sans schéma : la norme GFM y pose `http://`.
    if (char === "w" && !inLink && !isWordChar(src[i - 1])) {
      const shown = matchWwwLink(src, i);
      if (shown !== null) {
        flush();
        out.push({ type: "link", href: `http://${shown}`, children: [shown] });
        i += shown.length;
        continue;
      }
    }
    if (!inLink && !isWordChar(src[i - 1])) {
      if (char === "@") {
        MENTION.lastIndex = i;
        const match = MENTION.exec(src);
        if (match !== null) {
          const name = match[0].replace(/[.-]+$/, "").slice(1);
          flush();
          out.push({ type: "mention", name });
          i += name.length + 1;
          continue;
        }
      } else if (char === "#") {
        COLOR.lastIndex = i;
        const match = COLOR.exec(src);
        if (match !== null) {
          flush();
          out.push({ type: "color", value: match[0] });
          i += match[0].length;
          continue;
        }
      } else if (char >= "0" && char <= "9") {
        const date = matchIsoDate(src, i);
        if (date !== null) {
          flush();
          out.push({ type: "date", iso: date.iso, hasTime: date.hasTime });
          i += date.iso.length;
          continue;
        }
      }
    }
    if (char === "$" && !inLink && next !== "$") {
      const close = src.indexOf("$", i + 1);
      const inner = close < 0 ? "" : src.slice(i + 1, close);
      if (
        inner !== "" &&
        inner.length <= INLINE_MATH_MAX &&
        inner.trim() === inner &&
        !/\d/.test(src.charAt(close + 1)) &&
        !/https?:\/\//i.test(inner)
      ) {
        flush();
        out.push({ type: "math", tex: inner });
        i = close + 1;
        continue;
      }
    }
    text += char;
    i += 1;
  }
  flush();
  return out;
}

/** Le saut de ligne d'un paragraphe. */
const BR: MdInline = { type: "br" };

/** Des lignes, en un seul paragraphe : un saut de ligne reste un saut. */
function joinLines(lines: readonly string[]): MdInline[] {
  return lines.flatMap((line, index) =>
    index === 0 ? parseInline(line) : [BR, ...parseInline(line)],
  );
}

/**
 * Les blocs d'un message : paragraphes (séparés par une ligne vide), bloc de
 * code entre ```, liste à puces ou numérotée, citation `>`.
 */
export function parseMarkdown(src: string): MdBlock[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MdBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.trim() === "") {
      i += 1;
      continue;
    }
    if (line.trimStart().startsWith("```")) {
      const body: string[] = [];
      i += 1;
      while (
        i < lines.length &&
        !(lines[i] ?? "").trimStart().startsWith("```")
      ) {
        body.push(lines[i] ?? "");
        i += 1;
      }
      i += 1; // la clôture (absente en fin de message : le bloc va jusqu'au bout)
      blocks.push({ type: "pre", value: body.join("\n") });
      continue;
    }
    if (/^\s*>/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i] ?? "")) {
        body.push((lines[i] ?? "").replace(/^\s*>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", children: joinLines(body) });
      continue;
    }
    const list = BULLET.test(line) ? BULLET : NUMBER.test(line) ? NUMBER : null;
    if (list !== null) {
      const items: MdInline[][] = [];
      let match = list.exec(lines[i] ?? "");
      while (match !== null) {
        items.push(parseInline(match.at(1) ?? ""));
        i += 1;
        match = i < lines.length ? list.exec(lines[i] ?? "") : null;
      }
      blocks.push({ type: list === BULLET ? "ul" : "ol", items });
      continue;
    }
    const body: string[] = [];
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() !== "" &&
      !/^\s*(```|>)/.test(lines[i] ?? "") &&
      !BULLET.test(lines[i] ?? "") &&
      !NUMBER.test(lines[i] ?? "")
    ) {
      body.push(lines[i] ?? "");
      i += 1;
    }
    blocks.push({ type: "p", children: joinLines(body) });
  }
  return blocks;
}
// #endregion

/** Les adresses des liens d'un morceau de ligne, dans l'ordre (un lien n'en contient pas d'autre). */
function linksOfInline(nodes: readonly MdInline[], into: string[]): void {
  for (const node of nodes) {
    if (typeof node === "string") continue;
    if (node.type === "link") into.push(node.href);
    else if (node.type === "strong" || node.type === "em")
      linksOfInline(node.children, into);
  }
}

/**
 * Les adresses des liens de ces blocs, dans l'ordre où la page les rend : le
 * rang d'un lien (`type: "link"`) est son indice d'aperçu.
 */
export function collectLinks(blocks: readonly MdBlock[]): string[] {
  const links: string[] = [];
  for (const block of blocks) {
    if (block.type === "p" || block.type === "quote")
      linksOfInline(block.children, links);
    else if (block.type === "ul" || block.type === "ol")
      for (const item of block.items) linksOfInline(item, links);
  }
  return links;
}

// #region chat-format
/**
 * Pose un marqueur autour de la sélection — ou l'ÔTE s'il y est déjà, comme
 * le bouton « G » d'un traitement de texte.
 *
 * @returns le nouveau texte et la sélection à reposer (le même texte, marqué)
 */
export function toggleMark(
  value: string,
  start: number,
  end: number,
  mark: string,
): { value: string; start: number; end: number } {
  const before = value.slice(0, start);
  const after = value.slice(end);
  if (before.endsWith(mark) && after.startsWith(mark)) {
    return {
      value:
        before.slice(0, -mark.length) +
        value.slice(start, end) +
        after.slice(mark.length),
      start: start - mark.length,
      end: end - mark.length,
    };
  }
  return {
    value: `${before}${mark}${value.slice(start, end)}${mark}${after}`,
    start: start + mark.length,
    end: end + mark.length,
  };
}

/**
 * Un marqueur en ligne autour d'une sélection d'une ligne ; un bloc clôturé
 * (`fence` sur sa propre ligne, avant et après) si elle en tient plusieurs.
 */
function fencedMark(
  value: string,
  start: number,
  end: number,
  inline: string,
  fence: string,
): { value: string; start: number; end: number } {
  const selected = value.slice(start, end);
  if (!selected.includes("\n")) return toggleMark(value, start, end, inline);
  const open =
    start === 0 || value[start - 1] === "\n" ? `${fence}\n` : `\n${fence}\n`;
  return {
    value: `${value.slice(0, start)}${open}${selected}\n${fence}${value.slice(end)}`,
    start: start + open.length,
    end: end + open.length,
  };
}

/**
 * Du code : un bloc ``` si la sélection tient sur plusieurs lignes, sinon des
 * accents graves autour.
 */
export function codeMark(
  value: string,
  start: number,
  end: number,
): { value: string; start: number; end: number } {
  return fencedMark(value, start, end, "`", "```");
}

/**
 * Une formule : un bloc `$$` si la sélection tient sur plusieurs lignes,
 * sinon `$…$` autour — les deux formes que le salon rend par KaTeX.
 */
export function mathMark(
  value: string,
  start: number,
  end: number,
): { value: string; start: number; end: number } {
  return fencedMark(value, start, end, "$", "$$");
}

/**
 * Un lien : `[sélection](https://)`, l'adresse sélectionnée pour être tapée
 * aussitôt. Une sélection qui EST une adresse devient la cible.
 */
export function linkMark(
  value: string,
  start: number,
  end: number,
): { value: string; start: number; end: number } {
  const selected = value.slice(start, end);
  const isUrl = isSafeUrl(selected);
  const label = isUrl ? "lien" : selected || "lien";
  const href = isUrl ? selected : "https://";
  const inserted = `[${label}](${href})`;
  const hrefAt = start + label.length + 3;
  return {
    value: value.slice(0, start) + inserted + value.slice(end),
    start: isUrl ? start + 1 : hrefAt,
    end: isUrl ? start + 1 + label.length : hrefAt + href.length,
  };
}
// #endregion

/** Un caractère d'un nom mentionné — celui que `MENTION` accepte après `@`. */
const MENTION_CHAR = /[\p{L}\p{N}_.-]/u;

/** Une mention en cours de frappe : où commence `@`, où finit le nom, ce qui est tapé. */
export interface IMentionAt {
  /** Rang du `@`. */
  start: number;
  /** Fin du nom sous le curseur (le nom peut se poursuivre après lui). */
  end: number;
  /** Ce qui est tapé entre `@` et le curseur. */
  query: string;
}

/**
 * La mention que le curseur est en train d'écrire, ou `null` : un `@` en
 * début de mot (la même condition que l'analyse, `parseInline`), suivi de
 * caractères de nom jusqu'au curseur. `a@b` n'en est pas une — une adresse.
 *
 * @param caret - position du curseur (sélection vide)
 */
export function mentionAt(value: string, caret: number): IMentionAt | null {
  let at = caret;
  while (at > 0 && MENTION_CHAR.test(value.charAt(at - 1))) at -= 1;
  const start = at - 1;
  if (start < 0 || value[start] !== "@" || isWordChar(value[start - 1]))
    return null;
  const query = value.slice(at, caret);
  // Le premier caractère d'un nom n'est ni `.` ni `-` (`MENTION`).
  if (query.length > 64 || /^[.-]/.test(query)) return null;
  let end = caret;
  while (end < value.length && MENTION_CHAR.test(value.charAt(end))) end += 1;
  return { start, end, query };
}

/** Un nom sans accents ni majuscules, pour comparer ce qui est tapé. */
function foldName(name: string): string {
  return name.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/**
 * Les noms qui COMMENCENT par ce qui est tapé — accents et majuscules
 * ignorés, l'ordre reçu gardé (celui du panneau des présents), sans doublon.
 *
 * @param limit - au plus ce nombre de noms
 */
export function suggestMentions(
  names: readonly string[],
  query: string,
  limit: number,
): string[] {
  const typed = foldName(query);
  const out: string[] = [];
  for (const name of names) {
    if (out.length === limit) break;
    if (foldName(name).startsWith(typed) && !out.includes(name)) out.push(name);
  }
  return out;
}

/** Le texte qu'insère une mention : `@nom` suivi d'une espace — panneau et suggestions. */
export function mentionOf(name: string): string {
  return `@${name} `;
}

/**
 * Remplace la mention en cours par le nom choisi, curseur après l'espace —
 * sans doubler l'espace qui suivait déjà.
 */
export function applyMention(
  value: string,
  at: IMentionAt,
  name: string,
): { value: string; start: number; end: number } {
  const spaced = value.charAt(at.end) === " ";
  const text = spaced ? mentionOf(name).trimEnd() : mentionOf(name);
  const caret = at.start + text.length + (spaced ? 1 : 0);
  return {
    value: value.slice(0, at.start) + text + value.slice(at.end),
    start: caret,
    end: caret,
  };
}

/** Une ligne de liste : son retrait, sa puce ou son numéro, son texte. */
const LIST_ITEM = /^(\s*)(?:([-*+])|(\d{1,9})([.)]))\s+(.*)$/;

/**
 * Pose (ou ÔTE, si toutes l'ont déjà) une puce, un numéro ou un `>` en tête
 * de chaque ligne touchée par la sélection — les boutons « liste » et
 * « citation ». Une liste numérotée se compte de 1 en 1.
 *
 * @returns le texte, et les lignes touchées sélectionnées
 */
export function prefixLines(
  value: string,
  start: number,
  end: number,
  prefix: "- " | "1. " | "> ",
): { value: string; start: number; end: number } {
  const from = value.lastIndexOf("\n", start - 1) + 1;
  const stop = value.indexOf("\n", end);
  const to = stop < 0 ? value.length : stop;
  const lines = value.slice(from, to).split("\n");
  const marker =
    prefix === "1. " ? /^\d{1,9}\. / : prefix === "- " ? /^- / : /^> ?/;
  const remove = lines.every((line) => marker.test(line));
  const next = lines
    .map((line, index) => {
      if (remove) return line.replace(marker, "");
      return `${prefix === "1. " ? `${index + 1}. ` : prefix}${line}`;
    })
    .join("\n");
  return {
    value: value.slice(0, from) + next + value.slice(to),
    start: from,
    end: from + next.length,
  };
}

/**
 * Entrée sur une ligne de liste : ouvre l'élément suivant (même retrait,
 * même puce, numéro suivant) ; sur un élément VIDE, retire sa puce et sort
 * de la liste. Hors d'une liste, `null` : Entrée garde son sens ordinaire.
 *
 * @param caret - le curseur (sans sélection)
 */
export function continueList(
  value: string,
  caret: number,
): { value: string; start: number; end: number } | null {
  const from = value.lastIndexOf("\n", caret - 1) + 1;
  const stop = value.indexOf("\n", caret);
  const to = stop < 0 ? value.length : stop;
  const match = LIST_ITEM.exec(value.slice(from, to));
  if (match === null) return null;
  const indent = match.at(1) ?? "";
  const bullet = match.at(2);
  const number = match.at(3);
  const text = match.at(5) ?? "";
  if (text.trim() === "") {
    // Élément vide : on sort de la liste, la ligne reste vide.
    return {
      value: value.slice(0, from) + value.slice(to),
      start: from,
      end: from,
    };
  }
  const marker =
    bullet !== undefined
      ? `${bullet} `
      : `${Number(number ?? "0") + 1}${match.at(4) ?? "."} `;
  const inserted = `\n${indent}${marker}`;
  const at = caret + inserted.length;
  return {
    value: value.slice(0, caret) + inserted + value.slice(caret),
    start: at,
    end: at,
  };
}
