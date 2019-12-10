class JsonApi extends nodefony.Service {
  constructor(name = "api", version = "1.0.0", description = "API", context = null) {
    const container = context ? context.container : kernel.container;
    super(name, container, false);

    this.name = name;
    this.version = version;
    this.debug = this.kernel.debug;
    this.description = description;
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
    if (context) {
      this.context = context;
      this.context.setContextJson();
      this.json.url = this.context.url || "";
      this.json.method = this.context.method;
      this.json.scheme = this.context.scheme;
    }
  }

  getDescription(dsc) {
    switch (true) {
    case dsc:
      break;
    default:
      throw new Error(`Bad api description  : ${dsc}`);

    }
  }

  /**
   *  @method logger
   */
  logger(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = clc.magenta(`JSON API ${this.name} `);
    }
    return super.logger(pci, severity, msgid, msg);
  }

  sanitize(data, obj, severity) {
    switch (nodefony.typeOf(data)) {
    case "Error":
      obj.error = data;
      obj.severity = severity || "ERROR";
      if (data.name) {
        obj.errorType = data.name;
      }
      if (data.code) {
        obj.errorCode = data.code;
      }
      if (!obj.message) {
        obj.message = data.message;
      }
      return obj.result = null;
    default:
      return obj.result = data;
    }
  }

  render(payload, code, message = "", severity = null, messageID = null) {
    try {
      let json = nodefony.extend({}, this.json, {
        severity: severity || "INFO",
        message: message,
        messageId: messageID
      });
      json.result = this.sanitize(payload, json, severity);
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

  renderError(error, code = 400, message = "", severity = "ERROR", messageID = null) {
    return this.render(error, code, message, severity, messageID);
  }

  renderPdu(payload, code, message = "", severity = "INFO", messageID = null, api = this.name) {
    let json = nodefony.extend({}, this.json);
    json.result = this.sanitize(payload, json, severity);
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

  setSchema(config = {}, entity = null) {
    if(config.openapi){
      this.schema = new nodefony.openApiSchema(this, config, entity);
      return this.schema ;
    }
    throw new nodefony.Error("schema api not supported ");
  }

  getSchema(config = {}, entity = null){
    try {
      if ( config){
        this.setSchema(config, entity);
      }
      if (this.schema){
        return this.schema.getConfig();
      }
      return {};
    }catch(e){
      throw e ;
    }
  }

  renderSchema(config = {}, entity = null, code= 200){
    try {
      let conf = this.getSchema(config, entity);
      if (this.context) {
        const controller = this.context.get("controller");
        return controller.renderJson(conf, code);
      }
      return conf ;
    }catch(e){
      throw e ;
    }
  }

  getNodefonyInfo(service) {
    let obj = {
      debug: this.debug
    };
    switch (true) {
    case service instanceof nodefony.Service:
      obj.service = {
        name: service.name
      };
      if (service.entity && service.entity.name) {
        obj.service.entity = service.entity.name;
      }
      break;
    default:
    }
    if (this.context) {
      obj.environment = this.kernel.environment;
      obj.local = this.context.translation.defaultLocale.substr(0, 2);
    }
    return obj;
  }

}

nodefony.JsonApi = JsonApi;
module.exports = JsonApi;
