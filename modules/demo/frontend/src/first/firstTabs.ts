import type { ILesson, LessonFile } from "../lesson/lesson";

/**
 * Premiers pas, couche par couche — le contrôleur ENTIER dans l'ordre du
 * fichier, puis ce que la page partage avec lui et sa façon d'appeler
 * (modèle commun : `lesson/lesson.ts`). Les étapes de la page citent les
 * mêmes régions, une par une, à côté de leur essai.
 */

const CONTROLLER: LessonFile = "nodefony/controllers/FirstStepsController.ts";
const SHARED: LessonFile = "frontend/src/first/firstSteps.ts";
const CLIENT: LessonFile = "frontend/src/first/firstClient.ts";
const PROBE: LessonFile = "frontend/src/kit/probe.ts";

export const FIRST_LESSON = {
  tabs: [
    {
      layer: "controller",
      blocks: [
        {
          text: "Un contrôleur est une classe décorée. `@controller` donne le préfixe de toutes ses routes ; le module la déclare dans son `index.ts` (`@controllers([…])`), et c'est tout le câblage.",
          excerpt: { file: CONTROLLER, region: "first-class" },
        },
        {
          text: "Retourner un objet suffit : le framework le rend en JSON. Les morceaux de l'adresse arrivent en arguments.",
          excerpt: { file: CONTROLLER, region: "first-hello" },
        },
        {
          text: "Pour piloter l'envoi soi-même : `render()`, avec le type, le statut et les en-têtes voulus.",
          excerpt: { file: CONTROLLER, region: "first-render" },
        },
        {
          text: "Le corps reçu est validé AVANT l'action ; l'action reçoit des valeurs déjà typées.",
          excerpt: { file: CONTROLLER, region: "first-echo" },
        },
        {
          text: "Une erreur levée devient une réponse, avec son statut.",
          excerpt: { file: CONTROLLER, region: "first-errors" },
        },
        {
          text: "Rediriger : vers une autre adresse, ou après un envoi, avec un message flash lu une seule fois.",
          excerpt: { file: CONTROLLER, region: "first-redirect" },
        },
        {
          text: "La session n'existe que si la route la demande (`@UseSession`) : aucune session pour les autres routes, donc aucun coût.",
          excerpt: { file: CONTROLLER, region: "first-flash" },
        },
        {
          text: "La `Response` de la Fetch API, renvoyée telle quelle.",
          excerpt: { file: CONTROLLER, region: "first-web-response" },
        },
        {
          text: "Un flux d'octets, envoyé morceau par morceau.",
          excerpt: { file: CONTROLLER, region: "first-stream" },
        },
        {
          text: "Un fichier, sans le charger en mémoire, avec le cache HTTP offert.",
          excerpt: { file: CONTROLLER, region: "first-file" },
        },
        {
          text: "L'identité de l'appelant, posée par le pare-feu.",
          excerpt: { file: CONTROLLER, region: "first-whoami" },
        },
      ],
    },
    {
      layer: "front",
      blocks: [
        {
          text: "Le chemin et le schéma du corps, écrits UNE fois et importés par le contrôleur ET par la page : le serveur valide avec la règle même que la page connaît.",
          excerpt: { file: SHARED, region: "first-shared" },
        },
        {
          text: "Préparer un appel : une `Request`, l'adresse encodée. La page l'envoie par `fetch`, puis lit l'objet rendu.",
          excerpt: { file: CLIENT, region: "client-hello" },
        },
        {
          text: "Un `GET` tout simple ; le cookie de session part tout seul.",
          excerpt: { file: CLIENT, region: "client-get" },
        },
        {
          text: "Envoyer du JSON — et le vérifier AVANT, avec le schéma même du serveur.",
          excerpt: { file: CLIENT, region: "client-echo" },
        },
        {
          text: "`fetch` suit une redirection : `response.redirected` le dit.",
          excerpt: { file: CLIENT, region: "client-note" },
        },
        {
          text: "Garder l'`etag`, le renvoyer en `If-None-Match` : 304, rien ne repart.",
          excerpt: { file: CLIENT, region: "client-file" },
        },
        {
          text: "La même adresse en `ws:` : `new WebSocket`, et la première trame est la réponse de l'action.",
          excerpt: { file: CLIENT, region: "client-socket" },
        },
        {
          text: "Chaque bouton envoie sa `Request` avec `fetch`, et lit le corps en flux : c'est ce qui montre le compte à rebours arriver morceau par morceau.",
          excerpt: { file: PROBE, region: "probe-http" },
        },
        {
          text: "L'étape 10 écoute la `WebSocket` ouverte par le code client : garde la première trame, envoie un message, garde la réponse.",
          excerpt: { file: PROBE, region: "probe-socket" },
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
      region: "first-class",
    },
    {
      name: "Get",
      from: "@nodefony/framework",
      role: "une route `GET` ; `requirements.methods` y AJOUTE d'autres transports (`WEBSOCKET`).",
      file: CONTROLLER,
      region: "first-hello",
    },
    {
      name: "Param",
      from: "@nodefony/framework",
      role: "lie un morceau du chemin (`{name}`) à un argument.",
      file: CONTROLLER,
      region: "first-hello",
    },
    {
      name: "Query",
      from: "@nodefony/framework",
      role: "lie un paramètre de l'adresse (`?lang=`) à un argument.",
      file: CONTROLLER,
      region: "first-hello",
    },
    {
      name: "Post",
      from: "@nodefony/framework",
      role: "une route `POST` ; `schema` valide le corps avant l'action.",
      file: CONTROLLER,
      region: "first-echo",
    },
    {
      name: "UseSession",
      from: "@nodefony/framework",
      role: "ouvre la session pour cette route seulement.",
      file: CONTROLLER,
      region: "first-flash",
    },
  ],
  decoratedFiles: [CONTROLLER],
} as const satisfies ILesson;

/**
 * Les régions du contrôleur que la leçon cite : une étape de la page qui en
 * citerait une autre ne compile pas.
 */
export type FirstControllerRegion =
  (typeof FIRST_LESSON.tabs)[0]["blocks"][number]["excerpt"]["region"];

/** Les régions du code client (`firstClient.ts`) que la leçon cite. */
export type FirstClientRegion = Extract<
  (typeof FIRST_LESSON.tabs)[1]["blocks"][number]["excerpt"]["region"],
  `client-${string}`
>;

/** Un extrait que la leçon cite : un geste qui en citerait un autre ne compile pas. */
export type FirstExcerpt =
  (typeof FIRST_LESSON.tabs)[number]["blocks"][number]["excerpt"];
