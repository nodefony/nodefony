import { Inject } from "nodefony";
import { route, controller } from "@nodefony/framework";
import type { ContextType } from "@nodefony/http";
import {
  ContractRealtimeController,
  RealtimeChannel,
  RealtimePolicy,
} from "@nodefony/realtime";
import type { ContractRealtimePublish } from "@nodefony/realtime";
import {
  DEMO_PULSE_CHANNEL,
  type DemoContract,
} from "../../frontend/src/pulse";
import type DemoPulseService from "../service/DemoPulseService";
import type DemoMcpService from "../service/DemoMcpService";
import { DEMO_MCP_CHANNEL } from "../../frontend/src/mcp/mcpDemo";
import { TELEMETRY_CHANNEL } from "../../frontend/src/grpc/grpcDemo";
import type TelemetryRelayService from "../service/TelemetryRelayService";

/**
 * La socket de la démo, `/demo/realtime` : le pouls de l'accueil (D4), le
 * fil en direct de la porte MCP (`demo:mcp`) et les machines qui poussent en
 * gRPC (`demo:telemetry`).
 *
 * Guide pour un agent : une socket TYPÉE par un contrat partagé
 * (`frontend/src/pulse.ts`) — le serveur et la page lisent le même fichier, et
 * une faute de nom ou de charge ne compile d'aucun côté. `extends
 * ContractRealtimeController<C>` exige la table `realtimeActions()` COMPLÈTE :
 * une méthode du contrat oubliée est une erreur de compilation. Équivalent
 * généré (sans contrat) : `npx nodefony create controller --kind realtime`.
 *
 * Lecture publique, assumée et ÉCRITE : le pouls ne porte que des compteurs.
 * Un canal sans politique est libre ; une méthode, fermée par défaut — d'où
 * `@RealtimePolicy`, qui l'ouvre à la déclaration.
 */
@controller("/demo")
@RealtimePolicy({
  "demo:pulse:now": { authenticated: false },
  "demo:telemetry:state": { authenticated: false },
})
class DemoRealtimeController extends ContractRealtimeController<DemoContract> {
  // Instancié PAR CONNEXION : le pouls vit dans le service, le même pour tous.
  constructor(
    context: ContextType,
    @Inject("DemoPulseService") private readonly pulse: DemoPulseService,
    @Inject("DemoMcpService") private readonly demoMcp: DemoMcpService,
    @Inject("TelemetryRelayService")
    private readonly telemetry: TelemetryRelayService,
  ) {
    super("demo-realtime", context);
  }

  /** Point d'entrée : `handleRealtime` porte tout le protocole. */
  @route("demo-realtime", {
    path: "/realtime",
    requirements: { methods: ["WEBSOCKET"] },
  })
  async realtime(message: string | Uint8Array | null): Promise<void> {
    this.handleRealtime(message);
  }

  /** Les méthodes du contrat — toutes, par cette table seule. */
  protected realtimeActions() {
    return {
      "demo:pulse:now": () => this.pulse.snapshot(),
      "demo:telemetry:state": () => this.telemetry.snapshot(),
    };
  }

  /**
   * Le canal d'état. Sa fabrique tourne au PREMIER abonné de ce processus, son
   * retour au départ du dernier : le pouls ne publie que pour qui regarde.
   */
  @RealtimeChannel(DEMO_PULSE_CHANNEL)
  pulseChannel(
    _channel: string,
    publish: ContractRealtimePublish<DemoContract>,
  ): () => void {
    return this.pulse.attach((value) => publish("demo:pulse", value));
  }

  /**
   * Le fil en direct de la porte MCP : chaque appel reçu par `/mcp/demo`, sans
   * ses arguments. Même cycle que le pouls : la diffusion n'existe que tant
   * qu'une page regarde.
   */
  @RealtimeChannel(DEMO_MCP_CHANNEL)
  mcpChannel(
    _channel: string,
    publish: ContractRealtimePublish<DemoContract>,
  ): () => void {
    return this.demoMcp.attach((entry) => publish("demo:mcp", entry));
  }

  // #region grpc-channel
  /**
   * Les machines qui poussent en gRPC : le relais reçoit chaque mesure par
   * `Push` et la publie ICI, sur la même socket que le pouls. La page n'a
   * aucune bibliothèque gRPC à charger, et la socket pousse les petits
   * messages plus vite qu'un flux gRPC. Même cycle : rien ne part tant
   * qu'aucune page ne regarde.
   */
  @RealtimeChannel(TELEMETRY_CHANNEL)
  telemetryChannel(
    _channel: string,
    publish: ContractRealtimePublish<DemoContract>,
  ): () => void {
    return this.telemetry.attach((event) => publish("demo:telemetry", event));
  }
  // #endregion
}

export default DemoRealtimeController;
