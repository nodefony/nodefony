module.exports = class cliStart extends nodefony.cli {

  constructor() {
    super("NODEFONY", null, null, {
      asciify: false,
      autostart: false,
      signals: false,
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
      this.setCommandOption('-d, --debug ', 'Nodefony debug');
      this.setCommandOption('-h, --help ', 'Nodefony help');
      this.setCommandOption('-v, --version ', 'Nodefony version');
      this.setCommandOption('-i, --interactive ', 'Nodefony cli Interactive Mode');
      this.commander.parse(process.argv);
      this.start(this.cmd, this.args);
    });
    this.fire("onStart", this);
  }

  start(command, args) {
    this.logger(`WELCOME ${this.getEmoji() } `);
    if (command) {
      this.logger(`Command : ${command}`);
      this.logger(`Arguments : ${args}`);
      command = command.toLowerCase();
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
    }
  }

  startQuestion(choices) {
    let cli = this;
    return this.inquirer.prompt([{
        type: 'list',
        name: 'command',
        message: ' Nodefony CLI : ',
        default: 'exit',
        choices: choices,
        filter: (val) => {
          switch (val) {
          case `${this.generateString} project`:
            return "project";
          case `${this.generateString} Bundle`:
            return "bundle";
          case `${this.generateString} controller`:
            return "controller";
          case "quit":
            return "exit";
          case "help":
            return "help";
          default:
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