import type { ILesson, LessonFile } from "../lesson/lesson";

/**
 * Météores, couche par couche — le contrôleur (deux portes), le service (les
 * règles sur la salle commune), puis la page. Les briques communes aux jeux
 * (`game/`) sont citées ici ET dans Prisme : c'est le même code.
 */

const CONTROLLER: LessonFile = "nodefony/controllers/MeteorController.ts";
const SERVICE: LessonFile = "nodefony/service/MeteorService.ts";
const ROOM: LessonFile = "nodefony/game/GameRoom.ts";
const STEP: LessonFile = "nodefony/kit/fixedStep.ts";
const SHARED: LessonFile = "frontend/src/meteor/meteorDemo.ts";
const RECORDS: LessonFile = "frontend/src/kit/records.ts";
const CLIENT: LessonFile = "frontend/src/meteor/meteorClient.ts";
const SOCKET: LessonFile = "frontend/src/game/gameSocket.ts";
const SNAPSHOTS: LessonFile = "frontend/src/game/snapshots.ts";
const SENDER: LessonFile = "frontend/src/game/commandSender.ts";
const METER: LessonFile = "frontend/src/game/wireMeter.ts";
const LOOP: LessonFile = "frontend/src/game/useGameLoop.ts";
const SCENE: LessonFile = "frontend/src/meteor/meteorScene.ts";

export const METEOR_LESSON = {
  tabs: [
    {
      layer: "controller",
      blocks: [
        {
          text: "Le contrôleur entier : aucune règle, deux portes. Le canal d'état démarre la salle au premier spectateur ; la commande du joueur arrive par `@RealtimeInbound`, avec sa CONNEXION — c'est elle, l'identité du canon.",
          excerpt: { file: CONTROLLER, region: "meteor-controller" },
        },
      ],
    },
    {
      layer: "service",
      blocks: [
        {
          text: "La salle commune à tous les jeux : qui joue, à quelle place, les robots qui complètent, la boucle, la trame publiée. Un pilote part quand sa connexion se ferme, ou après dix secondes de silence.",
          excerpt: { file: ROOM, region: "game-room" },
        },
        {
          text: "La boucle à pas fixe : l'heure du prochain tour se calcule sur `hrtime`, un retard se rattrape au lieu de décaler tous les tours suivants.",
          excerpt: { file: STEP, region: "kit-fixed-step" },
        },
        {
          text: "Les règles de Météores, branchées sur la salle : valider la visée, l'appliquer, faire avancer le monde, écrire la trame. Le serveur seul décide qu'un tir touche.",
          excerpt: { file: SERVICE, region: "meteor-rules" },
        },
      ],
    },
    {
      layer: "front",
      blocks: [
        {
          text: "Le contrat partagé : adresse, canal, dimensions du monde, et la trame — des compteurs en clair, le monde en octets.",
          excerpt: { file: SHARED, region: "meteor-shared" },
        },
        {
          text: "Chaque entité en quelques octets, décrite par un schéma : le MÊME objet écrit côté serveur et lit côté page. 300 météores = 2,4 Ko.",
          excerpt: { file: SHARED, region: "meteor-wire" },
        },
        {
          text: "La brique commune qui fait ces octets : un schéma de champs, et ses deux sens.",
          excerpt: { file: RECORDS, region: "kit-records" },
        },
        {
          text: "Une socket par jeu, qui offre CBOR et se reconnecte seule.",
          excerpt: { file: SOCKET, region: "game-socket" },
        },
        {
          text: "Le code propre à Météores côté page : relire SES enregistrements, suivre l'état, envoyer la visée.",
          excerpt: { file: CLIENT, region: "meteor-client" },
        },
        {
          text: "Afficher à 60 images/s ce que le serveur publie 30 fois : deux trames encadrent l'instant affiché, et chaque météore glisse entre les deux.",
          excerpt: { file: SNAPSHOTS, region: "game-snapshots" },
        },
        {
          text: "La souris bouge 120 fois par seconde : une commande ne part que si elle a changé, au plus une par intervalle, avec un signe de vie quand rien ne bouge.",
          excerpt: { file: SENDER, region: "game-command-sender" },
        },
        {
          text: "La boucle d'affichage, qui suit l'écran et s'arrête au démontage.",
          excerpt: { file: LOOP, region: "game-loop" },
        },
        {
          text: "Le fil mesuré : chaque nombre du panneau vient d'une trame qui a traversé la socket.",
          excerpt: { file: METER, region: "game-wire-meter" },
        },
        {
          text: "Le dessin : un canvas 2D, des sprites préparés une fois, aucune allocation par image.",
          excerpt: { file: SCENE, region: "meteor-scene-draw" },
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
      region: "meteor-controller",
    },
    {
      name: "Inject",
      from: "nodefony",
      role: "reçoit la salle du jeu, la même pour toutes les connexions.",
      file: CONTROLLER,
      region: "meteor-controller",
    },
    {
      name: "route",
      from: "@nodefony/framework",
      role: "la route `WEBSOCKET` de la socket.",
      file: CONTROLLER,
      region: "meteor-controller",
    },
    {
      name: "RealtimeChannel",
      from: "@nodefony/realtime",
      role: "le canal d'état : sa fabrique démarre la salle au premier abonné, son retour l'arrête au départ du dernier.",
      file: CONTROLLER,
      region: "meteor-controller",
    },
    {
      name: "RealtimeInbound",
      from: "@nodefony/realtime",
      role: "reçoit la commande du joueur, avec sa connexion.",
      file: CONTROLLER,
      region: "meteor-controller",
    },
  ],
  decoratedFiles: [CONTROLLER],
} as const satisfies ILesson;
