const regBundle = /^(.*)[Bb]undle$/;

const intervativeQuestion = function (cli) {
  return [{
    type: 'input',
    name: 'name',
    message: 'Enter Bundle Name',
    validate: (value) => {
      try {
        cli.cli.blankLine();
        cli.setBundleName(value);
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
        cli.setBundlePath(value);
        return true;
      } catch (e) {
        return e.message;
      }
    }
  }];
};


const reactCli = class reactCli extends nodefony.Service {

  constructor(cli) {
    super("React Cli", cli.container, cli.notificationsCenter);
    this.cli = cli;
    this.inquirer = this.cli.inquirer;
    this.react = this.getReactPath();
    this.tmp = this.setTmpDir(path.resolve("/", "tmp"));
    this.npm = this.getNpmPath();
    this.setEnv();
    this.bundleName = null;
    this.bundlePath = null;
  }

  setBundleName(name) {
    //let realName = null ;
    let res = regBundle.exec(name);
    if (res) {
      this.bundleName = res[1];
    } else {
      throw new Error("Bad bundle name :" + name);
    }
    return this.bundleName;
  }

  setBundlePath(Path) {
    this.bundlePath = path.resolve(this.kernel.rootDir, path.resolve(Path));
    return this.bundlePath;
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
      let tmpDir = path.resolve(this.tmp, this.bundleName + "bundle");
      this.cli.existsSync(tmpDir);
      try {
        shell.rm('-rf', tmpDir);
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
      this.bundleName = this.setBundleName(name);
      this.bundlePath = this.setBundlePath(Path);
      this.cwd = path.resolve(this.bundlePath, name);
      this.logger("GENERATE React Bundle : " + this.bundleName + " LOCATION : " + this.bundlePath);
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
        return {
          name: name,
          path: Path
        };
      });
  }

  generateReactProject( /*argv*/ ) {
    return new Promise((resolve, reject) => {
      let args = [this.bundleName + "bundle"];
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
          return resolve(path.resolve(this.tmp, this.bundleName + "bundle"));
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
      return shell.mv(path.resolve(this.tmp, this.bundleName + "bundle"), this.bundlePath);
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
          return resolve(path.resolve(this.bundlePath, this.bundleName + "bundle"));
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
