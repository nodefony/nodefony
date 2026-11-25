import { createHash, randomFillSync } from "node:crypto";
import { route, controller } from "@nodefony/framework";
import type { ContextType } from "@nodefony/http";
import {
  ContractRealtimeController,
  RealtimeChannel,
  RealtimePolicy,
} from "@nodefony/realtime";
import type { ContractRealtimePublish } from "@nodefony/realtime";
import {
  BINARY_PATH,
  DigestParams,
  GAME_CHANNEL,
  GAME_HZ,
  GAME_SPRITES,
  SampleParams,
  VIBRATION_CHANNEL,
  VIBRATION_HZ,
  VIBRATION_SAMPLES,
  type BinaryContract,
} from "../../frontend/src/binary/binaryDemo";

// #region binary-class
/**
 * Temps réel binaire, `/demo/api/binary/realtime` : des octets sur une socket
 * typée par un contrat partagé (`frontend/src/binary/binaryDemo.ts`).
 *
 * Guide pour un agent : RIEN ici ne parle de CBOR. Le contrôleur publie des
 * objets qui contiennent des `Uint8Array` ; le codec — choisi par la config
 * de l'application (`module-realtime: { codec: "cbor" }`) et négocié par
 * connexion — décide de leur forme sur le fil. Une socket DÉDIÉE : celle du
 * chat garde les siens. Lecture publique, assumée : ni identité, ni donnée.
 */
@controller(BINARY_PATH)
@RealtimePolicy({
  "binary:sample": { authenticated: false },
  "binary:digest": { authenticated: false },
})
class BinaryController extends ContractRealtimeController<BinaryContract> {
  constructor(context: ContextType) {
    super("demo-binary", context);
  }

  /** Point d'entrée : `handleRealtime` porte tout le protocole. */
  @route("demo-binary-realtime", {
    path: "/realtime",
    requirements: { methods: ["WEBSOCKET"] },
  })
  async realtime(message: string | Uint8Array | null): Promise<void> {
    this.handleRealtime(message);
  }

  /** Les méthodes du contrat — toutes, par cette table seule. */
  protected realtimeActions() {
    return {
      "binary:sample": (params: unknown) => this.sample(params),
      "binary:digest": (params: unknown) => this.digest(params),
    };
  }
  // #endregion

  // #region binary-vibration
  /**
   * INDUSTRIE : une machine qui tourne, vue par son accéléromètre. Dix fois
   * par seconde, 256 mesures Int16 — 512 octets — dans UNE trame. La fabrique
   * tourne au premier abonné de ce processus ; son retour, au départ du
   * dernier : personne ne regarde, rien ne tourne.
   */
  @RealtimeChannel(VIBRATION_CHANNEL)
  vibrationChannel(
    _channel: string,
    publish: ContractRealtimePublish<BinaryContract>,
  ): () => void {
    let seq = 0;
    const timer = setInterval(() => {
      seq += 1;
      // Petit-boutiste écrit EXPLICITEMENT : la page lira de même, quelle
      // que soit la machine qui l'exécute.
      const samples = new Uint8Array(VIBRATION_SAMPLES * 2);
      const view = new DataView(samples.buffer);
      const rpm = 1500 + Math.round(60 * Math.sin(seq / 20));
      for (let i = 0; i < VIBRATION_SAMPLES; i += 1) {
        const t = (seq * VIBRATION_SAMPLES + i) / 2560;
        const turn = 2 * Math.PI * (rpm / 60) * t;
        const value =
          9000 * Math.sin(turn) +
          2500 * Math.sin(3 * turn) +
          900 * (Math.random() - 0.5);
        view.setInt16(i * 2, Math.round(value), true);
      }
      publish(VIBRATION_CHANNEL, { seq, rpm, samples });
    }, 1000 / VIBRATION_HZ);
    return () => clearInterval(timer);
  }
  // #endregion

  // #region binary-sample
  /**
   * Des octets de la taille demandée — de 64 octets à 1 Mio, la liste fermée
   * du contrat. La page les reçoit sur deux connexions, l'une en CBOR, l'autre
   * en texte, et mesure ce qui a VRAIMENT voyagé.
   */
  private sample(params: unknown): { bytes: Uint8Array } {
    const { size } = SampleParams.parse(params);
    // Aléatoires : des zéros se compresseraient, et la mesure mentirait.
    return { bytes: randomFillSync(new Uint8Array(size)) };
  }
  // #endregion

  // #region binary-digest
  /**
   * Le chemin inverse : la page ENVOIE des octets (son dessin, en PNG) et
   * reçoit leur taille et leur SHA-256. Le schéma refuse tout ce qui n'est
   * pas un `Uint8Array` — un objet forgé ne passe pas pour des octets.
   */
  private digest(params: unknown): { size: number; sha256: string } {
    const { bytes } = DigestParams.parse(params);
    return {
      size: bytes.byteLength,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  }
  // #endregion

  // #region binary-game
  /**
   * JEU : 64 sprites, trente images par seconde. Chaque image envoie TOUTES
   * les positions — 64 × deux Float32 = 512 octets —, l'état complet plutôt
   * qu'un journal de coups : une image perdue ne désynchronise personne.
   */
  @RealtimeChannel(GAME_CHANNEL)
  gameChannel(
    _channel: string,
    publish: ContractRealtimePublish<BinaryContract>,
  ): () => void {
    const state = Array.from({ length: GAME_SPRITES }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      dx: (Math.random() - 0.5) / 40,
      dy: (Math.random() - 0.5) / 40 + (i % 2 === 0 ? 0.004 : -0.004),
    }));
    let seq = 0;
    const timer = setInterval(() => {
      seq += 1;
      const positions = new Uint8Array(GAME_SPRITES * 8);
      const view = new DataView(positions.buffer);
      state.forEach((sprite, i) => {
        sprite.x += sprite.dx;
        sprite.y += sprite.dy;
        // Rebond sur les bords du terrain, qui va de 0 à 1.
        if (sprite.x < 0 || sprite.x > 1) sprite.dx = -sprite.dx;
        if (sprite.y < 0 || sprite.y > 1) sprite.dy = -sprite.dy;
        sprite.x = Math.min(1, Math.max(0, sprite.x));
        sprite.y = Math.min(1, Math.max(0, sprite.y));
        view.setFloat32(i * 8, sprite.x, true);
        view.setFloat32(i * 8 + 4, sprite.y, true);
      });
      publish(GAME_CHANNEL, { seq, positions });
    }, 1000 / GAME_HZ);
    return () => clearInterval(timer);
  }
  // #endregion
}

export default BinaryController;
