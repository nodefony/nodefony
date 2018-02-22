const jwt = require('jsonwebtoken');

module.exports = class loginController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.firewall = this.get("security");
  }

  loginAction() {
    return this.renderResponse('<body><form id="login" action="/test/firewall/local" method="POST" class="margin-bottom-0">\
                <div class="form-group m-b-20">\
                  <input id="username" name="username" type="text" class="form-control input-lg" placeholder="Login">\
                </div>\
                <div class="form-group m-b-20">\
                  <input id="passwd" name="passwd" type="password" class="form-control input-lg" placeholder="Password">\
                </div>\
                <div class="checkbox m-b-20">\
                  <label>\
                    <p>login : admin passwd : admin</p>\
                    <p>login : 1000 passwd : 1234</p>\
                  </label>\
                </div>\
                <div class="login-buttons">\
                  <button id="valid" class="btn btn-success btn-block btn-lg">Sign me in</button>\
                </div>\
              </form></body>');
  }

  jwtAction() {
    let secret = this.firewall.getFactory("jwt").settings.secretOrKey;
    const jeton = jwt.sign({
      data: this.context.token.serialize()
    }, secret, {
      expiresIn: '1h'
    });
    this.context.createCookie("jwt", jeton, {

    });
    if (this.context.session) {
      this.context.session.setMetaBag("jwt", jeton);
    }
    return this.renderJson(nodefony.extend({}, jwt.decode(jeton), {
      token: jeton
    }));
  }
};