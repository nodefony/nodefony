import type { ILesson, LessonFile } from "../lesson/lesson";

/**
 * Vidéo par plages, couche par couche — le contrôleur ENTIER dans l'ordre du
 * fichier, puis ce que la page partage avec lui et sa façon de lire une
 * réponse (modèle commun : `lesson/lesson.ts`). Les gestes de la page citent
 * les mêmes régions, une par une, à côté de leurs appels.
 */

const CONTROLLER: LessonFile = "nodefony/controllers/VideoController.ts";
const SHARED: LessonFile = "frontend/src/video/videoDemo.ts";
const PROBE: LessonFile = "frontend/src/kit/probe.ts";
const PAGE: LessonFile = "frontend/src/video/VideoLesson.tsx";
const VISUALS: LessonFile = "frontend/src/video/VideoVisuals.tsx";

export const VIDEO_LESSON = {
  tabs: [
    {
      layer: "controller",
      blocks: [
        {
          text: "Un contrôleur ordinaire, préfixé `/demo/api/media`. Les vidéos vivent dans le dossier `media/` du module.",
          excerpt: { file: CONTROLLER, region: "video-class" },
        },
        {
          text: "La liste du dossier : seulement les noms que la route de lecture accepte.",
          excerpt: { file: CONTROLLER, region: "video-list" },
        },
        {
          text: "`renderMediaStream()` porte toute la règle des plages : 206, 416, en-tête ignoré, `If-Range`, `ETag`.",
          excerpt: { file: CONTROLLER, region: "video-serve" },
        },
        {
          text: "`renderFileDownload()` : le fichier entier, en pièce à enregistrer.",
          excerpt: { file: CONTROLLER, region: "video-download" },
        },
      ],
    },
    {
      layer: "front",
      blocks: [
        {
          text: "Le chemin, le nom accepté et la forme de la liste, écrits UNE fois et importés par le contrôleur ET par la page.",
          excerpt: { file: SHARED, region: "video-shared" },
        },
        {
          text: "Le lecteur : un `<video>` et l'adresse de la route. Le navigateur envoie `Range` tout seul.",
          excerpt: { file: VISUALS, region: "client-player" },
        },
        {
          text: "Ce que le lecteur a déjà chargé, en secondes : `video.buffered`.",
          excerpt: { file: VISUALS, region: "client-buffered" },
        },
        {
          text: "Un morceau demandé à la main : `fetch` avec `Range`, un 206, `Content-Range`. La carte du fichier se lit ainsi.",
          excerpt: { file: VISUALS, region: "client-range" },
        },
        {
          text: "Reprendre la même version : l'`ETag` lu par `HEAD`, renvoyé en `If-Range`.",
          excerpt: { file: PAGE, region: "client-if-range" },
        },
        {
          text: "La page envoie `Range` avec `fetch` et montre ce qui revient : statut, `Content-Range`, et les premiers octets en hexadécimal.",
          excerpt: { file: PROBE, region: "probe-http" },
        },
      ],
    },
  ],
  decorators: [
    {
      name: "controller",
      from: "@nodefony/framework",
      role: "déclare le contrôleur et préfixe toutes ses routes.",
      file: CONTROLLER,
      region: "video-class",
    },
    {
      name: "Get",
      from: "@nodefony/framework",
      role: "une route `GET` ; `schema.params` refuse un nom qui n'est pas celui d'une vidéo, avant l'action.",
      file: CONTROLLER,
      region: "video-serve",
    },
  ],
  decoratedFiles: [CONTROLLER],
} as const satisfies ILesson;

/** Un extrait que la leçon cite : un geste qui en citerait un autre ne compile pas. */
export type VideoExcerpt =
  (typeof VIDEO_LESSON.tabs)[number]["blocks"][number]["excerpt"];
