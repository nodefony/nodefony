const jwt = require('jsonwebtoken');

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
    let secret = this.firewall.getFactory("jwt").settings.secretOrKey;
    const jeton = jwt.sign({
      data: this.context.token.serialize()
    }, secret, {
      expiresIn: '1h'
    });
    this.context.createCookie("jwt", jeton, {});
    if (this.context.session) {
      this.context.session.setMetaBag("jwt", jeton);
    }
    return this.renderJson(nodefony.extend({}, jwt.decode(jeton), {
      token: jeton
    }));
  }

};