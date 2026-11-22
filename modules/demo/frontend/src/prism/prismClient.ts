import { openGameSocket } from "../game/gameSocket";
import {
  droneRecord,
  PRISM_CHANNEL,
  PRISM_SOCKET,
  STEER_EVENT,
  type IPrismFrame,
  type IPrismSteer,
  type PrismContract,
} from "./prismDemo";

/**
 * Prisme — le code CLIENT : ouvrir la socket, suivre l'état, envoyer la direction.
 *
 * Guide pour un agent : le même squelette que `meteor/meteorClient.ts` — tout
 * le commun vient de `game/` ; seul le décodage des drones est propre à Prisme.
 */

/** Ouvre la socket de Prisme. */
export function openPrism() {
  return openGameSocket<PrismContract>(PRISM_SOCKET);
}

/** La socket de Prisme, typée par son contrat. */
export type PrismSocket = ReturnType<typeof openPrism>["socket"];

// #region prism-client
/** Une trame décodée : les compteurs, la grille, les drones relus des octets. */
export interface IPrismWorld {
  frame: IPrismFrame;
  drones: ReturnType<typeof droneRecord.read>;
}

/** Relit les drones d'une trame : UNE fois, à l'arrivée. La grille reste en octets. */
export function decodePrism(frame: IPrismFrame): IPrismWorld {
  return { frame, drones: droneRecord.read(frame.drones) };
}

/** Suit l'état du jeu ; la fonction rendue se désabonne et retire l'écouteur. */
export function watchPrism(
  socket: PrismSocket,
  onWorld: (world: IPrismWorld) => void,
): () => void {
  const off = socket.on(PRISM_CHANNEL, (frame) => onWorld(decodePrism(frame)));
  socket.subscribe(PRISM_CHANNEL);
  return () => {
    off();
    socket.unsubscribe(PRISM_CHANNEL);
  };
}

/** La direction du joueur. Aucune réponse attendue. */
export function sendSteer(socket: PrismSocket, steer: IPrismSteer): void {
  socket.emit(STEER_EVENT, steer);
}
// #endregion
