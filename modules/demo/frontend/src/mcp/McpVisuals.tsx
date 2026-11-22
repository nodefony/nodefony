import { CopyLine } from "../kit/CopyLine";
import type { IMcpFeedRow } from "./useMcpFeed";
import type { IProgress, IToolCard } from "./mcpClient";

/**
 * Les visuels de la leçon MCP : ce que voit l'agent (ses outils), ce qu'il
 * reçoit (bulles, erreurs, progression), comment il trouve son jeton, et le
 * fil des appels que la porte reçoit.
 *
 * Guide pour un agent : des composants SANS état réseau — la leçon
 * (`McpLesson.tsx`) leur passe ce que le code client (`mcpClient.ts`) a lu
 * dans les réponses. Rien n'est inventé : chaque valeur vient d'une trame.
 */

/** Une trame JSON, telle qu'elle a voyagé. */
function Frame({
  value,
  tone,
}: {
  value: unknown;
  tone: "out" | "in" | "err";
}) {
  return (
    <pre className={`mcp-frame is-${tone}`}>
      {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
    </pre>
  );
}

/** Les pastilles d'un outil : ce qu'il fait, d'après SES annotations. */
function Hints({ tool }: { tool: IToolCard }) {
  return (
    <span className="mcp-hints">
      {tool.readOnly === null ? (
        <span className="pill mcp-pill is-danger">sans annotation</span>
      ) : tool.readOnly ? (
        <span className="pill mcp-pill is-read">lecture</span>
      ) : (
        <span className="pill mcp-pill is-write">écriture</span>
      )}
      {tool.openWorld === true ? (
        <span className="pill mcp-pill is-danger">vers l'extérieur</span>
      ) : tool.openWorld === false ? (
        <span className="pill mcp-pill">dans l'application</span>
      ) : null}
      {tool.readOnly === false && tool.destructive === false ? (
        <span className="pill mcp-pill">n'efface rien</span>
      ) : null}
    </span>
  );
}

/**
 * Le catalogue tel que l'agent le découvre : les `instructions` de la porte,
 * puis un outil par carte.
 *
 * @param tools - les outils de `tools/list`
 * @param instructions - les `instructions` de `initialize`
 */
export function ToolCards({
  tools,
  instructions,
}: {
  tools: readonly IToolCard[];
  instructions: string | null;
}) {
  if (tools.length === 0 && instructions === null) return null;
  return (
    <figure className="wire-figure mcp-tools">
      <figcaption>
        <strong>Ce que voit l'agent</strong> — il choisit sur la description, et
        son client décide sur les annotations s'il demande confirmation
      </figcaption>
      {instructions !== null && (
        <p className="mcp-instructions">
          <b>instructions</b> — {instructions}
        </p>
      )}
      <ul className="mcp-cards">
        {tools.map((tool) => (
          <li key={tool.name} className="mcp-card">
            <code className="mcp-name">{tool.name}</code>
            <span className="mcp-desc">{tool.description}</span>
            <Hints tool={tool} />
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Un message du chat tel que l'outil de lecture le rend. */
interface IReadMessage {
  author: string;
  text: string;
  sentAt: number;
}

/** Les messages du texte JSON qu'a rendu `demo_chat_read`. */
function readChat(text: string): IReadMessage[] {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return [];
  }
  if (!Array.isArray(value)) return [];
  return value.flatMap((item: unknown) =>
    typeof item === "object" &&
    item !== null &&
    "author" in item &&
    typeof item.author === "string" &&
    "text" in item &&
    typeof item.text === "string" &&
    "sentAt" in item &&
    typeof item.sentAt === "number"
      ? [{ author: item.author, text: item.text, sentAt: item.sentAt }]
      : [],
  );
}

/**
 * Le résultat d'un outil, dessiné : le texte qu'il a rendu, relu en bulles de
 * chat. L'agent, lui, lit le texte tel quel.
 *
 * @param text - le contenu texte du résultat
 */
export function ChatBubbles({ text }: { text: string | null }) {
  if (text === null) return null;
  const messages = readChat(text);
  return (
    <figure className="wire-figure">
      <figcaption>
        <strong>Le résultat, dessiné</strong> — l'outil rend du texte (ici du
        JSON), l'agent le lit tel quel
      </figcaption>
      {messages.length === 0 ? (
        <p className="mcp-empty">
          Le salon est vide : écris un message sur la page{" "}
          <a href="/demo/chat">Chat</a>, puis rappelle l'outil.
        </p>
      ) : (
        <div className="mcp-bubbles">
          {messages.map((message) => (
            <p
              key={`${message.sentAt}-${message.author}`}
              className="mcp-bubble"
            >
              <span className="mcp-meta">
                {message.author} ·{" "}
                {new Date(message.sentAt).toLocaleTimeString("fr-FR")}
              </span>
              {message.text}
            </p>
          ))}
        </div>
      )}
    </figure>
  );
}

/** Une erreur rendue, et la forme sous laquelle elle est arrivée. */
export interface IShownError {
  kind: "métier" | "protocole";
  frame: unknown;
}

/**
 * Deux façons de se tromper, côte à côte : l'échec MÉTIER, que l'agent lit et
 * corrige, et l'erreur de PROTOCOLE, qui ne lui apprend que l'appel fautif.
 *
 * @param errors - les erreurs reçues, par nature
 */
export function ErrorPair({
  errors,
}: {
  errors: Partial<Record<IShownError["kind"], unknown>>;
}) {
  const kinds: readonly IShownError["kind"][] = ["métier", "protocole"];
  const shown = kinds.filter((kind) => errors[kind] !== undefined);
  if (shown.length === 0) return null;
  return (
    <figure className="wire-figure mcp-errors">
      <figcaption>
        <strong>Se tromper proprement</strong> — un échec métier est un RÉSULTAT
        (<code>isError: true</code>), une faute d'appel est une erreur JSON-RPC
      </figcaption>
      <div className="mcp-two">
        {shown.map((kind) => (
          <div key={kind}>
            <span
              className={`pill mcp-pill ${kind === "métier" ? "is-write" : "is-danger"}`}
            >
              {kind === "métier"
                ? "échec métier · l'agent corrige"
                : "erreur de protocole"}
            </span>
            <Frame value={errors[kind]} tone="err" />
          </div>
        ))}
      </div>
    </figure>
  );
}

/** Une notification de progression reçue, et quand. */
export interface ITimedProgress extends IProgress {
  /** Millisecondes depuis l'envoi. */
  at: number;
}

/**
 * L'outil long, vu de l'agent : la barre suit les `notifications/progress`
 * du flux SSE ; la frise dit QUAND chacune est arrivée.
 *
 * @param events - les progressions reçues
 * @param outcome - comment l'échange s'est terminé
 * @param raw - les octets du flux, tels quels
 */
export function ProgressRun({
  events,
  outcome,
  raw,
}: {
  events: readonly ITimedProgress[];
  outcome: string | null;
  raw: string | null;
}) {
  if (events.length === 0 && outcome === null) return null;
  const last = events.at(-1);
  const total = last?.total ?? null;
  const ratio =
    last === undefined || total === null || total === 0
      ? 0
      : last.progress / total;
  return (
    <figure className="wire-figure mcp-progress">
      <figcaption>
        <strong>Le flux SSE</strong> — une notification au plus toutes les
        100&nbsp;ms, puis la réponse qui ferme le flux
      </figcaption>
      <div
        className="mcp-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total ?? 1}
        aria-valuenow={last?.progress ?? 0}
        aria-label="Avancement de l'outil"
      >
        <i style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
      <ol className="mcp-timeline">
        {events.map((event) => (
          <li key={`${event.at}-${event.progress}`}>
            <span className="mcp-at">{event.at}&nbsp;ms</span>
            <span>
              {event.progress}/{event.total ?? "?"}
              {event.message === null ? "" : ` · ${event.message}`}
            </span>
          </li>
        ))}
      </ol>
      {outcome !== null && <p className="mcp-outcome">{outcome}</p>}
      {raw !== null && raw.trim() !== "" && (
        <details>
          <summary>Les octets du flux</summary>
          <Frame value={raw} tone="in" />
        </details>
      )}
    </figure>
  );
}

/** Ce que la page a lu en suivant la chaîne de découverte. */
export interface IDiscovery {
  resource: unknown;
  server: unknown;
  /** L'émetteur délivre-t-il un jeton par code ? `null` : pas lu, ou pas lisible. */
  codeFlow: boolean | null;
  /**
   * Les autres serveurs annoncés, hors de l'origine de la page : un agent les
   * interroge, cette page ne le peut pas (`connect-src 'self'`).
   */
  others: readonly string[];
}

/**
 * La chaîne qu'un agent suit pour obtenir son jeton : le document de la
 * ressource (RFC 9728), puis celui du serveur d'autorisation (RFC 8414) — et
 * le verdict : la suite normée est-elle possible ?
 *
 * @param discovery - ce que les appels ont rendu
 */
export function DiscoveryChain({ discovery }: { discovery: IDiscovery }) {
  if (discovery.resource === undefined && discovery.server === undefined) {
    return null;
  }
  return (
    <figure className="wire-figure mcp-chain">
      <figcaption>
        <strong>La chaîne normée</strong> — ce qu'un agent lit pour savoir OÙ
        obtenir son jeton
      </figcaption>
      <ol>
        {discovery.resource !== undefined && (
          <li>
            <b>Document de la ressource protégée (RFC 9728)</b>
            <Frame value={discovery.resource} tone="in" />
            {discovery.others.length > 0 && (
              <p className="mcp-desc">
                Cette page ne lit que le serveur de sa propre origine (sa
                politique de sécurité refuse les autres). Un agent interroge
                aussi : {discovery.others.join(", ")}.
              </p>
            )}
          </li>
        )}
        {discovery.server !== undefined && (
          <li>
            <b>Métadonnées du serveur d'autorisation (RFC 8414)</b>
            <Frame value={discovery.server} tone="in" />
          </li>
        )}
        {discovery.codeFlow !== null && (
          <li className={discovery.codeFlow ? "is-ok" : "is-stop"}>
            {discovery.codeFlow ? (
              <b>
                Ce serveur délivre un jeton par autorisation avec code : un
                agent continue seul (PKCE, <code>resource</code>, consentement
                dans le navigateur).
              </b>
            ) : (
              <b>
                L'émetteur de l'application ne délivre pas de jeton par code.{" "}
                {discovery.others.length > 0
                  ? `Un agent essaie les ${discovery.others.length} autre(s) serveur(s) annoncé(s) ; s'aucun ne le fait, il s'arrête.`
                  : "Un agent conforme s'arrête ici."}{" "}
                En développement, le raccourci ci-dessous ; en production, un
                serveur d'autorisation comme Keycloak.
              </b>
            )}
          </li>
        )}
      </ol>
    </figure>
  );
}

/** Un appelant, et les outils que la porte lui a servis. */
export interface IAudienceRow {
  who: string;
  tools: readonly string[];
}

/**
 * Une porte, plusieurs publics : chaque appelant essayé, et les outils que
 * `tools/list` lui a rendus.
 *
 * @param rows - un appelant par ligne
 */
export function AudienceTable({ rows }: { rows: readonly IAudienceRow[] }) {
  if (rows.length === 0) return null;
  const all = [...new Set(rows.flatMap((row) => row.tools))];
  return (
    <figure className="wire-figure">
      <figcaption>
        <strong>Une porte, plusieurs publics</strong> — ce que{" "}
        <code>tools/list</code> a rendu à chacun
      </figcaption>
      <div className="mcp-scroll">
        <table className="mcp-table">
          <thead>
            <tr>
              <th scope="col">Appelant</th>
              {all.map((name) => (
                <th key={name} scope="col">
                  <code>{name}</code>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.who}>
                <th scope="row">{row.who}</th>
                {all.map((name) =>
                  row.tools.includes(name) ? (
                    <td key={name} className="is-served">
                      servi
                    </td>
                  ) : (
                    <td key={name} className="is-absent">
                      absent
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/**
 * Brancher son agent : les deux portes, et les commandes à taper.
 *
 * @param resource - l'URI publique de la porte de la démo
 */
export function ConnectPanel({ resource }: { resource: string }) {
  return (
    <figure className="wire-figure mcp-connect">
      <figcaption>
        <strong>Deux portes, deux usages</strong>
      </figcaption>
      <div className="mcp-two">
        <div className="mcp-door">
          <span className="pill mcp-pill is-write">développement</span>
          <code className="mcp-name">/nodefony/mcp</code>
          <span className="mcp-desc">
            La porte de <code>@nodefony/devkit</code>, chargée en développement
            seulement : les outils <code>nodefony_*</code> (inspecter, observer,
            profiler) et ceux de l'application.
          </span>
        </div>
        <div className="mcp-door">
          <span className="pill mcp-pill is-read">application</span>
          <code className="mcp-name">/mcp/demo</code>
          <span className="mcp-desc">
            La porte de cette leçon, mixte : ce que tes utilisateurs et leurs
            agents atteindront.
          </span>
        </div>
      </div>
      <p className="mcp-label">
        Brancher Claude Code sur cette porte, en trois étapes
      </p>
      <ol className="mcp-steps">
        <li>
          <strong>Obtenir un jeton.</strong> L'application le signe elle-même
          avec sa clé : ni mot de passe, ni appel réseau.
          <CopyLine
            text={`npx nodefony security:mcp:token admin --resource ${resource} --scope demo:write --ttl 480`}
          />
          <span className="mcp-desc">
            <code>admin</code> est le compte qui porte le jeton.{" "}
            <code>--resource</code> fixe son audience : cette porte, sinon elle
            le refuse (RFC 8707). <code>--scope demo:write</code> demande
            l'écriture, que <code>grantableScopes</code> réserve à{" "}
            <code>ROLE_ADMIN</code> — le compte <code>user</code> reçoit un
            jeton sans. <code>--ttl 480</code> le fait vivre 8 h. La commande
            l'affiche seul, sur sa ligne : copie la valeur, celle qui commence
            par <code>eyJ</code>.
          </span>
        </li>
        <li>
          <strong>Le donner à Claude Code</strong>, qui le posera dans l'en-tête
          de chaque appel.
          <CopyLine
            text={`claude mcp add --transport http nodefony-demo ${resource} --header "Authorization: Bearer <colle le jeton ici>"`}
          />
          <span className="mcp-desc">
            Déjà ajouté, sans jeton ou avec un jeton expiré ? Retire-le d'abord
            : <code>claude mcp remove nodefony-demo</code>.
          </span>
        </li>
        <li>
          <strong>Recharger.</strong> Une session déjà ouverte ne voit pas un
          serveur ajouté : tape <code>/mcp</code>, choisis{" "}
          <code>nodefony-demo</code>, puis Reconnect. Demande ensuite à ton
          agent « lis les derniers messages du salon de démo » : son appel
          s'affiche dans le fil ci-dessous, appelant « jeton ».
        </li>
      </ol>
      <p className="mcp-label">
        Les étapes 1 et 2 d'une seule ligne (bash, zsh)
      </p>
      <CopyLine
        text={`claude mcp add --transport http nodefony-demo ${resource} --header "Authorization: Bearer $(npx nodefony security:mcp:token admin --resource ${resource} --scope demo:write --ttl 480 --json | node -p 'JSON.parse(fs.readFileSync(0, "utf8")).access_token')"`}
      />
      <p className="mcp-desc">
        <code>--write</code> est refusé pour cette porte : il remplacerait{" "}
        <code>NF_MCP_TOKEN</code>, le jeton de la porte de développement, par
        celui-ci — qu'elle refuse, son audience est une autre porte. Ses outils
        réservés disparaîtraient sans un mot. À l'échéance des 8 h,{" "}
        <code>demo_chat_post</code> quitte la liste : refais les étapes 1 et 2.
      </p>
    </figure>
  );
}

/**
 * Le fil en direct : chaque appel reçu par la porte, de la page ou d'un
 * agent branché ailleurs.
 *
 * @param feed - les lignes reçues, la plus récente en tête
 */
export function FeedTable({ feed }: { feed: readonly IMcpFeedRow[] }) {
  return (
    <figure className="wire-figure">
      <figcaption>
        <strong>Appels reçus par la porte, en direct</strong> — jamais leurs
        arguments
      </figcaption>
      {feed.length === 0 ? (
        <p className="mcp-empty">
          Rien encore : lance l'appel ci-dessous, ou demande quelque chose à ton
          agent.
        </p>
      ) : (
        <div className="mcp-scroll">
          <table className="mcp-table">
            <thead>
              <tr>
                <th scope="col">Heure</th>
                <th scope="col">Appel</th>
                <th scope="col">Appelant</th>
                <th scope="col">Durée</th>
                <th scope="col">Statut</th>
              </tr>
            </thead>
            <tbody>
              {feed.map((entry) => (
                <tr key={entry.seq}>
                  <td>{new Date(entry.at).toLocaleTimeString("fr-FR")}</td>
                  <td>
                    <code>{entry.tool ?? entry.method ?? "illisible"}</code>
                  </td>
                  <td>{entry.caller}</td>
                  <td>{entry.ms}&nbsp;ms</td>
                  <td
                    className={entry.status < 400 ? "is-served" : "is-refused"}
                  >
                    {entry.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}
