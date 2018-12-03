const uikitTask = require(path.resolve(__dirname, "uikitTask.js"));

class uikitCommand extends nodefony.Command {
  constructor(cli, bundle) {
    super("uikit", cli, bundle);
    this.setTask("task", uikitTask);
  }
}
module.exports = uikitCommand;
