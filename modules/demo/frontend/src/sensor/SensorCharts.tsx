import {
  memo,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  BELL_VISIBILITY,
  CRYO_HOURS,
  KEV_PER_CHANNEL,
  MCA_CHANNELS,
  MXC_ALARM_K,
  VIBRATION_HYSTERESIS,
  vibrationZones,
} from "./sensorDemo";

/**
 * Sonde — les quatre figures scientifiques de la page, en SVG pur.
 *
 * Guide pour un agent : ces composants sont PURS — ils dessinent ce qu'on leur
 * donne, sans socket ni état réseau ; c'est la page (`sensorClient.ts`) qui
 * décode les trames et leur passe des tableaux. Chaque figure est `memo` et ne
 * recalcule ses chemins que si ses props changent. La largeur de la figure est
 * MESURÉE (`ResizeObserver`) et devient la largeur du `viewBox` : une unité SVG
 * vaut un pixel CSS, donc le texte garde 11 px sur un téléphone comme sur un
 * grand écran, et les graduations s'espacent selon la place. Les couleurs sont
 * des variables CSS (`var(--blue)`…), lisibles en clair comme en sombre ; le
 * texte passe par `--muted` / `--fg` (classes `sensor-ink`, `sensor-halo`),
 * jamais par une teinte d'accent seule. Une seule échelle par axe.
 *
 * Les constantes physiques (limites ISO, canaux, hystérésis, visibilité) viennent
 * du contrat partagé `sensorDemo.ts` ; celles du Cs-137 sont calculées ici.
 */

/** Largeur prise avant la première mesure, et plancher (téléphone). */
const DEFAULT_WIDTH = 800;
const MIN_WIDTH = 320;

/** Formats français, construits une fois : un `Intl.NumberFormat` coûte cher. */
const FR0 = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const FR1 = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const FR2 = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const FR3 = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

/** Largeur approximative d'un caractère de la fonte mono à 11 px, pour placer sans mesurer. */
const CHAR_WIDTH = 6.7;

/** Chiffres en exposant, pour les décades (10², 10³…). */
const SUPERSCRIPTS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
function superscript(n: number): string {
  let out = "";
  for (const digit of String(n)) out += SUPERSCRIPTS.at(Number(digit)) ?? "";
  return out;
}

/** Le pas de graduation : le plus petit des candidats qui tient dans `maxTicks`. */
function pickStep(
  span: number,
  maxTicks: number,
  candidates: readonly number[],
): number {
  for (const step of candidates) {
    if (span / step <= maxTicks) return step;
  }
  return candidates.at(-1) ?? span;
}

/**
 * Des secondes lisibles : « 20 s », ou « 2 min » quand le PAS de graduation est
 * en minutes — jamais les deux unités mêlées sur un même axe.
 */
function formatSeconds(t: number, step: number): string {
  if (step >= 60 && t % 60 === 0) return `${FR0.format(t / 60)} min`;
  return `${FR0.format(t)} s`;
}

/**
 * Écarte des étiquettes empilées sur un même axe : triées, puis poussées d'au
 * moins `gap` l'une de l'autre, et ramenées dans `[min, max]`. Rend les
 * positions dans l'ORDRE D'ENTRÉE.
 */
function spreadLabels(
  wanted: readonly number[],
  gap: number,
  min: number,
  max: number,
): number[] {
  const order = wanted.map((_, i) => i);
  order.sort((a, b) => (wanted.at(a) ?? 0) - (wanted.at(b) ?? 0));
  const placed = wanted.map((y) => Math.min(max, Math.max(min, y)));
  for (let k = 1; k < order.length; k += 1) {
    const i = order.at(k) ?? 0;
    const prev = order.at(k - 1) ?? 0;
    const floor = (placed.at(prev) ?? 0) + gap;
    if ((placed.at(i) ?? 0) < floor) placed[i] = floor;
  }
  for (let k = order.length - 2; k >= 0; k -= 1) {
    const i = order.at(k) ?? 0;
    const next = order.at(k + 1) ?? 0;
    const ceiling = Math.min(max, placed.at(next) ?? 0) - gap;
    if ((placed.at(i) ?? 0) > ceiling) placed[i] = ceiling;
  }
  return placed;
}

/** La largeur rendue du SVG, suivie ; une unité du `viewBox` = un pixel CSS. */
function useChartWidth(): [RefObject<SVGSVGElement | null>, number] {
  const ref = useRef<SVGSVGElement | null>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  useEffect(() => {
    const element = ref.current;
    if (element === null) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries.at(0);
      if (entry === undefined) return;
      const next = Math.max(MIN_WIDTH, Math.round(entry.contentRect.width));
      setWidth((previous) => (previous === next ? previous : next));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

// #region sensor-plant-chart
/** Une fenêtre réduite de la série affichée ; `t` en secondes depuis le début de la fenêtre. */
export interface IPlantPoint {
  t: number;
  min: number;
  max: number;
  mean: number;
}

/** Un marqueur d'alarme : sa position et son étiquette, déjà placée. */
interface IPlantMarker {
  t: number;
  x: number;
  label: string;
  anchor: "start" | "end";
  labelX: number;
  labelY: number;
}

/** Axe des vibrations : 0 → 6 mm/s, étendu si une valeur dépasse. */
const PLANT_Y_MAX = 6;
const PLANT_HEIGHT = 270;
const PLANT_STEPS = [5, 10, 15, 20, 30, 60, 120, 300, 600, 900, 1800, 3600];

/**
 * Vibration d'une machine : la bande min → max de chaque fenêtre, la moyenne en
 * trait plein, les zones ISO 10816-3 teintées (A en vert, C en ambre, D en
 * rouge si l'axe y monte jusque-là), la bande d'hystérésis hachurée sous la
 * limite B/C, et un marqueur vertical à chaque alarme levée.
 *
 * @param points - les fenêtres, dans l'ordre du temps
 * @param spanSeconds - la durée affichée (axe x : 0 → span)
 * @param alarms - instants des alarmes, en secondes dans le même repère que `t`
 * @param unit - l'unité, affichée en titre de l'axe y
 */
export const PlantChart = memo(function PlantChart(props: {
  points: readonly IPlantPoint[];
  spanSeconds: number;
  alarms: readonly number[];
  unit: string;
}) {
  const { points, spanSeconds, alarms, unit } = props;
  const [ref, width] = useChartWidth();
  // `useId` peut contenir des caractères que `url(#…)` n'aime pas : on les retire.
  const hatchId = `sensor-hatch-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const left = 44;
  const right = width - 12;
  const top = 28;
  const bottom = PLANT_HEIGHT - 32;

  const model = useMemo(() => {
    let peak = 0;
    for (const p of points) if (p.max > peak) peak = p.max;
    const yMax = Math.max(PLANT_Y_MAX, Math.ceil(peak));
    const span = spanSeconds > 0 ? spanSeconds : 1;
    const x = (t: number): number =>
      Math.min(right, Math.max(left, left + (t / span) * (right - left)));
    const y = (v: number): number =>
      top + (1 - Math.min(v, yMax) / yMax) * (bottom - top);

    let topPath = "";
    let meanPath = "";
    for (const p of points) {
      const px = x(p.t).toFixed(1);
      topPath += `${topPath === "" ? "M" : "L"}${px},${y(p.max).toFixed(1)}`;
      meanPath += `${meanPath === "" ? "M" : "L"}${px},${y(p.mean).toFixed(1)}`;
    }
    let bottomPath = "";
    for (let i = points.length - 1; i >= 0; i -= 1) {
      const p = points.at(i);
      if (p === undefined) continue;
      bottomPath += `L${x(p.t).toFixed(1)},${y(p.min).toFixed(1)}`;
    }
    const bandPath = topPath === "" ? "" : `${topPath}${bottomPath}Z`;

    const yStep = yMax <= 8 ? 1 : 2;
    const yTicks: number[] = [];
    for (let v = 0; v <= yMax; v += yStep) yTicks.push(v);
    const xStep = pickStep(span, Math.floor((right - left) / 64), PLANT_STEPS);
    const xTicks: number[] = [];
    for (let t = 0; t <= span; t += xStep) xTicks.push(t);

    const { ab, bc, cd } = vibrationZones;
    const markers = alarms
      .filter((t) => t >= 0 && t <= span)
      .map((t, i): IPlantMarker => {
        const label = `alarme ${FR1.format(t)} s`;
        const px = x(t);
        const fits = px - 6 - label.length * CHAR_WIDTH >= left;
        return {
          t,
          x: px,
          label,
          anchor: fits ? "end" : "start",
          labelX: fits ? px - 6 : px + 6,
          labelY: top + 14 + (i % 2) * 14,
        };
      });

    return {
      yMax,
      x,
      y,
      bandPath,
      meanPath,
      yTicks,
      xTicks,
      xStep,
      markers,
      zoneA: { y: y(ab), height: y(0) - y(ab) },
      zoneC: {
        y: y(Math.min(cd, yMax)),
        height: y(bc) - y(Math.min(cd, yMax)),
      },
      zoneD: yMax > cd ? { y: y(yMax), height: y(cd) - y(yMax) } : null,
      hysteresis: { y: y(bc), height: y(bc - VIBRATION_HYSTERESIS) - y(bc) },
    };
  }, [points, spanSeconds, alarms, left, right, top, bottom]);

  const { bc } = vibrationZones;
  const label = `Vibration sur ${formatSeconds(spanSeconds, model.xStep)} : bande minimum–maximum et moyenne, zones ISO 10816-3, alarme à ${FR1.format(bc)} ${unit}, ${FR0.format(model.markers.length)} alarme(s) levée(s)`;

  return (
    <svg
      ref={ref}
      className="sensor-chart"
      viewBox={`0 0 ${width} ${PLANT_HEIGHT}`}
      role="img"
      aria-label={label}
    >
      <defs>
        <pattern
          id={hatchId}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="6"
            stroke="var(--danger)"
            strokeWidth="1.2"
            strokeOpacity="0.5"
          />
        </pattern>
      </defs>
      <rect
        x={left}
        y={model.zoneA.y}
        width={right - left}
        height={model.zoneA.height}
        fill="var(--sensor-zone-a)"
      />
      <rect
        x={left}
        y={model.zoneC.y}
        width={right - left}
        height={model.zoneC.height}
        fill="var(--sensor-zone-c)"
      />
      {model.zoneD === null ? null : (
        <rect
          x={left}
          y={model.zoneD.y}
          width={right - left}
          height={model.zoneD.height}
          fill="var(--sensor-zone-d)"
        />
      )}
      <rect
        x={left}
        y={model.hysteresis.y}
        width={right - left}
        height={model.hysteresis.height}
        fill={`url(#${hatchId})`}
      />
      {model.yTicks.map((v) => (
        <g key={v}>
          <line
            className="sensor-grid"
            x1={left}
            x2={right}
            y1={model.y(v)}
            y2={model.y(v)}
          />
          <text x={left - 6} y={model.y(v) + 4} textAnchor="end">
            {v}
          </text>
        </g>
      ))}
      {model.xTicks.map((t) => (
        <text key={t} x={model.x(t)} y={bottom + 16} textAnchor="middle">
          {formatSeconds(t, model.xStep)}
        </text>
      ))}
      <text x={2} y={12}>
        {unit}
      </text>
      {/* Zones et hystérésis nommées à GAUCHE : le passé, souvent calme — à
          droite, la courbe la plus récente est justement celle qui franchit. */}
      <text className="sensor-halo" x={left + 6} y={model.zoneA.y + 13}>
        zone A
      </text>
      <text className="sensor-halo" x={left + 6} y={model.y(bc) - 5}>
        zone C · {FR1.format(bc)}
      </text>
      {model.zoneD === null ? null : (
        <text
          className="sensor-halo"
          x={left + 6}
          y={model.y(vibrationZones.cd) - 5}
        >
          zone D · {FR1.format(vibrationZones.cd)}
        </text>
      )}
      <text
        className="sensor-halo"
        x={left + 6}
        y={model.hysteresis.y + model.hysteresis.height + 12}
      >
        hystérésis {FR1.format(bc - VIBRATION_HYSTERESIS)} → {FR1.format(bc)}
      </text>
      {model.bandPath === "" ? null : (
        <path d={model.bandPath} fill="var(--sensor-band)" />
      )}
      {model.meanPath === "" ? null : (
        <path
          d={model.meanPath}
          fill="none"
          stroke="var(--blue)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}
      {model.markers.map((m) => (
        <g key={m.t}>
          <line
            x1={m.x}
            x2={m.x}
            y1={top}
            y2={bottom}
            stroke="var(--danger)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            className="sensor-ink sensor-halo"
            x={m.labelX}
            y={m.labelY}
            textAnchor={m.anchor}
          >
            {m.label}
          </text>
        </g>
      ))}
    </svg>
  );
});
// #endregion

// #region sensor-spectrum-chart
/** Énergie du photon du Cs-137 (désexcitation du Ba-137m), en keV. */
const CS137_KEV = 661.657;
/** Énergie de masse de l'électron, en keV. */
const ELECTRON_MASS_KEV = 510.999;
/** Raie X K du baryum (Kα, moyenne des deux composantes), en keV. */
const BA_K_XRAY_KEV = 32.2;
const CS137_ALPHA = CS137_KEV / ELECTRON_MASS_KEV;
/** Front Compton : énergie maximale cédée à l'électron (photon diffusé à 180°). */
const COMPTON_EDGE_KEV = (CS137_KEV * 2 * CS137_ALPHA) / (1 + 2 * CS137_ALPHA);
/** Pic de rétrodiffusion : le photon diffusé à 180° dans le blindage, puis absorbé. */
const BACKSCATTER_KEV = CS137_KEV - COMPTON_EDGE_KEV;

const SPECTRUM_HEIGHT = 290;
/** Trois rangées d'annotations au-dessus du tracé. */
const SPECTRUM_ROW_Y = 14;
const SPECTRUM_ROW_GAP = 15;

/**
 * Spectre gamma du Cs-137 sur un analyseur multicanal : aire en échelle
 * logarithmique (log10 du compte + 1), grille par décade, axe en keV, et les
 * quatre repères calculés — raie X K du baryum, pic de rétrodiffusion, front
 * Compton, pic photoélectrique à 661,7 keV. Une seule chaîne de chemin par rendu.
 *
 * @param counts - le compte cumulé par canal (`MCA_CHANNELS` canaux)
 * @param live - le temps vif écoulé, en secondes
 */
export const SpectrumChart = memo(function SpectrumChart(props: {
  counts: Uint32Array;
  live: number;
}) {
  const { counts, live } = props;
  const [ref, width] = useChartWidth();
  const left = 46;
  const right = width - 12;
  const top = SPECTRUM_ROW_Y + 2 * SPECTRUM_ROW_GAP + 10;
  const bottom = SPECTRUM_HEIGHT - 34;
  const compact = right - left < 520;

  const model = useMemo(() => {
    const kevMax = MCA_CHANNELS * KEV_PER_CHANNEL;
    let peak = 0;
    let total = 0;
    for (const c of counts) {
      if (c > peak) peak = c;
      total += c;
    }
    const logMax = Math.max(1, Math.log10(peak + 1));
    const x = (kev: number): number => left + (kev / kevMax) * (right - left);
    const y = (c: number): number =>
      bottom - (Math.log10(c + 1) / logMax) * (bottom - top);

    let path = `M${left},${bottom}`;
    let channel = 0;
    for (const c of counts) {
      path += `L${x((channel + 0.5) * KEV_PER_CHANNEL).toFixed(1)},${y(c).toFixed(1)}`;
      channel += 1;
    }
    path += `L${right},${bottom}Z`;

    const decades: { y: number; label: string }[] = [];
    for (let k = 0; k <= Math.ceil(logMax); k += 1) {
      const c = 10 ** k - 1;
      if (k > 0 && c > peak * 1.01) break;
      decades.push({ y: y(c), label: k === 0 ? "0" : `10${superscript(k)}` });
    }
    const kevStep = compact ? 500 : 250;
    const kevTicks: number[] = [];
    for (let kev = 0; kev <= kevMax - kevStep / 2; kev += kevStep) {
      kevTicks.push(kev);
    }

    const countAt = (kev: number): number =>
      counts.at(Math.floor(kev / KEV_PER_CHANNEL)) ?? 0;
    const mark = (
      kev: number,
      long: string,
      short: string,
      row: number,
    ): {
      kev: number;
      x: number;
      yData: number;
      yRow: number;
      label: string;
    } => ({
      kev,
      x: x(kev),
      yData: y(countAt(kev)),
      yRow: SPECTRUM_ROW_Y + row * SPECTRUM_ROW_GAP,
      label: compact ? short : long,
    });
    const marks = [
      mark(
        BA_K_XRAY_KEV,
        `X K du Ba · ${FR0.format(BA_K_XRAY_KEV)} keV`,
        "X K Ba",
        0,
      ),
      mark(
        BACKSCATTER_KEV,
        `rétrodiffusion · ${FR0.format(BACKSCATTER_KEV)} keV`,
        `rétro. ${FR0.format(BACKSCATTER_KEV)}`,
        1,
      ),
      mark(
        COMPTON_EDGE_KEV,
        `front Compton · ${FR0.format(COMPTON_EDGE_KEV)} keV`,
        `Compton ${FR0.format(COMPTON_EDGE_KEV)}`,
        2,
      ),
      mark(
        CS137_KEV,
        `pic photoélectrique · ${FR1.format(CS137_KEV)} keV`,
        `pic ${FR1.format(CS137_KEV)}`,
        0,
      ),
    ];

    return { total, x, y, path, decades, kevTicks, marks, kevMax };
  }, [counts, left, right, top, bottom, compact]);

  const liveText = compact
    ? `${FR0.format(model.total)} coups · ${FR1.format(live)} s vif`
    : `${FR0.format(model.total)} coups · ${FR1.format(live)} s de temps vif`;
  const label = `Spectre gamma du césium 137, ${FR0.format(MCA_CHANNELS)} canaux de ${FR1.format(KEV_PER_CHANNEL)} keV, échelle logarithmique : ${FR0.format(model.total)} coups en ${FR1.format(live)} s de temps vif, pic photoélectrique à ${FR1.format(CS137_KEV)} keV`;

  return (
    <svg
      ref={ref}
      className="sensor-chart"
      viewBox={`0 0 ${width} ${SPECTRUM_HEIGHT}`}
      role="img"
      aria-label={label}
    >
      {model.decades.map((d) => (
        <g key={d.label}>
          <line
            className="sensor-grid"
            x1={left}
            x2={right}
            y1={d.y}
            y2={d.y}
          />
          <text x={left - 6} y={d.y + 4} textAnchor="end">
            {d.label}
          </text>
        </g>
      ))}
      {model.kevTicks.map((kev, i, all) => (
        <text key={kev} x={model.x(kev)} y={bottom + 16} textAnchor="middle">
          {FR0.format(kev)}
          {i === all.length - 1 ? " keV" : ""}
        </text>
      ))}
      <text x={2} y={SPECTRUM_ROW_Y}>
        coups
      </text>
      <path
        d={model.path}
        fill="var(--sensor-band)"
        stroke="var(--blue)"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      {model.marks.map((m) => (
        <g key={m.kev}>
          <line
            x1={m.x}
            x2={m.x}
            y1={m.yData - 3}
            y2={m.yRow + 3}
            stroke="var(--fg)"
            strokeOpacity="0.35"
          />
          <text className="sensor-ink sensor-halo" x={m.x + 4} y={m.yRow}>
            {m.label}
          </text>
        </g>
      ))}
      <text className="sensor-halo" x={right - 4} y={top + 14} textAnchor="end">
        {liveText}
      </text>
    </svg>
  );
});
// #endregion

// #region sensor-cryo-chart
/** Un point du cryostat : heure simulée et les quatre étages, en kelvins. */
export interface ICryoSample {
  h: number;
  t50: number;
  t4: number;
  still: number;
  mxc: number;
}

const CRYO_HEIGHT = 300;
/** Axe y : de 5 mK à 400 K, en log. */
const CRYO_K_MIN = 0.005;
const CRYO_K_MAX = 400;
const CRYO_GRID: readonly { k: number; label: string }[] = [
  { k: 0.01, label: "10 mK" },
  { k: 0.1, label: "100 mK" },
  { k: 1, label: "1 K" },
  { k: 10, label: "10 K" },
  { k: 100, label: "100 K" },
];
const CRYO_SERIES = [
  { key: "t50", label: "50 K", color: "var(--violet)" },
  { key: "t4", label: "4 K", color: "var(--cyan)" },
  { key: "still", label: "still", color: "var(--amber)" },
  { key: "mxc", label: "MXC", color: "var(--blue)" },
] as const;

/**
 * Mise en froid d'un cryostat à dilution : les quatre étages en échelle
 * logarithmique (5 mK → 400 K) sur `CRYO_HOURS` heures simulées, chaque courbe
 * étiquetée en bout (les étiquettes s'écartent si elles se touchent), et des
 * marqueurs verticaux — condensation du mélange, température de base atteinte,
 * alarme de la chambre de mélange — dont les étiquettes s'empilent par rangée.
 *
 * @param points - les points, dans l'ordre du temps simulé
 * @param condenseAt - heure de la condensation du mélange
 * @param baseAt - heure où la base est atteinte, `null` tant qu'elle ne l'est pas
 * @param alarms - heures où l'alarme MXC s'est levée
 */
export const CryoChart = memo(function CryoChart(props: {
  points: readonly ICryoSample[];
  condenseAt: number;
  baseAt: number | null;
  alarms: readonly number[];
}) {
  const { points, condenseAt, baseAt, alarms } = props;
  const [ref, width] = useChartWidth();
  const left = 54;
  const right = width - 50;
  const top = 14;
  const bottom = CRYO_HEIGHT - 32;
  const compact = right - left < 520;

  const model = useMemo(() => {
    const logMin = Math.log10(CRYO_K_MIN);
    const logMax = Math.log10(CRYO_K_MAX);
    const x = (h: number): number =>
      Math.min(right, Math.max(left, left + (h / CRYO_HOURS) * (right - left)));
    const y = (k: number): number =>
      bottom -
      ((Math.log10(Math.max(k, CRYO_K_MIN)) - logMin) / (logMax - logMin)) *
        (bottom - top);

    const paths: Record<(typeof CRYO_SERIES)[number]["key"], string> = {
      t50: "",
      t4: "",
      still: "",
      mxc: "",
    };
    for (const p of points) {
      const px = x(p.h).toFixed(1);
      for (const s of CRYO_SERIES) {
        const prefix = paths[s.key] === "" ? "M" : "L";
        paths[s.key] += `${prefix}${px},${y(p[s.key]).toFixed(1)}`;
      }
    }

    const last = points.at(-1);
    const wanted = CRYO_SERIES.map((s) =>
      last === undefined ? bottom : y(last[s.key]),
    );
    const labelY = spreadLabels(wanted, 13, top + 5, bottom - 2);
    const ends = CRYO_SERIES.map((s, i) => ({
      key: s.key,
      label: s.label,
      color: s.color,
      yCurve: wanted.at(i) ?? bottom,
      yLabel: labelY.at(i) ?? bottom,
    }));

    const hourStep = pickStep(
      CRYO_HOURS,
      Math.floor((right - left) / 56),
      [1, 2, 4, 8],
    );
    const hourTicks: number[] = [];
    for (let h = 0; h <= CRYO_HOURS; h += hourStep) hourTicks.push(h);

    const markers: {
      key: string;
      x: number;
      label: string;
      color: string;
      row: number;
      anchor: "start" | "end";
      labelX: number;
    }[] = [];
    const place = (key: string, h: number, label: string, color: string) => {
      if (h < 0 || h > CRYO_HOURS) return;
      const px = x(h);
      const fits = px - 5 - label.length * CHAR_WIDTH >= left;
      markers.push({
        key,
        x: px,
        label,
        color,
        row: markers.length,
        anchor: fits ? "end" : "start",
        labelX: fits ? px - 5 : px + 5,
      });
    };
    place("condense", condenseAt, "condensation", "var(--muted)");
    if (baseAt !== null) {
      place(
        "base",
        baseAt,
        compact
          ? `base · ${FR1.format(baseAt)} h`
          : `base atteinte · ${FR1.format(baseAt)} h`,
        "var(--green)",
      );
    }
    alarms.forEach((h, i) => {
      place(
        `alarm-${i}`,
        h,
        compact
          ? `alarme MXC · ${FR1.format(h)} h`
          : `alarme MXC > ${FR0.format(MXC_ALARM_K * 1000)} mK · ${FR1.format(h)} h`,
        "var(--danger)",
      );
    });

    return { x, y, paths, ends, hourTicks, markers };
  }, [points, condenseAt, baseAt, alarms, left, right, top, bottom, compact]);

  const label = `Températures des quatre étages du cryostat — plateau 50 K, plateau 4 K, bouilleur, chambre de mélange — sur ${FR0.format(CRYO_HOURS)} heures simulées, échelle logarithmique de 5 mK à 400 K, ${FR0.format(alarms.length)} alarme(s) de la chambre de mélange`;

  return (
    <svg
      ref={ref}
      className="sensor-chart"
      viewBox={`0 0 ${width} ${CRYO_HEIGHT}`}
      role="img"
      aria-label={label}
    >
      {CRYO_GRID.map((g) => (
        <g key={g.k}>
          <line
            className="sensor-grid"
            x1={left}
            x2={right}
            y1={model.y(g.k)}
            y2={model.y(g.k)}
          />
          <text x={left - 6} y={model.y(g.k) + 4} textAnchor="end">
            {g.label}
          </text>
        </g>
      ))}
      {model.hourTicks.map((h) => (
        <text key={h} x={model.x(h)} y={bottom + 16} textAnchor="middle">
          {h} h
        </text>
      ))}
      {model.markers.map((m) => (
        <g key={m.key}>
          <line
            x1={m.x}
            x2={m.x}
            y1={top}
            y2={bottom}
            stroke={m.color}
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />
          <text
            className="sensor-ink sensor-halo"
            x={m.labelX}
            y={top + 12 + m.row * 14}
            textAnchor={m.anchor}
          >
            {m.label}
          </text>
        </g>
      ))}
      {CRYO_SERIES.map((s) =>
        model.paths[s.key] === "" ? null : (
          <path
            key={s.key}
            d={model.paths[s.key]}
            fill="none"
            stroke={s.color}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        ),
      )}
      {model.ends.map((e) => (
        <g key={e.key}>
          <line
            x1={right}
            x2={right + 5}
            y1={e.yCurve}
            y2={e.yLabel}
            stroke={e.color}
            strokeWidth="1.6"
          />
          <text className="sensor-ink" x={right + 8} y={e.yLabel + 4}>
            {e.label}
          </text>
        </g>
      ))}
    </svg>
  );
});
// #endregion

// #region sensor-bell-chart
/** Une estimation de S après `pairs` paires, avec son écart-type. */
export interface IBellPoint {
  pairs: number;
  S: number;
  sigma: number;
}

const BELL_HEIGHT = 300;
/** Axe x : 100 → 200 000 paires, en log. */
const BELL_PAIRS_MIN = 100;
const BELL_PAIRS_MAX = 200_000;
/** Axe y : 1,4 → 3,1. */
const BELL_S_MIN = 1.4;
const BELL_S_MAX = 3.1;
const BELL_LOCAL_BOUND = 2;
const BELL_TSIRELSON = 2 * Math.SQRT2;

/** Les éléments dessinés pour une série : barres d'erreur, trait, points. */
interface IBellSeries {
  bars: string;
  line: string;
  dots: { pairs: number; x: number; y: number }[];
}

/**
 * Test de Bell (CHSH) : S et son incertitude selon le nombre de paires (axe x
 * logarithmique), pour la mécanique quantique et pour un modèle local à variable
 * cachée, avec les trois lignes de référence — la borne locale 2, la borne de
 * Tsirelson 2√2, et ce qu'une source de visibilité `BELL_VISIBILITY` peut
 * atteindre. Les étiquettes des références sont à droite, de part et d'autre
 * des lignes : les séries y ont convergé SUR les lignes, pas au-dessus ni
 * en dessous.
 *
 * @param quantum - la série de la mécanique quantique
 * @param local - la série du modèle local, mêmes réglages
 */
export const BellChart = memo(function BellChart(props: {
  quantum: readonly IBellPoint[];
  local: readonly IBellPoint[];
}) {
  const { quantum, local } = props;
  const [ref, width] = useChartWidth();
  const left = 50;
  const right = width - 12;
  const top = 14;
  const bottom = BELL_HEIGHT - 44;
  const compact = right - left < 520;

  const model = useMemo(() => {
    const logMin = Math.log10(BELL_PAIRS_MIN);
    const logMax = Math.log10(BELL_PAIRS_MAX);
    const x = (pairs: number): number =>
      left +
      ((Math.log10(pairs) - logMin) / (logMax - logMin)) * (right - left);
    const y = (s: number): number =>
      bottom -
      ((Math.min(BELL_S_MAX, Math.max(BELL_S_MIN, s)) - BELL_S_MIN) /
        (BELL_S_MAX - BELL_S_MIN)) *
        (bottom - top);

    const series = (points: readonly IBellPoint[], dx: number): IBellSeries => {
      let bars = "";
      let line = "";
      const dots: IBellSeries["dots"] = [];
      for (const p of points) {
        if (
          p.pairs < BELL_PAIRS_MIN ||
          p.pairs > BELL_PAIRS_MAX ||
          !Number.isFinite(p.S) ||
          !Number.isFinite(p.sigma)
        ) {
          continue;
        }
        const px = (x(p.pairs) + dx).toFixed(1);
        const py = y(p.S);
        bars += `M${px},${y(p.S - p.sigma).toFixed(1)}V${y(p.S + p.sigma).toFixed(1)}`;
        line += `${line === "" ? "M" : "L"}${px},${py.toFixed(1)}`;
        dots.push({ pairs: p.pairs, x: Number(px), y: py });
      }
      return { bars, line, dots };
    };

    const sTicks: number[] = [];
    for (let s = BELL_S_MIN; s <= BELL_S_MAX + 1e-9; s += 0.2) {
      sTicks.push(Math.round(s * 10) / 10);
    }
    const pairTicks = [100, 1000, 10_000, 100_000];

    return {
      x,
      y,
      sTicks,
      pairTicks,
      quantum: series(quantum, -3),
      local: series(local, 3),
      reachable: BELL_VISIBILITY * BELL_TSIRELSON,
    };
  }, [quantum, local, left, right, top, bottom]);

  const lastQuantum = quantum.at(-1);
  const label = `Test de Bell : S et son incertitude selon le nombre de paires, de ${FR0.format(BELL_PAIRS_MIN)} à ${FR0.format(BELL_PAIRS_MAX)}, mécanique quantique et modèle local ; borne locale ${FR0.format(BELL_LOCAL_BOUND)}, borne de Tsirelson ${FR3.format(BELL_TSIRELSON)}${lastQuantum === undefined ? "" : ` ; dernière valeur quantique ${FR3.format(lastQuantum.S)} ± ${FR3.format(lastQuantum.sigma)}`}`;

  const renderSeries = (s: IBellSeries, color: string) => (
    <g>
      {s.line === "" ? null : (
        <path
          d={s.line}
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.5"
        />
      )}
      {s.bars === "" ? null : (
        <path d={s.bars} fill="none" stroke={color} strokeWidth="1.5" />
      )}
      {s.dots.map((d) => (
        <circle key={d.pairs} cx={d.x} cy={d.y} r="3.5" fill={color} />
      ))}
    </g>
  );

  return (
    <svg
      ref={ref}
      className="sensor-chart"
      viewBox={`0 0 ${width} ${BELL_HEIGHT}`}
      role="img"
      aria-label={label}
    >
      {model.sTicks.map((s) => (
        <g key={s}>
          <line
            className="sensor-grid"
            x1={left}
            x2={right}
            y1={model.y(s)}
            y2={model.y(s)}
          />
          <text x={left - 8} y={model.y(s) + 4} textAnchor="end">
            {FR1.format(s)}
          </text>
        </g>
      ))}
      {model.pairTicks.map((n) => (
        <text key={n} x={model.x(n)} y={bottom + 16} textAnchor="middle">
          {compact
            ? `10${superscript(Math.round(Math.log10(n)))}`
            : FR0.format(n)}
        </text>
      ))}
      <text x={right} y={bottom + 34} textAnchor="end">
        paires de photons détectées (échelle log)
      </text>
      <text x={2} y={12}>
        S
      </text>
      <line
        x1={left}
        x2={right}
        y1={model.y(BELL_LOCAL_BOUND)}
        y2={model.y(BELL_LOCAL_BOUND)}
        stroke="var(--fg)"
        strokeWidth="1.4"
        strokeDasharray="6 4"
      />
      <text
        className="sensor-ink sensor-halo"
        x={right - 4}
        y={model.y(BELL_LOCAL_BOUND) - 5}
        textAnchor="end"
      >
        borne locale · {FR0.format(BELL_LOCAL_BOUND)}
      </text>
      <line
        x1={left}
        x2={right}
        y1={model.y(BELL_TSIRELSON)}
        y2={model.y(BELL_TSIRELSON)}
        stroke="var(--violet)"
        strokeWidth="1.4"
        strokeDasharray="2 3"
      />
      <text
        className="sensor-ink sensor-halo"
        x={right - 4}
        y={model.y(BELL_TSIRELSON) - 5}
        textAnchor="end"
      >
        2√2 ≈ {FR3.format(BELL_TSIRELSON)}
      </text>
      <line
        x1={left}
        x2={right}
        y1={model.y(model.reachable)}
        y2={model.y(model.reachable)}
        stroke="var(--blue)"
        strokeWidth="1.4"
        strokeDasharray="1 3"
      />
      <text
        className="sensor-ink sensor-halo"
        x={right - 4}
        y={model.y(model.reachable) + 14}
        textAnchor="end"
      >
        {FR2.format(BELL_VISIBILITY)} × 2√2 ≈ {FR3.format(model.reachable)}
      </text>
      {renderSeries(model.local, "var(--amber)")}
      {renderSeries(model.quantum, "var(--blue)")}
    </svg>
  );
});
// #endregion
