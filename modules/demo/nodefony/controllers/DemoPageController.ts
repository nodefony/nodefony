import { Controller, route, controller } from "@nodefony/framework";
import type { ContextType } from "@nodefony/http";
import { FrontendService } from "@nodefony/frontend";

/**
 * DemoPageController — sert la page react « demo ».
 *
 * ── Comment la page arrive au navigateur ──────────────────────────────────
 * 1. Le HTML ne vit PAS ici : c'est la coquille `frontend/index.html`
 *    (TA page — meta, polices, favicon, scripts externes). Ce controller la
 *    fait rendre par le framework.
 * 2. `renderDocument("demo", nonce)` remplit le marqueur
 *    `<!--nodefony:frontend-->` de la coquille avec les balises de l'ENTRY
 *    « demo » (déclarée dans l'`index.ts` du module, cf
 *    `registerEntry`) :
 *      - en DÉVELOPPEMENT : les <script> pointent Vite, relayé par Nodefony
 *        sur l'origine de la page (`/_vite/<famille>/`) → HMR,
 *        recompilation à la volée, état préservé ;
 *      - en PRODUCTION : le bundle pré-compilé fingerprinté (`npm run build`),
 *        servi en statique — Vite n'existe plus au runtime.
 * 3. Le NONCE CSP de la requête (émis par le firewall) est propagé aux
 *    <script> injectés : la Content-Security-Policy stricte reste intacte —
 *    ne JAMAIS recopier des balises <script> à la main dans la coquille.
 *
 * ── Les appels API de la page ─────────────────────────────────────────────
 * La page est rendue par Nodefony ; en dev, ses modules lui parviennent par la
 * même origine (`/_vite/…`, relayé à Vite). Un `fetch("/api/...")` atteint donc
 * directement ce controller, en dev comme en prod — aucun proxy à déclarer.
 */
@controller("")
class DemoPageController extends Controller {
  constructor(context: ContextType) {
    super("demo-front", context);
  }

  @route("route-demo-page", { path: "/demo", method: "GET" })
  renderPage(): unknown {
    this.setContextHtml();
    // `instanceof` plutôt qu'une conversion : le conteneur rend `unknown`.
    const svc = this.context?.container?.get("frontend");
    if (!(svc instanceof FrontendService)) {
      // @nodefony/frontend absent du manifeste (nodefony.config.ts) : la page
      // ne peut pas être construite — on le DIT au lieu d'un écran vide.
      return this.render("<!-- @nodefony/frontend not ready -->");
    }
    return this.render(
      // En développement, les URLs vers Vite sont relatives à la page
      // (`/_vite/<famille>/…`, relayées par Nodefony) : un poste, un conteneur
      // ou un téléphone chargent la MÊME page sans configuration.
      svc.renderDocument("demo", this.context?.cspNonce),
    );
  }
}

export default DemoPageController;
