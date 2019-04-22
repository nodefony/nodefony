class Vue extends nodefony.Builder {
  constructor(cli, cmd, args) {
    super(cli, cmd, args);
    this.log("Build Vue.js Project");
    this.pathSkeleton = path.resolve(__dirname, "skeletons");
    this.cliVue = this.getCli();
    this.force = true;
    //this.setEnv();
  }

  generate(response, force) {
    return this.builVue(this.cli.response, this.location)
      .then(() => {
        return super.generate(response, force)
          .then(() => {
            return this.checkTypeScript()
              .then(() => {
                return response;
              });
          })
          .catch((e) => {
            throw e;
          });
      });
  }

  checkTypeScript() {
    return new Promise((resolve) => {
      try {
        new nodefony.fileClass(path.resolve(this.location, "app", "src", "main.ts"));
        let skelete = path.resolve(this.pathSkeleton, "app", "vue.config.js.ts");
        this.cli.cp("-f", skelete, path.resolve(this.location, "app", "vue.config.js"));
        return resolve(true);
      } catch (e) {
        return resolve(true);
      }
    });
  }

  getCli() {
    let cliPath = null;
    try {
      cliPath = path.resolve(__dirname, "..", "..", "..", "node_modules", ".bin", "vue");
      new nodefony.fileClass(cliPath);
      return cliPath;
    } catch (e) {}
    try {
      cliPath = path.resolve(process.cwd(), "node_modules", ".bin", "vue");
      new nodefony.fileClass(cliPath);
      return cliPath;
    } catch (e) {}
    try {
      cliPath = path.resolve(nodefony.autoloader, "node_modules", ".bin", "vue");
    } catch (e) {}
    try {
      new nodefony.fileClass(cliPath);
    } catch (e) {
      throw new Error("Vue.js CLI not found ");
    }
    return cliPath;
  }

  setEnv() {
    process.env.NODE_ENV = "development";
  }

  builVue(response, location) {
    return new Promise((resolve, reject) => {
      let args = ["create", this.suffix];
      this.logger("install Vue cli : vue " + args.join(" "));
      let cmd = null;
      try {
        cmd = this.cli.spawn(this.cliVue, args, {
          cwd: location,
          stdio: "inherit"
        }, (code) => {
          if (code === 1) {
            return reject(new Error("install Vue cli new error : " + code));
          }
          return resolve(path.resolve(this.location, response.name));
        });
      } catch (e) {
        this.logger(e, "ERROR");
        return reject(e);
      }
    });
  }

  createBuilder() {
    try {
      return {
        name: "app",
        type: "directory",
        childs: [{
          name: "appKernel.js",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "app", "appKernel.js.skeleton"),
          params: this.cli.response
        }, {
          name: "Resources",
          type: "directory",
          childs: [{
            name: "databases",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "Resources", "databases"),
            params: {
              recurse: true
            }
            }]
        }, {
          name: "controller",
          type: "copy",
          path: path.resolve(this.pathSkeleton, "app", "controller"),
          params: {
            recurse: true
          }
        }, {
          name: "vue.config.js",
          type: "copy",
          path: path.resolve(this.pathSkeleton, "app", "vue.config.js"),
        }, {
          name: "config",
          type: "directory",
          childs: [{
            name: "config.js",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "app", "config", "config.js"),
            params: this.cli.response
          }, {
            name: "routing.js",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "config", "routing.js")
          }, {
            name: "security.js",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "config", "security.js")
          }, {
            name: "service.js",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "config", "services.js")
          }]
        }, {
          name: "Resources",
          type: "directory",
          childs: [{
            name: "views",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "Resources", "views"),
            params: {
              recurse: true
            }
            }, {
            name: "translations",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "Resources", "translations"),
            params: {
              recurse: true
            }
            }, {
            name: "public",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "Resources", "public"),
            params: {
              recurse: true
            }
          }]
        }]
      };
    } catch (e) {
      throw e;
    }
  }

}

module.exports = Vue;
