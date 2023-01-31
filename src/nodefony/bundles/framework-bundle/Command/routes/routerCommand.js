const displayTask = require(path.resolve(__dirname, "routesTask.js"));

class routerCommand extends nodefony.Command {
  constructor (cli, bundle) {
    super("router", cli, bundle);
    this.setTask("display", displayTask);
  }
}
module.exports = routerCommand;
