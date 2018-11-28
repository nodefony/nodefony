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
        let access = new nodefony.AccessControl(this);
        try {
          for (let conf in config) {
            switch (conf) {
              case "path":
                access.setMatchPattern(config[conf]);
                break;
              case "roles":
                access.setRoles(config[conf]);
                break;
              case "ip":
                access.setIp(config[conf]);
                break;
              case "allow_if":
                access.setAllowIf(config[conf]);
                break;
              case "host":
                access.setHost(config[conf]);
                break;
              case "requires_channel":
                access.setScheme(config[conf]);
                break;
              case "method":
                access.setMethod(config[conf]);
                break;
              default:
                throw new nodefony.Error(`Access Control Bad options config  : ${conf} in ${util.inspect(config)}`);
            }
          }
        } catch (e) {
          throw e;
        }
        if (access.pattern) {
          this.accessControl.push(access);
        } else {
          this.logger(`Access Control no path option in ${util.inspect(config)}`, "WARNING");
        }
        //console.log(this.accessControl)
        break;
      default:
        throw new nodefony.Error(`Access Control Bad configuration : ${util.inspect(config)}`);
    }
  }

  handle(context) {
    return new Promise((resolve, reject) => {
      if (context.isControlledAccess) {
        for (let i = 0; i < context.accessControl.length; i++) {
          try {
            let ret = context.accessControl[i].handle(context);
            if (ret === context) {
              return resolve(context);
            }
            if (ret instanceof nodefony.authorizationError) {
              return reject(ret);
            }
            //return reject(new nodefony.authorizationError(ret, 500, context));
          } catch (e) {
            return reject(e);
          }
        }
      }
      return resolve(context);
    });
  }

  isControlledAccess(context) {
    if (this.accessControl.length) {
      let route = context.request.url.pathname;
      return this.match(route);
    }
    return [];
  }

  match(route) {
    let ret = [];
    for (let i = 0; i < this.accessControl.length; i++) {
      let res = this.accessControl[i].match(route);
      if (res) {
        ret.push(res);
      }
    }
    return ret;
  }
};