const spdx = require('spdx');

class openApi extends nodefony.jsonApi {

  constructor(service, options) {
    super({
      name: "users",
      version: "1.0.0",
      description: "users Rest Api"
    });
    this.service = service;
  }

  setSchema(config = {}) {
    this.schema = new nodefony.openApiSchema(config);
  }

  getSchema() {
    let obj = {
      openapi: "3.0.2"
    };
    //obj[nodefony.projectName] = nodefony.projectVersion;
    obj.info = this.schema.getInfo();
    obj.servers = this.schema.getServers();
    obj.security = [];
    obj.paths = {};
    obj.components = this.schema.getComponents();
    obj.tags = {};
    obj.externalDocs = {};
    return obj;
  }

  getInfo() {
    return {
      title: this.name,
      version: this.version,
      description: this.description,
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
          "default": "api"
        }
      }
    }];
  }

  getComponents() {
    let comp = {};
    try {
      if (this.service.getDefinitions) {
        comp.schemas = {};
        comp.schemas[this.service.name] = this.service.getDefinitions();
      }
      return comp;
    } catch (e) {
      this.log(e, "WARNING");
      return comp;
    }
  }

  getLicence() {
    if (this.context) {
      const bundle = this.get("bundle");
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
    return {
      name: "UNLICENSED"
    };
  }

}

module.exports = usersApi;