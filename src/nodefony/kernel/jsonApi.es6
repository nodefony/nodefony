class JsonApi extends nodefony.Service {
  constructor(name = "api", version = "1.0.0", description = "API", context = null) {
    const container = context ? context.container : kernel.container;
    super(name, container, false);
    this.name = null;
    this.version = null;
    this.description = null;
    this.context = null;
    this.parseArgs.call(this, ...arguments);
    this.debug = kernel.debug;
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
      this.bundle = this.context.get("bundle");
      this.debug = this.kernel.debug;
      this.context.setContextJson();
      this.json.url = this.context.url || "";
      this.json.method = this.context.method;
      this.json.scheme = this.context.scheme;
    }
  }

  parseArgs(name, version, description, context) {
    switch (nodefony.typeOf(name)) {
      case "string":
        this.name = name;
        this.version = version;
        this.description = description;
        this.context = context;
        this.basePath = "";
        break;
      case "object":
        this.name = name.name;
        this.version = name.version;
        this.description = name.description;
        this.context = version;
        this.basePath = name.basePath;
        break;
      default:
        throw new Error(`Constructor JsonApi bad arguments  : ${arguments}`);
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
    const errorType = nodefony.Error.isError(data);
    if (errorType) {
      obj.errorType = errorType;
      obj.result = null;
      obj.error = data;
      obj.severity = severity || "ERROR";
      if (data.name) {
        obj.errorType = data.name;
      }
      if (data.code) {
        obj.code = data.code;
      } else {
        obj.code = 400;
      }
      if( data.errorCode){
        obj.errorCode = data.errorCode;
      }
      if (!obj.message) {
        obj.message = data.message;
      }
      if (!data.message && this.context ) {
        obj.message = this.context.response.getStatusMessage(obj.code);
      }
      return data ;
    }
    if (!obj.message && this.context) {
      obj.message = this.context.response.getStatusMessage(obj.code);
    }
    obj.result = null;
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
        json.code = code || this.context.response.getStatusCode();
        this.sanitize(payload, json, severity);
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
      json.code = code || 200 ;
      this.sanitize(payload, json, severity);
      return json;
    } catch (e) {
      throw e;
    }
  }

  renderError(error, code, message = "", severity = "ERROR", messageID = null) {
    return this.render(error, code, message, severity, messageID);
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

  // schema api management

  setSchema(config = {}, entity = null) {
    if (config.openapi) {
      this.schema = new nodefony.openApiSchema(this, config, entity);
      return this.schema;
    }
    throw new nodefony.Error("schema api not supported ");
  }

  getSchema(config = {}, entity = null) {
    try {
      if (config) {
        this.setSchema(config, entity);
      }
      if (this.schema) {
        let conf = this.schema.getConfig();
        if (conf.components && conf.components.schemas) {
          conf.components.schemas[this.name] = this.getOpenApiSchema();
        }
        return conf;
      }
      return {};
    } catch (e) {
      throw e;
    }
  }

  renderSchema(config = {}, entity = null, code = 200) {
    try {
      let conf = this.getSchema(config, entity);
      if (this.context) {
        const controller = this.context.get("controller");
        return controller.renderJson(conf, code);
      }
      return conf;
    } catch (e) {
      throw e;
    }
  }

  getOpenApiSchema() {
    return {
      type: "object",
      properties: {
        api: {
          type: "string"
        },
        version: {
          type: "string",
          format: "semver"
        },
        result: {
          AnyValue: {
            nullable: true,
            description: "Can be any value, including `null`"
          }
        },
        message: {
          type: "string"
        },
        messageId: {
          type: "string"
        },
        error: {
          $ref: "#/components/schemas/NodefonyError"
        },
        errorCode: {
          type: "integer",
          format: "int32"
        },
        errorType: {
          type: "string"
        },
        debug: {
          type: "boolean"
        },
        url: {
          type: "string"
        },
        method: {
          type: "string",
          enum: [
            "GET",
            "POST",
            "OPTIONS",
            "PUT",
            "PATCH",
            "TRACE",
            "DELETE",
            "HEAD"
          ]
        },
        scheme: {
          type: "string",
          enum: [
            "HTTP",
            "HTTPS",
            "WEBSOCKET",
            "WEBSOCKET_SECURE"
          ]
        },
        severity: {
          type: "string"
        },
        code: {
          type: "integer",
          format: "int32",
        }
      },
      example: `
{
  "api": ${this.name},
  "version": ${this.version},
  "result": [],
  "message": "OK",
  "messageId": null,
  "error": null,
  "errorCode": null,
  "errorType": null,
  "debug": false,
  "url": "https://0.0.0.0:5152/api/jwt/login?username=admin&passwd=admin",
  "method": "POST",
  "scheme": "https",
  "severity": "INFO",
  "code": 200
}
      `
    };
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
