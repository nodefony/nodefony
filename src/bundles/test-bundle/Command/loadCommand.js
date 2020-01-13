const loadTask = require(path.resolve(__dirname, "loadTask.js"));
class loadCommand extends nodefony.Command {
  constructor(cli, bundle) {
    super("test", cli, bundle);
    this.setTask("load", loadTask);
  }


}
module.exports = loadCommand;