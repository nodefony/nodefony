import { afterAll, afterEach, beforeAll, expect, it } from "vitest";
import {
  PRISM_CREW,
  PRISM_SOCKET,
  type PrismContract,
} from "../frontend/src/prism/prismDemo";
import { IDLE_MS } from "../nodefony/game/GameRoom";
import {
  sendSteer,
  watchPrism,
  type IPrismWorld,
} from "../frontend/src/prism/prismClient";
import {
  closeAll,
  demoDescribe,
  openSocket,
  startDemoServer,
  waitFor,
} from "./realtimeHarness";

/**
 * Le jeu de bout en bout : deux joueurs, deux sockets, UNE salle.
 *
 * Ce que les tests unitaires de `GameRoom` ne voient pas : la diffusion d'un
 * tour à TOUS les spectateurs, la commande d'un joueur qui revient dans la
 * trame de l'autre, et le départ d'un joueur — sa connexion fermée — qui le
 * retire de la salle. La salle est la brique de tous les jeux de la démo :
 * Prisme l'éprouve pour eux. Lancement : `npm run test:e2e`.
 */

let stop: () => Promise<void> = async () => undefined;
beforeAll(async () => {
  stop = await startDemoServer();
});
afterEach(() => closeAll());
afterAll(async () => {
  await stop();
});

/** Un spectateur : sa socket et tout ce qu'il a vu. */
async function spectator() {
  const socket = await openSocket<PrismContract>(PRISM_SOCKET);
  const worlds: IPrismWorld[] = [];
  watchPrism(socket, (world) => worlds.push(world));
  return { socket, worlds };
}

/** Le drone qui porte cette étiquette dans la dernière trame vue, s'il y est. */
function droneOf(worlds: readonly IPrismWorld[], tag: number) {
  return worlds.at(-1)?.drones.find((drone) => drone.tag === tag);
}

demoDescribe("jeu — une salle, plusieurs joueurs", () => {
  it("chaque spectateur reçoit les tours, à pas fixe, avec tout l'équipage relu des octets", async () => {
    const { worlds } = await spectator();
    await waitFor("dix tours", () => worlds.length >= 10);
    const seqs = worlds.map((world) => world.frame.seq);
    // Des tours qui avancent, sans retour en arrière.
    expect(seqs).toEqual(seqs.toSorted((a, b) => a - b));
    expect(worlds.at(-1)?.drones).toHaveLength(PRISM_CREW);
    expect(worlds.at(-1)?.frame.pilots).toBe(0);
  });

  // #region game-two-players-e2e
  it("ce qu'un joueur commande, l'autre le voit : son drone dans la trame, qui avance", async () => {
    const pilot = await spectator();
    const watcher = await spectator();
    const tag = 4242;
    // La première commande assoit le joueur ; les suivantes le pilotent. Une
    // salle sans commande pendant 10 s le retire : on commande en continu.
    const steering = setInterval(() => {
      sendSteer(pilot.socket, { dx: 1, dz: 0, tag });
    }, 100);
    try {
      await waitFor(
        "le drone du joueur, vu par l'AUTRE",
        () => droneOf(watcher.worlds, tag) !== undefined,
      );
      const start = droneOf(watcher.worlds, tag)?.x ?? 0;
      await waitFor("le drone avance vers +x, vu par l'autre", () => {
        const now = droneOf(watcher.worlds, tag)?.x ?? start;
        return now > start + 0.5;
      });
      expect(watcher.worlds.at(-1)?.frame.pilots).toBe(1);
      // Un humain prend la place d'un robot : l'équipage reste complet.
      expect(watcher.worlds.at(-1)?.drones).toHaveLength(PRISM_CREW);
    } finally {
      clearInterval(steering);
    }
  });
  // #endregion

  it("un joueur qui part quitte la salle : sa connexion fermée, son drone disparaît", async () => {
    const pilot = await spectator();
    const watcher = await spectator();
    const tag = 777;
    sendSteer(pilot.socket, { dx: 0, dz: 1, tag });
    await waitFor(
      "le joueur assis",
      () => droneOf(watcher.worlds, tag) !== undefined,
    );

    pilot.socket.disconnect();
    // La fermeture suffit : sans elle, seul le délai d'inactivité (IDLE_MS)
    // retirerait le joueur. La borne est donc la MOITIÉ de ce délai.
    await waitFor(
      "le drone retiré, un robot à sa place",
      () => droneOf(watcher.worlds, tag) === undefined,
      IDLE_MS / 2,
    );
    expect(watcher.worlds.at(-1)?.frame.pilots).toBe(0);
    expect(watcher.worlds.at(-1)?.drones).toHaveLength(PRISM_CREW);
  });

  it("une commande hors bornes est refusée : le joueur n'est pas assis", async () => {
    const pilot = await spectator();
    const watcher = await spectator();
    const tag = 999;
    sendSteer(pilot.socket, { dx: 5, dz: 0, tag });
    // Assez de tours pour qu'une commande acceptée soit apparue.
    const seen = watcher.worlds.length;
    await waitFor(
      "quinze tours de plus",
      () => watcher.worlds.length >= seen + 15,
    );
    expect(droneOf(watcher.worlds, tag)).toBeUndefined();
  });
});
