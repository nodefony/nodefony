module.exports = nodefony.register("Task", () => {


  /**
   *
   * command:task:action
   */
  class Task extends nodefony.Service {
    constructor(name, command) {
      super(name, command.container, command.notificationsCenter);
      this.command = command;
      this.cli = this.command.cli;
    }

    showBanner() {
      this.cli.clear();
      this.cli.asciify(`      ${this.command.name} ${this.name}`, {}, (err, data) => {
        if (err) {
          throw err;
        }
        let color = this.cli.clc.blueBright.bold;
        console.log(color(data));
        this.cli.blankLine();
      });
    }

    logger(pci, severity, msgid, msg) {
      try {
        if (!msgid) {
          msgid = `COMMAND ${this.command.name} TASK ${this.name}`;
        }
        return super.logger(pci, severity, msgid, msg);
      } catch (e) {
        console.log(e, "\n", pci);
      }
    }

    showHelp(help = "") {
      return help;
    }

    setHelp(command, description) {
      this.cli.displayTable([
        ["", this.cli.clc.green(command), description]
      ], this.command.optionsTables);
    }

  }

  return Task;
});