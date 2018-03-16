module.exports = nodefony.register("httpError", function () {

  class httpError extends Error {

    constructor(message, code, container) {
      super(message);
      this.container = container;
      this.context = null;
      this.code = code || null;
      this.bundle = "Not Defined";
      this.controller = "Not Defined";
      this.action = "Not Defined";
      this.url = "Not Defined";
      this.xjson = null;
      this.resolver = null;
      if (message) {
        this.parseMessage(message);
      } else {
        this.message = "Internal Server Error";
      }
      if (this.container) {
        this.parserContainer();
      }
    }

    logger(data) {
      if (this.context) {
        if (data) {
          return this.context.logger.apply(this.context, arguments);
        }
        return this.context.logger(this, "ERROR", `${clc.magenta(this.code)} ${clc.red(this.method)}`);
      }
      return console.log(this.toString());
    }

    parserContainer() {
      this.bundle = this.container.get("bundle") ? this.container.get("bundle").name : "Not Defined";
      this.controller = this.container.get("controller") ? this.container.get("controller").name : "Not Defined";
      this.action = this.container.get("action") ? this.container.get("action") : "Not Defined or Not Called";
      this.context = this.container.get('context');
      if (this.context) {
        this.url = this.context.url || "Not Defined";
        this.method = this.context.method;
        this.scheme = this.context.scheme;
        if (!this.code && this.context.response) {
          this.code = this.context.response.getStatusCode();
          if (this.code === 1000 || this.code === 200) {
            this.code = 500;
          }
        }
        if (this.xjson && this.context.setXjson) {
          this.context.setXjson(this.xjson);
        }
        if (this.context.response) {
          let st = this.context.response.setStatusCode(this.code, this.message);
          this.code = st.code;
          this.message = st.message;
          this.resolve();
        }
        if (this.context.isJson) {
          try {
            this.pdu = JSON.stringify(new nodefony.PDU({
              code: this.code,
              message: this.message,
              bundle: this.bundle,
              controller: this.controller,
              action: this.action,
              url: this.url,
              stack: this.stack
            }, "ERROR"));
          } catch (e) {
            this.message = e.message;
            this.logger(e, "WARNING");
          }
        }
      }
    }

    toString() {
      return `${clc.red(this.message)}
      ${clc.blue("URL :")} ${this.url}
      ${clc.red("CODE :")} ${this.code}
      ${clc.red("MESSAGE :")} ${this.message}
      ${clc.green("BUNDLE :")} ${this.bundle}
      ${clc.green("CONTROLLER :")} ${this.controller}
      ${clc.green("ACTION :")} ${this.action}
      ${clc.green("STACK :")} ${this.stack}`;
    }

    resolve() {
      switch (this.code) {
      case 404:
        this.resolver = this.context.router.resolveName(this.context, "frameworkBundle:default:404");
        break;
      case 401:
        this.resolver = this.context.router.resolveName(this.context, "frameworkBundle:default:401");
        break;
      case 403:
        this.resolver = this.context.router.resolveName(this.context, "frameworkBundle:default:403");
        break;
      case 408:
        this.resolver = this.context.router.resolveName(this.context, "frameworkBundle:default:timeout");
        break;
      default:
        this.resolver = this.context.router.resolveName(this.context, "frameworkBundle:default:exceptions");
        if (this.code < 400) {
          this.code = 500;
        }
      }
    }

    parseMessage(message) {
      switch (nodefony.typeOf(message)) {
      case "object":
        if (message.status) {
          this.code = message.status;
        }
        if (message.code) {
          this.code = message.code;
        }
        if (message.xjson) {
          this.xjson = message.xjson;
        }
        try {
          this.message = JSON.stringify(message);
        } catch (e) {
          this.message = e;
          this.code = 500;
        }
        break;
      case "string":
        this.message = message;
        break;
      case "Error":
        this.message = message.message;
        if (message.code) {
          this.code = message.code;
        }
        if (message.xjson) {
          this.xjson = message.xjson;
        }
        this.stack = message.stack;
        break;
      }
    }
  }

  return httpError;
});