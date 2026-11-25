import { NodefonySocket } from "nodefony/client";
import { DEMO_REALTIME_PATH, type DemoContract } from "../pulse";
import {
  TELEMETRY_CHANNEL,
  TELEMETRY_LATEST_PATH,
  TELEMETRY_PUSH_PATH,
  TELEMETRY_SERVICE,
  TELEMETRY_STATE,
  type ITelemetryState,
  type TelemetryEvent,
} from "./grpcDemo";

/**
 * Le code de la page « gRPC » : suivre la machine par la socket de la démo,
 * et appeler le service gRPC avec un simple `fetch`.
 *
 * Guide pour un agent : la page n'embarque AUCUNE bibliothèque gRPC. Elle
 * suit les mesures par la socket CBOR de la démo (`/demo/realtime`, typée par
 * `DemoContract`), et ne parle au service qu'avec `fetch` : gRPC-Web (octets
 * écrits à la main) et Connect (`GET` en JSON pour `Latest`, déclarée sans
 * effet de bord ; `POST` pour montrer le refus de `Push`). Chaque fonction rend la
 * `Request` préparée : la sonde de la page (`kit/probe.ts`) l'envoie et
 * montre ce qui revient. Les blocs `// #region` sont CITÉS par la page.
 */

// #region client-follow
/** Ouvre la socket de la démo, typée par son contrat. */
export function openTelemetry() {
  return NodefonySocket.fromContract<DemoContract>({
    url: DEMO_REALTIME_PATH,
  });
}

/** La socket de la page gRPC. */
export type TelemetrySocket = ReturnType<typeof openTelemetry>;

/**
 * Suit les machines : chaque mesure, chaque flux qui s'ouvre ou se ferme.
 * L'état courant se DEMANDE à chaque connexion (une page qui arrive, une
 * socket qui revient) ; le canal ne porte ensuite que ce qui change.
 *
 * @returns de quoi arrêter de suivre, en quittant la page
 */
export function followTelemetry(
  socket: TelemetrySocket,
  onEvent: (event: TelemetryEvent) => void,
  onState: (state: ITelemetryState) => void,
): () => void {
  const refresh = () => {
    socket
      .request(TELEMETRY_STATE, {})
      .then(onState)
      .catch(() => {
        // Socket tombée entre-temps : la reconnexion redemande l'état.
      });
  };
  socket.subscribe(TELEMETRY_CHANNEL);
  const offEvent = socket.on(TELEMETRY_CHANNEL, onEvent);
  const offState = socket.onState((state) => {
    if (state === "connected") refresh();
  });
  if (socket.state === "connected") refresh();
  return () => {
    offEvent();
    offState();
    socket.unsubscribe(TELEMETRY_CHANNEL);
  };
}
// #endregion

// #region client-latest-json
/**
 * `Latest` en Connect, la forme ordinaire d'un appel unaire : un `POST`,
 * le message en JSON dans le corps, la réponse en JSON.
 */
export function latestPost(machine: string): Request {
  return new Request(TELEMETRY_LATEST_PATH, {
    method: "POST",
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      "connect-protocol-version": "1",
    },
    body: JSON.stringify({ machine }),
  });
}

/**
 * `Latest` en `GET`, en JSON : le message part dans l'adresse. C'est le
 * protocole Connect, que le serveur sert d'office à côté de gRPC, pour une
 * méthode déclarée `NO_SIDE_EFFECTS` — un cache et `curl` savent la lire.
 */
export function latestJson(machine: string): Request {
  const query = new URLSearchParams({
    connect: "v1",
    encoding: "json",
    message: JSON.stringify({ machine }),
  });
  return new Request(`${TELEMETRY_LATEST_PATH}?${query}`, {
    cache: "no-store",
  });
}
// #endregion

// #region client-grpc-web
/** L'enveloppe de CHAQUE message gRPC : un octet de drapeau, quatre de longueur. */
export const GRPC_ENVELOPE_BYTES = 5;

/**
 * `Latest` en gRPC-Web, avec `fetch` et sans bibliothèque. Le corps est un
 * message gRPC tel qu'il voyage : l'enveloppe, puis `LatestRequest` en
 * protobuf. La réponse revient en octets : la mesure, enveloppée de même,
 * puis un message de FIN qui porte le statut (`grpc-status`) — c'est ce que
 * gRPC-Web change au gRPC natif, dont le statut voyage dans des en-têtes de
 * fin HTTP/2 qu'un navigateur ne lit pas.
 */
export function latestGrpcWeb(machine: string): Request {
  return new Request(TELEMETRY_LATEST_PATH, {
    method: "POST",
    cache: "no-store",
    headers: {
      "content-type": "application/grpc-web+proto",
      "x-grpc-web": "1",
    },
    body: envelope(encodeLatestRequest(machine)),
  });
}

/** Précède `message` de l'enveloppe : drapeau 0 (non compressé), puis sa longueur en gros-boutiste. */
export function envelope(message: Uint8Array): Uint8Array<ArrayBuffer> {
  const frame = new Uint8Array(GRPC_ENVELOPE_BYTES + message.byteLength);
  new DataView(frame.buffer).setUint32(1, message.byteLength);
  frame.set(message, GRPC_ENVELOPE_BYTES);
  return frame;
}

/**
 * `LatestRequest { machine }` en protobuf, écrit à la main : la clé du
 * champ, la longueur, le texte. Trois morceaux, rien de magique.
 */
export function encodeLatestRequest(machine: string): Uint8Array<ArrayBuffer> {
  const text = new TextEncoder().encode(machine);
  const length = varint(text.byteLength);
  const out = new Uint8Array(1 + length.byteLength + text.byteLength);
  // Clé du champ : (numéro 1 << 3) | type 2 (longueur) = 0x0a.
  out[0] = 0x0a;
  out.set(length, 1);
  out.set(text, 1 + length.byteLength);
  return out;
}
// #endregion

/** Un entier positif en varint protobuf : 7 bits par octet, le bit haut dit « la suite ». */
function varint(value: number): Uint8Array {
  const bytes: number[] = [];
  let rest = value;
  while (rest > 0x7f) {
    bytes.push((rest & 0x7f) | 0x80);
    rest >>>= 7;
  }
  bytes.push(rest);
  return Uint8Array.from(bytes);
}

// #region client-refused
/**
 * `Push` sans jeton, comme une machine qui aurait oublié le sien. `Push` est
 * un flux CLIENT : Connect l'écrit en `POST` d'un corps de messages
 * enveloppés ; vide ici, la machine n'a rien à dire. Le refus revient dans
 * le message de FIN du flux, en 200 — c'est la règle des flux Connect.
 */
export function pushWithoutToken(): Request {
  return new Request(TELEMETRY_PUSH_PATH, {
    method: "POST",
    cache: "no-store",
    headers: {
      "content-type": "application/connect+json",
      "connect-protocol-version": "1",
    },
    body: new Uint8Array(0),
  });
}

/** `Push` en `GET` : refusé, une méthode qui écrit ne se lit pas par l'adresse. */
export function pushByGet(): Request {
  return new Request(
    `${TELEMETRY_PUSH_PATH}?connect=v1&encoding=json&message=%7B%7D`,
    { cache: "no-store" },
  );
}

/** Une méthode que le contrat ne déclare pas : le service n'en sait rien. */
export function unknownMethod(): Request {
  return new Request(`/${TELEMETRY_SERVICE}/Reset`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      "connect-protocol-version": "1",
    },
    body: "{}",
  });
}
// #endregion
