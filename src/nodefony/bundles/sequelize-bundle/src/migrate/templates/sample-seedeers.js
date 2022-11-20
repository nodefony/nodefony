const {
  Sequelize,
  DataTypes,
  Model
} = require('sequelize');

const path = require('node:path');

class Seedeers extends nodefony.Service {
  constructor(kernel) {
    super(path.basename(__filename), kernel.container);
  }

  async up({
    context: queryInterface
  }) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     * this.log("Seedeers People up ");
    */

  }

  async down({
    context: queryInterface
  }) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     * this.log("Seedeers People Down ");
     */

  }
}

module.exports = new Seedeers(kernel);
