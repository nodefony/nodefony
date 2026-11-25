import { randomUUID } from "node:crypto";
import { defineEntity } from "@nodefony/orm-core";
import type { IEntityDefinition } from "@nodefony/orm-core";
import { defineTable, jsonType } from "@nodefony/drizzle";
import type { RowOf } from "@nodefony/drizzle";
import type { ChatAttachment } from "../../frontend/src/chat/chatContract";

/**
 * Les salons du chat en base — le modèle d'une salle de conférence
 * (salle, membres, événements planifiés, invités), écrit pour servir aussi
 * plus tard à une conférence (`kind: "conference"`).
 *
 * Guide pour un agent : des descriptions PORTABLES (`defineTable`) — une
 * table par moteur se déduit au démarrage. Elles vivent sur le connecteur
 * `demo`, une base SQLite à la démo (`nodefony/config/config.ts`,
 * `demoDrizzleOverride`), jamais la base de l'application. Les comptes, eux,
 * vivent dans la base de l'application : `ownerId`, `userId`, `organizerId`
 * sont des identifiants STABLES de compte (`this.user.id`), sans clé
 * étrangère — une base ne peut pas en viser une autre. Entre tables de la
 * démo, en revanche, chaque lien est une vraie clé étrangère (`kind: "ref"`) :
 * la base refuse un membre sans salle, et le schéma de la console les dessine. Les noms d'entité
 * sont préfixés `Demo` : une autre partie de l'application peut avoir sa
 * propre `Room`. Les champs d'événement suivent iCalendar (RFC 5545 :
 * `VEVENT`, `STATUS`, `ATTENDEE` avec son `ROLE` et son `PARTSTAT`).
 * Doc : `@nodefony/orm-core/docs/tutorial-entity.md`.
 */

/** Une salle : son nom, sa nature, qui peut y entrer. */
export const roomTable = defineTable({
  name: "room",
  columns: {
    id: { kind: "text", primaryKey: true, defaultFn: () => randomUUID() },
    name: { kind: "string", length: 80, notNull: true, unique: true },
    kind: { kind: "enum", values: ["chat", "conference"], notNull: true },
    access: { kind: "enum", values: ["public", "private"], notNull: true },
    /** Plus personne n'entre, sauf les membres. */
    locked: { kind: "bool", notNull: true, default: false },
    /** Salle d'attente : un modérateur admet chaque arrivant (pas encore appliqué). */
    waitingRoom: { kind: "bool", notNull: true, default: false },
    ownerId: { kind: "text", notNull: true },
    description: { kind: "string", length: 280 },
    createdAt: { kind: "int64", notNull: true },
  },
  indexes: [],
});

// #region rooms-tables
/** Un membre d'une salle, et son rôle. */
export const roomMemberTable = defineTable({
  name: "room_member",
  columns: {
    id: { kind: "text", primaryKey: true, defaultFn: () => randomUUID() },
    roomId: { kind: "ref", target: () => roomTable, notNull: true },
    userId: { kind: "text", notNull: true },
    role: {
      kind: "enum",
      values: ["owner", "moderator", "member"],
      notNull: true,
    },
    joinedAt: { kind: "int64", notNull: true },
  },
  indexes: [
    {
      name: "room_member_room_user_uq",
      on: ["roomId", "userId"],
      unique: true,
    },
    { name: "room_member_user_idx", on: ["userId"] },
  ],
});

// #endregion

/** Un événement planifié dans une salle (iCalendar `VEVENT`). */
export const eventTable = defineTable({
  name: "event",
  columns: {
    /** L'UID iCalendar : stable, exportable en `.ics`. */
    id: { kind: "text", primaryKey: true, defaultFn: () => randomUUID() },
    roomId: { kind: "ref", target: () => roomTable, notNull: true },
    organizerId: { kind: "text", notNull: true },
    title: { kind: "string", length: 120, notNull: true },
    description: { kind: "string", length: 1000 },
    /** Début et fin, en ms UTC. */
    start: { kind: "int64", notNull: true },
    end: { kind: "int64", notNull: true },
    /** Fuseau de l'organisateur (IANA), pour l'affichage et l'export. */
    timeZone: { kind: "string", length: 64, notNull: true },
    status: {
      kind: "enum",
      values: ["tentative", "confirmed", "cancelled"],
      notNull: true,
    },
    /** Règle de récurrence RRULE (RFC 5545 §3.3.10), gardée telle quelle, pas encore interprétée. */
    recurrence: { kind: "string", length: 500 },
  },
  indexes: [{ name: "event_room_idx", on: ["roomId"] }],
});

/** Un invité d'un événement (iCalendar `ATTENDEE`). */
export const eventAttendeeTable = defineTable({
  name: "event_attendee",
  columns: {
    id: { kind: "text", primaryKey: true, defaultFn: () => randomUUID() },
    eventId: { kind: "ref", target: () => eventTable, notNull: true },
    userId: { kind: "text", notNull: true },
    role: {
      kind: "enum",
      values: ["chair", "req-participant", "opt-participant"],
      notNull: true,
    },
    partstat: {
      kind: "enum",
      values: ["needs-action", "accepted", "declined", "tentative"],
      notNull: true,
    },
  },
  indexes: [
    {
      name: "event_attendee_event_user_uq",
      on: ["eventId", "userId"],
      unique: true,
    },
    { name: "event_attendee_user_idx", on: ["userId"] },
  ],
});

// #region messages-table
/**
 * Un message d'une salle. Son `id` est tiré par le SERVEUR à l'archivage —
 * c'est l'identifiant stable et unique de XEP-0359 (`stanza-id`), celui
 * qu'une réponse, une réaction ou un retrait viseront ; la clé
 * d'idempotence du client n'en est que l'`origin-id`. `author` est le nom
 * AU MOMENT de l'envoi : une conversation garde ce qui a été dit, sous le nom
 * d'alors.
 */
export const messageTable = defineTable({
  name: "message",
  columns: {
    id: { kind: "text", primaryKey: true, defaultFn: () => randomUUID() },
    roomId: { kind: "ref", target: () => roomTable, notNull: true },
    authorId: { kind: "text", notNull: true },
    author: { kind: "string", length: 128, notNull: true },
    /** Jusqu'à `MESSAGE_MAX_BYTES` (64 Kio) : un `text`, pas une chaîne bornée. */
    text: { kind: "text", notNull: true },
    /** Instant d'archivage, en ms UTC — l'ordre de l'historique. */
    sentAt: { kind: "int64", notNull: true },
    /** Ce que le salon annonce des pièces ; absent d'un message de texte seul. */
    attachments: { kind: "json", type: jsonType<ChatAttachment[]>() },
    /** Le message auquel il répond (XEP-0461), du MÊME salon. */
    replyTo: { kind: "ref", target: "self", onDelete: "set null" },
    /** Dernière modification par l'auteur (XEP-0308), en ms UTC. */
    editedAt: { kind: "int64" },
    /**
     * Retiré (XEP-0424/0425) : par qui. Texte, pièces et citation effacés —
     * la ligne reste pour que les réponses disent « retiré ».
     */
    retracted: { kind: "enum", values: ["author", "moderation"] },
  },
  indexes: [
    // L'historique se lit salon par salon, du plus récent au plus ancien.
    { name: "message_room_sent_idx", on: ["roomId", "sentAt"] },
    { name: "message_author_idx", on: ["authorId"] },
  ],
});
// #endregion

// #region reactions-table
/**
 * Une réaction (XEP-0444) : UNE ligne par message, personne et emoji — l'index
 * unique en fait un ensemble. `name` est le nom AU MOMENT de la réaction,
 * comme l'auteur d'un message ; `userId` n'est jamais montré au salon.
 * `reactedAt` garde l'ordre d'arrivée, celui de l'affichage.
 */
export const reactionTable = defineTable({
  name: "message_reaction",
  columns: {
    id: { kind: "text", primaryKey: true, defaultFn: () => randomUUID() },
    messageId: { kind: "ref", target: () => messageTable, notNull: true },
    userId: { kind: "text", notNull: true },
    name: { kind: "string", length: 128, notNull: true },
    emoji: { kind: "string", length: 32, notNull: true },
    reactedAt: { kind: "int64", notNull: true },
  },
  indexes: [
    {
      name: "message_reaction_uq",
      on: ["messageId", "userId", "emoji"],
      unique: true,
    },
    { name: "message_reaction_user_idx", on: ["userId"] },
  ],
});
// #endregion

// #region reads-table
/**
 * Où une personne en est de sa lecture d'un salon (D52) : UNE ligne par
 * salon et compte. `readUpTo` est l'instant d'envoi (`sentAt`) du dernier
 * message lu — l'ordre de l'historique, donc une borne que l'index
 * `message_room_sent_idx` sert pour compter les non-lus. Il n'avance
 * jamais à reculons : posé par `upsert` avec `$max`, une seule instruction,
 * qu'un ancien onglet en retard ne fait pas reculer. Une TABLE neuve plutôt
 * qu'une colonne : une colonne ajoutée ne serait pas créée sur une base déjà
 * en place.
 */
export const roomReadTable = defineTable({
  name: "room_read",
  columns: {
    id: { kind: "text", primaryKey: true, defaultFn: () => randomUUID() },
    roomId: { kind: "ref", target: () => roomTable, notNull: true },
    userId: { kind: "text", notNull: true },
    readUpTo: { kind: "int64", notNull: true },
  },
  indexes: [
    { name: "room_read_room_user_uq", on: ["roomId", "userId"], unique: true },
    { name: "room_read_user_idx", on: ["userId"] },
  ],
});
// #endregion

/** Une salle telle que la base la rend. */
export type RoomRow = RowOf<typeof roomTable.spec>;
/** Un membre tel que la base le rend. */
export type RoomMemberRow = RowOf<typeof roomMemberTable.spec>;
/** Un événement tel que la base le rend. */
export type EventRow = RowOf<typeof eventTable.spec>;
/** Un invité tel que la base le rend. */
export type EventAttendeeRow = RowOf<typeof eventAttendeeTable.spec>;
/** Un message tel que la base le rend. */
export type MessageRow = RowOf<typeof messageTable.spec>;
/** Une réaction telle que la base la rend. */
export type ReactionRow = RowOf<typeof reactionTable.spec>;
/** Un marqueur de lecture tel que la base le rend. */
export type RoomReadRow = RowOf<typeof roomReadTable.spec>;
/**
 * Un message lu AVEC ses relations déclarées (`relations: [...]` d'un
 * `find`) : ses réactions, et le message auquel il répond.
 */
export type MessageWithRelations = MessageRow & {
  reactions?: ReactionRow[];
  replyTarget?: MessageRow | null;
};

/** Les relations qu'une lecture de messages charge (eager-load). */
export const MESSAGE_RELATIONS = ["reactions", "replyTarget"];

/** Les noms logiques des entités (clés de `getRepository`). */
export const ROOM_ENTITY = "DemoRoom";
export const ROOM_MEMBER_ENTITY = "DemoRoomMember";
export const EVENT_ENTITY = "DemoEvent";
export const EVENT_ATTENDEE_ENTITY = "DemoEventAttendee";
export const MESSAGE_ENTITY = "DemoMessage";
export const REACTION_ENTITY = "DemoMessageReaction";
export const ROOM_READ_ENTITY = "DemoRoomRead";

/**
 * Les sept entités, SANS connecteur : `@entities(roomEntities, { connector:
 * DEMO_CONNECTOR })` sur `DemoModule` les lie au connecteur `demo`.
 */
export const roomEntities: IEntityDefinition[] = [
  defineEntity({ name: ROOM_ENTITY, module: "demo", schema: roomTable }),
  defineEntity({
    name: ROOM_MEMBER_ENTITY,
    module: "demo",
    schema: roomMemberTable,
  }),
  defineEntity({ name: EVENT_ENTITY, module: "demo", schema: eventTable }),
  defineEntity({
    name: EVENT_ATTENDEE_ENTITY,
    module: "demo",
    schema: eventAttendeeTable,
  }),
  defineEntity({
    name: MESSAGE_ENTITY,
    module: "demo",
    schema: messageTable,
    // Chargées à la demande (`find(…, { relations })`) : une lecture `IN (…)`
    // par relation pour toute la page, jamais une par message.
    relations: [
      {
        type: "one-to-many",
        target: REACTION_ENTITY,
        field: "reactions",
        foreignKey: "messageId",
      },
      {
        type: "many-to-one",
        target: MESSAGE_ENTITY,
        field: "replyTarget",
        foreignKey: "replyTo",
      },
    ],
  }),
  defineEntity({
    name: REACTION_ENTITY,
    module: "demo",
    schema: reactionTable,
  }),
  defineEntity({
    name: ROOM_READ_ENTITY,
    module: "demo",
    schema: roomReadTable,
  }),
];
