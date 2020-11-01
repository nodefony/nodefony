const net = require("net");

class AccessControl {

  constructor(authorization) {
    this.authorization = authorization;
    this.pattern = null;
    this.roles = [];
    this.allowRoles = [];
    this.ip = [];
    this.allowIp = [];
    //this.allow_if = null;
    this.hosts = [];
    this.requires_channel = [];
    this.methods = [];
    this.actived = false;
  }

  log(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = "\x1b[36mAccess Control\x1b[0m";
    }
    return this.authorization.log(pci, severity, msgid, msg);
  }

  handle(context) {
    try {
      if (!context) {
        throw new nodefony.Error("Access Control No context", 500);
      }
      let ret = this.checkAllowAccess(context);
      if (ret === context) {
        return context;
      }
      if (ret === true && context.token) {
        this.setTokenRole(context);
        this.actived = true;
      }
      return ret;
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

  checkAllowAccess(context) {
    let ret = false;
    try {
      ret = this.checkScheme(context);
      if (ret) {
        if (ret instanceof nodefony.Context) {
          return ret;
        }
      } else {
        return false;
      }
      ret = this.checkIp(context);
      if (ret === false) {
        return false;
        //return new nodefony.authorizationError(`Access Control Unauthorized IP`);
      }
      ret = this.checkMethod(context);
      if (ret === false) {
        return false;
        //return new nodefony.authorizationError(`Access Control Unauthorized Method`);
      }
      ret = this.checkHost(context);
      if (ret === false) {
        return false;
        //return new nodefony.authorizationError(`Access Control Unauthorized Host`);
      }
      // allowIf
      ret = this.checkAllowRole(context);
      if (ret === false) {
        return new nodefony.authorizationError(`Access Control Unauthorized Role`, 401, context);
      }
      ret = this.checkAllowIp(context);
      if (ret === false) {
        return new nodefony.authorizationError(`Access Control Unauthorized IP type ${net.isIP(context.request.remoteAddress)} : ${context.request.remoteAddress}`, 401, context);
      }
      return ret;
    } catch (e) {
      this.log(e, "WARNING");
      return false;
    }
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
      throw new nodefony.Error(`Access Control Bad config path : ${pattern} must be a String or RegExp`);
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

  setRoles(roles, tab) {
    if (!tab) {
      tab = this.roles;
    }
    switch (nodefony.typeOf(roles)) {
    case "string":
      if (!this.hasRole(roles)) {
        tab.push(new nodefony.Role(roles));
      }
      break;
    case "array":
      if (roles && roles.length) {
        for (let i = 0; i < roles.length; i++) {
          try {
            this.setRoles(roles[i], tab);
          } catch (e) {
            throw e;
          }
        }
      }
      break;
    case "object":
      if (roles instanceof nodefony.Role) {
        if (!this.hasRole(roles.role)) {
          tab.push(roles);
        }
        if (roles.role) {
          if (!this.hasRole(roles.role)) {
            tab.push(new nodefony.Role(roles.role));
          }
        } else {
          new nodefony.Error(`Access Control Bad config roles  : ${roles} must be a String, Array or nodefony.Role`);
        }
      }
      break;
    default:
      throw new nodefony.Error(`Access Control Bad config roles : ${roles} must be a String, Array or nodefony.Role`);
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

  checkAllowRole(context) {
    if (this.allowRoles.length === 0) {
      return true;
    }
    let tokenRoles = null;
    try {
      if (context.token) {
        tokenRoles = context.token.getRoles();
      } else {
        return false;
      }
    } catch (e) {
      throw e;
    }
    if (!tokenRoles) {
      return false;
    }
    let isAllow = false;
    for (let j = 0; j < tokenRoles.length; j++) {
      for (let i = 0; i < this.allowRoles.length; i++) {
        if (tokenRoles[j].role === this.allowRoles[i].role) {
          isAllow = true;
          break;
        }
      }
    }
    return isAllow;
  }

  setIp(ips, tab) {
    if (!tab) {
      tab = this.ip;
    }
    switch (nodefony.typeOf(ips)) {
    case "string":
      let type = net.isIP(ips);
      if (type) {
        return tab.push(ips);
      }
      throw new nodefony.Error(`Access Control Bad ip  type : ${ips}`);
    case "array":
      if (ips.length) {
        for (let i = 0; i < ips.length; i++) {
          try {
            this.setIp(ips[i], tab);
          } catch (e) {
            throw e;
          }
        }
      }
      break;
    default:
      throw new nodefony.Error(`Access Control Bad config ip : ${ips}`);
    }
  }

  checkIp(context) {
    if (this.ip.length === 0) {
      return true;
    }
    let ipPublic = context.request.remoteAddress;
    let isAllow = false;
    for (let i = 0; i < this.ip.length; i++) {
      if (ipPublic === this.ip[i]) {
        isAllow = true;
        break;
      }
    }
    return isAllow;
  }

  checkAllowIp(context) {
    if (this.allowIp.length === 0) {
      return true;
    }
    let ipPublic = context.request.remoteAddress;
    let isAllow = false;
    for (let i = 0; i < this.allowIp.length; i++) {
      if (ipPublic === this.allowIp[i]) {
        isAllow = true;
        break;
      }
    }
    return isAllow;
  }

  setAllowIf(conf) {
    switch (nodefony.typeOf(conf)) {
    case "string":
      break;
    case "object":
      for (let ele in conf) {
        switch (ele) {
        case "roles":
          this.setRoles(conf[ele], this.allowRoles);
          break;
        case "ip":
        case "ips":
          this.setIp(conf[ele], this.allowIp);
          break;
        default:
          this.log(`Access Control Bad config  ${ele} no defined in allow_if options`, "WARNING");
        }
      }
      break;
      //case "function":
      //  return this.setAllowIf(conf.call(this));
    default:
      throw new nodefony.Error(`Access Control Bad config allow_if : ${conf}`);
    }

  }

  setHost(conf) {
    switch (nodefony.typeOf(conf)) {
    case "string":
      if (this.hosts.indexOf(conf) < 0) {
        this.hosts.push(conf);
      }
      break;
    case "array":
      if (conf.length) {
        for (let i = 0; i < conf.length; i++) {
          try {
            this.setHost(conf[i]);
          } catch (e) {
            throw e;
          }
        }
      }
      break;
    default:
      throw new nodefony.Error(`Access Control Bad config hosts : ${conf} must be an Array or a String`);
    }
  }

  checkHost(context) {
    if (this.hosts.length === 0) {
      return true;
    }
    let isAllow = false;
    let requestHost = context.getHostName();
    for (let i = 0; i < this.hosts.length; i++) {
      if (requestHost === this.hosts[i]) {
        isAllow = true;
        break;
      }
    }
    return isAllow;
  }

  setScheme(conf) {
    switch (conf) {
    case "https":
      this.requires_channel.push(conf);
      this.requires_channel.push("wss");
      break;
    case "http":
      this.requires_channel.push(conf);
      this.requires_channel.push("ws");
      break;
    default:
      throw new nodefony.Error(`Access Control Bad config requires_channel : ${conf} must be http or https`);
    }
  }

  checkScheme(context) {
    if (this.requires_channel.length) {
      if (this.requires_channel.indexOf(context.scheme) < 0) {
        if (context.scheme === "ws" || context.scheme === "wss") {
          return false;
        }
        if (this.requires_channel.indexOf("https") >= 0) {
          return this.authorization.firewall.redirectHttps(context);
        }
        if (this.requires_channel.indexOf("http") >= 0) {
          return this.authorization.firewall.redirectHttp(context);
        }
      }
    }
    return true;
  }

  setMethod(conf) {
    switch (nodefony.typeOf(conf)) {
    case "string":
      if (this.methods.indexOf(conf) < 0) {
        this.methods.push(conf);
      }
      break;
    case "array":
      if (conf.length) {
        for (let i = 0; i < conf.length; i++) {
          try {
            this.setMethod(conf[i]);
          } catch (e) {
            throw e;
          }
        }
      }
      break;
    default:
      throw new nodefony.Error(`Access Control Bad config methd : ${conf} must be an Array or a String`);
    }
  }

  checkMethod(context) {
    if (this.methods.length === 0) {
      return true;
    }
    let isAllow = false;
    for (let i = 0; i < this.methods.length; i++) {
      if (context.method === this.methods[i]) {
        isAllow = true;
        break;
      }
    }
    return isAllow;
  }
}

nodefony.AccessControl = AccessControl;
module.exports = AccessControl;
