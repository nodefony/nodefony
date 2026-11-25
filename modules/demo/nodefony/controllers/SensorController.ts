import { Inject, isRateChannel, parseRate } from "nodefony";
import { route, controller } from "@nodefony/framework";
import type { ContextType } from "@nodefony/http";
import {
  ContractRealtimeController,
  RealtimeChannel,
  RealtimePolicy,
} from "@nodefony/realtime";
import type {
  ContractRealtimePublish,
  RealtimePublish,
} from "@nodefony/realtime";
import SensorService from "../service/SensorService";
import {
  ALARMS_CHANNEL,
  AckParams,
  BELL_CHANNEL,
  CRYO_CHANNEL,
  GAMMA_CHANNEL,
  PLANT_CHANNEL,
  plantRate,
  SENSOR_PATH,
  ShotsParams,
  SourceParams,
  TOMO_CHANNEL,
  type SensorContract,
} from "../../frontend/src/sensor/sensorDemo";

// #region sensor-controller
/**
 * La sonde, `/demo/api/sensor/realtime` : une socket typée par son contrat
 * (`frontend/src/sensor/sensorDemo.ts`), cinq bancs, aucune règle.
 *
 * Guide pour un agent : ce contrôleur est instancié par connexion ; la sonde
 * vit dans `SensorService`, une par processus, injectée. Chaque canal appelle
 * `watch…` du service et rend sa fonction d'arrêt. La LECTURE est publique ;
 * ÉCRIRE — acquitter une alarme, régler la source — exige une session, et le
 * nom de qui acquitte vient de `this.user`, jamais de la page.
 */
@controller(SENSOR_PATH)
@RealtimePolicy({
  "sensor:spectrum": { authenticated: false },
  "sensor:cryo:history": { authenticated: false },
  "sensor:tomo:shots": { authenticated: false },
})
class SensorController extends ContractRealtimeController<SensorContract> {
  constructor(
    context: ContextType,
    @Inject("SensorService") private readonly sensors: SensorService,
  ) {
    super("demo-sensor", context);
  }

  /** Point d'entrée : `handleRealtime` porte tout le protocole. */
  @route("demo-sensor-realtime", {
    path: "/realtime",
    requirements: { methods: ["WEBSOCKET"] },
  })
  async realtime(message: string | Uint8Array | null): Promise<void> {
    this.handleRealtime(message);
  }

  /** Les méthodes du contrat — toutes, par cette table seule. */
  protected realtimeActions() {
    return {
      "sensor:ack": (params: unknown) => this.ack(params),
      "sensor:source": (params: unknown) => this.source(params),
      "sensor:spectrum": () => this.sensors.spectrum(),
      "sensor:cryo:history": () => this.sensors.cryoHistory(),
      "sensor:tomo:shots": (params: unknown) =>
        this.sensors.tomoShots(ShotsParams.parse(params).basis),
    };
  }
  // #endregion

  // #region sensor-rate-channel
  /**
   * L'usine : `sensor:plant` (1 s) et TOUTES ses cadences `sensor:plant:<ms>`.
   * Un décorateur ne reconnaît qu'un nom exact ; une famille cadencée passe
   * par cette surcharge. Une cadence = un canal = une réduction, partagée par
   * tous les écrans qui la demandent, bornée par `plantRate`.
   */
  override createRealtimeChannel(
    channel: string,
    publish: RealtimePublish,
  ): (() => void) | null {
    if (!isRateChannel(channel, PLANT_CHANNEL)) return null;
    const ms = parseRate(channel, PLANT_CHANNEL, plantRate);
    return this.sensors.watchPlant(ms, (frame) => publish(channel, frame));
  }
  // #endregion

  // #region sensor-channels
  /** Les alarmes et leur journal. */
  @RealtimeChannel(ALARMS_CHANNEL)
  alarms(
    _channel: string,
    publish: ContractRealtimePublish<SensorContract>,
  ): () => void {
    return this.sensors.watchAlarms((board) => publish(ALARMS_CHANNEL, board));
  }

  /** Le spectre gamma, en canaux touchés. */
  @RealtimeChannel(GAMMA_CHANNEL)
  gamma(
    _channel: string,
    publish: ContractRealtimePublish<SensorContract>,
  ): () => void {
    return this.sensors.watchGamma((frame) => publish(GAMMA_CHANNEL, frame));
  }

  /** Le cryostat, en temps accéléré. */
  @RealtimeChannel(CRYO_CHANNEL)
  cryo(
    _channel: string,
    publish: ContractRealtimePublish<SensorContract>,
  ): () => void {
    return this.sensors.watchCryo((frame) => publish(CRYO_CHANNEL, frame));
  }

  /** Le test de Bell. */
  @RealtimeChannel(BELL_CHANNEL)
  bell(
    _channel: string,
    publish: ContractRealtimePublish<SensorContract>,
  ): () => void {
    return this.sensors.watchBell((frame) => publish(BELL_CHANNEL, frame));
  }

  /** La tomographie. */
  @RealtimeChannel(TOMO_CHANNEL)
  tomo(
    _channel: string,
    publish: ContractRealtimePublish<SensorContract>,
  ): () => void {
    return this.sensors.watchTomo((frame) => publish(TOMO_CHANNEL, frame));
  }
  // #endregion

  // #region sensor-write
  /** Acquitter : l'identité vient de la session, la page n'envoie que l'alarme. */
  private ack(params: unknown): { ok: boolean } {
    const me = this.user;
    if (me === null) throw new Error("connexion requise pour acquitter");
    const { id } = AckParams.parse(params);
    return { ok: this.sensors.acknowledge(id, me.identifier) };
  }

  /** Régler l'activité de la source : la même source pour tous les écrans. */
  private source(params: unknown): { rate: number } {
    if (this.user === null)
      throw new Error("connexion requise pour régler la source");
    const { rate } = SourceParams.parse(params);
    return { rate: this.sensors.setSourceRate(rate) };
  }
  // #endregion
}

export default SensorController;
