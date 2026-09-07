import { runningAppPort } from "nodefony/testing";
import { readRuntimeState } from "nodefony";
// La façade temps réel isomorphe — côté Node, subpath `nodefony/client`.
import { RealtimeClient } from "nodefony/client";
import { describe, it, expect, beforeAll } from "vitest";

/**
 * Test E2E — parle en HTTP + WebSocket à l'application RÉELLE (mode production).
 *
 * Seule porte d'entrée : `npm run test:e2e` (build d'abord : un serveur spawné
 * valide le DIST, pas le source). Ce fichier est EXCLU de `vitest.config.ts` et
 * ciblé par `vitest.e2e.config.ts` — invoqué, il tourne TOUJOURS : pas de gate
 * d'environnement qui l'afficherait « skipped » dans un rapport vert.
 *
 * Le démarrage et l'arrêt de l'application vivent dans `tests/e2e.setup.ts`
 * (une fois pour toute la suite), pas ici.
 * Client WebSocket = `WebSocket` NATIF Node (≥ 22) — zéro dépendance de test.
 *
 * Le port n'est PAS écrit en dur : le serveur publie ses ports effectifs
 * (`runningAppPort`) — un test qui suppose 5151 casse dès que l'app déclare son
 * port (`NF_PORT`, `PORT` en PaaS) ou qu'un port occupé l'a fait glisser en dev.
 */
let BASE = "http://127.0.0.1:5151";
let WS_BASE = "ws://127.0.0.1:5151";

describe("e2e — l'app boote et répond (HTTP + WS)", () => {
  beforeAll(() => {
    // Le serveur est PRÊT (le setup global n'est sorti qu'après la readiness) :
    // ses ports sont publiés. Le premier est celui du serveur en clair (une app
    // TLS-only adaptera ces deux lignes).
    const port = runningAppPort();
    BASE = `http://127.0.0.1:${port}`;
    WS_BASE = `ws://127.0.0.1:${port}`;
  });

  it("GET /api/hello → 200 + payload JSON", async () => {
    const res = await fetch(`${BASE}/api/hello`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { hello: string; pid: number };
    expect(body.hello).toBe("nodefony");
    expect(body.pid).toBeGreaterThan(0);
  });

  it("WS /api/echo → echo du message (même controller que le HTTP)", async () => {
    const ws = new WebSocket(`${WS_BASE}/api/echo`);
    const echoed = await new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("timeout WS 10s")),
        10_000,
      );
      ws.addEventListener("open", () => ws.send("ping-e2e"));
      ws.addEventListener("message", (event) => {
        const data = JSON.parse(String(event.data)) as { echo?: string };
        // Le handshake du controller peut répondre d'abord — on attend l'echo.
        if (data.echo !== undefined) {
          clearTimeout(timer);
          resolve(data);
        }
      });
      ws.addEventListener("error", () => reject(new Error("erreur WS")));
    });
    ws.close();
    expect(echoed).toEqual({ echo: "ping-e2e" });
  });

  it("probe cloud-native /livez → 200 (celle qu'interroge k8s)", async () => {
    const res = await fetch(`${BASE}/livez`);
    expect(res.status).toBe(200);
  });

  it("realtime — RPC live:ping + aller-retour sur le canal live:events", async () => {
    // La MÊME façade que les vitrines navigateur — zéro `ws` à la main.
    const live = new RealtimeClient({ url: `${WS_BASE}/api/live/realtime` });
    try {
      // Listener posé AVANT subscribe : le fournisseur démarre au 1ᵉʳ abonné.
      const receivedP = new Promise<unknown>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error("timeout canal 10s")),
          10_000,
        );
        live.on("live:events", (msg) => {
          clearTimeout(timer);
          resolve(msg);
        });
      });
      await live.connect();
      // Action OUVERTE ({ authenticated: false }) — répond même anonyme.
      const pong = (await live.request("live:ping", {})) as { pong: boolean };
      expect(pong.pong).toBe(true);
      // Canal libre. Il ne bat PAS tout seul : il parle quand il se passe
      // quelque chose — ici, ce que cette connexion envoie et que toutes
      // reçoivent. C'est ce partage qui fait l'intérêt d'une socket, pas un
      // battement qui coûterait une trame par seconde et par client.
      live.subscribe("live:events");
      live.emit("live:say", { text: "bonjour e2e" });
      const received = (await receivedP) as { text: string; pid: number };
      expect(received.text).toBe("bonjour e2e");
      expect(received.pid).toBeGreaterThan(0);
    } finally {
      // Le nettoyage vit dans le `finally` : une assertion qui tombe ne doit
      // jamais laisser une socket ouverte derrière le run.
      live.disconnect();
    }
  }, 15_000);
});
