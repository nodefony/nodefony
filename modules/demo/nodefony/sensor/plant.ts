import { MACHINES, QUANTITIES } from "../../frontend/src/sensor/sensorDemo";
import type { IRandom } from "./random";

/**
 * L'atelier de la sonde : quatre machines, trois grandeurs chacune, lues
 * cinquante fois par seconde — et la réduction de ces lectures en fenêtres
 * (min, max, moyenne) que chaque cadence d'abonné reçoit.
 *
 * Guide pour un agent : `createPlant(random)` rend un simulateur dont `step(dt)`
 * remplit et rend TOUJOURS le même `Float32Array` (une valeur par série, machine
 * par machine puis grandeur dans l'ordre de `QUANTITIES`) — rien n'est alloué
 * par tour. Les machines 1, 2 et 4 sont saines ; la machine 3 (index 2) use un
 * roulement par CYCLE : ~40 s saine, montée lente de la vibration jusqu'en
 * zone C/D ISO 10816-3, palier, puis « maintenance » et retour sain. C'est elle
 * qui fait vivre l'alarme. `WindowReducer` accumule les tours d'une cadence et
 * rend sa fenêtre à `flush()` ; le service en tient un par cadence abonnée.
 */

/** Un simulateur d'atelier : un pas, et le temps écoulé en secondes. */
export interface IPlant {
  /**
   * Avance la simulation de `dt` secondes et rend les valeurs courantes —
   * le MÊME tableau à chaque appel, écrasé au tour suivant : à consommer
   * (réduire, copier) avant de rappeler `step`.
   */
  step(dt: number): Float32Array;
  /** Temps simulé écoulé, en secondes. */
  readonly time: number;
}

/** Ce qu'une machine saine montre, et comment elle respire. */
interface IMachineProfile {
  /** Température de régime (°C) et amplitude de sa dérive lente. */
  readonly tempC: number;
  readonly tempSpan: number;
  /** Vibration de régime (mm/s RMS). */
  readonly vibration: number;
  /** Courant à vide (A), amplitude des cycles de charge et leur période (s). */
  readonly currentA: number;
  readonly currentSwing: number;
  readonly loadPeriodS: number;
}

/** Les profils, dans l'ordre de `MACHINES`. */
const PROFILES: readonly IMachineProfile[] = [
  {
    tempC: 52,
    tempSpan: 6,
    vibration: 1.4,
    currentA: 38,
    currentSwing: 10,
    loadPeriodS: 90,
  },
  {
    tempC: 61,
    tempSpan: 5,
    vibration: 1.8,
    currentA: 72,
    currentSwing: 25,
    loadPeriodS: 140,
  },
  {
    tempC: 46,
    tempSpan: 4,
    vibration: 2.1,
    currentA: 24,
    currentSwing: 6,
    loadPeriodS: 200,
  },
  {
    tempC: 58,
    tempSpan: 7,
    vibration: 1.6,
    currentA: 115,
    currentSwing: 45,
    loadPeriodS: 60,
  },
];

/** La machine dont le roulement se dégrade : la troisième. */
const DEGRADED_MACHINE = 2;

/** Période de la dérive lente de température, en secondes. */
const THERMAL_PERIOD_S = 900;
/** Constante de temps thermique (s), marche aléatoire du régime et bruit du capteur (°C). */
const THERMAL_TAU_S = 60;
const THERMAL_WANDER = 0.05;
const THERMAL_READ_NOISE = 0.05;
/** Bruit du capteur de vibration d'une machine saine (mm/s) et part due à la charge. */
const VIBRATION_NOISE = 0.08;
const VIBRATION_PER_LOAD = 0.1;
/** Bruit du capteur de courant, en ampères. */
const CURRENT_NOISE = 0.4;
/** Raideur du cycle de charge : plus c'est grand, plus le créneau est franc. */
const LOAD_SHARPNESS = 3;

/**
 * Les quantités dans la trame : leur rang, lu une fois. La série de la
 * machine `m` pour une grandeur est `m * QUANTITIES.length + rang`.
 */
export const temperatureSlot = QUANTITIES.findIndex(
  (q) => q.id === "temperature",
);
const vibrationSlot = QUANTITIES.findIndex((q) => q.id === "vibration");
const currentSlot = QUANTITIES.findIndex((q) => q.id === "current");

// #region sensor-plant-sim
/**
 * Le roulement de la machine 3 : sain `healthyS` secondes à `base` mm/s, puis
 * montée de `ramp` mm/s par seconde jusqu'à `rise` au-dessus de la base,
 * palier `plateauS`, puis maintenance — le cycle recommence sain. Le bruit
 * `noise` (σ, mm/s) est celui d'un vrai capteur RMS : il fait battre le brut
 * autour du seuil, et c'est ce que la moyenne glissante efface.
 */
const BEARING = {
  base: 2.1,
  healthyS: 40,
  ramp: 0.045,
  rise: 2.6,
  plateauS: 30,
  noise: 0.22,
} as const;

/** Durée de la montée et du cycle entier, en secondes. */
const bearingRiseS = BEARING.rise / BEARING.ramp;
const bearingCycleS = BEARING.healthyS + bearingRiseS + BEARING.plateauS;

/** Échauffement du palier : degrés par mm/s de vibration en trop. */
const BEARING_HEAT_PER_MM_S = 2.5;

/**
 * Excès de vibration du roulement à l'instant `time` du cycle, en mm/s.
 *
 * @param time - temps simulé, en secondes
 */
function bearingTrend(time: number): number {
  const t = time % bearingCycleS;
  if (t < BEARING.healthyS) return 0;
  if (t < BEARING.healthyS + bearingRiseS)
    return (t - BEARING.healthyS) * BEARING.ramp;
  return BEARING.rise;
}
// #endregion

/** Cycle de charge lissé entre 0 (à vide) et 1 (pleine charge). */
function loadCycle(time: number, periodS: number, phase: number): number {
  return (
    0.5 *
    (1 +
      Math.tanh(
        LOAD_SHARPNESS * Math.sin((2 * Math.PI * time) / periodS + phase),
      ))
  );
}

/**
 * Rend l'atelier simulé.
 *
 * @param random - la suite pseudo-aléatoire (graine fixée par l'appelant)
 */
export function createPlant(random: IRandom): IPlant {
  const stride = QUANTITIES.length;
  const values = new Float32Array(MACHINES.length * stride);
  // L'état thermique de chaque machine : la seule mémoire d'un tour à l'autre.
  const temperatures = new Float64Array(MACHINES.length);
  for (let m = 0; m < MACHINES.length; m += 1) {
    temperatures[m] = PROFILES.at(m)?.tempC ?? 0;
  }
  let time = 0;
  return {
    get time() {
      return time;
    },
    step(dt: number): Float32Array {
      time += dt;
      const sqrtDt = Math.sqrt(dt);
      for (let m = 0; m < MACHINES.length; m += 1) {
        const profile = PROFILES.at(m);
        if (profile === undefined) continue;
        const phase = m * 1.3;
        const load = loadCycle(time, profile.loadPeriodS, phase);
        const excess = m === DEGRADED_MACHINE ? bearingTrend(time) : 0;
        // Température : relaxation vers un régime qui dérive lentement, plus
        // une marche aléatoire ; le roulement qui chauffe relève le régime.
        const setpoint =
          profile.tempC +
          profile.tempSpan *
            Math.sin((2 * Math.PI * time) / THERMAL_PERIOD_S + phase) +
          excess * BEARING_HEAT_PER_MM_S;
        const current = temperatures.at(m) ?? setpoint;
        const next =
          current +
          ((setpoint - current) * dt) / THERMAL_TAU_S +
          THERMAL_WANDER * sqrtDt * random.gauss();
        temperatures[m] = next;
        const base = m * stride;
        values[base + temperatureSlot] =
          next + THERMAL_READ_NOISE * random.gauss();
        const noise = m === DEGRADED_MACHINE ? BEARING.noise : VIBRATION_NOISE;
        values[base + vibrationSlot] = Math.max(
          0,
          profile.vibration +
            excess +
            VIBRATION_PER_LOAD * load +
            noise * random.gauss(),
        );
        values[base + currentSlot] = Math.max(
          0,
          profile.currentA +
            profile.currentSwing * load +
            CURRENT_NOISE * random.gauss(),
        );
      }
      return values;
    },
  };
}

/** Une série réduite sur une fenêtre : ce que `windowRecord` écrit. */
export interface IWindowStat {
  min: number;
  max: number;
  mean: number;
}

/** Le résultat d'un `flush` : les échantillons comptés et une fenêtre par série. */
export interface IWindowBatch {
  n: number;
  windows: IWindowStat[];
}

// #region sensor-window
/**
 * Réduit les tours d'acquisition d'une cadence en une fenêtre par série :
 * minimum, maximum, moyenne. Tout est pré-alloué : `add` n'alloue rien, et
 * `flush` rend toujours le même objet, réécrit — à sérialiser avant le
 * prochain `add`.
 */
export class WindowReducer {
  readonly #series: number;
  readonly #min: Float64Array;
  readonly #max: Float64Array;
  readonly #sum: Float64Array;
  readonly #batch: IWindowBatch;
  #n = 0;

  /**
   * @param series - nombre de séries par tour (la longueur du tableau passé à `add`)
   */
  constructor(series: number) {
    this.#series = series;
    this.#min = new Float64Array(series);
    this.#max = new Float64Array(series);
    this.#sum = new Float64Array(series);
    const windows: IWindowStat[] = [];
    for (let i = 0; i < series; i += 1)
      windows.push({ min: 0, max: 0, mean: 0 });
    this.#batch = { n: 0, windows };
  }

  /** Ajoute un tour : une valeur par série. */
  add(values: Float32Array): void {
    const first = this.#n === 0;
    for (let i = 0; i < this.#series; i += 1) {
      const v = values.at(i) ?? 0;
      if (first) {
        this.#min[i] = v;
        this.#max[i] = v;
        this.#sum[i] = v;
        continue;
      }
      if (v < (this.#min.at(i) ?? v)) this.#min[i] = v;
      if (v > (this.#max.at(i) ?? v)) this.#max[i] = v;
      this.#sum[i] = (this.#sum.at(i) ?? 0) + v;
    }
    this.#n += 1;
  }

  /**
   * Rend la fenêtre de ce qui a été ajouté et repart de zéro ; `null` si rien
   * n'a été ajouté. L'objet rendu est réutilisé au `flush` suivant.
   */
  flush(): IWindowBatch | null {
    const n = this.#n;
    if (n === 0) return null;
    const windows = this.#batch.windows;
    for (let i = 0; i < this.#series; i += 1) {
      const w = windows.at(i);
      if (w === undefined) continue;
      w.min = this.#min.at(i) ?? 0;
      w.max = this.#max.at(i) ?? 0;
      w.mean = (this.#sum.at(i) ?? 0) / n;
    }
    this.#batch.n = n;
    this.#n = 0;
    return this.#batch;
  }
}
// #endregion
