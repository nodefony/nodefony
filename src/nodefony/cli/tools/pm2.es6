module.exports = class pm2Builder extends nodefony.Builder {

  constructor(cli) {
    super(cli);
    this.choices = [];
    if (nodefony.isTrunk) {
      this.choices.push(`List PM2 Production Projects`);
      this.choices.push(`Log PM2 Production Project`);
      this.choices.push(`Stop PM2 Production Project`);
      this.choices.push(`Restart PM2 Production Project`);
      this.choices.push(`Delete PM2 Production Project`);
      this.choices.push(`Save PM2`);
      this.choices.push(`Startup PM2`);
      this.choices.push(`Unstartup PM2`);
      this.choices.push(`Install PM2 Logrotate`);
      this.choices.push(`Kill PM2 Deamon`);
    } else {
      this.choices.push(`List PM2 Production Projects`);
      this.choices.push(`Log  PM2 Production Projects`);
      this.choices.push(`Install PM2 Logrotate`);
      this.choices.push(`Kill PM2 Deamon`);
    }
    this.choices.push(this.cli.getSeparator());
    this.choices.push("Quit");
  }

  logger(pci, severity, msgid, msg) {
    try {
      if (!msgid) {
        msgid = "PM2";
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
          case "List PM2 Production Projects":
            return "list";
          case "Stop PM2 Production Project":
            return "stop";
          case "Restart PM2 Production Project":
            return "restart";
          case "Delete PM2 Production Project":
            return "delete";

          case "Log PM2 Production Projects":
          case "Log PM2 Production Project":
            return "logs";
          case "Save PM2":
            return "pm2-save";
          case "Startup PM2":
            return "pm2-startup";
          case "Unstartup PM2":
            return "pm2-unstartup";
          case "Install PM2 Logrotate":
            return "pm2-logrotate";
          case "Kill PM2 Deamon":
            return "kill";
          case "Quit":
            return "quit";
          default:
            console.log("\n");
            this.logger(`command not found : ${val}`, "ERROR");
            this.cli.terminate(1);
          }
        }
      }])
      .then((response) => {
        this.start(response);
        return response;
      });
  }

  start(response) {
    switch (response.command) {
    case "stop":
      return this.cli.setCommand("stop");
    case "restart":
      return this.cli.setCommand("restart");
    case "list":
      return this.cli.setCommand("list");
    case "logs":
      return this.cli.setCommand("logs");
    case "delete":
      return this.cli.setCommand("delete");
    case "kill":
      return this.cli.setCommand("kill");
    case "pm2-logrotate":
      return this.cli.setCommand("pm2-logrotate");
    case "pm2-save":
      return this.cli.setCommand("pm2-save");
    case "pm2-startup":
      return this.cli.setCommand("pm2-startup");
    case "pm2-unstartup":
      return this.cli.setCommand("pm2-unstartup");
    case "quit":
      return this.cli.setCommand("showmenu");
    default:
      this.logger(`Command : ${response.command} Not Found`, "ERROR");
      return this.cli.setCommand("", "-h");
    }
  }

};
