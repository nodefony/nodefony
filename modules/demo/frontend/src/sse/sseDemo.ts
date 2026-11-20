import { z } from "zod";

/**
 * Ce que la page « Flux SSE » et son contrôleur partagent : le chemin des
 * routes, la carte des événements typés, le schéma de la question, les
 * rythmes de l'exemple. Écrit UNE fois, importé des deux côtés.
 *
 * Guide pour un agent : le contrôleur est
 * `nodefony/controllers/SseController.ts`, la page
 * `frontend/src/sse/SseLesson.tsx`. Les blocs `// #region` sont CITÉS par la
 * page : les renommer casse le test du module.
 */

// #region sse-shared
/** Préfixe de toutes les routes de la leçon. */
export const SSE_PATH = "/demo/api/sse";

/**
 * Les événements du flux `/build` : nom → contenu. Le contrôleur ouvre
 * `renderSse<BuildEvents>()` : un nom mal écrit, ou un contenu de la
 * mauvaise forme, ne compile pas.
 */
export type BuildEvents = {
  progress: { step: string; percent: number };
  done: { ms: number };
};

/** La question qu'accepte `POST /answer`. */
export const AskBody = z.strictObject({
  question: z.string().trim().min(1).max(120),
});
// #endregion

/** `/steps` : combien d'événements, à quel rythme. */
export const STEP_COUNT = 5;
export const STEP_MS = 400;

/** `/build` : les étapes d'une construction imaginaire. */
export const BUILD_STEPS = ["lecture", "analyse", "compilation", "paquet"];
export const BUILD_STEP_MS = 350;

/** `/resume` : le dernier identifiant, et combien d'événements par connexion. */
export const RESUME_LAST = 6;
export const RESUME_BATCH = 2;
export const RESUME_RETRY_MS = 800;

/** `/quiet` : le silence, et le battement qui le traverse. */
export const QUIET_MS = 3500;
export const QUIET_HEARTBEAT_MS = 1000;

/** `/clock` : un top toutes les… ; la page ferme après `CLOCK_TICKS`. */
export const TICK_MS = 500;
export const CLOCK_TICKS = 6;

/** `/answer` : l'écart entre deux mots. */
export const WORD_MS = 90;

/**
 * La réponse de `/answer`, découpée en mots — elle part mot à mot, comme
 * celle d'un modèle de langage.
 */
export function answerWords(question: string): string[] {
  return `Vous avez demandé « ${question} ». Cette réponse s'écrit mot à mot : chaque mot est un événement « token », envoyé dès qu'il est prêt, sur la réponse même du POST.`.split(
    " ",
  );
}
