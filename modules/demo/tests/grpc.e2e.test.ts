import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { nodefonyBin } from "nodefony/testing";
import { afterAll, afterEach, beforeAll, expect, it } from "vitest";
import {
  DEFAULT_MACHINE,
  TELEMETRY_CHANNEL,
  TELEMETRY_LATEST_PATH,
  TELEMETRY_PUSH_PATH,
  TELEMETRY_SERVICE,
  type TelemetryEvent,
} from "../frontend/src/grpc/grpcDemo";
import { DEMO_REALTIME_PATH, type DemoContract } from "../frontend/src/pulse";
import { SENSOR_PUSH_COMMAND } from "../nodefony/command/SensorPushCommand";
import { TelemetryService } from "../nodefony/gen/demo/telemetry/v1/telemetry_pb";
import {
  closeAll,
  demoDescribe,
  httpUrl,
  openSocket,
  serverEnvironment,
  startDemoServer,
  waitFor,
} from "./realtimeHarness";

/**
 * La carte gRPC de bout en bout : la machine (la VRAIE commande
 * `demo:sensor:push`) pousse en gRPC natif sur HTTP/2, la page suit par la
 * socket de la démo, `Latest` se lit en `GET` sans bibliothèque, et `Push`
 * refuse qui n'a pas de jeton.
 */

const run = promisify(execFile);
let stop: () => Promise<void> = async () => {};

beforeAll(async () => {
  stop = await startDemoServer();
});
afterEach(closeAll);
afterAll(() => stop());

demoDescribe("démo — gRPC", () => {
  it("les chemins partagés avec la page sont ceux du contrat", () => {
    expect(TELEMETRY_SERVICE).toBe(TelemetryService.typeName);
    expect(TELEMETRY_PUSH_PATH).toBe(
      `/${TelemetryService.typeName}/${TelemetryService.method.push.name}`,
    );
    expect(TELEMETRY_LATEST_PATH).toBe(
      `/${TelemetryService.typeName}/${TelemetryService.method.latest.name}`,
    );
  });

  it("la machine pousse en gRPC ; la page voit le flux s'ouvrir, les mesures, la fermeture ; Latest la rend en GET", async () => {
    const socket = await openSocket<DemoContract>(DEMO_REALTIME_PATH);
    const events: TelemetryEvent[] = [];
    socket.on(TELEMETRY_CHANNEL, (event) => events.push(event));
    socket.subscribe(TELEMETRY_CHANNEL);
    await socket.whenSubscribed(TELEMETRY_CHANNEL);

    const { stdout } = await run(
      process.execPath,
      [
        nodefonyBin(),
        SENSOR_PUSH_COMMAND,
        "--count",
        "5",
        "--rate",
        "20",
        "--json",
      ],
      {
        // Le terminal de l'utilisateur, pas celui de vitest : sous
        // `NODE_ENV=test`, le noyau replie le runtime sur la production et
        // écarte la démo (`policy: "dev"`), sa commande avec.
        env: {
          ...process.env,
          ...serverEnvironment(),
          NODE_ENV: "development",
        },
        timeout: 120_000,
      },
    );
    const result: unknown = JSON.parse(stdout.trim().split("\n").at(-1) ?? "");
    expect(result).toMatchObject({
      machine: DEFAULT_MACHINE,
      sent: 5,
      accepted: 5,
    });

    await waitFor("la fermeture du flux sur la socket", () =>
      events.some((e) => e.kind === "push" && !e.open),
    );
    expect(events.at(0)).toMatchObject({ kind: "push", open: true });
    expect(events.filter((e) => e.kind === "reading")).toHaveLength(5);
    expect(events.at(-1)).toMatchObject({
      kind: "push",
      open: false,
      machine: DEFAULT_MACHINE,
      accepted: 5,
    });

    // La dernière mesure, lue en GET (Connect, JSON), sans bibliothèque. Dans
    // le MÊME test : un test qui compterait sur la poussée d'un autre
    // dépendrait de leur ordre.
    const message = encodeURIComponent(
      JSON.stringify({ machine: DEFAULT_MACHINE }),
    );
    const response = await fetch(
      httpUrl(
        `${TELEMETRY_LATEST_PATH}?connect=v1&encoding=json&message=${message}`,
      ),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      reading: { machine: DEFAULT_MACHINE },
    });
  });

  it("Push sans jeton : refusé (unauthenticated), rien n'est relayé", async () => {
    const socket = await openSocket<DemoContract>(DEMO_REALTIME_PATH);
    const events: TelemetryEvent[] = [];
    socket.on(TELEMETRY_CHANNEL, (event) => events.push(event));
    socket.subscribe(TELEMETRY_CHANNEL);
    await socket.whenSubscribed(TELEMETRY_CHANNEL);

    const response = await fetch(httpUrl(TELEMETRY_PUSH_PATH), {
      method: "POST",
      headers: {
        "content-type": "application/connect+json",
        "connect-protocol-version": "1",
      },
      body: new Uint8Array(0),
    });
    // Un flux Connect répond en 200 et porte son verdict dans le message de fin.
    const body = await response.text();
    expect(body).toContain("unauthenticated");
    // Le témoin : la page ne voit aucun flux s'ouvrir. Un aller-retour sur la
    // MÊME socket passe après toute trame déjà partie.
    await socket.request("demo:telemetry:state", {});
    expect(events).toHaveLength(0);
  });
});
