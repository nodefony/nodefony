const blue = clc.blueBright.bold;
const green = clc.green;
const builderInstall = require(path.resolve(__dirname, "install", "install.js"));

module.exports = class cliStart extends nodefony.cli {

  constructor() {
    super("nodefony", null, null, {
      asciify: false,
      autostart: false,
      signals: false,
      clean: true,
      promiseRejection: false,
      version: nodefony.version,
    });

    this.generateString = "Generate Nodefony";
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
        //this.choices.push(`${this.generateString} Project`);
        this.choices.push(`${this.runString} Test`);
        this.choices.push(`Clear Framework`);
      } else {
        this.choices.push(`Install Framework`);
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
      this.commander.arguments('<cmd> [args...]')
        .action((cmd, args /*, commander*/ ) => {
          this.cmd = cmd;
          this.args = args;
        });
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
      if (nodefony.isTrunk) {
        return nodefony.start(myCommand, args, this);
      } else {
        try {
          return nodefony.require(path.resolve(command));
        } catch (e) {
          this.logger(e, "ERROR");
        }
        this.logger("No nodefony trunk detected !", "WARNING");
        this.showHelp();
      }
    } else {
      this.asciify("      " + "NODEFONY", {
        font: "standard"
      }, (err, data) => {
        this.clear();
        let color =  blue;
        console.log(color(data));
        let version = this.commander ? this.commander.version() : (this.options.version || "0.0.0");
        if (this.options.version) {
          console.log("          Version : " + blue(version) + " Platform : " + green(process.platform) + " Process : " + green(process.title) + " PID : " + process.pid + "\n");
        }
        this.logger(`WELCOME NODEFONY CLI ${version} ${this.getEmoji("checkered_flag")}`);
        let installer = null;
        return this.startQuestion(this.choices).then(() => {
          switch (this.response.command) {
          case "project":
            let project = new nodefony.builders.Project(this);
            project.interaction().then((res) => {
              //console.log(res);
            }).catch((e) => {
              if (e.code || e.code === 0) {
                this.logger(e, "INFO");
                this.terminate(e.code);
              }
              this.logger(e, "ERROR");
              this.terminate(e.code || 1);
            });
            break;
          case "install":
            installer = new builderInstall(this);
            installer.install().then(() => {
              this.logger("Install Complete");
              this.terminate(0);
            }).catch((e) => {
              this.logger(e, "ERROR");
              throw e;
            });
            break;
          case "clear":
            try {
              installer = new builderInstall(this);
              installer.clear();
            } catch (e) {
              this.logger(e, "ERROR");
              throw e;
            }
            break;
          case "bundle":
            break;
          case "controller":
            break;
          case "development":
            try {
              command = this.setCommand("development");
              if (nodefony.isTrunk) {
                return nodefony.start(command, args, this);
              } else {
                this.showHelp();
              }
            } catch (e) {
              this.logger(e, "ERROR");
              throw e;
            }
            break;
          case "production":
            try {
              command = this.setCommand("pm2");
              if (nodefony.isTrunk) {
                return nodefony.start(command, args, this);
              } else {
                this.showHelp();
              }
            } catch (e) {
              this.logger(e, "ERROR");
              throw e;
            }
            break;
          case "pre-production":
            try {
              command = this.setCommand("production");
              if (nodefony.isTrunk) {
                return nodefony.start(command, args, this);
              } else {
                this.showHelp();
              }
            } catch (e) {
              this.logger(e, "ERROR");
              throw e;
            }
            break;
          case "test":
            try {
              if (nodefony.isTrunk) {
                command = this.setCommand("unitTest:launch:all");
                return nodefony.start(command, args, this);
              } else {
                this.showHelp();
              }
            } catch (e) {
              this.logger(e, "ERROR");
              throw e;
            }
            break;
          case "help":
            if (nodefony.isTrunk) {
              return nodefony.start(myCommand, args, this);
            } else {
              this.showHelp();
            }
            break;
          case "exit":
            this.logger("QUIT");
            return this.terminate(0);
          default:
            this.terminate(1);
          }
        });
      });
    }
  }

  setCommand(cmd) {
    process.argv.push(cmd);
    this.commander.parse(process.argv);
    return cmd;
  }

  startQuestion(choices) {
    let cli = this;
    return this.prompt([{
        type: 'list',
        name: 'command',
        message: ' Nodefony CLI : ',
        default: 0, //(choices.length - 1),
        pageSize: choices.length,
        choices: choices,
        filter: (val) => {
          this.logger(val, "INFO");
          switch (val) {
          case `${this.startString} Development`:
            return "development";
          case `${this.startString} Production`:
            return "production";
          case `${this.startString} Pre-Production`:
            return "pre-production";
          case `${this.generateString} Project`:
            return "project";
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
};