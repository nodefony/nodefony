class React extends nodefony.builders.sandbox {
  constructor(cli, cmd, args, options) {
    super(cli, cmd, args, nodefony.extend(true, {},options,{
      addons: {
        webpack: false,
        bootstrap: false
      }
    }));
    this.pathSkeleton = path.resolve(__dirname, "skeletons");
    this.cliReact = this.getCli();
  }

  run() {
    return super.run(false);
  }

  generate(response, force) {
    return this.buiReact()
      .then((dir) => {
        return this.ejectReact(dir, this.cli.response)
          .then(() => {
            return super.generate(response, force)
              .then(() => {
                return this.response;
              });
          })
          .catch((e) => {
            throw e;
          });
      });
  }

  builderProject() {
    try {
      return {
        name: "app",
        type: "directory",
        childs: [{
            name: "appKernel.js",
            type: "file",
            skeleton: path.resolve(this.globalSkeleton, "app", "appKernel.js"),
            params: this.response
          },
          this.generateController(),
          this.generateConfig(false, true),
          this.generateRessources()
        ]
      };
    } catch (e) {
      throw e;
    }
  }

  builderBundle() {
    let bundle = [];
    bundle.push({
      name: `${this.response.name}Bundle.js`,
      type: "file",
      skeleton: path.resolve(this.globalSkeleton, "bundle", "bundleClass.js"),
      params: this.response
    });
    bundle.push(this.generateController());
    bundle.push(this.generateRessources());
    bundle.push({
      name: "Entity",
      type: "directory",
      childs: [{
        name: ".gitignore",
        type: "file"
      }]
    });
    return bundle;
  }

  buiReact() {
    let name = null;
    let location = null;
    switch (this.cli.response.command) {
    case "project":
      name = "app";
      location = this.location;
      break;
    case "bundle":
      name = this.cli.response.bundleName;
      location = this.cli.response.location;
      break;
    }
    return new Promise((resolve, reject) => {
      //console.log(this.bundleName)
      let args = [name];
      this.log("install React cli : create-react-app " + args.join(" "));
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
          if (this.cli.response.command === "project") {
            return resolve(path.resolve(this.location, name));
          }
          return resolve(this.location);
        });
      } catch (e) {
        this.log(e, "ERROR");
        //this.cleanTmp();
        return reject(e);
      }
    });
  }

  async ejectReact(dir) {
    await this.stach(dir);
    let err = null;
    return new Promise(async (resolve, reject) => {
      let args = ['run', 'eject'];
      this.log(" eject  webpack config React : " + args.join(" "));
      try {
        return this.cli.packageManager(args, dir)
          .then(async () => {
            await this.stachPop();
            return resolve(path.resolve(this.location));
          })
          .catch(async (error) => {
            //this.cleanTmp();
            await this.stachPop();
            return reject(new Error("React eject error : " + error));
          });
      } catch (e) {
        //this.cleanTmp();
        err = e;
      }
      if (err) {
        await this.stachPop();
        this.log("React eject ", "ERROR");
        return reject(err);
      }
    });

  }

  async stach() {
    let gitP, cwd, gitS, gitC;
    try {
      cwd = path.resolve(this.response.path);
      gitP = require('simple-git/promise');
      gitS = gitP(cwd);
      gitC = gitP(this.location);
    } catch (e) {
      throw e;
    }
    let res = await gitC.checkIsRepo();
    if (! res){
      return Promise.resolve(this.location);
    }
    await gitC.add(path.resolve(this.location, "*"))
    .then(() => {
      this.log("git add ");
      return cwd;
    }).catch((err) => {
        this.log(err, "ERROR");
    });
    await gitC.commit(`create bundle ${this.response.bundleName}`)
    .then(() => {
      this.log("git commit");
      return cwd;
    }).catch((err) => {
        this.log(err, "ERROR");
    });
    return gitS.stash(["-u"])
      .then(() => {
        this.log("git stash");
        return cwd;
      }).catch((err) => {
          this.log(err, "ERROR");
      });
  }

  async stachPop() {
    let gitP, cwd, git;
    try {
      cwd = path.resolve(this.response.path);
      gitP = require('simple-git/promise');
      git = gitP(cwd);
    } catch (e) {
      throw e;
    }
    let res = await git.checkIsRepo();
    if (! res){
      return Promise.resolve(this.location);
    }
    return git.stash(["pop"])
      .then(() => {
        this.log(" git stash pop ");
        return cwd;
      })
      .catch((err) => {
          this.log(err, "ERROR");
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

}
nodefony.builders.react = React;
module.exports = React;
