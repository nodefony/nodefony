class JsonApi extends nodefony.Service {
  constructor(name = "api", version = "1.0.0", context = null) {
    super(name, context.container);
    this.name = name;
    this.version = version;
    this.debug = this.kernel.debug;
    //this.ormEngine = this.kernel.getORM().engine;
    this.json = {
      api: this.name,
      version: this.version,
      result: null,
      message: "",
      messageId: null,
      error: null,
      errorCode: null,
      debug: this.debug
    };
    if (context) {
      this.context = context;
      this.context.setContextJson();
      this.json.url = this.context.url || "";
      this.json.method = this.context.method;
      this.json.scheme = this.context.scheme;
    }
  }

  getDatatype(data, obj, severity) {
    switch (nodefony.typeOf(data)) {
    case "error":
      obj.error = data;
      if (!severity) {
        obj.severity = "ERROR";
      }
      if (data.code) {
        obj.errorCode = data.code;
      }
      return data;
    default:
      return data;
    }
  }

  render(payload, code, message = "", severity = "INFO", messageID = null) {
    try {
      let json = nodefony.extend({}, this.json, {
        severity: severity,
        message: message,
        messageId: messageID
      });
      json.result = this.getDatatype(payload, json, severity);
      if (this.context) {
        const controller = this.context.get("controller");
        json.code = code || this.context.response.getStatusCode();
        if (!json.message) {
          json.message = this.context.response.getStatusMessage(json.code);
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
      return json;
    } catch (e) {
      throw e;
    }
  }

  renderPdu(payload, code, message = "", severity = "INFO", messageID = null, api = this.name) {
    let json = nodefony.extend({}, this.json);
    json.result = this.getDatatype(payload, json, severity);
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

  renderOptions() {
    let obj = {
      name:this.name,
      version:this.version,
      debug:this.debug,
      accept:["application/json"],
      nodefony: {
        version: nodefony.version
      }
    };
    obj.application = {
      name: nodefony.projectName,
      version: nodefony.projectVersion,
    };
    if (this.context) {
      obj.nodefony.environment = this.kernel.environment;
      obj.nodefony.debug = this.debug;
      obj.nodefony.local = this.context.translation.defaultLocale.substr(0, 2);
    }
    return obj;
  }
}

nodefony.JsonApi = JsonApi;
module.exports = JsonApi;
