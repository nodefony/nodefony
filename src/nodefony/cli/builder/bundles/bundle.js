const regBundleName = /^(\w+)-bundle[\.js]{0,3}$|^(\w+)[Bb]undle[\.js]{0,3}$/;

class generateBundle extends nodefony.Builder {

  constructor(cli, cmd, args) {
    super(cli, cmd, args);
    this.name = null;
    this.location = null;
    this.pathSkeleton = path.resolve(__dirname, "skeletons");
    if (this.cmd === "generate:bundle" || this.cmd === "create:bundle") {
      if (args && args[0]) {
        this.name = args[0];
        this.cli.response.name = args[0];
        if (args[1]) {
          this.setLocation(args[1]);
        } else {
          this.setLocation(path.resolve("src", "bundles"));
        }
      }
    }
    if (!this.location) {
      if (this.cli.response.project) {
        this.location = path.resolve(this.cli.response.path, this.cli.response.name, "src", "bundles");
      } else {
        this.location = path.resolve("src", "bundles");
      }
    }
    nodefony.extend(this.response, {
      bundle: true,
      module: nodefony.projectName,
      projectName: nodefony.projectName,
      authorName: this.cli.response.config.App.authorName,
      authorEmail: this.cli.response.config.App.authorMail,
      projectYear: this.cli.response.config.App.projectYear,
      domain: this.cli.response.configKernel.system.domain,
      local: this.cli.response.config.App.locale,
      projectYearNow: new Date().getFullYear(),
      path: this.location
    });
    if (!this.name) {
      this.name = this.cli.response.name;
    }
    this.response.name = this.name;
    this.path = path.resolve(this.location, this.name || "");
    this.setEnv();
  }

  generate(response) {
    return super.generate(response)
      .then(() => {
        return this.buildFront(this.response, this.path)
          .run(this.cli.interactive)
          .then((bundle) => {
            return this.install()
              .then(() => {
                return bundle.response;
              })
              .catch((e) => {
                throw e;
              });
          })
          .catch((e) => {
            throw e;
          });
      });
  }

  async interaction() {
    this.cli.reset();
    await this.cli.showAsciify("Generate Bundle");
    let prompt = [{
      type: 'input',
      name: 'name',
      default: this.name || "",
      message: 'Enter Bundle Name',
      validate: (value) => {
        if (value && value !== "nodefony") {
          let res = this.checkExist(value);
          if (res) {
            return "Bundle already exist " + value;
          }
          this.name = value;
          return true;
        }
        return `${value} Unauthorised Please enter a valid Bundle name`;
      }
    }, {
      type: 'input',
      name: 'location',
      default: this.location,
      message: 'Enter Bundle Path',
      validate: (value) => {
        if (value) {
          this.checkPath(this.name, value);
          return true;
        }
        return 'Please enter a valid Bundle Path';
      }
    }, {
      type: 'list',
      name: 'front',
      default: 0,
      pageSize: 10,
      //choices: ["Sandbox (without Front framwork)", "Vue.js", "React"],
      choices: [{
        name: "Sandbox (without Front framwork)"
      }, {
        name: "Vue.js"
      }, {
        name: "React"
      }, {
        name: "Api",
        disabled: true
      }],
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
          case "Api":
            front = 'api';
            break;
          default:
            front = value;
        }
        return front;
      }
    }];
    return this.cli.prompt(prompt)
      .then((response) => {
        this.path = path.resolve(this.location, this.name);
        if (this.cli.exists(this.path)) {
          this.logger(`${this.path} Already exist`, "WARNING");
          return this.removeInteractivePath(this.path)
            .then((myresponse) => {
              if (myresponse.remove) {
                return response;
              }
              let error = new Error(`${this.path} Already exist`);
              error.code = 0;
              throw error;
            }).catch((e) => {
              throw e;
            });
        }
        return response;
      }).catch(e => {
        throw e;
      });
  }

  getBundle(name) {
    let bundle = this.checkExist(name);
    if (!bundle) {
      throw new Error("bundle " + name + " don't exist ");
    }
    this.setPath(null, bundle);
    return bundle;
  }

  checkExist(name) {
    if (this.cli.kernel) {
      let bundle = this.cli.kernel.getBundle(name);
      if (bundle) {
        return bundle;
      }
      try {
        let bundleName = this.cli.kernel.getBundleName(name);
        if (bundleName) {
          return this.cli.kernel.getBundle(bundleName);
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  setPath(Path, bundle) {
    if (bundle) {
      this.name = bundle.bundleName;
      this.shortName = bundle.name;
      this.location = bundle.location;
      this.bundlePath = bundle.path;
      this.bundleFile = path.resolve(this.bundlePath, this.shortName + "Bundle.js");
    } else {
      if (Path instanceof nodefony.fileClass) {
        this.location = Path.path;
      } else {
        if (!Path) {
          return this.setPath(this.location);
        }
        this.location = Path;
      }
      this.bundlePath = path.resolve(this.location, this.name);
      this.bundleFile = path.resolve(this.bundlePath, this.shortName + "Bundle.js");
    }
    nodefony.extend(this.response, {
      bundleName: this.name,
      name: this.shortName,
      title: this.shortName,
      location: this.location
    });
  }

  checkPath(name, Path) {
    if (!name) {
      if (!this.name) {
        throw new Error("No bundle name");
      }
      name = this.name;
    }
    let bundle = this.checkExist(name);
    if (bundle) {
      throw new Error("Bundle already exist " + name);
    }
    this.shortName = name;
    let res = regBundleName.exec(name);
    if (res) {
      this.shortName = res[1];
      this.name = name;
    } else {
      this.name = name + "-bundle";
      res = regBundleName.exec(this.name);
      if (res) {
        this.shortName = res[1];
      } else {
        throw new Error("Bad bundle name :" + this.name);
      }
    }
    try {
      this.setPath(Path);
    } catch (e) {
      this.cli.logger(e, "ERROR");
      throw e;
    }
  }

  createBuilder() {
    try {
      return {
        name: this.name,
        type: "directory",
        childs: []
      };
    } catch (e) {
      throw e;
    }
  }

  install() {
    try {
      let json = null;
      let configPath = null;
      if (this.cli.kernel) {
        json = this.cli.kernel.readGeneratedConfig();
        configPath = this.cli.kernel.generateConfigPath;
      } else {
        configPath = path.resolve(this.cli.response.path, this.cli.response.projectName, "config", "generatedConfig.yml");
      }
      if (json) {
        if (json.system && json.system.bundles) {
          json.system.bundles[this.name] = `file:${this.bundlePath}`;
        } else {
          if (json.system) {
            json.system.bundles = {};
          } else {
            json.system = {
              bundles: {}
            };
          }
          json.system.bundles[this.name] = `file:${this.bundlePath}`;
        }
      } else {
        json = {
          system: {
            bundles: {}
          }
        };
        json.system.bundles[this.name] = `file:${this.bundlePath}`;
      }
      fs.writeFileSync(configPath, yaml.safeDump(json), {
        encoding: 'utf8'
      });

      try {
        let file = new nodefony.fileClass(this.bundleFile);
        if (this.cli.kernel) {
          this.cli.kernel.loadBundle(file);
        }
      } catch (e) {
        this.logger(e, "WARNING");
      }
      if (this.cli.kernel) {
        return this.cli.packageManager(["install"], this.bundlePath);
      }
      return Promise.resolve(this.bundlePath);
    } catch (e) {
      throw e;
    }
  }

  static controller() {
    return  require(path.resolve(__dirname, "controller.js"));
  }

  static service() {

  }

  static entity() {

  }

  static command() {

  }

}

nodefony.builders.bundle = generateBundle;
module.exports = generateBundle;
