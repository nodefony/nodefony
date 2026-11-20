import { Service, Module, injectable, runWorksOnSchema } from "nodefony";
import type { IOrm, IRepository } from "@nodefony/orm-core";
import { ormRegistry } from "@nodefony/orm-core";
import { getRealtimeHub } from "@nodefony/realtime";
import { UserService } from "@nodefony/user";
import { DEMO_CONNECTOR } from "../config/config";
import {
  EVENT_ATTENDEE_ENTITY,
  EVENT_ENTITY,
  MESSAGE_ENTITY,
  REACTION_ENTITY,
  ROOM_ENTITY,
  ROOM_MEMBER_ENTITY,
  ROOM_READ_ENTITY,
  type EventAttendeeRow,
  type EventRow,
  MESSAGE_RELATIONS,
  type MessageRow,
  type MessageWithRelations,
  type ReactionRow,
  type RoomMemberRow,
  type RoomReadRow,
  type RoomRow,
} from "../entity/rooms";
import type {
  ChatAttachment,
  ChatMessage,
  ChatPerson,
  ChatReaction,
  RoomFrame,
  RoomsNotice,
} from "../../frontend/src/chat/chatContract";
import {
  REACTIONS_PER_MESSAGE_MAX,
  editProblem,
  replyRefOf,
  retractRight,
  summarizeReactions,
} from "../../frontend/src/chat/messages";
import type { IForgotten, IMessageArchive, IMessageDraft } from "./ChatService";
import {
  DIRECT_PREFIX,
  LOBBY_ROOM_ID,
  ROOM_NAME_MAX,
  ROOMS_OWNED_MAX,
  canAppoint,
  canManage,
  directKey,
  directPeer,
  memberRemovalProblem,
  roomDeletionProblem,
  admissionOf,
  headlineEvent,
  ONLINE_CHANNEL,
  roomChannel,
  type IAdmissionFacts,
  type IRoomEvent,
  type IRoomMember,
  type IRoomView,
  type RoomAccess,
  type RoomRole,
} from "../../frontend/src/chat/rooms";

/** Au plus cent salons publics listés. */
const PUBLIC_ROOMS_MAX = 100;

/** Le plus long délai qu'un minuteur Node accepte (2³¹ − 1 ms, ≈ 24,8 jours). */
const TIMER_DELAY_MAX = 2_147_483_647;

/** « Ta liste de salons a changé » : un seul objet, poussé tel quel. */
const ROOMS_CHANGED: RoomsNotice = Object.freeze({ type: "rooms:changed" });

/**
 * Prévient une personne que sa liste de salons a changé : son canal
 * personnel (`user:<id>`) la joint sur tous les serveurs, la page relit.
 */
function pushRoomsChanged(userId: string): void {
  getRealtimeHub().publishToUser(userId, ROOMS_CHANGED);
}

/**
 * Pourquoi un geste sur les salons est refusé. Le service dit la RAISON, le
 * contrôleur en fait un statut HTTP (`ChatController`, `#refused`) : la même
 * règle sert une route, la socket, ou un test sans serveur.
 */
export type RoomRefusalReason =
  "not-found" | "forbidden" | "conflict" | "invalid";

/** Un geste refusé, avec un message lisible par la personne. */
export class RoomRefusal extends Error {
  override readonly name = "RoomRefusal";

  /**
   * @param reason - la raison, que le contrôleur traduit en statut
   * @param message - ce que la page affiche sous le champ fautif
   */
  constructor(
    readonly reason: RoomRefusalReason,
    message: string,
  ) {
    super(message);
  }
}

/** Ce que demande la création d'un salon — déjà validé par `CreateRoomBody`. */
export interface IRoomDraft {
  name: string;
  access: RoomAccess;
  description?: string | undefined;
}

/** Ce que demande un événement — déjà validé par `EventBody`. */
export interface IEventDraft {
  title: string;
  start: number;
  end: number;
  timeZone: string;
  attendees: readonly string[];
}

/** Un compte tel que les salons le connaissent : son identité et son nom. */
export interface IAccount {
  id: string;
  identifier: string;
}

/** Un événement tel que la liste le montre — jamais l'organisateur ni la description. */
function toRoomEvent(
  event: EventRow,
  partstat: IRoomEvent["partstat"],
): IRoomEvent {
  return {
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    status: event.status,
    partstat,
  };
}

/** Un salon tel qu'une personne le voit. */
function toRoomView(
  room: RoomRow,
  role: RoomRole | null,
  event: IRoomEvent | null,
  peer: string | null,
  unread: number,
): IRoomView {
  return {
    id: room.id,
    name: room.name,
    kind: room.kind,
    access: room.access,
    locked: room.locked,
    description: room.description ?? null,
    role,
    event,
    peer,
    unread,
  };
}

/** Le salon privé et l'événement semés en développement. */
const TEAM_ROOM_ID = "equipe";
const TEAM_EVENT_ID = "point-equipe";

/** Les sept dépôts des salons. */
interface IRoomRepositories {
  orm: IOrm;
  rooms: IRepository<RoomRow>;
  members: IRepository<RoomMemberRow>;
  events: IRepository<EventRow>;
  attendees: IRepository<EventAttendeeRow>;
  messages: IRepository<MessageWithRelations>;
  reactions: IRepository<ReactionRow>;
  reads: IRepository<RoomReadRow>;
}

/** Un message tel que le salon le montre : ni l'identité du compte, ni le salon. */
function toMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    author: row.author,
    text: row.text,
    sentAt: row.sentAt,
    ...(row.attachments ? { attachments: row.attachments } : {}),
    ...(row.editedAt === null ? {} : { editedAt: row.editedAt }),
    ...(row.retracted === null ? {} : { retracted: row.retracted }),
  };
}

/**
 * Un message lu avec ses relations, tel que le salon le montre : la citation
 * du message auquel il répond — seulement s'il est du MÊME salon — et ses
 * réactions dans l'ordre d'arrivée.
 */
function toView(row: MessageWithRelations): ChatMessage {
  const message = toMessage(row);
  const target =
    row.replyTarget != null && row.replyTarget.roomId === row.roomId
      ? toMessage(row.replyTarget)
      : null;
  const reactions = (row.reactions ?? []).toSorted(
    (a, b) => a.reactedAt - b.reactedAt,
  );
  return {
    ...message,
    ...(row.replyTo === null
      ? {}
      : { replyTo: replyRefOf(row.replyTo, target) }),
    ...(reactions.length === 0
      ? {}
      : { reactions: summarizeReactions(reactions) }),
  };
}

/**
 * Les salons du chat : qui y entre, qui y est, ce qu'on y voit — lus dans la
 * base SQLite de la démo (connecteur `demo`).
 *
 * Guide pour un agent : la RÈGLE d'admission est pure et partagée avec la
 * page (`frontend/src/chat/rooms.ts`, `admissionOf`) ; ce service ne fait
 * que LIRE les faits qu'elle demande. Les comptes vivent dans la base de
 * l'application : un salon ne garde que leur identifiant stable. Le lien se
 * fait donc par l'application — une lecture `$in` pour nommer
 * (`UserService.find`), et l'événement `onUserRevoked` pour retirer d'un
 * salon un compte supprimé. Tout changement d'appartenance est POUSSÉ :
 * `publishToUser` prévient la personne (sa liste de salons change), et
 * `evictUser` désabonne sur tous les serveurs qui la retire — une admission
 * acceptée est retenue sur la connexion, rien ne la périme seule.
 * Doc : `@nodefony/realtime/docs/canaux-a-membres.md`.
 */
@injectable()
class RoomService extends Service implements IMessageArchive {
  #repositories: IRoomRepositories | null = null;
  /** Le minuteur de la PROCHAINE fin d'événement ; `null` quand rien n'est attendu. */
  #closing: ReturnType<typeof setTimeout> | null = null;
  /** L'instant que vise `#closing`. */
  #closingAt = Number.POSITIVE_INFINITY;
  /** Les fins d'événement antérieures à cet instant sont déjà traitées. */
  #closedUntil = Date.now();

  /**
   * @param module - le module qui le déclare ; absent dans un test, qui le
   *   construit sans kernel
   */
  constructor(module?: Module) {
    super("rooms", module?.container ?? undefined, module?.notificationsCenter);
  }

  /**
   * La base de la démo est-elle utilisable ? Non sous une commande console
   * (fermée), ni sous une commande qui TRAVAILLE le schéma (`orm:reset`,
   * `orm:migrate`…) : la connexion y est ouverte, mais son schéma n'est pas
   * dérivé — la première requête tomberait sur `no such table`.
   */
  isOpen(): boolean {
    return (
      !runWorksOnSchema(this.kernel) &&
      ormRegistry.has(DEMO_CONNECTOR) &&
      ormRegistry.get(DEMO_CONNECTOR).isConnected()
    );
  }

  /**
   * Les dépôts, résolus au premier usage : l'ORM se connecte au démarrage
   * (`onBoot`), après la construction des services.
   *
   * @throws Error si le connecteur `demo` n'est pas ouvert
   */
  #repos(): IRoomRepositories {
    if (this.#repositories !== null) return this.#repositories;
    if (!ormRegistry.has(DEMO_CONNECTOR))
      throw new Error(
        `salons du chat : le connecteur « ${DEMO_CONNECTOR} » n'est pas ouvert (module @nodefony/drizzle chargé ?)`,
      );
    const orm = ormRegistry.get(DEMO_CONNECTOR);
    this.#repositories = {
      orm,
      rooms: orm.getRepository<RoomRow>(ROOM_ENTITY),
      members: orm.getRepository<RoomMemberRow>(ROOM_MEMBER_ENTITY),
      events: orm.getRepository<EventRow>(EVENT_ENTITY),
      attendees: orm.getRepository<EventAttendeeRow>(EVENT_ATTENDEE_ENTITY),
      messages: orm.getRepository<MessageWithRelations>(MESSAGE_ENTITY),
      reactions: orm.getRepository<ReactionRow>(REACTION_ENTITY),
      reads: orm.getRepository<RoomReadRow>(ROOM_READ_ENTITY),
    };
    return this.#repositories;
  }

  // #region messages-archive
  /**
   * Archive un message : la base tire son `id` (XEP-0359), l'instant est
   * celui du SERVEUR — jamais une horloge du client.
   */
  async archive(roomId: string, draft: IMessageDraft): Promise<ChatMessage> {
    const { messages } = this.#repos();
    // Une réponse vise un message du MÊME salon : sinon citer un `id`
    // suffirait à lire l'extrait d'un salon privé.
    const target =
      draft.replyTo === undefined
        ? null
        : await this.#message(roomId, draft.replyTo);
    const row = await messages.create({
      roomId,
      authorId: draft.authorId,
      author: draft.author,
      text: draft.text,
      sentAt: Date.now(),
      attachments: draft.attachments ?? null,
      replyTo: target?.id ?? null,
    });
    // Admis juste avant une suppression du salon : la ligne écrite après la
    // seconde passe de `deleteRoom` serait orpheline. On la reprend.
    if (!(await this.#repos().rooms.exists({ id: roomId }))) {
      await messages.deleteOne({ id: row.id });
      throw new RoomRefusal("not-found", "salon introuvable");
    }
    const message = toMessage(row);
    return target === null
      ? message
      : { ...message, replyTo: replyRefOf(target.id, toMessage(target)) };
  }

  /**
   * Les derniers messages d'un salon, dans l'ordre d'envoi : lus du plus
   * récent au plus ancien (l'index `message_room_sent_idx` sert les deux
   * critères), puis retournés.
   */
  async history(roomId: string, limit: number): Promise<ChatMessage[]> {
    const rows = await this.#repos().messages.find(
      { roomId },
      { limit, order: [["sentAt", "DESC"]], relations: MESSAGE_RELATIONS },
    );
    return rows.reverse().map(toView);
  }

  /**
   * Un message de CE salon, encore là — la garde de chaque geste sur un
   * message : un `id` d'un autre salon est introuvable ici, jamais lu.
   *
   * @throws RoomRefusal `not-found` s'il n'est pas de ce salon, ou s'il est retiré
   */
  async #message(roomId: string, messageId: string): Promise<MessageRow> {
    const row = await this.#repos().messages.findOne({ id: messageId, roomId });
    if (row === null)
      throw new RoomRefusal("not-found", "message introuvable dans ce salon");
    if (row.retracted !== null)
      throw new RoomRefusal("not-found", "ce message a été retiré");
    return row;
  }
  // #endregion

  // #region messages-gestures
  /**
   * Remplace le texte d'un message (XEP-0308, Matrix `m.replace`) : son
   * auteur seul, sur n'importe lequel de ses messages. Aucune version
   * gardée : ce qu'on corrige ne doit pas rester lisible.
   *
   * @throws RoomRefusal `forbidden` pour un autre que l'auteur, `invalid` pour un texte refusé
   */
  async edit(
    roomId: string,
    messageId: string,
    authorId: string,
    text: string,
  ): Promise<ChatMessage> {
    const row = await this.#message(roomId, messageId);
    if (row.authorId !== authorId)
      throw new RoomRefusal("forbidden", "seul son auteur modifie un message");
    const problem = editProblem(text, (row.attachments?.length ?? 0) > 0);
    if (problem !== null) throw new RoomRefusal("invalid", problem);
    const updated = await this.#repos().messages.updateOne(
      { id: row.id },
      { text, editedAt: Date.now() },
    );
    return this.#one(updated ?? row);
  }

  /**
   * Retire un message (XEP-0424 ; XEP-0425 pour la modération) : son auteur,
   * ou le propriétaire ou un modérateur du salon. Texte, pièces, réactions
   * et citation sont EFFACÉS ; la ligne reste, pour que les réponses disent « retiré ».
   *
   * @returns le message retiré, et les pièces à effacer du disque
   * @throws RoomRefusal `forbidden` pour qui n'en a pas le droit
   */
  async retract(
    roomId: string,
    messageId: string,
    userId: string,
  ): Promise<{ message: ChatMessage; attachments: ChatAttachment[] }> {
    const { members, messages, reactions } = this.#repos();
    const row = await this.#message(roomId, messageId);
    const member = await members.findOne({ roomId, userId });
    const right = retractRight(row.authorId === userId, member?.role ?? null);
    if (right === null)
      throw new RoomRefusal(
        "forbidden",
        "seuls son auteur et la modération du salon retirent un message",
      );
    await reactions.delete({ messageId: row.id });
    const updated = await messages.updateOne(
      { id: row.id },
      {
        text: "",
        attachments: null,
        editedAt: null,
        replyTo: null,
        retracted: right,
      },
    );
    return {
      message: await this.#one(updated ?? row),
      attachments: row.attachments ?? [],
    };
  }

  /**
   * Remplace l'ensemble des réactions d'une personne sur un message
   * (XEP-0444 : on envoie son ensemble entier) — sous son nom du moment.
   *
   * @returns toutes les réactions du message, dans l'ordre d'arrivée
   * @throws RoomRefusal `invalid` au-delà de `REACTIONS_PER_MESSAGE_MAX` emojis différents
   */
  async react(
    roomId: string,
    messageId: string,
    who: { id: string; name: string },
    emojis: readonly string[],
  ): Promise<ChatReaction[]> {
    const { reactions } = this.#repos();
    const row = await this.#message(roomId, messageId);
    const existing = await reactions.find(
      { messageId: row.id },
      { order: [["reactedAt", "ASC"]] },
    );
    const wanted = new Set(emojis);
    const others = existing.filter((item) => item.userId !== who.id);
    const distinct = new Set(others.map((item) => item.emoji));
    for (const emoji of wanted) distinct.add(emoji);
    if (distinct.size > REACTIONS_PER_MESSAGE_MAX)
      throw new RoomRefusal(
        "invalid",
        `au plus ${REACTIONS_PER_MESSAGE_MAX} emojis différents par message`,
      );
    const mine = existing.filter((item) => item.userId === who.id);
    const dropped = mine.filter((item) => !wanted.has(item.emoji));
    if (dropped.length > 0)
      await reactions.delete({ id: { $in: dropped.map((item) => item.id) } });
    const kept = new Set(mine.map((item) => item.emoji));
    const now = Date.now();
    // Un `upsert` par emoji neuf, sur l'index unique : deux requêtes
    // simultanées de la même personne ne butent jamais sur la contrainte.
    const added: ReactionRow[] = [];
    for (const emoji of emojis)
      if (!kept.has(emoji))
        added.push(
          await reactions.upsert(
            { messageId: row.id, userId: who.id, emoji },
            { name: who.name },
            { reactedAt: now },
          ),
        );
    const gone = new Set(dropped.map((item) => item.id));
    return summarizeReactions([
      ...existing.filter((item) => !gone.has(item.id)),
      ...added,
    ]);
  }

  /** Un message relu avec ses relations, tel que le salon le montre. */
  async #one(row: MessageRow): Promise<ChatMessage> {
    const fresh = await this.#repos().messages.findOne(
      { id: row.id },
      { relations: MESSAGE_RELATIONS },
    );
    return toView(fresh ?? row);
  }
  // #endregion

  // #region rooms-admission
  /**
   * Ce que la base dit d'un salon et d'une personne — les faits que la règle
   * pure `admissionOf` tranche. Lu à chaque `subscribe` (et à chaque
   * reconnexion) et à chaque écriture : jamais de cache, une admission doit
   * voir la base du moment. Mais rien de plus que ce que la règle consulte :
   * un salon public non verrouillé admet tout le monde, donc ni l'appartenance
   * ni les invitations ne sont lues — une requête au lieu de deux à quatre, à
   * chaque envoi et à chaque « j'écris ».
   *
   * @param roomId - le salon demandé
   * @param userId - l'identité stable du compte ; `null` pour un anonyme
   */
  async admissionFacts(
    roomId: string,
    userId: string | null,
  ): Promise<IAdmissionFacts> {
    const { rooms, members, events, attendees } = this.#repos();
    const room = await rooms.findOne({ id: roomId });
    if (room === null) return { room: null, member: false, invitations: [] };
    const facts = { access: room.access, locked: room.locked };
    if (userId === null || (room.access === "public" && !room.locked))
      return { room: facts, member: false, invitations: [] };
    if (await members.exists({ roomId, userId }))
      return { room: facts, member: true, invitations: [] };
    const invited = await attendees.find({ userId });
    if (invited.length === 0)
      return { room: facts, member: false, invitations: [] };
    const byEvent = new Map(invited.map((row) => [row.eventId, row.partstat]));
    const roomEvents = await events.find({
      roomId,
      id: { $in: [...byEvent.keys()] },
    });
    return {
      room: facts,
      member: false,
      invitations: roomEvents.map((event) => ({
        start: event.start,
        end: event.end,
        status: event.status,
        partstat: byEvent.get(event.id) ?? "needs-action",
      })),
    };
  }
  // #endregion

  /**
   * Les salons qu'une personne voit : les publics, ceux dont elle est membre,
   * ceux d'un événement auquel elle est invitée — chacun avec son rôle et
   * l'événement à montrer.
   *
   * @param userId - l'identité stable du compte ; `null` pour un anonyme
   * @param now - l'instant, en ms
   */
  async roomsFor(userId: string | null, now: number): Promise<IRoomView[]> {
    const { rooms, members, events, attendees } = this.#repos();
    const listed = new Map<string, RoomRow>();
    for (const room of await rooms.find(
      { access: "public" },
      { limit: PUBLIC_ROOMS_MAX, order: [["createdAt", "ASC"]] },
    ))
      listed.set(room.id, room);
    const roles = new Map<string, RoomRole>();
    /** Depuis quand je suis membre : le départ de mes non-lus sans marqueur. */
    const joined = new Map<string, number>();
    /** Ma réponse à chaque événement où l'on m'invite. */
    const answers = new Map<string, IRoomEvent["partstat"]>();
    if (userId !== null) {
      for (const member of await members.find({ userId })) {
        roles.set(member.roomId, member.role);
        joined.set(member.roomId, member.joinedAt);
      }
      const wanted = new Set(roles.keys());
      // Une invitation DÉCLINÉE n'ouvre plus rien : son salon quitte la liste.
      const invited = (await attendees.find({ userId })).filter(
        (row) => row.partstat !== "declined",
      );
      for (const row of invited) answers.set(row.eventId, row.partstat);
      if (invited.length > 0)
        for (const event of await events.find({
          id: { $in: [...answers.keys()] },
        }))
          wanted.add(event.roomId);
      const missing = [...wanted].filter((id) => !listed.has(id));
      if (missing.length > 0)
        for (const room of await rooms.find({ id: { $in: missing } }))
          listed.set(room.id, room);
    }
    if (listed.size === 0) return [];
    const upcoming = await events.find({
      roomId: { $in: [...listed.keys()] },
      end: { $gte: now },
    });
    const peers = await this.#directPeers([...listed.values()], userId);
    const unread =
      userId === null
        ? null
        : await this.#unread(userId, [...listed.keys()], joined);
    return [...listed.values()].map((room) => {
      const event = headlineEvent(
        upcoming.filter((row) => row.roomId === room.id),
        now,
      );
      return toRoomView(
        room,
        roles.get(room.id) ?? null,
        event === null
          ? null
          : toRoomEvent(event, answers.get(event.id) ?? null),
        peers.get(room.id) ?? null,
        unread?.get(room.id) ?? 0,
      );
    });
  }

  // #region rooms-unread-server
  /**
   * Les non-lus d'une personne, salon par salon (D52) : les messages des
   * AUTRES, encore là, envoyés après son marqueur de lecture — ou, sans
   * marqueur, après son entrée comme membre. Un salon public jamais ouvert
   * n'a pas de départ : il ne compte rien. Un `COUNT` par salon qui a un
   * départ, servi par l'index `message_room_sent_idx`.
   *
   * @param joined - salon → instant d'entrée, pour les salons dont elle est membre
   * @returns salon → non-lus, pour les seuls salons qui en ont
   */
  async #unread(
    userId: string,
    roomIds: string[],
    joined: ReadonlyMap<string, number>,
  ): Promise<Map<string, number>> {
    const { reads, messages } = this.#repos();
    const since = new Map(joined);
    for (const row of await reads.find({ userId, roomId: { $in: roomIds } }))
      since.set(row.roomId, row.readUpTo);
    const counts = new Map<string, number>();
    await Promise.all(
      [...since].map(async ([roomId, from]) => {
        const count = await messages.count({
          roomId,
          sentAt: { $gt: from },
          authorId: { $ne: userId },
          retracted: null,
        });
        if (count > 0) counts.set(roomId, count);
      }),
    );
    return counts;
  }

  /**
   * « J'ai lu jusqu'à ce message » (D52, le marqueur `displayed` de
   * XEP-0333) : le marqueur avance jusqu'à son instant d'envoi, jamais en
   * arrière — `$max` dans l'`upsert`, une seule instruction, qu'un onglet
   * en retard ne fait pas reculer. Un message retiré se lit aussi : sa ligne
   * reste à sa place dans l'historique.
   *
   * @throws RoomRefusal `not-found` si le message n'est pas de ce salon
   */
  async markRead(
    roomId: string,
    userId: string,
    messageId: string,
  ): Promise<void> {
    const { messages, reads } = this.#repos();
    const row = await messages.findOne({ id: messageId, roomId });
    if (row === null)
      throw new RoomRefusal("not-found", "message introuvable dans ce salon");
    await reads.upsert({ roomId, userId }, { readUpTo: { $max: row.sentAt } });
  }
  // #endregion

  /**
   * Le nom de L'AUTRE personne de chaque salon à deux de la liste — une seule
   * lecture `$in` des comptes, quel que soit le nombre de salons.
   */
  async #directPeers(
    listed: readonly RoomRow[],
    userId: string | null,
  ): Promise<Map<string, string>> {
    const names = new Map<string, string>();
    if (userId === null) return names;
    const peerOf = new Map<string, string>();
    for (const room of listed) {
      const peer = directPeer(room.name, userId);
      if (peer !== null) peerOf.set(room.id, peer);
    }
    if (peerOf.size === 0) return names;
    const accounts = await this.#accounts({ ids: [...peerOf.values()] });
    for (const [roomId, peer] of peerOf)
      names.set(
        roomId,
        accounts.find((a) => a.id === peer)?.identifier ?? "compte supprimé",
      );
    return names;
  }

  /**
   * Des comptes de l'application, par identité stable ou par identifiant de
   * connexion. Les comptes vivent dans la base de l'APPLICATION : la démo les
   * lit par `UserService`, quel que soit l'ORM (Drizzle ou Mongoose).
   */
  async #accounts(
    wanted: { ids: readonly string[] } | { identifiers: readonly string[] },
  ): Promise<IAccount[]> {
    const users = this.get<unknown>("users");
    if (!(users instanceof UserService)) return [];
    const found =
      "ids" in wanted
        ? await users.find({ id: { $in: [...wanted.ids] } })
        : await users.find({ identifier: { $in: [...wanted.identifiers] } });
    return found.map((user) => ({ id: user.id, identifier: user.identifier }));
  }

  /** Un salon par son identifiant, ou le refus qui le dit. */
  async #room(roomId: string): Promise<RoomRow> {
    const room = await this.#repos().rooms.findOne({ id: roomId });
    if (room === null) throw new RoomRefusal("not-found", "salon introuvable");
    return room;
  }

  /** Mon rôle dans un salon ; `null` si je n'en suis pas membre. */
  async #roleOf(roomId: string, userId: string): Promise<RoomRole | null> {
    const member = await this.#repos().members.findOne({ roomId, userId });
    return member?.role ?? null;
  }

  /**
   * La garde des formulaires d'un salon : il existe, ce n'est pas un salon à
   * deux, et je peux le gérer — relu EN BASE à chaque geste ; la page, qui
   * cache les boutons, ne décide jamais.
   */
  async #managed(roomId: string, userId: string): Promise<RoomRole> {
    const room = await this.#room(roomId);
    if (room.name.startsWith(DIRECT_PREFIX))
      throw new RoomRefusal(
        "forbidden",
        "un salon à deux ne s'ouvre pas à une troisième personne",
      );
    const role = await this.#roleOf(roomId, userId);
    if (role === null || !canManage(role))
      throw new RoomRefusal(
        "forbidden",
        "réservé au propriétaire du salon et à ses modérateurs",
      );
    return role;
  }

  // #region rooms-create
  /**
   * Crée un salon : la personne qui le crée en devient propriétaire. Deux
   * bornes, vérifiées en base : le nombre de salons qu'elle possède, et le
   * nom, unique. Deux créations simultanées du même nom passent toutes deux
   * la vérification : c'est la contrainte `UNIQUE` de la colonne qui tranche,
   * et son échec se relit en refus.
   *
   * @param ownerId - l'identité de la session, jamais un champ du client
   * @param draft - le salon demandé, déjà validé et normalisé
   * @throws RoomRefusal `conflict` — nom pris, ou quota atteint
   */
  async createRoom(
    ownerId: string,
    draft: IRoomDraft,
    now: number = Date.now(),
  ): Promise<IRoomView> {
    const { rooms, members } = this.#repos();
    if (
      (await members.count({ userId: ownerId, role: "owner" })) >=
      ROOMS_OWNED_MAX
    )
      throw new RoomRefusal(
        "conflict",
        `tu possèdes déjà ${ROOMS_OWNED_MAX} salons, le maximum de la démo`,
      );
    const taken = new RoomRefusal(
      "conflict",
      `le salon « ${draft.name} » existe déjà`,
    );
    if (await rooms.exists({ name: draft.name })) throw taken;
    let room: RoomRow;
    try {
      room = await rooms.create({
        name: draft.name,
        kind: "chat",
        access: draft.access,
        ownerId,
        description: draft.description ?? null,
        createdAt: now,
      });
    } catch (error) {
      if (await rooms.exists({ name: draft.name })) throw taken;
      throw error;
    }
    try {
      await members.create({
        roomId: room.id,
        userId: ownerId,
        role: "owner",
        joinedAt: now,
      });
    } catch (error) {
      // Un salon sans propriétaire ne se gère plus : on le retire.
      await rooms.deleteOne({ id: room.id });
      throw error;
    }
    pushRoomsChanged(ownerId);
    return toRoomView(room, "owner", null, null, 0);
  }
  // #endregion

  // #region rooms-invite
  /**
   * Invite une personne, désignée par son identifiant EXACT : la démo ne
   * liste jamais les comptes. Le prix, assumé : un membre qui gère un salon
   * peut savoir si un identifiant existe.
   *
   * @param roomId - le salon
   * @param by - l'identité de qui invite
   * @param identifier - l'identifiant de connexion de l'invité
   * @param role - `member`, ou `moderator` si `by` est propriétaire
   * @throws RoomRefusal `forbidden`, `not-found` (salon, compte), `conflict` (déjà membre)
   */
  async invite(
    roomId: string,
    by: string,
    identifier: string,
    role: RoomRole,
  ): Promise<void> {
    if (!canAppoint(await this.#managed(roomId, by), role))
      throw new RoomRefusal(
        "forbidden",
        "seul le propriétaire nomme un modérateur",
      );
    const account = (await this.#accounts({ identifiers: [identifier] })).at(0);
    if (account === undefined)
      throw new RoomRefusal("not-found", `aucun compte « ${identifier} »`);
    if (await this.#repos().members.exists({ roomId, userId: account.id }))
      throw new RoomRefusal(
        "conflict",
        `${identifier} est déjà membre de ce salon`,
      );
    await this.addMember(roomId, account.id, role);
  }
  // #endregion

  /**
   * Planifie un événement dans un salon (RFC 5545) : l'organisateur est
   * `chair` et accepte d'office ; chaque invité reçoit une invitation
   * `needs-action`, et sa liste de salons change. L'invitation ouvre le salon
   * quinze minutes avant le début (`admissionOf`).
   *
   * @throws RoomRefusal `forbidden`, `not-found` (salon, comptes inconnus — tous nommés)
   */
  async planEvent(
    roomId: string,
    organizerId: string,
    draft: IEventDraft,
  ): Promise<IRoomEvent> {
    await this.#managed(roomId, organizerId);
    const { events, attendees } = this.#repos();
    const identifiers = [...new Set(draft.attendees)];
    const accounts =
      identifiers.length === 0 ? [] : await this.#accounts({ identifiers });
    const unknown = identifiers.filter(
      (identifier) => !accounts.some((a) => a.identifier === identifier),
    );
    if (unknown.length > 0)
      throw new RoomRefusal(
        "not-found",
        `aucun compte « ${unknown.join(" », « ")} »`,
      );
    const event = await events.create({
      roomId,
      organizerId,
      title: draft.title,
      start: draft.start,
      end: draft.end,
      timeZone: draft.timeZone,
      status: "confirmed",
    });
    const invited = accounts.filter((a) => a.id !== organizerId);
    try {
      await attendees.createMany([
        {
          eventId: event.id,
          userId: organizerId,
          role: "chair",
          partstat: "accepted",
        },
        ...invited.map((a) => ({
          eventId: event.id,
          userId: a.id,
          role: "req-participant" as const,
          partstat: "needs-action" as const,
        })),
      ]);
    } catch (error) {
      await events.deleteOne({ id: event.id });
      throw error;
    }
    // Tous les participants, organisateur compris : chaque liste change.
    pushRoomsChanged(organizerId);
    for (const a of invited) pushRoomsChanged(a.id);
    // À sa fin, l'invitation ne fait plus entrer : la porte se referme.
    this.#armClosing(event.end);
    return toRoomEvent(event, "accepted");
  }

  /**
   * Répond à une invitation (iTIP `REPLY`). Décliner FERME la porte : une
   * admission acceptée est retenue sur la connexion, l'invité est donc
   * éjecté du salon où seule l'invitation le faisait entrer.
   *
   * @throws RoomRefusal `not-found` — événement inconnu, ou pas d'invitation
   */
  async reply(
    eventId: string,
    userId: string,
    partstat: "accepted" | "declined",
  ): Promise<void> {
    const { events, attendees, members } = this.#repos();
    const event = await events.findOne({ id: eventId });
    const answered =
      event === null
        ? null
        : await attendees.updateOne({ eventId, userId }, { partstat });
    if (event === null || answered === null)
      throw new RoomRefusal("not-found", "aucune invitation à cet événement");
    if (
      partstat === "declined" &&
      !(await members.exists({ roomId: event.roomId, userId }))
    ) {
      const room = await this.#repos().rooms.findOne({ id: event.roomId });
      if (room !== null && (room.access === "private" || room.locked))
        getRealtimeHub().evictUser(roomChannel(event.roomId), userId);
    }
    pushRoomsChanged(userId);
  }

  // #region rooms-closing
  /**
   * Ferme la porte aux invités des événements FINIS depuis le dernier passage,
   * puis vise la prochaine fin. Une admission est retenue sur la connexion :
   * sans ce geste, un invité garderait la lecture d'un salon privé après la fin
   * de son événement. Chaque invité est rejugé par la règle `admissionOf` — un
   * membre, ou l'invité d'un autre événement en cours, reste ; les autres sont
   * éjectés sur tous les serveurs (`evictUser`), et la liste de chacun change.
   *
   * Guide pour un agent : UN minuteur pour tout le service, qui vise la fin la
   * plus proche — jamais un par événement, ni un balayage périodique qui lirait
   * la base pour rien. Appelé au démarrage (`DemoModule.onKernelReady`), réarmé
   * par `planEvent`.
   *
   * @param now - l'instant du passage, en ms
   * @returns le nombre d'invités éjectés
   */
  async closeEnded(now: number = Date.now()): Promise<number> {
    if (!this.isOpen()) return 0;
    const { events, attendees } = this.#repos();
    const since = this.#closedUntil;
    this.#closedUntil = now;
    // La règle admet jusqu'à `end` inclus : un événement est fini quand `end < now`.
    const ended = await events.find({ end: { $gte: since, $lt: now } });
    let evicted = 0;
    if (ended.length > 0) {
      const roomOf = new Map(ended.map((event) => [event.id, event.roomId]));
      const seen = new Set<string>();
      for (const row of await attendees.find({
        eventId: { $in: [...roomOf.keys()] },
      })) {
        const roomId = roomOf.get(row.eventId);
        if (roomId === undefined || seen.has(`${roomId}\n${row.userId}`))
          continue;
        seen.add(`${roomId}\n${row.userId}`);
        const facts = await this.admissionFacts(roomId, row.userId);
        if (admissionOf(facts, now) === "refused") {
          getRealtimeHub().evictUser(roomChannel(roomId), row.userId);
          evicted++;
        }
        // L'événement quitte la liste de chacun, admis ou non.
        pushRoomsChanged(row.userId);
      }
    }
    const next = (
      await events.find(
        { end: { $gte: now } },
        { limit: 1, order: [["end", "ASC"]] },
      )
    ).at(0);
    if (next !== undefined) this.#armClosing(next.end, now);
    return evicted;
  }

  /**
   * Vise la fin `end`, sauf si le minuteur vise déjà plus tôt. Un délai
   * au-delà de ce qu'un minuteur accepte se découpe : le réveil anticipé ne
   * trouve rien de fini, et réarme. `unref` : il ne retient pas l'arrêt.
   */
  #armClosing(end: number, now: number = Date.now()): void {
    const at = end + 1;
    if (this.#closing !== null && at >= this.#closingAt) return;
    if (this.#closing !== null) clearTimeout(this.#closing);
    this.#closingAt = at;
    this.#closing = setTimeout(
      () => {
        this.#closing = null;
        this.#closingAt = Number.POSITIVE_INFINITY;
        this.closeEnded().catch((error: unknown) => {
          this.log(
            `fin d'événement : éjection impossible — ${error instanceof Error ? error.message : String(error)}`,
            "ERROR",
          );
        });
      },
      Math.min(Math.max(0, at - now), TIMER_DELAY_MAX),
    );
    this.#closing.unref();
  }
  // #endregion

  // #region rooms-direct
  /**
   * Ouvre le salon à deux de `me` et `peerId` — ou le CRÉE. Un `upsert` sur
   * le nom de la paire (`directKey`, colonne unique) : une seule requête,
   * pas de lecture puis d'écriture entre lesquelles un second clic se
   * glisserait. Les deux personnes en sont membres, et leurs deux listes
   * changent.
   *
   * @throws RoomRefusal `invalid` (soi-même), `not-found` (compte inconnu)
   */
  async openDirect(
    me: IAccount,
    peerId: string,
    now: number = Date.now(),
  ): Promise<IRoomView> {
    if (peerId === me.id)
      throw new RoomRefusal(
        "invalid",
        "un salon à deux se tient avec une autre personne",
      );
    const peer = (await this.#accounts({ ids: [peerId] })).at(0);
    if (peer === undefined) throw new RoomRefusal("not-found", "aucun compte");
    const name = directKey(me.id, peer.id);
    if (name.length > ROOM_NAME_MAX)
      throw new RoomRefusal(
        "invalid",
        "identifiants trop longs pour un salon à deux",
      );
    const { rooms, members } = this.#repos();
    const room = await rooms.upsert(
      { name },
      { access: "private" },
      { kind: "chat", ownerId: me.id, createdAt: now },
    );
    for (const userId of [me.id, peer.id]) {
      await members.upsert(
        { roomId: room.id, userId },
        { role: "member" },
        { joinedAt: now },
      );
      pushRoomsChanged(userId);
    }
    return toRoomView(room, "member", null, peer.identifier, 0);
  }
  // #endregion

  // #region chat-people
  /**
   * Nomme les personnes PRÉSENTES dans un salon. La présence ne donne qu'une
   * identité opaque ; le nom vient des comptes, lus par l'ORM de
   * l'application (`UserService.find`, Drizzle ou Mongoose — la même ligne).
   *
   * Une identité absente du salon n'est jamais nommée : sans ce filtre, la
   * route deviendrait un annuaire de TOUS les comptes, à qui devinerait des
   * identifiants.
   *
   * @param roomId - le salon dont on nomme les présents
   * @param ids - les identités demandées, déjà bornées par `PeopleQuery`
   * @returns les présents trouvés ; un inconnu est simplement omis
   */
  async people(roomId: string, ids: readonly string[]): Promise<ChatPerson[]> {
    const present = getRealtimeHub().presence(roomChannel(roomId))?.members;
    if (present === undefined) return [];
    const wanted = [...new Set(ids)].filter((id) => present.has(id));
    const users = this.get<unknown>("users");
    if (wanted.length === 0 || !(users instanceof UserService)) return [];
    const found = await users.find({ id: { $in: wanted } });
    return found.map((user) => ({ id: user.id, name: user.identifier }));
  }

  /**
   * Les membres d'un salon PRIVÉ, nommés, avec leur rôle et s'ils sont en
   * ligne (D51). « En ligne » se lit sur DEUX présences, côté serveur : le
   * canal « en ligne » (que ses abonnés ne voient qu'en nombres) et le salon
   * lui-même. Un salon public rend une liste vide : y dire qui est en ligne
   * renseignerait n'importe quel visiteur.
   *
   * @param roomId - le salon ; la route a déjà vérifié l'admission
   * @returns les membres, sans ordre — la page les trie
   */
  async members(roomId: string): Promise<IRoomMember[]> {
    const room = await this.#room(roomId);
    if (room.access === "public") return [];
    const rows = await this.#repos().members.find({ roomId });
    if (rows.length === 0) return [];
    const names = new Map<string, string>();
    for (const account of await this.#accounts({
      ids: rows.map((row) => row.userId),
    }))
      names.set(account.id, account.identifier);
    const hub = getRealtimeHub();
    const online = hub.presence(ONLINE_CHANNEL)?.members;
    const here = hub.presence(roomChannel(roomId))?.members;
    const members: IRoomMember[] = [];
    for (const row of rows) {
      const name = names.get(row.userId);
      // Un compte effacé entre-temps : sa ligne de membre part avec `forget`.
      if (name === undefined) continue;
      members.push({
        id: row.userId,
        name,
        role: row.role,
        online:
          (online?.has(row.userId) ?? false) ||
          (here?.has(row.userId) ?? false),
      });
    }
    return members;
  }

  // #region rooms-alerts-server
  /**
   * Qui alerter d'un message (D53) : les membres d'un salon privé ou à deux
   * qui ne le regardent pas. « Regarder », c'est être abonné au canal du
   * salon — la présence le dit, sur tous les serveurs. L'auteur n'est jamais
   * alerté ; un salon public ne l'est jamais non plus.
   *
   * @param roomId - le salon où le message vient d'être archivé
   * @param authorId - l'auteur, exclu
   * @returns les identités à prévenir, sans ordre
   */
  async absentMembers(roomId: string, authorId: string): Promise<string[]> {
    const { rooms, members } = this.#repos();
    const room = await rooms.findOne({ id: roomId });
    if (room === null || room.access === "public") return [];
    const rows = await members.find({ roomId });
    // Seul dans son salon : personne à prévenir, la présence n'est pas lue.
    if (rows.length < 2) return [];
    const here = getRealtimeHub().presence(roomChannel(roomId))?.members;
    const absent: string[] = [];
    for (const row of rows)
      if (row.userId !== authorId && !(here?.has(row.userId) ?? false))
        absent.push(row.userId);
    return absent;
  }
  // #endregion
  // #endregion

  // #region rooms-membership
  /**
   * Ajoute un membre — puis le PRÉVIENT : sa liste de salons change, la page
   * la relit et s'abonne. L'appartenance est écrite AVANT le geste temps
   * réel : la page qui relit trouve le salon.
   */
  async addMember(
    roomId: string,
    userId: string,
    role: RoomRole = "member",
  ): Promise<void> {
    await this.#repos().members.upsert(
      { roomId, userId },
      { role },
      { joinedAt: Date.now() },
    );
    pushRoomsChanged(userId);
  }

  /**
   * Retire un membre — QUITTER (`actorId === userId`) ou EXCLURE — selon la
   * règle partagée avec la page (`memberRemovalProblem`), relue EN BASE. Puis
   * l'ÉJECTE du salon sur tous les serveurs : son admission était retenue sur
   * sa connexion, rien ne l'aurait retirée seule. Un salon public le garde
   * comme simple visiteur : l'éjection ne vaut que pour un salon où il n'a
   * plus le droit d'entrer.
   *
   * @throws RoomRefusal `not-found` (salon, ou membre), `forbidden` sinon
   */
  async removeMember(
    roomId: string,
    actorId: string,
    userId: string,
  ): Promise<void> {
    const room = await this.#room(roomId);
    const self = actorId === userId;
    const [actor, target] = await Promise.all([
      this.#roleOf(roomId, actorId),
      self ? null : this.#roleOf(roomId, userId),
    ]);
    const targetRole = self ? actor : target;
    const direct = room.name.startsWith(DIRECT_PREFIX);
    const problem = memberRemovalProblem(
      { id: room.id, direct },
      actor,
      targetRole,
      self,
    );
    if (problem !== null)
      throw new RoomRefusal(
        targetRole === null && room.id !== LOBBY_ROOM_ID && !direct
          ? "not-found"
          : "forbidden",
        problem,
      );
    const { members, reads } = this.#repos();
    await members.deleteOne({ roomId, userId });
    await reads.delete({ roomId, userId });
    if (room.access === "private" || room.locked)
      getRealtimeHub().evictUser(roomChannel(roomId), userId);
    pushRoomsChanged(userId);
  }
  // #endregion

  // #region rooms-delete
  /**
   * Supprime un salon (XEP-0045 §10.9) : son propriétaire seul
   * (`roomDeletionProblem`). Messages, réactions, événements, invitations,
   * membres et marqueurs de lecture sont EFFACÉS ; le canal est fermé pour tous ses abonnés, sur tous
   * les serveurs (`closeChannel` : `realtime:closed`, raison `ended`), et
   * chaque membre ou invité relit sa liste. La ligne du salon part EN
   * DERNIER : une suppression interrompue laisse le salon visible, et se
   * rejoue jusqu'au bout. Un message admis juste avant et archivé pendant ne
   * reste pas orphelin : une seconde passe le prend, et `archive` reprend
   * celui qui arriverait après elle.
   *
   * @returns les pièces que portaient ses messages, à effacer du disque
   * @throws RoomRefusal `not-found`, ou `forbidden` pour qui n'en a pas le droit
   */
  async deleteRoom(roomId: string, userId: string): Promise<ChatAttachment[]> {
    const { rooms, members, events, attendees, messages, reactions, reads } =
      this.#repos();
    const room = await rooms.findOne({ id: roomId });
    if (room === null) throw new RoomRefusal("not-found", "salon introuvable");
    const member = await members.findOne({ roomId, userId });
    const problem = roomDeletionProblem(
      { id: room.id, direct: room.name.startsWith(DIRECT_PREFIX) },
      member?.role ?? null,
    );
    if (problem !== null) throw new RoomRefusal("forbidden", problem);
    const people = await members.find({ roomId });
    const eventIds = (await events.find({ roomId })).map((event) => event.id);
    const invited =
      eventIds.length === 0
        ? []
        : await attendees.find({ eventId: { $in: eventIds } });
    const roomMessages = await messages.find({ roomId });
    if (roomMessages.length > 0)
      await reactions.delete({
        messageId: { $in: roomMessages.map((message) => message.id) },
      });
    await messages.delete({ roomId });
    if (eventIds.length > 0)
      await attendees.delete({ eventId: { $in: eventIds } });
    await events.delete({ roomId });
    await members.delete({ roomId });
    await reads.delete({ roomId });
    await rooms.deleteOne({ id: roomId });
    // Seconde passe : un message admis AVANT la suppression et archivé pendant
    // a échappé à la première. Après elle, `archive` ne trouve plus le salon
    // et reprend sa ligne lui-même.
    const late = await messages.find({ roomId });
    if (late.length > 0) {
      await reactions.delete({
        messageId: { $in: late.map((message) => message.id) },
      });
      await messages.delete({ roomId });
    }
    getRealtimeHub().closeChannel(roomChannel(roomId));
    const told = new Set([
      ...people.map((row) => row.userId),
      ...invited.map((row) => row.userId),
    ]);
    for (const id of told) pushRoomsChanged(id);
    return [...roomMessages, ...late].flatMap(
      (message) => message.attachments ?? [],
    );
  }
  // #endregion

  /**
   * Un compte supprimé de l'application : ses appartenances, invitations,
   * marqueurs de lecture, messages et réactions disparaissent aussi de la base de la démo — l'intégrité qu'une
   * clé étrangère ne peut pas porter d'une base à l'autre, et l'effacement
   * qu'on doit à une personne qui part (RGPD, art. 17). Appelé par
   * `ChatService.forget`, qui efface les pièces et publie les trames rendues.
   *
   * @returns les pièces de ses messages, et les trames qui mettent les écrans
   *   ouverts à jour : ses messages retirés, les réactions qu'il avait posées
   *   chez les autres recomptées
   */
  async forget(userId: string): Promise<IForgotten> {
    if (!this.isOpen()) return { attachments: [], frames: [] };
    const { members, attendees, messages, reactions, reads } = this.#repos();
    await members.delete({ userId });
    await reads.delete({ userId });
    await attendees.delete({ userId });
    // Ses réactions, et celles posées sur ses messages, partent avec eux.
    const own = await messages.find({ authorId: userId });
    const ownIds = new Set(own.map((row) => row.id));
    const touched = [
      ...new Set(
        (await reactions.find({ userId })).map((row) => row.messageId),
      ),
    ].filter((id) => !ownIds.has(id));
    if (own.length > 0)
      await reactions.delete({ messageId: { $in: [...ownIds] } });
    await reactions.delete({ userId });
    await messages.delete({ authorId: userId });
    const frames: IForgotten["frames"] = own.map((row) => ({
      roomId: row.roomId,
      frame: {
        kind: "message",
        message: {
          id: row.id,
          author: row.author,
          text: "",
          sentAt: row.sentAt,
          retracted: "author",
        },
      },
    }));
    if (touched.length > 0) {
      const left = await reactions.find(
        { messageId: { $in: touched } },
        { order: [["reactedAt", "ASC"]] },
      );
      for (const row of await messages.find({ id: { $in: touched } })) {
        const frame: RoomFrame = {
          kind: "reactions",
          messageId: row.id,
          reactions: summarizeReactions(
            left.filter((item) => item.messageId === row.id),
          ),
        };
        frames.push({ roomId: row.roomId, frame });
      }
    }
    return {
      attachments: own.flatMap((row) => row.attachments ?? []),
      frames,
    };
  }

  /**
   * Sème les salons de démonstration, hors production : le salon public
   * (`salon`), un salon privé de l'administrateur, et un événement EN COURS
   * dans ce dernier — recalé à chaque démarrage. Idempotent : un salon déjà
   * là n'est pas recréé.
   */
  async seed(now: number = Date.now()): Promise<void> {
    // Une commande console charge aussi la démo, sans ouvrir de base.
    if (!this.isOpen()) return;
    const { rooms, members, events, attendees } = this.#repos();
    const users = this.get<unknown>("users");
    const admin =
      users instanceof UserService
        ? await users.findByIdentifier("admin")
        : null;
    const ownerId = admin?.id ?? "system";
    if (!(await rooms.exists({ id: LOBBY_ROOM_ID })))
      await rooms.create({
        id: LOBBY_ROOM_ID,
        name: "salon",
        kind: "chat",
        access: "public",
        ownerId,
        description: "Le salon public : lecture libre, écriture sous session.",
        createdAt: now,
      });
    if (admin === null) return;
    if (!(await rooms.exists({ id: TEAM_ROOM_ID })))
      await rooms.create({
        id: TEAM_ROOM_ID,
        name: "équipe",
        kind: "conference",
        access: "private",
        ownerId,
        description:
          "Un salon privé : membres et invités d'un événement en cours.",
        createdAt: now,
      });
    await members.upsert(
      { roomId: TEAM_ROOM_ID, userId: ownerId },
      { role: "owner" },
      { joinedAt: now },
    );
    await events.upsert(
      { id: TEAM_EVENT_ID },
      { start: now - 5 * 60_000, end: now + 55 * 60_000 },
      {
        roomId: TEAM_ROOM_ID,
        organizerId: ownerId,
        title: "Point d'équipe",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: "confirmed",
      },
    );
    await attendees.upsert(
      { eventId: TEAM_EVENT_ID, userId: ownerId },
      { partstat: "accepted" },
      { role: "chair" },
    );
  }
}

export default RoomService;
