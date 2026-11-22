import type { IProbeChunk } from "../kit/probe";

/**
 * Un flux SSE remis sur l'axe du TEMPS : quand la connexion s'ouvre, quand
 * chaque événement arrive, quand elle se coupe. C'est ce que la frise de la
 * page dessine.
 *
 * Guide pour un agent : pur, sans écran. L'entrée est ce que la sonde a noté
 * (`kit/probe.ts`) — `probeSse` (« ▶ ouvert », « progress #3 · … »,
 * « ↻ coupé », « ■ … ») ou le fil BRUT lu par `probeHttp` (`data:`, `id:`,
 * commentaires `:`).
 */

/** Ce qu'un repère de la frise représente. */
export type SseMarkKind = "event" | "comment" | "cut" | "close";

/** Un repère : un instant (ms depuis l'appel) et ce qui s'y est passé. */
export interface ISseMark {
  /** Rang dans la frise : unique, stable. */
  seq: number;
  at: number;
  kind: SseMarkKind;
  /** Court : le nom de l'événement et son `id`, ou ce qui s'est passé. */
  label: string;
}

/** Une connexion ouverte, de son ouverture à sa coupure (ou à maintenant). */
export interface ISseLink {
  start: number;
  end: number;
}

/** La frise : sa durée, ses connexions, ses repères. */
export interface ISseTimeline {
  span: number;
  links: ISseLink[];
  marks: ISseMark[];
}

/** Un bloc du fil brut : `event:`, `id:`, `data:`… ou un commentaire `:`. */
function rawMark(block: string, at: number): Omit<ISseMark, "seq"> | null {
  const lines = block.split("\n").filter((line) => line !== "");
  if (lines.length === 0) return null;
  if (lines.every((line) => line.startsWith(":"))) {
    return { at, kind: "comment", label: "battement" };
  }
  const field = (name: string) =>
    lines
      .find((line) => line.startsWith(`${name}:`))
      ?.slice(name.length + 1)
      .trim();
  if (field("data") === undefined) return null;
  const id = field("id");
  return {
    at,
    kind: "event",
    label: `${field("event") ?? "message"}${id === undefined ? "" : ` #${id}`}`,
  };
}

/** Le fil brut ressemble à du SSE : un champ en tête de ligne, ou un `:`. */
const RAW_FIELD = /^(?:data|event|id|retry):|^:/mu;

/**
 * Remet sur l'axe du temps ce que la sonde a noté.
 *
 * @param chunks - les morceaux notés, horodatés
 * @param ms - la durée de l'appel quand il est fini ; sinon le dernier
 *   instant noté sert de fin
 * @returns la frise ; vide (aucun repère) pour un corps qui n'est pas un flux
 */
export function readTimeline(
  chunks: readonly IProbeChunk[],
  ms: number | null = null,
): ISseTimeline {
  const marks: ISseMark[] = [];
  const push = (mark: Omit<ISseMark, "seq">) =>
    marks.push({ seq: marks.length, ...mark });
  const links: ISseLink[] = [];
  let open: number | null = null;
  let raw = false;
  for (const { at, text } of chunks) {
    if (text.startsWith("▶")) {
      open = at;
    } else if (text.startsWith("↻") || text.startsWith("■")) {
      if (open !== null) links.push({ start: open, end: at });
      open = null;
      push({
        at,
        kind: text.startsWith("↻") ? "cut" : "close",
        label: text.startsWith("↻") ? "coupé" : "fermé",
      });
    } else if (RAW_FIELD.test(text)) {
      raw = true;
      for (const block of text.replaceAll("\r\n", "\n").split("\n\n")) {
        const mark = rawMark(block, at);
        if (mark !== null) push(mark);
      }
    } else {
      const head = /^(\S+(?: #\S+)?) · /u.exec(text);
      if (head?.[1] !== undefined) {
        push({ at, kind: "event", label: head[1] });
      }
    }
  }
  const span = Math.max(ms ?? 0, chunks.at(-1)?.at ?? 0, 1);
  // Le fil brut n'a pas d'« ouvert » : la réponse EST la connexion.
  if (raw && links.length === 0 && open === null) open = 0;
  if (open !== null) links.push({ start: open, end: span });
  return { span, links, marks };
}
