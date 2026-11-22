import { afterAll, afterEach, beforeAll, expect, it } from "vitest";
import {
  MACHINES,
  plantRate,
  QUANTITIES,
  SENSOR_SOCKET,
  type SensorContract,
} from "../frontend/src/sensor/sensorDemo";
import {
  acknowledge,
  watchAlarms,
  watchCryo,
  watchGamma,
  watchPlant,
  type IPlantScreenFrame,
} from "../frontend/src/sensor/sensorClient";
import {
  closeAll,
  demoDescribe,
  openSocket,
  startDemoServer,
  waitFor,
} from "./realtimeHarness";

/**
 * La sonde de bout en bout : la socket de la page, sur le serveur réel.
 *
 * Ce que les tests unitaires ne voient pas, et que ceux-ci prouvent : la
 * négociation d'une cadence entre le client et le serveur (un canal par
 * cadence), des octets écrits par le service et relus par le codec de la
 * page, les requêtes, et la règle « lire est public, écrire exige une
 * session ». Lancement : `npm run test:e2e` à la racine de l'application.
 */

let stop: () => Promise<void> = async () => undefined;
beforeAll(async () => {
  stop = await startDemoServer();
});
afterEach(() => closeAll());
afterAll(async () => {
  await stop();
});

demoDescribe("sonde — l'usine, à la cadence que l'écran demande", () => {
  it("livre des fenêtres que le codec de la page relit : une valeur par machine et par grandeur", async () => {
    const socket = await openSocket<SensorContract>(SENSOR_SOCKET);
    const frames: IPlantScreenFrame[] = [];
    watchPlant(
      socket,
      plantRate.default,
      (frame) => frames.push(frame),
      () => undefined,
    );
    await waitFor("deux fenêtres d'usine", () => frames.length >= 2);

    const [first, second] = frames;
    expect(first?.ms).toBe(plantRate.default);
    expect(first?.readings).toHaveLength(MACHINES.length * QUANTITIES.length);
    for (const reading of first?.readings ?? []) {
      expect(reading.min).toBeLessThanOrEqual(reading.mean);
      expect(reading.mean).toBeLessThanOrEqual(reading.max);
    }
    // L'horloge du serveur avance d'une fenêtre à l'autre.
    expect(second?.t ?? 0).toBeGreaterThan(first?.t ?? 0);
  });

  // #region sensor-aimd-e2e
  it("AIMD : l'écran en retard recule d'un cran, le serveur suit, puis l'écran revient", async () => {
    const socket = await openSocket<SensorContract>(SENSOR_SOCKET);
    // 500 ms et non le plancher de 100 : un runner de CI chargé affamerait
    // pour de bon un écran à 100 ms, et le test mesurerait la machine.
    const desired = 500;
    // Le réseau tel que CET écran le voit : un saut d'horloge unique simule
    // une trame arrivée très en retard. L'AIMD est le vrai code du framework.
    let skew = 0;
    const clock = () => performance.now() + skew;
    const frames: IPlantScreenFrame[] = [];
    watchPlant(
      socket,
      desired,
      (frame) => {
        frames.push(frame);
        if (frames.length === 2) skew = 60_000;
      },
      () => undefined,
      clock,
    );
    // Chaque trame porte la cadence de SON canal : c'est ce que le SERVEUR a
    // servi, pas ce que le client a demandé.
    await waitFor(
      "l'écran recule puis revient à sa cadence",
      () => {
        const slow = frames.findIndex((f) => f.ms === desired * 2);
        return slow !== -1 && frames.slice(slow).some((f) => f.ms === desired);
      },
      30_000,
    );
    const cadences = frames.map((f) => f.ms);
    // D'abord la cadence désirée, puis la cadence doublée SERVIE par le
    // serveur (canal `sensor:plant:500`), puis de nouveau la désirée.
    expect(cadences[0]).toBe(desired);
    expect(cadences).toContain(desired * 2);
    expect(cadences.at(-1)).toBe(desired);
  });
  // #endregion

  it("le serveur garde la main : une cadence hors bornes n'est pas servie telle quelle", async () => {
    const socket = await openSocket<SensorContract>(SENSOR_SOCKET);
    const frames: IPlantScreenFrame[] = [];
    watchPlant(
      socket,
      plantRate.min / 10,
      (frame) => frames.push(frame),
      () => undefined,
    );
    await waitFor("une fenêtre", () => frames.length >= 1);
    expect(frames[0]?.ms ?? 0).toBeGreaterThanOrEqual(plantRate.min);
  });
});

demoDescribe("sonde — les bancs et leurs requêtes", () => {
  it("le spectre : le cumul entier par requête, puis les canaux touchés s'y ajoutent", async () => {
    const socket = await openSocket<SensorContract>(SENSOR_SOCKET);
    const totals: number[] = [];
    await watchGamma(socket, (counts) => {
      totals.push(counts.reduce((sum, n) => sum + n, 0));
    });
    await waitFor(
      "le spectre, puis des comptes neufs",
      () => totals.length >= 3,
    );
    // Un spectre ne fait que croître : aucun compte ne se perd en route.
    for (let i = 1; i < totals.length; i++) {
      expect(totals[i] ?? 0).toBeGreaterThanOrEqual(totals[i - 1] ?? 0);
    }
  });

  it("le cryostat : l'historique du run, puis un point à chaque trame, sans retour en arrière", async () => {
    const socket = await openSocket<SensorContract>(SENSOR_SOCKET);
    let points: readonly { h: number }[] = [];
    await watchCryo(socket, (_run, next) => {
      points = next;
    });
    const known = points.length;
    await waitFor("un point neuf", () => points.length > known);
    const hours = points.map((p) => p.h);
    expect(hours).toEqual(hours.toSorted((a, b) => a - b));
  });

  it("lire est public, écrire exige une session : acquitter sans connexion est refusé", async () => {
    const socket = await openSocket<SensorContract>(SENSOR_SOCKET);
    let board: { alarms: readonly { id: string }[] } | null = null;
    watchAlarms(socket, (next) => {
      board = next;
    });
    await waitFor("le tableau des alarmes", () => board !== null);
    await expect(acknowledge(socket, "inconnue")).rejects.toThrow();
  });
});
