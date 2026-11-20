import type { ILesson, LessonFile } from "../lesson/lesson";

/**
 * MCP, couche par couche — la zone et le scope (sécurité), la porte et le
 * guichet (contrôleurs), la définition de la porte et ses outils (service),
 * puis le code client que la page fait tourner (modèle commun :
 * `lesson/lesson.ts`). Les gestes de la page citent les mêmes régions.
 */

const SECURITY: LessonFile = "nodefony/config/security.ts";
const GATE: LessonFile = "nodefony/controllers/DemoMcpController.ts";
const DESK: LessonFile = "nodefony/controllers/McpTokenController.ts";
const SERVICE: LessonFile = "nodefony/service/DemoMcpService.ts";
const TOOLS: LessonFile = "nodefony/mcp/demoTools.ts";
const SHARED: LessonFile = "frontend/src/mcp/mcpDemo.ts";
const CLIENT: LessonFile = "frontend/src/mcp/mcpClient.ts";
const FEED: LessonFile = "frontend/src/mcp/useMcpFeed.ts";

export const MCP_LESSON = {
  tabs: [
    {
      layer: "security",
      blocks: [
        {
          text: "La RESSOURCE de la porte, écrite comme un chemin dans une zone : security la rend absolue contre `jwt.issuer`, et l'application peut alors émettre un jeton pour elle. La zone n'authentifie personne : la porte juge le jeton elle-même.",
          excerpt: { file: SECURITY, region: "mcp-area" },
        },
        {
          text: "Qui peut OBTENIR le scope de l'outil réservé : un administrateur. Les autres comptes reçoivent un jeton sans lui.",
          excerpt: { file: SECURITY, region: "mcp-grant" },
        },
      ],
    },
    {
      layer: "controller",
      blocks: [
        {
          text: "La porte EST un contrôleur : une route, et rien d'autre. Tout le protocole vit dans la porte définie par le service ; la route note seulement chaque appel pour le fil en direct.",
          excerpt: { file: GATE, region: "mcp-controller" },
        },
        {
          text: "Le raccourci de la démo : un jeton pour le visiteur connecté, d'audience la porte. Un vrai agent suit la chaîne normée, ou reçoit son jeton de `security:mcp:token`.",
          excerpt: { file: DESK, region: "mcp-token-route" },
        },
      ],
    },
    {
      layer: "service",
      blocks: [
        {
          text: "La porte, définie au premier usage par `defineMcpGate` (`@nodefony/ai`) : mixte, ouverte à la seule origine de l'application, annonçant son serveur d'autorisation. Son document RFC 9728 se publie par `publishedProtectedResources()`.",
          excerpt: { file: SERVICE, region: "mcp-gate" },
        },
        {
          text: "Une lecture : description qui dit QUAND s'en servir, schéma qui borne `limit`, annotations qui disent qu'elle ne modifie rien. Un argument hors bornes est un échec MÉTIER, que l'agent lit.",
          excerpt: { file: TOOLS, region: "mcp-tool-read" },
        },
        {
          text: "Un outil LONG : `run.progress` alimente le flux SSE, `run.signal` dit que l'agent a fermé le flux.",
          excerpt: { file: TOOLS, region: "mcp-tool-digest" },
        },
        {
          text: "Une écriture RÉSERVÉE (`scopes`), qui agit au nom du propriétaire du jeton (`actsForUser`) et passe par la même règle que la route d'envoi du chat.",
          excerpt: { file: TOOLS, region: "mcp-tool-post" },
        },
        {
          text: "Le fil en direct : rien n'est bâti tant qu'aucune page ne regarde, et un appelant qui inonde la porte n'inonde pas les pages.",
          excerpt: { file: SERVICE, region: "mcp-feed" },
        },
      ],
    },
    {
      layer: "front",
      blocks: [
        {
          text: "L'adresse de la porte, les noms d'outils et les réglages de l'outil long, écrits UNE fois et importés des deux côtés.",
          excerpt: { file: SHARED, region: "mcp-shared" },
        },
        {
          text: "Un message JSON-RPC, préparé à la main : `Accept` annonce JSON et SSE, la porte choisit.",
          excerpt: { file: CLIENT, region: "client-rpc" },
        },
        {
          text: "Lire la réponse, qu'elle soit un objet JSON ou un flux d'événements `data:`.",
          excerpt: { file: CLIENT, region: "client-read" },
        },
        {
          text: "La chaîne normée : le document de la ressource, puis celui du serveur d'autorisation, et le verdict.",
          excerpt: { file: CLIENT, region: "client-discover" },
        },
        {
          text: "Le raccourci : demander un jeton au guichet de la démo, avec le cookie de session.",
          excerpt: { file: CLIENT, region: "client-token" },
        },
        {
          text: "Le fil en direct, par la socket de la démo : s'abonner allume la diffusion.",
          excerpt: { file: FEED, region: "client-feed" },
        },
      ],
    },
  ],
  decorators: [
    {
      name: "controller",
      from: "@nodefony/framework",
      role: "déclare le contrôleur et préfixe toutes ses routes.",
      file: GATE,
      region: "mcp-controller",
    },
    {
      name: "Inject",
      from: "nodefony",
      role: "fournit un service par son nom au constructeur.",
      file: GATE,
      region: "mcp-controller",
    },
    {
      name: "route",
      from: "@nodefony/framework",
      role: "la route de la porte — `POST`, et `GET`/`DELETE` pour leur répondre 405.",
      file: GATE,
      region: "mcp-controller",
    },
    {
      name: "IsGranted",
      from: "@nodefony/framework",
      role: "exige des rôles avant l'action : 401 sans identité, 403 quand l'identité ne les porte pas — l'anonyme d'une zone `anonymous` compris.",
      file: DESK,
      region: "mcp-token-route",
    },
  ],
  decoratedFiles: [GATE, DESK],
} as const satisfies ILesson;

/** Un extrait que la leçon cite : un geste qui en citerait un autre ne compile pas. */
export type McpExcerpt =
  (typeof MCP_LESSON.tabs)[number]["blocks"][number]["excerpt"];
