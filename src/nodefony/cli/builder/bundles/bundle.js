const SandBox = require("../sandbox/sandBoxBuilder.js");
const Vue = require("../vue/vueBuilder.js");
const React = require("../react/reactBuilder.js");

module.exports = class generateBundle extends nodefony.Builder {

  constructor(cli, cmd, args) {
    super(cli, cmd, args);
    this.name = null;
    this.location = null;
    this.pathSkeleton = path.resolve(__dirname, "skeletons");
    if (this.cmd === "generate:bundle" || this.cmd === "create:bundle") {
      if (args && args[0]) {
        this.name = args[0];
        this.location = args[1] || path.resolve(".");
      }
    }
    nodefony.extend(this.cli.response, {
      module: nodefony.projectName,
      projectName: nodefony.projectName,
      authorName: this.cli.response.config.App.authorName,
      authorEmail: this.cli.response.config.App.authorMail,
      projectYear: this.cli.response.config.App.projectYear,
      domain: this.cli.response.configKernel.system.domain,
      local: this.cli.response.config.App.locale,
      projectYearNow: new Date().getFullYear(),
      addon: false
    });


    this.setEnv();
  }

  setEnv() {
    process.env.NODE_ENV = "development";
  }

  interaction() {
    return this.cli.prompt([{
        type: 'list',
        name: 'front',
        default: 0,
        pageSize: 5,
        choices: ["Sandbox (without Front framwork)", "Vue.js", "React"],
        message: 'Choose Bundle Type (Mapping Front Framework in Bundle) :',
        filter: (value) => {
          let front = null;
          switch (value) {
            case "Sandbox (without Front framwork)":
              front = "sandbox";
              break;
            case "Vue.js":
              front = "vue";
              break;
            case "React":
              front = 'react';
              break;
            default:
              front = value;
          }
          return front;
        }
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
      }).catch(e => {
        throw e;
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

      };
    } catch (e) {
      throw e;
    }
  }
};