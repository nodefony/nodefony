const {
  Sequelize,
  DataTypes,
  Model
} = require('sequelize');
const path = require('node:path');

class Migrate extends nodefony.Service {
  constructor(kernel) {
    super(path.basename(__filename), kernel.container);
    this.serviceUmzug = this.get("umzug");
    //this.orm = this.kernel.getOrm();
  }

  async up({
    context: queryInterface
  }) {
    this.log("Migrate up ");
  }

  async down({
    context: queryInterface
  }) {
    this.log("Migrate Down ");
  }
}

module.exports = new Migrate(kernel);
