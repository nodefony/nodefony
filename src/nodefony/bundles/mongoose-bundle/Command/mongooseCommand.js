const fixturesTask = require(path.resolve(__dirname, "fixturesTask.js"));

class mongooseCommand extends nodefony.Command {

  constructor(cli, bundle) {
    super("mongoose", cli, bundle);
    this.setTask("fixtures", fixturesTask);

  }

}

module.exports = mongooseCommand;