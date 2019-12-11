/**
 *    @Route ("/api/jwt")
 */
class loginApiController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.security = this.get("security");
    this.jwtFactory = this.security.getFactory("jwt");
    this.jwtSettings = this.bundle.settings.jwt;
    this.usersService = this.get("users");
    // api
    this.jsonApi = new nodefony.JsonApi("jwt-api-login", this.bundle.version, "Nodefony Login Api JWT", this.context);
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/documentation",
   *      name="api-jwt-login-doc"
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
   *      name="api-jwt-login"
   *    )
   */
  async loginAction() {
    if (!this.context.token) {
      return this.createUnauthorizedException("No Auth Token");
    }
    try {
      if (!this.context.token.user.enabled) {
        const error = new Error(`User : ${this.context.token.user.username} disabled`);
        throw this.createSecurityException(error, 401);
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
      throw this.createSecurityException(e, 401);
    }
  }

  /**
   *    @Method ({"POST"})
   *    @Route (
   *      "/token",
   *      name="api-jwt-refresh"
   *    )
   */
  async tokenAction() {
    try {
      // verify refreshToken expired
      let refresh = await this.jwtFactory.verifyRefreshToken(this.query.refreshToken)
        .catch((e) => {
          throw this.createSecurityException(e, 401);
        });
      const username = refresh.data.username;
      if (!username) {
        throw this.createSecurityException(new Error(`username not valid`), 401);
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
      throw this.createSecurityException(new Error(`User not valid`), 401);
    } catch (e) {
      throw this.createSecurityException(e, 401);
    }
  }

  /**
   *    @Method ({"POST"})
   *    @Route (
   *      "/token/truncate",
   *      name="api-jwt-truncate"
   *    )
   */
  async truncateAction() {
    try {
      let res = await this.jwtFactory.truncateJwtToken(this.query.username);
      return this.jsonApi.render({
        nbDeleted: res
      });
    } catch (e) {
      throw this.createSecurityException(e, 401);
    }
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/logout", name="api-jwt-logout")
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