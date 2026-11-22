import { describe, it, expect } from "vitest";
import {
  ACQUISITION_HZ,
  CRYO_HOURS,
  DEAD_TIME_US,
  KEV_PER_CHANNEL,
  MACHINES,
  MXC_ALARM_K,
  MXC_HYSTERESIS_K,
  QUANTITIES,
  sourceRate,
  TOMO_RAW_SHOTS,
  VIBRATION_HYSTERESIS,
  vibrationZones,
  windowRecord,
  type TomoTriple,
} from "../frontend/src/sensor/sensorDemo";
import {
  blochEstimate,
  blochTarget,
  chsh,
  measuredRate,
  unpackShots,
} from "../frontend/src/sensor/sensorStats";
import { createRandom, type IRandom } from "../nodefony/sensor/random";
import { createPlant, WindowReducer } from "../nodefony/sensor/plant";
import { AlarmEngine, MovingAverage } from "../nodefony/sensor/alarms";
import { createGammaSource, gammaLines } from "../nodefony/sensor/gamma";
import { createCryostat } from "../nodefony/sensor/cryostat";
import {
  createBellExperiment,
  createQubitSource,
} from "../nodefony/sensor/quantum";

/**
 * La physique simulée de la sonde, graine fixée : rien d'aléatoire d'un run
 * à l'autre, aucune attente réelle. Les chiffres attendus sont ceux de la
 * maquette validée (centroïde 661,6 keV, 7 % de résolution, 7,4 % de temps
 * mort à 20 k/s, S ≈ 2,71, F ≈ 0,97, base du cryostat vers 27,3 h, fuite
 * vue vers 29,3 h).
 */

const SEED = 747;

/** La série de la vibration de la machine 3 dans la trame. */
const vibrationOfMachine3 =
  2 * QUANTITIES.length + QUANTITIES.findIndex((q) => q.id === "vibration");

/** Un chrono que le test fait avancer lui-même. */
function clock(): { now: () => number; advance: (ms: number) => void } {
  let t = 1_700_000_000_000;
  return {
    now: () => t,
    advance: (ms) => {
      t += ms;
    },
  };
}

describe("Sonde — usine", () => {
  it("une fenêtre pèse 12 octets ; une trame de 12 séries en pèse 144", () => {
    expect(MACHINES.length * QUANTITIES.length).toBe(12);
    expect(windowRecord.bytes).toBe(12);
    const windows = Array.from({ length: 12 }, (_, i) => ({
      min: i,
      max: i + 2,
      mean: i + 1,
    }));
    const bytes = windowRecord.write(windows);
    expect(bytes.byteLength).toBe(144);
    expect(windowRecord.read(bytes)).toEqual(windows);
  });

  it("WindowReducer rend min, max et moyenne par série, puis repart de zéro", () => {
    const reducer = new WindowReducer(2);
    expect(reducer.flush()).toBeNull();
    reducer.add(new Float32Array([1, 10]));
    reducer.add(new Float32Array([3, 20]));
    reducer.add(new Float32Array([2, 30]));
    const batch = reducer.flush();
    expect(batch).not.toBeNull();
    expect(batch?.n).toBe(3);
    expect(batch?.windows).toEqual([
      { min: 1, max: 3, mean: 2 },
      { min: 10, max: 30, mean: 20 },
    ]);
    expect(reducer.flush()).toBeNull();
    reducer.add(new Float32Array([-4, 0.5]));
    const next = reducer.flush();
    expect(next?.n).toBe(1);
    expect(next?.windows).toEqual([
      { min: -4, max: -4, mean: -4 },
      { min: 0.5, max: 0.5, mean: 0.5 },
    ]);
  });

  it("step rend toujours le même tableau, à la taille de la trame", () => {
    const plant = createPlant(createRandom(SEED));
    const first = plant.step(1 / ACQUISITION_HZ);
    const second = plant.step(1 / ACQUISITION_HZ);
    expect(second).toBe(first);
    expect(first.length).toBe(MACHINES.length * QUANTITIES.length);
    expect(plant.time).toBeCloseTo(2 / ACQUISITION_HZ, 9);
  });

  it("la machine 3 franchit la zone C dans un cycle ; la moyenne d'1 s ne bascule qu'une fois quand le brut à hystérésis seule bat bien plus", () => {
    const plant = createPlant(createRandom(SEED));
    const dt = 1 / ACQUISITION_HZ;
    const chrono = clock();
    const engine = new AlarmEngine(
      [
        {
          id: "m3",
          source: "M3 · Vibration",
          unit: "mm/s",
          limit: vibrationZones.bc,
          hysteresis: VIBRATION_HYSTERESIS,
        },
      ],
      10,
      chrono.now,
    );
    const average = new MovingAverage(ACQUISITION_HZ);
    let rawMax = 0;
    let rawAlarm = false;
    let rawToggles = 0;
    let windowedChanges = 0;
    let activations = 0;
    const temperatureSlot = QUANTITIES.findIndex((q) => q.id === "temperature");
    const healthyVibrationMax = [0, 0, 0, 0];
    let temperatureOut = 0;
    for (let k = 0; k < 130 * ACQUISITION_HZ; k += 1) {
      const values = plant.step(dt);
      chrono.advance(1000 / ACQUISITION_HZ);
      const v = values.at(vibrationOfMachine3) ?? 0;
      rawMax = Math.max(rawMax, v);
      if (!rawAlarm && v >= vibrationZones.bc) {
        rawAlarm = true;
        rawToggles += 1;
      } else if (rawAlarm && v < vibrationZones.bc - VIBRATION_HYSTERESIS) {
        rawAlarm = false;
        rawToggles += 1;
      }
      const mean = average.push(v);
      if (average.full && engine.observe("m3", mean)) {
        windowedChanges += 1;
        if (engine.board().alarms.at(0)?.state === "unacknowledged")
          activations += 1;
      }
      for (let m = 0; m < MACHINES.length; m += 1) {
        const temperature =
          values.at(m * QUANTITIES.length + temperatureSlot) ?? 0;
        if (temperature < 40 || temperature > 70) temperatureOut += 1;
        if (m === 2) continue;
        const vibration =
          values.at(
            m * QUANTITIES.length + (vibrationOfMachine3 % QUANTITIES.length),
          ) ?? 0;
        healthyVibrationMax[m] = Math.max(
          healthyVibrationMax.at(m) ?? 0,
          vibration,
        );
      }
    }
    // Le roulement use : le brut monte en zone C (et même D avec le bruit).
    expect(rawMax).toBeGreaterThan(vibrationZones.bc);
    // Une seule levée d'alarme sur la moyenne d'1 s, et sa retombée à la maintenance.
    expect(activations).toBe(1);
    expect(windowedChanges).toBe(2);
    // Le brut, même avec l'hystérésis, bat plusieurs fois autour du seuil.
    expect(rawToggles).toBeGreaterThan(windowedChanges);
    expect(rawToggles).toBeGreaterThanOrEqual(4);
    // Les autres machines restent saines, en zone A ; toutes les températures sont plausibles.
    for (let m = 0; m < MACHINES.length; m += 1) {
      if (m === 2) continue;
      expect(healthyVibrationMax.at(m) ?? 0).toBeLessThan(vibrationZones.ab);
    }
    expect(temperatureOut).toBe(0);
  });
});

describe("Sonde — alarmes", () => {
  it("MovingAverage glisse sur les N dernières valeurs et se remplit", () => {
    const average = new MovingAverage(4);
    expect(average.full).toBe(false);
    expect(average.push(1)).toBe(1);
    expect(average.push(2)).toBe(1.5);
    expect(average.push(3)).toBe(2);
    expect(average.full).toBe(false);
    expect(average.push(4)).toBe(2.5);
    expect(average.full).toBe(true);
    expect(average.push(5)).toBe(3.5);
    expect(average.push(9)).toBe(5.25);
    expect(average.full).toBe(true);
    average.reset();
    expect(average.full).toBe(false);
    expect(average.push(10)).toBe(10);
    expect(() => new MovingAverage(0)).toThrow(RangeError);
  });

  it("parcourt chaque transition ISA-18.2 : levée, acquittement, retombée", () => {
    const chrono = clock();
    const engine = new AlarmEngine(
      [
        {
          id: "m3",
          source: "M3 · Vibration",
          unit: "mm/s",
          limit: 4.5,
          hysteresis: 0.3,
        },
      ],
      20,
      chrono.now,
    );
    const alarm = () => engine.board().alarms.at(0);
    // normal → normal : rien ne change, la valeur est retenue.
    expect(engine.observe("m3", 2.0)).toBe(false);
    expect(alarm()?.state).toBe("normal");
    expect(alarm()?.value).toBe(2.0);
    // normal → unacknowledged au seuil.
    chrono.advance(1000);
    expect(engine.observe("m3", 4.5)).toBe(true);
    expect(alarm()?.state).toBe("unacknowledged");
    expect(alarm()?.since).toBe(chrono.now());
    expect(alarm()?.ackBy).toBeNull();
    // unacknowledged → acknowledged par la session.
    expect(engine.acknowledge("m3", "alice")).toBe(true);
    expect(alarm()?.state).toBe("acknowledged");
    expect(alarm()?.ackBy).toBe("alice");
    expect(engine.acknowledge("m3", "alice")).toBe(false);
    // Dans la bande d'hystérésis : rien ne bouge.
    expect(engine.observe("m3", 4.3)).toBe(false);
    expect(alarm()?.state).toBe("acknowledged");
    // acknowledged → normal sous seuil − hystérésis.
    expect(engine.observe("m3", 4.1)).toBe(true);
    expect(alarm()?.state).toBe("normal");
    expect(alarm()?.ackBy).toBeNull();
    // unacknowledged → returned (retombée sans acquittement) → unacknowledged (remonte).
    expect(engine.observe("m3", 4.6)).toBe(true);
    expect(engine.observe("m3", 4.0)).toBe(true);
    expect(alarm()?.state).toBe("returned");
    expect(engine.observe("m3", 4.4)).toBe(false);
    expect(engine.observe("m3", 4.6)).toBe(true);
    expect(alarm()?.state).toBe("unacknowledged");
    // returned → normal par acquittement.
    expect(engine.observe("m3", 4.0)).toBe(true);
    expect(engine.acknowledge("m3", "bob")).toBe(true);
    expect(alarm()?.state).toBe("normal");
    const journal = engine.board().journal;
    expect(journal.at(-1)?.by).toBe("bob");
    expect(journal.at(-1)?.state).toBe("normal");
    expect(journal.map((line) => line.state)).toEqual([
      "unacknowledged",
      "acknowledged",
      "normal",
      "unacknowledged",
      "returned",
      "unacknowledged",
      "returned",
      "normal",
    ]);
    expect(journal.map((line) => line.seq)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("refuse l'acquittement d'une alarme normale ou inconnue", () => {
    const engine = new AlarmEngine(
      [{ id: "m3", source: "M3", unit: "mm/s", limit: 4.5, hysteresis: 0.3 }],
      20,
      clock().now,
    );
    expect(engine.acknowledge("m3", "alice")).toBe(false);
    expect(engine.acknowledge("nope", "alice")).toBe(false);
    expect(engine.observe("nope", 99)).toBe(false);
    expect(engine.board().journal).toEqual([]);
  });

  it("borne le journal : les lignes les plus anciennes sortent, seq continue", () => {
    const engine = new AlarmEngine(
      [{ id: "m3", source: "M3", unit: "mm/s", limit: 4.5, hysteresis: 0.3 }],
      3,
      clock().now,
    );
    for (let k = 0; k < 5; k += 1) engine.observe("m3", k % 2 === 0 ? 5 : 1);
    const journal = engine.board().journal;
    expect(journal).toHaveLength(3);
    expect(journal.map((line) => line.seq)).toEqual([3, 4, 5]);
    expect(journal.at(-1)?.state).toBe("unacknowledged");
  });

  it("board rend une copie : la modifier ne touche pas le moteur", () => {
    const engine = new AlarmEngine(
      [{ id: "m3", source: "M3", unit: "mm/s", limit: 4.5, hysteresis: 0.3 }],
      3,
      clock().now,
    );
    const board = engine.board();
    const first = board.alarms.at(0);
    if (first !== undefined) first.state = "acknowledged";
    board.journal.push({
      seq: 99,
      t: 0,
      id: "m3",
      source: "M3",
      state: "normal",
      value: 0,
      by: null,
    });
    expect(engine.board().alarms.at(0)?.state).toBe("normal");
    expect(engine.board().journal).toHaveLength(0);
  });
});

/** Centroïde et largeur à mi-hauteur du pic entre `lowKeV` et `highKeV`. */
function peakOf(
  spectrum: Uint32Array,
  lowKeV: number,
  highKeV: number,
): { centroid: number; fwhm: number; counts: number } {
  const lo = Math.floor(lowKeV / KEV_PER_CHANNEL);
  const hi = Math.floor(highKeV / KEV_PER_CHANNEL);
  let sum = 0;
  let moment = 0;
  let peak = lo;
  for (let c = lo; c <= hi; c += 1) {
    const n = spectrum.at(c) ?? 0;
    sum += n;
    moment += n * (c + 0.5) * KEV_PER_CHANNEL;
    if (n > (spectrum.at(peak) ?? 0)) peak = c;
  }
  const half = (spectrum.at(peak) ?? 0) / 2;
  let left = peak;
  while (left > lo && (spectrum.at(left) ?? 0) > half) left -= 1;
  let right = peak;
  while (right < hi && (spectrum.at(right) ?? 0) > half) right += 1;
  return {
    centroid: moment / sum,
    fwhm: (right - left) * KEV_PER_CHANNEL,
    counts: sum,
  };
}

describe("Sonde — spectre gamma", () => {
  it("le pic du Cs-137 est centré à 661,6 keV avec 7 % de résolution", () => {
    const source = createGammaSource(createRandom(SEED));
    for (let k = 0; k < 30 * 50; k += 1) source.step(0.02);
    const spectrum = source.spectrum();
    const peak = peakOf(spectrum, 600, 720);
    expect(peak.counts).toBeGreaterThan(100_000);
    expect(Math.abs(peak.centroid - gammaLines.photopeak)).toBeLessThan(1.5);
    const resolution = peak.fwhm / peak.centroid;
    expect(resolution).toBeGreaterThan(0.062);
    expect(resolution).toBeLessThan(0.078);
    // Le front Compton (477 keV) et la rétrodiffusion (184 keV) sont là où la cinématique les met.
    expect(gammaLines.comptonEdge).toBeCloseTo(477.3, 0);
    expect(gammaLines.backscatter).toBeCloseTo(184.3, 0);
    expect(
      spectrum.at(Math.floor(gammaLines.backscatter / KEV_PER_CHANNEL)) ?? 0,
    ).toBeGreaterThan(spectrum.at(Math.floor(560 / KEV_PER_CHANNEL)) ?? 0);
  });

  it("le temps mort non paralysable mange 7,4 % des coups à 20 k/s, comme measuredRate le dit", () => {
    const source = createGammaSource(createRandom(SEED));
    expect(source.trueRate).toBe(sourceRate.default);
    expect(source.measuredRate).toBeCloseTo(
      measuredRate(sourceRate.default, DEAD_TIME_US),
      9,
    );
    expect(1 - source.measuredRate / source.trueRate).toBeCloseTo(0.0741, 3);
    for (let k = 0; k < 10 * 50; k += 1) source.step(0.02);
    expect(source.real).toBeCloseTo(10, 6);
    expect(source.live / source.real).toBeCloseTo(
      source.measuredRate / source.trueRate,
      6,
    );
    const total = source.spectrum().reduce((sum, n) => sum + n, 0);
    const expected = source.measuredRate * source.real;
    expect(Math.abs(total - expected)).toBeLessThan(5 * Math.sqrt(expected));
    // À pleine activité, la perte est de 44 % ; le réglage est borné.
    source.setTrueRate(sourceRate.max);
    expect(1 - source.measuredRate / source.trueRate).toBeCloseTo(0.444, 2);
    source.setTrueRate(1);
    expect(source.trueRate).toBe(sourceRate.min);
    source.setTrueRate(1e9);
    expect(source.trueRate).toBe(sourceRate.max);
  });

  it("la somme des deltas est le spectre, canaux croissants, et l'attente se vide", () => {
    const source = createGammaSource(createRandom(SEED));
    const rebuilt = new Uint32Array(spectrumLength());
    for (let frame = 0; frame < 20; frame += 1) {
      for (let k = 0; k < 5; k += 1) source.step(0.02);
      const delta = source.takeDelta();
      for (let i = 1; i < delta.length; i += 1) {
        expect(
          (delta.at(i)?.channel ?? 0) > (delta.at(i - 1)?.channel ?? 0),
        ).toBe(true);
      }
      for (const { channel, count } of delta) {
        expect(count).toBeGreaterThan(0);
        rebuilt[channel] = (rebuilt.at(channel) ?? 0) + count;
      }
    }
    expect(source.takeDelta()).toEqual([]);
    expect(Array.from(rebuilt)).toEqual(Array.from(source.spectrum()));
    source.reset();
    expect(source.spectrum().every((n) => n === 0)).toBe(true);
    expect(source.live).toBe(0);
    expect(source.real).toBe(0);
    expect(source.trueRate).toBe(sourceRate.default);
  });
});

function spectrumLength(): number {
  return createGammaSource(createRandom(1)).spectrum().length;
}

describe("Sonde — cryostat", () => {
  const STEP_H = 30 / 3600;

  it("atteint la base vers 27,3 h, fuit à 29 h et repart de 300 K après 32 h", () => {
    const cryostat = createCryostat(createRandom(SEED));
    const firstAt: Partial<Record<string, number>> = {};
    let previous = cryostat.phase;
    let backToBase: number | null = null;
    while (cryostat.run === 0) {
      const point = cryostat.step(STEP_H);
      if (cryostat.run !== 0) {
        // Le run suivant repart de l'ambiante.
        expect(cryostat.phase).toBe("cooldown");
        expect(point.mxc).toBeGreaterThan(250);
        expect(cryostat.hours).toBeLessThan(STEP_H * 1.01);
        break;
      }
      if (cryostat.phase !== previous) {
        if (cryostat.phase === "base" && previous === "leak")
          backToBase = point.h;
        else firstAt[cryostat.phase] ??= point.h;
        previous = cryostat.phase;
      }
    }
    expect(firstAt.condensing).toBeGreaterThan(22);
    expect(firstAt.condensing).toBeLessThan(22.1);
    expect(firstAt.base).toBeGreaterThan(27.0);
    expect(firstAt.base).toBeLessThan(27.7);
    expect(firstAt.leak).toBeGreaterThanOrEqual(29);
    expect(firstAt.leak).toBeLessThan(29.1);
    expect(backToBase).toBeGreaterThan(30);
    expect(backToBase).toBeLessThan(30.2);
    expect(cryostat.run).toBe(1);
    expect(CRYO_HOURS).toBe(32);
  });

  it("l'alarme de la chambre de mélange (50 mK, moyenne 1 min, hystérésis 5 mK) voit la fuite vers 29,3 h", () => {
    const cryostat = createCryostat(createRandom(SEED));
    const chrono = clock();
    const engine = new AlarmEngine(
      [
        {
          id: "mxc",
          source: "MXC",
          unit: "K",
          limit: MXC_ALARM_K,
          hysteresis: MXC_HYSTERESIS_K,
        },
      ],
      10,
      chrono.now,
    );
    // Deux points par minute à 30 s : la moyenne glissante d'une minute porte sur 2 points.
    const average = new MovingAverage(2);
    let raisedAt: number | null = null;
    let returnedAt: number | null = null;
    let baseMax = 0;
    while (cryostat.run === 0 && cryostat.hours < 31.9) {
      const point = cryostat.step(STEP_H);
      chrono.advance(30_000);
      if (cryostat.phase !== "base" && cryostat.phase !== "leak") continue;
      const mean = average.push(point.mxc);
      if (cryostat.phase === "base" && point.h >= 28 && point.h < 29)
        baseMax = Math.max(baseMax, point.mxc);
      if (engine.observe("mxc", mean)) {
        const state = engine.board().alarms.at(0)?.state;
        if (state === "unacknowledged" && raisedAt === null) raisedAt = point.h;
        if (state === "returned") returnedAt = point.h;
      }
    }
    // Une heure après la base, la chambre de mélange se tient sous 11,5 mK.
    expect(baseMax).toBeGreaterThan(0);
    expect(baseMax).toBeLessThan(0.0115);
    expect(raisedAt).not.toBeNull();
    expect(raisedAt ?? 0).toBeGreaterThan(29.2);
    expect(raisedAt ?? 0).toBeLessThan(29.4);
    expect(returnedAt ?? 0).toBeGreaterThan(29.5);
    expect(returnedAt ?? 0).toBeLessThan(29.8);
    expect(engine.board().journal).toHaveLength(2);
  });
});

describe("Sonde — test de Bell", () => {
  it("100 000 paires : la mécanique quantique viole CHSH de plus de 5 σ, le modèle local jamais", () => {
    const bell = createBellExperiment(createRandom(SEED));
    bell.addPairs(100_000);
    expect(bell.pairs).toBe(100_000);
    const { quantum, local } = bell.counts();
    expect(quantum.n.reduce((a, b) => a + b, 0)).toBe(100_000);
    expect(local.n).toEqual(quantum.n);
    const q = chsh(quantum);
    expect(q.S).toBeGreaterThan(2.6);
    expect(q.S).toBeLessThan(2.8);
    expect(q.sigma).toBeLessThan(0.012);
    expect((q.S - 2) / q.sigma).toBeGreaterThan(5);
    const l = chsh(local);
    expect(l.S).toBeLessThanOrEqual(2 + 3 * l.sigma);
    expect(l.S).toBeGreaterThan(1.9);
    // Les compteurs rendus sont des copies.
    quantum.n[0] = 0;
    expect(bell.counts().quantum.n[0]).toBeGreaterThan(20_000);
    bell.reset();
    expect(bell.pairs).toBe(0);
    expect(bell.counts().quantum.s).toEqual([0, 0, 0, 0]);
  });

  it("chsh rend 0 sur des compteurs vides et ignore les réglages sans paire", () => {
    expect(chsh({ n: [0, 0, 0, 0], s: [0, 0, 0, 0] })).toEqual({
      S: 0,
      sigma: 0,
      E: [0, 0, 0, 0],
    });
    const r = chsh({ n: [10, 0, 10, 10], s: [10, 0, -10, 10] });
    expect(r.E).toEqual([1, 0, -1, 1]);
    expect(r.S).toBe(1);
    expect(r.sigma).toBe(0);
  });
});

/** Un générateur scripté : `next()` alterne 0 (succès) et 0,99 (échec). */
function alternating(): IRandom {
  let k = 0;
  return {
    next: () => {
      k += 1;
      return k % 2 === 1 ? 0 : 0.99;
    },
    gauss: () => 0,
    poisson: (mean) => Math.round(mean),
  };
}

describe("Sonde — tomographie", () => {
  it("l'état visé est unitaire et la fidélité d'un calcul exact se vérifie à la main", () => {
    const target = blochTarget();
    expect(Math.hypot(...target)).toBeCloseTo(1, 12);
    expect(target[0]).toBeCloseTo(0.6124, 4);
    expect(target[1]).toBeCloseTo(0.6124, 4);
    expect(target[2]).toBeCloseTo(0.5, 12);
    const exact = blochEstimate([4, 4, 4], [4, 2, 2]);
    expect(exact.raw).toEqual([1, 0, 0]);
    expect(exact.projected).toBe(false);
    expect(exact.fidelity).toBeCloseTo((1 + target[0]) / 2, 12);
    const outside = blochEstimate([2, 2, 2], [2, 2, 2]);
    expect(outside.norm).toBeCloseTo(Math.sqrt(3), 12);
    expect(outside.projected).toBe(true);
    expect(Math.hypot(...outside.estimate)).toBeCloseTo(1, 12);
    const empty = blochEstimate([0, 0, 0], [0, 0, 0]);
    expect(empty.fidelity).toBe(0.5);
    expect(empty.fidelitySigma).toBe(0);
  });

  it("10 000 tirs par base : fidélité ≈ 0,97 (au plus 0,975 pour 5 % de dépolarisation)", () => {
    const source = createQubitSource(createRandom(SEED));
    source.addShots(10_000);
    expect(source.shotsPerBasis).toBe(10_000);
    const { n, plus } = source.counts();
    expect(n).toEqual([10_000, 10_000, 10_000]);
    const estimate = blochEstimate(n, plus);
    expect(estimate.fidelity).toBeGreaterThan(0.96);
    expect(estimate.fidelity).toBeLessThan(0.985);
    expect(Math.abs(estimate.fidelity - 0.975)).toBeLessThan(
      4 * estimate.fidelitySigma,
    );
    expect(estimate.fidelitySigma).toBeLessThan(0.006);
    // Les compteurs rendus sont des copies.
    n[0] = 0;
    expect(source.counts().n[0]).toBe(10_000);
  });

  it("à 10 tirs par base, environ 54 % des estimations brutes sortent de la sphère", () => {
    const source = createQubitSource(createRandom(SEED));
    const trials = 2000;
    let outside = 0;
    for (let k = 0; k < trials; k += 1) {
      source.reset();
      source.addShots(10);
      const { n, plus } = source.counts();
      if (blochEstimate(n, plus).projected) outside += 1;
    }
    const share = outside / trials;
    expect(share).toBeGreaterThan(0.48);
    expect(share).toBeLessThan(0.6);
  });

  it("les tirs bruts sont tassés un bit par tir : unpackShots retrouve les « + »", () => {
    const source = createQubitSource(createRandom(SEED));
    source.addShots(700);
    const z = source.shots(2);
    expect(z.basis).toBe(2);
    expect(z.count).toBe(700);
    expect(z.bits.length).toBe(88);
    expect(unpackShots(z.bits, z.count)).toBe(source.counts().plus[2]);
    source.addShots(600);
    const x = source.shots(0);
    expect(x.count).toBe(TOMO_RAW_SHOTS);
    expect(x.bits.length).toBe(Math.ceil(TOMO_RAW_SHOTS / 8));
    expect(unpackShots(x.bits, x.count)).toBeLessThanOrEqual(TOMO_RAW_SHOTS);
    expect(unpackShots(x.bits, x.count)).toBeGreaterThan(TOMO_RAW_SHOTS * 0.6);
  });

  it("l'anneau garde les derniers tirs, du plus ancien au plus récent", () => {
    const source = createQubitSource(alternating());
    // 1 002 tirs par base : le tir k réussit si k est pair ; les deux premiers sortent de l'anneau.
    source.addShots(1002);
    const shots = source.shots(1);
    expect(shots.count).toBe(TOMO_RAW_SHOTS);
    expect(source.counts().plus).toEqual([501, 501, 501]);
    expect(unpackShots(shots.bits, shots.count)).toBe(500);
    // Le plus ancien tir gardé est le n° 2 (réussi) : bit 0 à 1, puis alternance.
    expect(shots.bits.at(0)).toBe(0x55);
    expect(shots.bits.at(124)).toBe(0x55);
    // Un seul tir : un octet, un bit.
    source.reset();
    source.addShots(1);
    const one = source.shots(0);
    expect(one.count).toBe(1);
    expect(one.bits).toEqual(new Uint8Array([1]));
    expect(unpackShots(one.bits, one.count)).toBe(1);
  });

  it("unpackShots ne compte que les bits valides", () => {
    const bits = new Uint8Array([0xff, 0x01]);
    expect(unpackShots(bits, 9)).toBe(9);
    expect(unpackShots(bits, 8)).toBe(8);
    expect(unpackShots(bits, 3)).toBe(3);
    expect(unpackShots(bits, 16)).toBe(9);
    expect(unpackShots(new Uint8Array(0), 0)).toBe(0);
  });

  it("measuredRate : 18 518 coups mesurés pour 20 000 vrais à 4 µs", () => {
    expect(measuredRate(20_000, 4)).toBeCloseTo(18_518.52, 1);
    expect(measuredRate(0, 4)).toBe(0);
    expect(measuredRate(200_000, 4)).toBeCloseTo(111_111.11, 1);
    const triple: TomoTriple = [1, 2, 3];
    expect(triple).toHaveLength(3);
  });
});
