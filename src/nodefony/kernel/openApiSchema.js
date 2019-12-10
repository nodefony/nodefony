const spdx = require('spdx');

class openApiSchema extends nodefony.Service {
  constructor(api, config, entity) {
    super("openApiSchema", api.container, false);
    this.api = api;
    this.orm = this.kernel.getORM();
    this.ormName = this.orm.name;
    this.entity = entity;
    this.obj = {
      openapi: "3.0.2",
      security: [],
      paths: {},
      components: {
        schemas: {}
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

}

nodefony.openApiSchema = openApiSchema;
module.exports = openApiSchema;
