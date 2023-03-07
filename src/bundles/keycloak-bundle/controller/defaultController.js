
/**
 *  @class defaultController
 *  @constructor
 *  @param {class} container
 *  @param {class} context
 *  @Route ("/keycloak")
 */
module.exports = class defaultController extends nodefony.Controller {
  constructor (container, context) {
    super(container, context);
    // start session
    // this.startSession();
    // JSON API
    this.api = new nodefony.api.OpenApi({
      name: "nodefony-openapi-connect",
      version: this.bundle.version,
      description: "Nodefony OpenApi connect",
      basePath: "/keycloak/api"
    }, this.context);
  }

  /**
   *    @Route ("",
   *      name="route-keycloak-bundle-keycloak")
   */
  indexAction () {
    const {token} = this.context;
    console.log(token);
    this.setContextHtml();
    const user = this.getUser();
    return this.render("keycloak-bundle::index.html.twig", {
      name: this.bundle.name,
      description: this.bundle.package.description,
      username: user ? user.username : null,
      user,
      token: token ? token.accessToken : null,
      refreshToken: token ? token.refreshToken : null,
      redirect: "/nodefony",
      error: this.query.error,
      errorDescription: this.query.error_description
    });
  }

  /**
   *    @Route ("/callback",
   *      name="route-keycloak-callback")
   */
  callbackAction () {
    console.log(" pass controller keycloak return ", this.query);
    if (this.query.error) {
      if (this.query.error_description) {
        this.log(this.query.error_description, "ERROR");
      }
      // throw new nodefony.Error(`${this.query.error}`, 401);
    }
    // return this.redirectToRoute("route-keycloak-bundle-keycloak");
    return this.indexAction();
  }

  /**
   *    @Route ("/token",
   *      name="route-keycloak-token")
   */
  tokenAction () {
    const token = this.getToken();
    return this.api.render({
      token: token.accessToken,
      refreshToken: token.refreshToken
    });
    // return this.redirectToRoute("route-keycloak-bundle-keycloak");
  }

  /**
   *    @Route ("/refresh",
   *      name="route-keycloak-refresh")
   */
  refreshAction () {
    const token = this.getToken();
    if (!token) {
      throw new nodefony.Error("No token found", 401);
    }
    if (!token.factory) {
      throw new nodefony.Error("No token Factory  found", 401);
    }
    const factory = this.context.security.getFactory(token.factory);
    if (!factory) {
      throw new nodefony.Error("No Factory  found", 401);
    }
    return factory.refreshToken(this.context, token)
      .then((result) => this.api.render(result))
      .catch((e) => {
        throw new nodefony.Error(e, 401);
      });
  }


  /**
   *    @Route ("/logout",
   *      name="route-keycloak-logout")
   */
  logoutAction () {
    return this.logout();
  }

  /**
   *    @Route ("/callback/logout",
   *      name="route-keycloak-logout-callback")
   */
  logoutCallbackAction () {
    console.log("passsssss logoutCallbackAction ");
    // return this.indexAction();
    return this.redirectToRoute("route-keycloak-bundle-keycloak");
  }
};

