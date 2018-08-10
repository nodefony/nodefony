const fixturesTask = require(path.resolve(__dirname, "fixturesTask.js"));
const syncTask = require(path.resolve(__dirname, "syncTask.js"));
const queryTask = require(path.resolve(__dirname, "queryTask.js"));
const entityTask = require(path.resolve(__dirname, "entityTask.js"));

class sequelizeCommand extends nodefony.Command {
  constructor(cli, bundle) {
    super("sequelize", cli, bundle);
    this.setTask("sync", syncTask);
    this.setTask("fixtures", fixturesTask);
    this.setTask("query", queryTask);
    this.setTask("entity", entityTask);
  }
}
module.exports = sequelizeCommand;