import { z } from "zod";
import type { IRealtimeContract } from "nodefony/client";

/**
 * Temps réel binaire — ce que le serveur et la page partagent : l'adresse de
 * la socket, les canaux, les tailles, et le CONTRAT qui type les deux bouts.
 *
 * Guide pour un agent : importé par `BinaryController.ts` ET par la page
 * (`binaryClient.ts`). Des octets se déclarent `Uint8Array` dans le contrat :
 * c'est le seul type qui traverse le fil tel quel — en CBOR comme en texte
 * (`{"$bytes":"…"}`, relu en `Uint8Array` par le client). Les schémas Zod
 * revalident côté serveur ce que le client envoie : un contrat de types ne
 * protège rien à l'exécution.
 */

// #region binary-shared
/** Préfixe des routes de la démo binaire. */
export const BINARY_PATH = "/demo/api/binary";

/** La socket DÉDIÉE (D1) : ses réglages ne touchent pas celle du chat. */
export const BINARY_SOCKET = `${BINARY_PATH}/realtime`;

/** Canal INDUSTRIE : une trame de vibrations par tic. */
export const VIBRATION_CHANNEL = "binary:vibration";

/** Canal JEU : les positions de tous les sprites, par image. */
export const GAME_CHANNEL = "binary:game";

/** Échantillons Int16 d'une trame de vibrations. */
export const VIBRATION_SAMPLES = 256;

/** Trames de vibrations par seconde. */
export const VIBRATION_HZ = 10;

/** Sprites du jeu ; chacun pèse deux Float32 (x, y). */
export const GAME_SPRITES = 64;

/** Images du jeu par seconde. */
export const GAME_HZ = 30;

/** Tailles de charge mesurées sur le fil, de 64 octets à 1 Mio. */
export const SAMPLE_SIZES = [64, 1024, 4096, 65_536, 262_144, 1_048_576];

/** Taille d'un message entrant que le serveur accepte (`maxPayload`) : 2 Mio. */
export const PAYLOAD_LIMIT = 2_097_152;

/** Une trame de vibrations : `samples` = 256 Int16 petit-boutistes. */
export interface IVibration {
  seq: number;
  /** Vitesse de la machine, tours par minute. */
  rpm: number;
  samples: Uint8Array;
}

/** Une image du jeu : `positions` = 64 × (x, y) en Float32 petit-boutistes. */
export interface IGameFrame {
  seq: number;
  positions: Uint8Array;
}

/** Ce que le serveur dit des octets reçus. */
export interface IDigest {
  size: number;
  sha256: string;
}

/** Une taille de charge que le serveur accepte de produire. */
export const SampleParams = z.strictObject({
  size: z
    .number()
    .refine((size) => SAMPLE_SIZES.includes(size), "taille hors de la liste"),
});

/** Des octets à empreinter — rien d'autre qu'un `Uint8Array`. */
export const DigestParams = z.strictObject({
  bytes: z.instanceof(Uint8Array),
});

export interface BinaryContract extends IRealtimeContract {
  serverToClient: {
    "binary:vibration": IVibration;
    "binary:game": IGameFrame;
  };
  serverMethods: {
    "binary:sample": {
      in: z.infer<typeof SampleParams>;
      out: { bytes: Uint8Array };
    };
    "binary:digest": { in: z.infer<typeof DigestParams>; out: IDigest };
  };
}
// #endregion
