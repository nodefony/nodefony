class authorizationError extends nodefony.httpError {
  constructor(message, code, context) {
    if (context) {
      super(message, code, context.container);
    } else {
      super(message, code, null);
    }
    if (context && context.token) {
      this.token = context.token;
      this.parserSecure();
    }
  }

  logger(data) {
    if (this.secure) {
      if (data) {
        return this.context.logger.apply(this.secure, arguments);
      }
      return this.context.logger(this.toString(), "ERROR", `${clc.magenta(this.code)} ${clc.red(this.method)}`);
    }
    return super.logger(data);
  }

  parserSecure() {}

  toString() {
    switch (this.errorType) {
    case "authorizationError":
      return `${clc.red(this.message)}
        ${clc.blue("Name :")} ${this.name}
        ${clc.blue("Type :")} ${this.errorType}
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

nodefony.authorizationError = authorizationError;
module.exports = authorizationError;
