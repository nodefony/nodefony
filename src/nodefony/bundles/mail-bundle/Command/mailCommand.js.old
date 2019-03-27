const mailTask = require(path.resolve(__dirname, "mailTask.js"));

class mailCommand extends nodefony.Command {
  constructor(cli, bundle) {
    super("mail", cli, bundle);
    this.setTask("task", mailTask);
  }
}
module.exports = mailCommand;
