/**
 * La démo « MCP » — ce que le serveur et la page partagent : l'adresse de la
 * porte, les noms d'outils, les réglages de l'outil long et la forme d'une
 * ligne du fil en direct.
 *
 * Guide pour un agent : une porte MCP d'application vit sous `/mcp/<nom>`,
 * HORS de `/nodefony` (réservé au framework, dont la porte de développement
 * est `/nodefony/mcp`). La mécanique vient de `@nodefony/ai` (`defineMcpGate`,
 * aucune route) ; la porte est un contrôleur de l'application. Équivalent
 * généré : `npx nodefony create controller demo --kind mcp --expose mixte`.
 * Doc : `node_modules/@nodefony/ai/docs/mcp.md`.
 *
 * Des constantes et des TYPES seulement : la page n'embarque aucun code du
 * serveur.
 */
// #region mcp-shared
/** L'adresse de la porte MCP de la démo. */
export const MCP_GATE_PATH = "/mcp/demo";

/** Le guichet qui remet un jeton au visiteur CONNECTÉ (raccourci de la démo). */
export const MCP_TOKEN_PATH = "/demo/api/mcp/token";

/** Le scope qui ouvre l'outil réservé. Qui peut l'obtenir : `grantableScopes`. */
export const MCP_WRITE_SCOPE = "demo:write";

/** Les outils de la porte — jamais préfixés `nodefony_`, réservé au framework. */
export const MCP_TOOL_READ = "demo_chat_read";
export const MCP_TOOL_DIGEST = "demo_chat_digest";
export const MCP_TOOL_POST = "demo_chat_post";

/** Lecture du chat : messages rendus au plus par appel. */
export const CHAT_READ_MAX = 50;

/**
 * L'outil long : 8 lots de 400 ms. La progression est bornée à une
 * notification toutes les 100 ms (`MCP_PROGRESS_MIN_INTERVAL_MS`) : un lot
 * plus court ne se verrait pas.
 */
export const DIGEST_BATCHES = 8;
export const DIGEST_BATCH_MS = 400;

/** La révision du protocole que la page annonce. */
export const MCP_PROTOCOL_VERSION = "2026-07-28";

/** Le canal du fil en direct, sur la socket de la démo (`/demo/realtime`). */
export const DEMO_MCP_CHANNEL = "demo:mcp";
// #endregion

/**
 * Une ligne du fil : ce qu'un appel a fait, JAMAIS ses arguments — un agent
 * peut y passer ce qu'un autre visiteur n'a pas à lire.
 */
export interface IMcpFeedEntry {
  /** Instant de l'appel (ms depuis l'époque). */
  at: number;
  /** Méthode JSON-RPC (`tools/call`, `tools/list`…), `null` si illisible. */
  method: string | null;
  /** L'outil appelé, pour un `tools/call`. */
  tool: string | null;
  /** L'appelant présentait-il un jeton ? (le compte n'est connu que de l'outil) */
  caller: "anonyme" | "jeton";
  /** Durée de traitement, en millisecondes. */
  ms: number;
  /** Statut HTTP de la réponse. */
  status: number;
}

/** Ce que rend le guichet de jeton. */
export interface IMcpTokenResponse {
  /** Le compte porteur du jeton : le visiteur connecté. */
  account: string;
  accessToken: string;
  /** Durée de vie, en secondes. */
  expiresIn: number;
  /** L'audience du jeton : l'URI publique de la porte. */
  resource: string;
  /** Les scopes accordés — `demo:write` seulement si le rôle y donne droit. */
  scopes: string[];
}
