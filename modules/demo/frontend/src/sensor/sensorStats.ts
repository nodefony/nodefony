import {
  tomoTarget,
  type BellQuad,
  type IBellCounts,
  type TomoTriple,
} from "./sensorDemo";

/**
 * Les calculs de la sonde que la page ET le serveur font à l'identique :
 * la valeur CHSH et son incertitude, l'estimation d'un état de qubit, le taux
 * mesuré derrière un temps mort, le décompte de tirs tassés en bits.
 *
 * Guide pour un agent : ce fichier est ISOMORPHE — aucune API Node, aucun
 * DOM, rien que des nombres : il s'importe depuis `nodefony/sensor/*.ts` côté
 * serveur comme depuis `sensorClient.ts` côté page. Une règle écrite ici une
 * fois est vraie des deux côtés ; recopiée, elle divergerait. Les compteurs
 * voyagent, pas les résultats : la page recalcule S ou la fidélité à chaque
 * trame avec les fonctions ci-dessous.
 */

// #region sensor-chsh
/**
 * La valeur CHSH d'un jeu de compteurs : E_k = s_k / n_k par réglage (0 quand
 * rien n'a été compté), S = E(a,b) − E(a,b′) + E(a′,b) + E(a′,b′), et son
 * écart-type σ = √Σ (1 − E_k²) / n_k (un réglage vide ne compte pas). Une
 * théorie locale ne dépasse pas 2 ; la mécanique quantique monte à 2√2.
 *
 * @param counts - paires et somme des produits ±1, par réglage
 */
export function chsh(counts: IBellCounts): {
  S: number;
  sigma: number;
  E: BellQuad;
} {
  const E: BellQuad = [0, 0, 0, 0];
  let variance = 0;
  for (let k = 0; k < 4; k += 1) {
    const n = counts.n.at(k) ?? 0;
    if (n <= 0) continue;
    const e = (counts.s.at(k) ?? 0) / n;
    E[k] = e;
    variance += (1 - e * e) / n;
  }
  const S = E[0] - E[1] + E[2] + E[3];
  return { S, sigma: Math.sqrt(variance), E };
}
// #endregion

/** Degrés → radians. */
function rad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Le vecteur de Bloch de l'état PUR visé (θ, φ de `tomoTarget`), de norme 1. */
export function blochTarget(): TomoTriple {
  const theta = rad(tomoTarget.theta);
  const phi = rad(tomoTarget.phi);
  return [
    Math.sin(theta) * Math.cos(phi),
    Math.sin(theta) * Math.sin(phi),
    Math.cos(theta),
  ];
}

/** Ce que rend `blochEstimate`. */
export interface IBlochEstimate {
  /** Inversion linéaire brute, r_b = 2 p_b / n_b − 1 : peut sortir de la sphère. */
  raw: TomoTriple;
  /** Norme du vecteur brut ; > 1 signifie un état non physique. */
  norm: number;
  /** Vrai quand le brut a dû être ramené sur la sphère. */
  projected: boolean;
  /** L'estimation physique : le brut, ou sa projection sur la boule. */
  estimate: TomoTriple;
  /** Fidélité à l'état pur visé, (1 + r_cible · r) / 2, et son écart-type propagé. */
  fidelity: number;
  fidelitySigma: number;
}

// #region sensor-bloch-estimate
/**
 * Reconstruit un qubit depuis ses compteurs par base : inversion linéaire
 * r_b = 2 p_b / n_b − 1, projection sur la boule de Bloch quand |r| > 1 (peu
 * de tirs rendent souvent un état impossible), fidélité à l'état pur visé.
 * σ propagé depuis la variance binomiale de chaque composante, (1 − r_b²) / n_b.
 *
 * @param n - tirs par base X, Y, Z
 * @param plus - résultats « + » par base
 */
export function blochEstimate(n: TomoTriple, plus: TomoTriple): IBlochEstimate {
  const target = blochTarget();
  const raw: TomoTriple = [0, 0, 0];
  const sigma: TomoTriple = [0, 0, 0];
  for (let b = 0; b < 3; b += 1) {
    const shots = n.at(b) ?? 0;
    if (shots <= 0) continue;
    const r = (2 * (plus.at(b) ?? 0)) / shots - 1;
    raw[b] = r;
    sigma[b] = Math.sqrt(Math.max(1e-9, 1 - r * r) / shots);
  }
  const norm = Math.hypot(raw[0], raw[1], raw[2]);
  const projected = norm > 1;
  const estimate: TomoTriple = projected
    ? [raw[0] / norm, raw[1] / norm, raw[2] / norm]
    : [raw[0], raw[1], raw[2]];
  const overlap =
    target[0] * estimate[0] + target[1] * estimate[1] + target[2] * estimate[2];
  const fidelity = (1 + overlap) / 2;
  const fidelitySigma =
    0.5 *
    Math.sqrt(
      target[0] * target[0] * sigma[0] * sigma[0] +
        target[1] * target[1] * sigma[1] * sigma[1] +
        target[2] * target[2] * sigma[2] * sigma[2],
    );
  return { raw, norm, projected, estimate, fidelity, fidelitySigma };
}
// #endregion

/**
 * Taux mesuré derrière un temps mort NON paralysable τ : m = n / (1 + n τ).
 * À 20 000 coups vrais par seconde et τ = 4 µs, 7,4 % des coups sont perdus.
 *
 * @param trueRate - coups vrais par seconde
 * @param deadTimeUs - temps mort, en microsecondes
 */
export function measuredRate(trueRate: number, deadTimeUs: number): number {
  return trueRate / (1 + trueRate * deadTimeUs * 1e-6);
}

/** Bits à 1 dans un octet. */
function popcount8(byte: number): number {
  let b = byte & 0xff;
  let total = 0;
  while (b !== 0) {
    total += b & 1;
    b >>>= 1;
  }
  return total;
}

/**
 * Compte les résultats « + » parmi `count` tirs tassés un bit par tir — le tir
 * k est le bit `k & 7` de l'octet `k >> 3`, du plus ancien au plus récent.
 *
 * @param bits - les tirs tassés (octets complets)
 * @param count - tirs valides ; les bits au-delà sont ignorés
 */
export function unpackShots(bits: Uint8Array, count: number): number {
  const fullBytes = count >> 3;
  let total = 0;
  for (let i = 0; i < fullBytes; i += 1) total += popcount8(bits.at(i) ?? 0);
  const rest = count & 7;
  if (rest > 0)
    total += popcount8((bits.at(fullBytes) ?? 0) & ((1 << rest) - 1));
  return total;
}
