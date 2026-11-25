/**
 * La NATURE de chaque bloc d'un message — code, JSON, tableau, diff, formule
 * ou texte Markdown — reconnue par une règle PURE, la même dans la page et
 * dans les tests.
 *
 * Guide pour un agent : brique du KIT, partagée par les démos. Le texte
 * voyage BRUT : ni le serveur ni la base ne connaissent la nature, donc une
 * règle améliorée s'applique aussi aux anciens messages. Ordre de
 * reconnaissance : bloc ```langue explicite → JSON valide → CSV (`,` `;` ou
 * tabulation, au moins deux lignes de même largeur) → diff (`@@`, `+`, `-`)
 * → texte Markdown (`markdown.ts`). Tout est BORNÉ et linéaire : l'appelant
 * borne le texte (le salon : 64 Kio, `MESSAGE_MAX_BYTES`), et chaque nature
 * a sa borne ci-dessous. Aucun caractère du message n'est perdu : chaque bloc
 * garde sa `source`, tranche du texte, dans l'ordre.
 */

/** Un objet JSON s'affiche déplié jusqu'à ce niveau, replié au-delà. */
export const JSON_OPEN_DEPTH = 2;

/** Au-delà de ce niveau, un JSON s'affiche « … » (il reste copiable entier). */
export const JSON_MAX_DEPTH = 8;

/** Un tableau montre au plus deux cents lignes ; le reste est annoncé. */
export const CSV_MAX_ROWS = 200;

/**
 * La langue d'un bloc de code sans étiquette se devine sur ses 4 premiers
 * Kio (4 × 1024 octets) : deviner sur 64 Kio coûterait des dizaines de
 * millisecondes, pour la même réponse.
 */
export const GUESS_LANGUAGE_BYTES = 4096;

/** Un bloc d'un message, selon sa nature. */
export type NatureBlock =
  | { nature: "text"; source: string }
  | { nature: "code"; source: string; language: string | null }
  | { nature: "json"; source: string; value: unknown }
  | {
      nature: "csv";
      source: string;
      separator: "," | ";" | "\t";
      header: string[];
      /** Au plus `CSV_MAX_ROWS` lignes… */
      rows: string[][];
      /** …sur ce nombre total. */
      total: number;
    }
  | { nature: "diff"; source: string }
  | { nature: "math"; source: string; tex: string };

/** Le séparateur de colonnes d'un tableau, dans l'ordre d'essai. */
const SEPARATORS = ["\t", ";", ","] as const;

/**
 * Lignes ET colonnes qu'exige un tableau à VIRGULE : la prose en porte
 * (« Bonjour, ça va » / « Oui, merci » ferait deux lignes de deux colonnes).
 * Tabulation et point-virgule, rares dans une phrase, se contentent de deux.
 */
export const COMMA_TABLE_MIN = 3;

/** L'étiquette d'un bloc de code : un mot court, sinon aucune langue. */
const LANGUAGE_LABEL = /^[\w+#.-]{1,20}$/;

/** Une ligne du texte : ses bornes, sans la fin de ligne. */
interface ILine {
  start: number;
  end: number;
}

/** Les lignes du texte, bornées par `\n` — un seul passage. */
function splitLines(text: string): ILine[] {
  const lines: ILine[] = [];
  let start = 0;
  while (start <= text.length) {
    const stop = text.indexOf("\n", start);
    const end = stop < 0 ? text.length : stop;
    lines.push({ start, end });
    if (stop < 0) break;
    start = stop + 1;
  }
  return lines;
}

/** Un JSON qui est un objet ou une liste (jamais un nombre ou un mot seul). */
function parseJsonContainer(source: string): { value: unknown } | null {
  const first = source.trimStart().charAt(0);
  if (first !== "{" && first !== "[") return null;
  try {
    const value: unknown = JSON.parse(source);
    return { value };
  } catch {
    return null;
  }
}

/**
 * Un tableau : au moins deux lignes de même largeur (≥ 2 colonnes) ; à la
 * virgule, `COMMA_TABLE_MIN` lignes et colonnes.
 */
function parseTable(
  source: string,
): Extract<NatureBlock, { nature: "csv" }> | null {
  const lines = source.split("\n");
  if (lines.length < 2) return null;
  for (const separator of SEPARATORS) {
    const width = (lines.at(0) ?? "")
      .replace(/\r$/, "")
      .split(separator).length;
    const least = separator === "," ? COMMA_TABLE_MIN : 2;
    if (width < least || lines.length < least) continue;
    const table: string[][] = [];
    let regular = true;
    for (const line of lines) {
      const cells = line.replace(/\r$/, "").split(separator);
      if (cells.length !== width) {
        regular = false;
        break;
      }
      table.push(cells.map((cell) => cell.trim()));
    }
    if (!regular) continue;
    return {
      nature: "csv",
      source,
      separator,
      header: table[0] ?? [],
      rows: table.slice(1, CSV_MAX_ROWS + 1),
      total: table.length - 1,
    };
  }
  return null;
}

/** Un diff : un en-tête (`@@`, ou `---` puis `+++`) et au moins une ligne `+` ou `-`. */
function isDiff(source: string): boolean {
  const lines = source.split("\n");
  let header = false;
  let change = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines.at(i) ?? "";
    if (line.startsWith("@@")) header = true;
    else if (
      line.startsWith("--- ") &&
      (lines.at(i + 1) ?? "").startsWith("+++ ")
    )
      header = true;
    else if (
      (line.startsWith("+") && !line.startsWith("+++")) ||
      (line.startsWith("-") && !line.startsWith("---"))
    )
      change = true;
  }
  return header && change;
}

// #region chat-detect
/** La nature d'un texte entier : JSON, tableau, diff, sinon `fallback`. */
function analyze(source: string, fallback: NatureBlock): NatureBlock {
  const json = parseJsonContainer(source);
  if (json !== null) return { nature: "json", source, value: json.value };
  const table = parseTable(source);
  if (table !== null) return table;
  if (isDiff(source)) return { nature: "diff", source };
  return fallback;
}
// #endregion

/**
 * Les blocs d'un message, chacun avec sa nature. Un bloc ```langue donne du
 * code (sa `source` est son CORPS) ; sans étiquette, le corps est d'abord
 * analysé comme un texte (JSON, tableau, diff) avant de n'être que du code.
 * `$$` seul sur sa ligne ouvre une formule, fermée par un `$$` seul (ou
 * `$$ formule $$` sur une ligne). Le texte restant, entre deux de ces blocs,
 * est analysé EN ENTIER : JSON, tableau, diff, sinon texte.
 *
 * @param text - le texte brut, déjà borné par l'appelant
 * @returns les blocs, dans l'ordre du texte ; aucun pour un texte vide
 */
export function detectBlocks(text: string): NatureBlock[] {
  if (text.trim() === "") return [];
  const lines = splitLines(text);
  const blocks: NatureBlock[] = [];
  // Le texte entre deux blocs, par paragraphes (séparés par une ligne vide) :
  // un JSON, un tableau ou un diff suivi de prose se reconnaît quand même.
  const paragraphs: ILine[] = [];
  let runStart = -1;
  let runEnd = -1;
  const closeParagraph = () => {
    if (runStart >= 0) paragraphs.push({ start: runStart, end: runEnd });
    runStart = -1;
  };
  /** Début du texte qui suit le dernier bloc balisé (clôture, formule). */
  let cursor = 0;
  /**
   * Rend les blocs du texte courant, `source` CONTIGUËS : un bloc garde les
   * lignes vides qui le suivent, le premier celles qui le précèdent — sans
   * clôture ni `$$`, les sources recollées redonnent le message exact.
   *
   * @param boundary - où s'arrête ce texte (la balise suivante, ou la fin)
   */
  const flushRun = (boundary: number) => {
    closeParagraph();
    const run: { block: NatureBlock; from: number }[] = [];
    let textFrom = -1;
    const flushText = () => {
      if (textFrom >= 0)
        run.push({
          block: { nature: "text", source: "" },
          from: textFrom,
        });
      textFrom = -1;
    };
    for (const paragraph of paragraphs) {
      const source = text.slice(paragraph.start, paragraph.end);
      const block = analyze(source, { nature: "text", source });
      if (block.nature === "text") {
        // Les paragraphes de texte voisins restent UN bloc.
        if (textFrom < 0) textFrom = paragraph.start;
      } else {
        flushText();
        run.push({ block, from: paragraph.start });
      }
    }
    flushText();
    paragraphs.length = 0;
    for (const [index, item] of run.entries()) {
      const from = index === 0 ? cursor : item.from;
      item.block.source = text.slice(from, run[index + 1]?.from ?? boundary);
      blocks.push(item.block);
    }
  };
  /** Le texte de la ligne `index`. */
  const lineText = (index: number): string => {
    const line = lines.at(index);
    return line === undefined ? "" : text.slice(line.start, line.end);
  };
  let i = 0;
  while (i < lines.length) {
    const line = lines.at(i);
    if (line === undefined) break;
    const raw = lineText(i);
    const trimmed = raw.trim();
    if (trimmed.startsWith("```")) {
      flushRun(line.start);
      const label = trimmed.slice(3).trim();
      let j = i + 1;
      while (j < lines.length && !lineText(j).trimStart().startsWith("```"))
        j += 1;
      const first = lines.at(i + 1);
      const last = lines.at(j - 1);
      const body =
        j - 1 >= i + 1 && first !== undefined && last !== undefined
          ? text.slice(first.start, last.end)
          : "";
      const language = LANGUAGE_LABEL.test(label) ? label.toLowerCase() : null;
      blocks.push(
        label !== ""
          ? { nature: "code", source: body, language }
          : analyze(body, { nature: "code", source: body, language: null }),
      );
      i = j + 1;
      cursor = lines.at(i)?.start ?? text.length;
      continue;
    }
    if (
      trimmed.length > 4 &&
      trimmed.startsWith("$$") &&
      trimmed.endsWith("$$")
    ) {
      flushRun(line.start);
      blocks.push({
        nature: "math",
        source: raw,
        tex: trimmed.slice(2, -2).trim(),
      });
      i += 1;
      cursor = lines.at(i)?.start ?? text.length;
      continue;
    }
    if (trimmed === "$$") {
      let j = i + 1;
      while (j < lines.length && lineText(j).trim() !== "$$") j += 1;
      if (j < lines.length) {
        flushRun(line.start);
        const first = lines.at(i + 1);
        const last = lines.at(j - 1);
        const tex =
          j - 1 >= i + 1 && first !== undefined && last !== undefined
            ? text.slice(first.start, last.end).trim()
            : "";
        blocks.push({
          nature: "math",
          source: text.slice(line.start, lines.at(j)?.end ?? text.length),
          tex,
        });
        i = j + 1;
        cursor = lines.at(i)?.start ?? text.length;
        continue;
      }
    }
    if (trimmed === "") closeParagraph();
    else {
      if (runStart < 0) runStart = line.start;
      runEnd = line.end;
    }
    i += 1;
  }
  flushRun(text.length);
  return blocks;
}
