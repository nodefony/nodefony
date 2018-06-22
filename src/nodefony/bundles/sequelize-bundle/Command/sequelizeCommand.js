const fixturesTask = require(path.resolve(__dirname, "fixturesTask.js"));
const generateTask = require(path.resolve(__dirname, "generateTask.js"));
const queryTask = require(path.resolve(__dirname, "queryTask.js"));
const entityTask = require(path.resolve(__dirname, "entityTask.js"));

class sequelizeCommand extends nodefony.Command {
  constructor(cli, bundle) {
    super("sequelize", cli, bundle);
    this.setTask("generate", generateTask);
    this.setTask("fixtures", fixturesTask);
    this.setTask("query", queryTask);
    this.setTask("entity", entityTask);
  }
}
module.exports = sequelizeCommand;