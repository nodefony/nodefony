import type { ILesson, LessonFile } from "../lesson/lesson";

/**
 * La sonde, couche par couche — le contrôleur ENTIER, le service
 * d'acquisition et ses simulations, puis le contrat partagé et le code de la
 * page (modèle commun : `lesson/lesson.ts`). Les gestes de la page citent les
 * mêmes régions, une par une.
 */

const CONTROLLER: LessonFile = "nodefony/controllers/SensorController.ts";
const SERVICE: LessonFile = "nodefony/service/SensorService.ts";
const STEP: LessonFile = "nodefony/kit/fixedStep.ts";
const PLANT: LessonFile = "nodefony/sensor/plant.ts";
const ALARMS: LessonFile = "nodefony/sensor/alarms.ts";
const GAMMA: LessonFile = "nodefony/sensor/gamma.ts";
const CRYO: LessonFile = "nodefony/sensor/cryostat.ts";
const QUANTUM: LessonFile = "nodefony/sensor/quantum.ts";
const SHARED: LessonFile = "frontend/src/sensor/sensorDemo.ts";
const CLIENT: LessonFile = "frontend/src/sensor/sensorClient.ts";
const STATS: LessonFile = "frontend/src/sensor/sensorStats.ts";
const VIEW: LessonFile = "frontend/src/sensor/BlochView.tsx";
const RECORDS: LessonFile = "frontend/src/kit/records.ts";

export const SENSOR_LESSON = {
  tabs: [
    {
      layer: "controller",
      blocks: [
        {
          text: "Une socket typée par son contrat, cinq bancs, aucune règle. La lecture est publique ; acquitter et régler la source exigent une session.",
          excerpt: { file: CONTROLLER, region: "sensor-controller" },
        },
        {
          text: "L'usine est un canal CADENCÉ : `sensor:plant:<ms>`. La cadence se lit DANS le nom : c'est `createRealtimeChannel` qui la décode — un motif décoré sert une famille, il ne lit pas un nombre. Une cadence, un canal, une réduction partagée.",
          excerpt: { file: CONTROLLER, region: "sensor-rate-channel" },
        },
        {
          text: "Les autres bancs, un canal chacun : sa fabrique ouvre le banc au premier abonné, son retour le ferme au départ du dernier.",
          excerpt: { file: CONTROLLER, region: "sensor-channels" },
        },
        {
          text: "Écrire : l'identité vient de `this.user`, la page n'envoie que l'alarme ou le taux.",
          excerpt: { file: CONTROLLER, region: "sensor-write" },
        },
      ],
    },
    {
      layer: "service",
      blocks: [
        {
          text: "L'heure d'acquisition : `Date.now()` lu une fois, puis `hrtime`, monotone.",
          excerpt: { file: SERVICE, region: "sensor-acquisition" },
        },
        {
          text: "La boucle à pas fixe, la même que celle des jeux : un retard se rattrape au lieu de décaler tous les tours.",
          excerpt: { file: STEP, region: "kit-fixed-step" },
        },
        {
          text: "Un tour d'acquisition : lire, réduire, juger, publier ce qui est dû.",
          excerpt: { file: SERVICE, region: "sensor-step" },
        },
        {
          text: "Un écran d'usine : sa cadence, sa réduction, sa fonction d'arrêt.",
          excerpt: { file: SERVICE, region: "sensor-watch-plant" },
        },
        {
          text: "La réduction d'une fenêtre : minimum, maximum, moyenne, sans allocation par échantillon.",
          excerpt: { file: PLANT, region: "sensor-window" },
        },
        {
          text: "La machine 3 et son roulement qui se dégrade, cycle après cycle.",
          excerpt: { file: PLANT, region: "sensor-plant-sim" },
        },
        {
          text: "La moyenne glissante : l'alarme ne se juge jamais sur un échantillon.",
          excerpt: { file: ALARMS, region: "sensor-moving-average" },
        },
        {
          text: "Les états d'une alarme selon ISA-18.2, et le journal de chaque changement.",
          excerpt: { file: ALARMS, region: "sensor-alarm-engine" },
        },
        {
          text: "Acquitter, côté service : le nom reçu est celui de la session.",
          excerpt: { file: SERVICE, region: "sensor-ack" },
        },
        {
          text: "La source gamma : réponse du détecteur calculée une fois, temps mort non paralysable.",
          excerpt: { file: GAMMA, region: "sensor-gamma-source" },
        },
        {
          text: "Le spectre entier, en `u32`, demandé une fois à l'abonnement.",
          excerpt: { file: SERVICE, region: "sensor-spectrum" },
        },
        {
          text: "Le cryostat : quatre étages, la condensation, la fuite.",
          excerpt: { file: CRYO, region: "sensor-cryostat" },
        },
        {
          text: "Bell : un réglage tiré à chaque paire, la mécanique quantique et un modèle local.",
          excerpt: { file: QUANTUM, region: "sensor-bell" },
        },
        {
          text: "Tomographie : des tirs ±1 dans trois bases, et les derniers gardés en bits.",
          excerpt: { file: QUANTUM, region: "sensor-tomography" },
        },
      ],
    },
    {
      layer: "front",
      blocks: [
        {
          text: "L'adresse, les canaux et leurs cadences, écrits UNE fois et importés des deux côtés.",
          excerpt: { file: SHARED, region: "sensor-shared" },
        },
        {
          text: "L'usine : machines, grandeurs, zones ISO 10816-3, et une fenêtre en 12 octets.",
          excerpt: { file: SHARED, region: "sensor-plant" },
        },
        {
          text: "Les alarmes : quatre états, un journal borné.",
          excerpt: { file: SHARED, region: "sensor-alarms" },
        },
        {
          text: "Le spectre : un canal touché en 4 octets, un canal entier en `u32`.",
          excerpt: { file: SHARED, region: "sensor-gamma" },
        },
        {
          text: "Le cryostat : un point en 24 octets, en temps accéléré.",
          excerpt: { file: SHARED, region: "sensor-cryo" },
        },
        {
          text: "Bell et la tomographie : réglages, compteurs, tirs bruts.",
          excerpt: { file: SHARED, region: "sensor-quantum" },
        },
        {
          text: "Le contrat qui type les deux bouts.",
          excerpt: { file: SHARED, region: "sensor-contract" },
        },
        {
          text: "La brique commune qui fait ces octets : un schéma, ses deux sens.",
          excerpt: { file: RECORDS, region: "kit-records" },
        },
        {
          text: "Une socket pour toute la page, qui offre CBOR.",
          excerpt: { file: CLIENT, region: "sensor-open" },
        },
        {
          text: "Un écran d'usine, à la cadence qu'il peut tenir : l'AIMD du framework.",
          excerpt: { file: CLIENT, region: "sensor-screen" },
        },
        {
          text: "Le réseau dégradé, simulé côté page.",
          excerpt: { file: CLIENT, region: "sensor-degraded" },
        },
        {
          text: "Relire une trame d'usine avec l'enregistrement qui l'a écrite.",
          excerpt: { file: CLIENT, region: "sensor-read-plant" },
        },
        {
          text: "Acquitter : l'identifiant, rien d'autre.",
          excerpt: { file: CLIENT, region: "sensor-ack-client" },
        },
        {
          text: "Le spectre : entier une fois, puis les canaux touchés.",
          excerpt: { file: CLIENT, region: "sensor-gamma-client" },
        },
        {
          text: "S et sa barre d'erreur, calculés dans la page.",
          excerpt: { file: STATS, region: "sensor-chsh" },
        },
        {
          text: "Le vecteur de Bloch estimé, projeté s'il sort de la sphère, et sa fidélité.",
          excerpt: { file: STATS, region: "sensor-bloch-estimate" },
        },
        {
          text: "La sphère en 3D : Three.js payé sur cette seule page.",
          excerpt: { file: VIEW, region: "sensor-bloch-view" },
        },
        {
          text: "Les tirs bruts : un bit par tir.",
          excerpt: { file: CLIENT, region: "sensor-shots-client" },
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
      region: "sensor-controller",
    },
    {
      name: "RealtimePolicy",
      from: "@nodefony/realtime",
      role: "ouvre les méthodes de LECTURE aux visiteurs sans session ; acquitter et régler la source restent fermés.",
      file: CONTROLLER,
      region: "sensor-controller",
    },
    {
      name: "Inject",
      from: "nodefony",
      role: "reçoit la sonde, la même pour toutes les connexions.",
      file: CONTROLLER,
      region: "sensor-controller",
    },
    {
      name: "route",
      from: "@nodefony/framework",
      role: "la route `WEBSOCKET` de la socket.",
      file: CONTROLLER,
      region: "sensor-controller",
    },
    {
      name: "RealtimeChannel",
      from: "@nodefony/realtime",
      role: "déclare un canal : sa fabrique tourne au premier abonné, son retour au départ du dernier.",
      file: CONTROLLER,
      region: "sensor-channels",
    },
  ],
  decoratedFiles: [CONTROLLER],
} as const satisfies ILesson;

/** Un extrait que la leçon cite : un geste qui en citerait un autre ne compile pas. */
export type SensorExcerpt =
  (typeof SENSOR_LESSON.tabs)[number]["blocks"][number]["excerpt"];
