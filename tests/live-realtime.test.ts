import { describe, it, expect, afterEach } from "vitest";
import { getRealtimeHub } from "@nodefony/realtime";
import { createRealtimeHarness } from "@nodefony/realtime/testing";
import {
  createTestFrameAuthorizer,
  createTestIdentity,
} from "@nodefony/security/testing";
import LiveController from "../nodefony/controllers/LiveController";

/** Lit un champ d'une valeur reçue du réseau, sans présumer de sa forme. */
function field(value: unknown, key: string): unknown {
  return typeof value === "object" && value !== null && key in value
    ? Reflect.get(value, key)
    : undefined;
}

/**
 * Tests de la socket de LiveController, sans serveur ni navigateur.
 *
 * `createRealtimeHarness` monte le controller sur une fausse connexion et
 * parle son protocole : il envoie les frames JSON-RPC qu'un client enverrait
 * et rend celles qui sortent. Tout le décor (faux contexte HTTP, remise à zéro
 * du hub, pose d'une identité) vit dans `@nodefony/realtime/testing` — il n'y a
 * rien à recopier ici.
 *
 * Pour éprouver un canal ou une action PROTÉGÉS (`{ roles }`), passer au
 * harnais l'identité ET le verrou de frame, tous deux fournis par
 * `@nodefony/security/testing` — le verrou est celui du pare-feu, jamais une
 * copie :
 *
 * ```ts
 * const h = createRealtimeHarness((ctx) => new LiveController(ctx), {
 *   identity: createTestIdentity({ roles: ["ROLE_USER"] }),
 *   frameAuthorizer: createTestFrameAuthorizer(getRealtimeHub()),
 * });
 * ```
 *
 * Sans verrou, une politique déclarée n'est appliquée par personne — c'est
 * aussi vrai au runtime : c'est `@nodefony/security` qui la fait respecter.
 * Un verrou écrit à la main qui ne regarde que « connecté ou non » laisse
 * passer un canal mal protégé : le test reste vert, et ne prouve rien.
 */
describe("LiveController — socket", () => {
  afterEach(() => getRealtimeHub().clear());

  it("annonce ses canaux et ses actions au client qui se connecte", async () => {
    const h = createRealtimeHarness((ctx) => new LiveController(ctx));
    const welcome = await h.connect();
    // Lus d’abord, comparés ensuite : la ligne ne dépend plus de la longueur
    // du nom du canal, et le formateur la laisse telle quelle.
    const channels = field(welcome.params, "channels");
    const methods = field(welcome.params, "methods");
    expect(channels).toContain("live:events");
    expect(methods).toContain("live:ping");
    h.dispose();
  });

  it("répond à l'action live:ping", async () => {
    const h = createRealtimeHarness((ctx) => new LiveController(ctx));
    await h.connect();
    const pong = await h.call<{ pong: boolean }>("live:ping");
    expect(pong.pong).toBe(true);
    h.dispose();
  });

  it("accepte l'abonnement au canal libre, et le libère à la fermeture", async () => {
    const h = createRealtimeHarness((ctx) => new LiveController(ctx));
    await h.connect();
    await h.subscribe("live:events");
    expect(h.denials()).toHaveLength(0);
    h.close(); // le fournisseur du canal est disposé — plus rien ne diffuse
    h.dispose();
  });

  it("ce qu'une connexion envoie ressort sur le canal (et rien d'autre)", async () => {
    const h = createRealtimeHarness((ctx) => new LiveController(ctx));
    await h.connect();
    await h.subscribe("live:events");
    await h.notify("live:say", { text: "bonjour" });
    // La lecture est sortie de l'assertion À DESSEIN : sa longueur dépend du
    // nom du canal, donc la forme que le formateur impose en dépendrait aussi.
    // Un gabarit ne peut pas être conforme pour les noms courts SEULEMENT.
    const recus = h.messages("live:events");
    expect(recus).toMatchObject([{ text: "bonjour" }]);
    h.dispose();
  });

  it("un canal qui n'existe pas est REFUSÉ, jamais ignoré en silence", async () => {
    // Un abonnement sans réponse est indiscernable d'un canal calme : on
    // chercherait le bug côté producteur alors qu'il est dans le NOM.
    const h = createRealtimeHarness((ctx) => new LiveController(ctx));
    await h.connect();
    await h.subscribe("live:canal-inexistant");
    expect(h.denials()).toMatchObject([{ reason: "unknown" }]);
    h.dispose();
  });

  it("une action authentifiée reçoit son appelant par @CurrentUser", async () => {
    // L'identité qu'aurait posée le pare-feu au handshake. Une action qui
    // écrit au nom de quelqu'un doit avoir CE test : sans lui, un appelant
    // introuvable ne se voit qu'en production.
    const h = createRealtimeHarness((ctx) => new LiveController(ctx), {
      identity: createTestIdentity({ identifier: "alice" }),
    });
    await h.connect();
    const me = await h.call<{ identifier: string }>("live:whoami");
    expect(me.identifier).toBe("alice");
    h.dispose();
  });

  // L'action `live:snapshot` est réservée à ROLE_ADMIN. Les deux
  // cas vont ENSEMBLE : le refus seul passerait aussi avec une action fermée à
  // tous, l'accord seul avec une action ouverte à tous. C'est leur paire qui
  // prouve que la politique de rôles est appliquée — retirer `roles` du
  // décorateur fait tomber le premier.
  it("action réservée à ROLE_ADMIN : refusée à un compte ROLE_USER", async () => {
    const h = createRealtimeHarness((ctx) => new LiveController(ctx), {
      identity: createTestIdentity({ roles: ["ROLE_USER"] }),
      frameAuthorizer: createTestFrameAuthorizer(getRealtimeHub()),
    });
    await h.connect();
    await expect(h.call("live:snapshot")).rejects.toThrow();
    h.dispose();
  });

  it("action réservée à ROLE_ADMIN : accordée à un compte ROLE_ADMIN", async () => {
    const h = createRealtimeHarness((ctx) => new LiveController(ctx), {
      identity: createTestIdentity({ roles: ["ROLE_ADMIN"] }),
      frameAuthorizer: createTestFrameAuthorizer(getRealtimeHub()),
    });
    await h.connect();
    const snapshot = await h.call<{ pid: number }>("live:snapshot");
    expect(snapshot.pid).toBe(process.pid);
    h.dispose();
  });
});
