import { z } from "zod";

/**
 * Ce que la page « Premiers pas » et son contrôleur partagent : le chemin des
 * routes, le schéma du corps reçu, les livres de l'exemple. Écrit UNE fois,
 * importé des deux côtés — le serveur valide avec le schéma même que la page
 * connaît.
 *
 * Guide pour un agent : le contrôleur est
 * `nodefony/controllers/FirstStepsController.ts`, la page
 * `frontend/src/first/FirstStepsLesson.tsx`. Les blocs `// #region` sont
 * CITÉS par la page : les renommer casse le test du module.
 */

// #region first-shared
/** Préfixe de toutes les routes de la leçon. */
export const FIRST_PATH = "/demo/api/first";

/** Le corps qu'accepte `POST /echo` : un nom et un âge, rien d'autre. */
export const EchoBody = z.strictObject({
  name: z.string().trim().min(1).max(40),
  age: z.number().int().min(0).max(150),
});
// #endregion

/** Ce que rend `GET /hello/{name}`, en HTTP comme par WebSocket. */
export interface IHello {
  message: string;
  lang: "fr" | "en";
  /** Le transport qui a porté la question : `http` ou `websocket`. */
  transport: "http" | "websocket";
}

/** Les livres de l'exemple : pas de base de données dans cette leçon. */
export const BOOKS = [
  { id: 1, title: "Le Petit Prince", author: "Antoine de Saint-Exupéry" },
  { id: 2, title: "L'Étranger", author: "Albert Camus" },
  { id: 3, title: "Vingt mille lieues sous les mers", author: "Jules Verne" },
] as const;

/** Le compte à rebours du flux : point de départ et pas, en millisecondes. */
export const COUNTDOWN_FROM = 5;
export const COUNTDOWN_STEP_MS = 400;
