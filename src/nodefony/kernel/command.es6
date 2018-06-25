module.exports = nodefony.register("Command", () => {


  class Command extends nodefony.Service {

    constructor(name, cli, bundle) {
      super(name, cli.container);
      this.bundleName = bundle.name;
      this.cli = cli;
      this.interactive = this.cli.commander.interactive;
      this.json = this.cli.commander.json;
      this.tasks = {};
      this.optionsTables = this.cli.optionsTables;
    }

    showBanner() {
      this.cli.clear();
      this.cli.asciify("      " + this.name, {}, (err, data) => {
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
          msgid = `COMMAND ${this.name}`;
        }
        return super.logger(pci, severity, msgid, msg);
      } catch (e) {
        console.log(e, "\n", pci);
      }
    }

    showHelp(help = "") {
      for (let mytask in this.tasks) {
        this.tasks[mytask].showHelp();
      }
      return help;
    }

    setTask(name, task) {
      try {
        if (task) {
          let instance = new task(name, this);
          if (instance instanceof nodefony.Task) {
            return this.tasks[instance.name] = instance;
          }
          throw new Error(`Command setTask must be instance of nodefony.Task class`);
        }
        throw new Error(`Command setTask must register nodefony.Task class`);
      } catch (e) {
        throw e;
      }
    }

    getTask(name) {
      return this.tasks[name];
    }

    setHelp(command, descrption) {
      this.cli.displayTable([
        ["", this.cli.clc.green(command), descrption]
      ], this.optionsTables);
    }
  }

  return Command;
});