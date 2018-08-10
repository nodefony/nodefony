module.exports = nodefony.register.call(nodefony.commands, "nodefony", function () {

  class nodefonyCommand extends nodefony.Command {

    constructor(cli, kernel) {
      super("nodefony", cli, kernel);
      this.setTask("bundles", require(path.resolve(__dirname, "tasks", "bundlesTask.es6")));
    }

    showHelp() {
      /*this.setHelp("nodefony:outdated",
        "List Nodefony dependencies outdated"
      );*/
      return super.showHelp();
    }

    install(cwd) {
      this.logger("INSTALL NODEFONY FRAMEWORK");
      return this.displayInfo(cwd)
        .then((ele) => {
          return ele;
        })
        .catch((error) => {
          this.logger(error, "ERROR");
          throw error;
        });
    }

    build(cwd) {
      this.logger("BUILD NODEFONY FRAMEWORK");
      return this.installOrm()
        .then(() => {
          return this.displayInfo(cwd);
        })
        .catch((error) => {
          this.logger(error, "ERROR");
          throw error;
        });
    }

    rebuild(cwd) {
      return this.listPackage(cwd)
        .then(() => {
          return cwd;
        });
      /*return new Promise((resolve, reject) => {
        try {
          let args = [];
          for (let bundle in this.cli.kernel.bundles) {
            this.logger(`Rebuild ${this.cli.kernel.bundles[bundle].name}`);
            args.push(this.cli.kernel.bundles[bundle]);
          }

          let task = this.getTask("bundles");
          return task.rebuild.apply(task, args)
            .then((ele) => {
              return resolve(ele);
            })
            .catch((error) => {
              return reject(error);
            });
        } catch (e) {
          return reject(e);
        }
      });*/
    }


    installOrm(force = false) {
      this.logger("INITIALIZE ORM");
      this.orm = this.cli.kernel.getOrm();
      switch (this.orm) {
      case "sequelize":
        return this.installSequelize(force)
          .then(() => {
            return this.generateSequelizeFixture();
          }).catch((e) => {
            throw e;
          });
      case "mongoose":
        return this.installMongoose()
          .catch((e) => {
            throw e;
          });
      default:
        throw new Error(`ORM not defined : $(this.orm)`);
      }
    }

    installSequelize(force = false) {
      this.logger("INITIALIZE SEQUELIZE");
      return new Promise((resolve, reject) => {
        let command = null;
        let task = null;
        try {
          command = this.cli.getCommand("sequelize", "sequelize");
          task = command.getTask("sync");
        } catch (e) {
          return reject(e);
        }
        return task.entities(force)
          .then((ele) => {
            return resolve(ele);
          }).catch((e) => {
            return reject(e);
          });
      });
    }

    generateSequelizeFixture() {
      this.logger("Generate Fixtures");
      return new Promise((resolve, reject) => {
        let command = null;
        let task = null;
        try {
          command = this.cli.getCommand("sequelize", "sequelize");
          task = command.getTask("fixtures");
        } catch (e) {
          return reject(e);
        }
        return task.load()
          .then((ele) => {
            return resolve(ele);
          })
          .catch((e) => {
            return reject(e);
          });
      });
    }
    installMongoose() {
      this.logger("INITIALIZE Mongoose");
      this.logger("Generate Fixtures");
      return new Promise((resolve, reject) => {
        let command = null;
        let task = null;
        try {
          command = this.cli.getCommand("mongo", "mongo");
          task = command.getTask("fixtures");
        } catch (e) {
          return reject(e);
        }
        return task.load()
          .then((ele) => {
            return resolve(ele);
          })
          .catch((e) => {
            this.logger(e, "ERROR");
            return resolve(e);
          });
      });
    }


    outdated() {
      return new Promise((resolve, reject) => {
        this.logger("PACKAGES OUTDATED");
        try {
          let args = [];
          let trunk = null;
          if (this.cli.kernel.isCore) {
            trunk = path.resolve(".", "package.json");
            this.logger(`Check Outdated trunk :  ${trunk}`);
            args.push(new nodefony.fileClass(trunk));
            trunk = path.resolve("src", "nodefony", "package.json");
            this.logger(`Check Outdated nodefony :  ${trunk}`);
            args.push(new nodefony.fileClass(trunk));
          } else {
            trunk = path.resolve("package.json");
            this.logger(`Check Outdated trunk :  ${trunk}`);
            args.push(new nodefony.fileClass(trunk));
          }
          for (let bundle in this.cli.kernel.bundles) {
            if (nodefony.isCore) {
              this.logger(`Check Outdated Bundle :  ${this.cli.kernel.bundles[bundle].name}`);
              args.push(this.cli.kernel.bundles[bundle]);
            } else {
              if (!this.cli.kernel.isBundleCore(bundle)) {
                this.logger(`Check Outdated ${this.cli.kernel.bundles[bundle].name}`);
                args.push(this.cli.kernel.bundles[bundle]);
              }
            }
          }
          let task = this.getTask("bundles");
          return task.outdated.apply(task, args)
            .then((ele) => {
              return resolve(ele);
            })
            .catch((error) => {
              return reject(error);
            });
        } catch (e) {
          return reject(e);
        }
      });
    }

    displayInfo(cwd) {
      return this.listRouting()
        .then(() => {
          return this.matchHomeRoute("/")
            .then(() => {
              return this.listPackage(cwd)
                .then(() => {
                  return cwd;
                });
            });
        });
    }

    listPackage(cwd) {
      return this.cli.listPackage(cwd);
    }

    matchHomeRoute(route) {
      return new Promise((resolve, reject) => {
        this.logger("ROUTING LIST ");
        try {
          let command = this.cli.getCommand("router", "framework");
          let task = command.getTask("display");
          if (task) {
            return resolve(task.match(route || "/"));
          }
          throw new Error("Bad Command task");
        } catch (e) {
          return reject(e);
        }
      });
    }

    listRouting() {
      return new Promise((resolve, reject) => {
        this.logger("ROUTING LIST ");
        try {
          let command = this.cli.getCommand("router", "framework");
          let task = command.getTask("display");
          if (task) {
            return resolve(task.routes());
          }
          throw new Error("Bad Command task");
        } catch (e) {
          return reject(e);
        }
      });
    }
  }
  return nodefonyCommand;
});