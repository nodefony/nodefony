import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { PRISM_RADIUS, prismTeamColors, prismTiles } from "./prismDemo";

/**
 * Prisme — le rendu 3D de l'arène, et rien d'autre.
 *
 * Guide pour un agent : ce module dessine ce que la page lui donne à chaque
 * image (`IPrismSceneView`) : 397 prismes hexagonaux qui montent et s'allument
 * à la couleur de l'équipe qui les tient, des drones en octaèdres émissifs qui
 * flottent avec une traînée lumineuse, un anneau pulsant sous le drone du
 * joueur, une caméra qui le suit en douceur, et un halo (bloom) hors mode
 * économie. Il ne connaît NI le réseau NI la règle du jeu : aucune socket,
 * aucun état de partie, aucune interpolation — c'est la page (`prismClient.ts`)
 * qui lit la trame, interpole les positions et appelle `render()` à 60 i/s.
 * Three.js (paquet `three`) n'est payé que par cette page, via `import()`.
 *
 * Coût par image : zéro allocation. Les `Matrix4`, `Vector3`, `Quaternion`,
 * `Color` de travail vivent au niveau du module ; chaque tableau est alloué une
 * fois à la création. Une case n'est réécrite vers le GPU que si son
 * propriétaire a changé ou si elle est en train de monter ou de descendre.
 */

/** Un drone tel que la page le présente : position déjà interpolée, dans le monde. */
export interface IPrismDroneView {
  id: number;
  team: number;
  x: number;
  z: number;
  mine: boolean;
}

/** Ce que la scène dessine à chaque image. */
export interface IPrismSceneView {
  /** Propriétaire de chaque case + 1, dans l'ordre de `prismTiles` ; 0 = neutre. */
  tiles: Uint8Array;
  drones: readonly IPrismDroneView[];
  phase: "play" | "podium";
  /** Équipe gagnante pendant le podium, sinon -1. */
  winner: number;
}

/** La scène : trois gestes, rien d'autre à connaître. */
export interface IPrismScene {
  /** Dessine une image ; `dtSeconds` = temps écoulé depuis la précédente. */
  render(view: IPrismSceneView, dtSeconds: number): void;
  /** Taille du canvas en pixels CSS (le ratio d'appareil est appliqué ici). */
  resize(width: number, height: number): void;
  /** Libère géométries, matériaux, passes et le contexte WebGL. */
  dispose(): void;
}

/** Couleurs des équipes (cyan, rose, ambre, lime) : la source est le contrat partagé. */
export const TEAM_COLORS: readonly [number, number, number, number] =
  prismTeamColors;

const BACKGROUND = 0x0b0a1a;

/** Rayon d'un prisme : un peu moins que la case, pour laisser un joint sombre. */
const TILE_RADIUS = 0.93;
/** Hauteur d'une case neutre, puis d'une case tenue. */
const TILE_LOW = 0.16;
const TILE_HIGH = 0.8;
/** Amplitude de la vague des cases gagnantes au podium. */
const TILE_PULSE = 0.3;
const TILE_RISE_RATE = 7;
/** Liseré lumineux au sommet : couronne entre ces deux rayons. */
const RIM_INNER = 0.78;
const RIM_LIFT = 0.012;

const DRONE_RADIUS = 0.46;
const DRONE_HOVER = 1.8;
const MAX_DRONES = 32;
/** Traînée : rangées du ruban, pas d'échantillonnage, demi-largeur, altitude. */
const TRAIL_ROWS = 16;
const TRAIL_SAMPLES = TRAIL_ROWS - 1;
const TRAIL_STEP = 1 / 40;
const TRAIL_HALF_WIDTH = 0.24;
const TRAIL_Y = 1.5;

const DUST_COUNT = 260;

const sqrt3Over3 = Math.sqrt(3) / 3;

// Objets de travail partagés : jamais alloués pendant `render`.
const workMatrix = new THREE.Matrix4();
const workPosition = new THREE.Vector3();
const workScale = new THREE.Vector3();
const workQuat = new THREE.Quaternion();
const workEuler = new THREE.Euler();
const workColor = new THREE.Color();
const identityQuat = new THREE.Quaternion();

/** Fraction du chemin parcourue en `dt` vers une cible : lissage indépendant de la cadence. */
function smoothing(rate: number, dt: number): number {
  return 1 - Math.exp(-dt * rate);
}

/** Les couleurs d'équipe en RVB linéaire, à plat : `[r0, g0, b0, r1, …]`. */
function teamPalette(): Float32Array {
  const rgb = new Float32Array(prismTeamColors.length * 3);
  let i = 0;
  for (const hex of prismTeamColors) {
    workColor.setHex(hex);
    rgb[i] = workColor.r;
    rgb[i + 1] = workColor.g;
    rgb[i + 2] = workColor.b;
    i += 3;
  }
  return rgb;
}

/** Ramène un indice d'équipe dans la palette. */
function paletteIndex(team: number): number {
  return team >= 0 ? (team % prismTeamColors.length) * 3 : 0;
}

/**
 * Branche la couleur d'instance sur l'ÉMISSION : de base, `MeshStandardMaterial`
 * ne la multiplie que sur le diffus. Avec un émissif blanc, chaque instance
 * rayonne donc sa propre couleur — et la luminance au-delà du seuil du bloom.
 */
function emissiveByInstance(material: THREE.MeshStandardMaterial): void {
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      [
        "#include <emissivemap_fragment>",
        "#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )",
        "totalEmissiveRadiance *= vColor.rgb;",
        "#endif",
      ].join("\n"),
    );
  };
  material.customProgramCacheKey = () => "prism-emissive-by-instance";
}

// #region prism-scene-tiles
/** Le champ de cases : deux `InstancedMesh` (prismes + liserés) pilotés par la trame. */
interface ITileField {
  /** Applique les propriétaires du tour ; `podiumTeam` = gagnant + 1, ou 0. */
  update(tiles: Uint8Array, podiumTeam: number, time: number, dt: number): void;
  /** Hauteur courante de la case sous un point du monde (0 hors grille). */
  heightAt(x: number, z: number): number;
  dispose(): void;
}

function createTileField(
  scene: THREE.Scene,
  palette: Float32Array,
  shadows: boolean,
): ITileField {
  const count = prismTiles.length;

  // Le prisme : un cylindre à six faces de hauteur 1, étiré par instance.
  // Pas de rotation : `CylinderGeometry` pose déjà un sommet sur +z, donc les
  // côtés plats regardent ±x — l'espacement √3 en x des `prismTiles`.
  const prismGeometry = new THREE.CylinderGeometry(
    TILE_RADIUS,
    TILE_RADIUS,
    1,
    6,
    1,
    false,
  );
  const prismMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.42,
    metalness: 0.18,
    emissive: 0xffffff,
    emissiveIntensity: 0.15,
    flatShading: true,
  });
  emissiveByInstance(prismMaterial);
  const prisms = new THREE.InstancedMesh(prismGeometry, prismMaterial, count);
  prisms.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const prismColors = new THREE.InstancedBufferAttribute(
    new Float32Array(count * 3),
    3,
  );
  prismColors.setUsage(THREE.DynamicDrawUsage);
  prisms.instanceColor = prismColors;
  prisms.castShadow = shadows;
  prisms.receiveShadow = shadows;
  // La sphère englobante d'un InstancedMesh est celle de SA géométrie (à l'origine) :
  // sans ceci, tout le champ disparaît dès que le centre sort du cadre.
  prisms.frustumCulled = false;

  // Le liseré : une couronne hexagonale posée sur le sommet, non éclairée, en HDR
  // pour les cases tenues (le bloom en fait un trait néon), violet sourd sinon —
  // c'est elle qui dessine la grille quand tout est neutre.
  const rimGeometry = new THREE.RingGeometry(
    RIM_INNER,
    TILE_RADIUS,
    6,
    1,
    Math.PI / 2,
  ).rotateX(-Math.PI / 2);
  const rimMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    toneMapped: false,
  });
  const rims = new THREE.InstancedMesh(rimGeometry, rimMaterial, count);
  rims.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const rimColors = new THREE.InstancedBufferAttribute(
    new Float32Array(count * 3),
    3,
  );
  rimColors.setUsage(THREE.DynamicDrawUsage);
  rims.instanceColor = rimColors;
  rims.frustumCulled = false;
  scene.add(prisms, rims);

  // État par case, alloué une fois.
  const tileX = new Float32Array(count);
  const tileZ = new Float32Array(count);
  const owners = new Uint8Array(count);
  const lastTeam = new Uint8Array(count);
  const heights = new Float32Array(count).fill(TILE_LOW);
  const targets = new Float32Array(count).fill(TILE_LOW);
  const span = PRISM_RADIUS * 2 + 1;
  const lookup = new Int16Array(span * span).fill(-1);

  const neutral = new THREE.Color(0x1b1838);
  const neutralRim = new THREE.Color(0x3a2f86);

  function write(
    i: number,
    x: number,
    z: number,
    height: number,
    team: number,
    pulse: number,
  ): void {
    workPosition.set(x, height * 0.5, z);
    workScale.set(1, height, 1);
    prisms.setMatrixAt(
      i,
      workMatrix.compose(workPosition, identityQuat, workScale),
    );
    rims.setMatrixAt(i, workMatrix.makeTranslation(x, height + RIM_LIFT, z));

    const lift = THREE.MathUtils.clamp(
      (height - TILE_LOW) / (TILE_HIGH - TILE_LOW),
      0,
      1,
    );
    const k = team * 3;
    const r = palette.at(k) ?? 0;
    const g = palette.at(k + 1) ?? 0;
    const b = palette.at(k + 2) ?? 0;
    const body = 0.85 + 0.15 * pulse;
    const glow = 0.75 + 0.15 * pulse;
    prismColors.setXYZ(
      i,
      neutral.r + (r * body - neutral.r) * lift,
      neutral.g + (g * body - neutral.g) * lift,
      neutral.b + (b * body - neutral.b) * lift,
    );
    rimColors.setXYZ(
      i,
      neutralRim.r + (r * glow - neutralRim.r) * lift,
      neutralRim.g + (g * glow - neutralRim.g) * lift,
      neutralRim.b + (b * glow - neutralRim.b) * lift,
    );
  }

  function flagDirty(): void {
    prisms.instanceMatrix.needsUpdate = true;
    prismColors.needsUpdate = true;
    rims.instanceMatrix.needsUpdate = true;
    rimColors.needsUpdate = true;
  }

  // Pose initiale : tout neutre, bas.
  prismTiles.forEach((tile, i) => {
    tileX[i] = tile.x;
    tileZ[i] = tile.z;
    lookup[(tile.q + PRISM_RADIUS) * span + tile.r + PRISM_RADIUS] = i;
    write(i, tile.x, tile.z, TILE_LOW, 0, 0);
  });
  flagDirty();

  function update(
    tiles: Uint8Array,
    podiumTeam: number,
    time: number,
    dt: number,
  ): void {
    const alpha = smoothing(TILE_RISE_RATE, dt);
    let dirty = false;
    let next = 0;
    for (const owner of tiles) {
      const i = next;
      if (i >= count) break;
      next += 1;
      const pulsing = podiumTeam !== 0 && owner === podiumTeam;
      let height = heights.at(i) ?? TILE_LOW;
      let target = targets.at(i) ?? TILE_LOW;
      if (owner !== owners.at(i)) {
        owners[i] = owner;
        if (owner !== 0) {
          lastTeam[i] = (owner - 1) % prismTeamColors.length;
        }
        target = owner === 0 ? TILE_LOW : TILE_HIGH;
        targets[i] = target;
      } else if (!pulsing && height === target) {
        // Le cas courant : rien ne bouge, trois lectures et on passe.
        continue;
      }
      const x = tileX.at(i) ?? 0;
      const z = tileZ.at(i) ?? 0;
      let pulse = 0;
      if (pulsing) {
        // Une vague traverse les cases du vainqueur.
        pulse = 0.5 + 0.5 * Math.sin(time * 4 - (x + z) * 0.35);
        target = TILE_HIGH + TILE_PULSE * pulse;
      }
      const gap = target - height;
      if (gap > -0.002 && gap < 0.002) {
        if (height === target) continue;
        height = target;
      } else {
        height += gap * alpha;
      }
      heights[i] = height;
      write(i, x, z, height, lastTeam.at(i) ?? 0, pulse);
      dirty = true;
    }
    if (dirty) flagDirty();
  }

  function heightAt(x: number, z: number): number {
    // Arrondi cubique des coordonnées axiales — la règle de `tileAt`, sans sa
    // clé texte : ici on est appelé à chaque image.
    const q = sqrt3Over3 * x - z / 3;
    const r = (2 / 3) * z;
    let rq = Math.round(q);
    let rr = Math.round(r);
    const rs = Math.round(-q - r);
    const dq = Math.abs(rq - q);
    const dr = Math.abs(rr - r);
    const ds = Math.abs(rs + q + r);
    if (dq > dr && dq > ds) rq = -rr - rs;
    else if (dr > ds) rr = -rq - rs;
    if (
      rq < -PRISM_RADIUS ||
      rq > PRISM_RADIUS ||
      rr < -PRISM_RADIUS ||
      rr > PRISM_RADIUS
    )
      return 0;
    const index =
      lookup.at((rq + PRISM_RADIUS) * span + rr + PRISM_RADIUS) ?? -1;
    return index < 0 ? 0 : (heights.at(index) ?? 0);
  }

  function dispose(): void {
    scene.remove(prisms, rims);
    prisms.dispose();
    rims.dispose();
    prismGeometry.dispose();
    rimGeometry.dispose();
    prismMaterial.dispose();
    rimMaterial.dispose();
  }

  return { update, heightAt, dispose };
}
// #endregion

/** L'essaim : octaèdres instanciés, ruban de traînée unique, anneau du joueur. */
interface IDroneSwarm {
  /** Position au sol du drone du joueur, valide quand `update` a rendu `true`. */
  readonly focus: THREE.Vector3;
  /** Place les drones ; rend `true` si l'un d'eux est le joueur. */
  update(
    drones: readonly IPrismDroneView[],
    time: number,
    dt: number,
    reducedMotion: boolean,
  ): boolean;
  dispose(): void;
}

function createDroneSwarm(
  scene: THREE.Scene,
  palette: Float32Array,
  shadows: boolean,
  groundHeight: (x: number, z: number) => number,
): IDroneSwarm {
  // Les corps : un octaèdre low-poly, très émissif, couleur d'instance.
  const bodyGeometry = new THREE.OctahedronGeometry(DRONE_RADIUS, 0);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.35,
    emissive: 0xffffff,
    emissiveIntensity: 0.7,
    flatShading: true,
  });
  emissiveByInstance(bodyMaterial);
  const bodies = new THREE.InstancedMesh(
    bodyGeometry,
    bodyMaterial,
    MAX_DRONES,
  );
  bodies.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const bodyColors = new THREE.InstancedBufferAttribute(
    new Float32Array(MAX_DRONES * 3),
    3,
  );
  bodyColors.setUsage(THREE.DynamicDrawUsage);
  bodies.instanceColor = bodyColors;
  bodies.castShadow = shadows;
  bodies.frustumCulled = false;
  bodies.count = 0;

  // La traînée : UN ruban pour tous les drones — `TRAIL_ROWS` rangées de deux
  // sommets par drone, topologie fixe, positions réécrites à chaque image,
  // couleurs réécrites seulement quand le drone d'un emplacement change.
  const vertexCount = MAX_DRONES * TRAIL_ROWS * 2;
  const trailPositions = new Float32Array(vertexCount * 3);
  const trailColors = new Float32Array(vertexCount * 3);
  const trailIndices = new Uint16Array(MAX_DRONES * TRAIL_SAMPLES * 6);
  let cursor = 0;
  for (let s = 0; s < MAX_DRONES; s += 1) {
    const base = s * TRAIL_ROWS * 2;
    for (let k = 0; k < TRAIL_SAMPLES; k += 1) {
      const a = base + k * 2;
      trailIndices[cursor] = a;
      trailIndices[cursor + 1] = a + 1;
      trailIndices[cursor + 2] = a + 2;
      trailIndices[cursor + 3] = a + 1;
      trailIndices[cursor + 4] = a + 3;
      trailIndices[cursor + 5] = a + 2;
      cursor += 6;
    }
  }
  const trailGeometry = new THREE.BufferGeometry();
  const trailPosition = new THREE.BufferAttribute(trailPositions, 3);
  trailPosition.setUsage(THREE.DynamicDrawUsage);
  const trailColor = new THREE.BufferAttribute(trailColors, 3);
  trailColor.setUsage(THREE.DynamicDrawUsage);
  trailGeometry.setAttribute("position", trailPosition);
  trailGeometry.setAttribute("color", trailColor);
  trailGeometry.setIndex(new THREE.BufferAttribute(trailIndices, 1));
  trailGeometry.setDrawRange(0, 0);
  const trailMaterial = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const trail = new THREE.Mesh(trailGeometry, trailMaterial);
  trail.frustumCulled = false;

  // L'anneau du joueur, au sol, additif.
  const ringGeometry = new THREE.RingGeometry(0.7, 0.92, 48, 1).rotateX(
    -Math.PI / 2,
  );
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.visible = false;
  scene.add(bodies, trail, ring);

  // État par emplacement, alloué une fois.
  const slotId = new Int16Array(MAX_DRONES).fill(-1);
  const slotLook = new Int16Array(MAX_DRONES).fill(-1);
  const slotX = new Float32Array(MAX_DRONES);
  const slotZ = new Float32Array(MAX_DRONES);
  const leanX = new Float32Array(MAX_DRONES);
  const leanZ = new Float32Array(MAX_DRONES);
  const trailX = new Float32Array(MAX_DRONES * TRAIL_SAMPLES);
  const trailZ = new Float32Array(MAX_DRONES * TRAIL_SAMPLES);
  const trailHead = new Uint8Array(MAX_DRONES);
  const focus = new THREE.Vector3();
  let trailClock = 0;

  function resetTrail(s: number, x: number, z: number): void {
    const from = s * TRAIL_SAMPLES;
    trailX.fill(x, from, from + TRAIL_SAMPLES);
    trailZ.fill(z, from, from + TRAIL_SAMPLES);
  }

  function paintTrail(s: number, r: number, g: number, b: number): void {
    let v = s * TRAIL_ROWS * 2 * 3;
    for (let row = 0; row < TRAIL_ROWS; row += 1) {
      const fade = 1.3 * Math.pow(1 - row / TRAIL_SAMPLES, 1.7);
      trailColors[v] = r * fade;
      trailColors[v + 1] = g * fade;
      trailColors[v + 2] = b * fade;
      trailColors[v + 3] = r * fade;
      trailColors[v + 4] = g * fade;
      trailColors[v + 5] = b * fade;
      v += 6;
    }
  }

  function writeTrail(s: number, headX: number, headZ: number): void {
    const from = s * TRAIL_SAMPLES;
    const head = trailHead.at(s) ?? 0;
    // Rangée 0 = le drone ; rangée r ≥ 1 = l'échantillon r-1 en remontant
    // l'anneau. Fenêtre glissante de trois rangées : une lecture par rangée.
    let prevX = headX;
    let prevZ = headZ;
    let curX = headX;
    let curZ = headZ;
    let nextX = trailX.at(from + head) ?? headX;
    let nextZ = trailZ.at(from + head) ?? headZ;
    let v = s * TRAIL_ROWS * 2 * 3;
    for (let row = 0; row < TRAIL_ROWS; row += 1) {
      let dx = prevX - nextX;
      let dz = prevZ - nextZ;
      const length = Math.sqrt(dx * dx + dz * dz);
      // À l'arrêt, le ruban n'a pas de direction : largeur nulle, invisible.
      let half = 0;
      if (length > 1e-4) {
        dx /= length;
        dz /= length;
        const taper = 1 - row / TRAIL_SAMPLES;
        half = TRAIL_HALF_WIDTH * taper * taper;
      }
      const nx = -dz * half;
      const nz = dx * half;
      trailPositions[v] = curX + nx;
      trailPositions[v + 1] = TRAIL_Y;
      trailPositions[v + 2] = curZ + nz;
      trailPositions[v + 3] = curX - nx;
      trailPositions[v + 4] = TRAIL_Y;
      trailPositions[v + 5] = curZ - nz;
      v += 6;
      prevX = curX;
      prevZ = curZ;
      curX = nextX;
      curZ = nextZ;
      const after = row + 2;
      if (after < TRAIL_ROWS) {
        const j = from + ((head - after + 1 + TRAIL_SAMPLES) % TRAIL_SAMPLES);
        nextX = trailX.at(j) ?? curX;
        nextZ = trailZ.at(j) ?? curZ;
      }
    }
  }

  function update(
    drones: readonly IPrismDroneView[],
    time: number,
    dt: number,
    reducedMotion: boolean,
  ): boolean {
    const safeDt = dt > 1e-4 ? dt : 1e-4;
    trailClock += dt;
    const sample = trailClock >= TRAIL_STEP;
    if (sample) trailClock %= TRAIL_STEP;
    const leanAlpha = smoothing(9, dt);
    let colorsDirty = false;
    let trailColorsDirty = false;
    let hasFocus = false;
    let count = 0;

    for (const drone of drones) {
      if (count >= MAX_DRONES) break;
      const s = count;
      count += 1;
      const k = paletteIndex(drone.team);
      const r = palette.at(k) ?? 0;
      const g = palette.at(k + 1) ?? 0;
      const b = palette.at(k + 2) ?? 0;
      const look = k * 2 + (drone.mine ? 1 : 0);

      // L'état de l'emplacement, lu une fois ; réécrit en fin de tour.
      let prevX = slotX.at(s) ?? drone.x;
      let prevZ = slotZ.at(s) ?? drone.z;
      let tiltX = leanX.at(s) ?? 0;
      let tiltZ = leanZ.at(s) ?? 0;

      // Nouveau drone à cet emplacement, ou saut (réapparition) : repartir à neuf.
      let fresh = slotId.at(s) !== drone.id;
      if (!fresh) {
        const jx = drone.x - prevX;
        const jz = drone.z - prevZ;
        fresh = jx * jx + jz * jz > 9;
      }
      if (fresh) {
        slotId[s] = drone.id;
        prevX = drone.x;
        prevZ = drone.z;
        tiltX = 0;
        tiltZ = 0;
        resetTrail(s, drone.x, drone.z);
      }
      if (slotLook.at(s) !== look) {
        slotLook[s] = look;
        paintTrail(s, r, g, b);
        trailColorsDirty = true;
        const gain = drone.mine ? 1.35 : 1;
        bodyColors.setXYZ(s, r * gain, g * gain, b * gain);
        colorsDirty = true;
      }

      // Le drone se penche dans son déplacement (lissé), flotte et tourne.
      const vx = (drone.x - prevX) / safeDt;
      const vz = (drone.z - prevZ) / safeDt;
      slotX[s] = drone.x;
      slotZ[s] = drone.z;
      tiltX +=
        (THREE.MathUtils.clamp(vz * 0.045, -0.5, 0.5) - tiltX) * leanAlpha;
      tiltZ +=
        (THREE.MathUtils.clamp(-vx * 0.045, -0.5, 0.5) - tiltZ) * leanAlpha;
      leanX[s] = tiltX;
      leanZ[s] = tiltZ;
      const bob = reducedMotion
        ? 0
        : Math.sin(time * 2.4 + drone.id * 1.3) * 0.16;
      const spin = reducedMotion ? drone.id * 0.7 : time * 1.6 + drone.id * 0.7;
      workEuler.set(tiltX, spin, tiltZ, "ZXY");
      workQuat.setFromEuler(workEuler);
      const size = drone.mine ? 1.18 : 1;
      workPosition.set(drone.x, DRONE_HOVER + bob, drone.z);
      workScale.set(size, size, size);
      bodies.setMatrixAt(
        s,
        workMatrix.compose(workPosition, workQuat, workScale),
      );

      if (sample) {
        const head = ((trailHead.at(s) ?? 0) + 1) % TRAIL_SAMPLES;
        trailHead[s] = head;
        trailX[s * TRAIL_SAMPLES + head] = drone.x;
        trailZ[s * TRAIL_SAMPLES + head] = drone.z;
      }
      writeTrail(s, drone.x, drone.z);

      if (drone.mine && !hasFocus) {
        hasFocus = true;
        focus.set(drone.x, 0, drone.z);
        const pulse = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(time * 5);
        ring.position.set(
          drone.x,
          groundHeight(drone.x, drone.z) + 0.04,
          drone.z,
        );
        const grow = 1 + 0.14 * pulse;
        ring.scale.set(grow, 1, grow);
        ringMaterial.opacity = 0.45 + 0.4 * pulse;
        ringMaterial.color.setRGB(r, g, b);
      }
    }

    ring.visible = hasFocus;
    bodies.count = count;
    if (count > 0) bodies.instanceMatrix.needsUpdate = true;
    if (colorsDirty) bodyColors.needsUpdate = true;
    trailGeometry.setDrawRange(0, count * TRAIL_SAMPLES * 6);
    trailPosition.needsUpdate = true;
    if (trailColorsDirty) trailColor.needsUpdate = true;
    return hasFocus;
  }

  function dispose(): void {
    scene.remove(bodies, trail, ring);
    bodies.dispose();
    bodyGeometry.dispose();
    bodyMaterial.dispose();
    trailGeometry.dispose();
    trailMaterial.dispose();
    ringGeometry.dispose();
    ringMaterial.dispose();
  }

  return { focus, update, dispose };
}

/** Poussière lumineuse en suspension au-dessus de l'arène : de la profondeur pour trois fois rien. */
interface IDust {
  update(time: number): void;
  dispose(): void;
}

function createDust(scene: THREE.Scene, animated: boolean): IDust {
  const base = new Float32Array(DUST_COUNT * 3);
  const phase = new Float32Array(DUST_COUNT);
  const speed = new Float32Array(DUST_COUNT);
  for (let i = 0; i < DUST_COUNT; i += 1) {
    base[i * 3] = (Math.random() * 2 - 1) * 26;
    base[i * 3 + 1] = 0.6 + Math.random() * 6.5;
    base[i * 3 + 2] = (Math.random() * 2 - 1) * 24;
    phase[i] = Math.random() * Math.PI * 2;
    speed[i] = 0.25 + Math.random() * 0.5;
  }
  const positions = new Float32Array(base);
  const geometry = new THREE.BufferGeometry();
  const position = new THREE.BufferAttribute(positions, 3);
  position.setUsage(animated ? THREE.DynamicDrawUsage : THREE.StaticDrawUsage);
  geometry.setAttribute("position", position);
  const material = new THREE.PointsMaterial({
    size: 0.11,
    sizeAttenuation: true,
    color: 0x9a8cff,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  function update(time: number): void {
    if (!animated) return;
    for (let i = 0; i < DUST_COUNT; i += 1) {
      const t = time * (speed.at(i) ?? 0) + (phase.at(i) ?? 0);
      const b = i * 3;
      positions[b] = (base.at(b) ?? 0) + Math.sin(t * 0.6) * 0.7;
      positions[b + 1] = (base.at(b + 1) ?? 0) + Math.sin(t) * 0.45;
      positions[b + 2] = (base.at(b + 2) ?? 0) + Math.cos(t * 0.5) * 0.7;
    }
    position.needsUpdate = true;
  }

  function dispose(): void {
    scene.remove(points);
    geometry.dispose();
    material.dispose();
  }

  return { update, dispose };
}

/**
 * La caméra et sa conduite : suivi doux du joueur, vue d'ensemble, orbite du podium.
 *
 * Orientation FIXE pendant le jeu — les commandes en dépendent : la caméra se
 * tient du côté +z du point suivi et regarde vers -z, en plongée, donc la droite
 * de l'écran est +x du monde et le haut de l'écran est -z. Aucune rotation
 * autour de la verticale en phase `play` ; l'orbite n'existe qu'au podium, et le
 * retour au jeu se fait par une coupe franche, jamais par un balayage.
 */
interface ICameraRig {
  readonly camera: THREE.PerspectiveCamera;
  update(
    view: IPrismSceneView,
    focus: THREE.Vector3,
    hasFocus: boolean,
    dt: number,
  ): void;
  resize(aspect: number): void;
}

function createCameraRig(aspect: number, reducedMotion: boolean): ICameraRig {
  const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 220);
  const position = new THREE.Vector3();
  const target = new THREE.Vector3();
  const wanted = new THREE.Vector3();
  const wantedTarget = new THREE.Vector3();
  let started = false;
  let orbit = 0;
  let lastPhase: IPrismSceneView["phase"] = "play";
  /** Recul supplémentaire quand l'écran est étroit (téléphone en portrait). */
  let fit = 1;

  function resize(nextAspect: number): void {
    camera.aspect = nextAspect;
    camera.updateProjectionMatrix();
    fit = nextAspect < 1 ? 1.45 : nextAspect < 1.4 ? 1.15 : 1;
  }
  resize(aspect);

  function update(
    view: IPrismSceneView,
    focus: THREE.Vector3,
    hasFocus: boolean,
    dt: number,
  ): void {
    let rate = 3.2;
    if (reducedMotion) {
      // Vue d'ensemble fixe : rien ne bouge que le jeu lui-même.
      wanted.set(0, 40 * fit, 27 * fit);
      wantedTarget.set(0, 0, 0);
      rate = 60;
    } else if (view.phase === "podium") {
      // Le podium : on recule et l'on tourne lentement autour de l'arène,
      // en partant de l'azimut où la caméra se trouvait.
      if (lastPhase !== "podium") orbit = Math.atan2(position.x, position.z);
      orbit += dt * 0.22;
      wanted.set(
        Math.sin(orbit) * 30 * fit,
        23 * fit,
        Math.cos(orbit) * 30 * fit,
      );
      wantedTarget.set(0, 0.5, 0);
      rate = 1.4;
    } else if (hasFocus) {
      // Plongée en biais sur le drone du joueur.
      wanted.set(focus.x, 15 * fit, focus.z + 11 * fit);
      wantedTarget.set(focus.x, 0.8, focus.z);
    } else {
      // Spectateur : toute l'arène, toujours depuis +z.
      wanted.set(0, 34 * fit, 23 * fit);
      wantedTarget.set(0, 0, 0);
      rate = 1.6;
    }
    // Fin de podium : coupe franche sur la vue de jeu — un lissage depuis
    // l'orbite ferait tourner la caméra pendant que le joueur pilote.
    const cut = !started || (lastPhase === "podium" && view.phase === "play");
    lastPhase = view.phase;

    if (cut) {
      started = true;
      position.copy(wanted);
      target.copy(wantedTarget);
    } else {
      position.lerp(wanted, smoothing(rate, dt));
      target.lerp(wantedTarget, smoothing(rate * 1.4, dt));
    }
    camera.position.copy(position);
    camera.lookAt(target);
  }

  return { camera, update, resize };
}

/**
 * Crée la scène sur un canvas et rend ses trois gestes.
 *
 * @param canvas - le canvas de la page ; sa taille CSS est pilotée par la page, via `resize`
 * @param options - `reducedMotion` : caméra fixe, pas d'oscillation ni d'orbite ;
 *   `lowPower` : ratio d'appareil plafonné à 1,5, sans ombres ni bloom (téléphone)
 */
export function createPrismScene(
  canvas: HTMLCanvasElement,
  options: { reducedMotion: boolean; lowPower: boolean },
): IPrismScene {
  const { reducedMotion, lowPower } = options;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !lowPower,
    powerPreference: lowPower ? "low-power" : "high-performance",
    alpha: false,
    stencil: false,
  });
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2),
  );
  let width = Math.max(1, canvas.clientWidth || canvas.width);
  let height = Math.max(1, canvas.clientHeight || canvas.height);
  renderer.setSize(width, height, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !lowPower;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND);
  scene.fog = new THREE.FogExp2(BACKGROUND, 0.016);

  // Lumières : ciel violet / sol sombre, un soleil chaud qui porte les ombres,
  // un contre-jour cyan pour détacher les arêtes.
  const sky = new THREE.HemisphereLight(0x6c5cff, 0x120b24, 0.7);
  const sun = new THREE.DirectionalLight(0xfff1dc, 1.5);
  sun.position.set(18, 30, 14);
  sun.castShadow = !lowPower;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -26;
  sun.shadow.camera.right = 26;
  sun.shadow.camera.top = 26;
  sun.shadow.camera.bottom = -26;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 90;
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.02;
  const rim = new THREE.DirectionalLight(0x3ee6ff, 0.3);
  rim.position.set(-22, 10, -18);
  scene.add(sky, sun, rim);

  // Le sol : un disque sombre qui reçoit les ombres et se perd dans le brouillard.
  const floorGeometry = new THREE.CircleGeometry(46, 72).rotateX(-Math.PI / 2);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x0e0c22,
    roughness: 0.95,
    metalness: 0.05,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -0.01;
  floor.receiveShadow = !lowPower;
  scene.add(floor);

  const palette = teamPalette();
  const field = createTileField(scene, palette, !lowPower);
  const swarm = createDroneSwarm(scene, palette, !lowPower, (x, z) =>
    field.heightAt(x, z),
  );
  const dust = createDust(scene, !reducedMotion);
  const rig = createCameraRig(width / height, reducedMotion);

  // Halo : rendu HDR → bloom au-dessus du seuil → correction de sortie.
  let composer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  if (!lowPower) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, rig.camera));
    bloom = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.3,
      0.4,
      0.9,
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  let time = 0;

  function render(view: IPrismSceneView, dtSeconds: number): void {
    // Onglet revenu au premier plan : on borne le pas, sinon tout saute.
    const dt = dtSeconds > 0 ? Math.min(dtSeconds, 0.1) : 0;
    time += dt;
    const podiumTeam =
      view.phase === "podium" && view.winner >= 0 ? view.winner + 1 : 0;
    field.update(view.tiles, podiumTeam, time, dt);
    const hasFocus = swarm.update(view.drones, time, dt, reducedMotion);
    dust.update(time);
    rig.update(view, swarm.focus, hasFocus, dt);
    if (composer !== null) composer.render();
    else renderer.render(scene, rig.camera);
  }

  function resize(nextWidth: number, nextHeight: number): void {
    width = Math.max(1, Math.floor(nextWidth));
    height = Math.max(1, Math.floor(nextHeight));
    renderer.setSize(width, height, false);
    rig.resize(width / height);
    if (composer !== null) composer.setSize(width, height);
  }

  function dispose(): void {
    field.dispose();
    swarm.dispose();
    dust.dispose();
    scene.remove(floor, sky, sun, rim);
    floorGeometry.dispose();
    floorMaterial.dispose();
    sun.dispose();
    if (bloom !== null) bloom.dispose();
    if (composer !== null) composer.dispose();
    renderer.dispose();
  }

  return { render, resize, dispose };
}
