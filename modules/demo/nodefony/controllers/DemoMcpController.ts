import { Inject } from "nodefony";
import { route, controller, Controller } from "@nodefony/framework";
import type { RouteInput } from "@nodefony/framework";
import type { ContextType } from "@nodefony/http";
import { MCP_GATE_PATH } from "../../frontend/src/mcp/mcpDemo";
import type DemoMcpService from "../service/DemoMcpService";

/** La méthode JSON-RPC et l'outil d'un message reçu — rien d'autre n'en est lu. */
function describeCall(body: unknown): {
  method: string | null;
  tool: string | null;
} {
  if (typeof body !== "object" || body === null) {
    return { method: null, tool: null };
  }
  const method =
    "method" in body && typeof body.method === "string" ? body.method : null;
  const params = "params" in body ? body.params : undefined;
  const tool =
    method === "tools/call" &&
    typeof params === "object" &&
    params !== null &&
    "name" in params &&
    typeof params.name === "string"
      ? params.name
      : null;
  return { method, tool };
}

/**
 * La porte Model Context Protocol de la démo — `POST /mcp/demo` : celle par
 * laquelle un agent IA (Claude Code, Copilot, un agent métier) découvre et
 * appelle les outils du chat.
 *
 * Guide pour un agent : une porte MCP EST un contrôleur, une route et rien de
 * plus. Tout le protocole — négociation, catalogue, appel, progression sur
 * flux SSE, annulation, gardes d'origine, jeton — vit dans la porte que
 * définit `DemoMcpService` (`defineMcpGate`, `@nodefony/ai`). N'écris ici
 * aucune ligne de protocole ni aucun contrôle d'accès. Équivalent généré :
 * `npx nodefony create controller <nom> --kind mcp`.
 *
 * Elle vit sous `/mcp/<nom>`, hors de `/demo` et de sa zone de session : un
 * cookie n'y ouvre rien, seul un jeton le fait.
 *
 * ```bash
 * curl -sk https://localhost:5152/mcp/demo -H 'content-type: application/json' \
 *   -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
 * ```
 */
// #region mcp-controller
@controller(MCP_GATE_PATH)
class DemoMcpController extends Controller {
  constructor(
    context: ContextType,
    @Inject("DemoMcpService") private readonly demoMcp: DemoMcpService,
  ) {
    super("demo-mcp", context);
  }

  /**
   * `POST` sert un message MCP ; `GET` et `DELETE` répondent `405` — verbes
   * retirés par la révision `2026-07-28` du transport.
   */
  @route("demo-mcp", {
    path: "",
    requirements: { methods: ["POST", "GET", "DELETE"] },
    // Schéma VIDE : la porte valide elle-même la trame JSON-RPC, et répond
    // dans SON protocole, pas en 422.
    schema: {},
  })
  async mcp(input: RouteInput) {
    const started = performance.now();
    try {
      return await this.demoMcp.gate().serve(this, input.body);
    } finally {
      // Le fil en direct (`demo:mcp`) : la méthode, l'outil, la présence d'un
      // jeton, la durée, le statut — jamais les arguments. Rien n'est bâti
      // tant qu'aucune page ne regarde.
      if (this.demoMcp.watched)
        this.demoMcp.record({
          at: Date.now(),
          ...describeCall(input.body),
          caller:
            this.request?.headers.authorization === undefined
              ? "anonyme"
              : "jeton",
          ms: Math.round(performance.now() - started),
          status: this.response?.statusCode ?? 500,
        });
    }
  }
}
// #endregion

export default DemoMcpController;
