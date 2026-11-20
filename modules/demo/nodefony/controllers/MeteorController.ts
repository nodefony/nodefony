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
import MeteorService from "../service/MeteorService";
import {
  AIM_EVENT,
  METEOR_CHANNEL,
  METEOR_PATH,
  type MeteorContract,
} from "../../frontend/src/meteor/meteorDemo";

// #region meteor-controller
/**
 * Météores, `/demo/api/meteor/realtime` : la socket du jeu, typée par son
 * contrat (`frontend/src/meteor/meteorDemo.ts`).
 *
 * Guide pour un agent : ce contrôleur ne contient AUCUNE règle. Il est
 * instancié par connexion ; le jeu vit dans `MeteorService`, une salle par
 * processus, injectée. Deux portes : le canal d'état (la salle tourne tant
 * que quelqu'un regarde) et la commande du joueur (sa connexion EST son
 * identité). Jouer ne demande pas de compte : la démo est ouverte.
 */
@controller(METEOR_PATH)
class MeteorController extends ContractRealtimeController<MeteorContract> {
  constructor(
    context: ContextType,
    @Inject("MeteorService") private readonly meteors: MeteorService,
  ) {
    super("demo-meteor", context);
  }

  /** Point d'entrée : `handleRealtime` porte tout le protocole. */
  @route("demo-meteor-realtime", {
    path: "/realtime",
    requirements: { methods: ["WEBSOCKET"] },
  })
  async realtime(message: string | Uint8Array | null): Promise<void> {
    this.handleRealtime(message);
  }

  /** Le premier spectateur démarre la salle ; le départ du dernier l'arrête. */
  @RealtimeChannel(METEOR_CHANNEL)
  state(
    channel: string,
    publish: ContractRealtimePublish<MeteorContract>,
  ): () => void {
    return this.meteors.room.start((frame) => publish(METEOR_CHANNEL, frame));
  }

  /** Où le joueur vise, s'il tire : la salle valide, assoit, applique. */
  @RealtimeInbound(AIM_EVENT, { authenticated: false })
  aim(params: unknown, _reply: unknown, connection: IRealtimeConnection): void {
    this.meteors.room.command(connection, params);
  }
}
// #endregion

export default MeteorController;
