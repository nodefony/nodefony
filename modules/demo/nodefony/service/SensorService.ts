import { Module, Service, injectable } from "nodefony";
import { startFixedStep, type IFixedStep } from "../kit/fixedStep";
import { createRandom } from "../sensor/random";
import { createPlant, WindowReducer, type IPlant } from "../sensor/plant";
import { AlarmEngine, MovingAverage } from "../sensor/alarms";
import { createGammaSource, type IGammaSource } from "../sensor/gamma";
import {
  createCryostat,
  type ICryoPoint,
  type ICryostat,
} from "../sensor/cryostat";
import {
  createBellExperiment,
  createQubitSource,
  type IBellExperiment,
  type IQubitSource,
} from "../sensor/quantum";
import {
  ACQUISITION_HZ,
  ALARM_WINDOW_MS,
  BELL_PAIRS_PER_SECOND,
  BELL_RUN_PAIRS,
  CRYO_ACCELERATION,
  CRYO_HZ,
  JOURNAL_SIZE,
  LAB_HZ,
  MACHINES,
  MXC_ALARM_K,
  MXC_HYSTERESIS_K,
  QUANTITIES,
  sourceRate,
  TOMO_RUN_SHOTS,
  TOMO_SHOTS_PER_SECOND,
  VIBRATION_HYSTERESIS,
  vibrationZones,
  countRecord,
  cryoRecord,
  deltaRecord,
  windowRecord,
  type IAlarmBoard,
  type IBellFrame,
  type ICryoFrame,
  type IGammaFrame,
  type IGammaSpectrum,
  type IPlantWindow,
  type ITomoFrame,
  type ITomoShots,
} from "../../frontend/src/sensor/sensorDemo";

/**
 * La sonde : UN service d'acquisition, une boucle à pas fixe, cinq bancs —
 * l'usine, le spectre gamma, le cryostat, le test de Bell, la tomographie.
 *
 * Guide pour un agent : la boucle (`kit/fixedStep.ts`, 50 Hz) ne tourne que
 * tant qu'un écran regarde ; chaque banc n'avance que s'il a un spectateur,
 * sauf l'usine et le cryostat qui nourrissent les alarmes. Les mesures sont
 * SIMULÉES selon la physique (`nodefony/sensor/`) ; l'horodatage, le
 * transport et le journal sont réels. Le contrôleur (`SensorController.ts`)
 * n'a aucune règle : il ouvre un canal en appelant `watch…`, qui rend la
 * fonction d'arrêt — le hub l'appelle au départ du dernier abonné.
 * Nodefony SUPERVISE : un vrai verrouillage (couper la circulation d'un
 * cryostat) reste dans l'automate ; ici on l'affiche, on ne le commande pas.
 */

/** Un écran d'usine abonné à une cadence : sa réduction, et où publier. */
interface IPlantWatch {
  ms: number;
  ticks: number;
  every: number;
  reducer: WindowReducer;
  publish: (frame: IPlantWindow) => void;
}

/** Tours de la boucle par trame de laboratoire (10 Hz) et de cryostat (2 Hz). */
const labEvery = ACQUISITION_HZ / LAB_HZ;
const cryoEvery = ACQUISITION_HZ / CRYO_HZ;

/** Le pas de la boucle, en secondes. */
const DT = 1 / ACQUISITION_HZ;

/** Index de la vibration dans une machine (`QUANTITIES`). */
const VIBRATION = QUANTITIES.findIndex((q) => q.id === "vibration");

/** L'alarme de la chambre de mélange : jugée sur une minute SIMULÉE. */
const MXC_ALARM_ID = "cryo-mxc";

// #region sensor-acquisition
/**
 * L'heure d'acquisition : `Date.now()` lu UNE fois au démarrage, puis
 * `hrtime` — monotone, insensible à un réglage d'horloge pendant la mesure.
 */
function acquisitionClock(): () => number {
  const origin = Date.now();
  const start = process.hrtime.bigint();
  return () => origin + Number(process.hrtime.bigint() - start) / 1e6;
}
// #endregion

/** La sonde, une par processus, injectée dans `SensorController`. */
@injectable()
class SensorService extends Service {
  readonly #random = createRandom(Date.now() % 0x7fffffff);
  readonly #clock = acquisitionClock();
  readonly #plant: IPlant = createPlant(this.#random);
  readonly #gamma: IGammaSource = createGammaSource(this.#random);
  readonly #cryostat: ICryostat = createCryostat(this.#random);
  readonly #bell: IBellExperiment = createBellExperiment(this.#random);
  readonly #qubit: IQubitSource = createQubitSource(this.#random);

  /** Une alarme de vibration par machine, plus la chambre de mélange. */
  readonly #alarms = new AlarmEngine(
    [
      ...MACHINES.map((m) => ({
        id: `vibration-${m.id}`,
        source: `M${m.id} · Vibration`,
        unit: "mm/s",
        limit: vibrationZones.bc,
        hysteresis: VIBRATION_HYSTERESIS,
      })),
      {
        id: MXC_ALARM_ID,
        source: "Cryostat · chambre de mélange",
        unit: "K",
        limit: MXC_ALARM_K,
        hysteresis: MXC_HYSTERESIS_K,
      },
    ],
    JOURNAL_SIZE,
    () => this.#clock(),
  );
  readonly #vibrationAverages = MACHINES.map(
    () => new MovingAverage((ALARM_WINDOW_MS / 1000) * ACQUISITION_HZ),
  );
  /** Une minute simulée, en tours de boucle (au moins un). */
  readonly #mxcAverage = new MovingAverage(
    Math.max(1, Math.round((60 / CRYO_ACCELERATION) * ACQUISITION_HZ)),
  );

  #loop: IFixedStep | null = null;
  #tick = 0;
  #seq = 0;
  #plantWatches: IPlantWatch[] = [];
  #alarmWatches: ((board: IAlarmBoard) => void)[] = [];
  #gammaWatches: ((frame: IGammaFrame) => void)[] = [];
  #cryoWatches: ((frame: ICryoFrame) => void)[] = [];
  #bellWatches: ((frame: IBellFrame) => void)[] = [];
  #tomoWatches: ((frame: ITomoFrame) => void)[] = [];
  #cryoHistory: ICryoPoint[] = [];
  #cryoRun = -1;
  #bellRun = 0;
  #tomoRun = 0;

  /**
   * @param module - le module qui le déclare ; absent dans un test, qui le
   *   construit sans kernel
   */
  constructor(module?: Module) {
    super(
      "sensor",
      module?.container ?? undefined,
      module?.notificationsCenter,
    );
    this.#gamma.setTrueRate(sourceRate.default);
  }

  // #region sensor-watch-plant
  /**
   * Un écran d'usine à la cadence `ms` : la boucle lui confie chaque
   * échantillon, il publie la réduction de SA période. Appelée par la fabrique
   * du canal cadencé, au premier abonné de cette cadence ; la fonction rendue
   * l'arrête au départ du dernier.
   */
  watchPlant(ms: number, publish: (frame: IPlantWindow) => void): () => void {
    const watch: IPlantWatch = {
      ms,
      ticks: 0,
      every: Math.max(1, Math.round((ms / 1000) * ACQUISITION_HZ)),
      reducer: new WindowReducer(MACHINES.length * QUANTITIES.length),
      publish,
    };
    this.#plantWatches.push(watch);
    return this.#watching(() => {
      this.#plantWatches = this.#plantWatches.filter((w) => w !== watch);
    });
  }
  // #endregion

  /**
   * Les alarmes : à chaque changement, et une fois par seconde — un écran qui
   * arrive sur un canal déjà ouvert reçoit ainsi le tableau sans attendre.
   */
  watchAlarms(publish: (board: IAlarmBoard) => void): () => void {
    this.#alarmWatches.push(publish);
    return this.#watching(() => {
      this.#alarmWatches = this.#alarmWatches.filter((p) => p !== publish);
    });
  }

  /** Le spectre gamma : les canaux touchés, dix fois par seconde. */
  watchGamma(publish: (frame: IGammaFrame) => void): () => void {
    this.#gammaWatches.push(publish);
    return this.#watching(() => {
      this.#gammaWatches = this.#gammaWatches.filter((p) => p !== publish);
    });
  }

  /** Le cryostat : un point, deux fois par seconde (dix minutes simulées). */
  watchCryo(publish: (frame: ICryoFrame) => void): () => void {
    this.#cryoWatches.push(publish);
    return this.#watching(() => {
      this.#cryoWatches = this.#cryoWatches.filter((p) => p !== publish);
    });
  }

  /** Le test de Bell : les compteurs cumulés, dix fois par seconde. */
  watchBell(publish: (frame: IBellFrame) => void): () => void {
    this.#bellWatches.push(publish);
    return this.#watching(() => {
      this.#bellWatches = this.#bellWatches.filter((p) => p !== publish);
    });
  }

  /** La tomographie : les compteurs par base, dix fois par seconde. */
  watchTomo(publish: (frame: ITomoFrame) => void): () => void {
    this.#tomoWatches.push(publish);
    return this.#watching(() => {
      this.#tomoWatches = this.#tomoWatches.filter((p) => p !== publish);
    });
  }

  // #region sensor-ack
  /**
   * Acquitter une alarme. `by` vient de la SESSION (le contrôleur le lit sur
   * `this.user`) : la page n'envoie que l'identifiant de l'alarme.
   *
   * @returns faux si l'alarme est inconnue ou n'attend pas d'acquittement
   */
  acknowledge(id: string, by: string): boolean {
    const changed = this.#alarms.acknowledge(id, by);
    if (changed) this.#publishAlarms();
    return changed;
  }
  // #endregion

  /** Régler l'activité de la source ; le spectre continue, le temps vif le corrige. */
  setSourceRate(rate: number): number {
    this.#gamma.setTrueRate(rate);
    return this.#gamma.trueRate;
  }

  // #region sensor-spectrum
  /**
   * Le spectre ENTIER, en `u32` : demandé une fois, à l'abonnement. À la
   * cadence, seuls les canaux touchés voyagent — un spectre plein de canaux
   * vides pèse plus lourd en binaire qu'en texte.
   */
  spectrum(): IGammaSpectrum {
    const counts = this.#gamma.spectrum();
    return {
      trueRate: this.#gamma.trueRate,
      live: this.#gamma.live,
      real: this.#gamma.real,
      s: countRecord.write(Array.from(counts, (count) => ({ count }))),
    };
  }
  // #endregion

  /** Les points du run de cryostat en cours, pour qui arrive en cours de route. */
  cryoHistory(): { run: number; points: Uint8Array } {
    return {
      run: this.#cryostat.run,
      points: cryoRecord.write(this.#cryoHistory),
    };
  }

  /** Les derniers tirs bruts d'une base, un bit par tir. */
  tomoShots(basis: 0 | 1 | 2): ITomoShots {
    return this.#qubit.shots(basis);
  }

  /**
   * Compte un spectateur ; démarre la boucle au premier, l'arrête au départ du
   * dernier. Rend la fonction d'arrêt du canal.
   */
  #watching(release: () => void): () => void {
    this.#loop ??= startFixedStep(ACQUISITION_HZ, () => this.step());
    let released = false;
    return () => {
      if (released) return;
      released = true;
      release();
      if (this.#watcherCount() === 0) {
        this.#loop?.stop();
        this.#loop = null;
      }
    };
  }

  #watcherCount(): number {
    return (
      this.#plantWatches.length +
      this.#alarmWatches.length +
      this.#gammaWatches.length +
      this.#cryoWatches.length +
      this.#bellWatches.length +
      this.#tomoWatches.length
    );
  }

  // #region sensor-step
  /**
   * Un tour d'acquisition : lire, réduire, juger, et publier ce qui est dû.
   * Public pour les tests, qui avancent le temps tour par tour.
   */
  step(): void {
    this.#tick += 1;
    const values = this.#plant.step(DT);
    for (const watch of this.#plantWatches) {
      watch.reducer.add(values);
      watch.ticks += 1;
      if (watch.ticks >= watch.every) {
        watch.ticks = 0;
        this.#publishWindow(watch);
      }
    }
    let changed = false;
    MACHINES.forEach((_, m) => {
      const value = values.at(m * QUANTITIES.length + VIBRATION) ?? 0;
      const mean = this.#vibrationAverages.at(m)?.push(value) ?? value;
      if (this.#alarms.observe(`vibration-${MACHINES.at(m)?.id ?? m}`, mean)) {
        changed = true;
      }
    });
    const point = this.#stepCryostat();
    if (this.#alarms.observe(MXC_ALARM_ID, this.#mxcAverage.push(point.mxc))) {
      changed = true;
    }
    if (changed || this.#tick % ACQUISITION_HZ === 1) this.#publishAlarms();
    if (this.#gammaWatches.length > 0) this.#gamma.step(DT);
    if (this.#bellWatches.length > 0) {
      this.#bell.addPairs(BELL_PAIRS_PER_SECOND * DT);
    }
    if (this.#tomoWatches.length > 0) {
      this.#qubit.addShots(TOMO_SHOTS_PER_SECOND * DT);
    }
    if (this.#tick % labEvery === 0) this.#publishLab();
    if (this.#tick % cryoEvery === 0) this.#publishCryo(point);
  }
  // #endregion

  /** Le cryostat avance de 600 × le pas ; un nouveau run vide l'historique. */
  #stepCryostat(): ICryoPoint {
    const point = this.#cryostat.step((DT * CRYO_ACCELERATION) / 3600);
    if (this.#cryostat.run !== this.#cryoRun) {
      this.#cryoRun = this.#cryostat.run;
      this.#cryoHistory = [];
    }
    return point;
  }

  #publishWindow(watch: IPlantWatch): void {
    const reduced = watch.reducer.flush();
    if (reduced === null) return;
    this.#seq += 1;
    const frame: IPlantWindow = {
      seq: this.#seq,
      t: this.#clock(),
      ms: watch.ms,
      n: reduced.n,
      w: windowRecord.write(reduced.windows),
    };
    watch.publish(frame);
  }

  #publishAlarms(): void {
    if (this.#alarmWatches.length === 0) return;
    const board = this.#alarms.board();
    for (const publish of this.#alarmWatches) publish(board);
  }

  #publishCryo(point: ICryoPoint): void {
    this.#cryoHistory.push({ ...point });
    if (this.#cryoWatches.length === 0) return;
    this.#seq += 1;
    const frame: ICryoFrame = {
      seq: this.#seq,
      run: this.#cryostat.run,
      phase: this.#cryostat.phase,
      point: cryoRecord.write([point]),
    };
    for (const publish of this.#cryoWatches) publish(frame);
  }

  #publishLab(): void {
    this.#seq += 1;
    if (this.#gammaWatches.length > 0) {
      const frame: IGammaFrame = {
        seq: this.#seq,
        trueRate: this.#gamma.trueRate,
        measuredRate: this.#gamma.measuredRate,
        live: this.#gamma.live,
        real: this.#gamma.real,
        d: deltaRecord.write(this.#gamma.takeDelta()),
      };
      for (const publish of this.#gammaWatches) publish(frame);
    }
    if (this.#bellWatches.length > 0) {
      if (this.#bell.pairs >= BELL_RUN_PAIRS) {
        this.#bell.reset();
        this.#bellRun += 1;
      }
      const frame: IBellFrame = {
        seq: this.#seq,
        run: this.#bellRun,
        ...this.#bell.counts(),
      };
      for (const publish of this.#bellWatches) publish(frame);
    }
    if (this.#tomoWatches.length > 0) {
      if (this.#qubit.shotsPerBasis >= TOMO_RUN_SHOTS) {
        this.#qubit.reset();
        this.#tomoRun += 1;
      }
      const frame: ITomoFrame = {
        seq: this.#seq,
        run: this.#tomoRun,
        ...this.#qubit.counts(),
      };
      for (const publish of this.#tomoWatches) publish(frame);
    }
  }
}

export default SensorService;
