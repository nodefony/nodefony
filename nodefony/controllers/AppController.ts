import { Controller, route, controller } from "@nodefony/framework";
import type { ContextType } from "@nodefony/http";
import { FrontendService } from "@nodefony/frontend";

/** L'entry Vite de cette page (`frontend.entries`). */
const ENTRY_NAME = "nodefony";

/**
 * Sert la page de l'app react. Le HTML ne vit PAS ici : c'est la
 * coquille `frontend/index.html` (TA page — meta, polices, externals), dans
 * laquelle `renderDocument` injecte les balises du framework au marqueur
 * `<!--nodefony:frontend-->` : entry Vite + HMR en dev, bundle fingerprinté
 * en prod, nonce CSP de la requête propagé aux `<script>`.
 *
 * En développement, les balises vers Vite sont relatives à la page
 * (`/_vite/<famille>/…`, relayées par Nodefony) : `127.0.0.1`, un nom de
 * machine ou `host.docker.internal` depuis un conteneur chargent la même page,
 * sans rien à configurer — une seule origine, un seul certificat.
 */
@controller("")
class AppController extends Controller {
  constructor(context: ContextType) {
    super("app-front", context);
  }

  @route("route-app-index", { path: "/", method: "GET" })
  renderApp(): unknown {
    this.setContextHtml();
    // `instanceof` plutôt qu'une conversion : le conteneur rend `unknown`.
    const svc = this.context?.container?.get("frontend");
    if (!(svc instanceof FrontendService)) {
      return this.render("<!-- @nodefony/frontend not ready -->");
    }
    // En développement, les URLs vers Vite sont relatives à la page
    // (`/_vite/<famille>/…`, relayées par Nodefony) : un poste, un conteneur
    // ou un téléphone chargent la MÊME page sans configuration.
    const html = svc.renderDocument(ENTRY_NAME, this.context?.cspNonce);
    // La démo est-elle chargée ? Le serveur le SAIT : il le dit dans la page,
    // que l'accueil lit sans requête — une sonde `/demo` rendait 404 sans la
    // démo, et le navigateur l'inscrivait en erreur de console. Module
    // `policy: "dev"` : absent en production, la balise aussi.
    return this.render(
      this.kernel?.getModule("demo") === undefined
        ? html
        : html.replace(
            "</head>",
            '<meta name="nodefony-demo" content="/demo" />\n</head>',
          ),
    );
  }
}

export default AppController;
