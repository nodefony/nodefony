const angularCli = class angularCli extends nodefony.Service {

  constructor(builder) {
    super("Angular Cli", builder.cli.container, builder.cli.notificationsCenter);
    this.cli = builder.cli;
    this.builder = builder;
    this.inquirer = this.cli.inquirer;
    this.ng = this.getNgPath();
    this.tmp = this.setTmpDir(path.resolve("/", "tmp"));
    this.npm = this.getNpmPath();
    this.setEnv();
    this.bundleName = null;
    this.bundlePath = null;
  }

  getNgPath() {
    return path.resolve(process.cwd(), "node_modules", ".bin", "ng");
  }
  getNpmPath() {
    return path.resolve(process.cwd(), "node_modules", ".bin", "npm");
  }

  setTmpDir(Path) {
    return Path;
  }

  setEnv() {
    process.env.NODE_ENV = "development";
  }

  generateProject(name, Path = path.resolve("src", "bundles")) {
    this.builder.checkPath(name, Path);
    this.bundleName = this.builder.name;
    this.bundleShortName = this.builder.shortName;
    this.location = this.builder.location.path;
    this.cwd = this.builder.bundlePath;
    this.logger("GENERATE Angular Bundle : " + this.bundleName + " LOCATION : " + this.location);
    let project = new Promise((resolve) => {
      return resolve([]);
    });
    return project
      .then((ele) => {
        return this.generateNgNew(ele);
      })
      .then((dir) => {
        return this.npmInstall(dir);
      })
      /*.then((dir) => {
        return this.npmInstall(dir, "@ngtools/webpack");
      })*/
      .then((dir) => {
        return this.generateNgModule(dir);
      })
      .then((dir) => {
        return this.ejectNg(dir);
      })
      .then((dir) => {
        return this.npmInstall(dir);
      })
      .then(( /*dir*/ ) => {
        return this.builder;
      });
  }

  moveToRealPath() {
    return shell.mv(path.resolve(this.tmp, this.bundleName), this.location);
  }

  cleanTmp() {
    try {
      let tmpDir = path.resolve(this.tmp, this.bundleName);
      try {
        if (this.cli.existsSync(tmpDir)) {
          shell.rm('-rf', tmpDir);
        }
      } catch (e) {
        this.logger(e, "ERROR");
        throw e;
      }
    } catch (e) {
      return;
    }
  }

  generateNgNew( /*argv*/ ) {
    return new Promise((resolve, reject) => {
      let args = ['new', '-v', this.bundleName];
      this.logger("install angular cli : ng " + args.join(" "));
      let cmd = null;
      try {
        cmd = this.cli.spawn(this.ng, args, {
          cwd: this.tmp,
        }, (code) => {
          if (code === 1) {
            this.cleanTmp();
            return reject(new Error("install angular cli  ng new error : " + code));
          }
          return resolve(path.resolve(this.tmp, this.bundleName));
        });
      } catch (e) {
        this.logger("ng new ", "ERROR");
        this.cleanTmp();
        return reject(e);
      }
    });
  }

  generateNgModule(dir) {
    return new Promise((resolve, reject) => {
      let args = ['generate', 'module', '--spec', '--routing', 'module', 'app', this.bundleShortName];
      this.logger(" Generate Angular module : ng " + args.join(" ") + " in " + dir);
      let cmd = null;
      try {
        cmd = this.cli.spawn(this.ng, args, {
          cwd: dir
        }, (code) => {
          if (code === 1) {
            this.cleanTmp();
            return reject(new Error("ng generate module error code : " + code));
          }
          try {
            this.moveToRealPath();
          } catch (e) {
            this.cleanTmp();
            return reject(e);
          }
          return resolve(path.resolve(this.location, this.bundleName));
          //return resolve(dir);
        });
      } catch (e) {
        this.cleanTmp();
        this.logger("ng generate module ", "ERROR");
        return reject(e);
      }
    });
  }

  ejectNg(dir) {
    return new Promise((resolve, reject) => {
      let args = ["eject", "--environment", "dev", "-dev", "--watch", "--verbose"];
      this.logger(" eject  webpack config angular : ng " + args.join(" "));
      let cmd = null;
      try {
        cmd = this.cli.spawn(this.ng, args, {
          cwd: dir
        }, (code) => {
          if (code === 1) {
            this.cleanTmp();
            return reject(new Error("ng eject error : " + code));
          }
          return resolve(dir);
          //return resolve(path.resolve(this.bundlePath, this.bundleName ));
        });
      } catch (e) {
        this.cleanTmp();
        this.logger("ng eject ", "ERROR");
        return reject(e);
      }
    });
  }

  npmInstall(cwd, argv) {
    return new Promise((resolve, reject) => {
      let tab = ["install"];
      if (argv) {
        tab = tab.concat(argv);
      }
      let cmd = null;
      try {
        this.logger("npm install in " + cwd);
        cmd = this.cli.spawn("npm", tab, {
          cwd: cwd
        }, (code) => {
          if (code === 1) {
            this.cleanTmp();
            return reject(new Error("nmp install error : " + code));
          }
          return resolve(cwd);
        });
      } catch (e) {
        this.cleanTmp();
        this.logger("npm install ", "ERROR");
        return reject(e);
      }
    });
  }
};

module.exports = angularCli;