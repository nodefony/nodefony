import type { ILesson, LessonFile } from "../lesson/lesson";

/**
 * Flux SSE, couche par couche — le contrôleur ENTIER dans l'ordre du
 * fichier, puis ce que la page partage avec lui et sa façon de lire un flux
 * (modèle commun : `lesson/lesson.ts`). Les gestes de la page citent les
 * mêmes régions, une par une, à côté de leurs appels.
 */

const CONTROLLER: LessonFile = "nodefony/controllers/SseController.ts";
const SHARED: LessonFile = "frontend/src/sse/sseDemo.ts";
const CLIENT: LessonFile = "frontend/src/sse/sseClient.ts";
const PROBE: LessonFile = "frontend/src/kit/probe.ts";

export const SSE_LESSON = {
  tabs: [
    {
      layer: "controller",
      blocks: [
        {
          text: "Un contrôleur ordinaire : rien ne le déclare « SSE ». C'est chaque action qui choisit de répondre en flux.",
          excerpt: { file: CONTROLLER, region: "sse-class" },
        },
        {
          text: "`renderSse()` ouvre le flux, `send()` écrit un événement, `close()` termine la requête.",
          excerpt: { file: CONTROLLER, region: "sse-open" },
        },
        {
          text: "Des événements nommés, typés par une carte partagée avec la page.",
          excerpt: { file: CONTROLLER, region: "sse-named" },
        },
        {
          text: "Un `id` par événement : le navigateur reprend où il s'était arrêté. Un 204 lui dit que c'est fini.",
          excerpt: { file: CONTROLLER, region: "sse-resume" },
        },
        {
          text: "Le battement de cœur garde vivante une connexion qui se tait.",
          excerpt: { file: CONTROLLER, region: "sse-heartbeat" },
        },
        {
          text: "Un flux sans fin s'arrête quand le client part : `sse.closed`, `onClose`.",
          excerpt: { file: CONTROLLER, region: "sse-leave" },
        },
        {
          text: "La même route rend du JSON ou un flux, selon ce que le client demande.",
          excerpt: { file: CONTROLLER, region: "sse-negotiate" },
        },
        {
          text: "Un flux en réponse à un `POST` dont le corps est validé.",
          excerpt: { file: CONTROLLER, region: "sse-post" },
        },
      ],
    },
    {
      layer: "front",
      blocks: [
        {
          text: "Le chemin, la carte des événements et le schéma de la question, écrits UNE fois et importés par le contrôleur ET par la page.",
          excerpt: { file: SHARED, region: "sse-shared" },
        },
        {
          text: "Lire un flux : `new EventSource(url)`, et fermer soi-même quand le serveur a fini — sinon le navigateur se reconnecte.",
          excerpt: { file: CLIENT, region: "client-open" },
        },
        {
          text: "Un écouteur par nom d'événement ; le contenu JSON relu par un schéma, typé par la carte partagée.",
          excerpt: { file: CLIENT, region: "client-named" },
        },
        {
          text: "Reprendre ne demande rien au code : le navigateur renvoie `Last-Event-ID`. `NodefonySse` le pose dès le premier appel.",
          excerpt: { file: CLIENT, region: "client-resume" },
        },
        {
          text: "Partir : `source.close()`, et le serveur le voit.",
          excerpt: { file: CLIENT, region: "client-leave" },
        },
        {
          text: "Un flux en réponse à un `POST` : `NodefonySse`, la même interface avec méthode, en-têtes et corps.",
          excerpt: { file: CLIENT, region: "client-post" },
        },
        {
          text: "La sonde de la page écoute le flux que ce code a ouvert, et note chaque événement, chaque ouverture, chaque coupure.",
          excerpt: { file: PROBE, region: "probe-sse" },
        },
        {
          text: "« Voir le fil brut » lit le même flux avec `fetch` : on voit le texte tel qu'il passe, commentaires de battement compris.",
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
      region: "sse-class",
    },
    {
      name: "Get",
      from: "@nodefony/framework",
      role: "une route `GET` — un flux SSE n'a pas de méthode à lui.",
      file: CONTROLLER,
      region: "sse-open",
    },
    {
      name: "Headers",
      from: "@nodefony/framework",
      role: "lie un en-tête de la requête (`Last-Event-ID`) à un argument.",
      file: CONTROLLER,
      region: "sse-resume",
    },
    {
      name: "Post",
      from: "@nodefony/framework",
      role: "une route `POST` ; `schema` valide le corps avant d'ouvrir le flux.",
      file: CONTROLLER,
      region: "sse-post",
    },
  ],
  decoratedFiles: [CONTROLLER],
} as const satisfies ILesson;

/** Un extrait que la leçon cite : un geste qui en citerait un autre ne compile pas. */
export type SseExcerpt =
  (typeof SSE_LESSON.tabs)[number]["blocks"][number]["excerpt"];
