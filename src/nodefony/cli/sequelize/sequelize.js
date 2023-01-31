module.exports = class sequlizeBuilder extends nodefony.Builder {
  constructor (cli) {
    super(cli);
    this.choices = [];
    this.choices.push("Create Database");
    this.choices.push("Synchronize");
    this.choices.push("Migrate");
    this.choices.push("Migrations Pending");
    this.choices.push("Migrations Executed");
    this.choices.push(this.cli.getSeparator());
    this.choices.push("Quit");
  }

  log (pci, severity, msgid, msg) {
    try {
      if (!msgid) {
        msgid = "Sequelize";
      }
      return this.cli.log(pci, severity, msgid, msg);
    } catch (e) {
      console.log(pci);
    }
  }

  interaction () {
    return this.cli.prompt([{
      type: "list",
      name: "command",
      message: " Nodefony CLI : ",
      default: 0,
      pageSize: this.choices.length,
      choices: this.choices,
      filter: (val) => {
        switch (val) {
        case "Create Database":
          return "create";
        case "Synchronize":
          return "sync";
        case "Migrate":
          return "migrate";
        case "Migrations Pending":
          return "migrateP";
        case "Migrations Executed":
          return "migrateE";
        case "Delete PM2 Production Project":
          return "delete";
        case "Quit":
          return "quit";
        default:
          console.log("\n");
          this.log(`command not found : ${val}`, "ERROR");
          this.cli.terminate(1);
        }
      }
    }])
      .then((response) => {
        this.start(response);
        return response;
      });
  }

  start (response) {
    switch (response.command) {
    case "create":
      return this.cli.setCommand("sequelize:create:database");
    case "sync":
      return this.sync();
    case "migrate":
      return this.cli.setCommand("sequelize:migrate:up");
    case "migrateP":
      return this.cli.setCommand("sequelize:migrate:pending");
    case "migrateE":
      return this.cli.setCommand("sequelize:migrate:executed");
    case "quit":
      return this.cli.setCommand("showmenu");
    default:
      this.log(`Command : ${response.command} Not Found`, "ERROR");
      return this.cli.setCommand("", "-h");
    }
  }

  sync () {
    return this.cli.prompt([{
      type: "list",
      name: "sync",
      message: "Synchronize type",
      default: 0,
      pageSize: 3,
      choices: ["sync", "alter", "force"],
      filter: (value) => value
    }])
      .then((response) => this.cli.setCommand("sequelize:sync", [response.sync]));
  }
};
