class React extends nodefony.Builder {
  constructor(cli, cmd, args) {
    super(cli, cmd, args);
    this.log("Build Vue.js Project");
    this.pathSkeleton = path.resolve(__dirname, "skeletons");
    this.cliReact = this.getCli();
    this.force = true;
    this.setEnv();
  }

  setEnv() {
    process.env.NODE_ENV = "development";
  }

  generate(response, force) {
    return this.buiReact(this.cli.response, this.location)
      .then((dir) => {
        return this.ejectReact(dir, this.cli.response)
          .then(() => {
            return super.generate(response, force)
              .then(() => {
                return response;
              });
          })
          .catch((e) => {
            throw e;
          });
      });
  }

  buiReact(response, location) {
    return new Promise((resolve, reject) => {
      //console.log(this.bundleName)
      let args = [this.suffix];
      this.logger("install React cli : create-react-app " + args.join(" "));
      let cmd = null;
      try {
        cmd = this.cli.spawn(this.cliReact, args, {
          cwd: location,
          stdio: "inherit"
        }, (code) => {
          if (code === 1) {
            //.cleanTmp();
            return reject(new Error("install React cli  create-react-app new error : " + code));
          }
          return resolve(path.resolve(this.location, this.suffix));
        });
      } catch (e) {
        this.logger(e, "ERROR");
        //this.cleanTmp();
        return reject(e);
      }
    });
  }

  ejectReact(dir, response) {
    return new Promise((resolve, reject) => {
      let args = ['run', 'eject'];
      this.logger(" eject  webpack config React : " + args.join(" "));
      try {
        return this.cli.packageManager(args, dir)
          .then(() => {
            /*try {
              this.moveToRealPath();
            } catch (e) {
              this.cleanTmp();
              return reject(e);
            }*/
            return resolve(path.resolve(this.location, response.name));
          })
          .catch((error) => {
            //this.cleanTmp();
            return reject(new Error("React eject error : " + error));
          });
      } catch (e) {
        //this.cleanTmp();
        this.logger("React eject ", "ERROR");
        return reject(e);
      }
    });
  }

  getCli() {
    let cliPath = null;
    try {
      cliPath = path.resolve(__dirname, "..", "..", "..", "node_modules", ".bin", "create-react-app");
      new nodefony.fileClass(cliPath);
      return cliPath;
    } catch (e) {}
    try {
      cliPath = path.resolve(process.cwd(), "node_modules", ".bin", "create-react-app");
      new nodefony.fileClass(cliPath);
      return cliPath;
    } catch (e) {}
    try {
      cliPath = path.resolve(nodefony.autoloader, "node_modules", ".bin", "create-react-app");
    } catch (e) {}
    try {
      new nodefony.fileClass(cliPath);
    } catch (e) {
      throw new Error("React  create-react-app not found ");
    }
    return cliPath;
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
            name: "services.js",
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

module.exports = React;
