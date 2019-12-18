/**
 *    @Route ("/api/jwt")
 */
class loginApiController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    this.security = this.get("security");
    this.jwtFactory = this.security.getFactory("jwt");
    this.jwtSettings = this.bundle.settings.jwt;
    this.usersService = this.get("users");
    // JSON API
    this.jsonApi = new nodefony.JsonApi({
      name: "login-api",
      version: this.bundle.version,
      description: "Nodefony Login Api",
      basePath: "/api/jwt"
    }, this.context);
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/documentation",
   *      name="api-login-doc"
   *    )
   *    @Firewall ({bypass:true})
   */
  swaggerAction() {
    return this.optionsAction();
  }

  /**
   *    @Method ({"OPTIONS"})
   *    @Route ( "",name="api-login-options",)
   *    @Firewall ({bypass:true})
   */
  optionsAction() {
    try {
      let openApiConfig = require(path.resolve(this.bundle.path, "Resources", "config", "openapi", "login.js"));
      return this.jsonApi.renderSchema(openApiConfig, this.usersService.entity);
    } catch (e) {
      return this.jsonApi.renderError(e, 400);
    }
  }

  /**
   *    @Method ({"POST"})
   *    @Route (
   *      "/login",
   *      name="api-login-jwt"
   *    )
   */
  async loginAction() {
    if (!this.context.token) {
      return this.createException("No Auth Token", 401);
    }
    try {
      if (!this.context.token.user.enabled) {
        const error = new Error(`User : ${this.context.token.user.username} disabled`);
        throw this.createSecurityException(error);
      }
      const token = this.jwtFactory.generateJwtToken(
        this.context.token.serialize(),
        this.jwtSettings.token);
      const refrechToken = await this.jwtFactory.generateJwtRefreshToken(
        this.context.token.user.username,
        token,
        this.jwtSettings.refreshToken);
      return this.jsonApi.render({
        decodedToken: this.jwtFactory.decodeJwtToken(token),
        token: token,
        refreshToken: refrechToken
      });
    } catch (e) {
      throw this.createException(e, 401);
    }
  }

  /**
   *    @Method ({"POST"})
   *    @Route (
   *      "/token",
   *      name="api-login-jwt-refresh"
   *    )
   *    @Firewall ({bypass:true})
   */
  async tokenAction() {
    try {
      // get refreshToken from request
      let sessionToken = null;
      let refreshToken = null;
      // for statefull
      if (this.session) {
        sessionToken = this.session.get("refreshToken");
      }
      refreshToken = this.request.headers.refreshtoken || this.query.refreshToken || sessionToken;
      if (!refreshToken) {
        throw this.createSecurityException("refreshToken parameter Not found");
      }
      // verify refreshToken expired
      let refresh = await this.jwtFactory.verifyRefreshToken(refreshToken)
        .catch((e) => {
          throw this.createSecurityException(e);
        });
      const username = refresh.data.username;
      if (!username) {
        throw this.createSecurityException(`username not valid`);
      }
      const dtuser = await this.usersService.findOne(username);
      // controll user enabled
      if (dtuser && dtuser.enabled) {
        // generate new token access
        const token = this.jwtFactory.generateJwtToken({
          user: dtuser
        }, this.jwtSettings.token);
        await this.jwtFactory.updateJwtRefreshToken(dtuser.username, token, this.query.refreshToken);
        return this.jsonApi.render({
          decodedToken: this.jwtFactory.decodeJwtToken(token),
          token: token
        });
      }
      throw this.createSecurityException(`User not valid`);
    } catch (e) {
      throw this.createException(e);
    }
  }

  /**
   *    @Method ({"POST"})
   *    @Route (
   *      "/token/truncate",
   *      name="api-login-jwt-truncate"
   *    )
   */
  async truncateAction() {
    try {
      let res = await this.jwtFactory.truncateJwtToken(this.query.username);
      return this.jsonApi.render({
        nbDeleted: res
      });
    } catch (e) {
      throw this.jsonApi.renderError(e, 401);
    }
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/logout", name="api-login-jwt-logout")
   */
  logoutAction() {
    if (this.security) {
      return this.security.logout(this.context)
        .catch((e) => {
          throw e;
        });
    }
    if (this.context.session) {
      return this.context.session.destroy(true)
        .then(() => {
          return this.redirectToRoute("login");
        }).catch(e => {
          this.logger(e, "ERROR");
        });
    }
    return this.redirectToRoute("login");
  }

}

module.exports = loginApiController;