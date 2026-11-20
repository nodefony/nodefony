import {
  bellAngles,
  BELL_VISIBILITY,
  TOMO_DEPOLARIZATION,
  TOMO_RAW_SHOTS,
  type BellQuad,
  type IBellCounts,
  type ITomoShots,
  type TomoTriple,
} from "../../frontend/src/sensor/sensorDemo";
import { blochTarget } from "../../frontend/src/sensor/sensorStats";
import type { IRandom } from "./random";

/**
 * Deux bancs d'optique quantique : des paires de photons intriqués devant
 * quatre réglages de polariseurs (test de Bell, inégalité CHSH), et un qubit
 * mesuré dans trois bases pour reconstruire son état (tomographie).
 *
 * Guide pour un agent : le test de Bell tire, pour CHAQUE paire, un réglage
 * (a ou a′, b ou b′) au hasard — comme dans une vraie expérience, où les
 * polariseurs commutent après le départ des photons — et compte le produit
 * des deux résultats ±1 pour deux modèles sur les MÊMES réglages : la
 * mécanique quantique (corrélation V·cos 2(a − b), V < 1 pour une vraie
 * source) et un modèle local à variable cachée (polarisation λ tirée à la
 * source, réponses déterministes). Le premier dépasse 2, le second jamais.
 * La tomographie tire des résultats « + » avec la probabilité (1 + r_b) / 2
 * d'un état légèrement dépolarisé, et garde les derniers tirs de chaque base
 * en anneau de bits pour qui veut les voir bruts. Les compteurs voyagent ; la
 * page calcule S et la fidélité avec `sensorStats.ts`.
 */

/** Le test de Bell : des paires, et les compteurs des deux modèles. */
export interface IBellExperiment {
  /** Détecte `count` paires de plus, réglage tiré au hasard pour chacune. */
  addPairs(count: number): void;
  /** Les compteurs cumulés des deux modèles : des copies. */
  counts(): { quantum: IBellCounts; local: IBellCounts };
  /** Paires détectées depuis `reset`. */
  readonly pairs: number;
  reset(): void;
}

/** Le qubit et ses trois bases de mesure. */
export interface IQubitSource {
  /** Tire `perBasis` résultats de plus dans chaque base. */
  addShots(perBasis: number): void;
  /** Tirs et résultats « + » par base X, Y, Z : des copies. */
  counts(): { n: TomoTriple; plus: TomoTriple };
  /** Les derniers tirs d'une base, tassés un bit par tir, du plus ancien au plus récent. */
  shots(basis: 0 | 1 | 2): ITomoShots;
  /** Tirs par base depuis `reset`. */
  readonly shotsPerBasis: number;
  reset(): void;
}

/** Degrés → radians. */
function rad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Quatre compteurs → un quadruplet. */
function quad(values: Float64Array): BellQuad {
  return [
    values.at(0) ?? 0,
    values.at(1) ?? 0,
    values.at(2) ?? 0,
    values.at(3) ?? 0,
  ];
}

/** Trois compteurs → un triplet. */
function triple(values: Float64Array): TomoTriple {
  return [values.at(0) ?? 0, values.at(1) ?? 0, values.at(2) ?? 0];
}

// #region sensor-bell
/**
 * Rend le banc de Bell. Les réglages sont numérotés (a,b) (a,b′) (a′,b) (a′,b′) :
 * l'indice vaut `2 × (a ou a′) + (b ou b′)`.
 *
 * @param random - la suite pseudo-aléatoire
 */
export function createBellExperiment(random: IRandom): IBellExperiment {
  const aRad = new Float64Array([rad(bellAngles.a[0]), rad(bellAngles.a[1])]);
  const bRad = new Float64Array([rad(bellAngles.b[0]), rad(bellAngles.b[1])]);
  // Probabilité d'un produit +1 pour chaque réglage : (1 + V cos 2(a − b)) / 2.
  const plusProbability = new Float64Array(4);
  for (let i = 0; i < 2; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      const a = aRad.at(i) ?? 0;
      const b = bRad.at(j) ?? 0;
      plusProbability[2 * i + j] =
        (1 + BELL_VISIBILITY * Math.cos(2 * (a - b))) / 2;
    }
  }
  const quantumN = new Float64Array(4);
  const quantumS = new Float64Array(4);
  const localN = new Float64Array(4);
  const localS = new Float64Array(4);
  let pairs = 0;
  return {
    get pairs() {
      return pairs;
    },
    addPairs(count: number): void {
      for (let k = 0; k < count; k += 1) {
        const i = random.next() < 0.5 ? 0 : 1;
        const j = random.next() < 0.5 ? 0 : 1;
        const setting = 2 * i + j;
        // Mécanique quantique : la corrélation, et rien d'autre.
        const quantumProduct =
          random.next() < (plusProbability.at(setting) ?? 0.5) ? 1 : -1;
        quantumN[setting] = (quantumN.at(setting) ?? 0) + 1;
        quantumS[setting] = (quantumS.at(setting) ?? 0) + quantumProduct;
        // Variable cachée : la paire part avec une polarisation λ, chaque
        // polariseur répond seul, sans rien savoir de l'autre.
        const lambda = random.next() * Math.PI;
        const a = aRad.at(i) ?? 0;
        const b = bRad.at(j) ?? 0;
        const sa = Math.cos(2 * (a - lambda)) >= 0 ? 1 : -1;
        const sb = Math.cos(2 * (b - lambda)) >= 0 ? 1 : -1;
        localN[setting] = (localN.at(setting) ?? 0) + 1;
        localS[setting] = (localS.at(setting) ?? 0) + sa * sb;
      }
      pairs += count;
    },
    counts() {
      return {
        quantum: { n: quad(quantumN), s: quad(quantumS) },
        local: { n: quad(localN), s: quad(localS) },
      };
    },
    reset(): void {
      quantumN.fill(0);
      quantumS.fill(0);
      localN.fill(0);
      localS.fill(0);
      pairs = 0;
    },
  };
}
// #endregion

/** Octets d'un anneau de `TOMO_RAW_SHOTS` bits. */
const ringBytes = Math.ceil(TOMO_RAW_SHOTS / 8);

// #region sensor-tomography
/**
 * Rend la source de qubits. L'état préparé est l'état pur visé, dépolarisé de
 * `TOMO_DEPOLARIZATION` : son vecteur de Bloch est raccourci d'autant, et la
 * fidélité maximale atteignable vaut (1 + (1 − p)) / 2.
 *
 * @param random - la suite pseudo-aléatoire
 */
export function createQubitSource(random: IRandom): IQubitSource {
  const target = blochTarget();
  const shrink = 1 - TOMO_DEPOLARIZATION;
  const plusProbability = new Float64Array([
    (1 + target[0] * shrink) / 2,
    (1 + target[1] * shrink) / 2,
    (1 + target[2] * shrink) / 2,
  ]);
  const n = new Float64Array(3);
  const plus = new Float64Array(3);
  // Trois anneaux de bits côte à côte, et la position d'écriture de chacun.
  const rings = new Uint8Array(3 * ringBytes);
  const heads = new Uint32Array(3);
  let shotsPerBasis = 0;
  return {
    get shotsPerBasis() {
      return shotsPerBasis;
    },
    addShots(perBasis: number): void {
      for (let b = 0; b < 3; b += 1) {
        const p = plusProbability.at(b) ?? 0.5;
        let head = heads.at(b) ?? 0;
        let hits = 0;
        for (let k = 0; k < perBasis; k += 1) {
          const hit = random.next() < p;
          const at = b * ringBytes + (head >> 3);
          const mask = 1 << (head & 7);
          const byte = rings.at(at) ?? 0;
          rings[at] = hit ? byte | mask : byte & ~mask;
          if (hit) hits += 1;
          head += 1;
          if (head === TOMO_RAW_SHOTS) head = 0;
        }
        heads[b] = head;
        n[b] = (n.at(b) ?? 0) + perBasis;
        plus[b] = (plus.at(b) ?? 0) + hits;
      }
      shotsPerBasis += perBasis;
    },
    counts() {
      return { n: triple(n), plus: triple(plus) };
    },
    shots(basis: 0 | 1 | 2): ITomoShots {
      const count = Math.min(shotsPerBasis, TOMO_RAW_SHOTS);
      const head = heads.at(basis) ?? 0;
      const start = (head - count + TOMO_RAW_SHOTS) % TOMO_RAW_SHOTS;
      const bits = new Uint8Array(Math.ceil(count / 8));
      for (let k = 0; k < count; k += 1) {
        const pos = (start + k) % TOMO_RAW_SHOTS;
        const byte = rings.at(basis * ringBytes + (pos >> 3)) ?? 0;
        if ((byte & (1 << (pos & 7))) !== 0) {
          const out = k >> 3;
          bits[out] = (bits.at(out) ?? 0) | (1 << (k & 7));
        }
      }
      return { basis, count, bits };
    },
    reset(): void {
      n.fill(0);
      plus.fill(0);
      rings.fill(0);
      heads.fill(0);
      shotsPerBasis = 0;
    },
  };
}
// #endregion
