import { NodefonySocket, type RealtimeTransportFactory } from "nodefony/client";
import * as nodefonyCbor from "nodefony/cbor";
import {
  BINARY_SOCKET,
  GAME_CHANNEL,
  SAMPLE_SIZES,
  VIBRATION_CHANNEL,
  type BinaryContract,
  type IDigest,
} from "./binaryDemo";

/**
 * Temps réel binaire — le code CLIENT de chaque geste, celui qui tourne quand
 * on clique. La sonde de la page (`kit/probe.ts`, `probeRealtime`) ne fait
 * que donner un transport qui COMPTE les trames ; tout le reste est ici.
 *
 * Guide pour un agent : une région `client-*` par geste, citée par la leçon.
 * Chaque geste REÇOIT sa socket : la page lui passe celle qu'elle garde
 * ouverte (CBOR, visible dans la barre de debug), ou une socket texte ouverte
 * le temps d'une comparaison (`withSocket`). `transport` n'est là que pour la
 * mesure : une application l'omet.
 */

/** Au-delà, un geste abandonne. */
const GESTURE_TIMEOUT_MS = 10_000;

/** La promesse, ou une erreur qui dit ce qui n'est pas venu. */
function within<T>(promise: Promise<T>, what: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () =>
        reject(new Error(`${what} : rien en ${GESTURE_TIMEOUT_MS / 1000} s`)),
      GESTURE_TIMEOUT_MS,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

// #region client-open
/**
 * La socket de la démo, typée par le contrat partagé. `codec` est l'OFFRE :
 * le serveur choisit, et l'annonce dans son accueil. Sans offre, la
 * connexion reste en texte — et les octets arrivent quand même en
 * `Uint8Array`. Une application en ouvre UNE et la garde ;
 * `NodefonySocket.shared()` le fait pour elle, mais fige ses réglages à sa
 * première création — d'où une socket à part pour cette adresse.
 */
export function openBinary(
  cbor: boolean,
  transport?: RealtimeTransportFactory,
) {
  return NodefonySocket.fromContract<BinaryContract>(
    {
      url: BINARY_SOCKET,
      autoReconnect: false,
      codec: cbor ? nodefonyCbor.CBOR_FRAME_CODEC : undefined,
    },
    transport,
  );
}

/** Une socket de la démo, typée par le contrat. */
export type BinarySocket = ReturnType<typeof openBinary>;

/** Se connecte et attend l'ACCUEIL : c'est lui qui annonce le codec retenu. */
export async function connectBinary(socket: NodefonySocket): Promise<void> {
  const welcomed = new Promise<void>((resolve) => {
    const off = socket.onIdentity(() => {
      off();
      resolve();
    });
  });
  await socket.connect();
  await within(welcomed, "accueil du serveur");
}

/** Se (re)connecte seulement si la socket ne l'est pas — après un 1009, par exemple. */
export async function ensureConnected(socket: NodefonySocket): Promise<void> {
  if (socket.state !== "connected") await connectBinary(socket);
}

/** Une socket ouverte le temps de `use`, puis fermée — même en échec. */
export async function withSocket<T>(
  cbor: boolean,
  transport: RealtimeTransportFactory | undefined,
  use: (socket: BinarySocket) => Promise<T>,
): Promise<T> {
  const socket = openBinary(cbor, transport);
  try {
    return await use(socket);
  } finally {
    socket.disconnect();
  }
}
// #endregion

// #region client-negotiate
/**
 * Négocier : se connecter, lire `socket.codec` — le sous-protocole retenu.
 * `nodefony.jsonrpc.cbor.v1` : binaire ; `nodefony.jsonrpc.v1` : texte.
 */
export async function negotiate(socket: BinarySocket): Promise<string> {
  await ensureConnected(socket);
  return socket.codec;
}
// #endregion

// #region client-vibration
/**
 * Lire 256 Int16 petit-boutistes. `DataView` sur la TRANCHE reçue
 * (`byteOffset`, `byteLength`) : un `Uint8Array` ne commence pas toujours
 * au début de son tampon.
 */
export function readSamples(bytes: Uint8Array): Int16Array {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const samples = new Int16Array(bytes.byteLength / 2);
  for (let i = 0; i < samples.length; i += 1) {
    samples[i] = view.getInt16(i * 2, true);
  }
  return samples;
}

/**
 * INDUSTRIE : suivre `frames` trames de vibrations, puis se désabonner et
 * retirer l'écouteur — la socket, elle, reste ouverte.
 */
export async function watchVibration(
  socket: BinarySocket,
  frames: number,
  onFrame: (rpm: number, samples: Int16Array) => void,
): Promise<number> {
  await ensureConnected(socket);
  let seen = 0;
  let off = () => {};
  const done = new Promise<void>((resolve) => {
    off = socket.on(VIBRATION_CHANNEL, ({ rpm, samples }) => {
      onFrame(rpm, readSamples(samples));
      seen += 1;
      if (seen === frames) resolve();
    });
  });
  socket.subscribe(VIBRATION_CHANNEL);
  try {
    await within(done, "trames de vibrations");
    return seen;
  } finally {
    socket.unsubscribe(VIBRATION_CHANNEL);
    off();
  }
}
// #endregion

// #region client-measure
/**
 * Demander chaque taille de `SAMPLE_SIZES`, une à la fois. Le code ne mesure
 * rien : c'est le transport compteur de la page qui voit la trame de chaque
 * réponse passer.
 */
export async function requestSizes(socket: BinarySocket): Promise<number> {
  await ensureConnected(socket);
  let received = 0;
  for (const size of SAMPLE_SIZES) {
    const { bytes } = await socket.request("binary:sample", { size });
    received += bytes.byteLength;
  }
  return received;
}
// #endregion

// #region client-send
/** Le dessin du canevas, en PNG : les octets d'un vrai fichier. */
export async function canvasPng(
  canvas: HTMLCanvasElement,
): Promise<Uint8Array<ArrayBuffer>> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
  if (blob === null) throw new Error("le canevas n'a rien rendu");
  return new Uint8Array(await blob.arrayBuffer());
}

/** L'empreinte SHA-256 en hexadécimal, calculée par le navigateur. */
export async function sha256(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * ENVOYER des octets : un `Uint8Array` dans les paramètres d'une méthode,
 * rien de plus. Le serveur rend leur taille et leur empreinte ; la page
 * calcule la sienne — même empreinte, mêmes octets. Si le serveur ferme la
 * connexion, la promesse rejette tout de suite : sa réponse ne viendra plus.
 */
export async function sendBytes(
  socket: BinarySocket,
  bytes: Uint8Array<ArrayBuffer>,
): Promise<{ server: IDigest; local: string }> {
  await ensureConnected(socket);
  let off = () => {};
  const lost = new Promise<never>((_resolve, reject) => {
    off = socket.onState((state) => {
      if (state === "error" || state === "disconnected") {
        reject(new Error("connexion fermée par le serveur"));
      }
    });
  });
  try {
    const server = await within(
      Promise.race([socket.request("binary:digest", { bytes }), lost]),
      "empreinte du serveur",
    );
    return { server, local: await sha256(bytes) };
  } finally {
    off();
  }
}
// #endregion

// #region client-limit
/**
 * Envoyer `size` octets, et dire ce qui est arrivé. Au-delà de `maxPayload`,
 * le serveur ferme la connexion (code 1009) au lieu de répondre : la trame
 * n'a jamais atteint l'action. Le geste suivant rouvre la socket.
 */
export async function trySize(
  socket: BinarySocket,
  size: number,
): Promise<string> {
  try {
    const { server } = await sendBytes(socket, new Uint8Array(size));
    return `reçu par le serveur : ${server.size} octets`;
  } catch (error) {
    return `refusé : ${error instanceof Error ? error.message : String(error)}`;
  }
}
// #endregion

// #region client-game
/** Lire 64 × (x, y) Float32 petit-boutistes, entrelacés. */
export function readPositions(bytes: Uint8Array): Float32Array {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const positions = new Float32Array(bytes.byteLength / 4);
  for (let i = 0; i < positions.length; i += 1) {
    positions[i] = view.getFloat32(i * 4, true);
  }
  return positions;
}

/** JEU : suivre `frames` images, puis se désabonner et retirer l'écouteur. */
export async function watchGame(
  socket: BinarySocket,
  frames: number,
  onFrame: ((positions: Float32Array) => void) | null,
): Promise<number> {
  await ensureConnected(socket);
  let seen = 0;
  let off = () => {};
  const done = new Promise<void>((resolve) => {
    off = socket.on(GAME_CHANNEL, ({ positions }) => {
      onFrame?.(readPositions(positions));
      seen += 1;
      if (seen === frames) resolve();
    });
  });
  socket.subscribe(GAME_CHANNEL);
  try {
    await within(done, "images du jeu");
    return seen;
  } finally {
    socket.unsubscribe(GAME_CHANNEL);
    off();
  }
}
// #endregion

// #region client-traps
/**
 * Un objet `{ $bytes: "…" }` sur une connexion TEXTE : le client le
 * relirait en octets. L'encodeur refuse de l'envoyer — `TypeError` à la
 * ligne fautive. Avec une seconde clé, l'objet part ; c'est alors le schéma
 * du serveur qui refuse ce qui n'est pas un `Uint8Array`. Socket sans
 * contrat : le contrat, lui, n'aurait pas laissé écrire l'appel.
 */
export async function forgeBytes(
  extraKey: boolean,
  transport?: RealtimeTransportFactory,
): Promise<string> {
  const socket = new NodefonySocket(
    { url: BINARY_SOCKET, autoReconnect: false },
    transport,
  );
  try {
    await connectBinary(socket);
    const forged = extraKey
      ? { $bytes: "AQID", note: "deux clés" }
      : { $bytes: "AQID" };
    await socket.request("binary:digest", { bytes: forged });
    return "accepté";
  } catch (error) {
    return error instanceof Error
      ? `${error.name} : ${error.message}`
      : String(error);
  } finally {
    socket.disconnect();
  }
}
// #endregion
