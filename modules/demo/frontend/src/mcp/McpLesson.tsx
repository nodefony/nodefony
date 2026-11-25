import { useState, type ReactNode } from "react";
import { docsVersion, docUrl, type IDemoAbout } from "../about";
import { LEVELS } from "../Catalogue";
import { LessonCode } from "../lesson/LessonCode";
import type { LessonFile } from "../lesson/lesson";
import {
  probeRequest,
  type IProbeChunk,
  type IProbeResult,
} from "../kit/probe";
import { StepsLesson, type ILessonStep } from "../kit/StepsLesson";
import {
  authServerMetadataRequest,
  authorizationServersOf,
  callTool,
  finalMessage,
  instructionsOf,
  mcpRequest,
  offersCodeFlow,
  progressOf,
  readMessages,
  readToken,
  resourceMetadataRequest,
  sameOriginServer,
  tokenRequest,
  toolText,
  toolsOf,
  type IRpcMessage,
  type IToolCard,
} from "./mcpClient";
import {
  DIGEST_BATCHES,
  DIGEST_BATCH_MS,
  MCP_GATE_PATH,
  MCP_PROTOCOL_VERSION,
  MCP_TOKEN_PATH,
  MCP_TOOL_DIGEST,
  MCP_TOOL_POST,
  MCP_TOOL_READ,
  type IMcpTokenResponse,
} from "./mcpDemo";
import { MCP_LESSON, type McpExcerpt } from "./mcpTabs";
import { useMcpFeed } from "./useMcpFeed";
import {
  AudienceTable,
  ChatBubbles,
  ConnectPanel,
  DiscoveryChain,
  ErrorPair,
  FeedTable,
  ProgressRun,
  ToolCards,
  type IAudienceRow,
  type IDiscovery,
  type IShownError,
  type ITimedProgress,
} from "./McpVisuals";

const SECURITY = "nodefony/config/security.ts" satisfies LessonFile;
const GATE = "nodefony/controllers/DemoMcpController.ts" satisfies LessonFile;
const DESK = "nodefony/controllers/McpTokenController.ts" satisfies LessonFile;
const SERVICE = "nodefony/service/DemoMcpService.ts" satisfies LessonFile;
const TOOLS = "nodefony/mcp/demoTools.ts" satisfies LessonFile;
const SHARED = "frontend/src/mcp/mcpDemo.ts" satisfies LessonFile;
const CLIENT = "frontend/src/mcp/mcpClient.ts" satisfies LessonFile;
const FEED = "frontend/src/mcp/useMcpFeed.ts" satisfies LessonFile;

/** L'annulation du geste 4 : le flux est fermé au milieu de l'outil. */
const CANCEL_AFTER_MS = 1500;

/** Ce que montre un geste. */
type McpShow =
  | "discover"
  | "call"
  | "errors"
  | "progress"
  | "reserved"
  | "traps"
  | "connect";

interface IMcpStep extends ILessonStep<McpExcerpt> {
  // Optionnel : `fields` reçoit un `ILessonStep`, qui doit rester assignable.
  shows?: McpShow;
}

/** Ce que le code des gestes remet à la page, pour les visuels. */
interface IMcpScreen {
  listed: (who: string, tools: readonly IToolCard[]) => void;
  instructions: (text: string | null) => void;
  read: (text: string | null) => void;
  error: (kind: IShownError["kind"], frame: unknown) => void;
  progress: (events: readonly ITimedProgress[], raw: string) => void;
  outcome: (text: string) => void;
  discovery: (patch: Partial<IDiscovery>) => void;
  token: (token: IMcpTokenResponse | null) => void;
  /** Le jeton obtenu au geste 5, s'il y en a un. */
  current: () => IMcpTokenResponse | null;
  /** Les serveurs que le document du geste 5 désigne. */
  servers: () => readonly string[];
  /** Celui que cette page peut lire : sur sa propre origine. */
  server: () => string | null;
}

/**
 * Envoie une requête préparée par le code client, et rend aussi les messages
 * JSON-RPC de la réponse — JSON ou flux SSE.
 */
async function exchange(
  request: Request,
  live: (chunks: readonly IProbeChunk[]) => void,
  onChunks?: (chunks: readonly IProbeChunk[]) => void,
): Promise<{ result: IProbeResult; messages: IRpcMessage[] }> {
  const result = await probeRequest(request, (chunks) => {
    live(chunks);
    onChunks?.(chunks);
  });
  return { result, messages: readMessages(result.body) };
}

/**
 * Les progressions d'un flux en cours, chacune datée par le morceau qui l'a
 * apportée.
 */
function timedProgress(chunks: readonly IProbeChunk[]): ITimedProgress[] {
  const events: ITimedProgress[] = [];
  let text = "";
  for (const chunk of chunks) {
    text += chunk.text;
    const seen = readMessages(text).flatMap((message) => {
      const progress = progressOf(message);
      return progress === null ? [] : [progress];
    });
    for (const progress of seen.slice(events.length)) {
      events.push({ ...progress, at: chunk.at });
    }
  }
  return events;
}

/** Le libellé d'un jeton dans le tableau des publics. */
function holder(token: IMcpTokenResponse): string {
  return `jeton de ${token.account} (${token.scopes.length === 0 ? "sans scope" : token.scopes.join(" ")})`;
}

/** Les sept gestes. */
function buildSteps(screen: IMcpScreen): readonly [IMcpStep, ...IMcpStep[]] {
  return [
    {
      id: "discover",
      short: "Découvrir",
      gesture: "tools/list",
      title: "Découvrir les outils, comme un agent",
      text: "Un agent ouvre l'échange par `initialize` — la porte y dit, en mots, à quoi elle sert — puis demande `tools/list`. Sans jeton : les outils publics, et eux seuls. Il choisit sur la description ; son client décide sur les annotations s'il doit demander confirmation à l'humain.",
      excerpts: [
        { file: SHARED, region: "mcp-shared" },
        { file: CLIENT, region: "client-rpc" },
        { file: TOOLS, region: "mcp-tool-read" },
      ],
      expect: "deux outils publics, l'outil réservé annoncé sans être listé",
      shows: "discover",
      calls: [
        {
          label: "initialize",
          verb: "POST",
          path: MCP_GATE_PATH,
          run: async (live) => {
            const { result, messages } = await exchange(
              mcpRequest("initialize", {
                protocolVersion: MCP_PROTOCOL_VERSION,
                capabilities: {},
                clientInfo: { name: "page-demo", version: "1" },
              }),
              live,
            );
            screen.instructions(instructionsOf(finalMessage(messages)));
            return result;
          },
        },
        {
          label: "tools/list, sans jeton",
          verb: "POST",
          path: MCP_GATE_PATH,
          run: async (live) => {
            const { result, messages } = await exchange(
              mcpRequest("tools/list"),
              live,
            );
            screen.listed("sans jeton", toolsOf(finalMessage(messages)));
            return result;
          },
        },
      ],
    },
    {
      id: "call",
      short: "Appeler",
      gesture: "tools/call",
      title: "Appeler un outil",
      text: "`tools/call`, le nom de l'outil et ses arguments. La réponse est un contenu TEXTE que l'agent relit ; la page le dessine en bulles, comme le chat dont il vient.",
      excerpts: [
        { file: CLIENT, region: "client-rpc" },
        { file: TOOLS, region: "mcp-tool-read" },
        { file: CLIENT, region: "client-read" },
      ],
      expect: "une réponse JSON, les derniers messages du salon",
      shows: "call",
      calls: [
        {
          label: "Lire les 5 derniers messages",
          verb: "POST",
          path: MCP_GATE_PATH,
          run: async (live) => {
            const { result, messages } = await exchange(
              callTool(MCP_TOOL_READ, { limit: 5 }),
              live,
            );
            screen.read(toolText(finalMessage(messages))?.text ?? null);
            return result;
          },
        },
      ],
    },
    {
      id: "errors",
      short: "Se tromper",
      gesture: "mcpText(…, true)",
      title: "Se tromper proprement",
      text: "Un échec MÉTIER est un résultat (`isError: true`) : l'agent lit pourquoi, et rappelle avec une valeur juste. Une faute d'appel — un outil qui n'existe pas — est une erreur JSON-RPC. Et une exception levée par l'outil reste opaque (-32603) : son détail part au journal du serveur, jamais à l'agent.",
      excerpts: [
        { file: TOOLS, region: "mcp-tool-read" },
        { file: CLIENT, region: "client-read" },
      ],
      expect: "isError : true ; -32602 outil inconnu",
      shows: "errors",
      calls: [
        {
          label: "limit : 500",
          verb: "POST",
          path: MCP_GATE_PATH,
          run: async (live) => {
            const { result, messages } = await exchange(
              callTool(MCP_TOOL_READ, { limit: 500 }),
              live,
            );
            screen.error("métier", finalMessage(messages)?.result);
            return result;
          },
        },
        {
          label: "Un nom d'outil mal écrit",
          verb: "POST",
          path: MCP_GATE_PATH,
          run: async (live) => {
            const { result, messages } = await exchange(
              callTool("demo_chat_raed", {}),
              live,
            );
            screen.error("protocole", finalMessage(messages)?.error);
            return result;
          },
        },
      ],
    },
    {
      id: "progress",
      short: "Outil long",
      gesture: "text/event-stream",
      title: "Un outil long : le flux SSE",
      text: `Sans jeton de progression, la porte attend la fin et répond en JSON. Avec \`_meta.progressToken\`, elle répond en flux SSE : ${DIGEST_BATCHES} notifications \`notifications/progress\` (un lot toutes les ${DIGEST_BATCH_MS} ms), puis la réponse qui ferme le flux. Fermer le flux, c'est annuler : l'outil le voit au lot suivant.`,
      excerpts: [
        { file: TOOLS, region: "mcp-tool-digest" },
        { file: CLIENT, region: "client-rpc" },
        { file: CLIENT, region: "client-read" },
      ],
      expect: "JSON ; un flux de 8 progressions ; un flux coupé à 1,5 s",
      shows: "progress",
      calls: [
        {
          label: "Sans progression : une réponse JSON",
          verb: "POST",
          path: MCP_GATE_PATH,
          run: async (live) => {
            screen.progress([], "");
            const { result, messages } = await exchange(
              callTool(MCP_TOOL_DIGEST, {}),
              live,
            );
            screen.outcome(
              `Réponse JSON après ${result.ms} ms, d'un seul bloc : ${toolText(finalMessage(messages))?.text ?? "—"}`,
            );
            return result;
          },
        },
        {
          label: "Avec progression : le flux SSE",
          verb: "SSE",
          path: MCP_GATE_PATH,
          run: async (live) => {
            screen.progress([], "");
            const { result, messages } = await exchange(
              callTool(MCP_TOOL_DIGEST, {}, { progressToken: "digest" }),
              live,
              (chunks) =>
                screen.progress(
                  timedProgress(chunks),
                  chunks.map((chunk) => chunk.text).join(""),
                ),
            );
            screen.outcome(
              `Flux fermé par la réponse finale : ${toolText(finalMessage(messages))?.text ?? "—"}`,
            );
            return result;
          },
        },
        {
          label: "Avec progression, fermée à 1,5 s",
          verb: "SSE",
          path: MCP_GATE_PATH,
          run: async (live) => {
            screen.progress([], "");
            const abort = new AbortController();
            const timer = setTimeout(() => abort.abort(), CANCEL_AFTER_MS);
            try {
              const { result } = await exchange(
                callTool(
                  MCP_TOOL_DIGEST,
                  {},
                  { progressToken: "digest-cancel", signal: abort.signal },
                ),
                live,
                (chunks) =>
                  screen.progress(
                    timedProgress(chunks),
                    chunks.map((chunk) => chunk.text).join(""),
                  ),
              );
              screen.outcome(
                abort.signal.aborted
                  ? `Flux fermé par la page à ${CANCEL_AFTER_MS} ms : l'outil s'arrête au lot suivant, et aucune réponse finale ne part.`
                  : "Le flux s'est terminé avant la coupure.",
              );
              return result;
            } finally {
              clearTimeout(timer);
            }
          },
        },
      ],
    },
    {
      id: "reserved",
      short: "Outil réservé",
      gesture: 'scopes: ["demo:write"]',
      title: "Un outil réservé, et le chemin du jeton",
      text: "L'outil qui ÉCRIT n'existe que pour un jeton qui porte `demo:write`. La page suit la chaîne qu'impose la norme à un agent : le document de la ressource (RFC 9728), puis celui du serveur d'autorisation (RFC 8414). Elle s'arrête là où l'émetteur s'arrête, et le dit. Le raccourci de la démo remet ensuite un jeton au visiteur connecté : un administrateur reçoit le scope, un utilisateur non.",
      excerpts: [
        { file: SECURITY, region: "mcp-area" },
        { file: SECURITY, region: "mcp-grant" },
        { file: TOOLS, region: "mcp-tool-post" },
        { file: CLIENT, region: "client-discover" },
        { file: DESK, region: "mcp-token-route" },
        { file: CLIENT, region: "client-token" },
      ],
      expect:
        "la chaîne lue ; un jeton ; l'outil réservé servi à l'administrateur",
      shows: "reserved",
      calls: [
        {
          label: "Lire le document de la ressource",
          verb: "GET",
          path: `/.well-known/oauth-protected-resource${MCP_GATE_PATH}`,
          run: async (live) => {
            const result = await probeRequest(resourceMetadataRequest(), live);
            const document = parseJson(result.body);
            const servers = authorizationServersOf(document);
            const own = sameOriginServer(servers, window.location.origin);
            screen.discovery({
              resource: document,
              server: undefined,
              codeFlow: null,
              others: servers.filter((server) => server !== own),
            });
            return result;
          },
        },
        {
          label: "Lire le serveur d'autorisation",
          verb: "GET",
          path: "/.well-known/oauth-authorization-server",
          blocked:
            screen.servers().length === 0
              ? "lis d'abord le document de la ressource"
              : screen.server() === null
                ? "aucun serveur sur l'origine de cette page"
                : null,
          run: async (live) => {
            const server = screen.server();
            if (server === null)
              throw new Error("serveur d'autorisation inconnu");
            const result = await probeRequest(
              authServerMetadataRequest(server),
              live,
            );
            const document = parseJson(result.body);
            // Pas de verdict sur une lecture échouée : un corps d'erreur ne dit
            // rien de ce que le serveur sait faire.
            screen.discovery({
              server: document,
              codeFlow: result.status === 200 ? offersCodeFlow(document) : null,
            });
            return result;
          },
        },
        {
          label: "Obtenir un jeton (raccourci de la démo)",
          verb: "POST",
          path: MCP_TOKEN_PATH,
          run: async (live) => {
            const result = await probeRequest(tokenRequest(), live);
            const token = readToken(result.body);
            screen.token(token);
            if (token !== null) {
              // Le jeton ne se montre pas : il reste dans la mémoire de la page.
              return {
                ...result,
                body: redact(result.body, token.accessToken),
              };
            }
            return result;
          },
        },
        {
          label: "tools/list avec ce jeton",
          verb: "POST",
          path: MCP_GATE_PATH,
          blocked:
            screen.current() === null ? "obtiens d'abord un jeton" : null,
          run: async (live) => {
            const token = screen.current();
            const { result, messages } = await exchange(
              mcpRequest("tools/list", undefined, {
                token: token?.accessToken ?? null,
              }),
              live,
            );
            if (token !== null) {
              screen.listed(holder(token), toolsOf(finalMessage(messages)));
            }
            return result;
          },
        },
        {
          label: "Écrire dans le chat",
          verb: "POST",
          path: MCP_GATE_PATH,
          blocked:
            screen.current() === null ? "obtiens d'abord un jeton" : null,
          run: async (live) => {
            const token = screen.current();
            const { result } = await exchange(
              callTool(
                MCP_TOOL_POST,
                { text: "Bonjour depuis l'agent de la page MCP" },
                { token: token?.accessToken ?? null },
              ),
              live,
            );
            return result;
          },
        },
      ],
    },
    {
      id: "traps",
      short: "Pièges",
      gesture: "anonymous: true",
      title: "Ce que la porte refuse, et comment elle le dit",
      text: "L'outil réservé, appelé sans jeton, n'EXISTE pas pour l'appelant : « outil inconnu », jamais un 403 qui trahirait sa présence. Un jeton refusé (expiré, autre audience) est servi comme un anonyme, jamais mieux, et le refus part au journal. Un `GET` reçoit 405 : la révision 2026-07-28 du transport ne sert que `POST`.",
      excerpts: [
        { file: SERVICE, region: "mcp-gate" },
        { file: GATE, region: "mcp-controller" },
      ],
      expect: "outil inconnu ; servi en anonyme ; 405",
      shows: "traps",
      calls: [
        {
          label: "L'outil réservé, sans jeton",
          verb: "POST",
          path: MCP_GATE_PATH,
          run: async (live) =>
            (
              await exchange(
                callTool(MCP_TOOL_POST, { text: "sans jeton" }),
                live,
              )
            ).result,
        },
        {
          label: "Un jeton invalide",
          verb: "POST",
          path: MCP_GATE_PATH,
          run: async (live) => {
            const { result, messages } = await exchange(
              mcpRequest("tools/list", undefined, { token: "jeton-invalide" }),
              live,
            );
            screen.listed("jeton invalide", toolsOf(finalMessage(messages)));
            return result;
          },
        },
        {
          label: "GET sur la porte",
          verb: "GET",
          path: MCP_GATE_PATH,
          run: (live) =>
            probeRequest(
              new Request(MCP_GATE_PATH, { cache: "no-store" }),
              live,
            ),
        },
      ],
    },
    {
      id: "connect",
      short: "Ton agent",
      gesture: "claude mcp add",
      title: "Brancher ton agent",
      text: "Deux portes : celle de développement (`/nodefony/mcp`, devkit) pour l'agent qui t'aide à coder, celle de l'application (`/mcp/demo`) pour les agents de tes utilisateurs. Copie la ligne, demande quelque chose à ton agent : son appel s'affiche dans le fil, en direct.",
      excerpts: [
        { file: GATE, region: "mcp-controller" },
        { file: SERVICE, region: "mcp-feed" },
        { file: FEED, region: "client-feed" },
      ],
      expect: "l'appel apparaît dans le fil",
      shows: "connect",
      calls: [
        {
          label: "Appeler la porte, comme un agent",
          verb: "POST",
          path: MCP_GATE_PATH,
          run: async (live) =>
            (await exchange(mcpRequest("tools/list"), live)).result,
        },
      ],
    },
  ];
}

/** Un corps JSON relu, ou le texte tel quel. */
function parseJson(body: string): unknown {
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

/** Le corps, le jeton remplacé par un marqueur. */
function redact(body: string, secret: string): string {
  return body.split(secret).join(`${secret.slice(0, 12)}…(gardé par la page)`);
}

/**
 * Page d'apprentissage « MCP » (`/demo/mcp`) : la page joue l'agent face à la
 * porte de la démo, puis montre comment brancher le sien.
 *
 * Guide pour un agent : la porte est `DemoMcpController.ts`, définie par
 * `DemoMcpService.ts` (`defineMcpGate`, `@nodefony/ai`) ; ses outils,
 * `nodefony/mcp/demoTools.ts` ; le code client de chaque geste,
 * `mcpClient.ts` ; le fil en direct, `useMcpFeed.ts` ; les visuels,
 * `McpVisuals.tsx`.
 */
export function McpLesson({ about }: { about: IDemoAbout | null }) {
  const version = docsVersion(about);
  const feed = useMcpFeed();
  const [audience, setAudience] = useState<readonly IAudienceRow[]>([]);
  const [tools, setTools] = useState<readonly IToolCard[]>([]);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [readText, setReadText] = useState<string | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<IShownError["kind"], unknown>>
  >({});
  const [progress, setProgress] = useState<{
    events: readonly ITimedProgress[];
    raw: string;
  }>({ events: [], raw: "" });
  const [outcome, setOutcome] = useState<string | null>(null);
  const [discovery, setDiscovery] = useState<IDiscovery>({
    resource: undefined,
    server: undefined,
    codeFlow: null,
    others: [],
  });
  const [token, setToken] = useState<IMcpTokenResponse | null>(null);

  const steps = buildSteps({
    listed: (who, listed) => {
      if (who === "sans jeton") setTools(listed);
      setAudience((rows) => [
        ...rows.filter((row) => row.who !== who),
        { who, tools: listed.map((tool) => tool.name) },
      ]);
    },
    instructions: setInstructions,
    read: setReadText,
    error: (kind, frame) =>
      setErrors((before) => ({ ...before, [kind]: frame })),
    progress: (events, raw) => {
      setProgress({ events, raw });
      if (events.length === 0 && raw === "") setOutcome(null);
    },
    outcome: setOutcome,
    discovery: (patch) => setDiscovery((before) => ({ ...before, ...patch })),
    token: setToken,
    current: () => token,
    servers: () => authorizationServersOf(discovery.resource),
    server: () =>
      sameOriginServer(
        authorizationServersOf(discovery.resource),
        window.location.origin,
      ),
  });

  // L'URI publique de la porte : celle que publie son document RFC 9728, ou
  // celle du jeton ; sinon l'adresse de cette page.
  const resource =
    token?.resource ??
    resourceOf(discovery.resource) ??
    `${window.location.origin}${MCP_GATE_PATH}`;

  const fields = (step: IMcpStep): ReactNode => {
    // Un visuel par nature de geste : la carte refuse d'en oublier un.
    const visuals: Record<McpShow, ReactNode> = {
      discover: <ToolCards tools={tools} instructions={instructions} />,
      call: <ChatBubbles text={readText} />,
      errors: <ErrorPair errors={errors} />,
      progress: (
        <ProgressRun
          events={progress.events}
          outcome={outcome}
          raw={progress.raw === "" ? null : progress.raw}
        />
      ),
      reserved: (
        <>
          <DiscoveryChain discovery={discovery} />
          <AudienceTable rows={audience} />
        </>
      ),
      traps: <AudienceTable rows={audience} />,
      connect: (
        <>
          <ConnectPanel resource={resource} />
          <FeedTable feed={feed} />
        </>
      ),
    };
    return step.shows === undefined ? null : visuals[step.shows];
  };

  return (
    <main className="lesson steps-page">
      <nav className="crumbs" aria-label="Fil d'Ariane">
        <a href="/demo">Démo</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">MCP</span>
      </nav>

      <header className="steps-head">
        <span className={`lvl ${LEVELS.advanced.className}`}>
          {LEVELS.advanced.label}
        </span>
        <h1>MCP — la porte d'entrée d'un agent</h1>
        <p>
          Un agent (Claude Code, Copilot, un agent métier) découvre les outils
          de ton application et les appelle par <strong>MCP</strong>. Ici, la
          page joue l'agent face à la porte <code>{MCP_GATE_PATH}</code> ; au
          dernier geste, tu branches le tien.
        </p>
        <aside className="codec-explain" aria-label="Une porte, deux publics">
          <h2>Une porte, deux publics</h2>
          <ol>
            <li>
              <strong>Sans jeton</strong>, l'appelant voit et appelle les outils
              publics : lire le chat, le résumer.
            </li>
            <li>
              Un outil qui porte un <strong>scope</strong> n'existe que pour un
              jeton qui le porte : absent de <code>tools/list</code>, « inconnu
              » à l'appel.
            </li>
            <li>
              Qui peut OBTENIR ce scope se décide dans{" "}
              <code>grantableScopes</code> : un administrateur, ici.
            </li>
          </ol>
          <p>
            <code>@nodefony/ai</code> fournit la mécanique (
            <code>defineMcpGate</code>, aucune route) ; la porte est un
            contrôleur de l'application, sous <code>/mcp/&lt;nom&gt;</code>.
          </p>
        </aside>
      </header>

      <StepsLesson
        steps={steps}
        label="Les sept gestes"
        prefix={MCP_GATE_PATH}
        fields={fields}
      />

      <details className="steps-more">
        <summary>La porte entière, et la page, couche par couche</summary>
        <LessonCode
          lesson={MCP_LESSON}
          doc={{
            href: docUrl(version, "modules/ai/mcp"),
            label: "Boîte à outils MCP — la doc complète",
          }}
        />
      </details>

      <section className="lesson-traps" aria-labelledby="lesson-traps-title">
        <div>
          <h2 id="lesson-traps-title" className="lesson-step">
            Les pièges
          </h2>
          <ul>
            <li>
              <strong>Une page web étrangère est refusée, deux fois.</strong> Un{" "}
              <code>POST</code> venu d'un autre site s'arrête d'abord à la garde
              CSRF du pare-feu ; et la porte elle-même n'admet que les origines
              de <code>allowedOrigins</code> — c'est ce qui ferme le DNS
              rebinding. Le navigateur interdit de forger l'en-tête{" "}
              <code>Origin</code> ; pour voir le 403 :{" "}
              <code>{foreignOriginCurl(resource)}</code>
            </li>
            <li>
              <strong>Cette page n'est admise qu'à l'adresse publique.</strong>{" "}
              La porte n'accepte que l'origine de <code>jwt.issuer</code> :
              ouverte à une autre adresse (<code>127.0.0.1</code> au lieu de{" "}
              <code>localhost</code>), la page reçoit 403 « origine refusée ».
            </li>
            <li>
              <strong>Un outil sans annotation est le pire cas.</strong> La
              norme le tient pour une écriture destructive vers l'extérieur : le
              client de l'agent demande confirmation à chaque appel.
            </li>
            <li>
              <strong>Une annotation n'autorise rien.</strong> L'accès se décide
              par <code>scopes</code>, et le scope par{" "}
              <code>grantableScopes</code>.
            </li>
            <li>
              <strong>Le raccourci n'est pas le flux normé.</strong> En
              production, un agent obtient son jeton d'un serveur d'autorisation
              par autorisation avec code (PKCE) — Keycloak le fait ; l'émetteur
              de l'application, pas encore.
            </li>
          </ul>
        </div>
        <aside className="further" aria-label="Pour aller plus loin">
          <h2 className="lesson-step">Pour aller plus loin</h2>
          <a href={docUrl(version, "modules/ai/mcp")}>
            Boîte à outils MCP — @nodefony/ai
          </a>
          <a href={docUrl(version, "modules/security/obtenir-un-jeton")}>
            Obtenir un jeton — @nodefony/security
          </a>
          <a href="/demo/chat">Le chat que les outils lisent et écrivent</a>
        </aside>
      </section>
    </main>
  );
}

/** La commande qui montre le refus d'une origine étrangère. */
function foreignOriginCurl(resource: string): string {
  return `curl -sk ${resource} -H 'origin: https://evil.example' -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`;
}

/** Le `resource` d'un document RFC 9728, s'il en porte un. */
function resourceOf(document: unknown): string | null {
  return typeof document === "object" &&
    document !== null &&
    "resource" in document &&
    typeof document.resource === "string"
    ? document.resource
    : null;
}
