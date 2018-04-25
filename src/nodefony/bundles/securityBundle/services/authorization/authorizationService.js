module.exports = class Authorization extends nodefony.Service {

  constructor(container, firewall) {
    super("Authorization", container, firewall.notificationsCenter);
    this.firewall = firewall;
    this.accessControl = [];
  }

  setAccessControl(config) {
    switch (nodefony.typeOf(config)) {
    case "array":
      for (let i = 0; i < config.length; i++) {
        this.setAccessControl(config[i]);
      }
      break;
    case "object":
      let ele = {
        regExp: null,
        roles: []
      };
      try {
        for (let conf in config) {
          switch (conf) {
          case "path":
            if (typeof config[conf] !== "string") {
              throw new nodefony.Error(`Access Control Bad options config  : ${conf} must be a String in ${util.inspect(config)}`);
            }
            ele.regExp = new RegExp(config[conf]);
            break;
          case "roles":
            switch (nodefony.typeOf(config[conf])) {
            case "string":
              ele.roles.push(config[conf]);
              break;
            case "array":
              ele.roles = ele.roles.concat(config[conf]);
              break;
            default:
              throw new nodefony.Error(`Access Control Bad options config  : ${conf} must be a String or Array in ${util.inspect(config)}`);
            }
            break;
          default:
            throw new nodefony.Error(`Access Control Bad options config  : ${conf} in ${util.inspect(config)}`);
          }
        }
      } catch (e) {
        throw e;
      }
      this.accessControl.push(ele);
      break;
    default:
      throw new nodefony.Error(`Access Control Bad configuration : ${util.inspect(config)}`);
    }
  }

  handle(context) {
    return new Promise((resolve, reject) => {

      if (context.isControlledAccess) {
        let error = new nodefony.authorizationError("Access Control Unauthorized", 401, context);
        let message = "";
        if (context.token) {
          let tokenRoles = context.token.getRoles();
          let found = false;
          for (let i = 0; i < context.accessControl.length; i++) {
            for (let j = 0; j < tokenRoles.length; j++) {
              if (this.accessControl[context.accessControl[i]].roles.lastIndexOf(tokenRoles[j].role) < 0) {
                message += ` ${tokenRoles[j].role}`;
              } else {
                found = true;
              }
            }
          }
          if (found) {
            return resolve(context);
          }
        } else {
          message = "No context Token";
        }
        error.message = `${error.message} ${message}`;
        return reject(error);
      }
      return resolve(context);
    });
  }

  isControlledAccess(context) {
    let ret = [];
    if (this.accessControl.length) {
      let route = context.request.url.pathname;
      return ret.concat(this.match(route));
    }
    return ret;
  }

  match(route) {
    let ret = [];
    for (let i = 0; i < this.accessControl.length; i++) {
      let res = this.accessControl[i].regExp.test(route);
      if (res) {
        ret.push(i);
      }
    }
    return ret;
  }
};