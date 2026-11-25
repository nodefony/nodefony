import {
  CRYO_HOURS,
  type CryoPhase,
} from "../../frontend/src/sensor/sensorDemo";
import type { IRandom } from "./random";

/**
 * Un cryostat à dilution qui descend de la température ambiante à dix
 * millikelvins en une trentaine d'heures — et dont le vide fuit un peu, une
 * fois, pour que l'alarme de la chambre de mélange ait quelque chose à dire.
 *
 * Guide pour un agent : modèle SIMPLIFIÉ, en heures simulées. Les étages
 * 50 K et 4 K descendent en exponentielles depuis 300 K ; à 22 h le mélange
 * ³He/⁴He se condense et les étages froids (still, chambre de mélange)
 * décrochent du 4 K vers leurs paliers (0,8 K et 10 mK) ; la chambre de
 * mélange passe sous 12 mK vers 27,3 h (phase `base`). À 29 h une fuite dans
 * l'enceinte à vide (OVC) monte pendant une demi-heure puis se résorbe : la
 * chambre de mélange se réchauffe de 70 mK au pic, l'alarme à 50 mK la voit.
 * Après `CRYO_HOURS`, un nouveau run repart de 300 K. `step(hours)` rend
 * TOUJOURS le même objet, réécrit à chaque pas.
 */

/** Un point du cryostat : heure simulée, quatre étages en kelvins, vide en mbar. */
export interface ICryoPoint {
  h: number;
  t50: number;
  t4: number;
  still: number;
  mxc: number;
  ovc: number;
}

/** Le cryostat : un pas en heures simulées, et où il en est. */
export interface ICryostat {
  /** Avance de `hours` heures simulées et rend le point courant (objet réutilisé). */
  step(hours: number): ICryoPoint;
  readonly phase: CryoPhase;
  /** Numéro de la mise en froid en cours (0 au départ). */
  readonly run: number;
  /** Heure simulée depuis le début du run. */
  readonly hours: number;
}

// #region sensor-cryostat
/** Température ambiante de départ, en kelvins. */
const ROOM_K = 300;
/** Étages 50 K et 4 K : palier (K) et constante de temps (h) de leur descente. */
const stage50k = { floor: 45, tau: 4 } as const;
const stage4k = { floor: 3.5, tau: 3.5 } as const;
/** Heure de la condensation du mélange. */
const CONDENSE_H = 22;
/** Still et chambre de mélange après condensation : palier (K) et constante de temps (h). */
const STILL = { floor: 0.8, tau: 0.5 } as const;
const mixingChamber = { floor: 0.01, tau: 0.7 } as const;
/** Pression de l'enceinte à vide (mbar) : palier, excès de départ, constante de temps (h). */
const OVC = { floor: 1e-6, start: 4e-4, tau: 1.5 } as const;
/** La fuite : début, pic, constante de résorption (h), échauffement (K) et pression (mbar) au pic. */
const LEAK = {
  startH: 29,
  peakH: 29.5,
  decayH: 0.12,
  endH: 30.1,
  mxcK: 0.07,
  ovcMbar: 5e-4,
} as const;
/** Bruit relatif de chaque capteur. */
const NOISE = {
  t50: 0.004,
  t4: 0.006,
  still: 0.01,
  mxc: 0.012,
  ovc: 0.03,
} as const;
/** La base est atteinte quand la chambre de mélange passe sous 12 mK. */
const BASE_REACHED_K = 0.012;

/** Température de l'étage 4 K à l'heure `h`. */
function fourKelvinStage(h: number): number {
  return stage4k.floor + (ROOM_K - stage4k.floor) * Math.exp(-h / stage4k.tau);
}

/** Part de la fuite à l'heure `h` : rampe jusqu'au pic, puis résorption exponentielle. */
function leakShare(h: number): number {
  if (h < LEAK.startH || h >= LEAK.endH) return 0;
  if (h < LEAK.peakH) return (h - LEAK.startH) / (LEAK.peakH - LEAK.startH);
  return Math.exp(-(h - LEAK.peakH) / LEAK.decayH);
}

/**
 * Rend un cryostat au départ d'une mise en froid.
 *
 * @param random - la suite pseudo-aléatoire (bruit des capteurs)
 */
export function createCryostat(random: IRandom): ICryostat {
  const point: ICryoPoint = {
    h: 0,
    t50: ROOM_K,
    t4: ROOM_K,
    still: ROOM_K,
    mxc: ROOM_K,
    ovc: OVC.floor + OVC.start,
  };
  let hours = 0;
  let run = 0;
  let phase: CryoPhase = "cooldown";
  const noisy = (value: number, relative: number): number =>
    value * (1 + relative * random.gauss());
  return {
    get phase() {
      return phase;
    },
    get run() {
      return run;
    },
    get hours() {
      return hours;
    },
    step(dt: number): ICryoPoint {
      hours += dt;
      if (hours >= CRYO_HOURS) {
        hours -= CRYO_HOURS;
        run += 1;
        phase = "cooldown";
      }
      const h = hours;
      const t50 =
        stage50k.floor +
        (ROOM_K - stage50k.floor) * Math.exp(-h / stage50k.tau);
      const t4 = fourKelvinStage(h);
      let still = t4;
      let mxc = t4;
      if (h > CONDENSE_H) {
        const d = h - CONDENSE_H;
        const from = fourKelvinStage(CONDENSE_H);
        still = STILL.floor + (from - STILL.floor) * Math.exp(-d / STILL.tau);
        mxc =
          mixingChamber.floor +
          (from - mixingChamber.floor) * Math.exp(-d / mixingChamber.tau);
      }
      let ovc = OVC.floor + OVC.start * Math.exp(-h / OVC.tau);
      const leak = leakShare(h);
      ovc += LEAK.ovcMbar * leak;
      mxc += LEAK.mxcK * leak;
      point.h = h;
      point.t50 = noisy(t50, NOISE.t50);
      point.t4 = noisy(t4, NOISE.t4);
      point.still = noisy(still, NOISE.still);
      point.mxc = noisy(mxc, NOISE.mxc);
      point.ovc = noisy(ovc, NOISE.ovc);
      // La phase est un ÉTAT : la base, une fois atteinte, ne se perd qu'au run suivant.
      const leaking = leak > 0;
      if (phase === "cooldown") {
        if (h > CONDENSE_H) phase = "condensing";
      } else if (phase === "condensing") {
        if (leaking) phase = "leak";
        else if (point.mxc < BASE_REACHED_K) phase = "base";
      } else if (phase === "base") {
        if (leaking) phase = "leak";
      } else if (!leaking) {
        phase = "base";
      }
      return point;
    },
  };
}
// #endregion
