import { EMOJIS, textProblem } from "./attachments";
import type {
  ChatMessage,
  ChatReaction,
  ChatReplyRef,
  RetractedBy,
} from "./chatContract";
import type { RoomRole } from "./rooms";

/**
 * Répondre, réagir, modifier, retirer — les règles PURES d'un message, lues
 * par la page ET par le serveur (isomorphisme : une règle, un fichier).
 *
 * Guide pour un agent : chaque geste suit sa norme — réponse XEP-0461,
 * réaction XEP-0444, correction XEP-0308 (Matrix `m.replace` pour « tout
 * message »), retrait XEP-0424 et modération XEP-0425. Le serveur rejoue
 * chaque règle : la page ne fait que CACHER ce qu'il refuserait.
 */

/** Au plus vingt emojis différents sur un message… */
export const REACTIONS_PER_MESSAGE_MAX = 20;

/** …et vingt par personne sur un même message. */
export const REACTIONS_PER_PERSON_MAX = 20;

/**
 * Un emoji tient en 32 unités UTF-16 au plus : une famille à quatre (11),
 * un drapeau de région à balises (14) y entrent.
 */
export const REACTION_MAX_LENGTH = 32;

/** L'extrait d'un message cité : quatre-vingts graphèmes au plus. */
export const REPLY_EXCERPT_MAX = 80;

/**
 * Les réactions proposées d'un geste — prises dans les émoticônes du
 * compositeur, pour garder leur nom lu par un lecteur d'écran.
 */
export const QUICK_REACTIONS: readonly { char: string; label: string }[] = [
  "👍",
  "❤️",
  "😂",
  "🎉",
  "😮",
  "👀",
].flatMap((char) => EMOJIS.filter((emoji) => emoji.char === char));

/** Le découpage en graphèmes (UAX #29), celui qu'un humain voit. */
const GRAPHEMES = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** Un pictogramme, une lettre de drapeau, ou la touche d'un « 1️⃣ ». */
const PICTOGRAPH = /\p{Extended_Pictographic}|\p{Regional_Indicator}|⃣/u;

/**
 * Une réaction est-elle UN emoji ? XEP-0444 : « a single emoji » — un seul
 * graphème, qui porte un pictogramme. Un mot, deux emojis ou une lettre
 * seule sont refusés.
 */
export function isReaction(value: string): boolean {
  if (value.length === 0 || value.length > REACTION_MAX_LENGTH) return false;
  const segments = GRAPHEMES.segment(value)[Symbol.iterator]();
  if (segments.next().done === true) return false;
  if (segments.next().done !== true) return false;
  return PICTOGRAPH.test(value);
}

/**
 * Ce qui ne va pas dans l'ensemble des réactions d'une personne (XEP-0444 :
 * on envoie son ensemble ENTIER, qui remplace le précédent), ou `null`.
 */
export function reactionSetProblem(emojis: readonly string[]): string | null {
  if (emojis.length > REACTIONS_PER_PERSON_MAX)
    return `au plus ${REACTIONS_PER_PERSON_MAX} réactions par message`;
  if (!emojis.every(isReaction)) return "une réaction est un seul emoji";
  if (new Set(emojis).size !== emojis.length) return "réaction en double";
  return null;
}

/**
 * Regroupe des réactions par emoji, dans l'ordre d'ARRIVÉE : le premier emoji
 * posé reste le premier affiché, et chacun garde ses noms dans l'ordre.
 *
 * @param rows - les réactions, de la plus ancienne à la plus récente
 */
export function summarizeReactions(
  rows: readonly { emoji: string; name: string }[],
): ChatReaction[] {
  const byEmoji = new Map<string, string[]>();
  for (const row of rows) {
    const names = byEmoji.get(row.emoji);
    if (names === undefined) byEmoji.set(row.emoji, [row.name]);
    else if (!names.includes(row.name)) names.push(row.name);
  }
  return Array.from(byEmoji, ([emoji, names]) => ({ emoji, names }));
}

/** Les emojis que `me` a posés sur un message — reconnus à son nom. */
export function myReactions(
  reactions: readonly ChatReaction[] | undefined,
  me: string,
): string[] {
  return (reactions ?? []).flatMap((reaction) =>
    reaction.names.includes(me) ? [reaction.emoji] : [],
  );
}

/** Pose ou retire un emoji de son ensemble — ce que la page enverra. */
export function toggleReaction(
  mine: readonly string[],
  emoji: string,
): string[] {
  return mine.includes(emoji)
    ? mine.filter((item) => item !== emoji)
    : [...mine, emoji];
}

/** Une ligne qui ne fait qu'ouvrir ou fermer un bloc (code, formule). */
const FENCE_LINE = /^(?:`{3,}|~{3,})[\w+-]*$|^\$\$$/u;

/**
 * L'extrait d'un message cité, en texte BRUT : sa première ligne parlante —
 * une clôture de bloc ne dit rien —, espaces resserrés, coupée à
 * `REPLY_EXCERPT_MAX` graphèmes. Un message de pièces seules se cite par
 * leur nombre.
 *
 * @param attachments - nombre de pièces du message
 */
export function replyExcerpt(text: string, attachments = 0): string {
  const line =
    text
      .split("\n")
      .map((item) => item.replace(/\s+/gu, " ").trim())
      .find((item) => item !== "" && !FENCE_LINE.test(item)) ?? "";
  if (line === "")
    return attachments === 0
      ? ""
      : `📎 ${attachments} pièce${attachments > 1 ? "s" : ""} jointe${attachments > 1 ? "s" : ""}`;
  const graphemes = Array.from(GRAPHEMES.segment(line), (part) => part.segment);
  return graphemes.length <= REPLY_EXCERPT_MAX
    ? line
    : `${graphemes.slice(0, REPLY_EXCERPT_MAX - 1).join("")}…`;
}

/** La citation d'un message : ce que le serveur rend du message visé. */
export function replyRefOf(
  id: string,
  target: ChatMessage | null,
): ChatReplyRef {
  if (target === null)
    return { id, state: "missing", author: null, excerpt: "" };
  if (target.retracted !== undefined)
    return { id, state: "retracted", author: target.author, excerpt: "" };
  return {
    id,
    state: "present",
    author: target.author,
    excerpt: replyExcerpt(target.text, target.attachments?.length ?? 0),
  };
}

/**
 * La citation À AFFICHER : celle du message visé s'il est dans la page — elle
 * suit alors ses modifications et son retrait sans attendre une relecture —,
 * sinon celle que le serveur a jointe.
 */
export function liveQuote(
  ref: ChatReplyRef,
  loaded: ReadonlyMap<string, ChatMessage>,
): ChatReplyRef {
  const target = loaded.get(ref.id);
  return target === undefined ? ref : replyRefOf(ref.id, target);
}

/**
 * Le rang d'une version : un retrait l'emporte sur tout, puis la
 * modification la plus récente. Une relecture en retard ne ressuscite ainsi
 * jamais un message retiré ni un texte corrigé.
 */
function versionOf(message: ChatMessage): number {
  return message.retracted === undefined
    ? (message.editedAt ?? 0)
    : Number.POSITIVE_INFINITY;
}

/**
 * Rattrape la page sur l'historique relu après une (re)connexion — les
 * `limit` derniers messages du salon. La page n'a pas vu ce qui s'est dit
 * pendant la coupure : si la page relue RECOUPE ce qu'elle montrait (un `id`
 * commun), ou si le salon n'a rien de plus ancien (page incomplète), on
 * fusionne. Sinon il y a un TROU entre les deux : les messages plus anciens
 * que la page relue sont retirés, plutôt que montrés de part et d'autre d'un
 * silence qui n'a pas eu lieu. Ceux arrivés par le canal APRÈS la relecture
 * (plus récents qu'elle) restent.
 *
 * @param known - les messages de la page
 * @param page - l'historique relu, dans l'ordre d'envoi
 * @param limit - la taille demandée pour cette relecture
 */
export function catchUpMessages(
  known: readonly ChatMessage[],
  page: readonly ChatMessage[],
  limit: number,
): ChatMessage[] {
  const oldest = page.at(0);
  if (oldest === undefined || page.length < limit)
    return mergeMessages(known, page);
  const reread = new Set(page.map((message) => message.id));
  if (known.some((message) => reread.has(message.id)))
    return mergeMessages(known, page);
  return mergeMessages(
    known.filter((message) => message.sentAt >= oldest.sentAt),
    page,
  );
}

/**
 * Fusionne des messages reçus dans ceux de la page, dans l'ordre d'envoi :
 * un message connu est REMPLACÉ par sa version reçue (modifié, retiré,
 * réactions relues), sauf si elle est plus ancienne. L'historique relu à la
 * reconnexion rattrape ainsi tout ce qu'une coupure a fait manquer.
 */
export function mergeMessages(
  known: readonly ChatMessage[],
  incoming: readonly ChatMessage[],
): ChatMessage[] {
  // Le cas de chaque trame : un message NEUF, le plus récent — ajouté en fin,
  // sans rebâtir ni retrier toute la liste.
  const single = incoming.at(0);
  const last = known.at(-1);
  if (
    incoming.length === 1 &&
    single !== undefined &&
    (last === undefined || single.sentAt >= last.sentAt) &&
    !known.some((message) => message.id === single.id)
  )
    return [...known, single];
  const byId = new Map(known.map((message) => [message.id, message]));
  for (const message of incoming) {
    const was = byId.get(message.id);
    if (was === undefined || versionOf(message) >= versionOf(was))
      byId.set(message.id, message);
  }
  return [...byId.values()].toSorted((a, b) => a.sentAt - b.sentAt);
}

/** Les messages, avec les réactions d'UN message remplacées en entier. */
export function withReactions(
  messages: readonly ChatMessage[],
  messageId: string,
  reactions: readonly ChatReaction[],
): ChatMessage[] {
  return messages.map((message) => {
    if (message.id !== messageId) return message;
    const { reactions: _old, ...rest } = message;
    return reactions.length === 0
      ? rest
      : { ...rest, reactions: [...reactions] };
  });
}

/**
 * Qui peut retirer un message : son auteur, sinon le propriétaire ou un
 * modérateur du salon (XEP-0425) — et à quel titre ; `null` pour personne
 * d'autre.
 */
export function retractRight(
  isAuthor: boolean,
  role: RoomRole | null,
): RetractedBy | null {
  if (isAuthor) return "author";
  return role === "owner" || role === "moderator" ? "moderation" : null;
}

/**
 * Ce qui empêche de remplacer le texte d'un message, ou `null`. Un message
 * sans pièce ne devient pas vide : on le retire. Même borne que l'envoi.
 *
 * @param hasAttachments - le message porte des pièces
 */
export function editProblem(
  text: string,
  hasAttachments: boolean,
): string | null {
  if (text === "" && !hasAttachments)
    return "un message vide se retire, il ne se modifie pas";
  return text === "" ? null : textProblem(text);
}
