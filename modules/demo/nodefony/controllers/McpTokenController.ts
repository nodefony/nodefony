import { Inject } from "nodefony";
import { route, controller, Controller, IsGranted } from "@nodefony/framework";
import { HttpError } from "@nodefony/http";
import type { ContextType } from "@nodefony/http";
import {
  MCP_TOKEN_PATH,
  MCP_WRITE_SCOPE,
  type IMcpTokenResponse,
} from "../../frontend/src/mcp/mcpDemo";
import { MCP_AREA } from "../config/security";
import type PartnerTokenService from "../service/PartnerTokenService";
import { PartnerTokenError } from "../service/PartnerTokenService";

/**
 * Le RACCOURCI de la leçon MCP : il remet au visiteur CONNECTÉ un jeton à son
 * nom, pour la seule porte `/mcp/demo`, en demandant le scope `demo:write`.
 *
 * Guide pour un agent : ce n'est PAS le chemin d'un vrai agent. La norme MCP
 * lui fait suivre le document RFC 9728 de la porte jusqu'au serveur
 * d'autorisation, puis obtenir son jeton par autorisation avec code (PKCE) —
 * ce que fait Keycloak, et pas encore l'émetteur de l'application (#244). En
 * développement, un agent reçoit son jeton de
 * `npx nodefony security:mcp:token <compte> --resource <porte> --scope demo:write --json`,
 * posé dans l'en-tête de l'agent — jamais `--write`, qui remplacerait
 * `NF_MCP_TOKEN`, le jeton de la porte de développement (autre audience).
 *
 * L'émetteur ne garde que les scopes que `grantableScopes` ouvre au rôle du
 * compte : un administrateur reçoit `demo:write`, un utilisateur un jeton
 * SANS lui — et l'outil réservé lui reste invisible. Même émission que l'API
 * partenaire : `PartnerTokenService`.
 */
@controller("")
class McpTokenController extends Controller {
  constructor(
    context: ContextType,
    @Inject("PartnerTokenService") private readonly tokens: PartnerTokenService,
  ) {
    super("mcp-token", context);
  }

  // #region mcp-token-route
  /** `POST /demo/api/mcp/token` — un jeton pour la porte, au nom du visiteur. */
  @route("demo-mcp-token", { path: MCP_TOKEN_PATH, method: "POST" })
  @IsGranted(["ROLE_USER"])
  async issue() {
    const me = this.user;
    if (me === null) throw new HttpError("connexion requise", 401);
    try {
      const issued = await this.tokens.issueFor(me.identifier, MCP_AREA, [
        MCP_WRITE_SCOPE,
      ]);
      const token: IMcpTokenResponse = { ...issued, account: me.identifier };
      return await this.renderJson(token);
    } catch (error) {
      if (error instanceof PartnerTokenError) {
        throw new HttpError(`${error.message} → ${error.remedy}`, 503);
      }
      throw error;
    }
  }
  // #endregion
}

export default McpTokenController;
