const webAssemblyTask = require(path.resolve(__dirname, "webAssemblyTask.js"));

class webAssemblyCommand extends nodefony.Command {
  constructor(cli, bundle) {
    super("webAssembly", cli, bundle);
    this.setTask("task", webAssemblyTask);
  }
}
module.exports = webAssemblyCommand;
