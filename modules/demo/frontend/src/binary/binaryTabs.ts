import type { ILesson, LessonFile } from "../lesson/lesson";

/**
 * Temps réel binaire, couche par couche — la config qui allume CBOR, le
 * contrôleur ENTIER dans l'ordre du fichier, puis le contrat partagé et le
 * code client de chaque geste (modèle commun : `lesson/lesson.ts`). Les
 * gestes de la page citent les mêmes régions, une par une.
 */

const CONFIG: LessonFile = "nodefony/config/config.ts";
const CONTROLLER: LessonFile = "nodefony/controllers/BinaryController.ts";
const SHARED: LessonFile = "frontend/src/binary/binaryDemo.ts";
const CLIENT: LessonFile = "frontend/src/binary/binaryClient.ts";
const PROBE: LessonFile = "frontend/src/kit/probe.ts";

export const BINARY_LESSON = {
  tabs: [
    {
      layer: "config",
      blocks: [
        {
          text: "Deux réglages, posés par la démo sur d'autres modules : le serveur sait parler CBOR (`module-realtime`), et un message entrant peut peser 2 Mio (`module-http`, sur `ws` et `wss`).",
          excerpt: { file: CONFIG, region: "binary-config" },
        },
      ],
    },
    {
      layer: "controller",
      blocks: [
        {
          text: "Une socket typée par un contrat partagé, sur sa propre adresse. Rien ne parle de CBOR : le contrôleur publie des objets qui contiennent des `Uint8Array`.",
          excerpt: { file: CONTROLLER, region: "binary-class" },
        },
        {
          text: "INDUSTRIE : dix trames par seconde, 256 mesures Int16 écrites en petit-boutiste. Le canal ne tourne que pour qui regarde.",
          excerpt: { file: CONTROLLER, region: "binary-vibration" },
        },
        {
          text: "Des octets de la taille demandée, dans une liste fermée : la page mesure ce qu'ils pèsent sur le fil.",
          excerpt: { file: CONTROLLER, region: "binary-sample" },
        },
        {
          text: "Le chemin inverse : recevoir des octets, rendre leur empreinte. Le schéma refuse tout ce qui n'est pas un `Uint8Array`.",
          excerpt: { file: CONTROLLER, region: "binary-digest" },
        },
        {
          text: "JEU : trente images par seconde, l'état complet de 64 sprites en Float32.",
          excerpt: { file: CONTROLLER, region: "binary-game" },
        },
      ],
    },
    {
      layer: "front",
      blocks: [
        {
          text: "L'adresse, les canaux, les tailles et le contrat, écrits UNE fois et importés des deux côtés. Des octets se déclarent `Uint8Array`.",
          excerpt: { file: SHARED, region: "binary-shared" },
        },
        {
          text: "Ouvrir : `codec: CBOR_FRAME_CODEC` est une OFFRE. Le codec retenu n'est connu qu'à l'accueil.",
          excerpt: { file: CLIENT, region: "client-open" },
        },
        {
          text: "Négocier : `socket.codec` dit ce que le serveur a choisi.",
          excerpt: { file: CLIENT, region: "client-negotiate" },
        },
        {
          text: "Recevoir des mesures : `DataView` sur la tranche reçue, en petit-boutiste.",
          excerpt: { file: CLIENT, region: "client-vibration" },
        },
        {
          text: "Demander chaque taille : le code ne mesure rien, la sonde compte les trames.",
          excerpt: { file: CLIENT, region: "client-measure" },
        },
        {
          text: "Envoyer des octets : un `Uint8Array` dans les paramètres, et l'empreinte comparée des deux côtés.",
          excerpt: { file: CLIENT, region: "client-send" },
        },
        {
          text: "Au-delà de `maxPayload`, pas de réponse : la connexion se ferme en 1009.",
          excerpt: { file: CLIENT, region: "client-limit" },
        },
        {
          text: "Lire des positions : des Float32 entrelacés, même geste que les Int16.",
          excerpt: { file: CLIENT, region: "client-game" },
        },
        {
          text: "Le piège du `$bytes` forgé, et le schéma du serveur derrière.",
          excerpt: { file: CLIENT, region: "client-traps" },
        },
        {
          text: "La sonde de la page : un transport qui COMPTE chaque trame, en octets, telle qu'elle passe.",
          excerpt: { file: PROBE, region: "probe-realtime" },
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
      region: "binary-class",
    },
    {
      name: "RealtimePolicy",
      from: "@nodefony/realtime",
      role: "ouvre les méthodes du contrat aux visiteurs sans session — elles sont fermées par défaut.",
      file: CONTROLLER,
      region: "binary-class",
    },
    {
      name: "route",
      from: "@nodefony/framework",
      role: "la route `WEBSOCKET` de la socket.",
      file: CONTROLLER,
      region: "binary-class",
    },
    {
      name: "RealtimeChannel",
      from: "@nodefony/realtime",
      role: "déclare un canal : sa fabrique tourne au premier abonné, son retour au départ du dernier.",
      file: CONTROLLER,
      region: "binary-vibration",
    },
  ],
  decoratedFiles: [CONTROLLER],
} as const satisfies ILesson;

/** Un extrait que la leçon cite : un geste qui en citerait un autre ne compile pas. */
export type BinaryExcerpt =
  (typeof BINARY_LESSON.tabs)[number]["blocks"][number]["excerpt"];
