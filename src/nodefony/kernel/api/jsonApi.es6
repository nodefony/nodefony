const Api = require(path.resolve(__dirname, "api.es6"));
class JsonApi extends Api {
  constructor (config, context = null) {
    super(config, context);
    this.json = {
      api: this.name,
      version: this.version,
      // result: null,
      message: "",
      messageId: null
      // error: null,
      // errorCode: null,
      // errorType: null,
      // debug: this.debug
    };

    this.setResultName(this.options.resultName);
    if (this.debug) {
      this.json.debug = this.debug;
    }
    if (this.context) {
      this.json.url = this.context.url || "";
      this.json.method = this.context.method;
      this.json.scheme = this.context.scheme;
      this.context.once("onError", (e) => this.renderError(e));
    }
  }

  setResultName (name = "result", value = null) {
    this.resultName = name;
    this.json[this.resultName] = value;
  }

  isError (e, json = {}) {
    if (nodefony.isArray(e)) {
      const errorType = nodefony.Error.isError(e[0]);
      if (errorType) {
        json.errors = e;
        return this.isError(e[0], json);
      }
    } else {
      let errorType = nodefony.Error.isError(e);
      if (errorType) {
        if (!this.kernel.debug && e.stack) {
          delete e.stack;
        }
        if (e.name) {
          errorType = e.name;
        }
        if (!json.severity) {
          json.severity = "ERROR";
        }
        if (!json.code) {
          json.code = e.code || 400;
        }
        if (!json.message) {
          if (!e.message && this.context) {
            json.message = this.context.response.getStatusMessage(json.errorCode);
          } else {
            json.message = e.message;
          }
        }
        json.errorType = errorType;
        json.error = e.toJSON();
        json.errorCode = e.code || 400;
      }
    }
    return json;
  }

  sanitize (payload, json) {
    this.isError(payload, json);
    if (json.error) {
      return json[this.resultName] = null;
    }
    if (!json.severity) {
      json.severity = "INFO";
    }
    if (!json.code) {
      if (this.context && this.context.response) {
        json.code = this.context.response.getStatusCode();
      } else {
        json.code = 200;
      }
    }
    if (!json.message && this.context && this.context.response) {
      json.message = this.context.response.getStatusMessage(json.code);
    }
    return json[this.resultName] = payload;
  }

  render (payload, code, message = "", severity = null, messageID = null) {
    try {
      const json = nodefony.extend(this.json, {
        severity,
        code,
        message,
        messageId: messageID
      });
      this.sanitize(payload, json);
      if (this.context) {
        const controller = this.context.get("controller");
        if (!controller) {
          return json;
          // this.log(payload,"ERROR")
          // this.log(`Controller not found`,"ERROR")
          // throw new Error(`Controller not found`);
        }
        if (this.debug) {
          json.pdu = new nodefony.PDU({
            message: json.message,
            bundle: controller.bundle.name,
            controller: controller.name,
            action: this.context.get("action") ? this.context.get("action") : "",
            stack: json.error ? json.error.stack : null
          }, json.severity, this.name, messageID, message);
        }
        return controller.renderJson(json, json.code);
      }
      return json;
    } catch (e) {
      throw e;
    }
  }

  renderAsync (payload, code, message = "", severity = null, messageID = null) {
    try {
      const json = nodefony.extend(this.json, {
        severity,
        code,
        message,
        messageId: messageID
      });
      this.sanitize(payload, json);
      if (this.context) {
        const controller = this.context.get("controller");
        if (this.debug) {
          json.pdu = new nodefony.PDU({
            message: json.message,
            bundle: controller.bundle.name,
            controller: controller.name,
            action: this.context.get("action") ? this.context.get("action") : "",
            stack: json.error ? json.error.stack : null
          }, json.severity, this.name, messageID, message);
        }
        return controller.renderJsonAsync(json, json.code);
      }
      return json;
    } catch (e) {
      throw e;
    }
  }


  renderPdu (payload, code, message = "", severity = "INFO", messageID = null, api = this.name) {
    const json = nodefony.extend({

    }, this.json);
    this.sanitize(payload, json, severity);
    if (this.context) {
      const controller = this.context.get("controller");
      json.code = code || this.context.response.getStatusCode();
      if (!json.message) {
        json.message = this.context.response.getStatusMessage(json.code);
      }
      return controller.renderJson(json, json.code);
    }
    return new nodefony.PDU(json, severity, api, messageID, message);
  }

  renderError (error, code, message = "", severity = "ERROR", messageID = null) {
    return this.render(error, code, message, severity, messageID);
  }
}

nodefony.api.Json = JsonApi;
module.exports = JsonApi;
