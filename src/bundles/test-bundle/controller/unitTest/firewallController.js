module.exports = class firewallController extends nodefony.controller {
  constructor (container, context) {
    super(container, context);
    this.firewall = this.get("security");
  }

  localAction () {
    return this.redirect("/test/firewall/jwt");
  }

  digestAction () {
    return this.renderJson(this.context.security.cors.headers);
  }

  basicAction () {
    return this.renderJson(this.context.security.cors.headers);
  }

  apiAction () {
    return this.renderJson(this.context.token);
  }

  ldapAction () {
    return this.redirect("/test/firewall/jwt");
  }

  jwtAction () {
    if (!this.context.token) {
      return this.createUnauthorizedException("No Auth Token");
    }
    const factory = this.firewall.getFactory("jwt");
    const jeton = factory.generateJwtToken(this.context.token.serialize(), {
      expiresIn: "1h"
    });
    let name = "jwt";
    const conf = factory.settings.jwtFromRequest;
    if (conf && conf.extractor === "fromCookie") {
      if (conf.params && conf.params[0]) {
        name = conf.params[0];
      }
      this.context.createCookie(name, jeton, {
        httpOnly: true,
        secure: true,
        maxAge: "1h"
        // path: myPath
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
