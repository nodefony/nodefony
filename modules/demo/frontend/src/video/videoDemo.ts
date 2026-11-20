import { z } from "zod";

/**
 * Ce que la page « Vidéo par plages » et son contrôleur partagent : le chemin
 * des routes, la forme d'un nom de vidéo et celle de la liste. Écrit UNE
 * fois, importé des deux côtés.
 *
 * Guide pour un agent : le contrôleur est
 * `nodefony/controllers/VideoController.ts`, la page
 * `frontend/src/video/VideoLesson.tsx`. Les vidéos vivent dans le dossier
 * `media/` du module ; `sample.mp4` y est posé à la création. Les blocs
 * `// #region` sont CITÉS par la page : les renommer casse le test du module.
 */

// #region video-shared
/** Préfixe de toutes les routes de la leçon. */
export const VIDEO_PATH = "/demo/api/media";

/**
 * Un nom de vidéo de `media/` : lettres, chiffres, `-` et `_`, puis une
 * extension connue. Jamais un CHEMIN — ni `/`, ni `..` : la route ne sert
 * que ce dossier, et un nom refusé n'atteint pas l'action.
 */
export const MediaParams = z.strictObject({
  name: z.string().regex(/^[\w-]{1,64}\.(?:mp4|webm|ogv|mov|m4v)$/u),
});

/** Une vidéo du dossier, telle que la liste la rend. */
export interface IMediaFile {
  name: string;
  /** Taille en octets. */
  size: number;
}
// #endregion

/** La vidéo posée par `create app --demo`. */
export const SAMPLE_VIDEO = "sample.mp4";

/** Longueur des plages demandées par les gestes. */
export const RANGE_BYTES = 100;
