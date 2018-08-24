const listTask = require(path.resolve(__dirname, "listTask.js"));
const launchTask = require(path.resolve(__dirname, "launchTask.js"));


class unitestCommand extends nodefony.Command {
  constructor(cli, bundle) {
    super("unitest", cli, bundle);
    this.setTask("list", listTask);
    this.setTask("launch", launchTask);
  }
}
module.exports = unitestCommand;