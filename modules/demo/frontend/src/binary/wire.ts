import type { IProbeChunk } from "../kit/probe";

/**
 * Le fil, relu : les lignes que la sonde note pour chaque trame
 * (`probeRealtime`, `kit/probe.ts`) redeviennent des nombres — tailles,
 * débits, temps — que `BinaryVisuals.tsx` dessine.
 *
 * Guide pour un agent : pur, sans écran ni réseau, testé. Rien n'est calculé
 * à partir des charges : chaque nombre vient d'une trame qui a VRAIMENT
 * traversé le fil.
 */

/** Une trame telle que la sonde l'a vue. */
export interface IWireLine {
  /** Millisecondes depuis le début du geste. */
  at: number;
  /** Le compteur qui l'a vue (`cbor`, `texte`…). */
  label: string;
  dir: "in" | "out";
  bytes: number;
  binary: boolean;
  /** Temps que la socket a passé sur une trame reçue, décodage compris. */
  ms: number | null;
  head: string;
}

/** `cbor ← 568 o binaire 0.12 ms · a3 67 …` */
const FRAME = /^(\S+) (←|→) (\d+) o (binaire|texte)(?: ([\d.]+) ms)? · (.*)$/su;

/** `cbor ▶ offre : a, b`, ou `cbor ● déjà ouverte — offre : a, b` */
const OFFER = /^(\S+) (?:▶|● déjà ouverte —) offre : (.*)$/u;

/** `cbor ■ fermée 1009 …` */
const CLOSE = /^(\S+) ■ fermée (\d+)/u;

/** Les trames du relevé, dans l'ordre ; les autres lignes sont ignorées. */
export function readWire(chunks: readonly IProbeChunk[]): IWireLine[] {
  return chunks.flatMap((chunk): IWireLine[] => {
    const match = FRAME.exec(chunk.text);
    if (match === null) return [];
    // `.at()` : un groupe facultatif absent vaut `undefined`, ce que dit son type.
    const ms = match.at(5);
    const [, label = "", arrow, bytes = "0", kind] = match;
    const head = match.at(6) ?? "";
    return [
      {
        at: chunk.at,
        label,
        dir: arrow === "←" ? "in" : "out",
        bytes: Number(bytes),
        binary: kind === "binaire",
        ms: ms === undefined ? null : Number(ms),
        head,
      },
    ];
  });
}

/** Les sous-protocoles que chaque compteur a vu OFFRIR au handshake. */
export function readOffers(
  chunks: readonly IProbeChunk[],
): Partial<Record<string, string>> {
  const offers: Partial<Record<string, string>> = {};
  for (const chunk of chunks) {
    const match = OFFER.exec(chunk.text);
    const label = match?.at(1);
    if (label !== undefined) offers[label] = match?.at(2) ?? "";
  }
  return offers;
}

/** Le code de fermeture de chaque compteur, quand sa socket s'est fermée. */
export function readCloses(
  chunks: readonly IProbeChunk[],
): Partial<Record<string, number>> {
  const closes: Partial<Record<string, number>> = {};
  for (const chunk of chunks) {
    const match = CLOSE.exec(chunk.text);
    if (match?.[1] !== undefined) closes[match[1]] = Number(match[2]);
  }
  return closes;
}

/**
 * La RÉPONSE à chaque requête d'un compteur : la première trame reçue après
 * chaque trame envoyée. Juste sur une socket sans abonnement, où rien d'autre
 * n'arrive entre une requête et sa réponse.
 */
export function responses(
  lines: readonly IWireLine[],
  label: string,
): IWireLine[] {
  const found: IWireLine[] = [];
  let waiting = false;
  for (const line of lines) {
    if (line.label !== label) continue;
    if (line.dir === "out") waiting = true;
    else if (waiting) {
      found.push(line);
      waiting = false;
    }
  }
  return found;
}

/** Le compteur de la connexion qui a offert CBOR. */
export const WIRE_CBOR = "cbor";

/** Le compteur de la connexion restée en texte. */
export const WIRE_TEXT = "texte";

/** Une charge, et la trame de sa réponse sur chaque connexion. */
export interface ISizeRow {
  size: number;
  cbor: IWireLine | null;
  text: IWireLine | null;
}

/**
 * Les réponses des deux connexions, rangées par charge demandée : la
 * n-ième réponse est celle de la n-ième taille, demandées dans l'ordre.
 */
export function sizeRows(
  lines: readonly IWireLine[],
  sizes: readonly number[],
): ISizeRow[] {
  const cbor = responses(lines, WIRE_CBOR);
  const text = responses(lines, WIRE_TEXT);
  return sizes.map((size, index) => ({
    size,
    cbor: cbor[index] ?? null,
    text: text[index] ?? null,
  }));
}

/** La médiane, ou `null` sans valeur. */
export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = values.toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[middle] ?? null)
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

/** La taille médiane des trames REÇUES par un compteur — l'image type d'un flux. */
export function typicalFrame(
  lines: readonly IWireLine[],
  label: string,
): number | null {
  return median(
    lines
      .filter((line) => line.label === label && line.dir === "in")
      .map((line) => line.bytes),
  );
}

/** Un point du débit : octets reçus par seconde, sur la fenêtre finie à `at`. */
export interface IRatePoint {
  at: number;
  perSecond: number;
}

/**
 * Le débit REÇU d'un compteur, par fenêtres de `windowMs` : la somme des
 * octets des trames tombées dans chaque fenêtre, ramenée à la seconde.
 */
export function throughput(
  lines: readonly IWireLine[],
  label: string,
  windowMs = 500,
): IRatePoint[] {
  const received = lines.filter(
    (line) => line.label === label && line.dir === "in",
  );
  const first = received.at(0);
  const last = received.at(-1);
  if (first === undefined || last === undefined) return [];
  const points: IRatePoint[] = [];
  // Fenêtres [début, fin) : la première commence à la première trame, et
  // seules les fenêtres COMPLÈTES comptent — une dernière fenêtre coupée
  // ferait plonger la courbe sans que le débit ait baissé.
  for (let end = first.at + windowMs; end <= last.at; end += windowMs) {
    const bytes = received
      .filter((line) => line.at >= end - windowMs && line.at < end)
      .reduce((sum, line) => sum + line.bytes, 0);
    points.push({ at: end, perSecond: (bytes * 1000) / windowMs });
  }
  return points;
}

/** Une taille lisible : `512 o`, `4 Kio`, `1,5 Mio`. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  const mega = bytes >= 1024 * 1024;
  const value = mega ? bytes / (1024 * 1024) : bytes / 1024;
  const unit = mega ? "Mio" : "Kio";
  const shown = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${String(shown).replace(".", ",")} ${unit}`;
}
