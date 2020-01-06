const Api = require(path.resolve(__dirname, "api.es6"));
class JsonApi extends Api {

  constructor(config, context = null) {
    super(config, context);
    this.json = {
      api: this.name,
      version: this.version,
      result: null,
      message: "",
      messageId: null,
      error: null,
      errorCode: null,
      errorType: null,
      debug: this.debug
    };
    if (this.context) {
      this.json.url = this.context.url || "";
      this.json.method = this.context.method;
      this.json.scheme = this.context.scheme;
    }
  }

  sanitize(data, obj, severity) {
    const errorType = nodefony.Error.isError(data);
    if (errorType) {
      obj.errorType = errorType;
      obj.result = null;
      if (!this.kernel.debug && data.stack) {
        delete data.stack;
      }
      obj.error = data;
      obj.severity = severity || "ERROR";
      if (data.name) {
        obj.errorType = data.name;
      }
      if (!obj.code) {
        if (data.code) {
          obj.code = data.code;
        } else {
          obj.code = 400;
        }
      }
      if (data.errorCode) {
        obj.errorCode = data.errorCode;
      }
      if (!obj.message) {
        obj.message = data.message;
      }
      if (!data.message && this.context) {
        obj.message = this.context.response.getStatusMessage(obj.code);
      }
      return data;
    }
    if (!obj.message && this.context) {
      obj.message = this.context.response.getStatusMessage(obj.code);
    }
    return obj.result = data;
  }

  render(payload, code, message = "", severity = null, messageID = null) {
    try {
      let json = nodefony.extend(this.json, {
        severity: severity || "INFO",
        message: message,
        messageId: messageID
      });
      if (this.context) {
        const controller = this.context.get("controller");
        json.code = code;
        this.sanitize(payload, json, severity);
        if (!json.code) {
          json.code = this.context.response.getStatusCode();
        }
        if (this.kernel.debug) {
          json.pdu = new nodefony.PDU({
            bundle: controller.bundle.name,
            controller: controller.name,
            action: this.context.get("action") ? this.context.get("action") : "",
            stack: json.error ? json.error.stack : null
          }, json.severity, this.name, messageID, message);
        }
        return controller.renderJson(json, json.code);
      }
      json.code = code || 200;
      this.sanitize(payload, json, severity);
      return json;
    } catch (e) {
      throw e;
    }
  }

  renderPdu(payload, code, message = "", severity = "INFO", messageID = null, api = this.name) {
    let json = nodefony.extend({}, this.json);
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

}

nodefony.api.Json = JsonApi;
module.exports = JsonApi;