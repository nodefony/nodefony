import { Kernel, Module, services } from "nodefony";
import { controllers } from "@nodefony/framework";
import { entities } from "@nodefony/orm-core";
import config, {
  DEMO_CONNECTOR,
  demoDrizzleOverride,
  type IDemoConfigInput,
} from "./nodefony/config/config";
import { roomEntities } from "./nodefony/entity/rooms";
import {
  defineDemoConfig,
  demoConfigJsonSchema,
} from "./nodefony/config/defineModuleConfig";
import PartnerController from "./nodefony/controllers/PartnerController";
import AppInfoService from "./nodefony/service/AppInfoService";
import AppBannerService from "./nodefony/service/AppBannerService";
import PartnerCallCommand from "./nodefony/command/PartnerCallCommand";
import DemoPageController from "./nodefony/controllers/DemoPageController";
import DemoController from "./nodefony/controllers/DemoController";
import DemoRealtimeController from "./nodefony/controllers/DemoRealtimeController";
import DemoPulseService from "./nodefony/service/DemoPulseService";
import ChatController from "./nodefony/controllers/ChatController";
import FirstStepsController from "./nodefony/controllers/FirstStepsController";
import SseController from "./nodefony/controllers/SseController";
import VideoController from "./nodefony/controllers/VideoController";
import UploadController from "./nodefony/controllers/UploadController";
import BinaryController from "./nodefony/controllers/BinaryController";
import ChatService from "./nodefony/service/ChatService";
import UploadService from "./nodefony/service/UploadService";
import LinkPreviewService from "./nodefony/service/LinkPreviewService";
import RoomAdmission from "./nodefony/service/RoomAdmission";
import RoomService from "./nodefony/service/RoomService";
import PartnerTokenService from "./nodefony/service/PartnerTokenService";
import PartnerTokenController from "./nodefony/controllers/PartnerTokenController";
import DemoMcpController from "./nodefony/controllers/DemoMcpController";
import McpTokenController from "./nodefony/controllers/McpTokenController";
import DemoMcpService from "./nodefony/service/DemoMcpService";
import MeteorController from "./nodefony/controllers/MeteorController";
import MeteorService from "./nodefony/service/MeteorService";
import PrismController from "./nodefony/controllers/PrismController";
import PrismService from "./nodefony/service/PrismService";
import SensorController from "./nodefony/controllers/SensorController";
import SensorService from "./nodefony/service/SensorService";
import TelemetryController from "./nodefony/controllers/TelemetryController";
import TelemetryRelayService from "./nodefony/service/TelemetryRelayService";
import SensorPushCommand from "./nodefony/command/SensorPushCommand";
import { registerDemoEntry } from "./nodefony/frontend/registerDemoEntry";

/**
 * @nodefony/demo — la démo de nodefony : ce que Nodefony sait faire,
 * dans du code qui tourne.
 *
 * Un module PRIVÉ comme un autre (`modules/demo/`), posé par
 * `create app --demo` : ses routes vivent sous `/demo`, sa zone de firewall
 * dans sa propre config (`nodefony/config/security.ts`). La retirer tient en
 * deux gestes — supprimer ce dossier, retirer sa ligne `use(…)` du manifeste
 * de `nodefony.config.ts` — et l'application reste entière.
 */

declare module "nodefony" {
  interface NodefonyModuleConfig {
    "@nodefony/demo": IDemoConfigInput;
  }
}

@controllers([
  PartnerController,
  DemoPageController,
  DemoController,
  DemoRealtimeController,
  ChatController,
  FirstStepsController,
  SseController,
  VideoController,
  UploadController,
  BinaryController,
  PartnerTokenController,
  DemoMcpController,
  McpTokenController,
  MeteorController,
  PrismController,
  SensorController,
  TelemetryController,
])
@services([
  AppInfoService,
  AppBannerService,
  DemoPulseService,
  ChatService,
  // Les fichiers de la démo « Envoi de fichiers », rangés sur leur compte.
  UploadService,
  // L'aperçu d'un lien du chat : lit un site tiers par `fetchPublic`.
  LinkPreviewService,
  RoomService,
  // La règle d'admission des salons, résolue au premier `subscribe` : déclarée
  // ici, elle entre dans l'ordre de démarrage et dans l'introspection.
  RoomAdmission,
  PartnerTokenService,
  DemoMcpService,
  MeteorService,
  PrismService,
  SensorService,
  TelemetryRelayService,
])
// #region demo-entities
// Les salons du chat et leurs messages : cinq tables sur la base SQLite de la démo.
@entities(roomEntities, { connector: DEMO_CONNECTOR })
// #endregion
class DemoModule extends Module {
  constructor(kernel: Kernel) {
    // Le connecteur `demo` rejoint `@nodefony/drizzle` comme la zone de la
    // démo rejoint le firewall : par une clé `module-drizzle`, lue à
    // l'enregistrement des modules, avant toute connexion.
    super("demo", kernel, import.meta.url, {
      ...config,
      ...demoDrizzleOverride(kernel.infra.database),
    });
    this.addCommand(PartnerCallCommand);
    this.addCommand(SensorPushCommand);
  }

  /** Valide la config au boot — une clé inconnue arrête le démarrage, nommée. */
  override async onKernelRegister(): Promise<this> {
    this.options = defineDemoConfig(this.options);
    return this;
  }

  /**
   * Déclare le front React de la démo (`/demo`) auprès du FrontendService —
   * AVANT onKernelReady, pour que le superviseur Vite démarre avec lui.
   */
  override async onKernelBoot(): Promise<this> {
    registerDemoEntry(this);
    return this;
  }

  /**
   * Sème les salons de démonstration — la base est ouverte depuis `onBoot`.
   * Un échec se DIT (le chat resterait vide sans explication), sans arrêter
   * le reste de la démo.
   */
  override async onKernelReady(): Promise<this> {
    const rooms = this.get<unknown>("rooms");
    if (rooms instanceof RoomService) {
      await rooms.seed().catch((error: unknown) => {
        this.log(
          `salons du chat : semis impossible — ${error instanceof Error ? error.message : String(error)}`,
          "ERROR",
        );
      });
      // Les invités sortent à la fin de leur événement : vise la prochaine fin.
      await rooms.closeEnded().catch((error: unknown) => {
        this.log(
          `salons du chat : fin d'événement non suivie — ${error instanceof Error ? error.message : String(error)}`,
          "ERROR",
        );
      });
    }
    return this;
  }

  /**
   * Publie le schéma au Kernel : c'est par lui qu'il applique le nom court
   * `NF_KEYCLOAK_MACHINE_SECRET` déclaré dans `./nodefony/config/config.ts`.
   */
  override configSchema(): unknown {
    return demoConfigJsonSchema();
  }
}

export default DemoModule;

export type { IDemoConfigInput } from "./nodefony/config/config";
