import type { ILesson, LessonFile } from "../lesson/lesson";

/**
 * Prisme, couche par couche. Les briques de la salle, de la boucle, des
 * enregistrements et de l'affichage sont les MÊMES que celles de Météores :
 * citées des mêmes fichiers.
 */

const CONTROLLER: LessonFile = "nodefony/controllers/PrismController.ts";
const SERVICE: LessonFile = "nodefony/service/PrismService.ts";
const ROOM: LessonFile = "nodefony/game/GameRoom.ts";
const STEP: LessonFile = "nodefony/kit/fixedStep.ts";
const SHARED: LessonFile = "frontend/src/prism/prismDemo.ts";
const RECORDS: LessonFile = "frontend/src/kit/records.ts";
const CLIENT: LessonFile = "frontend/src/prism/prismClient.ts";
const SOCKET: LessonFile = "frontend/src/game/gameSocket.ts";
const SNAPSHOTS: LessonFile = "frontend/src/game/snapshots.ts";
const SENDER: LessonFile = "frontend/src/game/commandSender.ts";
const METER: LessonFile = "frontend/src/game/wireMeter.ts";
const LOOP: LessonFile = "frontend/src/game/useGameLoop.ts";
const SCENE: LessonFile = "frontend/src/prism/prismScene.ts";

export const PRISM_LESSON = {
  tabs: [
    {
      layer: "controller",
      blocks: [
        {
          text: "Le contrôleur entier, le même que celui de Météores à son contrat près : le canal d'état démarre la salle, la direction du joueur arrive avec sa connexion.",
          excerpt: { file: CONTROLLER, region: "prism-controller" },
        },
      ],
    },
    {
      layer: "service",
      blocks: [
        {
          text: "La salle commune : pilotes, robots, boucle, publication. Prisme ne la réécrit pas.",
          excerpt: { file: ROOM, region: "game-room" },
        },
        {
          text: "La boucle à pas fixe, commune elle aussi.",
          excerpt: { file: STEP, region: "kit-fixed-step" },
        },
        {
          text: "Les règles de Prisme : une case appartient à l'équipe du dernier drone qui l'a survolée, décidé par le serveur à chaque tour. La trame porte une COPIE de la grille : elle continue de changer après l'envoi.",
          excerpt: { file: SERVICE, region: "prism-rules" },
        },
      ],
    },
    {
      layer: "front",
      blocks: [
        {
          text: "Le contrat partagé. La grille se CALCULE des deux côtés par la même fonction : la trame n'envoie qu'un octet par case, son propriétaire.",
          excerpt: { file: SHARED, region: "prism-shared" },
        },
        {
          text: "Les enregistrements binaires, communs aux jeux.",
          excerpt: { file: RECORDS, region: "kit-records" },
        },
        {
          text: "La socket du jeu, commune aux jeux.",
          excerpt: { file: SOCKET, region: "game-socket" },
        },
        {
          text: "Le code propre à Prisme côté page : relire les drones, suivre l'état, envoyer la direction.",
          excerpt: { file: CLIENT, region: "prism-client" },
        },
        {
          text: "Chaque drone glisse entre deux trames connues : 30 trames par seconde, 60 images.",
          excerpt: { file: SNAPSHOTS, region: "game-snapshots" },
        },
        {
          text: "Une direction ne part que si elle a changé, au plus trente fois par seconde.",
          excerpt: { file: SENDER, region: "game-command-sender" },
        },
        {
          text: "La boucle d'affichage commune.",
          excerpt: { file: LOOP, region: "game-loop" },
        },
        {
          text: "Le fil mesuré, commun.",
          excerpt: { file: METER, region: "game-wire-meter" },
        },
        {
          text: "La scène 3D : 397 prismes en UN appel de dessin, et une case n'est retouchée que si son propriétaire change. Three.js n'est chargé que sur cette page.",
          excerpt: { file: SCENE, region: "prism-scene-tiles" },
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
      region: "prism-controller",
    },
    {
      name: "Inject",
      from: "nodefony",
      role: "reçoit la salle du jeu, la même pour toutes les connexions.",
      file: CONTROLLER,
      region: "prism-controller",
    },
    {
      name: "route",
      from: "@nodefony/framework",
      role: "la route `WEBSOCKET` de la socket.",
      file: CONTROLLER,
      region: "prism-controller",
    },
    {
      name: "RealtimeChannel",
      from: "@nodefony/realtime",
      role: "le canal d'état : la salle tourne tant que quelqu'un regarde.",
      file: CONTROLLER,
      region: "prism-controller",
    },
    {
      name: "RealtimeInbound",
      from: "@nodefony/realtime",
      role: "reçoit la direction du joueur, avec sa connexion.",
      file: CONTROLLER,
      region: "prism-controller",
    },
  ],
  decoratedFiles: [CONTROLLER],
} as const satisfies ILesson;
