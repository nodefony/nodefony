const fixturesTask = require(path.resolve(__dirname, "fixturesTask.js"));

class mongoCommand extends nodefony.Command {

  constructor(cli, bundle) {
    super("mongo", cli, bundle);
    this.setTask("fixtures", fixturesTask);

  }

}

module.exports = mongoCommand;