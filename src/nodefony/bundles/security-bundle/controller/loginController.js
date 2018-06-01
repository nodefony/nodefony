module.exports = class loginController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.firewall = this.get("security");
  }

  loginAction(type) {
    let area = this.firewall.getSecuredArea(type);
    let checkLogin = "/" + type;
    if (area && area.checkLogin) {
      checkLogin = area.checkLogin;
    }
    return this.render("securityBundle::login.html.twig", {
      type: type,
      ckeckLogin: checkLogin
    });
  }

  jwtAction() {
    if (!this.context.token) {
      return this.createUnauthorizedException("No Auth Token");
    }
    let factory = this.firewall.getFactory("jwt");
    const jeton = factory.generateJwtToken(this.context.token.serialize(), {
      expiresIn: '1h'
    });
    let name = "jwt";
    let conf = factory.settings.jwtFromRequest;
    if (conf && conf.extractor === "fromCookie") {
      if (conf.params && conf.params[0]) {
        name = conf.params[0];
      }
      //let area = this.firewall.getSecuredArea("test-api-area");
      //let myPath = area.stringPattern.replace("^", "")
      this.context.createCookie(name, jeton, {
        httpOnly: true,
        secure: true,
        maxAge: "1h"
        //path: myPath
      });
    }
    if (this.context.session) {
      this.context.session.setMetaBag(name, jeton);
    }
    if (this.context.isJson) {
      return this.renderJson(nodefony.extend({}, factory.decodeJwtToken(jeton), {
        token: jeton
      }));
    }
    return this.redirect("/");
  }

};