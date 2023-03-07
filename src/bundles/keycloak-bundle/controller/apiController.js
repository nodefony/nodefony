
/**
 *  @class defaultController
 *  @constructor
 *  @param {class} container
 *  @param {class} context
 *  @Route ("/myapi")
 */
module.exports = class apiController extends nodefony.Controller {
  constructor (container, context) {
    super(container, context);
    // start session
    this.startSession();
    this.api = new nodefony.api.Json({
      name: "nodefony-api-myapi",
      version: this.bundle.version,
      description: "Nodefony maypi",
      basePath: "/myapi"
    }, this.context);
  }

  /**
   *    @Route ("",
   *      name="route-keycloak-bundle-myapi")
   */
  indexAction () {
    return this.api.render({
      token: this.getToken()
    });
  }

  /**
   *    @Route ("/callback",
   *      name="route-myapi-callback")
   */
  callbackAction () {
    console.log(" pass controller keycloak return ", this.query);
    if (this.query.error) {
      this.setContextJson();
      if (this.query.error_description) {
        this.log(this.query.error_description, "ERROR");
      }
      throw new nodefony.Error(`${this.query.error}`, 401);
    }
    // return this.indexAction();
    // console.log(this.getUser(), this.context.token);
    // return this.redirectToRoute("route-keycloak-bundle-keycloak");
    return this.redirectToRoute("home");
  }


  /**
   *    @Route ("/login",
   *      name="route-myapi-login")
   */
  loginAction () {
    console.log("login");
    return this.renderJson({});
  }


  /**
   *    @Route ("/logout",
   *      name="route-myapi-logout")
   */
  logoutAction () {
    console.log("logout");
    return this.renderJson({});
  }
};

