import { Module, Service, injectable } from "nodefony";
import { GameRoom, type IGamePilot, type IGameRules } from "../game/GameRoom";
import {
  droneRecord,
  DRONE_SPEED,
  PODIUM_SECONDS,
  PRISM_CREW,
  PRISM_HZ,
  PRISM_TEAMS,
  prismTiles,
  ROUND_SECONDS,
  SteerParams,
  tileAt,
  type IPrismFrame,
  type IPrismSteer,
} from "../../frontend/src/prism/prismDemo";

/**
 * Prisme — les RÈGLES du jeu, branchées sur la même salle que Météores
 * (`GameRoom`) : deux jeux, une seule brique pour les pilotes, les robots, la
 * boucle et la publication.
 *
 * Guide pour un agent : ce service ne porte que la grille, les drones et la
 * manche. Une case appartient à l'équipe du dernier drone qui l'a survolée —
 * décidé ici, à chaque tour, jamais par une page.
 */

/** Un drone : la place et l'étiquette viennent de la salle. */
export interface IPrismPilot extends IGamePilot {
  team: number;
  x: number;
  z: number;
  dx: number;
  dz: number;
  /** Case visée par un robot. */
  goal: number;
}

// #region prism-rules
/** La grille de Prisme et ses règles : ce que `GameRoom` appelle à chaque tour. */
export class PrismRules implements IGameRules<
  IPrismPilot,
  IPrismSteer,
  IPrismFrame
> {
  readonly hz = PRISM_HZ;
  readonly seats = PRISM_CREW;
  readonly crew = PRISM_CREW;

  /** Propriétaire de chaque case + 1 ; 0 : neutre. */
  readonly tiles = new Uint8Array(prismTiles.length);
  readonly scores = Array.from({ length: PRISM_TEAMS }, () => 0);
  phase: "play" | "podium" = "play";
  left = ROUND_SECONDS;
  round = 1;
  winner = -1;
  #humans = 0;

  parse(params: unknown): IPrismSteer | null {
    const result = SteerParams.safeParse(params);
    return result.success ? result.data : null;
  }

  createPilot(slot: number, robot: boolean): IPrismPilot {
    const team = slot % PRISM_TEAMS;
    const [x, z] = PrismRules.spawn(slot);
    return { slot, robot, tag: 0, team, x, z, dx: 0, dz: 0, goal: -1 };
  }

  apply(pilot: IPrismPilot, steer: IPrismSteer): void {
    pilot.dx = steer.dx;
    pilot.dz = steer.dz;
  }

  step(pilots: readonly IPrismPilot[], dt: number): void {
    this.#humans = pilots.filter((p) => !p.robot).length;
    this.left -= dt;
    if (this.phase === "podium") {
      if (this.left <= 0) this.#newRound(pilots);
      return;
    }
    for (const pilot of pilots) {
      if (pilot.robot) this.#steerRobot(pilot);
      this.#move(pilot, dt);
      this.#paint(pilot);
    }
    if (this.left <= 0) {
      this.phase = "podium";
      this.left = PODIUM_SECONDS;
      this.winner = this.scores.indexOf(Math.max(...this.scores));
    }
  }

  frame(
    pilots: readonly IPrismPilot[],
    seq: number,
    lagMs: number,
  ): IPrismFrame {
    return {
      seq,
      phase: this.phase,
      left: Math.max(0, Math.ceil(this.left)),
      round: this.round,
      scores: [...this.scores],
      winner: this.winner,
      pilots: this.#humans,
      lag: Math.round(lagMs * 10) / 10,
      drones: droneRecord.write(
        pilots.map((p) => ({
          id: p.slot,
          team: p.team,
          tag: p.tag,
          x: p.x,
          z: p.z,
        })),
      ),
      // Une COPIE : la grille continue de changer après l'envoi.
      tiles: this.tiles.slice(),
    };
  }
  // #endregion

  /** Où naît chaque place : les équipes partent de quatre coins. */
  static spawn(slot: number): [number, number] {
    const angle =
      ((slot % PRISM_TEAMS) / PRISM_TEAMS) * Math.PI * 2 + Math.PI / 4;
    const reach = slot < PRISM_TEAMS ? 9 : 6;
    return [Math.cos(angle) * reach, Math.sin(angle) * reach];
  }

  /** Un robot file vers une case qui n'est pas à son équipe. */
  #steerRobot(pilot: IPrismPilot): void {
    // `.at(-1)` rendrait la DERNIÈRE case : « pas de but » se teste avant.
    const goal = pilot.goal >= 0 ? prismTiles.at(pilot.goal) : undefined;
    const reached =
      goal === undefined ||
      Math.hypot(goal.x - pilot.x, goal.z - pilot.z) < 0.6;
    if (reached || this.tiles[pilot.goal] === pilot.team + 1) {
      pilot.goal = this.#pickGoal(pilot);
    }
    const next = prismTiles.at(pilot.goal);
    if (next === undefined) return;
    const dx = next.x - pilot.x;
    const dz = next.z - pilot.z;
    const len = Math.hypot(dx, dz) || 1;
    pilot.dx = dx / len;
    pilot.dz = dz / len;
  }

  #pickGoal(pilot: IPrismPilot): number {
    let pick = 0;
    for (let tries = 0; tries < 8; tries += 1) {
      pick = Math.floor(Math.random() * prismTiles.length);
      const tile = prismTiles.at(pick);
      if (tile === undefined) continue;
      const near = Math.hypot(tile.x - pilot.x, tile.z - pilot.z) < 9;
      if (near && this.tiles[pick] !== pilot.team + 1) return pick;
    }
    return pick;
  }

  #move(pilot: IPrismPilot, dt: number): void {
    const len = Math.hypot(pilot.dx, pilot.dz);
    const scale = len > 1 ? 1 / len : 1;
    const x = pilot.x + pilot.dx * scale * DRONE_SPEED * dt;
    const z = pilot.z + pilot.dz * scale * DRONE_SPEED * dt;
    // Hors de la grille, le drone reste au bord.
    if (tileAt(x, z) !== -1) {
      pilot.x = x;
      pilot.z = z;
    }
  }

  #paint(pilot: IPrismPilot): void {
    const index = tileAt(pilot.x, pilot.z);
    if (index === -1) return;
    const owner = this.tiles[index] ?? 0;
    if (owner === pilot.team + 1) return;
    if (owner > 0) this.scores[owner - 1] = (this.scores[owner - 1] ?? 1) - 1;
    this.scores[pilot.team] = (this.scores[pilot.team] ?? 0) + 1;
    this.tiles[index] = pilot.team + 1;
  }

  #newRound(pilots: readonly IPrismPilot[]): void {
    this.tiles.fill(0);
    this.scores.fill(0);
    this.phase = "play";
    this.left = ROUND_SECONDS;
    this.round += 1;
    this.winner = -1;
    for (const pilot of pilots) {
      [pilot.x, pilot.z] = PrismRules.spawn(pilot.slot);
      pilot.goal = -1;
    }
  }
}

/** La salle de Prisme, une par processus, injectée dans `PrismController`. */
@injectable()
class PrismService extends Service {
  readonly rules = new PrismRules();
  readonly room = new GameRoom(this.rules);

  /**
   * @param module - le module qui le déclare ; absent dans un test, qui le
   *   construit sans kernel
   */
  constructor(module?: Module) {
    super("prism", module?.container ?? undefined, module?.notificationsCenter);
  }
}

export default PrismService;
