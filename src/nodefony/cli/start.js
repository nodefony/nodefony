const builderInstall = require(path.resolve(__dirname, "install", "install.js"));

module.exports = class cliStart extends nodefony.cli {

  constructor() {
    super("nodefony", null, null, {
      asciify: false,
      autostart: false,
      signals: false,
      clean: true,
      promiseRejection: true,
      version: nodefony.version,
    });
    //let projectName = nodefony.projectName || "nodefony";
    this.generateString = `Generate`;
    this.startString = "Start Server";
    this.runString = "Run";
    this.choices = [];
    if (nodefony.isTrunk) {
      if (nodefony.builded) {
        this.choices.push(`${this.startString} Development`);
        this.choices.push(`${this.startString} Pre-Production`);
        this.choices.push(`${this.startString} Production`);
        this.choices.push(`${this.generateString} Bundle`);
        this.choices.push(`${this.generateString} Controller`);
        this.choices.push(`Webpack Dump`);
        this.choices.push(`${this.runString} Test`);
        this.choices.push(`${this.generateString} Project`);
        this.choices.push(`Clear Framework`);
      } else {
        this.choices.push(`Install Framework`);
        this.choices.push(`${this.generateString} Certificates`);
        this.choices.push(`Clear Framework`);
      }
    } else {
      this.choices.push(`${this.generateString} Project`);
    }
    this.choices.push("Help");
    this.choices.push("Quit");
    this.cmd = null;
    this.args = null;
    this.on("onStart", () => {
      //this.commander.usage("[options] <cmd> <arg>");
      this.commander.arguments('<cmd> [args...]')
        .action((cmd, args /*, commander*/ ) => {
          this.cmd = cmd;
          this.args = args;
        });
      if (!nodefony.isTrunk) {
        this.commander.command(`${this.clc.cyan('generate ')} ${this.clc.reset} [projectName]`);
        this.commander.command(this.clc.cyan('install'));
      }
      //this.commander.command(this.clc.cyan('check-version'));
      this.setOption('-d, --debug ', 'Nodefony debug');
      this.setOption('-h, --help ', 'Nodefony help');
      this.setOption('-v, --version ', 'Nodefony version');
      this.setOption('-i, --interactive ', 'Nodefony cli Interactive Mode');

      this.commander.parse(process.argv);
      this.start(this.cmd, this.args);
    });
    this.fire("onStart", this);
  }

  start(command, args) {
    //console.log(this.commander)
    let myCommand = null;
    if (command  || process.argv.slice(2).length) {
      if (command) {
        myCommand = command.toLowerCase();
      } else {
        myCommand = "cli";
      }
    }
    if (myCommand) {
      switch (myCommand) {
      case "generate":
        return this.generateProject(myCommand, args, this.commander.interactive);
      case "install":
        if (nodefony.isTrunk) {
          return this.installProject(myCommand, args, this.commander.interactive);
        }
        this.showHelp();
        this.logger("No nodefony trunk detected !", "WARNING");
        break;
      case "app":
        try {
          return process.stdout.write(nodefony.projectName);
        } catch (e) {
          return process.stdout.write("nodefony");
        }
        break;
      case "version":
        try {
          return process.stdout.write(nodefony.version);
        } catch (e) {
          throw e;
        }
        break;
      case "check-version":
        const semver = require('semver');
        var res = semver.valid(nodefony.version);
        if (res) {
          return process.stdout.write(res);
        }
        throw new Error("Not valid version : " + this.version + " check  http://semver.org ");
      default:
        if (nodefony.isTrunk) {
          return nodefony.start(myCommand, args, this);
        } else {
          try {
            if (command) {
              return nodefony.require(path.resolve(command));
            }
          } catch (e) {
            this.logger(e, "ERROR");
          }
          this.showHelp();
          //this.logger("No nodefony trunk detected !", "WARNING");
        }
      }
    } else {
      this.asciify("      " + "NODEFONY", {
        font: "standard"
      }, (err, data) => {
        this.showBanner(data);
        return this.interaction(this.choices).then(() => {
          switch (this.response.command) {
          case "project":
            return this.generateProject(null, null, true);
          case "install":
            return this.installProject(null, null, true);
          case "clear":
            return this.cleanProject();
          case "certificates":
            return this.generateCertificates();
          case "webpack":
            command = this.setCommand("webpack:dump");
            break;
          case "bundle":
            command = this.setCommand("generate:bundle", "-i");
            break;
          case "controller":
            break;
          case "development":
            command = this.setCommand("development");
            break;
          case "production":
            command = this.setCommand("pm2");
            break;
          case "pre-production":
            command = this.setCommand("production");
            break;
          case "test":
            command = this.setCommand("unitTest:launch:all");
            break;
          case "exit":
            this.logger("QUIT");
            return this.terminate(0);
          }
          if (nodefony.isTrunk) {
            try {
              return nodefony.start(command, args, this);
            } catch (e) {
              this.logger(e, "ERROR");
              throw e;
            }
          }
          this.showHelp();
          //this.logger("No nodefony trunk detected !", "WARNING");
          this.terminate(1);
        });
      });
    }
  }

  showBanner(data) {
    super.showBanner(data);
    this.logger(`WELCOME NODEFONY CLI ${nodefony.version} ${this.getEmoji("checkered_flag")}`);
  }

  setCommand(cmd) {
    process.argv.push(cmd);
    this.commander.parse(process.argv);
    return cmd;
  }

  interaction(choices) {
    let cli = this;
    return this.prompt([{
        type: 'list',
        name: 'command',
        message: ' Nodefony CLI : ',
        default: 0, //(choices.length - 1),
        pageSize: choices.length,
        choices: choices,
        filter: (val) => {
          //this.logger(val, "INFO");
          switch (val) {
          case `${this.startString} Development`:
            return "development";
          case `${this.startString} Production`:
            return "production";
          case `${this.startString} Pre-Production`:
            return "pre-production";
          case `${this.generateString} Project`:
            return "project";
          case `${this.generateString} Certificates`:
            return "certificates";
          case `${this.generateString} Bundle`:
            return "bundle";
          case `${this.generateString} Controller`:
            return "controller";
          case `${this.runString} Test`:
            return "test";
          case `Install Framework`:
            return "install";
          case `Clear Framework`:
            return "clear";
          case `Webpack Dump`:
            return "webpack";
          case "Quit":
            return "exit";
          case "Help":
            return "help";
          default:
            this.logger(`command not found : ${val}`, "INFO");
            cli.terminate(1);
          }
        }
      }])
      .then((response) => {
        return nodefony.extend(this.response, response);
      });
  }

  generateProject(command, args, interactive = false) {
    try {
      let project = new nodefony.builders.Project(this, command, args);
      return project.run(interactive)
        .then((res) => {
          this.logger(`Generate Project ${res.name} complete`, "INFO");
        }).catch((e) => {
          if (e.code || e.code === 0) {
            this.logger(e, "INFO");
            this.terminate(e.code);
          }
          this.logger(e, "ERROR");
          this.terminate(e.code || 1);
        });
    } catch (e) {
      throw e;
    }
  }

  installProject() {
    try {
      let installer = new builderInstall(this);
      return installer.install().then(() => {
        this.logger("Install Complete");
        this.terminate(0);
      }).catch((e) => {
        this.logger(e, "ERROR");
        throw e;
      });
    } catch (e) {
      this.logger(e, "ERROR");
      throw e;
    }
  }

  cleanProject() {
    try {
      let installer = new builderInstall(this);
      return installer.clear().then(() => {
        this.logger("Clean Project Complete");
        this.terminate(0);
      }).catch((e) => {
        this.logger(e, "ERROR");
        throw e;
      });
    } catch (e) {
      this.logger(e, "ERROR");
      throw e;
    }
  }

  generateCertificates() {
    try {
      let installer = new builderInstall(this);
      return installer.generateCertificates().then(() => {
        this.logger("Generate Certificates Complete");
        this.terminate(0);
      }).catch((e) => {
        this.logger(e, "ERROR");
        throw e;
      });
    } catch (e) {
      this.logger(e, "ERROR");
      throw e;
    }
  }

};