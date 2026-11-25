import { setTimeout as sleep } from "node:timers/promises";
import { RequestContext } from "nodefony";
import { mcpText, type IMcpTool } from "@nodefony/ai";
import { SendBody } from "../../frontend/src/chat/chatSchemas";
import {
  CHAT_READ_MAX,
  DIGEST_BATCHES,
  DIGEST_BATCH_MS,
  MCP_TOOL_DIGEST,
  MCP_TOOL_POST,
  MCP_TOOL_READ,
  MCP_WRITE_SCOPE,
} from "../../frontend/src/mcp/mcpDemo";
import { LOBBY_ROOM_ID } from "../../frontend/src/chat/rooms";
import {
  CHAT_HISTORY_LIMIT,
  MESSAGE_MAX_BYTES,
} from "../../frontend/src/chat/chatContract";
import type ChatService from "../service/ChatService";

/** Messages lus quand l'agent ne précise pas `limit`. */
const CHAT_READ_DEFAULT = 20;

/**
 * Les outils que la porte MCP de la démo offre à un agent — branchés sur le
 * chat : une lecture publique, une opération longue, une écriture réservée.
 *
 * Guide pour un agent : un outil est un objet `IMcpTool` (`@nodefony/ai`) —
 * un `name` stable, une `description` qui dit QUAND s'en servir, un
 * `inputSchema` (JSON Schema) qui borne les arguments, et des `annotations`
 * qui disent ce qu'il FAIT : c'est sur elles que le client de l'agent décide
 * de demander confirmation à l'humain. Un échec MÉTIER se rend par
 * `mcpText(message, true)`, que l'agent lit pour corriger son appel ; une
 * exception devient une erreur opaque (-32603), son détail reste au journal.
 * Guide : `node_modules/@nodefony/ai/docs/mcp.md`, « Écrire un outil ».
 *
 * @param chat - le salon (`ChatService`), le même que celui de la page Chat
 * @returns les trois outils, dans l'ordre où l'agent les découvre
 */
export function demoTools(chat: ChatService): IMcpTool[] {
  return [
    // #region mcp-tool-read
    {
      name: MCP_TOOL_READ,
      description:
        "Lit les derniers messages du chat de la démo. Lecture : à utiliser " +
        "pour savoir de quoi on parle avant d'écrire.",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "integer", minimum: 1, maximum: CHAT_READ_MAX },
        },
      },
      // Lecture pure, dans l'application : aucune confirmation utile.
      annotations: {
        title: "Lire le chat",
        readOnlyHint: true,
        openWorldHint: false,
      },
      handler: async (args) => {
        const limit = args.limit ?? CHAT_READ_DEFAULT;
        if (
          typeof limit !== "number" ||
          !Number.isInteger(limit) ||
          limit < 1 ||
          limit > CHAT_READ_MAX
        ) {
          // Échec MÉTIER : l'agent lit pourquoi, et rappelle avec une valeur juste.
          return mcpText(
            `\`limit\` est un entier de 1 à ${CHAT_READ_MAX} — rappelle avec une valeur dans cet intervalle`,
            true,
          );
        }
        const messages = (await chat.recent(LOBBY_ROOM_ID, limit)).map(
          ({ id, author, text, sentAt }) => ({ id, author, text, sentAt }),
        );
        return mcpText(JSON.stringify(messages));
      },
    },
    // #endregion
    // #region mcp-tool-digest
    {
      name: MCP_TOOL_DIGEST,
      description:
        "Parcourt l'historique du chat par lots et compte les messages par " +
        "auteur. Long : signale son avancement, s'arrête si l'agent abandonne.",
      inputSchema: { type: "object", properties: {} },
      annotations: {
        title: "Résumer le chat",
        readOnlyHint: true,
        openWorldHint: false,
      },
      // `run` porte l'annulation (le client a fermé le flux) et la progression
      // (une notification au plus toutes les 100 ms, sur le flux SSE).
      handler: async (_args, _caller, run) => {
        const history = await chat.recent(LOBBY_ROOM_ID, CHAT_HISTORY_LIMIT);
        const size = Math.ceil(history.length / DIGEST_BATCHES);
        const counts = new Map<string, number>();
        for (let batch = 1; batch <= DIGEST_BATCHES; batch += 1) {
          if (run?.signal.aborted === true) return mcpText("interrompu", true);
          await sleep(DIGEST_BATCH_MS);
          for (const { author } of history.slice(
            (batch - 1) * size,
            batch * size,
          )) {
            counts.set(author, (counts.get(author) ?? 0) + 1);
          }
          run?.progress(
            batch,
            DIGEST_BATCHES,
            `lot ${batch}/${DIGEST_BATCHES} parcouru`,
          );
        }
        const byAuthor = [...counts]
          .toSorted((a, b) => b[1] - a[1])
          .map(([author, count]) => `${author} ${count}`)
          .join(", ");
        return mcpText(
          `${history.length} message(s) en ${DIGEST_BATCHES} lots` +
            (byAuthor === "" ? "" : ` : ${byAuthor}`),
        );
      },
    },
    // #endregion
    // #region mcp-tool-post
    {
      name: MCP_TOOL_POST,
      description:
        "Écrit un message dans le chat de la démo, signé par le propriétaire " +
        "du jeton. Écriture : n'appeler que si l'humain l'a demandé.",
      inputSchema: {
        type: "object",
        // JSON Schema compte des CARACTÈRES : `maxLength` ne fait qu'écarter
        // l'évidence ; la borne en octets est celle de `SendBody`, rejouée.
        properties: {
          text: { type: "string", minLength: 1, maxLength: MESSAGE_MAX_BYTES },
        },
        required: ["text"],
      },
      // Il ÉCRIT, sans rien effacer ; deux appels donnent deux messages.
      annotations: {
        title: "Écrire dans le chat",
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      // Absent de `tools/list` sans ce scope ; et l'outil agit AU NOM du
      // propriétaire du jeton, retrouvé par la porte AVANT le handler.
      scopes: [MCP_WRITE_SCOPE],
      actsForUser: true,
      handler: async (args) => {
        // La règle du salon, la MÊME que la route d'envoi (`SendBody`).
        const parsed = SendBody.safeParse({ text: args.text });
        if (!parsed.success) {
          return mcpText(
            `\`text\` : non vide, au plus ${MESSAGE_MAX_BYTES} octets (UTF-8)`,
            true,
          );
        }
        const me = RequestContext.getAuthenticatedUser();
        if (me === null) {
          return mcpText(
            "aucun compte derrière ce jeton : rien n'est publié",
            true,
          );
        }
        await chat.publish(LOBBY_ROOM_ID, {
          authorId: me.id,
          author: me.identifier,
          text: parsed.data.text,
        });
        return mcpText(`publié dans le salon, signé ${me.identifier}`);
      },
    },
    // #endregion
  ];
}
