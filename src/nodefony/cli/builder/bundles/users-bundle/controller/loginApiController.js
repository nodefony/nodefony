/**
 *    @Route ("/api")
 */
module.exports = class loginApiController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.security = this.get("security");
    this.jwtFactory = this.security.getFactory("jwt");
  }

  /**
   *    @Method ({"POST"})
   *    @Route (
   *      "/login/jwt",
   *      name="login-api-jwt"
   *    )
   */
  jwtAction() {
    if (!this.context.token) {
      return this.createUnauthorizedException("No Auth Token");
    }
    try {
      const token = this.jwtFactory.generateJwtToken(this.context.token.serialize());
      const refrechToken = this.jwtFactory.generateJwtRefreshToken();
      return this.renderJson(nodefony.extend({}, this.jwtFactory.decodeJwtToken(token), {
        token: token,
        refreshToken:refrechToken
      }));
    } catch (e) {
      let error = new nodefony.securityError(
        e,
        401,
        this.context.security,
        this.context
      );
      throw error;
    }
  }

  /**
   *    @Method ({"POST"})
   *    @Route (
   *      "/jwt/refresh",
   *      name="api-jwt-refresh"
   *    )
   */
  async refrehAction(){
    if (!this.context.token) {
      return this.createUnauthorizedException("No Auth Token");
    }
    try {
      const refresh = await this.verifyRefreshToken(this.query.refreshToken);
      const token = this.jwtFactory.generateJwtToken(this.context.token.serialize());

      return this.renderJson(nodefony.extend({}, this.jwtFactory.decodeJwtToken(token), {
        token: token,
        refreshToken:refresh.token
      }));
    } catch (e) {
      let error = new nodefony.securityError(
        e,
        401,
        this.context.security,
        this.context
      );
      throw error;
    }
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/logout", name="api-logout")
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

};
