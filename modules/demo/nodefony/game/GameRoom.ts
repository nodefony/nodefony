import type { IRealtimeConnection } from "@nodefony/realtime";
import { startFixedStep, type IFixedStep } from "../kit/fixedStep";

/**
 * Une salle de jeu : la brique serveur que TOUT jeu de la démo réutilise. Elle
 * porte ce qui ne dépend d'aucun jeu — qui joue, à quelle place, les robots qui
 * complètent, la boucle qui tourne tant que quelqu'un regarde, la trame publiée
 * à chaque tour — et délègue le reste aux RÈGLES du jeu (`IGameRules`).
 *
 * Guide pour un agent :
 *  • l'identité d'un pilote est la CONNEXION qui l'a créé (`IRealtimeConnection`,
 *    objet stable, troisième argument d'un `@RealtimeInbound`). Le navigateur
 *    n'envoie jamais « je suis le pilote 3 » ; son étiquette (`tag`) lui sert
 *    seulement à se reconnaître dans la trame ;
 *  • un pilote quitte la salle quand sa connexion se ferme (`open === false`)
 *    ou après `IDLE_MS` sans commande : aucun écouteur de fermeture à poser ;
 *  • UNE salle par processus, tenue par un service `@injectable` : les
 *    contrôleurs, instanciés par connexion, ne la portent pas ;
 *  • nouveau jeu = de nouvelles `IGameRules` ; cette classe ne change pas.
 */

/** Un pilote sans commande depuis ce délai quitte la salle (onglet fermé, réseau perdu). */
export const IDLE_MS = 10_000;

/** Ce que la salle sait de chaque pilote ; le jeu y ajoute ses champs. */
export interface IGamePilot {
  /** Place dans la salle, de 0 à `crew - 1` : stable tant que le pilote reste. */
  slot: number;
  robot: boolean;
  /** L'étiquette choisie par le navigateur pour se reconnaître ; 0 pour un robot. */
  tag: number;
}

/** Une commande de joueur : le jeu y met ce qu'il veut, plus l'étiquette. */
export interface IGameCommand {
  tag: number;
}

/** Les règles d'un jeu : tout ce que `GameRoom` ne sait pas. */
export interface IGameRules<P extends IGamePilot, C extends IGameCommand, F> {
  /** Tours par seconde. */
  readonly hz: number;
  /** Pilotes humains au plus. */
  readonly seats: number;
  /** Pilotes en tout : les robots complètent jusque-là. */
  readonly crew: number;
  /** Une commande venue du réseau, VALIDÉE ; `null` si elle ne l'est pas. */
  parse(params: unknown): C | null;
  /** Un pilote neuf, humain ou robot, à cette place. */
  createPilot(slot: number, robot: boolean): P;
  /** Applique la commande d'un humain à son pilote. */
  apply(pilot: P, command: C): void;
  /** Un pas de simulation : robots compris, c'est le jeu qui les fait jouer. */
  step(pilots: readonly P[], dt: number): void;
  /** La trame du tour. `lagMs` : retard mesuré de la boucle. */
  frame(pilots: readonly P[], seq: number, lagMs: number): F;
}

interface IHuman<P> {
  pilot: P;
  connection: IRealtimeConnection;
  lastSeen: number;
}

// #region game-room
/** Une salle : des pilotes, des robots, une boucle, une trame par tour. */
export class GameRoom<P extends IGamePilot, C extends IGameCommand, F> {
  readonly #rules: IGameRules<P, C, F>;
  readonly #humans = new Map<IRealtimeConnection, IHuman<P>>();
  readonly #robots: P[] = [];
  #loop: IFixedStep | null = null;
  #seq = 0;

  constructor(rules: IGameRules<P, C, F>) {
    this.#rules = rules;
  }

  /**
   * Une commande d'un joueur. Sa première commande l'assoit (s'il reste une
   * place) ; les suivantes le pilotent. Rend `false` si elle est refusée :
   * invalide, ou salle pleine.
   */
  command(connection: IRealtimeConnection, params: unknown): boolean {
    const command = this.#rules.parse(params);
    if (command === null) return false;
    let human = this.#humans.get(connection);
    if (human === undefined) {
      if (this.#humans.size >= this.#rules.seats) return false;
      // Un humain prend la place d'un robot quand la salle est complète.
      if (this.#humans.size + this.#robots.length >= this.#rules.crew) {
        this.#robots.pop();
      }
      human = {
        pilot: this.#rules.createPilot(this.#freeSlot(), false),
        connection,
        lastSeen: 0,
      };
      this.#humans.set(connection, human);
    }
    human.lastSeen = Date.now();
    human.pilot.tag = command.tag;
    this.#rules.apply(human.pilot, command);
    return true;
  }

  /** Les pilotes de la salle, humains d'abord. */
  pilots(): P[] {
    const list: P[] = [];
    for (const human of this.#humans.values()) list.push(human.pilot);
    return list.concat(this.#robots);
  }

  /** Pilotes humains assis. */
  get humans(): number {
    return this.#humans.size;
  }

  /**
   * Démarre la salle : un tour tous les `1 / hz`, et sa trame publiée.
   * Appelée par la fabrique d'un `@RealtimeChannel`, au premier abonné ; la
   * fonction rendue l'arrête, au départ du dernier.
   */
  start(publish: (frame: F) => void): () => void {
    this.#loop?.stop();
    const loop = startFixedStep(this.#rules.hz, (dt) => {
      publish(this.tick(dt, loop.lagMs));
    });
    this.#loop = loop;
    return () => {
      loop.stop();
      if (this.#loop === loop) this.#loop = null;
    };
  }

  /** Un tour : les absents sortent, les robots complètent, le jeu avance. Public pour les tests. */
  tick(dt: number, lagMs = 0): F {
    const now = Date.now();
    for (const [connection, human] of this.#humans) {
      if (!connection.open || now - human.lastSeen > IDLE_MS) {
        this.#humans.delete(connection);
      }
    }
    while (this.#humans.size + this.#robots.length < this.#rules.crew) {
      this.#robots.push(this.#rules.createPilot(this.#freeSlot(), true));
    }
    const pilots = this.pilots();
    this.#rules.step(pilots, dt);
    this.#seq += 1;
    return this.#rules.frame(pilots, this.#seq, lagMs);
  }

  /** La plus petite place libre. */
  #freeSlot(): number {
    const taken = new Set<number>();
    for (const human of this.#humans.values()) taken.add(human.pilot.slot);
    for (const robot of this.#robots) taken.add(robot.slot);
    let slot = 0;
    while (taken.has(slot)) slot += 1;
    return slot;
  }
}
// #endregion
