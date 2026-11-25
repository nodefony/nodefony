import type { ILesson, LessonFile } from "../lesson/lesson";

/**
 * Envoi de fichiers, couche par couche — le contrôleur ENTIER dans l'ordre
 * du fichier, le service qui range, puis ce que la page partage avec eux et
 * son code client (modèle commun : `lesson/lesson.ts`). Les gestes de la page
 * citent les mêmes régions, une par une, à côté de leurs appels.
 */

const CONTROLLER: LessonFile = "nodefony/controllers/UploadController.ts";
const SERVICE: LessonFile = "nodefony/service/UploadService.ts";
const SHARED: LessonFile = "frontend/src/upload/uploadDemo.ts";
const CLIENT: LessonFile = "frontend/src/upload/uploadClient.ts";
const PAGE: LessonFile = "frontend/src/upload/UploadLesson.tsx";
const VISUALS: LessonFile = "frontend/src/upload/UploadVisuals.tsx";

export const UPLOAD_LESSON = {
  tabs: [
    {
      layer: "controller",
      blocks: [
        {
          text: "Un contrôleur ordinaire, préfixé `/demo/api/upload`, réservé aux comptes connectés : chaque fichier se range sur le compte de qui l'envoie.",
          excerpt: { file: CONTROLLER, region: "upload-class" },
        },
        {
          text: "L'envoi multipart : l'option de route `upload` borne CETTE route (8 Mio par fichier, 3 fichiers) et demande l'empreinte de chacun. Le framework a lu le corps en flux avant l'action ; elle n'a qu'à déplacer les fichiers.",
          excerpt: { file: CONTROLLER, region: "upload-send" },
        },
        {
          text: "Le corps brut : `bodyStream: true`, personne ne lit le corps avant l'action — ses bornes sont à elle.",
          excerpt: { file: CONTROLLER, region: "upload-raw-route" },
        },
        {
          text: "Les fichiers du compte.",
          excerpt: { file: CONTROLLER, region: "upload-list" },
        },
        {
          text: "Relire : le type vient des octets, `nosniff`, `attachment` sous le nom du client, et l'empreinte en `Repr-Digest`.",
          excerpt: { file: CONTROLLER, region: "upload-read" },
        },
      ],
    },
    {
      layer: "service",
      blocks: [
        {
          text: "Ranger un fichier reçu : le DÉPLACER sous un identifiant tiré par le serveur, jamais sous le nom du client, puis le reconnaître à ses premiers octets.",
          excerpt: { file: SERVICE, region: "upload-keep" },
        },
        {
          text: "Ranger un corps brut : compter, hacher et écrire au fil de l'eau ; au-delà de la borne, effacer ce qui est commencé et répondre 413.",
          excerpt: { file: SERVICE, region: "upload-raw" },
        },
      ],
    },
    {
      layer: "front",
      blocks: [
        {
          text: "Le chemin, les bornes et la forme d'un fichier rangé, écrits UNE fois et importés par le contrôleur ET par la page.",
          excerpt: { file: SHARED, region: "upload-shared" },
        },
        {
          text: "Reconnaître un fichier à ses octets — le même code que les pièces du chat.",
          excerpt: { file: SHARED, region: "upload-kind" },
        },
        {
          text: "Choisir un fichier du poste : un `File`, qui part tel quel dans un `FormData`.",
          excerpt: { file: VISUALS, region: "client-picker" },
        },
        {
          text: "Le formulaire : les fichiers, le libellé, et l'empreinte de chacun calculée AVANT l'envoi.",
          excerpt: { file: PAGE, region: "client-form" },
        },
        {
          text: "Suivre la progression : `XMLHttpRequest` et `upload.onprogress` — `fetch` ne la donne pas.",
          excerpt: { file: CLIENT, region: "client-progress" },
        },
        {
          text: "L'empreinte d'un fichier dans le navigateur : `crypto.subtle.digest`.",
          excerpt: { file: CLIENT, region: "client-digest" },
        },
        {
          text: "Relire et comparer : les octets relus, `Repr-Digest`, et l'empreinte d'avant l'envoi.",
          excerpt: { file: CLIENT, region: "client-readback" },
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
      region: "upload-class",
    },
    {
      name: "Inject",
      from: "nodefony",
      role: "injecte le service qui range les fichiers, par son nom.",
      file: CONTROLLER,
      region: "upload-class",
    },
    {
      name: "IsGranted",
      from: "@nodefony/framework",
      role: "réserve toutes les routes aux comptes connectés : un anonyme reçoit 403 avant l'action, sans qu'elle soit construite.",
      file: CONTROLLER,
      region: "upload-class",
    },
    {
      name: "Post",
      from: "@nodefony/framework",
      role: "une route `POST` ; `upload` y borne l'envoi, `bodyStream` y laisse le corps à l'action.",
      file: CONTROLLER,
      region: "upload-send",
    },
    {
      name: "HttpCode",
      from: "@nodefony/framework",
      role: "répond 201 : un fichier a été CRÉÉ.",
      file: CONTROLLER,
      region: "upload-send",
    },
    {
      name: "UploadedFiles",
      from: "@nodefony/framework",
      role: "les fichiers reçus, déjà écrits dans leur temporaire.",
      file: CONTROLLER,
      region: "upload-send",
    },
    {
      name: "Body",
      from: "@nodefony/framework",
      role: "un champ texte du même formulaire.",
      file: CONTROLLER,
      region: "upload-send",
    },
    {
      name: "Get",
      from: "@nodefony/framework",
      role: "une route `GET` ; `schema.params` refuse un identifiant qui n'en est pas un, avant l'action.",
      file: CONTROLLER,
      region: "upload-read",
    },
  ],
  decoratedFiles: [CONTROLLER],
} as const satisfies ILesson;

/** Un extrait que la leçon cite : un geste qui en citerait un autre ne compile pas. */
export type UploadExcerpt =
  (typeof UPLOAD_LESSON.tabs)[number]["blocks"][number]["excerpt"];
