import { NodefonySse } from "nodefony/client";
import { z } from "zod";
import { CLOCK_TICKS, SSE_PATH, type BuildEvents } from "./sseDemo";

/**
 * Le code CLIENT de la leçon « Flux SSE » : ce qu'une page écrit pour lire
 * chaque flux. Chaque fonction ouvre le flux, pose ses écouteurs, le ferme
 * quand elle a fini, et prévient la page (`end`).
 *
 * Guide pour un agent : ce code TOURNE — la page passe ces fonctions à la
 * sonde du kit (`probeSse` de `kit/probe.ts`), qui écoute le même flux pour
 * l'afficher. Les blocs `// #region client-*` sont CITÉS par la page, à côté
 * du contrôleur `SseController.ts` : les renommer casse le test du module.
 */

/** Le contenu d'un événement, en texte ; `""` pour un événement sans données. */
function dataOf(event: Event): string {
  return event instanceof MessageEvent ? String(event.data) : "";
}

/** Un top de `/clock`. */
const Tick = z.strictObject({ tick: z.number(), at: z.string() });

// #region client-open
// Lire un flux : `new EventSource(url)`. Le navigateur envoie un `GET`
// avec `Accept: text/event-stream` ; un événement sans nom arrive sur
// `message`. Le serveur a fini ? Pour `EventSource`, c'est une
// COUPURE : il se reconnecterait et rejouerait tout. La page ferme.
export function openStream(
  path: string,
  onData: (data: string) => void,
  end: () => void,
): EventSource {
  const source = new EventSource(path);
  source.addEventListener("message", (event) => onData(dataOf(event)));
  source.addEventListener("error", () => {
    source.close();
    end();
  });
  return source;
}
// #endregion

// #region client-named
// Écouter par NOM : un écouteur par événement. Le contenu voyage en
// texte JSON ; le schéma le relit, et `BuildEvents` — la carte que le
// contrôleur utilise aussi — dit sa forme. `done` : la page ferme.
const Progress = z.strictObject({
  step: z.string(),
  percent: z.number(),
}) satisfies z.ZodType<BuildEvents["progress"]>;

export function followBuild(
  onProgress: (progress: BuildEvents["progress"]) => void,
  end: () => void,
): EventSource {
  const source = new EventSource(`${SSE_PATH}/build`);
  source.addEventListener("progress", (event) => {
    const progress = Progress.safeParse(JSON.parse(dataOf(event)));
    if (progress.success) onProgress(progress.data);
  });
  source.addEventListener("done", () => {
    source.close();
    end();
  });
  return source;
}
// #endregion

// #region client-resume
// Reprendre : RIEN à écrire. `EventSource` se reconnecte seul après
// `retry` ms, en renvoyant le dernier `id` reçu dans `Last-Event-ID` ;
// un 204 l'arrête pour de bon.
export function followResume(): EventSource {
  return new EventSource(`${SSE_PATH}/resume`);
}

// Reprendre à un `id` choisi dès le premier appel : le natif interdit
// d'écrire l'en-tête, `NodefonySse` (de `nodefony/client`) le pose.
export function resumeAfter(lastEventId: string): NodefonySse {
  return new NodefonySse(`${SSE_PATH}/resume`, { lastEventId });
}
// #endregion

// #region client-leave
// Partir : `source.close()`. La connexion tombe, le serveur le voit —
// `sse.closed` passe à vrai et sa boucle s'arrête. Ici, après
// `CLOCK_TICKS` tops.
export function listenClock(
  onTick: (tick: number) => void,
  end: () => void,
): EventSource {
  const source = new EventSource(`${SSE_PATH}/clock`);
  source.addEventListener("message", (event) => {
    const tick = Tick.safeParse(JSON.parse(dataOf(event)));
    if (!tick.success) return;
    onTick(tick.data.tick);
    if (tick.data.tick >= CLOCK_TICKS) {
      source.close();
      end();
    }
  });
  return source;
}
// #endregion

// #region client-post
// Un flux en réponse à un `POST` : `EventSource` ne sait pas.
// `NodefonySse` a la même interface, plus méthode, en-têtes et corps.
// Chaque `token` est un mot : la page les met bout à bout.
export function ask(
  question: string,
  onWord: (word: string) => void,
  end: () => void,
): NodefonySse {
  const source = new NodefonySse(`${SSE_PATH}/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question }),
  });
  source.addEventListener("token", (event) => onWord(dataOf(event)));
  source.addEventListener("done", () => {
    source.close();
    end();
  });
  return source;
}
// #endregion
