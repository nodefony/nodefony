import type { IPresenceEntry } from "nodefony/client";
import { PEOPLE_MAX, type ChatPerson } from "./chatContract";
import {
  MEMBER_STATE_RANK,
  ROLE_RANK,
  memberRemovalProblem,
  memberStateOf,
  type IRoomMember,
  type MemberState,
  type RoomRole,
} from "./rooms";

/**
 * Le panneau des présents d'un salon — une règle PURE, sans React ni socket :
 * ce que la présence dit (des identités opaques et leur nombre d'onglets),
 * plus ce que l'annuaire du salon a nommé, donne des lignes triées.
 *
 * Guide pour un agent : la présence (ADR-0025) ne porte QUE ce que le serveur
 * sait — qui est là, combien d'onglets. « Vient d'arriver » et « vient de
 * partir » sont calculés ICI, par différence entre deux vues : le serveur ne
 * les envoie pas, et pendant la grâce d'un départ il ne publie rien. L'horloge
 * est passée en argument (`now`) : la règle s'éprouve sans attendre.
 */

/** « Vient d'arriver » reste affiché deux secondes. */
export const ARRIVAL_MARK_MS = 2000;

/** Une personne partie reste visible trois secondes, grisée. */
export const DEPARTURE_MARK_MS = 3000;

/** Où en est une ligne du panneau. */
export type RosterState = "here" | "arrived" | "left";

/** Une ligne du panneau des présents. */
export interface IRosterRow {
  readonly id: string;
  /** Le nom donné par l'annuaire ; `null` tant qu'il n'a pas répondu. */
  readonly name: string | null;
  /** Onglets ouverts sur ce salon, tous serveurs confondus. */
  readonly tabs: number;
  /** La ligne de la personne qui regarde. */
  readonly me: boolean;
  readonly state: RosterState;
}

/** Tri des noms à la française : accents ignorés, nombres dans l'ordre. */
const COLLATOR = new Intl.Collator("fr", {
  sensitivity: "base",
  numeric: true,
});

/** Un départ retenu à l'écran : son échéance, et ce qu'on montrait de lui. */
interface ILeft {
  until: number;
  tabs: number;
}

/**
 * Suit la présence d'UN salon : les vues successives, les noms appris, les
 * arrivées et départs récents. Une instance par salon ; aucune minuterie —
 * l'appelant demande {@link RosterTracker.nextChange} et rappelle `rows`.
 */
export class RosterTracker {
  /** Les présents de la dernière vue complète ; `null` avant la première. */
  #members: ReadonlyMap<string, IPresenceEntry> | null = null;
  #arrived: Map<string, number> | null = null;
  #left: Map<string, ILeft> | null = null;
  readonly #names = new Map<string, string>();
  /** Identités demandées à l'annuaire, réponse attendue. */
  readonly #asked = new Set<string>();

  /**
   * Reçoit une vue de la présence. Une vue partielle (bus perdu, socket
   * fermée, resynchronisation) remplace la liste mais ne marque personne :
   * la différence avec la vue d'avant n'y est pas une nouvelle.
   *
   * @param members - les présents nommés de la vue
   * @param partial - la vue est-elle incomplète ou figée ?
   * @param now - l'instant de réception, en ms
   */
  // #region roster-observe
  observe(
    members: ReadonlyMap<string, IPresenceEntry>,
    partial: boolean,
    now: number,
  ): void {
    const before = this.#members;
    this.#members = members;
    if (before === null || partial) return;
    for (const id of members.keys()) {
      if (before.has(id)) continue;
      (this.#arrived ??= new Map()).set(id, now + ARRIVAL_MARK_MS);
      this.#left?.delete(id);
    }
    for (const [id, entry] of before) {
      if (members.has(id)) continue;
      this.#arrived?.delete(id);
      (this.#left ??= new Map()).set(id, {
        until: now + DEPARTURE_MARK_MS,
        tabs: entry.tabs,
      });
    }
  }
  // #endregion

  /**
   * Les présents encore sans nom, ni demandés : au plus `PEOPLE_MAX`, marqués
   * « demandés » jusqu'à {@link learn} ou {@link forget}.
   */
  missingNames(): string[] {
    const missing: string[] = [];
    if (this.#members === null) return missing;
    for (const id of this.#members.keys()) {
      if (this.#names.has(id) || this.#asked.has(id)) continue;
      this.#asked.add(id);
      missing.push(id);
      if (missing.length === PEOPLE_MAX) break;
    }
    return missing;
  }

  /**
   * Retient les noms rendus par l'annuaire. Une identité demandée mais non
   * rendue (partie entre-temps, ou pas encore vue du serveur) redevient
   * demandable à la prochaine vue.
   *
   * @param asked - les identités de la demande
   * @param people - ce que l'annuaire a rendu
   */
  learn(asked: readonly string[], people: readonly ChatPerson[]): void {
    for (const person of people) this.#names.set(person.id, person.name);
    this.forget(asked);
  }

  /** Une demande a échoué : ses identités redeviennent demandables. */
  forget(asked: readonly string[]): void {
    for (const id of asked) this.#asked.delete(id);
  }

  /** Le nom connu d'une identité, ou `null`. */
  nameOf(id: string): string | null {
    return this.#names.get(id) ?? null;
  }

  /**
   * Les lignes du panneau : la personne qui regarde en tête, puis l'ordre
   * alphabétique (stable — personne ne saute quand quelqu'un arrive), les
   * noms encore inconnus en dernier. Les marques échues sont purgées ici.
   *
   * @param me - l'identité de qui regarde ; `null` pour un anonyme
   * @param now - l'instant du rendu, en ms
   */
  rows(me: string | null, now: number): IRosterRow[] {
    this.#purge(now);
    const rows: IRosterRow[] = [];
    if (this.#members !== null) {
      for (const [id, entry] of this.#members) {
        const arrived = (this.#arrived?.get(id) ?? 0) > now;
        rows.push(this.#row(id, entry.tabs, me, arrived ? "arrived" : "here"));
      }
    }
    if (this.#left !== null) {
      for (const [id, left] of this.#left) {
        rows.push(this.#row(id, left.tabs, me, "left"));
      }
    }
    // Tri EN PLACE : `rows` est neuf, une copie (`toSorted`) n'apporterait rien.
    rows.sort(compareRows);
    return rows;
  }

  /**
   * Dans combien de ms une marque échoit — le moment de rappeler `rows` ;
   * `null` s'il n'y a rien à attendre.
   */
  nextChange(now: number): number | null {
    let next = Number.POSITIVE_INFINITY;
    if (this.#arrived !== null)
      for (const until of this.#arrived.values()) next = Math.min(next, until);
    if (this.#left !== null)
      for (const left of this.#left.values()) next = Math.min(next, left.until);
    return next === Number.POSITIVE_INFINITY ? null : Math.max(0, next - now);
  }

  #row(
    id: string,
    tabs: number,
    me: string | null,
    state: RosterState,
  ): IRosterRow {
    return { id, name: this.nameOf(id), tabs, me: id === me, state };
  }

  /** Retire les marques échues ; rend `null` une table vidée. */
  #purge(now: number): void {
    if (this.#arrived !== null) {
      for (const [id, until] of this.#arrived)
        if (until <= now) this.#arrived.delete(id);
      if (this.#arrived.size === 0) this.#arrived = null;
    }
    if (this.#left !== null) {
      for (const [id, left] of this.#left)
        if (left.until <= now) this.#left.delete(id);
      if (this.#left.size === 0) this.#left = null;
    }
  }
}

/** Soi d'abord ; puis les noms connus dans l'ordre alphabétique ; puis l'id. */
function compareRows(a: IRosterRow, b: IRosterRow): number {
  if (a.me !== b.me) return a.me ? -1 : 1;
  if (a.name === null || b.name === null) {
    if (a.name !== b.name) return a.name === null ? 1 : -1;
  } else {
    const byName = COLLATOR.compare(a.name, b.name);
    if (byName !== 0) return byName;
  }
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/** Une ligne du panneau des membres d'un salon privé (D51). */
export interface IMemberRow {
  readonly id: string;
  readonly name: string;
  readonly role: RoomRole;
  readonly state: MemberState;
  /** La ligne de la personne qui regarde. */
  readonly me: boolean;
  /**
   * Qui regarde peut l'exclure (`memberRemovalProblem`) : la page CACHE ce
   * que le serveur refuserait, c'est lui qui décide.
   */
  readonly removable: boolean;
}

/**
 * Les lignes du panneau des membres : soi d'abord, puis dans le salon, en
 * ligne ailleurs, absents ; à état égal, le rôle, puis le nom.
 *
 * @param members - ce que la route des membres a rendu
 * @param inRoom - les présents nommés du salon ouvert, poussés en direct
 * @param me - l'identité de qui regarde ; `null` pour un anonyme
 * @param room - le salon, et s'il est à deux
 * @param myRole - le rôle de qui regarde dans ce salon
 */
export function memberRows(
  members: readonly IRoomMember[],
  inRoom: ReadonlyMap<string, unknown>,
  me: string | null,
  room: { id: string; direct: boolean },
  myRole: RoomRole | null,
): IMemberRow[] {
  const rows = members.map((member): IMemberRow => ({
    id: member.id,
    name: member.name,
    role: member.role,
    state: memberStateOf(member, inRoom),
    me: member.id === me,
    // La règle partagée suffit : elle refuse déjà soi-même (propriétaire,
    // ou modérateur sans propriétaire), et tout geste à qui ne modère pas.
    removable: memberRemovalProblem(room, myRole, member.role, false) === null,
  }));
  // Tri EN PLACE : `rows` est neuf.
  rows.sort(compareMemberRows);
  return rows;
}

/** Soi ; puis l'état ; puis le rôle ; puis le nom ; puis l'id. */
function compareMemberRows(a: IMemberRow, b: IMemberRow): number {
  if (a.me !== b.me) return a.me ? -1 : 1;
  const byState = MEMBER_STATE_RANK[a.state] - MEMBER_STATE_RANK[b.state];
  if (byState !== 0) return byState;
  const byRole = ROLE_RANK[a.role] - ROLE_RANK[b.role];
  if (byRole !== 0) return byRole;
  const byName = COLLATOR.compare(a.name, b.name);
  if (byName !== 0) return byName;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
