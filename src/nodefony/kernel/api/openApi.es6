const JsonApi = require(path.resolve(__dirname, "jsonApi.es6"));
class openApi extends JsonApi {

  constructor(config, context = null) {
    super(config, context);
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

}

nodefony.api.OpenApi = openApi;
module.exports = openApi;