import { Controller, route, controller } from "@nodefony/framework";
import type { ContextType } from "@nodefony/http";
import type { FrontendService } from "@nodefony/frontend";

/**
 * Sert la page de l'app react. Le HTML ne vit PAS ici : c'est la
 * coquille `frontend/index.html` (TA page — meta, polices, externals), dans
 * laquelle `renderDocument` injecte les balises du framework au marqueur
 * `<!--nodefony:frontend-->` : entry Vite + HMR en dev, bundle fingerprinté
 * en prod, nonce CSP de la requête propagé aux `<script>`.
 *
 * L'hôte de la requête est propagé lui aussi : en développement, l'origine des
 * assets Vite suit le nom par lequel le client est arrivé (`127.0.0.1`, un nom
 * de machine, `host.docker.internal` depuis un conteneur…), sans rien à
 * configurer. Le scheme et le port restent ceux de Vite.
 */
@controller("")
class AppController extends Controller {
  constructor(context: ContextType) {
    super("app-front", context);
  }

  @route("route-app-index", { path: "/", method: "GET" })
  renderApp(): unknown {
    this.setContextHtml();
    const svc = this.context?.container?.get("frontend") as
      FrontendService | undefined;
    if (!svc) {
      return this.render("<!-- @nodefony/frontend not ready -->");
    }
    return this.render(
      // 3ᵉ argument = l'hôte par lequel le client est arrivé (`Context.domain`) :
      // en développement, l'origine des assets Vite le suit, si bien qu'un poste
      // et un conteneur (ou une machine distante) chargent la MÊME page sans
      // configuration. Sans lui, la page annonce toujours l'hôte du démarrage.
      svc.renderDocument(
        "nodefony",
        this.context?.cspNonce,
        this.context?.domain,
      ),
    );
  }
}

export default AppController;
