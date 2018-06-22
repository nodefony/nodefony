const bundlesTask = require(path.resolve(__dirname, "bundlesTask.js"));

class generateCommand extends nodefony.Command {

  constructor(cli, bundle) {
    super("generate", cli, bundle);
    this.setTask("bundle", bundlesTask);
  }

  bundle() {
    let task = this.getTask("bundle");
    return task.nodefony.apply(task, arguments);
  }

}

module.exports = generateCommand;