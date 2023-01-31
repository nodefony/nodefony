const syncTask = require(path.resolve(__dirname, "syncTask.js"));
const queryTask = require(path.resolve(__dirname, "queryTask.js"));
const entityTask = require(path.resolve(__dirname, "entityTask.js"));
const generateTask = require(path.resolve(__dirname, "generateTask.js"));
const createTask = require(path.resolve(__dirname, "createTask.js"));
const migrateTask = require(path.resolve(__dirname, "migrateTask.js"));
const seedeersTask = require(path.resolve(__dirname, "seedeersTask.js"));

class sequelizeCommand extends nodefony.Command {
  constructor (cli, bundle) {
    super("sequelize", cli, bundle);
    this.setTask("create", createTask);
    this.setTask("sync", syncTask);
    this.setTask("migrate", migrateTask);
    this.setTask("query", queryTask);
    this.setTask("entity", entityTask);
    this.setTask("generate", generateTask);
    this.setTask("seedeers", seedeersTask);
  }

  showHelp () {
    this.setHelp(
      "sequelize:migrate",
      "Apply all Migrations pending for all connectors"
    );
    this.setHelp(
      "sequelize:revert",
      "Revert all Migrations executed for all connectors"
    );
    super.showHelp();
  }

  migrate () {
    return this.tasks.migrate.up();
  }

  revert () {
    return this.tasks.migrate.revert();
  }
}
module.exports = sequelizeCommand;
