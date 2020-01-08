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
    let errorType = null;
    let myData = data;
    if (nodefony.isArray(data)) {
      errorType = nodefony.Error.isError(data[0]);
      if (errorType) {
        obj.error = data;
        myData = data[0];
      }
    } else {
      errorType = nodefony.Error.isError(data);
    }
    if (errorType) {
      obj.errorType = errorType;
      obj.result = null;
      if (!this.kernel.debug && myData.stack) {
        delete myData.stack;
      }
      obj.error = data;
      obj.severity = severity || "ERROR";
      if (myData.name) {
        obj.errorType = myData.name;
      }
      if (!obj.code) {
        if (myData.code) {
          obj.code = myData.code;
        } else {
          obj.code = 400;
        }
      }
      if (myData.errorCode) {
        obj.errorCode = myData.errorCode;
      }
      if (!obj.message) {
        obj.message = myData.message;
      }
      if (!myData.message && this.context) {
        obj.message = this.context.response.getStatusMessage(obj.code);
      }
      return myData;
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
        let res = this.sanitize(payload, json, severity);
        if (!json.code) {
          json.code = this.context.response.getStatusCode();
        }
        if (this.kernel.debug) {
          json.pdu = new nodefony.PDU({
            message: json.message,
            bundle: controller.bundle.name,
            controller: controller.name,
            action: this.context.get("action") ? this.context.get("action") : "",
            stack: json.error ? res.stack : null
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

  renderError(error, code, message = "", severity = "ERROR", messageID = null) {
    return this.render(error, code, message, severity, messageID);
  }

}

nodefony.api.Json = JsonApi;
module.exports = JsonApi;