import * as THREE from "three";

/**
 * Sonde — la sphère de Bloch en 3D, et rien d'autre.
 *
 * Guide pour un agent : ce module dessine une sphère translucide, son équateur
 * et deux méridiens, les axes x, y, z (|0⟩ en haut, |1⟩ en bas), la flèche de
 * l'état VISÉ (violet, pointillée, fixe) et la flèche de l'ESTIMATION (bleue),
 * suivie de la traînée des estimations passées. Il ne connaît NI la socket NI
 * la tomographie : la page (`BlochView.tsx`) décode la trame, calcule le
 * vecteur de Bloch et appelle `setEstimate()`. Three.js (paquet `three`) n'est
 * payé que par cette page, via `import()`.
 *
 * Repère : Bloch (x, y, z) → scène (x, z, −y), pour que z pointe vers le haut
 * de l'écran et que le trièdre reste direct. La rotation se fait à la souris,
 * au doigt (événements pointeur) et aux flèches du clavier ; elle tourne le
 * GROUPE, pas la caméra — les étiquettes (sprites) font toujours face. Rendu À
 * LA DEMANDE : une image par geste ou par estimation, aucune boucle au repos.
 *
 * Couleurs : lues sur les variables CSS du document au montage (`--blue`,
 * `--violet`, `--amber`, `--muted`, `--fg`), fond transparent — la carte derrière
 * donne le thème. Pas de halo, pas d'émission : des traits calmes. Aucune
 * allocation par image : les vecteurs de travail vivent au niveau du module,
 * la traînée est un tampon fixe. `dispose()` libère géométries, matériaux,
 * textures, le renderer et les écouteurs.
 */

/** La scène : trois gestes, rien d'autre à connaître. */
export interface IBlochScene {
  /** Place la flèche de l'estimation ; `projected` = ramenée sur la sphère (état non physique). */
  setEstimate(v: readonly [number, number, number], projected: boolean): void;
  /** Taille du canvas en pixels CSS (le ratio d'appareil est appliqué ici). */
  resize(width: number, height: number): void;
  /** Libère géométries, matériaux, textures, le contexte WebGL et les écouteurs. */
  dispose(): void;
}

/** Les couleurs lues sur le document ; repli = thème clair de `demo.css`. */
interface IPalette {
  blue: string;
  violet: string;
  amber: string;
  muted: string;
  fg: string;
}

const FALLBACK_PALETTE: IPalette = {
  blue: "#096bbf",
  violet: "#7c4dbd",
  amber: "#b7791f",
  muted: "#5b6b84",
  fg: "#0e1726",
};

const CAMERA_DISTANCE = 4.1;
const CAMERA_FOV = 40;
/** Demi-longueur des axes, et distance des étiquettes au centre. */
const AXIS_HALF = 1.15;
const LABEL_AT = 1.34;
/** La flèche de l'estimation : fût et pointe. */
const SHAFT_RADIUS = 0.014;
const HEAD_RADIUS = 0.045;
const HEAD_LENGTH = 0.12;
/** La pointe de l'état visé, plus discrète. */
const TARGET_HEAD_RADIUS = 0.035;
const TARGET_HEAD_LENGTH = 0.1;
/** Estimations gardées dans la traînée. */
const TRAIL_POOL = 96;
const RING_SEGMENTS = 96;
/** Radians par pixel glissé, par appui de flèche, et inclinaison maximale. */
const DRAG_RATE = 0.008;
const KEY_STEP = 0.12;
const PITCH_LIMIT = 1.45;
/** Pose initiale : un peu de côté, un peu au-dessus. */
const INITIAL_YAW = -0.55;
const INITIAL_PITCH = 0.35;

// Objets de travail partagés : jamais alloués pendant un geste.
const workDir = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

/** Lit une variable CSS du document, ou rend le repli si elle est absente. */
function readPalette(): IPalette {
  const style = getComputedStyle(document.documentElement);
  const pick = (name: string, fallback: string): string => {
    const value = style.getPropertyValue(name).trim();
    return value === "" ? fallback : value;
  };
  return {
    blue: pick("--blue", FALLBACK_PALETTE.blue),
    violet: pick("--violet", FALLBACK_PALETTE.violet),
    amber: pick("--amber", FALLBACK_PALETTE.amber),
    muted: pick("--muted", FALLBACK_PALETTE.muted),
    fg: pick("--fg", FALLBACK_PALETTE.fg),
  };
}

/** Un vecteur de Bloch dans le repère de la scène (z vers le haut, trièdre direct). */
function toScene(
  v: readonly [number, number, number],
  out: THREE.Vector3,
): THREE.Vector3 {
  return out.set(v[0], v[2], -v[1]);
}

/** Un cercle unité dans le plan XY, partagé par l'équateur, les méridiens et la silhouette. */
function circleGeometry(): THREE.BufferGeometry {
  const positions = new Float32Array(RING_SEGMENTS * 3);
  for (let i = 0; i < RING_SEGMENTS; i += 1) {
    const a = (i / RING_SEGMENTS) * Math.PI * 2;
    positions[i * 3] = Math.cos(a);
    positions[i * 3 + 1] = Math.sin(a);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

/** Une étiquette : du texte peint sur un petit canvas, porté par un sprite qui fait face. */
interface ILabel {
  sprite: THREE.Sprite;
  dispose(): void;
}

function createLabel(text: string, color: string, dpr: number): ILabel | null {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(96 * dpr);
  canvas.height = Math.round(48 * dpr);
  const context = canvas.getContext("2d");
  if (context === null) return null;
  context.font = `600 ${Math.round(26 * dpr)}px ui-sans-serif, system-ui, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = color;
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.3, 0.15, 1);
  sprite.renderOrder = 10;
  return {
    sprite,
    dispose() {
      material.dispose();
      texture.dispose();
    },
  };
}

/** Oriente un objet « vers le haut » le long d'une direction unitaire. */
function pointAlong(object: THREE.Object3D, direction: THREE.Vector3): void {
  object.quaternion.setFromUnitVectors(UP, direction);
}

// #region sensor-bloch-scene
/**
 * Crée la scène sur un canvas et rend ses trois gestes.
 *
 * @param canvas - le canvas de la page ; sa taille CSS est pilotée par la page, via `resize`
 * @param target - le vecteur de Bloch de l'état visé, fixe pour la vie de la scène
 */
export function createBlochScene(
  canvas: HTMLCanvasElement,
  target: readonly [number, number, number],
): IBlochScene {
  const palette = readPalette();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
    stencil: false,
  });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  let width = Math.max(1, canvas.clientWidth || canvas.width);
  let height = Math.max(1, canvas.clientHeight || canvas.height);
  renderer.setSize(width, height, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    width / height,
    0.1,
    20,
  );
  camera.position.set(0, 0, CAMERA_DISTANCE);
  camera.lookAt(0, 0, 0);

  // Un ciel clair, un sol plus sombre : la sphère prend un léger dégradé.
  const light = new THREE.HemisphereLight(0xffffff, 0x334455, 1.6);
  scene.add(light);

  // Tout ce qui tourne vit dans ce groupe.
  const root = new THREE.Group();
  scene.add(root);

  // La sphère : translucide, sans écriture de profondeur, pour voir ce qu'elle contient.
  const sphereGeometry = new THREE.SphereGeometry(1, 48, 32);
  const sphereMaterial = new THREE.MeshLambertMaterial({
    color: palette.blue,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.renderOrder = 0;
  root.add(sphere);

  // Équateur et deux méridiens : un seul cercle, trois poses.
  const ringGeometry = circleGeometry();
  const ringMaterial = new THREE.LineBasicMaterial({
    color: palette.muted,
    transparent: true,
    opacity: 0.5,
  });
  const equator = new THREE.LineLoop(ringGeometry, ringMaterial);
  equator.rotation.x = Math.PI / 2;
  const meridianXZ = new THREE.LineLoop(ringGeometry, ringMaterial);
  const meridianYZ = new THREE.LineLoop(ringGeometry, ringMaterial);
  meridianYZ.rotation.y = Math.PI / 2;
  for (const ring of [equator, meridianXZ, meridianYZ]) ring.renderOrder = 1;
  root.add(equator, meridianXZ, meridianYZ);

  // La silhouette : le même cercle, HORS du groupe, face à la caméra.
  const silhouetteMaterial = new THREE.LineBasicMaterial({
    color: palette.muted,
    transparent: true,
    opacity: 0.35,
  });
  const silhouette = new THREE.LineLoop(ringGeometry, silhouetteMaterial);
  silhouette.renderOrder = 1;
  scene.add(silhouette);

  // Les axes : trois segments.
  const axesPositions = new Float32Array([
    -AXIS_HALF,
    0,
    0,
    AXIS_HALF,
    0,
    0,
    0,
    -AXIS_HALF,
    0,
    0,
    AXIS_HALF,
    0,
    0,
    0,
    -AXIS_HALF,
    0,
    0,
    AXIS_HALF,
  ]);
  const axesGeometry = new THREE.BufferGeometry();
  axesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(axesPositions, 3),
  );
  const axesMaterial = new THREE.LineBasicMaterial({
    color: palette.muted,
    transparent: true,
    opacity: 0.7,
  });
  const axes = new THREE.LineSegments(axesGeometry, axesMaterial);
  axes.renderOrder = 1;
  root.add(axes);

  // Les étiquettes : x, y (Bloch) et les deux pôles.
  const labels: ILabel[] = [];
  const labelAt = (text: string, x: number, y: number, z: number): void => {
    const label = createLabel(text, palette.fg, dpr);
    if (label === null) return;
    label.sprite.position.set(x, y, z);
    labels.push(label);
    root.add(label.sprite);
  };
  labelAt("x", LABEL_AT, 0, 0);
  labelAt("y", 0, 0, -LABEL_AT);
  labelAt("|0⟩", 0, LABEL_AT, 0);
  labelAt("|1⟩", 0, -LABEL_AT, 0);

  // L'état visé : un trait pointillé de l'origine à la cible, et une pointe.
  const targetTip = toScene(target, new THREE.Vector3());
  const targetLength = targetTip.length();
  const targetGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    targetTip.clone(),
  ]);
  const targetMaterial = new THREE.LineDashedMaterial({
    color: palette.violet,
    dashSize: 0.06,
    gapSize: 0.04,
  });
  const targetLine = new THREE.Line(targetGeometry, targetMaterial);
  targetLine.computeLineDistances();
  targetLine.renderOrder = 2;
  const targetHeadGeometry = new THREE.ConeGeometry(
    TARGET_HEAD_RADIUS,
    TARGET_HEAD_LENGTH,
    16,
  ).translate(0, -TARGET_HEAD_LENGTH / 2, 0);
  const targetHeadMaterial = new THREE.MeshBasicMaterial({
    color: palette.violet,
  });
  const targetHead = new THREE.Mesh(targetHeadGeometry, targetHeadMaterial);
  if (targetLength > 1e-6) {
    workDir.copy(targetTip).divideScalar(targetLength);
    pointAlong(targetHead, workDir);
    targetHead.position.copy(targetTip);
  } else {
    targetHead.visible = false;
  }
  root.add(targetLine, targetHead);

  // L'estimation : fût étiré à la longueur du vecteur, pointe à son bout.
  const estimate = new THREE.Group();
  estimate.visible = false;
  const shaftGeometry = new THREE.CylinderGeometry(
    SHAFT_RADIUS,
    SHAFT_RADIUS,
    1,
    12,
  ).translate(0, 0.5, 0);
  const shaftMaterial = new THREE.MeshBasicMaterial({ color: palette.blue });
  const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
  const headGeometry = new THREE.ConeGeometry(
    HEAD_RADIUS,
    HEAD_LENGTH,
    16,
  ).translate(0, HEAD_LENGTH / 2, 0);
  const headMaterial = new THREE.MeshBasicMaterial({ color: palette.blue });
  // Une estimation PROJETÉE (sortie de la boule, ramenée dessus) : pointe ambre.
  const headProjectedMaterial = new THREE.MeshBasicMaterial({
    color: palette.amber,
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  estimate.add(shaft, head);
  root.add(estimate);

  // La traînée : un tampon fixe partagé par un trait et des points.
  const trailPositions = new Float32Array(TRAIL_POOL * 3);
  const trailAttribute = new THREE.BufferAttribute(trailPositions, 3);
  trailAttribute.setUsage(THREE.DynamicDrawUsage);
  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute("position", trailAttribute);
  trailGeometry.setDrawRange(0, 0);
  const trailLineMaterial = new THREE.LineBasicMaterial({
    color: palette.blue,
    transparent: true,
    opacity: 0.45,
  });
  const trailPointsMaterial = new THREE.PointsMaterial({
    color: palette.blue,
    size: 0.03,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7,
  });
  const trailLine = new THREE.Line(trailGeometry, trailLineMaterial);
  const trailPoints = new THREE.Points(trailGeometry, trailPointsMaterial);
  trailLine.frustumCulled = false;
  trailPoints.frustumCulled = false;
  trailLine.renderOrder = 2;
  trailPoints.renderOrder = 2;
  root.add(trailLine, trailPoints);
  let trailCount = 0;

  // Rendu à la demande : une image par geste, coalescée par `requestAnimationFrame`.
  let yaw = INITIAL_YAW;
  let pitch = INITIAL_PITCH;
  let frame = 0;
  function draw(): void {
    frame = 0;
    root.rotation.set(pitch, yaw, 0);
    renderer.render(scene, camera);
  }
  function requestRender(): void {
    if (frame !== 0) return;
    frame = requestAnimationFrame(draw);
  }
  function clampPitch(value: number): number {
    return Math.min(PITCH_LIMIT, Math.max(-PITCH_LIMIT, value));
  }

  // Rotation à la souris et au doigt : les événements pointeur couvrent les deux.
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  function onPointerDown(event: PointerEvent): void {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event: PointerEvent): void {
    if (!dragging) return;
    yaw += (event.clientX - lastX) * DRAG_RATE;
    pitch = clampPitch(pitch + (event.clientY - lastY) * DRAG_RATE);
    lastX = event.clientX;
    lastY = event.clientY;
    requestRender();
  }
  function onPointerUp(event: PointerEvent): void {
    if (!dragging) return;
    dragging = false;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }
  function onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case "ArrowLeft":
        yaw -= KEY_STEP;
        break;
      case "ArrowRight":
        yaw += KEY_STEP;
        break;
      case "ArrowUp":
        pitch = clampPitch(pitch - KEY_STEP);
        break;
      case "ArrowDown":
        pitch = clampPitch(pitch + KEY_STEP);
        break;
      default:
        return;
    }
    event.preventDefault();
    requestRender();
  }
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("keydown", onKeyDown);

  requestRender();

  function setEstimate(
    v: readonly [number, number, number],
    projected: boolean,
  ): void {
    toScene(v, workDir);
    const length = workDir.length();
    if (length > 1e-6) {
      workDir.divideScalar(length);
      pointAlong(estimate, workDir);
      const body = Math.max(0.001, length - HEAD_LENGTH);
      shaft.scale.y = body;
      head.position.y = body;
      head.material = projected ? headProjectedMaterial : headMaterial;
      estimate.visible = true;
    } else {
      estimate.visible = false;
    }

    // La traînée : le plus ancien sort quand le tampon est plein.
    if (trailCount === TRAIL_POOL) {
      trailPositions.copyWithin(0, 3);
      trailCount -= 1;
    }
    const at = trailCount * 3;
    trailPositions[at] = v[0];
    trailPositions[at + 1] = v[2];
    trailPositions[at + 2] = -v[1];
    trailCount += 1;
    trailAttribute.needsUpdate = true;
    trailGeometry.setDrawRange(0, trailCount);
    requestRender();
  }

  function resize(nextWidth: number, nextHeight: number): void {
    width = Math.max(1, Math.floor(nextWidth));
    height = Math.max(1, Math.floor(nextHeight));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestRender();
  }

  function dispose(): void {
    if (frame !== 0) cancelAnimationFrame(frame);
    frame = 0;
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    canvas.removeEventListener("keydown", onKeyDown);
    for (const label of labels) label.dispose();
    sphereGeometry.dispose();
    sphereMaterial.dispose();
    ringGeometry.dispose();
    ringMaterial.dispose();
    silhouetteMaterial.dispose();
    axesGeometry.dispose();
    axesMaterial.dispose();
    targetGeometry.dispose();
    targetMaterial.dispose();
    targetHeadGeometry.dispose();
    targetHeadMaterial.dispose();
    shaftGeometry.dispose();
    shaftMaterial.dispose();
    headGeometry.dispose();
    headMaterial.dispose();
    headProjectedMaterial.dispose();
    trailGeometry.dispose();
    trailLineMaterial.dispose();
    trailPointsMaterial.dispose();
    light.dispose();
    renderer.dispose();
  }

  return { setEstimate, resize, dispose };
}
// #endregion
