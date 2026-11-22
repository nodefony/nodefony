import { jsonRpcRequest } from "nodefony/client";
import {
  MCP_GATE_PATH,
  MCP_PROTOCOL_VERSION,
  MCP_TOKEN_PATH,
  type IMcpTokenResponse,
} from "./mcpDemo";

/**
 * Le code CLIENT de la leçon MCP : ce qu'écrit un agent — ou une page qui en
 * joue le rôle — pour parler à une porte MCP. Chaque fonction PRÉPARE une
 * `Request` ; la page la passe à la sonde du kit (`probeRequest` de
 * `kit/probe.ts`), qui fait le `fetch` et lit le corps EN FLUX.
 *
 * Guide pour un agent : un `fetch` JSON-RPC sans SDK — le protocole reste
 * visible tel quel ; seule la frame se FABRIQUE (`jsonRpcRequest` de
 * `nodefony/client`, la même que le serveur emploie). Un vrai agent passe par son client MCP
 * (Claude Code : `claude mcp add --transport http …`). Les blocs
 * `// #region client-*` sont CITÉS par la page : les renommer casse le test
 * du module. Doc : `node_modules/@nodefony/ai/docs/mcp.md`.
 */

/** Un message JSON-RPC lu sur le fil : réponse, erreur ou notification. */
export interface IRpcMessage {
  id: number | string | null;
  /** Présent sur une notification (`notifications/progress`…). */
  method: string | null;
  params: unknown;
  result: unknown;
  error: { code: number; message: string } | null;
}

/** Un outil tel que l'agent le découvre, annotations lues. */
export interface IToolCard {
  name: string;
  title: string | null;
  description: string;
  readOnly: boolean | null;
  openWorld: boolean | null;
  destructive: boolean | null;
}

/** Une notification de progression. */
export interface IProgress {
  progress: number;
  total: number | null;
  message: string | null;
}

let lastId = 0;

// #region client-rpc
/** Ce qui accompagne un appel : le jeton, la progression, l'annulation. */
export interface IRpcOptions {
  /** Jeton d'accès, posé en `Authorization: Bearer` — absent : appel anonyme. */
  token?: string | null;
  /**
   * Demande la progression : la porte répond alors en flux SSE
   * (`text/event-stream`) si l'outil a quelque chose à dire en route.
   */
  progressToken?: string;
  /** Fermer le flux, c'est annuler : l'outil le voit au lot suivant. */
  signal?: AbortSignal;
}

/**
 * Un message JSON-RPC pour la porte. `Accept` annonce les DEUX formes de
 * réponse ; la porte choisit. `MCP-Protocol-Version` dit la révision parlée.
 */
export function mcpRequest(
  method: string,
  params?: Record<string, unknown>,
  options: IRpcOptions = {},
): Request {
  lastId += 1;
  const withMeta =
    options.progressToken === undefined
      ? params
      : { ...params, _meta: { progressToken: options.progressToken } };
  const headers = new Headers({
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    "mcp-protocol-version": MCP_PROTOCOL_VERSION,
  });
  if (options.token) headers.set("authorization", `Bearer ${options.token}`);
  return new Request(MCP_GATE_PATH, {
    method: "POST",
    headers,
    cache: "no-store",
    // `params` absent : `JSON.stringify` omet la clé du fil.
    body: JSON.stringify(jsonRpcRequest(lastId, method, withMeta)),
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  });
}

/** Appeler un outil : `tools/call`, son nom et ses arguments. */
export function callTool(
  name: string,
  args: Record<string, unknown>,
  options: IRpcOptions = {},
): Request {
  return mcpRequest("tools/call", { name, arguments: args }, options);
}
// #endregion

// #region client-read
/**
 * Les messages d'une réponse, quelle que soit sa forme : un objet JSON, ou un
 * flux SSE — des blocs `data: {…}` séparés par une ligne vide, la réponse
 * finale en dernier. Un bloc encore incomplet (flux en cours) est ignoré.
 */
export function readMessages(body: string): IRpcMessage[] {
  const trimmed = body.trim();
  if (trimmed.startsWith("{")) return parseMessage(trimmed);
  return trimmed.split(/\r?\n\r?\n/u).flatMap((block) => {
    const data = block
      .split(/\r?\n/u)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    return data === "" ? [] : parseMessage(data);
  });
}

/** Un message lu, ou rien si le texte n'en est pas un. */
function parseMessage(text: string): IRpcMessage[] {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return [];
  }
  if (typeof value !== "object" || value === null) return [];
  const id =
    "id" in value &&
    (typeof value.id === "number" || typeof value.id === "string")
      ? value.id
      : null;
  const method =
    "method" in value && typeof value.method === "string" ? value.method : null;
  const error =
    "error" in value &&
    typeof value.error === "object" &&
    value.error !== null &&
    "code" in value.error &&
    typeof value.error.code === "number" &&
    "message" in value.error &&
    typeof value.error.message === "string"
      ? { code: value.error.code, message: value.error.message }
      : null;
  return [
    {
      id,
      method,
      params: "params" in value ? value.params : undefined,
      result: "result" in value ? value.result : undefined,
      error,
    },
  ];
}
// #endregion

/** Un objet, ou `null`. */
function record(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return Object.fromEntries(Object.entries(value));
}

/** Un booléen, ou `null` s'il manque. */
function flag(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

/** La réponse finale d'un échange (celle qui porte un `id`). */
export function finalMessage(
  messages: readonly IRpcMessage[],
): IRpcMessage | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages.at(index);
    if (message?.method === null) return message;
  }
  return null;
}

/** Les outils d'une réponse à `tools/list`. */
export function toolsOf(message: IRpcMessage | null): IToolCard[] {
  const tools = record(message?.result)?.tools;
  if (!Array.isArray(tools)) return [];
  return tools.flatMap((tool: unknown) => {
    const entry = record(tool);
    if (entry === null || typeof entry.name !== "string") return [];
    const hints = record(entry.annotations);
    return [
      {
        name: entry.name,
        title: typeof hints?.title === "string" ? hints.title : null,
        description:
          typeof entry.description === "string" ? entry.description : "",
        readOnly: flag(hints?.readOnlyHint),
        openWorld: flag(hints?.openWorldHint),
        destructive: flag(hints?.destructiveHint),
      },
    ];
  });
}

/** Les `instructions` d'une réponse à `initialize`. */
export function instructionsOf(message: IRpcMessage | null): string | null {
  const text = record(message?.result)?.instructions;
  return typeof text === "string" ? text : null;
}

/** Le texte d'un résultat d'outil, et s'il signale un échec métier. */
export function toolText(
  message: IRpcMessage | null,
): { text: string; isError: boolean } | null {
  const result = record(message?.result);
  const content = result?.content;
  if (!Array.isArray(content)) return null;
  const text = content
    .map((part: unknown) => record(part)?.text)
    .filter((part): part is string => typeof part === "string")
    .join("\n");
  return { text, isError: result?.isError === true };
}

/** La progression d'une notification `notifications/progress`. */
export function progressOf(message: IRpcMessage): IProgress | null {
  if (message.method !== "notifications/progress") return null;
  const params = record(message.params);
  if (params === null || typeof params.progress !== "number") return null;
  return {
    progress: params.progress,
    total: typeof params.total === "number" ? params.total : null,
    message: typeof params.message === "string" ? params.message : null,
  };
}

// #region client-discover
/**
 * Le document de ressource protégée de la porte (RFC 9728) : l'adresse se
 * DÉRIVE de celle de la porte — `/.well-known/oauth-protected-resource`
 * inséré devant son chemin. Il nomme les serveurs d'autorisation et les
 * scopes à demander.
 */
export function resourceMetadataRequest(): Request {
  return new Request(`/.well-known/oauth-protected-resource${MCP_GATE_PATH}`, {
    cache: "no-store",
  });
}

/** Les serveurs d'autorisation que le document désigne, dans son ordre. */
export function authorizationServersOf(metadata: unknown): string[] {
  const servers = record(metadata)?.authorization_servers;
  if (!Array.isArray(servers)) return [];
  return servers.filter(
    (server: unknown): server is string => typeof server === "string",
  );
}

/**
 * Le serveur que CETTE PAGE peut lire : celui de sa propre origine — sa
 * politique de sécurité (`connect-src 'self'`) refuse les autres. Un agent,
 * lui, les interroge tous et retient celui qui délivre un jeton par code.
 *
 * @param servers - les serveurs du document
 * @param origin - l'origine de la page (`location.origin`)
 */
export function sameOriginServer(
  servers: readonly string[],
  origin: string,
): string | null {
  return (
    servers.find((server) => {
      try {
        return new URL(server).origin === origin;
      } catch {
        return false;
      }
    }) ?? null
  );
}

/**
 * Les métadonnées d'un serveur d'autorisation (RFC 8414) : le chemin bien
 * connu s'insère ENTRE l'origine et le chemin de l'émetteur.
 */
export function authServerMetadataRequest(issuer: string): Request {
  const url = new URL(issuer);
  const path = url.pathname.replace(/\/+$/u, "");
  return new Request(
    `${url.origin}/.well-known/oauth-authorization-server${path}`,
    { cache: "no-store" },
  );
}

/**
 * Ce serveur délivre-t-il un jeton par autorisation avec code, le flux que la
 * norme MCP fait suivre à un agent ? Il faut un `authorization_endpoint` ; et
 * `grant_types_supported`, s'il est écrit, doit contenir `authorization_code`
 * (absent, la RFC 8414 le sous-entend).
 */
export function offersCodeFlow(metadata: unknown): boolean {
  const fields = record(metadata);
  if (typeof fields?.authorization_endpoint !== "string") return false;
  const grants = fields.grant_types_supported;
  return !Array.isArray(grants) || grants.includes("authorization_code");
}
// #endregion

// #region client-token
/**
 * Le RACCOURCI de la démo : un jeton pour le visiteur connecté (le cookie de
 * session part tout seul, même origine). Un vrai agent ne passe pas par là.
 */
export function tokenRequest(): Request {
  return new Request(MCP_TOKEN_PATH, { method: "POST", cache: "no-store" });
}

/** Le jeton rendu par le guichet, ou `null` si la réponse n'en est pas un. */
export function readToken(body: string): IMcpTokenResponse | null {
  let value: unknown;
  try {
    value = JSON.parse(body);
  } catch {
    return null;
  }
  const fields = record(value);
  if (
    fields === null ||
    typeof fields.accessToken !== "string" ||
    typeof fields.account !== "string" ||
    typeof fields.resource !== "string" ||
    typeof fields.expiresIn !== "number" ||
    !Array.isArray(fields.scopes)
  ) {
    return null;
  }
  return {
    accessToken: fields.accessToken,
    account: fields.account,
    resource: fields.resource,
    expiresIn: fields.expiresIn,
    scopes: fields.scopes.filter(
      (scope: unknown): scope is string => typeof scope === "string",
    ),
  };
}
// #endregion
