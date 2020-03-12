const nodefony = require("nodefony");
let package = require(path.resolve(__dirname, "..", "..", "package.json"));
let version = package.version;
let name = package.name;

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

  showMenu(noAscii = false) {
    return this.runMenu(questions, noAscii);
  }

  runMenu(menu, noAscii = false) {
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
    case "webpack":
      return this.npm(["run", "webpack"])
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
    case "ssl":
      return this.npm(["run", "ssl"]);
    case "tools":
      return this.tools();
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
    case "example":
      return this.npm(["run", "examples"]);
    case "pm2-logrotate":
      return this.npm(["run", "pm2", "install", "pm2-logrotate"]);
    case "pm2-save":
      return this.spawn("npx", ["pm2", "save"]);
    case "pm2-startup":
      return this.spawn("npx", ["pm2", "startup"]);
    case "pm2-unstartup":
      return this.spawn("npx", ["pm2", "unstartup"]);
    case "test":
      return this.npm(["run", "test"])
        .then(() => {
          this.terminate(0);
        });
    case 'undo':
      return this.showMenu(name);
    default:
      this.logger(`Command Not Found : ${cmd}`, "WARNING");
      this.terminate(0);
    }
  }

  tools() {
    this.choices = [];
    this.choices.push(`Webpack Compile`);
    this.choices.push(`Generate SSL Certificates`);
    this.choices.push(`Quit`);
    return this.prompt([{
        type: 'list',
        name: 'command',
        message: ' Nodefony CLI : ',
        default: 0,
        pageSize: this.choices.length,
        choices: this.choices,
        filter: (val) => {
          switch (val) {
          case "Webpack Compile":
            return "webpack";
          case "Generate SSL Certificates":
            return "ssl";
          case "Quit":
            return "undo";
          default:
            this.logger(`\ncommand not found : ${val}`, "ERROR");
            this.terminate(1);
          }
        }
      }])
      .then((response) => {
        if (response.command !== "undo") {
          return this.initCommand(response.command);
        }
        return this.showAsciify(name)
          .then(() => {
            return this.showMenu();
          });
      });
  }

  pm2() {
    this.choices = [];
    this.choices.push(`List PM2 Production Projects`);
    this.choices.push(`Log PM2 Production Project`);
    this.choices.push(`Stop PM2 Production Project`);
    this.choices.push(`Restart PM2 Production Project`);
    this.choices.push(`Delete PM2 Production Project`);
    this.choices.push(`Kill PM2 Deamon`);
    this.choices.push(`Save PM2`);
    this.choices.push(`Startup PM2`);
    this.choices.push(`Unstartup PM2`);
    this.choices.push(`Install PM2 Logrotate`);
    this.choices.push(`Quit`);
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
          case "Install PM2 Logrotate":
            return "pm2-logrotate";
          case "Save PM2":
            return "pm2-save";
          case "Startup PM2":
            return "pm2-startup";
          case "Unstartup PM2":
            return "pm2-unstartup";
          case "Kill PM2 Deamon":
            return "kill";
          case "Quit":
            return "undo";
          default:
            this.logger(`\ncommand not found : ${val}`, "ERROR");
            this.cli.terminate(1);
          }
        }
      }])
      .then((response) => {
        if (response.command !== "undo") {
          return this.initCommand(response.command);
        }
        return this.showAsciify(name)
          .then(() => {
            return this.showMenu();
          });
      });
  }
}

module.exports = new Cli();
