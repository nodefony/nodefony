const User = require(path.resolve(__dirname, "..", "src", "user.js"));
/**
 *    @Route ("/jwt")
 */
module.exports = class loginApiController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.security = this.get("security");
    this.jwtFactory = this.security.getFactory("jwt");
    this.setJsonContext();
  }

  /**
   *    @Method ({"POST"})
   *    @Route (
   *      "/login",
   *      name="login-jwt"
   *    )
   */
  loginAction() {
    if (!this.context.token) {
      return this.createUnauthorizedException("No Auth Token");
    }
    try {
      if (!this.context.token.user.enabled) {
        let error = new nodefony.securityError(
          `User : ${this.context.token.user.username} disabled`,
          401,
          this.context.security,
          this.context
        );
        throw error;
      }
      const token = this.jwtFactory.generateJwtToken(this.context.token.serialize());
      const refrechToken = this.jwtFactory.generateJwtRefreshToken();
      return this.renderJson(nodefony.extend({}, this.jwtFactory.decodeJwtToken(token), {
        token: token,
        refreshToken: refrechToken
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
   *      "/token",
   *      name="refresh-jwt"
   *    )
   */
  async tokenAction() {
    try {
      // verify refreshToken expired
      const refresh = await this.jwtFactory.verifyRefreshToken(this.query.refreshToken);
      // controll user enabled
      const user = new User(this);
      const dtuser = await user.findOne(this.query.username);
      // generate new token access
      const token = this.jwtFactory.generateJwtToken(dtuser);
      return this.renderJson(nodefony.extend({}, this.jwtFactory.decodeJwtToken(token), {
        token: token,
        refreshToken: refresh.token
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
   *    @Route ("/logout", name="jwt-logout")
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