const spdx = require('spdx');

class openApiSchema extends nodefony.Service {
  constructor(api, config, entity) {
    const container = api ? api.container : kernel.container;
    super("openApiSchema", container, false);
    this.api = api;
    this.orm = this.kernel.getORM();
    this.ormName = this.orm.name;
    this.entity = entity;
    this.obj = {
      openapi: "3.0.2",
      security: [],
      paths: {},
      components: {
        schemas: {
          NodefonyError: this.getErrorSchema(),
          Pdu: this.getPduSchema(),
        },
        responses : this.getResponseSchema()
      },
      tags: [],
      externalDocs: {}
    };
    if (config) {
      this.loadConfig(config);
    }
  }

  loadConfig(config, entity) {
    this.setConfig(entity);
    return nodefony.extend(true, this.obj, config);
  }

  getConfig() {
    return this.obj;
  }

  setConfig(entity = this.entity) {
    this.obj.info = this.getInfo();
    this.obj.servers = this.getServers();
    if (entity) {
      this.setSchema(entity.name, entity);
    }
    return this.obj;
  }

  getInfo() {
    return {
      title: this.api.name,
      version: this.api.version,
      description: this.api.description,
      contact: {
        name: this.kernel.app.settings.App.authorName,
        url: `https://${this.kernel.domain}`,
        email: this.kernel.app.settings.App.authorMail
      },
      termsOfService: "",
      license: this.getLicence()
    };
  }

  getServers() {
    return [{
      "url": `https://${this.kernel.domain}:{port}`,
      "description": this.kernel.description,
      "variables": {
        "port": {
          "enum": [
            `${this.kernel.httpsPort}`,
            "443"
          ],
          "default": `${this.kernel.httpsPort}`
        },
        "basePath": {
          "default": this.api.basePath || ""
        }
      }
    }];
  }

  getLicence(licence = "", url = "") {
    const bundle = this.get("bundle");
    if (bundle) {
      if (bundle.package && bundle.package.license) {
        try {
          if (bundle.package.license !== "UNLICENSED") {
            spdx.parse(bundle.package.license);
            return {
              name: bundle.package.license
            };
          }
          return {
            name: bundle.package.license
          };
        } catch (e) {
          this.log(e, "WARNING");
          spdx.licenses.every((element) => {
            this.log(element, "WARNING");
            return typeof element === 'string';
          });
          this.log("licence not valid  ", "WARNING");
          this.log("Show licence param in package.json and use spdx to valid : https://github.com/kemitchell/spdx.js ");
          this.log("Or use <UNLICENSED> value");
        }
      }
    }
    if (licence) {
      return {
        name: licence,
        url: url
      };
    }
    return {
      name: "UNLICENSED"
    };
  }

  setSchema(name, entity = this.entity) {
    try {
      if (name) {
        this.obj.components.schemas[name] = {};
      }
      if (entity) {
        this.obj.components.schemas[name] = this.orm.getOpenApiSchema(entity);
      }
    } catch (e) {
      this.log(e, "WARNING");
      return this.obj.components.schemas[name];
    }
  }


  getResponseSchema(){
    return {
      '400': {
        description: "Bad Request",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/NodefonyError"
            }
          }
        }
      },
      '401': {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/NodefonyError"
            }
          }
        }
      },
      '403': {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/NodefonyError"
            }
          }
        }
      },
      '404': {
        description: "Not Found",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/NodefonyError"
            }
          }
        }
      },
      '405': {
        description: "Method Not Allowed",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/NodefonyError"
            }
          }
        }
      },
      '406': {
        description: "Not Acceptable",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/NodefonyError"
            }
          }
        }
      },
      '412': {
        description: "Precondition Failed",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/NodefonyError"
            }
          }
        }
      },
      '415': {
        description: "Unsupported Media Type",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/NodefonyError"
            }
          }
        }
      },
      '500': {
        description: "Internal Server Error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/NodefonyError"
            }
          }
        }
      },
      '501': {
        description: "Not Implemented",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/NodefonyError"
            }
          }
        }
      },
      default:{
        description: "nodefony unexpected error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/NodefonyError"
            }
          }
        }
      }
    };
  }

  getErrorSchema() {
    return {
      type: "object",
      properties: {
        server: {
          type: "string"
        },
        code: {
          type: "integer",
          format: "int32",
        },
        url: {
          type: "string"
        },
        message: {
          type: "string"
        },
        pdu: {
          "$ref": "#/components/schemas/Pdu"
        },
      },
      example: `
{
  "server": "nodefony",
  "code": 401,
  "pdu": {
    "timeStamp": 1576059686158,
    "uid": 866,
    "severity": 3,
    "severityName": "ERROR",
    "typePayload": "object",
    "payload": {
      "code": 401,
      "message": "jwt expired",
      "bundle": "users",
      "controller": "api",
      "action": "",
      "url": "https://localhost:5152/api/users?limit=2",
      "stack": "securityError: jwt expired\n    at securedArea.handleError (/Users/cci/repository/nodefony-core/src/nodefony/kernel/security/secureArea.es6:86:25)\n    at /Users/cci/repository/nodefony-core/src/nodefony/kernel/security/secureArea.es6:240:28\n    at tryCallOne (/Users/cci/repository/nodefony-core/src/nodefony/node_modules/promise/lib/core.js:37:12)\n    at /Users/cci/repository/nodefony-core/src/nodefony/node_modules/promise/lib/core.js:123:15\n    at flush (/Users/cci/repository/nodefony-core/src/nodefony/node_modules/asap/raw.js:50:29)\n    at processTicksAndRejections (internal/process/task_queues.js:79:11)"
    },
    "moduleName": "nodefony",
    "msgid": "",
    "msg": ""
  },
  "url": "https://localhost:5152/api/users?limit=2",
  "message": "jwt expired"
}
          `
    };
  }

  getPduSchema() {
    return {
      type: "object",
      properties: {
        timeStamp: {
          type: "string",
          format: "date-time"
        },
        uid: {
          type: "string",
          format: "uuid"
        },
        severity: {
          type: "integer",
          format: "int32",
          enum: [0,1,2,3,4,5,6,7]
        },
        severityName: {
          type: "string",
          enum: [
            "EMERGENCY",
            "ALERT",
            "CRITIC",
            "ERROR",
            "WARNING",
            "NOTICE",
            "INFO",
            "DEBUG"
          ]
        },
        typePayload: {
          type: "string"
        },
        payload: {
          type: "object"
        }
      },
      example: `
"pdu": {
  "timeStamp": 1576059686158,
  "uid": 866,
  "severity": 3,
  "severityName": "ERROR",
  "typePayload": "object",
  "payload": {
    "code": 401,
    "message": "jwt expired",
    "bundle": "users",
    "controller": "api",
    "action": "",
    "url": "https://localhost:5152/api/users?limit=2",
    "stack": "securityError: jwt expired\n    at securedArea.handleError (/Users/cci/repository/nodefony-core/src/nodefony/kernel/security/secureArea.es6:86:25)\n    at /Users/cci/repository/nodefony-core/src/nodefony/kernel/security/secureArea.es6:240:28\n    at tryCallOne (/Users/cci/repository/nodefony-core/src/nodefony/node_modules/promise/lib/core.js:37:12)\n    at /Users/cci/repository/nodefony-core/src/nodefony/node_modules/promise/lib/core.js:123:15\n    at flush (/Users/cci/repository/nodefony-core/src/nodefony/node_modules/asap/raw.js:50:29)\n    at processTicksAndRejections (internal/process/task_queues.js:79:11)"
  }
          `
    };
  }
}

nodefony.openApiSchema = openApiSchema;
module.exports = openApiSchema;
