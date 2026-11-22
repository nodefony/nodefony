import {
  DEAD_TIME_US,
  KEV_PER_CHANNEL,
  MCA_CHANNELS,
  sourceRate,
} from "../../frontend/src/sensor/sensorDemo";
import { measuredRate } from "../../frontend/src/sensor/sensorStats";
import type { IRandom } from "./random";

/**
 * Une source de césium 137 devant un scintillateur NaI(Tl) et son analyseur
 * multicanal : le spectre qui se remplit coup après coup, le temps mort qui
 * mange une part des coups quand la source est forte.
 *
 * Guide pour un agent : la FONCTION DE RÉPONSE (ce qu'un photon de 662 keV
 * dépose dans le cristal : pic photoélectrique, continuum Compton jusqu'au
 * front à 477 keV, pic de rétrodiffusion à 184 keV, raie X du baryum à 32 keV,
 * fond ambiant — le tout élargi par la résolution, 7 % à 662 keV et ∝ √E)
 * est calculée UNE fois, en densité sur les 1 024 canaux, puis en fonction
 * de répartition. Chaque coup tire ensuite son canal par une recherche
 * dichotomique dans cette répartition : le coût d'un pas est borné par le
 * taux MESURÉ (après temps mort), jamais par la finesse du modèle. Le nombre
 * de coups d'un pas suit Poisson autour de `measuredRate × dt`.
 */

/** Un canal touché depuis la trame précédente, et combien de fois. */
export interface IChannelDelta {
  channel: number;
  count: number;
}

/** La source et sa chaîne de mesure. */
export interface IGammaSource {
  /** Règle l'activité (coups VRAIS par seconde), bornée par `sourceRate`. */
  setTrueRate(rate: number): void;
  readonly trueRate: number;
  /** Coups par seconde qui passent le temps mort. */
  readonly measuredRate: number;
  /** Temps vif (pendant lequel la chaîne était prête) et temps d'horloge, en secondes. */
  readonly live: number;
  readonly real: number;
  /** Avance de `dt` secondes : tire les coups du pas dans le spectre. */
  step(dt: number): void;
  /** Les canaux touchés depuis l'appel précédent, croissants ; vide l'attente. */
  takeDelta(): IChannelDelta[];
  /** Le spectre cumulé depuis `reset` : une copie. */
  spectrum(): Uint32Array;
  /** Remet le spectre et les horloges à zéro ; l'activité est conservée. */
  reset(): void;
}

// #region sensor-gamma-source
/** Raie du baryum 137m (la désexcitation du Cs-137), en keV. */
const CS137_KEV = 661.657;
/** Masse de l'électron, en keV. */
const ELECTRON_MASS_KEV = 510.999;
/** Raie X K du baryum, en keV. */
const BARIUM_XRAY_KEV = 32.2;
/** Résolution du NaI(Tl) : largeur à mi-hauteur relative à 662 keV, et ∝ √E. */
const RESOLUTION_AT_CS137 = 0.07;
/** En dessous, la résolution ne se resserre plus (bruit électronique). */
const RESOLUTION_FLOOR_KEV = 5;
/** Largeur à mi-hauteur → écart-type d'une gaussienne. */
const FWHM_TO_SIGMA = 2.3548;
/** Part de chaque composante dans les coups détectés (somme 1). */
const MIX = {
  xray: 0.075,
  photopeak: 0.33,
  backscatter: 0.06,
  compton: 0.5,
  background: 0.035,
} as const;
/** Étalement propre du pic de rétrodiffusion (σ, keV) et énergie moyenne du fond. */
const BACKSCATTER_SPREAD_KEV = 25;
const BACKGROUND_MEAN_KEV = 150;
/** Finesse de la convolution des continuums par la résolution. */
const CONVOLUTION_STEPS = 512;
/** Au-delà de six écarts-types, une gaussienne ne pèse plus rien. */
const GAUSSIAN_REACH = 6;

/** Front Compton et pic de rétrodiffusion du Cs-137, en keV. */
const comptonEdgeKeV =
  CS137_KEV * (1 - 1 / (1 + (2 * CS137_KEV) / ELECTRON_MASS_KEV));
const backscatterKeV = CS137_KEV - comptonEdgeKeV;

/** Les repères du spectre, pour qui veut les tracer. */
export const gammaLines = {
  photopeak: CS137_KEV,
  comptonEdge: comptonEdgeKeV,
  backscatter: backscatterKeV,
  xray: BARIUM_XRAY_KEV,
} as const;

/** Écart-type de la réponse à l'énergie `e`. */
function sigmaAt(e: number): number {
  return (
    (RESOLUTION_AT_CS137 *
      CS137_KEV *
      Math.sqrt(Math.max(e, RESOLUTION_FLOOR_KEV) / CS137_KEV)) /
    FWHM_TO_SIGMA
  );
}

/**
 * Spectre des électrons Compton pour un photon de `CS137_KEV` (Klein–Nishina) :
 * densité, à un facteur près, en fonction de l'énergie `t` cédée à l'électron.
 */
function kleinNishinaElectron(t: number): number {
  const k = CS137_KEV / ELECTRON_MASS_KEV;
  const r = 1 - t / CS137_KEV;
  const cosine = 1 - (1 / r - 1) / k;
  return r + 1 / r - (1 - cosine * cosine);
}

/** Ajoute à `density` une gaussienne de poids `weight`, centrée sur `mu`. */
function addGaussian(
  density: Float64Array,
  weight: number,
  mu: number,
  sigma: number,
): void {
  const reach = GAUSSIAN_REACH * sigma;
  const lo = Math.max(0, Math.floor((mu - reach) / KEV_PER_CHANNEL));
  const hi = Math.min(
    MCA_CHANNELS - 1,
    Math.ceil((mu + reach) / KEV_PER_CHANNEL),
  );
  const norm = weight / (sigma * Math.sqrt(2 * Math.PI));
  for (let c = lo; c <= hi; c += 1) {
    const z = ((c + 0.5) * KEV_PER_CHANNEL - mu) / sigma;
    density[c] = (density.at(c) ?? 0) + norm * Math.exp(-0.5 * z * z);
  }
}

/**
 * Ajoute à `density` un continuum `shape(t)` sur [0, `maxKeV`], élargi par la
 * résolution en chaque point, de poids total `weight`.
 */
function addContinuum(
  density: Float64Array,
  weight: number,
  maxKeV: number,
  shape: (t: number) => number,
): void {
  const dt = maxKeV / CONVOLUTION_STEPS;
  let total = 0;
  for (let i = 0; i < CONVOLUTION_STEPS; i += 1) total += shape((i + 0.5) * dt);
  for (let i = 0; i < CONVOLUTION_STEPS; i += 1) {
    const t = (i + 0.5) * dt;
    addGaussian(density, (weight * shape(t)) / total, t, sigmaAt(t));
  }
}

/**
 * Une table de nombres lue par indice, dont le type dit « peut-être absent »
 * quelle que soit la configuration du compilateur : la lecture directe
 * `table[i]` — dix fois moins chère que `.at(i)`, la seule tenable pour
 * 100 000 coups par seconde — reste ainsi gardée par `?? …` partout.
 */
interface INumberTable {
  [index: number]: number | undefined;
  readonly length: number;
}

/** La fonction de répartition sur les canaux, calculée une fois pour tous. */
let responseCdf: Float64Array | null = null;

/** Construit la réponse du détecteur et rend sa fonction de répartition. */
function buildResponseCdf(): Float64Array {
  const density = new Float64Array(MCA_CHANNELS);
  addGaussian(density, MIX.xray, BARIUM_XRAY_KEV, sigmaAt(BARIUM_XRAY_KEV));
  addGaussian(density, MIX.photopeak, CS137_KEV, sigmaAt(CS137_KEV));
  addGaussian(
    density,
    MIX.backscatter,
    backscatterKeV,
    Math.hypot(BACKSCATTER_SPREAD_KEV, sigmaAt(backscatterKeV)),
  );
  addContinuum(density, MIX.compton, comptonEdgeKeV, kleinNishinaElectron);
  addContinuum(density, MIX.background, MCA_CHANNELS * KEV_PER_CHANNEL, (t) =>
    Math.exp(-t / BACKGROUND_MEAN_KEV),
  );
  const cdf = new Float64Array(MCA_CHANNELS);
  let sum = 0;
  for (let c = 0; c < MCA_CHANNELS; c += 1) {
    sum += density.at(c) ?? 0;
    cdf[c] = sum;
  }
  for (let c = 0; c < MCA_CHANNELS; c += 1) cdf[c] = (cdf.at(c) ?? 0) / sum;
  cdf[MCA_CHANNELS - 1] = 1;
  return cdf;
}

/** Le canal d'un coup : premier canal dont la répartition dépasse `u`. */
function sampleChannel(cdf: INumberTable, u: number): number {
  let lo = 0;
  let hi = MCA_CHANNELS - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if ((cdf[mid] ?? 1) > u) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

/**
 * Rend la source et sa chaîne, à l'activité par défaut de `sourceRate`.
 *
 * @param random - la suite pseudo-aléatoire
 */
export function createGammaSource(random: IRandom): IGammaSource {
  responseCdf ??= buildResponseCdf();
  const cdf: INumberTable = responseCdf;
  const spectrum = new Uint32Array(MCA_CHANNELS);
  const pending = new Uint32Array(MCA_CHANNELS);
  // Les deux compteurs vus comme tables : la boucle des coups lit par indice.
  const spectrumTable: INumberTable = spectrum;
  const pendingTable: INumberTable = pending;
  let trueRate = 0;
  let measured = 0;
  let live = 0;
  let real = 0;
  const setTrueRate = (rate: number): void => {
    trueRate = Math.min(sourceRate.max, Math.max(sourceRate.min, rate));
    measured = measuredRate(trueRate, DEAD_TIME_US);
  };
  setTrueRate(sourceRate.default);
  return {
    setTrueRate,
    get trueRate() {
      return trueRate;
    },
    get measuredRate() {
      return measured;
    },
    get live() {
      return live;
    },
    get real() {
      return real;
    },
    step(dt: number): void {
      const hits = random.poisson(measured * dt);
      for (let i = 0; i < hits; i += 1) {
        const channel = sampleChannel(cdf, random.next());
        spectrumTable[channel] = (spectrumTable[channel] ?? 0) + 1;
        pendingTable[channel] = (pendingTable[channel] ?? 0) + 1;
      }
      real += dt;
      live += (dt * measured) / trueRate;
    },
    takeDelta(): IChannelDelta[] {
      const delta: IChannelDelta[] = [];
      for (let c = 0; c < MCA_CHANNELS; c += 1) {
        const count = pendingTable[c] ?? 0;
        if (count === 0) continue;
        delta.push({ channel: c, count });
        pending[c] = 0;
      }
      return delta;
    },
    spectrum(): Uint32Array {
      return spectrum.slice();
    },
    reset(): void {
      spectrum.fill(0);
      pending.fill(0);
      live = 0;
      real = 0;
    },
  };
}
// #endregion
