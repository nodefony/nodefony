import type {
  ChatMessage,
  ChatReaction,
} from "../frontend/src/chat/chatContract";
import {
  editProblem,
  replyRefOf,
  retractRight,
  summarizeReactions,
} from "../frontend/src/chat/messages";
import type { RoomRole } from "../frontend/src/chat/rooms";
import type {
  IForgotten,
  IMessageArchive,
} from "../nodefony/service/ChatService";
import { RoomRefusal } from "../nodefony/service/RoomService";

/**
 * Une archive de messages EN MÉMOIRE — le double de `RoomService` pour les
 * tests sans base. Elle applique les MÊMES règles pures (`chat/messages.ts`) :
 * une réponse vise un message du même salon, l'auteur seul modifie, l'auteur
 * ou la modération retire, chaque personne remplace son ensemble de réactions.
 * L'horloge est un compteur : `sentAt` et `editedAt` valent 1, 2, 3…
 *
 * @param roles - le rôle d'une personne dans un salon, clé `<salon>:<compte>`
 */
export function memoryArchive(
  roles: ReadonlyMap<string, RoomRole> = new Map(),
): IMessageArchive {
  const rooms = new Map<string, ChatMessage[]>();
  const authors = new Map<string, string>();
  const reactions = new Map<
    string,
    { userId: string; name: string; emoji: string }[]
  >();
  let clock = 0;

  const find = (roomId: string, messageId: string): ChatMessage => {
    const message = rooms.get(roomId)?.find((item) => item.id === messageId);
    if (message === undefined)
      throw new RoomRefusal("not-found", "message introuvable dans ce salon");
    if (message.retracted !== undefined)
      throw new RoomRefusal("not-found", "ce message a été retiré");
    return message;
  };
  const replace = (roomId: string, next: ChatMessage): ChatMessage => {
    rooms.set(
      roomId,
      (rooms.get(roomId) ?? []).map((item) =>
        item.id === next.id ? next : item,
      ),
    );
    return next;
  };

  return {
    archive: async (roomId, draft) => {
      const target =
        draft.replyTo === undefined ? null : find(roomId, draft.replyTo);
      clock += 1;
      const message: ChatMessage = {
        id: `m${clock}`,
        author: draft.author,
        text: draft.text,
        sentAt: clock,
        ...(draft.attachments ? { attachments: draft.attachments } : {}),
        ...(target === null ? {} : { replyTo: replyRefOf(target.id, target) }),
      };
      authors.set(message.id, draft.authorId);
      rooms.set(roomId, [...(rooms.get(roomId) ?? []), message]);
      return message;
    },
    history: async (roomId, limit) => (rooms.get(roomId) ?? []).slice(-limit),
    // Pas de présence en mémoire : personne n'est jamais absent.
    absentMembers: async () => [],
    edit: async (roomId, messageId, authorId, text) => {
      const message = find(roomId, messageId);
      if (authors.get(messageId) !== authorId)
        throw new RoomRefusal(
          "forbidden",
          "seul son auteur modifie un message",
        );
      const problem = editProblem(text, (message.attachments?.length ?? 0) > 0);
      if (problem !== null) throw new RoomRefusal("invalid", problem);
      clock += 1;
      return replace(roomId, { ...message, text, editedAt: clock });
    },
    retract: async (roomId, messageId, userId) => {
      const message = find(roomId, messageId);
      const right = retractRight(
        authors.get(messageId) === userId,
        roles.get(`${roomId}:${userId}`) ?? null,
      );
      if (right === null)
        throw new RoomRefusal(
          "forbidden",
          "seuls son auteur et la modération du salon retirent un message",
        );
      reactions.delete(messageId);
      const {
        attachments = [],
        reactions: _gone,
        replyTo: _cited,
        ...rest
      } = message;
      replace(roomId, { ...rest, text: "", retracted: right });
      return {
        message: { ...rest, text: "", retracted: right },
        attachments,
      };
    },
    react: async (roomId, messageId, who, emojis): Promise<ChatReaction[]> => {
      find(roomId, messageId);
      const kept = (reactions.get(messageId) ?? []).filter(
        (row) => row.userId !== who.id || emojis.includes(row.emoji),
      );
      const had = new Set(
        kept.filter((row) => row.userId === who.id).map((row) => row.emoji),
      );
      const rows = [
        ...kept,
        ...emojis
          .filter((emoji) => !had.has(emoji))
          .map((emoji) => ({ userId: who.id, name: who.name, emoji })),
      ];
      reactions.set(messageId, rows);
      return summarizeReactions(rows);
    },
    forget: async (userId) => {
      const result: IForgotten = { attachments: [], frames: [] };
      for (const [roomId, list] of rooms) {
        const kept: ChatMessage[] = [];
        for (const message of list) {
          if (authors.get(message.id) !== userId) {
            const had = reactions.get(message.id) ?? [];
            const left = had.filter((row) => row.userId !== userId);
            if (left.length !== had.length) {
              reactions.set(message.id, left);
              result.frames.push({
                roomId,
                frame: {
                  kind: "reactions",
                  messageId: message.id,
                  reactions: summarizeReactions(left),
                },
              });
            }
            kept.push(message);
            continue;
          }
          reactions.delete(message.id);
          result.attachments.push(...(message.attachments ?? []));
          result.frames.push({
            roomId,
            frame: {
              kind: "message",
              message: {
                id: message.id,
                author: message.author,
                text: "",
                sentAt: message.sentAt,
                retracted: "author",
              },
            },
          });
        }
        rooms.set(roomId, kept);
      }
      return result;
    },
  };
}
