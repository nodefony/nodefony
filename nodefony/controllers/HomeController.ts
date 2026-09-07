import { route, controller, Controller } from "@nodefony/framework";
import type { ContextType } from "@nodefony/http";

/**
 * Accueil `GET /` — la racine de TON application.
 *
 * Sans frontend, une racine muette répond 404 : la première URL qu'on ouvre
 * après `npm run dev` dirait « rien ici ». Cette route dit QUI répond, et rien
 * de plus. Elle n'est générée que pour une app SANS frontend — avec un front,
 * c'est `AppController` qui tient `/`.
 *
 * ⚠️ **Volontairement sobre, et c'est une décision de sécurité.** Ce que cette
 * réponse contient part en PRODUCTION, vers n'importe qui. Énumérer les routes
 * internes, la console d'administration ou les chemins de documentation
 * décrirait ton architecture à qui la demande : c'est une divulgation, pas une
 * fonctionnalité. Ces informations se demandent au TERMINAL, où seul celui qui
 * a déjà la main les obtient : `npx nodefony card` (et sa porte HTTP de
 * développement, `@nodefony/devkit`, `policy: "dev"`, absente de la production).
 *
 * Tu ajoutes un frontend plus tard (`nodefony create front`) ? Sa page vivra
 * sous sa propre route ; garde cet accueil JSON ou remplace-le, c'est TA racine.
 */
@controller("")
class HomeController extends Controller {
  constructor(context: ContextType) {
    super("home", context);
  }

  @route("app-home", { path: "/", method: "GET" })
  async home() {
    return this.renderJson({
      app: "nodefony",
      nodefony: "10.0.0-alpha.3",
    });
  }
}

export default HomeController;
