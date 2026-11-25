import { z } from "zod";
import type { IRealtimeContract } from "nodefony/client";
import { defineRecord } from "../kit/records";

/**
 * Sonde — ce que le serveur et la page partagent : l'adresse de la socket, les
 * canaux, les constantes physiques de chaque banc, le contrat qui type les deux
 * bouts, et la forme de chaque mesure en OCTETS (écrite par le serveur, lue
 * par la page).
 *
 * Guide pour un agent : importé par `SensorService.ts`, `SensorController.ts`
 * ET par la page (`sensorClient.ts`). Les enregistrements binaires viennent de
 * la brique commune de la démo (`kit/records.ts`). Les données sont SIMULÉES
 * selon la physique ; le transport, l'enregistrement et l'affichage sont
 * réels. Nodefony tient la SUPERVISION : le déclenchement, la lecture des
 * détecteurs et les verrouillages restent au matériel.
 */

// #region sensor-shared
/** Préfixe des routes de la sonde. */
export const SENSOR_PATH = "/demo/api/sensor";

/** La socket de la sonde, dédiée : ses trames ne se mêlent pas aux autres. */
export const SENSOR_SOCKET = `${SENSOR_PATH}/realtime`;

/** Fréquence d'acquisition, côté serveur : chaque tour lit tous les capteurs. */
export const ACQUISITION_HZ = 50;

/** Fréquence des bancs de laboratoire (spectre, Bell, tomographie). */
export const LAB_HZ = 10;

/**
 * L'usine, canal CADENCÉ : `sensor:plant` (1 s) ou `sensor:plant:<ms>`.
 * Chaque cadence reçoit la réduction (min, max, moyenne) de SA période.
 */
export const PLANT_CHANNEL = "sensor:plant";

/** Le serveur garde la main : jamais plus vite que 100 ms, jamais plus lent que 10 s. */
export const plantRate = { default: 1000, min: 100, max: 10_000 } as const;

/** Les alarmes et leur journal, poussés à chaque changement. */
export const ALARMS_CHANNEL = "sensor:alarms";

/** Le spectre gamma : les canaux touchés depuis la trame précédente. */
export const GAMMA_CHANNEL = "sensor:gamma";

/** Le cryostat : un point de mesure en temps accéléré. */
export const CRYO_CHANNEL = "sensor:cryo";

/** Le test de Bell : les compteurs cumulés du run. */
export const BELL_CHANNEL = "sensor:bell";

/** La tomographie : les compteurs cumulés par base. */
export const TOMO_CHANNEL = "sensor:tomo";
// #endregion

// #region sensor-plant
/** Les machines de l'atelier, dans l'ordre de la trame. */
export const MACHINES = [
  { id: 1, name: "Pompe P-101" },
  { id: 2, name: "Compresseur C-201" },
  { id: 3, name: "Ventilateur V-301" },
  { id: 4, name: "Broyeur B-401" },
] as const;

/** Les grandeurs mesurées sur chaque machine, dans l'ordre de la trame. */
export const QUANTITIES = [
  { id: "temperature", label: "Température", unit: "°C" },
  { id: "vibration", label: "Vibration", unit: "mm/s RMS" },
  { id: "current", label: "Courant", unit: "A" },
] as const;

/**
 * Limites de zone de la vibration, ISO 10816-3 (machine rigide, groupe 2), en
 * mm/s RMS : A/B, B/C, C/D. L'alarme se lève à l'entrée en zone C.
 */
export const vibrationZones = { ab: 2.3, bc: 4.5, cd: 7.1 } as const;

/** Marge de retombée de l'alarme de vibration, en mm/s. */
export const VIBRATION_HYSTERESIS = 0.3;

/** L'alarme se juge sur la moyenne glissante de cette durée, jamais sur un échantillon. */
export const ALARM_WINDOW_MS = 1000;

/** Une série réduite sur une fenêtre : 12 octets. */
export const windowRecord = defineRecord([
  { name: "min", type: "f32" },
  { name: "max", type: "f32" },
  { name: "mean", type: "f32" },
] as const);

/**
 * Une trame d'usine : une fenêtre par série, machine par machine, grandeur par
 * grandeur (`MACHINES.length × QUANTITIES.length` enregistrements).
 */
export interface IPlantWindow {
  seq: number;
  /** Fin de la fenêtre, horloge d'acquisition du serveur (ms depuis l'époque). */
  t: number;
  /** Durée de la fenêtre, en millisecondes : la cadence de CE canal. */
  ms: number;
  /** Échantillons réduits par série. */
  n: number;
  w: Uint8Array;
}
// #endregion

// #region sensor-alarms
/**
 * Les états d'une alarme, ISA-18.2 / IEC 62682 : normale ; active non
 * acquittée ; active acquittée ; revenue à la normale sans avoir été acquittée.
 */
export type AlarmState =
  "normal" | "unacknowledged" | "acknowledged" | "returned";

/** Une alarme de la supervision, telle que tous les écrans la voient. */
export interface IAlarm {
  id: string;
  /** Ce qui la porte, lisible : « M3 · Vibration ». */
  source: string;
  state: AlarmState;
  /** Dernière valeur jugée (moyenne glissante), et le seuil franchi. */
  value: number;
  limit: number;
  unit: string;
  /** Instant du dernier changement d'état (ms depuis l'époque). */
  since: number;
  /** Qui l'a acquittée — l'identité de la session, jamais un nom envoyé par la page. */
  ackBy: string | null;
}

/** Une ligne du journal : un changement d'état, et qui l'a fait. */
export interface IAlarmEvent {
  seq: number;
  t: number;
  id: string;
  source: string;
  state: AlarmState;
  value: number;
  by: string | null;
}

/** Ce que pousse `sensor:alarms` : les alarmes et le journal récent. */
export interface IAlarmBoard {
  alarms: IAlarm[];
  journal: IAlarmEvent[];
}

/** Lignes gardées au journal : les plus anciennes sortent. */
export const JOURNAL_SIZE = 50;

/** Acquitter une alarme : son identifiant, rien d'autre. */
export const AckParams = z.strictObject({ id: z.string().min(1).max(64) });
// #endregion

// #region sensor-gamma
/** Analyseur multicanal : 1 024 canaux de 1,5 keV (0 à 1 536 keV). */
export const MCA_CHANNELS = 1024;
export const KEV_PER_CHANNEL = 1.5;

/** Temps mort non paralysable de la chaîne, en microsecondes. */
export const DEAD_TIME_US = 4;

/** Activité de la source, en coups VRAIS par seconde. */
export const sourceRate = {
  min: 1_000,
  max: 200_000,
  default: 20_000,
} as const;

/** Un canal touché : son numéro et ses coups depuis la trame précédente, 4 octets. */
export const deltaRecord = defineRecord([
  { name: "channel", type: "u16" },
  { name: "count", type: "u16" },
] as const);

/** Un canal du spectre entier : son compte cumulé, 4 octets. */
export const countRecord = defineRecord([
  { name: "count", type: "u32" },
] as const);

/** Une trame du spectre : seulement les canaux touchés (`deltaRecord`). */
export interface IGammaFrame {
  seq: number;
  /** Coups vrais par seconde (réglage de la source). */
  trueRate: number;
  /** Coups mesurés par seconde, après temps mort. */
  measuredRate: number;
  /** Temps vif et temps d'horloge depuis la remise à zéro, en secondes. */
  live: number;
  real: number;
  d: Uint8Array;
}

/** Le spectre entier, demandé à l'abonnement (`countRecord` × `MCA_CHANNELS`). */
export interface IGammaSpectrum {
  trueRate: number;
  live: number;
  real: number;
  s: Uint8Array;
}

/** Régler l'activité de la source : réservé à une session. */
export const SourceParams = z.strictObject({
  rate: z.number().int().min(sourceRate.min).max(sourceRate.max),
});
// #endregion

// #region sensor-cryo
/** Le temps du cryostat défile 600 fois plus vite : 32 h en 3 min 12 s. */
export const CRYO_ACCELERATION = 600;

/** Durée d'une mise en froid complète, en heures simulées. */
export const CRYO_HOURS = 32;

/** Points du cryostat publiés par seconde réelle. */
export const CRYO_HZ = 2;

/** Alarme de la chambre de mélange : au-dessus de 50 mK, retombée sous 45 mK. */
export const MXC_ALARM_K = 0.05;
export const MXC_HYSTERESIS_K = 0.005;

/** Un point du cryostat : heure simulée, quatre étages en kelvins, vide en mbar. 24 octets. */
export const cryoRecord = defineRecord([
  { name: "h", type: "f32" },
  { name: "t50", type: "f32" },
  { name: "t4", type: "f32" },
  { name: "still", type: "f32" },
  { name: "mxc", type: "f32" },
  { name: "ovc", type: "f32" },
] as const);

/** La phase de la mise en froid, pour l'affichage. */
export type CryoPhase = "cooldown" | "condensing" | "base" | "leak";

/** Une trame du cryostat : la phase et le point courant (`cryoRecord`). */
export interface ICryoFrame {
  seq: number;
  run: number;
  phase: CryoPhase;
  point: Uint8Array;
}
// #endregion

// #region sensor-quantum
/** Bell (CHSH) : polariseurs a, a′ et b, b′, en degrés. */
export const bellAngles = { a: [0, 45], b: [22.5, 67.5] } as const;

/** Visibilité de la source de paires : une vraie source n'atteint pas 2√2. */
export const BELL_VISIBILITY = 0.96;

/** Paires détectées par seconde, et paires d'un run avant de recommencer. */
export const BELL_PAIRS_PER_SECOND = 2000;
export const BELL_RUN_PAIRS = 200_000;

/** Quatre réglages, dans l'ordre (a,b) (a,b′) (a′,b) (a′,b′). */
export type BellQuad = [number, number, number, number];

/** Compteurs d'un modèle : paires par réglage, et somme des produits ±1. */
export interface IBellCounts {
  n: BellQuad;
  s: BellQuad;
}

/** Une trame de Bell : la mécanique quantique et un modèle local, mêmes réglages. */
export interface IBellFrame {
  seq: number;
  run: number;
  quantum: IBellCounts;
  local: IBellCounts;
}

/** Tomographie : l'état préparé (θ, φ en degrés) et sa dépolarisation. */
export const tomoTarget = { theta: 60, phi: 45 } as const;
export const TOMO_DEPOLARIZATION = 0.05;

/** Tirs par base et par seconde, et tirs par base d'un run. */
export const TOMO_SHOTS_PER_SECOND = 300;
export const TOMO_RUN_SHOTS = 10_000;

/** Tirs bruts gardés par base, pour qui les demande. */
export const TOMO_RAW_SHOTS = 1000;

/** Trois bases, dans l'ordre X, Y, Z. */
export type TomoTriple = [number, number, number];

/** Une trame de tomographie : tirs et résultats « + » par base, cumulés. */
export interface ITomoFrame {
  seq: number;
  run: number;
  n: TomoTriple;
  plus: TomoTriple;
}

/** Demander les tirs bruts d'une base : X = 0, Y = 1, Z = 2. */
export const ShotsParams = z.strictObject({
  basis: z.union([z.literal(0), z.literal(1), z.literal(2)]),
});

/** Les derniers tirs d'une base, un bit par tir (1 = résultat « + »). */
export interface ITomoShots {
  basis: 0 | 1 | 2;
  count: number;
  bits: Uint8Array;
}
// #endregion

// #region sensor-contract
export interface SensorContract extends IRealtimeContract {
  serverToClient: {
    "sensor:plant": IPlantWindow;
    "sensor:alarms": IAlarmBoard;
    "sensor:gamma": IGammaFrame;
    "sensor:cryo": ICryoFrame;
    "sensor:bell": IBellFrame;
    "sensor:tomo": ITomoFrame;
  };
  serverMethods: {
    "sensor:ack": { in: z.infer<typeof AckParams>; out: { ok: boolean } };
    "sensor:source": {
      in: z.infer<typeof SourceParams>;
      out: { rate: number };
    };
    "sensor:spectrum": { in: Record<string, never>; out: IGammaSpectrum };
    "sensor:cryo:history": {
      in: Record<string, never>;
      out: { run: number; points: Uint8Array };
    };
    "sensor:tomo:shots": { in: z.infer<typeof ShotsParams>; out: ITomoShots };
  };
}
// #endregion
