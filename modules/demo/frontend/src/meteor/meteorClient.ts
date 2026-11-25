import { openGameSocket } from "../game/gameSocket";
import {
  AIM_EVENT,
  boomRecord,
  cannonRecord,
  METEOR_CHANNEL,
  meteorRecord,
  METEOR_SOCKET,
  shotRecord,
  type IMeteorAim,
  type IMeteorFrame,
  type MeteorContract,
} from "./meteorDemo";

/**
 * Météores — le code CLIENT : ouvrir la socket, suivre l'état, envoyer la visée.
 *
 * Guide pour un agent : tout ce qui est commun aux jeux vient de `game/`
 * (socket, interpolation, envoi des commandes, fil mesuré) ; ce fichier ne
 * porte que ce qui est propre à Météores — décoder SES enregistrements.
 */

/** Ouvre la socket de Météores. */
export function openMeteor() {
  return openGameSocket<MeteorContract>(METEOR_SOCKET);
}

/** La socket de Météores, typée par son contrat. */
export type MeteorSocket = ReturnType<typeof openMeteor>["socket"];

// #region meteor-client
/** Une trame décodée : les compteurs, et le monde relu des octets. */
export interface IMeteorWorld {
  frame: IMeteorFrame;
  meteors: ReturnType<typeof meteorRecord.read>;
  shots: ReturnType<typeof shotRecord.read>;
  cannons: ReturnType<typeof cannonRecord.read>;
  booms: ReturnType<typeof boomRecord.read>;
}

/** Relit les octets d'une trame : UNE fois, à l'arrivée. */
export function decodeMeteor(frame: IMeteorFrame): IMeteorWorld {
  return {
    frame,
    meteors: meteorRecord.read(frame.meteors),
    shots: shotRecord.read(frame.shots),
    cannons: cannonRecord.read(frame.cannons),
    booms: boomRecord.read(frame.booms),
  };
}

/** Suit l'état du jeu ; la fonction rendue se désabonne et retire l'écouteur. */
export function watchMeteor(
  socket: MeteorSocket,
  onWorld: (world: IMeteorWorld) => void,
): () => void {
  const off = socket.on(METEOR_CHANNEL, (frame) =>
    onWorld(decodeMeteor(frame)),
  );
  socket.subscribe(METEOR_CHANNEL);
  return () => {
    off();
    socket.unsubscribe(METEOR_CHANNEL);
  };
}

/** La visée du joueur : un angle, la gâchette, son étiquette. Aucune réponse attendue. */
export function sendAim(socket: MeteorSocket, aim: IMeteorAim): void {
  socket.emit(AIM_EVENT, aim);
}
// #endregion
