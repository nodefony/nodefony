import { randomUUID } from "node:crypto";
import { NodefonySse } from "nodefony/client";
import { adminLogin, csrfHeaders } from "nodefony/testing";
import { afterAll, afterEach, beforeAll, expect, it } from "vitest";
import { DEMOS } from "../demos";
import {
  BINARY_SOCKET,
  type BinaryContract,
} from "../frontend/src/binary/binaryDemo";
import { watchGame, watchVibration } from "../frontend/src/binary/binaryClient";
import { LOBBY_ROOM_ID } from "../frontend/src/chat/rooms";
import { FIRST_PATH } from "../frontend/src/first/firstSteps";
import { checkEcho, helloPath } from "../frontend/src/first/firstClient";
import {
  DEMO_MCP_CHANNEL,
  MCP_GATE_PATH,
  MCP_PROTOCOL_VERSION,
} from "../frontend/src/mcp/mcpDemo";
import {
  finalMessage,
  readMessages,
  toolsOf,
} from "../frontend/src/mcp/mcpClient";
import {
  METEOR_SOCKET,
  type MeteorContract,
} from "../frontend/src/meteor/meteorDemo";
import { watchMeteor } from "../frontend/src/meteor/meteorClient";
import {
  PARTNER_TOKEN_PATH,
  parsePartnerToken,
} from "../frontend/src/partner/partnerApi";
import {
  DEMO_PULSE_CHANNEL,
  DEMO_PULSE_NOW,
  DEMO_REALTIME_PATH,
  type DemoContract,
  type IDemoPulse,
} from "../frontend/src/pulse";
import { RESUME_LAST, SSE_PATH } from "../frontend/src/sse/sseDemo";
import {
  RANGE_BYTES,
  SAMPLE_VIDEO,
  VIDEO_PATH,
} from "../frontend/src/video/videoDemo";
import {
  closeAll,
  demoDescribe,
  httpUrl,
  openSocket,
  socketUrl,
  startDemoServer,
  waitFor,
} from "./realtimeHarness";

/**
 * Le socle commun de la démo, de bout en bout : chaque page répond, chaque
 * canal sans test dédié rend sa première trame, chaque porte HTTP rend son
 * statut. Les sondes, le jeu et la discussion ont leur propre fichier ; ici,
 * on vérifie que RIEN n'est muet, sans approfondir.
 *
 * Guide pour un agent : les chemins, les décodeurs et les vérificateurs
 * viennent du code de la PAGE (`frontend/src/…`) — un test qui recopie une
 * adresse resterait vert le jour où la page change la sienne. Seules les
 * `Request` de la page ne servent pas : leur adresse est relative, et Node
 * n'a pas de page ; l'adresse absolue vient de `httpUrl`.
 * Lancement : `npm run test:e2e`.
 */

let stop: () => Promise<void> = async () => undefined;
/** Les en-têtes d'une session `admin` : cookie et jeton anti-CSRF. */
let admin: Record<string, string> = {};
beforeAll(async () => {
  stop = await startDemoServer();
  const base = httpUrl("");
  admin = await csrfHeaders(base, await adminLogin(base));
});
afterEach(() => closeAll());
afterAll(async () => {
  await stop();
});

/** Les pages que l'index de la démo déclare — la liste que le serveur lit. */
const PAGES = DEMOS.flatMap((demo) => ("path" in demo ? [demo.path] : []));

demoDescribe("démo — les pages", () => {
  it.each(["/demo", ...PAGES])("%s répond en HTML", async (page) => {
    const response = await fetch(httpUrl(page));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/^text\/html/u);
  });

  it("l'accueil sert la page du front choisi, sinon mène à la démo", async () => {
    // Avec un front, `/` est TA page (HTML), démo ou pas. Sans front, il n'y a
    // pas de page : `/` mène à la démo tant qu'elle est chargée — jamais le
    // JSON nu. En production la démo est retirée, et `tests/e2e.test.ts` de
    // l'application y vérifie `/` → 200 sans redirection.
    const home = await fetch(httpUrl("/"), { redirect: "manual" });
    if (home.status === 302) {
      expect(home.headers.get("location")).toBe("/demo");
    } else {
      expect(home.status).toBe(200);
      expect(home.headers.get("content-type")).toMatch(/^text\/html/u);
    }
  });

  it("une page que l'index ne déclare pas rend 404", async () => {
    const response = await fetch(httpUrl("/demo/page-inconnue"));
    expect(response.status).toBe(404);
  });
});

demoDescribe("démo — premiers pas", () => {
  it("la même action répond en HTTP et à une socket", async () => {
    const http = await fetch(httpUrl(helloPath("Ada", "en")));
    expect(http.status).toBe(200);
    expect(await http.json()).toEqual({
      message: "Hello Ada !",
      lang: "en",
      transport: "http",
    });

    // La page ouvre `new WebSocket(…)` sur la MÊME adresse ; la première
    // trame est la réponse de l'action.
    const socket = new WebSocket(socketUrl(helloPath("Ada", "fr")));
    try {
      const first = await new Promise<string>((resolve, reject) => {
        socket.addEventListener("message", (event) =>
          resolve(String(event.data)),
        );
        socket.addEventListener("error", () =>
          reject(new Error("socket /hello refusée")),
        );
      });
      expect(JSON.parse(first)).toEqual({
        message: "Bonjour Ada !",
        lang: "fr",
        transport: "websocket",
      });
    } finally {
      socket.close();
    }
  });

  it("un corps valide est accepté ; un champ en trop est refusé (422), comme la page le prédit", async () => {
    const post = (body: unknown) =>
      fetch(httpUrl(`${FIRST_PATH}/echo`), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    const valid = { name: "Ada", age: 36 };
    expect(checkEcho(valid)).toEqual([]);
    expect((await post(valid)).status).toBe(200);

    const forged = { ...valid, admin: true };
    expect(checkEcho(forged)).not.toEqual([]);
    expect((await post(forged)).status).toBe(422);
  });

  it("une erreur levée devient un statut : livre inconnu → 404, ancienne adresse → 302", async () => {
    expect((await fetch(httpUrl(`${FIRST_PATH}/books/999999`))).status).toBe(
      404,
    );
    const moved = await fetch(httpUrl(`${FIRST_PATH}/old-hello`), {
      redirect: "manual",
    });
    expect(moved.status).toBe(302);
    expect(moved.headers.get("location")).toContain(`${FIRST_PATH}/hello/`);
  });
});

demoDescribe("démo — flux SSE", () => {
  // #region sse-resume-e2e
  it("la reprise par Last-Event-ID enchaîne les lots sans rien rejouer, puis s'arrête (204)", async () => {
    const ids: string[] = [];
    // Reprendre APRÈS l'événement 2 : le serveur rend des lots de deux, ferme,
    // et le client se reconnecte en rappelant le dernier id reçu.
    const source = new NodefonySse(httpUrl(`${SSE_PATH}/resume`), {
      lastEventId: "2",
    });
    source.addEventListener("message", (event) => {
      if (event instanceof MessageEvent) ids.push(event.lastEventId);
    });
    try {
      await waitFor(
        "la fin du flux (204 → CLOSED)",
        () => source.readyState === NodefonySse.CLOSED,
        15_000,
      );
    } finally {
      source.close();
    }
    const expected = Array.from({ length: RESUME_LAST - 2 }, (_, index) =>
      String(index + 3),
    );
    expect(ids).toEqual(expected);
  });
  // #endregion
});

demoDescribe("démo — canaux sans test dédié", () => {
  it("binaire : la vibration et le jeu rendent leurs trames, relues des octets", async () => {
    const socket = await openSocket<BinaryContract>(BINARY_SOCKET);
    const samples: number[] = [];
    expect(
      await watchVibration(socket, 3, (_rpm, frame) =>
        samples.push(frame.length),
      ),
    ).toBe(3);
    expect(samples.every((length) => length > 0)).toBe(true);
    const positions: number[] = [];
    expect(
      await watchGame(socket, 3, (frame) => positions.push(frame.length)),
    ).toBe(3);
    expect(positions.every((length) => length > 0)).toBe(true);
  });

  it("météores : le monde arrive, décodé par la page", async () => {
    const socket = await openSocket<MeteorContract>(METEOR_SOCKET);
    let worlds = 0;
    const off = watchMeteor(socket, () => {
      worlds += 1;
    });
    try {
      await waitFor("trois mondes", () => worlds >= 3);
    } finally {
      off();
    }
  });

  it("le pouls : son état se lit, et un message du salon le fait battre", async () => {
    const socket = await openSocket<DemoContract>(DEMO_REALTIME_PATH);
    const before = await socket.request(DEMO_PULSE_NOW, {});
    const beats: IDemoPulse[] = [];
    socket.on(DEMO_PULSE_CHANNEL, (pulse) => beats.push(pulse));
    socket.subscribe(DEMO_PULSE_CHANNEL);
    await socket.whenSubscribed(DEMO_PULSE_CHANNEL);

    const sent = await fetch(
      httpUrl(`/demo/chat/rooms/${LOBBY_ROOM_ID}/send`),
      {
        method: "POST",
        headers: {
          ...admin,
          "content-type": "application/json",
          "idempotency-key": randomUUID(),
        },
        body: JSON.stringify({ text: "battement" }),
      },
    );
    expect(sent.status).toBe(200);
    await waitFor("le pouls compte le message", () =>
      beats.some((pulse) => pulse.chat.messages > before.chat.messages),
    );
  });
});

demoDescribe("démo — les portes", () => {
  it("MCP : la porte liste ses outils, et le fil en direct voit l'appel", async () => {
    const socket = await openSocket<DemoContract>(DEMO_REALTIME_PATH);
    const methods: (string | null)[] = [];
    socket.on(DEMO_MCP_CHANNEL, (entry) => methods.push(entry.method));
    socket.subscribe(DEMO_MCP_CHANNEL);
    await socket.whenSubscribed(DEMO_MCP_CHANNEL);

    const response = await fetch(httpUrl(MCP_GATE_PATH), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "mcp-protocol-version": MCP_PROTOCOL_VERSION,
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });
    expect(response.status).toBe(200);
    const tools = toolsOf(finalMessage(readMessages(await response.text())));
    expect(tools.length).toBeGreaterThan(0);
    await waitFor("l'appel dans le fil", () => methods.includes("tools/list"));
  });

  it("partenaire : sans jeton 401 ; un jeton délivré à la session ouvre la porte", async () => {
    // Le cookie de session n'ouvre RIEN ici : la zone n'accepte qu'un jeton.
    const refused = await fetch(httpUrl("/demo/api/partner/whoami"), {
      headers: admin,
    });
    expect(refused.status).toBe(401);

    const issued = await fetch(httpUrl(PARTNER_TOKEN_PATH), {
      method: "POST",
      headers: admin,
    });
    expect(issued.status).toBe(200);
    // Lu par le MÊME analyseur que la page : un champ manquant rend `null`.
    const token = parsePartnerToken(await issued.json());
    expect(token).not.toBeNull();
    if (token === null) return;
    const opened = await fetch(httpUrl(token.whoamiPath), {
      headers: { authorization: `Bearer ${token.accessToken}` },
    });
    expect(opened.status).toBe(200);
  });

  it("vidéo : la liste se lit, un média se sert par plages (206)", async () => {
    const list = await fetch(httpUrl(VIDEO_PATH));
    expect(list.status).toBe(200);
    const files: unknown = await list.json();
    expect(files).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: SAMPLE_VIDEO })]),
    );
    const last = RANGE_BYTES - 1;
    const range = await fetch(httpUrl(`${VIDEO_PATH}/${SAMPLE_VIDEO}`), {
      headers: { range: `bytes=0-${last}` },
    });
    expect(range.status).toBe(206);
    expect(range.headers.get("content-range")).toMatch(
      new RegExp(`^bytes 0-${last}/\\d+$`, "u"),
    );
    expect((await range.arrayBuffer()).byteLength).toBe(RANGE_BYTES);
  });
});
