/**
 * Un générateur pseudo-aléatoire à GRAINE, pour que la physique simulée de la
 * sonde se rejoue à l'identique : même graine, même spectre, mêmes paires.
 *
 * Guide pour un agent : `Math.random()` ne se rejoue pas — un test qui compare
 * un centroïde ou une fraction d'estimations hors de la sphère a besoin d'une
 * suite reproductible. `createRandom(seed)` rend les trois tirages dont les
 * bancs ont besoin : uniforme sur [0, 1[, gaussien centré réduit (Box–Muller),
 * et Poisson (exact sous 30, approximation normale au-delà — un taux de
 * comptage de 2 000 coups par pas n'a pas besoin de 2 000 tirages). Aucune
 * allocation par tirage.
 */

/** Trois tirages, toujours depuis la même suite. */
export interface IRandom {
  /** Uniforme sur [0, 1[. */
  next(): number;
  /** Gaussien de moyenne 0 et d'écart-type 1. */
  gauss(): number;
  /** Entier de Poisson de moyenne `mean` (0 si `mean` ≤ 0). */
  poisson(mean: number): number;
}

/** Au-delà de cette moyenne, Poisson se confond avec une normale. */
const POISSON_NORMAL_ABOVE = 30;

/**
 * Rend un générateur mulberry32 : 32 bits d'état, période 2³², assez vite pour
 * tirer 100 000 canaux par seconde sans peser sur la boucle.
 *
 * @param seed - la graine ; deux générateurs de même graine rendent la même suite
 */
export function createRandom(seed: number): IRandom {
  let state = seed | 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const gauss = (): number => {
    const u = next();
    const v = next();
    // log(0) vaudrait −∞ : on écarte le zéro, sans biais mesurable.
    return (
      Math.sqrt(-2 * Math.log(u > 0 ? u : 1e-12)) * Math.cos(2 * Math.PI * v)
    );
  };
  const poisson = (mean: number): number => {
    if (mean <= 0) return 0;
    if (mean > POISSON_NORMAL_ABOVE) {
      return Math.max(0, Math.round(mean + Math.sqrt(mean) * gauss()));
    }
    // Inversion de la fonction de répartition, terme à terme.
    let k = 0;
    let p = Math.exp(-mean);
    let s = p;
    const u = next();
    while (u > s) {
      k += 1;
      p *= mean / k;
      s += p;
    }
    return k;
  };
  return { next, gauss, poisson };
}
