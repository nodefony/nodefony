const blue = clc.blueBright.bold;
const green = clc.green;
module.exports = class cliStart extends nodefony.cli {

  constructor() {
    super("CLI", null, null, {
      asciify: false,
      autostart: false,
      signals: false,
      clean: true,
      promiseRejection: false,
      version: nodefony.version,
    });
    this.response = {};
    this.generateString = "Generate Nodefony";
    this.runString = "Run Nodefony";
    this.choices = [
      `${this.runString} Server Development`,
      `${this.runString} Server Check Production`,
      `${this.generateString} Project`,
      `${this.generateString} Bundle`,
      `${this.generateString} Controller`,
      "Help",
      "Quit"
    ];
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
    if (command  || process.argv.slice(2).length) {
      if (command) {
        command = command.toLowerCase();
      } else {
        command = "cli";
      }
    } else {
      command = null;
    }
    if (command) {
      if (nodefony.isTrunk) {
        return nodefony.start(command, args, this);
      } else {
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
        //this.logger(`WELCOME ${this.getEmoji() } `);
        this.logger(`WELCOME NODEFONY CLI ${version} ${this.getEmoji("checkered_flag")}`);
        return this.startQuestion(this.choices).then(() => {
          switch (this.response.command) {
          case "project":
            this.projectQuestion().then(() => {

            }).catch((e) => {
              if (e.code || e.code === 0) {
                this.logger(e, "INFO");
                this.terminate(e.code);
              }
              this.logger(e, "ERROR");
              this.terminate(e.code || 1);
            });
            break;
          case "bundle":
            break;
          case "controller":
            break;
          case "help":
            if (nodefony.isTrunk) {
              return nodefony.start(command, args, this);
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

  startQuestion(choices) {
    let cli = this;
    return this.inquirer.prompt([{
        type: 'list',
        name: 'command',
        message: ' Nodefony CLI : ',
        default: (choices.length - 1),
        choices: choices,
        filter: (val) => {
          this.logger(val, "INFO");
          switch (val) {
          case `${this.generateString} Project`:
            return "project";
          case `${this.generateString} Bundle`:
            return "bundle";
          case `${this.generateString} Controller`:
            return "controller";
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

  projectQuestion() {
    return this.inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'Enter Nodefony Project Name',
        validate: (value) => {
          if (value) {
            return true;
          }
          return 'Please enter a valid project name';
        }
      }, {
        type: 'confirm',
        name: 'bundle',
        message: 'Do You Want Generate Bundle?',
        default: false
      }])
      .then((response) => {
        return nodefony.extend(this.response, response);
      });
  }

};