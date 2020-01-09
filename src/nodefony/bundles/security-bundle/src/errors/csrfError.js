class csrfError extends nodefony.httpError {
  constructor(message, code, context) {
    if (context) {
      super(message, code, context.container);
    } else {
      super(message, code, null);
    }
  }

  toString() {
    switch (this.errorType) {
    case "csrfError":
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

nodefony.csrfError = csrfError;
module.exports = csrfError;
