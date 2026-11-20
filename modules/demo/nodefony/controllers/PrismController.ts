import { Inject } from "nodefony";
import { route, controller } from "@nodefony/framework";
import type { ContextType } from "@nodefony/http";
import {
  ContractRealtimeController,
  RealtimeChannel,
  RealtimeInbound,
} from "@nodefony/realtime";
import type {
  ContractRealtimePublish,
  IRealtimeConnection,
} from "@nodefony/realtime";
import PrismService from "../service/PrismService";
import {
  PRISM_CHANNEL,
  PRISM_PATH,
  STEER_EVENT,
  type PrismContract,
} from "../../frontend/src/prism/prismDemo";

// #region prism-controller
/**
 * Prisme, `/demo/api/prism/realtime` : la socket du jeu, typée par son
 * contrat (`frontend/src/prism/prismDemo.ts`).
 *
 * Guide pour un agent : le MÊME contrôleur que Météores, à son contrat près —
 * c'est le but. Le jeu vit dans `PrismService` (une salle `GameRoom` par
 * processus) ; ici, seulement les deux portes : l'état publié, la commande reçue.
 */
@controller(PRISM_PATH)
class PrismController extends ContractRealtimeController<PrismContract> {
  constructor(
    context: ContextType,
    @Inject("PrismService") private readonly prism: PrismService,
  ) {
    super("demo-prism", context);
  }

  /** Point d'entrée : `handleRealtime` porte tout le protocole. */
  @route("demo-prism-realtime", {
    path: "/realtime",
    requirements: { methods: ["WEBSOCKET"] },
  })
  async realtime(message: string | Uint8Array | null): Promise<void> {
    this.handleRealtime(message);
  }

  /** Le premier spectateur démarre la salle ; le départ du dernier l'arrête. */
  @RealtimeChannel(PRISM_CHANNEL)
  state(
    channel: string,
    publish: ContractRealtimePublish<PrismContract>,
  ): () => void {
    return this.prism.room.start((frame) => publish(PRISM_CHANNEL, frame));
  }

  /** La direction du joueur : la salle valide, assoit, applique. */
  @RealtimeInbound(STEER_EVENT, { authenticated: false })
  steer(
    params: unknown,
    _reply: unknown,
    connection: IRealtimeConnection,
  ): void {
    this.prism.room.command(connection, params);
  }
}
// #endregion

export default PrismController;
