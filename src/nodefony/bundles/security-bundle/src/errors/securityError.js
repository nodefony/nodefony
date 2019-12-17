class securityError extends nodefony.httpError {
  constructor(message, code, secure, context) {
    if (context) {
      super(message, code, context.container);
    } else {
      super(message, code, null);
    }
    if (secure) {
      this.secure = secure;
      this.parserSecure();
    }
  }

  logger(data) {
    if (this.secure) {
      if (data) {
        if (this.secure.logger) {
          return this.secure.logger.apply(this.secure, arguments);
        }
      }
      if (this.secure.logger) {
        return this.secure.logger(this.toString(), "ERROR", `${clc.magenta(this.code)} ${clc.red(this.method)}`);
      }
    }
    return super.logger(data);
  }

  parserSecure() {
    this.securedArea = this.secure.name;
  }

  toString() {
    switch (this.errorType) {
    case "securityError":
      if (kernel && kernel.environment === "prod") {
        return ` ${clc.blue("Type :")} ${this.errorType} ${clc.blue("Url :")} ${this.url} ${clc.red(this.message)}`;
      }
      let err = ` ${clc.red(this.message)}
        ${clc.blue("Name :")} ${this.name}
        ${clc.blue("Type :")} ${this.errorType}
        ${clc.white("Secure Area :")} ${this.securedArea}
        ${clc.blue("Url :")} ${this.url}
        ${clc.red("Code :")} ${this.code}
        ${clc.red("Message :")} ${this.message}
        ${clc.green("Bundle :")} ${this.bundle}
        ${clc.green("Controller :")} ${this.controller}
        ${clc.green("Action :")} ${this.action}`;
        if (kernel.debug) {
          err += `
            ${clc.green("Stack :")} ${this.stack}`;
        }
        return err;
    default:
      return super.toString();
    }
  }
}

nodefony.securityError = securityError;
module.exports = securityError;
