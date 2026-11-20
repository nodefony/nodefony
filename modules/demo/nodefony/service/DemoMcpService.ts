import { Service, Module, injectable } from "nodefony";
import type { IProtectedResourceInput } from "nodefony";
import { defineMcpGate, type IMcpGate } from "@nodefony/ai";
import { TokenService } from "@nodefony/security";
import type { IMcpFeedEntry } from "../../frontend/src/mcp/mcpDemo";
import { MCP_AREA } from "../config/security";
import { demoTools } from "../mcp/demoTools";
import ChatService from "./ChatService";
import PartnerTokenService, {
  PARTNER_TOKEN_SERVICE,
  PartnerTokenError,
} from "./PartnerTokenService";

/** Clé d'INSTANCE du service dans le conteneur. */
export const DEMO_MCP_SERVICE = "demoMcp";

/** Lignes du fil publiées au plus par seconde : au-delà, elles sont comptées, pas envoyées. */
export const MCP_FEED_MAX_PER_S = 10;

/**
 * La porte MCP de la démo (`/mcp/demo`) et son fil en direct (`demo:mcp`).
 *
 * Guide pour un agent : une porte d'APPLICATION se définit d'ordinaire une
 * fois, au chargement (`defineMcpGate` dans `nodefony/mcp/<nom>-gate.ts`,
 * forme de `npx nodefony create controller <nom> --kind mcp`), avec son
 * adresse publique écrite depuis `env.ts`. La démo est un MODULE : elle ne
 * lit pas l'environnement de l'application. Elle écrit donc le CHEMIN de sa
 * ressource dans une zone (`demo-mcp`, `../config/security.ts`), que le
 * firewall rend absolue contre `jwt.issuer` — et définit la porte au premier
 * usage, quand cette adresse est connue. Ce que la définition décide :
 *  • MIXTE (`anonymous: true`) : sans jeton, les outils publics ; un outil à
 *    `scopes` n'existe que pour un jeton qui les porte ;
 *  • `allowedOrigins` : la seule page web admise est celle de l'application
 *    (son adresse publique) — sans elle, la page de la démo reçoit 403, et
 *    l'admettre d'après l'en-tête `Host` rouvrirait le DNS rebinding ;
 *  • `allowRemote` : un agent d'une autre machine peut appeler ; c'est le
 *    jeton qui protège l'outil réservé, plus l'adresse.
 */
@injectable()
class DemoMcpService extends Service {
  #gate: IMcpGate | null = null;
  #publish: ((entry: IMcpFeedEntry) => void) | null = null;
  #windowStart = 0;
  #windowCount = 0;

  /**
   * @param module - le module qui le déclare ; absent dans un test, qui le
   *   construit sans kernel
   */
  constructor(module?: Module) {
    super(
      DEMO_MCP_SERVICE,
      module?.container ?? undefined,
      module?.notificationsCenter,
    );
  }

  // #region mcp-gate
  /**
   * La porte, définie au premier usage — validée à ce moment-là : une
   * définition fautive lève une `BootConfigurationError` qui la nomme.
   *
   * @throws PartnerTokenError si l'application n'émet pas de jetons ou si la
   *   zone `demo-mcp` est absente
   */
  gate(): IMcpGate {
    if (this.#gate !== null) return this.#gate;
    const tokens = this.get<unknown>(PARTNER_TOKEN_SERVICE);
    const issuer = this.get<unknown>("tokenService");
    const chat = this.get<unknown>("chat");
    if (
      !(tokens instanceof PartnerTokenService) ||
      !(chat instanceof ChatService)
    ) {
      throw new PartnerTokenError(
        "services de la démo absents du conteneur.",
        "le module demo est-il chargé ? npx nodefony inspect modules",
      );
    }
    const published =
      issuer instanceof TokenService ? issuer.publishedIssuer() : null;
    if (published === null) {
      throw new PartnerTokenError(
        "cette application ne publie pas d'émetteur de jetons : la porte mixte n'a pas de serveur d'autorisation à annoncer.",
        "pose jwt.issuer à une URL https (NF_JWT_ISSUER) dans nodefony/config/security.ts",
      );
    }
    // L'URI absolue de la porte : la ressource de la zone, rendue par le firewall.
    const resource = tokens.resource(MCP_AREA);
    this.#gate = defineMcpGate({
      name: "demo",
      instructions:
        "Outils de la démo, branchés sur son chat. Appelle `demo_chat_read` " +
        "pour voir de quoi on parle avant d'écrire.",
      tools: demoTools(chat),
      allowRemote: true,
      allowedOrigins: [new URL(resource).origin],
      authorization: {
        authorizationServers: [published],
        resource,
        anonymous: true,
      },
    });
    return this.#gate;
  }

  /**
   * Le document de ressource protégée (RFC 9728) de la porte : `@nodefony/framework`
   * le monte pour tout service qui expose cette méthode. Sans lui, un agent
   * apprendrait qu'un outil est réservé sans savoir où obtenir son jeton.
   */
  publishedProtectedResources(): readonly IProtectedResourceInput[] {
    try {
      return this.gate().protectedResources();
    } catch (error) {
      this.log(
        `porte MCP de la démo non publiée : ${error instanceof Error ? error.message : String(error)}`,
        "WARNING",
      );
      return [];
    }
  }
  // #endregion

  // #region mcp-feed
  /** Une page regarde-t-elle le fil ? Sinon, l'appelant ne bâtit pas la ligne. */
  get watched(): boolean {
    return this.#publish !== null;
  }

  /**
   * Branche la diffusion du fil — au premier abonné de `demo:mcp`.
   *
   * @param publish - publie une ligne sur le canal
   * @returns le détachement, à appeler au départ du dernier abonné
   */
  attach(publish: (entry: IMcpFeedEntry) => void): () => void {
    this.#publish = publish;
    return () => {
      this.#publish = null;
    };
  }

  /**
   * Note un appel reçu par la porte. Rien n'est alloué tant que personne ne
   * regarde ; au-delà de {@link MCP_FEED_MAX_PER_S} lignes par seconde, les
   * suivantes ne partent pas : un appelant qui inonde la porte n'inonde pas
   * aussi chaque page ouverte.
   */
  record(entry: IMcpFeedEntry): void {
    if (this.#publish === null) return;
    const second = Math.floor(entry.at / 1000);
    if (second !== this.#windowStart) {
      this.#windowStart = second;
      this.#windowCount = 0;
    }
    this.#windowCount += 1;
    if (this.#windowCount > MCP_FEED_MAX_PER_S) return;
    this.#publish(entry);
  }
  // #endregion
}

export default DemoMcpService;
