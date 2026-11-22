import { NodefonySocket, type IRealtimeContract } from "nodefony/client";
import * as nodefonyCbor from "nodefony/cbor";
import { wireTap, type IWireTap } from "../kit/probe";

/**
 * La socket d'un jeu : la brique de la page que les jeux de la démo partagent.
 *
 * Guide pour un agent : UNE socket par jeu, typée par son contrat, qui OFFRE
 * CBOR (les positions voyagent en octets) et se reconnecte seule. Le
 * transport passe par la sonde de la démo (`wireTap`) : c'est elle qui permet
 * d'afficher le fil mesuré ; une application l'omet. Le serveur annonce le
 * codec retenu dans son accueil, la seule trame toujours en texte.
 */

// #region game-socket
/** Ouvre la socket d'un jeu ; `tap` compte ses trames. */
export function openGameSocket<C extends IRealtimeContract>(url: string) {
  const tap: IWireTap = wireTap("cbor");
  const socket = NodefonySocket.fromContract<C>(
    {
      url,
      autoReconnect: true,
      codec: nodefonyCbor.CBOR_FRAME_CODEC,
    },
    tap.transport,
  );
  return { socket, tap };
}
// #endregion

/** Une étiquette au hasard : la page s'en sert pour reconnaître SON pilote dans la trame. */
export function randomTag(): number {
  return 1 + Math.floor(Math.random() * 65_534);
}
