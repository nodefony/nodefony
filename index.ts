import { Module, services } from "nodefony";
import type { Kernel } from "nodefony";
import { controllers } from "@nodefony/framework";
import AppInfoService from "./nodefony/service/AppInfoService";
import AppBannerService from "./nodefony/service/AppBannerService";

import config from "./nodefony.config";
import HelloController from "./nodefony/controllers/HelloController";
import LiveController from "./nodefony/controllers/LiveController";
import HomeController from "./nodefony/controllers/HomeController";
import { entities } from "@nodefony/orm-core";
import { UserEntity } from "./nodefony/entity/User";
import { provisionUsers } from "./nodefony/security/provisionUsers";

/**
 * Catalogue d'env typé, lu par le Kernel au boot pour alimenter `ctx.env`
 * du descripteur `defineConfig`.
 */
export { env } from "./env";

/**
 * Point d'entrée de l'application (chargé par le Kernel : `dist/index.js`).
 * L'app ne déclare ici que ce qui lui est INTRINSÈQUE : ses controllers et ses
 * services. Les modules chargés vivent dans `nodefony.config.ts` (manifeste
 * `modules`).
 *
 *
 * ⚠️ `@services([…])` est ce qui fait EXISTER un service : écrire une classe
 * `@injectable()` sans l'ajouter ici la laisse invisible au conteneur. Tout
 * service que tu ajoutes — le tien, ou celui que `nodefony create service`
 * génère — se déclare dans cette liste.
 */
@entities([UserEntity])
@services([AppInfoService, AppBannerService])
@controllers([HelloController, LiveController, HomeController])
class App extends Module {
  constructor(kernel: Kernel) {
    super("app", kernel, import.meta.url, config);
  }

  /**
   * Pose l'annuaire utilisateurs de l'app + seed le compte admin (idempotent).
   * L'identité est la responsabilité de l'APPLICATION — le firewall
   * (@nodefony/security) authentifie, mais c'est ici qu'on décide QUI sont les
   * utilisateurs et OÙ ils vivent. Détails : nodefony/security/provisionUsers.ts
   */
  override async onKernelReady(): Promise<this> {
    await provisionUsers(this);
    return this;
  }
}

export default App;
