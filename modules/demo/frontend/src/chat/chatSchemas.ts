import { z } from "zod";
import { textProblem } from "./attachments";
import { CHAT_HISTORY_LIMIT, LINK_INDEX_MAX, PEOPLE_MAX } from "./chatContract";
import { reactionSetProblem } from "./messages";
import {
  EVENT_ATTENDEES_MAX,
  EVENT_TITLE_MAX,
  ROOM_DESCRIPTION_MAX,
  eventProblem,
  normalizeRoomName,
  roomNameProblem,
} from "./rooms";

/**
 * Un texte de message, borné par la règle partagée avec la page
 * (`textProblem`, au plus `MESSAGE_MAX_BYTES` octets UTF-8).
 */
const messageText = z
  .string()
  .trim()
  .superRefine((text, ctx) => {
    const problem = textProblem(text);
    if (problem !== null) ctx.addIssue({ code: "custom", message: problem });
  });

/**
 * Ce que le salon accepte — la SEULE définition du corps de l'envoi et de la
 * query de l'historique.
 *
 * Guide pour un agent : les routes de `ChatController` VALIDENT avec ces
 * schémas (`schema: { body: SendBody }`), avant d'entrer dans l'action, en
 * HTTP comme par la socket ; le contrat (`chatContract.ts`) en lit le `typeof`.
 * Le navigateur n'importe que des TYPES de ce fichier : zod n'entre pas dans
 * son paquet. Doc : `@nodefony/realtime/docs/cookbook-chat.md` (étape 5).
 */
/**
 * Le message auquel on répond (XEP-0461) : un identifiant tiré par la base.
 * Le serveur vérifie qu'il est du MÊME salon avant d'archiver.
 */
const ReplyTo = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/u);

export const SendBody = z.strictObject({
  text: messageText.min(1),
  replyTo: ReplyTo.optional(),
});

/**
 * Le champ texte d'un envoi AVEC pièces (multipart) : il peut être vide, les
 * pièces suffisent alors à faire un message.
 */
export const AttachBody = z.strictObject({
  text: messageText.default(""),
  replyTo: ReplyTo.optional(),
});

/**
 * Le nouveau texte d'un message (XEP-0308) : la borne de l'envoi. Vide, il
 * n'est accepté que d'un message à pièces — le service le vérifie, lui seul
 * voit le message (`editProblem`).
 */
export const EditBody = z.strictObject({
  text: messageText,
});

/**
 * L'ensemble ENTIER des réactions d'une personne sur un message (XEP-0444) :
 * il remplace le précédent — `[]` les retire toutes. Rejouer la même
 * requête rend le même état : la route est un `PUT`.
 */
export const ReactBody = z.strictObject({
  emojis: z.array(z.string()).superRefine((emojis, ctx) => {
    const problem = reactionSetProblem(emojis);
    if (problem !== null) ctx.addIssue({ code: "custom", message: problem });
  }),
});

/**
 * Le salon visé par une route (`/demo/chat/rooms/{room}/…`) : un identifiant
 * court, sans `:` — il compose le nom du canal `chat:room:<id>`.
 */
export const RoomParams = z.strictObject({
  room: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/u),
});

/**
 * Les identités à nommer, séparées par des virgules : `?ids=a1,b2`. Bornée
 * avant d'être découpée (au plus `PEOPLE_MAX` identités de 128 caractères).
 */
export const PeopleQuery = z.strictObject({
  ids: z
    .string()
    .min(1)
    .max(PEOPLE_MAX * 129)
    .transform((list) => list.split(","))
    .pipe(z.array(z.string().min(1).max(128)).max(PEOPLE_MAX)),
});

/**
 * Un entier DÉCIMAL arrivé en texte (chemin, query), borné : chiffres seuls —
 * ni espace, ni signe, ni `0x`, ni exposant, ni zéro de tête. `z.coerce`
 * laissait passer `" 1"`, `"0x10"` ou `"1e2"`, devenus des nombres : une même
 * adresse s'écrivait de plusieurs façons, qu'un cache ou un journal tenus sur
 * le texte ne reconnaissaient plus comme une seule.
 */
const decimal = (min: number, max: number) =>
  z
    .union([
      // Un client typé l'envoie en nombre ; un chemin ou une query, en texte.
      z.number().int(),
      z
        .string()
        .max(16)
        .regex(/^(?:0|[1-9][0-9]*)$/u)
        .transform(Number),
    ])
    .pipe(z.number().min(min).max(max));

/**
 * Un identifiant d'objet dans un chemin (`{event}`, `{user}`) : la même forme
 * que celle d'un salon — les identifiants tirés par la base y entrent.
 */
const PathId = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/u);

/** Le message visé : `/demo/chat/rooms/{room}/messages/{message}`. */
export const MessageParams = z.strictObject({
  room: RoomParams.shape.room,
  message: PathId,
});

/** L'événement visé : `/demo/chat/events/{event}/…`. */
export const EventParams = z.strictObject({ event: PathId });

/** Le membre visé : `/demo/chat/rooms/{room}/members/{user}`. */
export const MemberParams = z.strictObject({
  room: RoomParams.shape.room,
  user: PathId,
});

/** La personne visée : `/demo/chat/direct/{user}`. */
export const UserParams = z.strictObject({ user: PathId });

/**
 * Le lien visé par un aperçu :
 * `/demo/chat/rooms/{room}/messages/{message}/links/{index}`. Jamais une
 * adresse — le serveur relit le message et y prend le lien de rang `index`,
 * sinon il deviendrait un lecteur du réseau interne offert à tout le salon.
 * L'indice arrive en texte : décimal strict, puis borné.
 */
export const LinkParams = z.strictObject({
  room: RoomParams.shape.room,
  message: PathId,
  index: decimal(0, LINK_INDEX_MAX),
});

/** L'identifiant EXACT d'un compte, tel qu'on se connecte. */
const AccountIdentifier = z.string().trim().min(1).max(128);

/**
 * Créer un salon. Le nom est NORMALISÉ par le schéma lui-même : ce que
 * l'action reçoit est déjà le nom qui sera enregistré.
 */
export const CreateRoomBody = z.strictObject({
  name: z
    .string()
    .transform(normalizeRoomName)
    .superRefine((name, ctx) => {
      const problem = roomNameProblem(name);
      if (problem !== null) ctx.addIssue({ code: "custom", message: problem });
    }),
  access: z.enum(["public", "private"]),
  description: z.string().trim().max(ROOM_DESCRIPTION_MAX).optional(),
});

/** Inviter une personne, désignée par son identifiant exact. */
export const InviteBody = z.strictObject({
  identifier: AccountIdentifier,
  role: z.enum(["member", "moderator"]).default("member"),
});

/**
 * Planifier un événement. Le créneau est jugé à l'instant où le SERVEUR lit
 * le corps : l'horloge du navigateur ne décide pas.
 */
export const EventBody = z
  .strictObject({
    title: z.string().trim().min(1).max(EVENT_TITLE_MAX),
    start: z.number().int().nonnegative(),
    end: z.number().int().nonnegative(),
    /** Le fuseau du navigateur (`Intl…timeZone`), gardé avec l'événement. */
    timeZone: z.string().min(1).max(64).refine(isTimeZone, {
      message: "fuseau horaire inconnu",
    }),
    attendees: z.array(AccountIdentifier).max(EVENT_ATTENDEES_MAX).default([]),
  })
  .superRefine((body, ctx) => {
    const problem = eventProblem(body.start, body.end, Date.now());
    if (problem !== null)
      ctx.addIssue({ code: "custom", message: problem, path: ["end"] });
  });

/** Répondre à une invitation (iTIP `REPLY`). */
export const ReplyBody = z.strictObject({
  partstat: z.enum(["accepted", "declined"]),
});

/** Un fuseau IANA que le moteur JavaScript connaît (`Europe/Paris`). */
function isTimeZone(zone: string): boolean {
  try {
    // Un fuseau inconnu lève une `RangeError` dès la construction.
    const format = new Intl.DateTimeFormat("en", { timeZone: zone });
    return format.resolvedOptions().timeZone !== "";
  } catch {
    return false;
  }
}

/**
 * La query de l'historique — elle arrive en texte, en décimal strict. Pas de
 * `since` sur un instant : chaque pod a son horloge, et un rattrapage borné
 * par l'heure double ou perd des messages. La page relit les derniers, et les
 * recoupe par `id` (`catchUpMessages`).
 */
export const HistoryQuery = z.strictObject({
  limit: decimal(1, CHAT_HISTORY_LIMIT).default(50),
});
