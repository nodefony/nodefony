const nodefony = require("nodefony");
let package = require(path.resolve(__dirname, "..", "..", "package.json"));
let version = package.version;
let name = package.name ;

const questions = require(path.resolve(__dirname, "menu.js"));

class Cli extends nodefony.cli {

  constructor() {
    super(name, {
      version: version,
    });
    this.start()
    .catch(e => {
      this.log(e, "ERROR");
      throw e;
    });
  }

  start() {
    return super.start()
      .then(() => {
        this.showBanner();
        this.blankLine();
        let res = this.commander.arguments(`<cmd> [args...]`)
          .action((cmd, args) => {
            return this.initCommand(cmd, args);
          });
        if (!process.argv.slice(2).length) {
          return this.showMenu();
        }
        this.parseCommand(process.argv);
        return res;
      });
  }

  showMenu(noAscii = false, reload = false) {
    return this.runMenu(questions, noAscii, reload);
  }

  runMenu(menu, reload, noAscii) {
    return this.prompt(menu)
      .then((answers) => {
        return this.initCommand(answers.cli, null, noAscii);
      })
      .catch((e) => {
        this.logger(e, "ERROR");
        throw e;
      });
  }

  initCommand(cmd, args = null, noAscii = false) {
    if (!noAscii) {
      this.showAsciify(cmd)
        .then((data) => {
          this.showBanner(data);
          return this.runCommand(cmd, args);
        })
        .catch((e) => {
          this.logger(e, "ERROR");
          throw e;
        });
      return;
    }
    return this.runCommand(cmd, args);
  }

  runCommand(cmd, args = null) {
    if (cmd) {
      this.log(cmd, "INFO", "COMMAND");
    }
    switch (cmd) {
    case "build":
      return this.npm(["run", "build"])
        .then(() => {
          this.terminate(0);
        });
    case "start":
      return this.npm(["run", "prod"]);
    case "production":
      return this.npm(["run", "prod"]);
    case "development":
      return this.npm(["run", "dev"]);
    case "pm2":
      return this.pm2();
    case "status":
      return this.npm(["run", "status"]);
    case "log":
      return this.npm(["run", "log"]);
    case "kill":
      return this.npm(["run", "kill"]);
    case "restart":
      return this.npm(["run", "restart"]);
    case "delete":
      return this.npm(["run", "delete"]);
    case "test":
      return this.npm(["run", "test"])
        .then(() => {
          this.terminate(0);
        });
    default:
      this.terminate(0);
    }
  }

  pm2(){
    this.choices = [];
    this.choices.push(`List PM2 Production Projects`);
    this.choices.push(`Log PM2 Production Project`);
    this.choices.push(`Stop PM2 Production Project`);
    this.choices.push(`Restart PM2 Production Project`);
    this.choices.push(`Delete PM2 Production Project`);
    this.choices.push(`Kill PM2 Deamon`);
    return this.prompt([{
        type: 'list',
        name: 'command',
        message: ' Nodefony CLI : ',
        default: 0,
        pageSize: this.choices.length,
        choices: this.choices,
        filter: (val) => {
          switch (val) {
          case "List PM2 Production Projects":
            return "status";
          case "Stop PM2 Production Project":
            return "stop";
          case "Restart PM2 Production Project":
            return "restart";
          case "Delete PM2 Production Project":
            return "delete";
          case "Log PM2 Production Projects":
          case "Log PM2 Production Project":
            return "log";
          case "Kill PM2 Deamon":
            return "kill";
          case "Quit":
            return "quit";
          default:
            this.logger(`\ncommand not found : ${val}`, "ERROR");
            this.cli.terminate(1);
          }
        }
      }])
      .then((response) => {
        return this.initCommand(response.command) ;
      });
  }
}

module.exports = new Cli();
