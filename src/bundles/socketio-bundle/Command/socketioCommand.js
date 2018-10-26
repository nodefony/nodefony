const socketioTask = require(path.resolve(__dirname, "socketioTask.js"));

class socketioCommand extends nodefony.Command {
  constructor(cli, bundle) {
    super("socketio", cli, bundle);
    this.setTask("task", socketioTask);
  }
}
module.exports = socketioCommand;
