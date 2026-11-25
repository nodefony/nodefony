import { Inject } from "nodefony";
import { route, controller, Controller, IsGranted } from "@nodefony/framework";
import { HttpError } from "@nodefony/http";
import type { ContextType } from "@nodefony/http";
import {
  PARTNER_TOKEN_PATH,
  type IPartnerTokenResponse,
} from "../../frontend/src/partner/partnerApi";
import { PARTNER_PATH } from "../config/security";
import type PartnerTokenService from "../service/PartnerTokenService";
import { PartnerTokenError } from "../service/PartnerTokenService";

/**
 * Le guichet de la page `/demo/partner` : il remet au visiteur CONNECTÉ un
 * jeton à son nom, valable cinq minutes, et pour la seule API partenaire.
 *
 * Guide pour un agent : cette route vit sous `/demo/api/token`, donc dans la
 * zone `demo` (session, puis anonyme) — PAS sous `/demo/api/partner`, que
 * seule la zone `demo-partner` du firewall couvre (un cookie n'y ouvre rien). `@IsGranted`
 * refuse le visiteur anonyme (403 : la zone lui donne une identité, sans
 * rôle) avant l'action ; le compte vient de `this.user`,
 * jamais d'un champ envoyé. L'émission elle-même est celle de la commande
 * `demo:partner:call` : `PartnerTokenService`.
 * Doc : `@nodefony/security/docs/obtenir-un-jeton.md`.
 */
@controller("")
class PartnerTokenController extends Controller {
  constructor(
    context: ContextType,
    @Inject("PartnerTokenService") private readonly tokens: PartnerTokenService,
  ) {
    super("partner-token", context);
  }

  // #region partner-token-route
  /** `POST /demo/api/token` — un jeton pour le visiteur connecté. */
  @route("demo-partner-token", { path: PARTNER_TOKEN_PATH, method: "POST" })
  @IsGranted(["ROLE_USER"])
  async issue() {
    const me = this.user;
    if (me === null) throw new HttpError("connexion requise", 401);
    try {
      const token = await this.tokens.issueFor(me.identifier);
      const answer: IPartnerTokenResponse = {
        ...token,
        whoamiPath: `${PARTNER_PATH}/whoami`,
      };
      return await this.renderJson(answer);
    } catch (error) {
      if (error instanceof PartnerTokenError) {
        throw new HttpError(`${error.message} → ${error.remedy}`, 503);
      }
      throw error;
    }
  }
  // #endregion
}

export default PartnerTokenController;
