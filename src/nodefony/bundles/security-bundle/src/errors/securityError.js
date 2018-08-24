module.exports = nodefony.register("securityError", function () {

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
          return this.secure.logger.apply(this.secure, arguments);
        }
        return this.secure.logger(this.toString(), "ERROR", `${clc.magenta(this.code)} ${clc.red(this.method)}`);
      }
      return super.logger(data);
    }

    parserSecure() {
      this.securedArea = this.secure.name;
    }

    toString() {
      switch (this.errorType) {
      case "securityError":
        return `${clc.red(this.message)}
        ${clc.blue("Name :")} ${this.name}
        ${clc.blue("Type :")} ${this.errorType}
        ${clc.white("Secure Area :")} ${this.securedArea}
        ${clc.blue("Url :")} ${this.url}
        ${clc.red("Code :")} ${this.code}
        ${clc.red("Message :")} ${this.message}
        ${clc.green("Bundle :")} ${this.bundle}
        ${clc.green("Controller :")} ${this.controller}
        ${clc.green("Action :")} ${this.action}
        ${clc.green("Stack :")} ${this.stack}`;
      default:
        return super.toString();
      }

    }
  }

  return securityError;
});