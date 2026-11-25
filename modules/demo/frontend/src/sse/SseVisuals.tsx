import type { BuildEvents } from "./sseDemo";
import type { IProbeChunk } from "../kit/probe";
import { readTimeline, type SseMarkKind } from "./sseTimeline";

/**
 * Ce que le flux dit, en IMAGE : la frise du temps (connexions, événements,
 * battements, coupures), la barre d'une construction suivie par événements
 * nommés, et la réponse qui s'écrit mot à mot.
 *
 * Guide pour un agent : la frise lit ce que la sonde a noté
 * (`sseTimeline.ts`, pur) ; la barre et la réponse sont nourries par le code
 * CLIENT de la leçon (`sseClient.ts`) — ce qu'une vraie page en ferait.
 */

/** Le sens d'un repère, en mots, pour la légende et les lecteurs d'écran. */
const KIND_LABELS: Record<SseMarkKind, string> = {
  event: "événement",
  comment: "battement (commentaire)",
  cut: "coupure",
  close: "fermeture",
};

/** Les repères, dans l'ordre de la légende. */
const KINDS: readonly SseMarkKind[] = ["event", "comment", "cut", "close"];

/** Au-delà, les noms des événements encombrent la frise : points seuls. */
const LABELLED_MARKS = 8;

/** Une position, en % de la frise. */
function at(ms: number, span: number): string {
  return `${(ms / span) * 100}%`;
}

/**
 * Le nom d'un repère : un sur deux sous la frise ; aux bords, aligné vers
 * l'intérieur, pour ne jamais déborder de l'écran.
 */
function labelClass(ratio: number, index: number): string {
  const edge = ratio < 0.12 ? " is-start" : ratio > 0.88 ? " is-end" : "";
  return `sse-mark-label${index % 2 === 1 ? " is-low" : ""}${edge}`;
}

/**
 * La frise d'un flux : une bande par connexion ouverte, un repère par
 * événement, battement ou coupure, à l'instant où il est arrivé.
 *
 * @param chunks - ce que la sonde a noté (en direct, ou l'appel fini)
 * @param ms - la durée de l'appel fini ; `null` pendant qu'il court
 */
export function SseTimeline({
  chunks,
  ms,
}: {
  chunks: readonly IProbeChunk[];
  ms: number | null;
}) {
  const { span, links, marks } = readTimeline(chunks, ms);
  if (marks.length === 0 && links.length === 0) return null;
  const count = (kind: SseMarkKind) =>
    marks.filter((mark) => mark.kind === kind).length;
  const summary = [
    `${count("event")} événement(s)`,
    `${links.length} connexion(s)`,
    count("comment") > 0 ? `${count("comment")} battement(s)` : "",
    `${span} ms`,
  ]
    .filter((part) => part !== "")
    .join(" · ");
  const labelled = marks.length <= LABELLED_MARKS;
  return (
    <figure className="sse-timeline">
      <figcaption>
        <strong>Le flux dans le temps</strong> — {summary}
      </figcaption>
      <div className="sse-track" role="img" aria-label={summary}>
        {links.map((link) => (
          <span
            key={link.start}
            className="sse-link"
            style={{
              left: at(link.start, span),
              width: `max(2px, ${at(link.end - link.start, span)})`,
            }}
          />
        ))}
        {marks.map((mark, index) => (
          <span
            key={mark.seq}
            className={`sse-mark sse-${mark.kind}`}
            style={{ left: at(mark.at, span) }}
            title={`${mark.at} ms — ${mark.label}`}
          >
            {labelled && mark.kind === "event" && (
              <span className={labelClass(mark.at / span, index)}>
                {mark.label}
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="file-map-scale" aria-hidden="true">
        <span>0 ms</span>
        <span>{span} ms</span>
      </div>
      <ul className="file-map-legend">
        <li>
          <span className="file-map-chip sse-chip-link" />
          connexion ouverte
        </li>
        {KINDS.filter((kind) => count(kind) > 0).map((kind) => (
          <li key={kind}>
            <span className={`file-map-chip sse-chip-${kind}`} />
            {KIND_LABELS[kind]}
          </li>
        ))}
      </ul>
    </figure>
  );
}

/**
 * La construction suivie par ses événements `progress` : ce qu'une page
 * fait du contenu typé que `followBuild` lui remet.
 *
 * @param progress - le dernier `progress` reçu, `null` avant le premier
 */
export function BuildBar({
  progress,
}: {
  progress: BuildEvents["progress"] | null;
}) {
  const percent = progress?.percent ?? 0;
  return (
    <figure className="sse-build">
      <figcaption>
        Construction : <strong>{progress?.step ?? "en attente"}</strong>
      </figcaption>
      <div
        className="sse-build-bar"
        role="progressbar"
        aria-label="Avancement de la construction"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
      <p className="file-map-note">{percent} %</p>
    </figure>
  );
}

/**
 * La réponse de `/answer`, telle que `ask` la reçoit : un mot par
 * événement `token`, mis bout à bout.
 *
 * @param words - les mots reçus
 * @param writing - vrai tant que le flux court
 */
export function AnswerBubble({
  words,
  writing,
}: {
  words: readonly string[];
  writing: boolean;
}) {
  if (words.length === 0 && !writing) return null;
  return (
    <figure className="sse-answer">
      <figcaption>
        Réponse — {words.length} mot(s), {words.length} événement(s){" "}
        <code>token</code>
      </figcaption>
      <p aria-live="polite">
        {words.join(" ")}
        {writing && <span className="sse-caret" aria-hidden="true" />}
      </p>
    </figure>
  );
}
