class Command extends nodefony.Service {

  constructor(name, cli, bundle) {
    super(name, cli.container);
    if (bundle) {
      this.bundleName = bundle.name;
    }
    this.cli = cli;
    this.interactive = this.cli.commander.opts().interactive;
    this.json = this.cli.commander.opts().json;
    this.tasks = {};
    this.optionsTables = this.cli.optionsTables;
  }

  showBanner() {
    return this.cli.asciify("      " + this.name)
      .then((data) => {
        if (this.json) {
          return data;
        }
        this.cli.clear();
        let color = this.cli.clc.blueBright.bold;
        console.log(color(data));
        this.cli.blankLine();
        return data;
      })
      .catch((e) => {
        return e;
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

  terminate(code) {
    return this.cli.terminate(code);
  }
}

nodefony.Command = Command;
module.exports = Command;
