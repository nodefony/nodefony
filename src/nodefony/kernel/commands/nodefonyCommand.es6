module.exports = nodefony.register.call(nodefony.commands, "nodefony", () => {
  class nodefonyCommand extends nodefony.Command {
    constructor (cli, kernel) {
      super("nodefony", cli, kernel);
      this.setTask("bundles", require(path.resolve(__dirname, "tasks", "bundlesTask.es6")));
    }

    showHelp () {
      return super.showHelp();
    }

    async install (cwd, args = [], interactive = false) {
      try {
        let strategy = null;
        let force = false;
        if (!args) {
          args = [];
        }
        if (args.includes("migrate")) {
          strategy = "migrate";
        }
        if (args.includes("sync")) {
          strategy = "sync";
        }
        if (args.includes("force")) {
          force = true;
        }
        this.log("INSTALL NODEFONY FRAMEWORK");
        return await this.installOrm(force, strategy);
        // return await this.displayInfo(cwd);
      } catch (error) {
        this.log(error, "ERROR");
        throw error;
      }
    }

    async build (cwd, args = [], interactive = false) {
      this.log("BUILD NODEFONY FRAMEWORK");
      return this.install(cwd, args, interactive);
    }

    async rebuild (cwd, args, interactive = false) {
      try {
        // await this.listPackage(cwd);
        return cwd;
      } catch (e) {
        throw e;
      }
    }

    installOrm (force = false, strategy = null) {
      this.log("INITIALIZE ORM");
      this.orm = this.cli.kernel.getOrm();
      switch (this.orm) {
      case "sequelize":
        return this.installSequelize(force, strategy || this.cli.kernel.getOrmStrategy())

        /* .then(() => {
              return this.generateSequelizeFixture();
            })*/
          .catch((e) => {
            throw e;
          });
      case "mongoose":
        return this.installMongoose()
          .catch((e) => {
            throw e;
          });
      default:
        throw new Error("ORM not defined : $(this.orm)");
      }
    }

    async installSequelize (force = false, strategy = "migrate") {
      this.log("INITIALIZE SEQUELIZE");
      let command = null;
      let task = null;
      let res = null;
      try {
        command = this.cli.getCommand("sequelize", "sequelize");
        task = command.getTask("create");
        res = await task.database();
      } catch (e) {
        this.log(e, "WARNING");
      }
      if (!force && strategy === "none") {
        return res;
      }
      try {
        command = this.cli.getCommand("sequelize", "sequelize");
        // with migrate
        if (!force && strategy === "migrate") {
          task = command.getTask("migrate");
          await task.up();
          await task.status();
          task = command.getTask("sync");
          await task.entities(force);
          task = command.getTask("seedeers");
          await task.up();
          return await task.status();
        }
        // with sysnc
        if (strategy === "sync") {
          task = command.getTask("sync");
          await task.entities(force);
          task = command.getTask("seedeers");
          await task.up();
          return await task.status();
        }
      } catch (e) {
        this.log(e, "ERROR");
        throw e;
      }
    }

    async generateSequelizeFixture () {
      try {
        this.log("Generate Sequelize Fixtures");
        const command = this.cli.getCommand("users", "users");
        const task = command.getTask("fixtures");
        return await task.default();
      } catch (e) {
        throw e;
      }
    }

    async installMongoose () {
      try {
        this.log("INITIALIZE Mongoose");
        this.log("Generate Mongoose Fixtures");
        if (this.kernel.bundles.users) {
          const command = this.cli.getCommand("users", "users");
          const task = command.getTask("fixtures");
          return await task.default();
        }
        return true;
      } catch (e) {
        throw e;
      }
    }

    async outdated () {
      try {
        this.log("PACKAGES OUTDATED");
        const args = [];
        let trunk = null;
        if (this.cli.kernel.isCore) {
          trunk = path.resolve(".", "package.json");
          this.log(`Check Outdated trunk :  ${trunk}`);
          args.push(new nodefony.fileClass(trunk));
          trunk = path.resolve("src", "nodefony", "package.json");
          this.log(`Check Outdated nodefony :  ${trunk}`);
          args.push(new nodefony.fileClass(trunk));
        } else {
          trunk = path.resolve("package.json");
          this.log(`Check Outdated trunk :  ${trunk}`);
          args.push(new nodefony.fileClass(trunk));
        }
        for (const bundle in this.cli.kernel.bundles) {
          if (nodefony.isCore) {
            this.log(`Check Outdated Bundle :  ${this.cli.kernel.bundles[bundle].name}`);
            args.push(this.cli.kernel.bundles[bundle]);
          } else if (!this.cli.kernel.isBundleCore(bundle)) {
            this.log(`Check Outdated ${this.cli.kernel.bundles[bundle].name}`);
            args.push(this.cli.kernel.bundles[bundle]);
          }
        }
        const task = this.getTask("bundles");
        return await task.outdated.apply(task, args);
      } catch (e) {
        throw e;
      }
    }

    displayInfo (cwd) {
      return this.listRouting()
        .then(() => this.matchHomeRoute("/")
          .then(() => cwd

            /* return this.listPackage(cwd)
                .then(() => {
                  return cwd;
                });*/
          ));
    }

    listPackage (cwd) {
      return this.cli.listPackage(cwd);
    }

    async matchHomeRoute (route) {
      this.log("ROUTING LIST ");
      try {
        const command = this.cli.getCommand("router", "framework");
        const task = command.getTask("display");
        if (task) {
          return await task.match(route || "/");
        }
        throw new Error("Bad Command task");
      } catch (e) {
        throw e;
      }
    }

    async listRouting () {
      try {
        this.log("ROUTING LIST ");
        const command = this.cli.getCommand("router", "framework");
        const task = command.getTask("display");
        if (task) {
          return await task.routes();
        }
        throw new Error("Bad Command task");
      } catch (e) {
        throw e;
      }
    }
  }
  return nodefonyCommand;
});
