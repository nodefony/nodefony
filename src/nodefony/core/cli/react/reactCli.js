const intervativeQuestion = function (cli) {
  return [{
    type: 'input',
    name: 'name',
    message: 'Enter Bundle Name',
    validate: (value) => {
      try {
        cli.cli.blankLine();
        return true;
      } catch (e) {
        return e.message;
      }
    }
  }, {
    type: 'input',
    name: 'path',
    message: 'Enter Bundle Path',
    validate: (value) => {
      try {
        cli.cli.blankLine();
        return true;
      } catch (e) {
        return e.message;
      }
    }
  }];
};

const reactCli = class reactCli extends nodefony.Service {

  constructor(builder) {
    super("React Cli", builder.cli.container, builder.cli.notificationsCenter);
    this.cli = builder.cli;
    this.builder = builder;
    this.inquirer = this.cli.inquirer;
    this.react = this.getReactPath();
    this.tmp = this.setTmpDir(path.resolve("/", "tmp"));
    this.npm = this.getNpmPath();
    this.setEnv();
    this.bundleName = null;
    this.bundleShortName = null;
    this.bundlePath = null;
  }

  getReactPath() {
    return path.resolve(process.cwd(), "node_modules", ".bin", "create-react-app");
  }
  getNpmPath() {
    return path.resolve(process.cwd(), "node_modules", ".bin", "npm");
  }

  setEnv() {
    process.env.NODE_ENV = "development";
  }

  generateInteractive() {
    this.logger("Interactive Mode");
    return this.inquirer.prompt(intervativeQuestion(this));
  }

  setTmpDir(Path) {
    return Path;
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

  generateProject(name, Path, interactive) {
    let project = null;
    this.interactive = interactive;
    if (this.interactive) {
      project = this.generateInteractive();
    } else {
      this.builder.checkPath(name, Path);
      this.bundleName = this.builder.name;
      this.location = this.builder.location.path;
      this.cwd = this.builder.bundlePath;
      this.logger("GENERATE React Bundle : " + this.bundleName + " LOCATION : " + this.location);
      project = new Promise((resolve) => {
        return resolve([]);
      });
    }
    return project
      .then((ele) => {
        return this.generateReactProject(ele);
      })
      .then((dir) => {
        return this.ejectReact(dir);
      })
      .then(( /*dir*/ ) => {
        return this.builder;
      });
  }

  generateReactProject( /*argv*/ ) {
    return new Promise((resolve, reject) => {
      //console.log(this.bundleName)
      let args = [this.bundleName];
      this.logger("install React cli : create-react-app " + args.join(" "));
      let cmd = null;
      try {
        cmd = this.cli.spawn(this.react, args, {
          cwd: this.tmp,
        }, (code) => {
          if (code === 1) {
            this.cleanTmp();
            return reject(new Error("install React cli  create-react-app new error : " + code));
          }
          return resolve(path.resolve(this.tmp, this.bundleName));
        });
        process.stdin.pipe(cmd.stdin);
      } catch (e) {
        this.logger("create-react-app ", "ERROR");
        this.cleanTmp();
        return reject(e);
      }
    });
  }

  moveToRealPath() {
    try {
      return shell.mv(path.resolve(this.tmp, this.bundleName), this.location);
    } catch (e) {
      throw e;
    }
  }

  ejectReact(dir) {
    return new Promise((resolve, reject) => {
      let args = ['run', 'eject'];
      this.logger(" eject  webpack config React : npm " + args.join(" "));
      let cmd = null;
      try {
        cmd = this.cli.spawn(this.npm, args, {
          cwd: dir
        }, (code) => {
          if (code === 1) {
            this.cleanTmp();
            return reject(new Error("React eject error : " + code));
          }
          try {
            this.moveToRealPath();
          } catch (e) {
            this.cleanTmp();
            return reject(e);
          }
          return resolve(path.resolve(this.location, this.bundleName));
        });
        process.stdin.pipe(cmd.stdin);
      } catch (e) {
        this.cleanTmp();
        this.logger("React eject ", "ERROR");
        return reject(e);
      }
    });
  }
};

module.exports = reactCli;