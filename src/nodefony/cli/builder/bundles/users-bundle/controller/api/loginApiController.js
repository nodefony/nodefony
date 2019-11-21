/**
 *    @Route ("/jwt")
 */
module.exports = class loginApiController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.security = this.get("security");
    this.jwtFactory = this.security.getFactory("jwt");
    this.setJsonContext();
    this.usersService = this.get("users");
  }

  renderJsonApi(obj, status, headers) {
    try {
      let json = {
        url: this.context.url || "",
        method: this.context.method,
        scheme: this.context.scheme,
      };
      json.pdu = JSON.stringify(new nodefony.PDU({
        bundle: this.bundle.name,
        controller: this.name,
        action: this.get("action") ? this.get("action") : "",
      }, "INFO"));
      return this.renderJson(nodefony.extend(true, json, obj), status, headers);
    } catch (e) {
      throw e;
    }
  }

  /**
   *    @Method ({"POST"})
   *    @Route (
   *      "/login",
   *      name="login-jwt"
   *    )
   */
  async loginAction() {
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
      const token = this.jwtFactory.generateJwtToken(this.context.token.user);
      const refrechToken = await this.jwtFactory.generateJwtRefreshToken(this.context.token.user.username, token);
      return this.renderJsonApi(nodefony.extend({}, this.jwtFactory.decodeJwtToken(token), {
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
      let refresh = await this.jwtFactory.verifyRefreshToken(this.query.refreshToken)
      .catch((e)=>{
        let error = new nodefony.securityError(
          e,
          401,
          this.context.security,
          this.context
        );
        throw error;
      });
      const username = refresh.data.username ;
      if ( ! username){
        throw new Error(`username not valid`);
      }
      // controll user enabled
      //const user = new User(this);
      const dtuser = await this.usersService.findOne(username);
      if ( dtuser && dtuser.enabled){
        // generate new token access
        const token = this.jwtFactory.generateJwtToken(dtuser);
        await this.jwtFactory.updateJwtRefreshToken(dtuser.username, token, this.query.refreshToken );
        return this.renderJsonApi(nodefony.extend({}, this.jwtFactory.decodeJwtToken(token), {
          token: token
        }));
      }
      throw new Error(`User not valid`);
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
   *      "/token/truncate",
   *      name="truncate-jwt"
   *    )
   */
   async truncateAction() {
     try {
       let res = await this.jwtFactory.truncateJwtToken(this.query.username);
       return this.renderJsonApi({nbDeleted:res});
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
   *    @Route ("/logout", name="logout-jwt")
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
