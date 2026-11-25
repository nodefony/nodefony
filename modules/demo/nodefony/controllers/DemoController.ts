import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Nodefony } from "nodefony";
import { route, controller, Controller } from "@nodefony/framework";
import { HttpError } from "@nodefony/http";
import type { ContextType } from "@nodefony/http";
import { FrontendService } from "@nodefony/frontend";
import { AuthFlow } from "@nodefony/security";
import { DEMOS } from "../../demos";
import {
  DEMO_ABOUT_PATH,
  docsVersionFor,
  type IDemoAbout,
} from "../../frontend/src/about";

/** La version de la doc à lier, constatée une fois par processus. */
let installedDocs: string | null = null;

/**
 * La version de la doc qui décrit le Nodefony chargé : le chemin RÉEL du
 * paquet dit s'il vient de npm ou des sources (`docsVersionFor`).
 */
function docsOfInstalled(): string {
  if (installedDocs === null) {
    try {
      const entry = fileURLToPath(import.meta.resolve("nodefony"));
      installedDocs = docsVersionFor(realpathSync(entry), Nodefony.version);
    } catch {
      // Paquet introuvable par ce chemin : la version qu'il annonce.
      installedDocs = Nodefony.version;
    }
  }
  return installedDocs;
}

/**
 * API de l'accueil de la démo, sous `/demo/api` — hors de toute zone de
 * l'application, dont `/api` reste fermé — et pages d'apprentissage.
 *
 * Guide pour un agent : une route JSON se déclare par `@route` sur un
 * `Controller` (`@nodefony/framework`) et répond par `renderJson` ; le type de
 * la réponse est PARTAGÉ avec la page (`frontend/src/about.ts`). Équivalent
 * généré : `npx nodefony create controller`.
 */
@controller("")
class DemoController extends Controller {
  constructor(context: ContextType) {
    super("demo", context);
  }

  /**
   * Identité de l'application et version de Nodefony installée, lues au
   * démarrage : `kernel.projectName`/`kernel.version` viennent du
   * `package.json` de l'application, `Nodefony.version` du paquet installé.
   * L'adresse de connexion est celle que `security` décrit (`loginPage`).
   */
  @route("demo-about", { path: DEMO_ABOUT_PATH, method: "GET" })
  about() {
    // `instanceof` plutôt qu'une conversion : le conteneur rend `unknown`.
    const flow = this.context?.container?.get("authFlow");
    const about: IDemoAbout = {
      app: {
        name: this.kernel?.projectName ?? "nodefony",
        version: this.kernel?.version ?? "0.0.0",
      },
      nodefony: { version: Nodefony.version },
      loginPath:
        flow instanceof AuthFlow
          ? (flow.describeLoginPage()?.path ?? null)
          : null,
      docs: docsOfInstalled(),
    };
    return this.renderJson(about);
  }

  /**
   * Les pages d'apprentissage (`/demo/chat`…) : la MÊME page que l'accueil,
   * qui choisit son écran d'après l'adresse. Seules les pages que l'index
   * (`demos.ts`) déclare existent ; toute autre adresse rend 404.
   */
  @route("demo-lesson-page", { path: "/demo/{page}", method: "GET" })
  lesson(page: string): unknown {
    if (
      !DEMOS.some((demo) => "path" in demo && demo.path === `/demo/${page}`)
    ) {
      throw new HttpError("page de démo inconnue", 404);
    }
    this.setContextHtml();
    const svc = this.context?.container?.get("frontend");
    if (!(svc instanceof FrontendService)) {
      return this.render("<!-- @nodefony/frontend not ready -->");
    }
    return this.render(svc.renderDocument("demo", this.context?.cspNonce));
  }
}

export default DemoController;
