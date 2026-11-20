import { NodefonySocket } from "nodefony/client";
import * as nodefonyCbor from "nodefony/cbor";
import { wireTap, type IWireTap } from "../kit/probe";
import {
  ALARMS_CHANNEL,
  BELL_CHANNEL,
  CRYO_CHANNEL,
  GAMMA_CHANNEL,
  MACHINES,
  PLANT_CHANNEL,
  plantRate,
  QUANTITIES,
  SENSOR_SOCKET,
  TOMO_CHANNEL,
  countRecord,
  cryoRecord,
  deltaRecord,
  windowRecord,
  type IAlarmBoard,
  type IBellFrame,
  type ICryoFrame,
  type IGammaFrame,
  type IPlantWindow,
  type ITomoFrame,
  type SensorContract,
} from "./sensorDemo";

/**
 * Le code de la page de la sonde : ouvrir la socket, suivre chaque banc,
 * relire les octets, appeler les méthodes.
 *
 * Guide pour un agent : UNE socket CBOR pour toute la page, typée par le
 * contrat (`sensorDemo.ts`). Chaque banc s'abonne quand son onglet s'affiche
 * et se désabonne en le quittant : côté serveur, un banc que personne ne
 * regarde ne tourne pas. Les octets se relisent avec les MÊMES
 * enregistrements que ceux qui les ont écrits (`kit/records.ts`). L'usine
 * passe par `socket.adaptiveChannel()` de `nodefony/client` : l'AIMD du
 * framework, qui fait reculer un écran à la cadence qu'il peut tenir.
 */

// #region sensor-open
/** Ouvre la socket de la sonde ; `tap` compte ses trames pour la page. */
export function openSensor() {
  const tap: IWireTap = wireTap("cbor");
  const socket = NodefonySocket.fromContract<SensorContract>(
    {
      url: SENSOR_SOCKET,
      autoReconnect: true,
      codec: nodefonyCbor.CBOR_FRAME_CODEC,
    },
    tap.transport,
  );
  return { socket, tap };
}
// #endregion

/** La socket de la sonde, typée par son contrat. */
export type SensorSocket = ReturnType<typeof openSensor>["socket"];

/**
 * Attend que la socket soit connectée. Un abonnement part dès qu'elle l'est ;
 * une REQUÊTE envoyée avant échoue — d'où cette attente avant de demander
 * le spectre entier ou l'historique.
 */
export function whenConnected(socket: SensorSocket): Promise<void> {
  if (socket.state === "connected") return Promise.resolve();
  return new Promise((resolve) => {
    const off = socket.onState((state) => {
      if (state !== "connected") return;
      off();
      resolve();
    });
  });
}

/** Une série de l'usine, lue dans une trame : une valeur par fenêtre. */
export interface IPlantReading {
  machine: number;
  quantity: (typeof QUANTITIES)[number]["id"];
  min: number;
  max: number;
  mean: number;
}

/** Ce qu'un écran d'usine reçoit, relu. */
export interface IPlantScreenFrame {
  t: number;
  ms: number;
  n: number;
  bytes: number;
  readings: IPlantReading[];
}

/** Une valeur reçue du réseau est-elle une trame d'usine ? */
function isPlantWindow(value: unknown): value is IPlantWindow {
  return (
    typeof value === "object" &&
    value !== null &&
    "w" in value &&
    value.w instanceof Uint8Array &&
    "t" in value &&
    typeof value.t === "number" &&
    "ms" in value &&
    typeof value.ms === "number" &&
    "n" in value &&
    typeof value.n === "number"
  );
}

// #region sensor-read-plant
/** Relit une trame d'usine : machine par machine, grandeur par grandeur. */
export function readPlantWindow(frame: IPlantWindow): IPlantScreenFrame {
  const windows = windowRecord.read(frame.w);
  const readings = windows.map((window, i) => {
    const machine = MACHINES.at(Math.floor(i / QUANTITIES.length));
    const quantity = QUANTITIES.at(i % QUANTITIES.length);
    return {
      machine: machine?.id ?? 0,
      quantity: quantity?.id ?? "temperature",
      min: window.min,
      max: window.max,
      mean: window.mean,
    };
  });
  return {
    t: frame.t,
    ms: frame.ms,
    n: frame.n,
    bytes: frame.w.byteLength,
    readings,
  };
}
// #endregion

// #region sensor-screen
/**
 * Un écran d'usine : il s'abonne à la cadence qu'il DÉSIRE, et l'AIMD du
 * framework le fait reculer d'un cran dès que les trames arrivent en retard,
 * puis remonter quand le réseau redevient sain. Chaque cadence est un canal
 * distinct (`sensor:plant:4000`) : un écran lent ne retient pas les autres.
 *
 * @param network - le réseau tel que CET écran le voit ; `degradedNetwork()`
 *   le simule, `undefined` = la vraie horloge
 * @returns l'arrêt de l'écran (désabonnement)
 */
export function watchPlant(
  socket: SensorSocket,
  desiredMs: number,
  onFrame: (frame: IPlantScreenFrame) => void,
  onRate: (ms: number) => void,
  network?: () => number,
): () => void {
  const binding = socket.adaptiveChannel(
    PLANT_CHANNEL,
    (payload: unknown) => {
      if (isPlantWindow(payload)) onFrame(readPlantWindow(payload));
    },
    {
      intervalMs: desiredMs,
      defaultMs: plantRate.default,
      maxMs: plantRate.max,
      onRate: (ms) => onRate(ms),
      ...(network === undefined ? {} : { clock: network }),
    },
  );
  return () => binding.dispose();
}
// #endregion

// #region sensor-degraded
/**
 * Un réseau DÉGRADÉ, simulé côté page : chaque trame est vue avec un retard
 * qui varie (0 à 3,6 s). L'AIMD, lui, est le vrai code du framework : il ne
 * sait pas que le retard est simulé, il le mesure.
 */
export function degradedNetwork(): () => number {
  return () => {
    const now = performance.now();
    return now + 1800 * (1 + Math.sin(now / 900));
  };
}
// #endregion

/** Suit un canal d'état ; rend l'arrêt. */
function follow<T>(
  socket: SensorSocket,
  channel: string,
  guard: (value: unknown) => value is T,
  onFrame: (frame: T) => void,
): () => void {
  socket.subscribe(channel);
  const off = socket.on(channel, (payload: unknown) => {
    if (guard(payload)) onFrame(payload);
  });
  return () => {
    off();
    socket.unsubscribe(channel);
  };
}

/** Garde de forme minimale : un objet qui porte ces clés. */
function hasKeys(value: unknown, keys: readonly string[]): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    keys.every((key) => key in value)
  );
}

const isBoard = (v: unknown): v is IAlarmBoard =>
  hasKeys(v, ["alarms", "journal"]);
const isGamma = (v: unknown): v is IGammaFrame =>
  hasKeys(v, ["d", "live", "real"]);
const isCryo = (v: unknown): v is ICryoFrame =>
  hasKeys(v, ["point", "run", "phase"]);
const isBell = (v: unknown): v is IBellFrame =>
  hasKeys(v, ["quantum", "local", "run"]);
const isTomo = (v: unknown): v is ITomoFrame =>
  hasKeys(v, ["n", "plus", "run"]);

/** Les alarmes et leur journal. */
export function watchAlarms(
  socket: SensorSocket,
  onBoard: (board: IAlarmBoard) => void,
): () => void {
  return follow(socket, ALARMS_CHANNEL, isBoard, onBoard);
}

// #region sensor-ack-client
/**
 * Acquitter : la page n'envoie QUE l'identifiant. Sans session, le serveur
 * refuse avant d'entrer dans l'action.
 */
export async function acknowledge(
  socket: SensorSocket,
  id: string,
): Promise<boolean> {
  const { ok } = await socket.request("sensor:ack", { id });
  return ok;
}
// #endregion

// #region sensor-gamma-client
/**
 * Le spectre : le spectre ENTIER une fois (`u32` par canal), puis seulement
 * les canaux touchés, ajoutés au cumul local.
 */
export async function watchGamma(
  socket: SensorSocket,
  onSpectrum: (counts: Uint32Array, frame: IGammaFrame | null) => void,
): Promise<() => void> {
  const counts = new Uint32Array(1024);
  const stop = follow(socket, GAMMA_CHANNEL, isGamma, (frame) => {
    for (const { channel, count } of deltaRecord.read(frame.d)) {
      counts[channel] = (counts[channel] ?? 0) + count;
    }
    onSpectrum(counts, frame);
  });
  try {
    await whenConnected(socket);
    const whole = await socket.request("sensor:spectrum", {});
    countRecord.read(whole.s).forEach(({ count }, channel) => {
      counts[channel] = Math.max(counts[channel] ?? 0, count);
    });
    onSpectrum(counts, null);
  } catch {
    // Sans le cumul, les canaux touchés continuent d'arriver : l'arrêt reste rendu.
  }
  return stop;
}
// #endregion

/** Régler l'activité de la source (session requise). */
export async function setSourceRate(
  socket: SensorSocket,
  rate: number,
): Promise<number> {
  return (await socket.request("sensor:source", { rate })).rate;
}

/** Un point du cryostat, relu. */
export type CryoPoint = ReturnType<typeof cryoRecord.read>[number];

/** Le cryostat : l'historique du run en cours, puis un point à chaque trame. */
export async function watchCryo(
  socket: SensorSocket,
  onPoints: (
    run: number,
    points: readonly CryoPoint[],
    frame: ICryoFrame | null,
  ) => void,
): Promise<() => void> {
  let run = -1;
  let points: CryoPoint[] = [];
  const stop = follow(socket, CRYO_CHANNEL, isCryo, (frame) => {
    if (frame.run !== run) {
      run = frame.run;
      points = [];
    }
    points = [...points, ...cryoRecord.read(frame.point)];
    onPoints(run, points, frame);
  });
  try {
    await whenConnected(socket);
    const history = await socket.request("sensor:cryo:history", {});
    if (run === -1 || run === history.run) {
      run = history.run;
      const known = cryoRecord.read(history.points);
      const last = known.at(-1)?.h ?? 0;
      points = [...known, ...points.filter((p) => p.h > last)];
      onPoints(run, points, null);
    }
  } catch {
    // Sans l'historique, les points arrivent quand même : l'arrêt reste rendu.
  }
  return stop;
}

/** Le test de Bell : les compteurs cumulés. */
export function watchBell(
  socket: SensorSocket,
  onFrame: (frame: IBellFrame) => void,
): () => void {
  return follow(socket, BELL_CHANNEL, isBell, onFrame);
}

/** La tomographie : les compteurs par base. */
export function watchTomo(
  socket: SensorSocket,
  onFrame: (frame: ITomoFrame) => void,
): () => void {
  return follow(socket, TOMO_CHANNEL, isTomo, onFrame);
}

// #region sensor-shots-client
/** Les 1 000 derniers tirs d'une base, un bit par tir : 125 octets. */
export async function rawShots(socket: SensorSocket, basis: 0 | 1 | 2) {
  return socket.request("sensor:tomo:shots", { basis });
}
// #endregion
