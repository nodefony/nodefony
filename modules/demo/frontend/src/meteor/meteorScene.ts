import {
  BOOM_METEOR,
  BOOM_PLANET,
  FIELD_RADIUS,
  MAX_PILOTS,
  PLANET_RADIUS,
  RING_RADIUS,
} from "./meteorDemo";

/**
 * Météores — la SCÈNE : tout ce qui se dessine, et rien d'autre.
 *
 * Guide pour un agent : ce fichier ne connaît ni la socket, ni le serveur, ni
 * l'état du jeu. La page (`meteorClient.ts`) reçoit les trames, interpole, et
 * appelle `render(view, dt)` à chaque image avec des positions déjà calculées ;
 * la scène les peint en Canvas 2D, sans aucune dépendance. Elle ne pose aucun
 * écouteur et ne touche à aucun élément du document hors du canvas reçu — les
 * canvas hors écran qu'elle fabrique (ciel, planète, sprites) restent détachés.
 *
 * Trois choix qui tiennent les 60 images par seconde avec 300 météores :
 * - ce qui ne bouge pas est PRÉ-RENDU une fois (ciel étoilé, planète, un sprite
 *   de roche par variante et par tranche de rayon, une traînée par tranche) et
 *   se blitte d'un `drawImage` ;
 * - les particules vivent dans un POOL FIXE (`Float32Array`) alloué à la
 *   construction : une explosion écrase les plus anciennes, rien n'est alloué
 *   pendant `render` ;
 * - la transparence passe par `globalAlpha` sur des couleurs CONSTANTES, jamais
 *   par une chaîne `rgba(...)` composée à l'image ; aucun `shadowBlur`.
 */

// ---------------------------------------------------------------------------
// Contrat avec la page
// ---------------------------------------------------------------------------

/** Un météore à peindre : position déjà interpolée, rayon et vie du serveur. */
export interface IMeteorDrawn {
  id: number;
  x: number;
  y: number;
  r: number;
  hp: number;
}

/** Un tir à peindre : position déjà extrapolée, cap en radians. */
export interface IShotDrawn {
  x: number;
  y: number;
  angle: number;
}

/** Un canon à peindre : sa place colore, `mine` l'agrandit, `firing` l'éclaire. */
export interface ICannonDrawn {
  angle: number;
  slot: number;
  robot: boolean;
  firing: boolean;
  mine: boolean;
}

/** Une explosion à déclencher : `kind` vaut `BOOM_METEOR` ou `BOOM_PLANET`. */
export interface IBoomDrawn {
  x: number;
  y: number;
  size: number;
  kind: number;
}

/** Ce que la page donne à chaque image — des positions déjà prêtes à peindre. */
export interface IMeteorSceneView {
  /** Positions déjà interpolées. */
  meteors: readonly IMeteorDrawn[];
  /** Positions déjà extrapolées. */
  shots: readonly IShotDrawn[];
  cannons: readonly ICannonDrawn[];
  /** Explosions NOUVELLES depuis l'appel précédent : à déclencher une fois. */
  booms: readonly IBoomDrawn[];
  /** Vie de la planète, 0 à 100. */
  health: number;
  phase: "play" | "fallen";
  /** Angle visé localement par le joueur (réticule immédiat), ou null. */
  aim: number | null;
}

/** La scène : on lui donne une vue par image, une taille au redimensionnement. */
export interface IMeteorScene {
  /** Peint une image ; `dtSeconds` = temps écoulé depuis l'image précédente. */
  render(view: IMeteorSceneView, dtSeconds: number): void;
  /** Taille CSS du canvas ; la scène applique elle-même le devicePixelRatio. */
  resize(cssWidth: number, cssHeight: number): void;
  /** Point de l'écran (clientX/clientY) → angle autour de la planète, en radians (`Math.atan2(y, x)` dans le repère du monde). */
  angleAt(clientX: number, clientY: number): number;
  /** Libère les canvas hors écran ; la scène ne peint plus rien ensuite. */
  dispose(): void;
}

/** Les options qui changent le coût du rendu, fixées à la création. */
export interface IMeteorSceneOptions {
  /** Pas de tremblement, pas de dérive des étoiles, pas de pulsation décorative. */
  reducedMotion: boolean;
  /** Moins de particules, sprites moins fins, devicePixelRatio plafonné à 1,5. */
  lowPower: boolean;
}

/** Une couleur néon par place de canon (place 0 : cyan) ; au-delà, on boucle. */
export const CANNON_COLORS: readonly string[] = [
  "#3ee6ff",
  "#ff4fd8",
  "#b6ff3b",
  "#ffb02e",
  "#8a7bff",
  "#ff5c5c",
  "#2effa8",
  "#ffe94a",
];

// ---------------------------------------------------------------------------
// Réglages du rendu
// ---------------------------------------------------------------------------

/** 2π, en littéral : la page d'apprentissage cite des extraits où une MAJUSCULE vaut une valeur. */
const TAU = 6.283185307179586;
/** Le ciel tient dans le canvas avec 2 % de marge. */
const FIELD_MARGIN = 1.02;
/** Pas de rayon entre deux sprites de roche, et bornes des tranches. */
const RADIUS_STEP = 2;
const MIN_BUCKET = 2;
const MAX_BUCKET = 22;
/** Silhouettes différentes d'une roche ; la variante se lit dans `id`. */
const ROCK_VARIANTS = 8;
/** Finesse maximale des sprites, en pixels par unité du monde. */
const SPRITE_PIXELS_PER_UNIT = 2.5;
const LOW_SPRITE_PIXELS_PER_UNIT = 1.5;

/** Pool des particules : `PARTICLE_STRIDE` flottants par particule. */
const PARTICLE_STRIDE = 9;
const P_X = 0;
const P_Y = 1;
const P_VX = 2;
const P_VY = 3;
const P_LIFE = 4;
const P_MAX_LIFE = 5;
const P_SIZE = 6;
/** 0 = palette chaude (roche), 1 = froide (bouclier). */
const P_TONE = 7;
/** Indice dans `PALETTES`, recalculé à la mise à jour ; −1 pour une particule morte. */
const P_COLOR = 8;
/** Teintes par palette, du neuf au mourant. */
const PALETTE_BANDS = 4;
const PARTICLE_POOL = 2048;
const LOW_PARTICLE_POOL = 768;

/** Éclairs d'explosion : x, y, taille, âge (0 → 1). */
const FLASH_STRIDE = 4;
const FLASH_POOL = 24;
/** Ondes de choc : x, y, âge (0 → 1). */
const SHOCK_STRIDE = 3;
const SHOCK_POOL = 8;

/** Fissures de la planète tombée : CRACKS polylignes de CRACK_POINTS points. */
const CRACKS = 7;
const CRACK_POINTS = 6;

/** Sous cette vie, l'atmosphère vire au rouge. */
const DANGER_HEALTH = 30;
/** Longueur d'un trait de tir, en unités du monde. */
const SHOT_LENGTH = 16;
/** Au-delà (au carré), un météore vient de naître : une vie plus basse qu'un ancien homonyme n'est pas un coup. */
const spawnEdgeSq = FIELD_RADIUS * 0.96 * (FIELD_RADIUS * 0.96);

const SHIELD_DASH: number[] = [18, 9];
const RETICLE_DASH: number[] = [6, 10];
const NO_DASH: number[] = [];

const COLOR_WHITE = "#ffffff";
const COLOR_SHIELD = "#3ee6ff";
const COLOR_SHIELD_DANGER = "#ff6a4a";
const COLOR_RING = "rgba(140, 170, 255, 0.18)";
const COLOR_SHOT_GLOW = "rgba(62, 230, 255, 0.45)";
const COLOR_SHOCK = "#ffb8a0";
const COLOR_FALLEN_FILL = "#08040e";
const COLOR_CRACK = "#ff7a2a";
const COLOR_CRACK_CORE = "#ffe2a8";
const COLOR_FLASH_CORE = "#fff6dc";
const COLOR_ROBOT_EYE = "#0b0a1a";

/** Palette chaude (4 teintes, du neuf au mourant) puis palette froide. */
const PALETTES: readonly string[] = [
  "#ffffff",
  "#ffe08a",
  "#ff8c3a",
  "#c8321e",
  "#ffffff",
  "#bff6ff",
  "#3ee6ff",
  "#2a7bd6",
];

// ---------------------------------------------------------------------------
// Petits outils purs
// ---------------------------------------------------------------------------

/** Un réel stable dans [0, 1) pour un entier : la même roche garde sa forme d'une image à l'autre. */
function hashUnit(n: number): number {
  let h = (n ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** `#rrggbb` → `rgba(r, g, b, alpha)` — à la construction seulement. */
function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Tranche de rayon d'un météore : le sprite le plus proche de sa taille. */
function bucketOf(radius: number): number {
  return clamp(Math.round(radius / RADIUS_STEP), MIN_BUCKET, MAX_BUCKET);
}

/** Un canvas détaché, jamais inséré dans le document. */
function offscreen(
  from: HTMLCanvasElement,
  width: number,
  height: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = from.ownerDocument.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(width));
  canvas.height = Math.max(1, Math.ceil(height));
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("Canvas 2D indisponible pour un canvas hors écran");
  }
  return { canvas, ctx };
}

/** Silhouette d'une roche : polygone irrégulier, le même pour une variante donnée. */
function traceRockOutline(
  g: CanvasRenderingContext2D,
  radius: number,
  variant: number,
): void {
  const vertices = 10 + (variant % 3);
  g.beginPath();
  for (let i = 0; i < vertices; i += 1) {
    const angle =
      (i / vertices) * TAU +
      (hashUnit(variant * 131 + i * 17 + 9) - 0.5) * 0.25;
    const r = radius * (0.8 + 0.28 * hashUnit(variant * 131 + i * 17 + 7));
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) {
      g.moveTo(x, y);
    } else {
      g.lineTo(x, y);
    }
  }
  g.closePath();
}

/** Un sprite pré-rendu : le canvas, et son emprise en unités du monde. */
interface ISprite {
  canvas: HTMLCanvasElement;
  /** Décalage du point d'ancrage (centre de la roche) depuis le bord gauche. */
  anchorX: number;
  anchorY: number;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// La scène
// ---------------------------------------------------------------------------

class MeteorScene implements IMeteorScene {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly reducedMotion: boolean;
  private readonly lowPower: boolean;
  private disposed = false;

  // Géométrie courante.
  private cssWidth = 0;
  private cssHeight = 0;
  private dpr = 1;
  /** Unités du monde → pixels CSS. */
  private scale = 1;
  /** Unités du monde → pixels du canvas (`scale × dpr`). */
  private k = 1;
  /** Translation du repère du monde, en pixels du canvas, tremblement compris. */
  private tx = 0;
  private ty = 0;

  // Temps et état de rendu (jamais l'état du jeu : seulement ce qui anime).
  private time = 0;
  private shake = 0;
  private planetHit = 0;
  private starDrift = 0;
  private lastHealth = 100;
  private lastPhase: "play" | "fallen" = "play";
  private fallenTime = 0;
  private fallenTimer = 0;
  private rng = 0x2545f491;

  // Pools fixes.
  private readonly particles: Float32Array;
  private readonly particleCount: number;
  private particleCursor = 0;
  private readonly flashes = new Float32Array(FLASH_POOL * FLASH_STRIDE);
  private flashCursor = 0;
  private readonly shocks = new Float32Array(SHOCK_POOL * SHOCK_STRIDE);
  private shockCursor = 0;
  /** Dernière vie vue par identifiant de météore, et éclat du coup reçu. */
  private readonly lastHp = new Uint8Array(65536);
  private readonly hitFlash = new Float32Array(65536);
  /** Fissures de la planète tombée, en unités du monde. */
  private readonly cracks = new Float32Array(CRACKS * CRACK_POINTS * 2);

  // Pré-rendus (reconstruits au redimensionnement).
  private sky: HTMLCanvasElement | null = null;
  private nearStars: HTMLCanvasElement | null = null;
  private planet: ISprite | null = null;
  private readonly rocks: (ISprite | undefined)[] = [];
  private readonly trails: (ISprite | undefined)[] = [];

  // Dégradés en unités du monde : créés une fois, valides sous le repère du monde.
  private readonly atmosphereCalm: CanvasGradient;
  private readonly atmosphereDanger: CanvasGradient;
  private readonly shieldGlow: CanvasGradient;
  private readonly vignette: CanvasGradient;
  private readonly dangerVignette: CanvasGradient;
  private readonly flashGradient: CanvasGradient;
  private readonly halos: CanvasGradient[] = [];

  constructor(canvas: HTMLCanvasElement, options: IMeteorSceneOptions) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (ctx === null) {
      throw new Error("Canvas 2D indisponible");
    }
    this.canvas = canvas;
    this.ctx = ctx;
    this.reducedMotion = options.reducedMotion;
    this.lowPower = options.lowPower;

    this.particleCount = options.lowPower ? LOW_PARTICLE_POOL : PARTICLE_POOL;
    this.particles = new Float32Array(this.particleCount * PARTICLE_STRIDE);

    for (let i = 0; i <= MAX_BUCKET; i += 1) {
      this.trails.push(undefined);
    }
    for (let i = 0; i <= MAX_BUCKET * ROCK_VARIANTS + ROCK_VARIANTS; i += 1) {
      this.rocks.push(undefined);
    }

    this.atmosphereCalm = ctx.createRadialGradient(
      0,
      0,
      PLANET_RADIUS * 0.92,
      0,
      0,
      PLANET_RADIUS * 1.7,
    );
    this.atmosphereCalm.addColorStop(0, "rgba(90, 200, 255, 0.6)");
    this.atmosphereCalm.addColorStop(0.3, "rgba(60, 140, 255, 0.24)");
    this.atmosphereCalm.addColorStop(1, "rgba(40, 80, 200, 0)");

    this.atmosphereDanger = ctx.createRadialGradient(
      0,
      0,
      PLANET_RADIUS * 0.92,
      0,
      0,
      PLANET_RADIUS * 1.8,
    );
    this.atmosphereDanger.addColorStop(0, "rgba(255, 110, 70, 0.7)");
    this.atmosphereDanger.addColorStop(0.3, "rgba(255, 50, 40, 0.28)");
    this.atmosphereDanger.addColorStop(1, "rgba(200, 20, 20, 0)");

    this.shieldGlow = ctx.createRadialGradient(
      0,
      0,
      PLANET_RADIUS + 2,
      0,
      0,
      PLANET_RADIUS + 28,
    );
    this.shieldGlow.addColorStop(0, "rgba(62, 230, 255, 0)");
    this.shieldGlow.addColorStop(0.35, "rgba(62, 230, 255, 0.22)");
    this.shieldGlow.addColorStop(0.5, "rgba(62, 230, 255, 0.5)");
    this.shieldGlow.addColorStop(0.65, "rgba(62, 230, 255, 0.18)");
    this.shieldGlow.addColorStop(1, "rgba(62, 230, 255, 0)");

    this.vignette = ctx.createRadialGradient(
      0,
      0,
      FIELD_RADIUS * 0.7,
      0,
      0,
      FIELD_RADIUS * 1.3,
    );
    this.vignette.addColorStop(0, "rgba(4, 3, 12, 0)");
    this.vignette.addColorStop(1, "rgba(4, 3, 12, 0.6)");

    this.dangerVignette = ctx.createRadialGradient(
      0,
      0,
      FIELD_RADIUS * 0.55,
      0,
      0,
      FIELD_RADIUS * 1.2,
    );
    this.dangerVignette.addColorStop(0, "rgba(140, 10, 25, 0)");
    this.dangerVignette.addColorStop(1, "rgba(140, 10, 25, 0.5)");

    this.flashGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    this.flashGradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    this.flashGradient.addColorStop(0.3, "rgba(255, 225, 170, 0.55)");
    this.flashGradient.addColorStop(1, "rgba(255, 160, 80, 0)");

    for (const color of CANNON_COLORS) {
      const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
      halo.addColorStop(0, withAlpha(color, 0.55));
      halo.addColorStop(0.5, withAlpha(color, 0.18));
      halo.addColorStop(1, withAlpha(color, 0));
      this.halos.push(halo);
    }

    this.buildCracks();
  }

  // -------------------------------------------------------------------------
  // Contrat public
  // -------------------------------------------------------------------------

  resize(cssWidth: number, cssHeight: number): void {
    if (this.disposed) {
      return;
    }
    const width = Math.max(1, Math.floor(cssWidth));
    const height = Math.max(1, Math.floor(cssHeight));
    const ratio = typeof devicePixelRatio === "number" ? devicePixelRatio : 1;
    this.dpr = clamp(ratio, 1, this.lowPower ? 1.5 : 2);
    this.cssWidth = width;
    this.cssHeight = height;
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.scale = Math.min(width, height) / (2 * FIELD_RADIUS * FIELD_MARGIN);
    this.k = this.scale * this.dpr;
    this.tx = (width / 2) * this.dpr;
    this.ty = (height / 2) * this.dpr;

    this.buildSky();
    this.buildPlanet();
    this.buildSprites();
  }

  angleAt(clientX: number, clientY: number): number {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left - this.cssWidth / 2;
    const y = clientY - rect.top - this.cssHeight / 2;
    return Math.atan2(y, x);
  }

  dispose(): void {
    this.disposed = true;
    this.sky = this.release(this.sky);
    this.nearStars = this.release(this.nearStars);
    if (this.planet !== null) {
      this.release(this.planet.canvas);
      this.planet = null;
    }
    for (const sprite of this.rocks) {
      if (sprite !== undefined) {
        this.release(sprite.canvas);
      }
    }
    this.rocks.fill(undefined);
    for (const sprite of this.trails) {
      if (sprite !== undefined) {
        this.release(sprite.canvas);
      }
    }
    this.trails.fill(undefined);
  }

  render(view: IMeteorSceneView, dtSeconds: number): void {
    if (this.disposed || this.cssWidth === 0 || this.sky === null) {
      return;
    }
    const dt = clamp(dtSeconds, 0, 0.1);
    this.time += dt;
    this.advanceState(view, dt);

    const ctx = this.ctx;
    this.drawSky(ctx, dt);
    this.enterWorld(ctx);

    const danger = view.phase === "play" && view.health < DANGER_HEALTH;
    const pulse = this.reducedMotion
      ? 0.5
      : 0.5 + 0.5 * Math.sin(this.time * 5);

    this.drawVignette(ctx, view, danger, pulse);
    this.drawPlanet(ctx, view, danger, pulse);
    this.drawShield(ctx, view, danger, pulse);
    this.drawShocks(ctx, dt);
    this.drawRing(ctx);
    this.drawReticle(ctx, view);
    this.drawMeteors(ctx, view.meteors, dt);
    this.drawShots(ctx, view.shots);
    this.drawCannons(ctx, view.cannons);
    this.drawParticles(ctx, dt);
    this.drawFlashes(ctx, dt);

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // -------------------------------------------------------------------------
  // État d'animation : ce que la vue déclenche, ce que le temps fait décroître
  // -------------------------------------------------------------------------

  /** Déclenche les explosions neuves, détecte la chute, fait vivre le tremblement. */
  private advanceState(view: IMeteorSceneView, dt: number): void {
    for (const boom of view.booms) {
      if (boom.kind === BOOM_PLANET) {
        this.spawnShock(boom.x, boom.y);
        this.spawnFlash(boom.x, boom.y, 14 + boom.size * 0.6);
        this.burst(boom.x, boom.y, boom.size, 1, this.lowPower ? 10 : 22);
        this.planetHit = 1;
        this.shake = Math.min(1.6, this.shake + 0.5 + boom.size / 60);
      } else if (boom.kind === BOOM_METEOR) {
        const count = clamp(Math.round(8 + boom.size * 1.3), 10, 60);
        this.spawnFlash(boom.x, boom.y, 8 + boom.size * 0.9);
        this.burst(
          boom.x,
          boom.y,
          boom.size,
          0,
          this.lowPower ? count >> 1 : count,
        );
      }
    }

    if (view.health < this.lastHealth) {
      this.planetHit = 1;
    }
    this.lastHealth = view.health;

    if (view.phase !== this.lastPhase) {
      this.lastPhase = view.phase;
      this.fallenTime = 0;
      this.fallenTimer = 0;
      if (view.phase === "fallen") {
        this.spawnShock(0, 0);
        this.spawnFlash(0, 0, PLANET_RADIUS * 1.4);
        this.burst(0, 0, 60, 0, this.lowPower ? 60 : 160);
        this.shake = 1.6;
      }
    }
    if (view.phase === "fallen") {
      this.fallenTime += dt;
      this.fallenTimer -= dt;
      if (this.fallenTimer <= 0) {
        const early = this.fallenTime < 4;
        const dist = Math.sqrt(this.nextUnit()) * PLANET_RADIUS * 0.9;
        const angle = this.nextUnit() * TAU;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        const size = early
          ? 14 + this.nextUnit() * 26
          : 6 + this.nextUnit() * 8;
        this.spawnFlash(x, y, size * 0.8);
        this.burst(x, y, size, 0, this.lowPower ? 8 : early ? 24 : 10);
        if (early && this.nextUnit() < 0.35) {
          this.spawnShock(x, y);
          this.shake = Math.min(1.6, this.shake + 0.4);
        }
        this.fallenTimer = early
          ? 0.08 + this.nextUnit() * 0.12
          : 0.4 + this.nextUnit() * 0.5;
      }
    }

    this.planetHit *= Math.exp(-dt * 8);
    this.shake *= Math.exp(-dt * 7);
    if (this.shake < 0.01) {
      this.shake = 0;
    }
  }

  /** Repère du monde : centre au milieu du canvas, tremblement en pixels CSS. */
  private enterWorld(ctx: CanvasRenderingContext2D): void {
    let offsetX = 0;
    let offsetY = 0;
    if (this.shake > 0 && !this.reducedMotion) {
      offsetX = (this.nextUnit() - 0.5) * 2 * this.shake * 6;
      offsetY = (this.nextUnit() - 0.5) * 2 * this.shake * 6;
    }
    this.tx = (this.cssWidth / 2 + offsetX) * this.dpr;
    this.ty = (this.cssHeight / 2 + offsetY) * this.dpr;
    ctx.setTransform(this.k, 0, 0, this.k, this.tx, this.ty);
  }

  /** Repère local : origine en (x, y) du monde, tourné de (cos, sin), à l'échelle `scale`. */
  private place(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    cos: number,
    sin: number,
    scale: number,
  ): void {
    const a = this.k * scale;
    ctx.setTransform(
      a * cos,
      a * sin,
      -a * sin,
      a * cos,
      this.k * x + this.tx,
      this.k * y + this.ty,
    );
  }

  private leaveLocal(ctx: CanvasRenderingContext2D): void {
    ctx.setTransform(this.k, 0, 0, this.k, this.tx, this.ty);
  }

  /** Générateur congruentiel : du hasard sans allocation, pour les gerbes et le tremblement. */
  private nextUnit(): number {
    this.rng = (Math.imul(this.rng, 1664525) + 1013904223) >>> 0;
    return this.rng / 4294967296;
  }

  // -------------------------------------------------------------------------
  // Pools : gerbes, éclairs, ondes de choc
  // -------------------------------------------------------------------------

  /** Une gerbe de `count` particules ; `tone` 0 = chaude (roche), 1 = froide (bouclier). */
  private burst(
    x: number,
    y: number,
    size: number,
    tone: number,
    count: number,
  ): void {
    const pool = this.particles;
    const vigor = 0.6 + size / 40;
    for (let n = 0; n < count; n += 1) {
      const at = this.particleCursor * PARTICLE_STRIDE;
      this.particleCursor = (this.particleCursor + 1) % this.particleCount;
      const angle = this.nextUnit() * TAU;
      const speed = (40 + this.nextUnit() * 150) * vigor;
      const life = 0.35 + this.nextUnit() * 0.75;
      pool[at + P_X] = x;
      pool[at + P_Y] = y;
      pool[at + P_VX] = Math.cos(angle) * speed;
      pool[at + P_VY] = Math.sin(angle) * speed;
      pool[at + P_LIFE] = life;
      pool[at + P_MAX_LIFE] = life;
      pool[at + P_SIZE] = 1.6 + this.nextUnit() * (1.6 + size / 12);
      pool[at + P_TONE] = tone;
      pool[at + P_COLOR] = tone * PALETTE_BANDS;
    }
  }

  private spawnFlash(x: number, y: number, size: number): void {
    const at = this.flashCursor * FLASH_STRIDE;
    this.flashCursor = (this.flashCursor + 1) % FLASH_POOL;
    this.flashes[at] = x;
    this.flashes[at + 1] = y;
    this.flashes[at + 2] = size;
    this.flashes[at + 3] = 0.0001;
  }

  private spawnShock(x: number, y: number): void {
    const at = this.shockCursor * SHOCK_STRIDE;
    this.shockCursor = (this.shockCursor + 1) % SHOCK_POOL;
    this.shocks[at] = x;
    this.shocks[at + 1] = y;
    this.shocks[at + 2] = 0.0001;
  }

  // -------------------------------------------------------------------------
  // Couches : ciel, vignette, planète, bouclier, anneau, réticule
  // -------------------------------------------------------------------------

  /** Ciel pré-rendu en un blit ; les étoiles proches dérivent lentement par-dessus. */
  private drawSky(ctx: CanvasRenderingContext2D, dt: number): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    if (this.sky !== null) {
      ctx.drawImage(this.sky, 0, 0);
    }
    const near = this.nearStars;
    if (near === null) {
      return;
    }
    const width = this.canvas.width;
    if (!this.reducedMotion) {
      this.starDrift = (this.starDrift + dt * 3 * this.dpr) % width;
      ctx.globalAlpha = 0.8 + 0.2 * Math.sin(this.time * 0.7);
    }
    const offset = Math.floor(this.starDrift);
    ctx.drawImage(near, offset, 0);
    if (offset > 0) {
      ctx.drawImage(near, offset - width, 0);
    }
    ctx.globalAlpha = 1;
  }

  private drawVignette(
    ctx: CanvasRenderingContext2D,
    view: IMeteorSceneView,
    danger: boolean,
    pulse: number,
  ): void {
    const halfW = this.cssWidth / this.scale / 2;
    const halfH = this.cssHeight / this.scale / 2;
    ctx.fillStyle = this.vignette;
    ctx.fillRect(-halfW, -halfH, halfW * 2, halfH * 2);
    if (danger || view.phase === "fallen") {
      ctx.globalAlpha =
        view.phase === "fallen"
          ? Math.min(1, this.fallenTime * 0.5)
          : 0.35 + 0.65 * pulse;
      ctx.fillStyle = this.dangerVignette;
      ctx.fillRect(-halfW, -halfH, halfW * 2, halfH * 2);
      ctx.globalAlpha = 1;
    }
  }

  /** Atmosphère (calme ou rouge), corps pré-rendu, puis la chute : nuit et fissures. */
  private drawPlanet(
    ctx: CanvasRenderingContext2D,
    view: IMeteorSceneView,
    danger: boolean,
    pulse: number,
  ): void {
    const reach = PLANET_RADIUS * 1.9;
    const fallen = view.phase === "fallen";
    const fade = fallen ? Math.max(0, 1 - this.fallenTime * 0.6) : 1;

    // Atmosphère calme, renforcée par l'impact ; rouge pulsant sous le seuil.
    ctx.globalAlpha = (danger ? 0.35 : 0.8 + 0.2 * this.planetHit) * fade;
    ctx.fillStyle = this.atmosphereCalm;
    ctx.fillRect(-reach, -reach, reach * 2, reach * 2);
    if (danger || this.planetHit > 0.02) {
      ctx.globalAlpha = danger
        ? (0.45 + 0.55 * pulse) * fade
        : this.planetHit * 0.6;
      ctx.fillStyle = this.atmosphereDanger;
      ctx.fillRect(-reach, -reach, reach * 2, reach * 2);
    }
    ctx.globalAlpha = 1;

    const planet = this.planet;
    if (planet !== null) {
      ctx.drawImage(
        planet.canvas,
        -planet.anchorX,
        -planet.anchorY,
        planet.width,
        planet.height,
      );
    }

    if (fallen) {
      ctx.globalAlpha = Math.min(0.78, this.fallenTime * 0.3);
      ctx.fillStyle = COLOR_FALLEN_FILL;
      ctx.beginPath();
      ctx.arc(0, 0, PLANET_RADIUS + 0.5, 0, TAU);
      ctx.fill();

      const glow = Math.min(1, this.fallenTime * 0.8);
      const flicker = this.reducedMotion
        ? 0.75
        : 0.55 + 0.45 * Math.sin(this.time * 3.1);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      this.traceCracks(ctx);
      ctx.globalAlpha = glow * flicker;
      ctx.strokeStyle = COLOR_CRACK;
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.globalAlpha = glow * flicker * 0.8;
      ctx.strokeStyle = COLOR_CRACK_CORE;
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }
  }

  private traceCracks(ctx: CanvasRenderingContext2D): void {
    const pts = this.cracks;
    ctx.beginPath();
    for (let c = 0; c < CRACKS; c += 1) {
      const base = c * CRACK_POINTS * 2;
      ctx.moveTo(pts.at(base) ?? 0, pts.at(base + 1) ?? 0);
      for (let p = 1; p < CRACK_POINTS; p += 1) {
        ctx.lineTo(pts.at(base + p * 2) ?? 0, pts.at(base + p * 2 + 1) ?? 0);
      }
    }
  }

  /** Bouclier : halo et anneau segmenté dont l'éclat suit la vie ; éteint quand la planète est tombée. */
  private drawShield(
    ctx: CanvasRenderingContext2D,
    view: IMeteorSceneView,
    danger: boolean,
    pulse: number,
  ): void {
    if (view.phase !== "play") {
      return;
    }
    const health = clamp(view.health, 0, 100) / 100;
    const reach = PLANET_RADIUS + 30;

    ctx.globalAlpha = 0.25 + 0.75 * health;
    ctx.fillStyle = this.shieldGlow;
    ctx.fillRect(-reach, -reach, reach * 2, reach * 2);

    ctx.setLineDash(SHIELD_DASH);
    ctx.lineDashOffset = this.reducedMotion ? 0 : -this.time * 26;
    ctx.lineCap = "butt";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 0, PLANET_RADIUS + 12, 0, TAU);
    ctx.globalAlpha = 0.2 + 0.7 * health + 0.3 * this.planetHit;
    ctx.strokeStyle = danger ? COLOR_SHIELD_DANGER : COLOR_SHIELD;
    ctx.stroke();
    if (danger) {
      ctx.globalAlpha = 0.3 * pulse;
      ctx.strokeStyle = COLOR_WHITE;
      ctx.stroke();
    }
    ctx.setLineDash(NO_DASH);
    ctx.lineDashOffset = 0;
    ctx.globalAlpha = 1;
  }

  /** Ondes de choc des impacts sur la planète : un cercle qui s'élargit et pâlit. */
  private drawShocks(ctx: CanvasRenderingContext2D, dt: number): void {
    const pool = this.shocks;
    let active = false;
    for (let i = 0; i < SHOCK_POOL; i += 1) {
      const age = pool.at(i * SHOCK_STRIDE + 2) ?? 0;
      if (age > 0 && age < 1) {
        active = true;
        break;
      }
    }
    if (!active) {
      return;
    }
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = COLOR_SHOCK;
    ctx.lineCap = "butt";
    for (let i = 0; i < SHOCK_POOL; i += 1) {
      const at = i * SHOCK_STRIDE;
      let age = pool.at(at + 2) ?? 0;
      if (age <= 0 || age >= 1) {
        continue;
      }
      const fade = (1 - age) * (1 - age);
      ctx.globalAlpha = fade * 0.9;
      ctx.lineWidth = 1 + 7 * (1 - age);
      ctx.beginPath();
      ctx.arc(pool.at(at) ?? 0, pool.at(at + 1) ?? 0, 6 + age * 230, 0, TAU);
      ctx.stroke();
      age += dt / 0.9;
      pool[at + 2] = age >= 1 ? 0 : age;
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  private drawRing(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = COLOR_RING;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, RING_RADIUS, 0, TAU);
    ctx.stroke();
  }

  /** Le réticule local : un trait pointillé radial et un repère sur l'anneau, à la couleur du joueur. */
  private drawReticle(
    ctx: CanvasRenderingContext2D,
    view: IMeteorSceneView,
  ): void {
    const aim = view.aim;
    if (aim === null) {
      return;
    }
    let color = COLOR_WHITE;
    for (const cannon of view.cannons) {
      if (cannon.mine) {
        color =
          CANNON_COLORS.at((cannon.slot % MAX_PILOTS) % CANNON_COLORS.length) ??
          COLOR_WHITE;
        break;
      }
    }
    const cos = Math.cos(aim);
    const sin = Math.sin(aim);
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.setLineDash(RETICLE_DASH);
    ctx.lineDashOffset = this.reducedMotion ? 0 : -this.time * 40;
    ctx.globalAlpha = 0.32;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cos * (RING_RADIUS + 26), sin * (RING_RADIUS + 26));
    ctx.lineTo(cos * FIELD_RADIUS * 0.98, sin * FIELD_RADIUS * 0.98);
    ctx.stroke();
    ctx.setLineDash(NO_DASH);
    ctx.lineDashOffset = 0;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, RING_RADIUS + 7, aim - 0.11, aim + 0.11);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // #region meteor-scene-draw
  /**
   * Les météores en deux passes : d'abord toutes les traînées (additives), puis
   * toutes les roches. La traînée pointe vers l'EXTÉRIEUR — le météore tombe
   * vers le centre, elle s'étire derrière lui — et se place sans trigonométrie :
   * le vecteur radial unitaire (x/d, y/d) est déjà la rotation voulue. La roche
   * tourne lentement sur elle-même (vitesse tirée de `id`, stable) ; un coup
   * reçu (`hp` qui baisse) la blanchit un instant.
   */
  private drawMeteors(
    ctx: CanvasRenderingContext2D,
    meteors: readonly IMeteorDrawn[],
    dt: number,
  ): void {
    const count = meteors.length;
    if (count === 0) {
      return;
    }
    const flashDecay = dt / 0.18;

    // Passe 1 — traînées, en lumière additive.
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 1;
    for (const m of meteors) {
      const bucket = bucketOf(m.r);
      const trail = this.trails.at(bucket);
      if (trail === undefined) {
        continue;
      }
      const d = Math.sqrt(m.x * m.x + m.y * m.y);
      const cos = d > 0.001 ? m.x / d : 1;
      const sin = d > 0.001 ? m.y / d : 0;
      const f = m.r / (bucket * RADIUS_STEP);
      this.place(ctx, m.x, m.y, cos, sin, f);
      ctx.drawImage(
        trail.canvas,
        -trail.anchorX,
        -trail.anchorY,
        trail.width,
        trail.height,
      );
    }

    // Passe 2 — roches, puis l'éclat d'un coup reçu.
    ctx.globalCompositeOperation = "source-over";
    for (const m of meteors) {
      const bucket = bucketOf(m.r);
      const id = m.id & 0xffff;
      const variant = id % ROCK_VARIANTS;
      const rock = this.rocks.at(bucket * ROCK_VARIANTS + variant);
      if (rock === undefined) {
        continue;
      }
      const f = m.r / (bucket * RADIUS_STEP);
      if (this.lowPower) {
        const d = Math.sqrt(m.x * m.x + m.y * m.y);
        this.place(
          ctx,
          m.x,
          m.y,
          d > 0.001 ? m.x / d : 1,
          d > 0.001 ? m.y / d : 0,
          f,
        );
      } else {
        const spin = (hashUnit(id * 7 + 3) - 0.5) * 1.8;
        const angle = this.time * spin + hashUnit(id) * TAU;
        this.place(ctx, m.x, m.y, Math.cos(angle), Math.sin(angle), f);
      }
      ctx.drawImage(
        rock.canvas,
        -rock.anchorX,
        -rock.anchorY,
        rock.width,
        rock.height,
      );

      // Un coup reçu : la vie a baissé depuis la dernière image — sauf au bord
      // du ciel, où l'identifiant vient d'être réattribué à un météore neuf.
      const last = this.lastHp.at(id) ?? 0;
      if (m.hp < last && m.x * m.x + m.y * m.y < spawnEdgeSq) {
        this.hitFlash[id] = 1;
      }
      this.lastHp[id] = m.hp;
      const flash = this.hitFlash.at(id) ?? 0;
      if (flash > 0) {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = flash;
        ctx.drawImage(
          rock.canvas,
          -rock.anchorX,
          -rock.anchorY,
          rock.width,
          rock.height,
        );
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        this.hitFlash[id] = flash - flashDecay > 0 ? flash - flashDecay : 0;
      }
    }
    this.leaveLocal(ctx);
  }
  // #endregion

  /** Tous les tirs dans UN chemin : un trait large et pâle, puis un cœur blanc. */
  private drawShots(
    ctx: CanvasRenderingContext2D,
    shots: readonly IShotDrawn[],
  ): void {
    const count = shots.length;
    if (count === 0) {
      return;
    }
    ctx.beginPath();
    for (const s of shots) {
      const cos = Math.cos(s.angle);
      const sin = Math.sin(s.angle);
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - cos * SHOT_LENGTH, s.y - sin * SHOT_LENGTH);
    }
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.strokeStyle = COLOR_SHOT_GLOW;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = COLOR_WHITE;
    ctx.globalAlpha = 0.95;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  /** Chaque canon dans son repère (+x vers l'extérieur) : halo du joueur, corps, bouche. */
  private drawCannons(
    ctx: CanvasRenderingContext2D,
    cannons: readonly ICannonDrawn[],
  ): void {
    for (const c of cannons) {
      const slot = (c.slot % MAX_PILOTS) % CANNON_COLORS.length;
      const color = CANNON_COLORS.at(slot) ?? COLOR_WHITE;
      const cos = Math.cos(c.angle);
      const sin = Math.sin(c.angle);
      const size = c.mine ? 1.35 : 1;
      this.place(ctx, cos * RING_RADIUS, sin * RING_RADIUS, cos, sin, size);

      if (c.mine) {
        const halo = this.halos.at(slot);
        if (halo !== undefined) {
          ctx.globalAlpha = this.reducedMotion
            ? 0.8
            : 0.7 + 0.3 * Math.sin(this.time * 2.4);
          ctx.fillStyle = halo;
          ctx.fillRect(-30, -30, 60, 60);
        }
      }

      ctx.globalAlpha = c.robot ? 0.7 : 1;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-7, 8.5);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-7, -8.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-4, 0, 4.2, 0, TAU);
      ctx.fill();
      if (c.robot) {
        ctx.fillStyle = COLOR_ROBOT_EYE;
        ctx.beginPath();
        ctx.arc(-4, 0, 1.8, 0, TAU);
        ctx.fill();
      }
      ctx.strokeStyle = COLOR_WHITE;
      ctx.lineCap = "round";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(16, 0);
      ctx.stroke();

      if (c.firing) {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = COLOR_FLASH_CORE;
        ctx.beginPath();
        ctx.arc(19, 0, 4.5, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(34, 0);
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.globalAlpha = 1;
    }
    this.leaveLocal(ctx);
  }

  /**
   * Particules : la mise à jour avance chaque particule vivante et range sa
   * teinte dans `P_COLOR` ; le dessin fait une passe par teinte (4 chaudes,
   * 4 froides) et ne lit qu'un flottant par particule pour l'écarter.
   */
  private drawParticles(ctx: CanvasRenderingContext2D, dt: number): void {
    const pool = this.particles;
    const total = this.particleCount * PARTICLE_STRIDE;
    const drag = Math.exp(-dt * 2.2);
    let alive = 0;
    for (let at = 0; at < total; at += PARTICLE_STRIDE) {
      const life = (pool.at(at + P_LIFE) ?? 0) - dt;
      if (life <= 0) {
        pool[at + P_LIFE] = 0;
        pool[at + P_COLOR] = -1;
        continue;
      }
      const vx = (pool.at(at + P_VX) ?? 0) * drag;
      const vy = (pool.at(at + P_VY) ?? 0) * drag;
      pool[at + P_X] = (pool.at(at + P_X) ?? 0) + vx * dt;
      pool[at + P_Y] = (pool.at(at + P_Y) ?? 0) + vy * dt;
      pool[at + P_VX] = vx;
      pool[at + P_VY] = vy;
      pool[at + P_LIFE] = life;
      const fraction = life / (pool.at(at + P_MAX_LIFE) ?? life);
      const band = Math.min(
        PALETTE_BANDS - 1,
        Math.floor((1 - fraction) * PALETTE_BANDS),
      );
      pool[at + P_COLOR] = (pool.at(at + P_TONE) ?? 0) * PALETTE_BANDS + band;
      alive += 1;
    }
    if (alive === 0) {
      return;
    }
    ctx.globalCompositeOperation = "lighter";
    for (let color = 0; color < PALETTES.length; color += 1) {
      const fill = PALETTES.at(color);
      if (fill === undefined) {
        continue;
      }
      ctx.fillStyle = fill;
      for (let at = 0; at < total; at += PARTICLE_STRIDE) {
        if (pool.at(at + P_COLOR) !== color) {
          continue;
        }
        const life = pool.at(at + P_LIFE) ?? 0;
        const fraction = life / (pool.at(at + P_MAX_LIFE) ?? life);
        const size = (pool.at(at + P_SIZE) ?? 0) * (0.35 + 0.65 * fraction);
        ctx.globalAlpha = Math.min(1, fraction * 1.6);
        ctx.fillRect(
          (pool.at(at + P_X) ?? 0) - size / 2,
          (pool.at(at + P_Y) ?? 0) - size / 2,
          size,
          size,
        );
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  /** Éclairs d'explosion : un disque radial qui grandit et s'éteint en un quart de seconde. */
  private drawFlashes(ctx: CanvasRenderingContext2D, dt: number): void {
    const pool = this.flashes;
    let active = false;
    for (let i = 0; i < FLASH_POOL; i += 1) {
      if ((pool.at(i * FLASH_STRIDE + 3) ?? 0) > 0) {
        active = true;
        break;
      }
    }
    if (!active) {
      return;
    }
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = this.flashGradient;
    for (let i = 0; i < FLASH_POOL; i += 1) {
      const at = i * FLASH_STRIDE;
      let age = pool.at(at + 3) ?? 0;
      if (age <= 0) {
        continue;
      }
      const radius = (pool.at(at + 2) ?? 0) * (0.5 + age * 1.6);
      ctx.globalAlpha = 1 - age;
      this.place(ctx, pool.at(at) ?? 0, pool.at(at + 1) ?? 0, 1, 0, radius);
      ctx.fillRect(-1, -1, 2, 2);
      age += dt / 0.25;
      pool[at + 3] = age >= 1 ? 0 : age;
    }
    this.leaveLocal(ctx);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  // -------------------------------------------------------------------------
  // Pré-rendus : construits à la création et au redimensionnement
  // -------------------------------------------------------------------------

  private release(canvas: HTMLCanvasElement | null): null {
    if (canvas !== null) {
      canvas.width = 0;
      canvas.height = 0;
    }
    return null;
  }

  /** Fissures : partent près du cœur, s'éloignent en zigzag jusqu'au bord. */
  private buildCracks(): void {
    const pts = this.cracks;
    for (let c = 0; c < CRACKS; c += 1) {
      const base = c * CRACK_POINTS * 2;
      const heading = (c / CRACKS) * TAU + hashUnit(c * 11 + 1) * 0.6;
      let x = Math.cos(heading) * PLANET_RADIUS * 0.15;
      let y = Math.sin(heading) * PLANET_RADIUS * 0.15;
      for (let p = 0; p < CRACK_POINTS; p += 1) {
        pts[base + p * 2] = x;
        pts[base + p * 2 + 1] = y;
        const step = (PLANET_RADIUS * 0.82) / (CRACK_POINTS - 1);
        const wobble = (hashUnit(c * 97 + p * 13 + 5) - 0.5) * 0.9;
        x += Math.cos(heading + wobble) * step;
        y += Math.sin(heading + wobble) * step;
      }
    }
  }

  /** Ciel : dégradé, nébuleuses diffuses, étoiles lointaines en un canvas ; étoiles proches sur un second, transparent. */
  private buildSky(): void {
    this.sky = this.release(this.sky);
    this.nearStars = this.release(this.nearStars);
    const width = this.canvas.width;
    const height = this.canvas.height;
    const dpr = this.dpr;

    const sky = offscreen(this.canvas, width, height);
    const g = sky.ctx;
    const gradient = g.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#07061a");
    gradient.addColorStop(0.55, "#0b0a1a");
    gradient.addColorStop(1, "#1c1140");
    g.fillStyle = gradient;
    g.fillRect(0, 0, width, height);

    // Trois nappes de nébuleuse, très diffuses : la profondeur pour presque rien.
    const nebulae: readonly (readonly [number, number, number, string])[] = [
      [0.22, 0.3, 0.55, "rgba(120, 70, 200, 0.2)"],
      [0.78, 0.68, 0.6, "rgba(40, 160, 200, 0.14)"],
      [0.6, 0.15, 0.45, "rgba(200, 60, 160, 0.11)"],
    ];
    for (const nebula of nebulae) {
      const cx = nebula[0] * width;
      const cy = nebula[1] * height;
      const radius = nebula[2] * Math.max(width, height);
      const glow = g.createRadialGradient(cx, cy, 0, cx, cy, radius);
      glow.addColorStop(0, nebula[3]);
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      g.fillStyle = glow;
      g.fillRect(0, 0, width, height);
    }

    const area = (width / dpr) * (height / dpr);
    const farCount = clamp(Math.round(area / 2200), 150, 900);
    this.scatterStars(g, farCount, 0.45, 1.3, 0.35, 1, 11);

    if (!this.lowPower) {
      const near = offscreen(this.canvas, width, height);
      const nearCount = clamp(Math.round(area / 7000), 50, 260);
      this.scatterStars(near.ctx, nearCount, 0.9, 1.9, 0.6, 1, 29);
      this.nearStars = near.canvas;
    } else {
      this.scatterStars(
        g,
        clamp(Math.round(area / 9000), 40, 200),
        0.9,
        1.8,
        0.6,
        1,
        29,
      );
    }
    this.sky = sky.canvas;
  }

  /** Des étoiles déterministes (graine `seed`) ; 4 % reçoivent un halo doux. */
  private scatterStars(
    g: CanvasRenderingContext2D,
    count: number,
    minRadius: number,
    maxRadius: number,
    minAlpha: number,
    maxAlpha: number,
    seed: number,
  ): void {
    const width = g.canvas.width;
    const height = g.canvas.height;
    const dpr = this.dpr;
    const tints: readonly string[] = [
      "#ffffff",
      "#dbe9ff",
      "#ffe9c4",
      "#c9f6ff",
    ];
    for (let i = 0; i < count; i += 1) {
      const x = hashUnit(seed + i * 4) * width;
      const y = hashUnit(seed + i * 4 + 1) * height;
      const radius =
        (minRadius + hashUnit(seed + i * 4 + 2) * (maxRadius - minRadius)) *
        dpr;
      const alpha =
        minAlpha + hashUnit(seed + i * 4 + 3) * (maxAlpha - minAlpha);
      const tint = tints.at((seed + i) % tints.length) ?? COLOR_WHITE;
      if (hashUnit(seed * 3 + i * 7) < 0.04) {
        const halo = g.createRadialGradient(x, y, 0, x, y, radius * 6);
        halo.addColorStop(0, withAlpha(tint, 0.5));
        halo.addColorStop(1, withAlpha(tint, 0));
        g.fillStyle = halo;
        g.fillRect(x - radius * 6, y - radius * 6, radius * 12, radius * 12);
      }
      g.globalAlpha = alpha;
      g.fillStyle = tint;
      g.beginPath();
      g.arc(x, y, radius, 0, TAU);
      g.fill();
    }
    g.globalAlpha = 1;
  }

  /** La planète : océan en dégradé, terres déterministes, nuages, ombre du terminateur, liseré. */
  private buildPlanet(): void {
    if (this.planet !== null) {
      this.release(this.planet.canvas);
      this.planet = null;
    }
    const q = this.spritePixelsPerUnit();
    const margin = 1.06;
    const halfWorld = PLANET_RADIUS * margin;
    const px = halfWorld * q;
    const sprite = offscreen(this.canvas, px * 2, px * 2);
    const g = sprite.ctx;
    g.translate(px, px);
    g.scale(q, q);
    const R = PLANET_RADIUS;

    g.beginPath();
    g.arc(0, 0, R, 0, TAU);
    g.closePath();
    g.save();
    g.clip();

    const ocean = g.createRadialGradient(
      -R * 0.35,
      -R * 0.4,
      R * 0.1,
      0,
      0,
      R * 1.05,
    );
    ocean.addColorStop(0, "#8fe3ff");
    ocean.addColorStop(0.3, "#2f9be0");
    ocean.addColorStop(0.75, "#154f9e");
    ocean.addColorStop(1, "#0a1f4d");
    g.fillStyle = ocean;
    g.fillRect(-R, -R, R * 2, R * 2);

    // Terres : des amas de disques, verts puis ocres, posés par la même graine.
    for (let land = 0; land < 9; land += 1) {
      const cx = (hashUnit(land * 17 + 2) - 0.5) * 1.7 * R;
      const cy = (hashUnit(land * 17 + 3) - 0.5) * 1.7 * R;
      const blobs = 4 + (land % 3);
      g.fillStyle =
        land % 3 === 0
          ? "rgba(214, 178, 96, 0.75)"
          : "rgba(72, 190, 130, 0.78)";
      for (let b = 0; b < blobs; b += 1) {
        const bx = cx + (hashUnit(land * 53 + b * 7 + 1) - 0.5) * R * 0.45;
        const by = cy + (hashUnit(land * 53 + b * 7 + 2) - 0.5) * R * 0.45;
        const br = R * (0.06 + hashUnit(land * 53 + b * 7 + 3) * 0.14);
        g.beginPath();
        g.arc(bx, by, br, 0, TAU);
        g.fill();
      }
    }

    // Nuages : des arcs blancs translucides, étirés.
    g.strokeStyle = "rgba(255, 255, 255, 0.16)";
    g.lineCap = "round";
    for (let cloud = 0; cloud < 7; cloud += 1) {
      const y = (hashUnit(cloud * 31 + 4) - 0.5) * 1.6 * R;
      const x = (hashUnit(cloud * 31 + 5) - 0.5) * 1.2 * R;
      const len = R * (0.3 + hashUnit(cloud * 31 + 6) * 0.5);
      g.lineWidth = R * (0.05 + hashUnit(cloud * 31 + 7) * 0.06);
      g.beginPath();
      g.moveTo(x - len / 2, y);
      g.quadraticCurveTo(x, y - R * 0.06, x + len / 2, y + R * 0.02);
      g.stroke();
    }

    // Terminateur : la nuit gagne le bas-droit.
    const shade = g.createRadialGradient(
      -R * 0.45,
      -R * 0.45,
      R * 0.2,
      0,
      0,
      R * 1.15,
    );
    shade.addColorStop(0, "rgba(0, 0, 20, 0)");
    shade.addColorStop(0.6, "rgba(0, 0, 20, 0.12)");
    shade.addColorStop(1, "rgba(0, 0, 20, 0.7)");
    g.fillStyle = shade;
    g.fillRect(-R, -R, R * 2, R * 2);
    g.restore();

    // Liseré lumineux du limbe.
    g.strokeStyle = "rgba(170, 230, 255, 0.55)";
    g.lineWidth = R * 0.03;
    g.beginPath();
    g.arc(0, 0, R - R * 0.012, 0, TAU);
    g.stroke();

    this.planet = {
      canvas: sprite.canvas,
      anchorX: halfWorld,
      anchorY: halfWorld,
      width: halfWorld * 2,
      height: halfWorld * 2,
    };
  }

  private spritePixelsPerUnit(): number {
    const cap = this.lowPower
      ? LOW_SPRITE_PIXELS_PER_UNIT
      : SPRITE_PIXELS_PER_UNIT;
    return Math.min(this.k, cap);
  }

  /** Une traînée par tranche de rayon, une roche par tranche et par variante. */
  private buildSprites(): void {
    const q = this.spritePixelsPerUnit();
    for (let bucket = MIN_BUCKET; bucket <= MAX_BUCKET; bucket += 1) {
      const radius = bucket * RADIUS_STEP;
      const previousTrail = this.trails.at(bucket);
      if (previousTrail !== undefined) {
        this.release(previousTrail.canvas);
      }
      this.trails[bucket] = this.buildTrail(radius, q);
      for (let variant = 0; variant < ROCK_VARIANTS; variant += 1) {
        const index = bucket * ROCK_VARIANTS + variant;
        const previous = this.rocks.at(index);
        if (previous !== undefined) {
          this.release(previous.canvas);
        }
        this.rocks[index] = this.buildRock(radius, variant, q);
      }
    }
  }

  /** Traînée : halo chaud autour de la roche, flamme effilée vers +x. */
  private buildTrail(radius: number, q: number): ISprite {
    const glow = radius * 1.9;
    const length = radius * 3.2 + 24;
    const width = glow + length;
    const height = glow * 2;
    const sprite = offscreen(this.canvas, width * q, height * q);
    const g = sprite.ctx;
    g.scale(q, q);
    g.translate(glow, glow);

    const flame = g.createLinearGradient(0, 0, length, 0);
    flame.addColorStop(0, "rgba(255, 200, 120, 0.6)");
    flame.addColorStop(0.25, "rgba(255, 120, 50, 0.38)");
    flame.addColorStop(0.7, "rgba(220, 70, 30, 0.12)");
    flame.addColorStop(1, "rgba(200, 60, 30, 0)");
    g.fillStyle = flame;
    g.beginPath();
    g.moveTo(0, -radius * 0.75);
    g.quadraticCurveTo(length * 0.45, -radius * 0.55, length, 0);
    g.quadraticCurveTo(length * 0.45, radius * 0.55, 0, radius * 0.75);
    g.closePath();
    g.fill();

    const aura = g.createRadialGradient(0, 0, radius * 0.6, 0, 0, glow);
    aura.addColorStop(0, "rgba(255, 170, 80, 0.5)");
    aura.addColorStop(0.5, "rgba(255, 120, 60, 0.16)");
    aura.addColorStop(1, "rgba(255, 100, 50, 0)");
    g.fillStyle = aura;
    g.fillRect(-glow, -glow, glow * 2, glow * 2);

    return {
      canvas: sprite.canvas,
      anchorX: glow,
      anchorY: glow,
      width,
      height,
    };
  }

  /** Roche : polygone irrégulier (variante), lave en dégradé, cratères, liseré, éclats. */
  private buildRock(radius: number, variant: number, q: number): ISprite {
    const half = radius * 1.3;
    const sprite = offscreen(this.canvas, half * 2 * q, half * 2 * q);
    const g = sprite.ctx;
    g.scale(q, q);
    g.translate(half, half);

    traceRockOutline(g, radius, variant);

    const lava = g.createRadialGradient(
      -radius * 0.3,
      -radius * 0.3,
      0,
      0,
      0,
      radius * 1.2,
    );
    lava.addColorStop(0, "#fff1c2");
    lava.addColorStop(0.25, "#ffb25a");
    lava.addColorStop(0.6, "#c2521d");
    lava.addColorStop(1, "#5a1e0e");
    g.fillStyle = lava;
    g.fill();
    g.save();
    g.clip();

    for (let c = 0; c < 3; c += 1) {
      const cx = (hashUnit(variant * 71 + c * 5 + 1) - 0.5) * radius * 1.1;
      const cy = (hashUnit(variant * 71 + c * 5 + 2) - 0.5) * radius * 1.1;
      const cr = radius * (0.12 + hashUnit(variant * 71 + c * 5 + 3) * 0.13);
      g.fillStyle = "rgba(60, 20, 10, 0.5)";
      g.beginPath();
      g.arc(cx, cy, cr, 0, TAU);
      g.fill();
      g.strokeStyle = "rgba(255, 210, 150, 0.35)";
      g.lineWidth = radius * 0.04;
      g.beginPath();
      g.arc(cx, cy, cr, Math.PI * 0.9, Math.PI * 1.8);
      g.stroke();
    }
    for (let s = 0; s < 4; s += 1) {
      const sx = (hashUnit(variant * 43 + s * 3 + 1) - 0.5) * radius * 1.2;
      const sy = (hashUnit(variant * 43 + s * 3 + 2) - 0.5) * radius * 1.2;
      g.fillStyle = "rgba(255, 240, 200, 0.75)";
      g.beginPath();
      g.arc(sx, sy, radius * 0.06, 0, TAU);
      g.fill();
    }
    g.restore();

    // Le chemin courant est le dernier éclat : retracer la silhouette avant le liseré.
    traceRockOutline(g, radius, variant);
    g.strokeStyle = "rgba(255, 190, 120, 0.55)";
    g.lineJoin = "round";
    g.lineWidth = radius * 0.08;
    g.stroke();

    return {
      canvas: sprite.canvas,
      anchorX: half,
      anchorY: half,
      width: half * 2,
      height: half * 2,
    };
  }
}

/**
 * Crée la scène sur le canvas reçu. Appeler `resize` avant la première image ;
 * la scène ne peint rien tant qu'elle ne connaît pas sa taille.
 *
 * @param canvas - le canvas de la page, seul élément du document que la scène touche
 * @param options - `reducedMotion` coupe le décoratif, `lowPower` allège le rendu
 * @throws Si le navigateur ne fournit pas de contexte 2D
 */
export function createMeteorScene(
  canvas: HTMLCanvasElement,
  options: IMeteorSceneOptions,
): IMeteorScene {
  return new MeteorScene(canvas, options);
}
