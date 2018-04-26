module.exports = nodefony.register("AccessControl", () => {

  class AccessControl {

    constructor(authorization) {
      this.authorization = authorization;
      this.pattern = null;
      this.roles = [];
      this.ip = null;
      this.allow_if = null;
      this.host = null;
      this.requires_channel = null;
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = "\x1b[36mAccess Control\x1b[0m";
      }
      return this.authorization.logger(pci, severity, msgid, msg);
    }

    handle(context) {
      try {
        if (!context) {
          throw new nodefony.Error("Access Control No context", 500);
        }
        let ret = this.checkAllowAccess(context);
        if (ret && context.token) {
          this.setTokenRole(context);
          this.checkTokenRole(context);
        }
        return context;
      } catch (e) {
        throw new nodefony.authorizationError(e, 500, context);
      }
    }

    match(route) {
      if (this.pattern.test(route)) {
        return this;
      }
      return false;
    }

    setMatchPattern(pattern) {
      switch (nodefony.typeOf(pattern)) {
      case "string":
        this.pattern = new RegExp(pattern);
        break;
      case "RegExp":
        this.pattern = pattern;
        break;
      default:
        throw new nodefony.Error(`Access Control Bad options config  : ${pattern} must be a String or RegExp`);
      }
    }

    hasRole(name) {
      for (let role in this.roles) {
        if (this.roles[role].role === name) {
          return true;
        }
      }
      return false;
    }

    setRoles(roles) {
      switch (nodefony.typeOf(roles)) {
      case "string":
        this.roles.push(new nodefony.Role(roles));
        break;
      case "array":
        if (roles && roles.length) {
          for (let i = 0; i < roles.length; i++) {
            try {
              this.setRoles(roles[i]);
            } catch (e) {
              throw e;
            }
          }
        }
        break;
      case "object":
        if (roles instanceof nodefony.Role) {
          if (!this.hasRole(roles.role)) {
            this.roles.push(roles);
          }
          if (roles.role) {
            if (!this.hasRole(roles.role)) {
              this.roles.push(new nodefony.Role(roles.role));
            }
          } else {
            new nodefony.Error(`Access Control Bad options config  : ${roles} must be a String, Array or nodefony.Role`);
          }
        }
        break;
      default:
        throw new nodefony.Error(`Access Control Bad options config  : ${roles} must be a String, Array or nodefony.Role`);
      }
    }

    setTokenRole(context) {
      try {
        if (context.token instanceof nodefony.Token) {
          return context.token.setRoles(this.roles);
        }
        throw new Error("Access Control Bad token");
      } catch (e) {
        throw new nodefony.authorizationError(e, 500, context);
      }
    }

    checkTokenRole(context) {

    }

    setIp() {

    }
    checkAllowIp(context) {

    }

    setAllow() {

    }

    checkAllowAccess(context) {
      try {
        this.checkAllowIp(context);
        this.checkAllowHost(context);
        this.checkScheme(context);
        return true;
      } catch (e) {
        this.logger(e, "DEBUG");
        return false;
      }
    }

    setHost() {

    }

    checkAllowHost(context) {

    }

    setScheme() {

    }
    checkScheme(context) {

    }
  }

  return AccessControl;
});