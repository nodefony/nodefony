const builderInstall = require(path.resolve(__dirname, "..", "install", "install.js"));

module.exports = class toolsBuilder extends nodefony.Builder {

  constructor(cli) {
    super(cli);
    this.choices = [];
    if (nodefony.isTrunk) {
      if (nodefony.builded) {
        this.choices.push(`Webpack Dump`);
        this.choices.push(`Outdated Packages`);
        this.choices.push(`Clear Project`);
      } else {
        this.choices.push(`Clear Project`);
      }
    } else {
      this.choices.push(`Clear Project`);
    }
    this.choices.push(this.cli.getSeparator());
    this.choices.push("Quit");
  }

  logger(pci, severity, msgid, msg) {
    try {
      if (!msgid) {
        msgid = "TOOLS";
      }
      return this.cli.logger(pci, severity, msgid, msg);
    } catch (e) {
      console.log(pci);
    }
  }

  interaction() {
    return this.cli.prompt([{
        type: 'list',
        name: 'command',
        message: ' Nodefony CLI : ',
        default: 0,
        pageSize: this.choices.length,
        choices: this.choices,
        filter: (val) => {
          switch (val) {
          case `Clear Project`:
            return "clear";
          case `Webpack Dump`:
            return "webpack";
          case `Outdated Packages`:
            return "outdated";
          case "Quit":
            return "quit";
          default:
            console.log("\n");
            this.logger(`command not found : ${val}`, "INFO");
            this.cli.terminate(1);
          }
        }
      }])
      .then((response) => {
        this.start(response);
        return response ;
      });
  }

  start(response) {
    switch (response.command) {
    case "clear":
      return this.cleanProject();
    case "webpack":
      return this.cli.setCommand("webpack:dump");
    case "outdated":
      return this.cli.setCommand("nodefony:outdated");
    case "quit":
      return this.cli.setCommand("showmenu");
    default:
      this.logger(`Command : ${response.command} Not Found`, "ERROR");
      return this.cli.setCommand("", "-h");
    }
  }

  cleanProject(cwd = path.resolve(".")) {
    try {
      let installer = new builderInstall(this.cli);
      return installer.clear(cwd)
        .then(() => {
          this.logger("Clean Project Complete");
          this.cli.terminate(0);
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
