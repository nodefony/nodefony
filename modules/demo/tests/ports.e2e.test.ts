import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { request } from "node:https";
import { isIP } from "node:net";
import path from "node:path";
import { promisify } from "node:util";
import { nodefonyBin } from "nodefony/testing";
import { afterAll, beforeAll, expect, it } from "vitest";
import { DEFAULT_MACHINE } from "../frontend/src/grpc/grpcDemo";
import { MCP_GATE_PATH } from "../frontend/src/mcp/mcpDemo";
import { SENSOR_PUSH_COMMAND } from "../nodefony/command/SensorPushCommand";
import {
  demoDescribe,
  httpsOrigin,
  serverEnvironment,
  startDemoServer,
} from "./realtimeHarness";

/**
 * La démo hors des ports configurés : une application lancée pendant qu'une
 * autre tient déjà son port TLS glisse au suivant. Sa config dit un port, elle
 * en sert un autre — la machine gRPC et la porte MCP doivent suivre celui
 * qu'elle SERT, sans option.
 */

const run = promisify(execFile);
let stop: () => Promise<void> = async () => {};

beforeAll(async () => {
  stop = await startDemoServer({ httpsPortTaken: true });
});
afterAll(() => stop());

/**
 * L'autorité de développement qui signe le certificat de l'exemplaire : on la
 * donne à la requête plutôt que de désarmer la validation.
 */
const DEV_CA = readFileSync(
  path.join(
    "nodefony",
    "config",
    "certificates",
    "ca",
    "nodefony-root-ca.crt.pem",
  ),
);

/**
 * Un `tools/list` envoyé à la porte MCP comme le ferait une page : sur le port
 * TLS que l'exemplaire SERT, sous le nom `host`, avec l'origine `origin`.
 *
 * @returns le statut de la réponse
 */
function listToolsFrom(host: string, origin: string): Promise<number> {
  const served = new URL(httpsOrigin());
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" });
  return new Promise((resolve, reject) => {
    const req = request(
      {
        host,
        // Le nom vérifié par le certificat ; `servername` refuse une IP.
        servername: isIP(host) === 0 ? host : undefined,
        port: Number(served.port),
        path: MCP_GATE_PATH,
        method: "POST",
        ca: DEV_CA,
        headers: {
          origin,
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
          "content-length": Buffer.byteLength(body),
        },
      },
      (res) => {
        res.resume();
        res.once("end", () => resolve(res.statusCode ?? 0));
      },
    );
    req.once("error", reject);
    req.end(body);
  });
}

demoDescribe("démo — ports glissés", () => {
  it("le port TLS configuré est pris : l'exemplaire en sert un autre", () => {
    // Le témoin du décor : sans glissement, les cas suivants ne prouveraient rien.
    expect(new URL(httpsOrigin()).port).not.toBe(
      serverEnvironment().NF_PORT_HTTPS,
    );
  });

  it("la machine gRPC vise le port servi, sans --url", async () => {
    const { stdout } = await run(
      process.execPath,
      [
        nodefonyBin(),
        SENSOR_PUSH_COMMAND,
        "--count",
        "3",
        "--rate",
        "20",
        "--json",
      ],
      {
        // Le terminal de l'utilisateur : sa config, donc le port CONFIGURÉ.
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
      sent: 3,
      accepted: 3,
    });
  });

  it("la porte MCP admet la page servie, sous localhost comme sous 127.0.0.1", async () => {
    const served = new URL(httpsOrigin());
    for (const host of ["localhost", "127.0.0.1"]) {
      const origin = `https://${host}:${served.port}`;
      expect(await listToolsFrom(host, origin), origin).toBe(200);
    }
  });

  it("la porte MCP refuse toujours une page étrangère", async () => {
    // Le témoin de la garde : admettre le port servi n'ouvre pas la porte à
    // une page qui ferait pointer son nom sur cette machine.
    expect(await listToolsFrom("127.0.0.1", "https://evil.example")).toBe(403);
  });
});
