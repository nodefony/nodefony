const Vue = require("../vue/vueBuilder.js");
const React = require("../react/reactBuilder.js");
const Bootstrap = require("../bootstrap/bootstrapBuilder.js");
const SandBox = require("../sandbox/sandBoxBuilder.js");
const WorkBox = require("../workbox/workBoxBuilder.js");

module.exports = class generateProject extends nodefony.Builder {

  constructor(cli, cmd, args) {
    super(cli, cmd, args);
    this.name = null;
    this.location = null;
    this.pathSkeleton = path.resolve(__dirname, "skeletons");
    if (this.cmd === "create:project" || this.cmd === "create") {
      if (args && args[0]) {
        this.name = args[0];
        this.location = args[1] || path.resolve(".");
      }
    }
    nodefony.extend(this.cli.response, {
      name: this.name || "nodefony-starter",
      description: "Project Description",
      front: "sandbox",
      path: this.location || path.resolve("."),
      authorFullName: "admin",
      authorMail: "admin@nodefony.com",
      domain: "0.0.0.0",
      portHttp: "5151",
      portHttps: "5152",
      bundle: false,
      version: nodefony.version,
      year: new Date().getFullYear(),
      orm: "sequelize",
      npm: 'npm'
    });
    if (!this.name) {
      this.name = this.cli.response.name;
    }
    this.setEnv();
  }

  setEnv() {
    process.env.NODE_ENV = "development";
  }

  generate(response) {
    return super.generate(response, true)
      .then(() => {
        return this.buildFront(this.cli.response, this.path)
          .run(true)
          .then(() => {
            return response;
          })
          .catch((e) => {
            throw e;
          });
      });
  }

  interaction() {
    return this.cli.prompt([{
        type: 'input',
        name: 'name',
        default: this.cli.response.name,
        message: 'Enter Nodefony Project Name',
        validate: (value) => {
          if (value && value !== "nodefony") {
            this.name = value;
            nodefony.projectName = value;
            return true;
          }
          return `${value} Unauthorised Please enter a valid project name`;
        }
      }, {
        type: 'input',
        name: 'description',
        message: 'Enter short description',
        //default: `${this.cli.response.description} ${this.name}`,
        validate: (value) => {
          if (!value) {
            this.cli.response.description = `${this.cli.response.description} ${this.name}`;
          }
          return true;
        },
        filter: (value) => {
          if (value === "Project Description") {
            return `Project ${this.name}`;
          }
          return value;
        }
      }, {
        type: 'list',
        name: 'front',
        default: 0,
        pageSize: 5,
        choices: ["Sandbox (without Front framwork)", "Bootstrap", "Vue.js", "React", "Progressive Web App (PWA) Workbox"],
        message: 'Choose Project Application Type (Mapping Front Framework in App) :',
        filter: (value) => {
          let front = null;
          switch (value) {
          case "Sandbox (without Front framwork)":
            front = "sandbox";
            break;
          case "Bootstrap":
            front = 'bootstrap';
            break;
          case "Vue.js":
            front = "vue";
            break;
          case "React":
            front = 'react';
            break;
          case "Progressive Web App (PWA) Workbox":
            front = 'workbox';
            break;
          default:
            front = value;
          }
          return front;
        }
      }, {
        type: 'input',
        name: 'path',
        default: this.cli.response.path,
        message: 'Project Path',
        validate: (value) => {
          let myPath = null;
          try {
            myPath = new nodefony.fileClass(path.resolve(value));
          } catch (e) {
            return e.message;
          }
          let res = nodefony.isNodefonyTrunk(myPath.path);
          if (res) {
            return "You can't install project in nodefony Trunk project !";
          }
          if (value) {
            this.location = value;
            return true;
          }
          return 'Please enter a valid project Path';
        }
      }, {
        type: 'input',
        name: 'authorFullName',
        default: this.cli.response.authorFullName,
        message: 'Please Enter Author Full Name',
        filter: (value) => {
          if (!value) {
            return this.cli.response.authorFullName;
          }
          return value;
        }
      }, {
        type: 'input',
        name: 'authorMail',
        default: this.cli.response.authorMail,
        message: 'Please Enter Email Author ',
        filter: (value) => {
          if (!value) {
            return this.cli.response.authorMail;
          }
          return value;
        }
      }, {
        type: 'input',
        name: 'domain',
        default: this.cli.response.domain,
        message: 'Enter Server Domain :',
      }, {
        type: 'input',
        name: 'portHttp',
        default: this.cli.response.portHttp,
        message: 'Enter server Domain http Port  :',
      }, {
        type: 'input',
        name: 'portHttps',
        default: this.cli.response.portHttps,
        message: 'Enter Server Secure Domain https Port  :',
      }, {
        type: 'list',
        name: 'orm',
        default: 0,
        pageSize: 2,
        choices: ["sequelize", "mongoose"],
        message: 'Choose default ORM  (Mapping Objet Relationnel) :'
      }, {
        type: 'list',
        name: 'packageManager',
        message: 'Choose a default Package Manager : ',
        default: 0,
        pageSize: 2,
        choices: ["npm", "yarn"],
        filter: (value) => {
          if (this.cli[value]) {
            this.cli.packageManager = this.cli[value];
          } else {
            throw new Error(`Package Manager ${value} not available ! `);
          }
          return value;
        }
      }, {
        type: 'confirm',
        name: 'bundle',
        message: 'Do You Want Generate Bundle?',
        default: this.cli.response.bundle
      }])
      .then((response) => {
        nodefony.extend(this.cli.response, response);
        this.path = path.resolve(this.location, response.name);
        if (this.cli.exists(this.path)) {
          this.logger(`${this.path} Already exist`, "WARNING");
          return this.removeInteractivePath(this.path)
            .then((response) => {
              nodefony.extend(this.cli.response, response);
              if (response.remove) {
                return this.cli.response;
              }
              let error = new Error(`${this.path} Already exist`);
              error.code = 0;
              throw error;
            }).catch((e) => {
              throw e;
            });
        }
        return this.cli.response;
      });
  }

  buildFront(response, location) {
    this.Front = null;
    switch (response.front) {
    case "vue":
      this.Front = new Vue(this.cli, this.cmd, this.args);
      break;
    case "react":
      this.Front = new React(this.cli, this.cmd, this.args);
      break;
    case 'bootstrap':
      this.Front = new Bootstrap(this.cli, this.cmd, this.args);
      break;
    case 'workbox':
      this.Front = new WorkBox(this.cli, this.cmd, this.args);
      break;
    case 'sandbox':
    default:
      this.Front = new SandBox(this.cli, this.cmd, this.args);
      break;
    }
    this.Front.setLocation(location, "app");
    return this.Front;
  }

  createBuilder() {
    try {
      return {
        name: this.cli.response.name,
        type: "directory",
        childs: [{
          name: "package.json",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "package.json.skeleton"),
          params: this.cli.response
        }, {
          name: ".gitignore",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "gitignore.skeleton"),
          params: this.cli.response
        }, {
          name: ".jshintrc",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "jshintrc.skeleton"),
          params: this.cli.response
        }, {
          name: ".jshintignore",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "jshintignore.skeleton"),
          params: this.cli.response
        }, {
          name: ".editorconfig",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "editorconfig.skeleton"),
          params: this.cli.response
        }, {
          name: "web",
          type: "directory"
        }, {
          name: "tmp",
          type: "directory"
        }, {
          name: "config",
          type: "directory",
          childs: [{
            name: "certificates",
            type: "directory"
              }, {
            name: "openssl",
            type: "directory",
            childs: [{
              name: "ca",
              type: "directory",
              childs: [{
                name: "openssl.cnf",
                type: "file",
                skeleton: path.resolve(this.pathSkeleton, "config", "openssl", "ca", "openssl.cnf.skeleton"),
                params: this.cli.response
                }]
              }, {
              name: "ca_intermediate",
              type: "directory",
              childs: [{
                name: "openssl.cnf",
                type: "file",
                skeleton: path.resolve(this.pathSkeleton, "config", "openssl", "ca_intermediate", "openssl.cnf.skeleton"),
                params: this.cli.response
                  }]
              }]
              }, {
            name: "config.js",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "config", "config.js.skeleton"),
            params: this.cli.response
                  }, {
            name: "pm2.config.js",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "config", "pm2.config.js.skeleton"),
            params: this.cli.response
              }]
        }, {
          name: "bin",
          type: "directory",
          childs: [{
            name: "generateCertificates.sh",
            type: "file",
            chmod: 755,
            skeleton: path.resolve(this.pathSkeleton, "bin", "generateCertificates.sh.skeleton"),
            params: this.cli.response
                  }]
        }, {
          name: "src",
          type: "directory",
          childs: [{
            name: "bundles",
            type: "directory"
                  }]
        }, {
          name: "doc",
          type: "directory",
          childs: [{
            name: "index.html.twig",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "documentation.html.twig")
                  }]
        }, {
          name: "README.md",
          type: "copy",
          path: path.resolve(this.pathSkeleton, "README.md")
        }]
      };
    } catch (e) {
      throw e;
    }
  }

};