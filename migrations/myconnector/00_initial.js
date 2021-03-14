// migrations/00_initial.js
const { Sequelize } = require('sequelize');
const serviceUmzug = kernel.get("umzug");

async function up({ context: queryInterface }) {
	await queryInterface.createTable('boat', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING
    },
    size: {
      type: Sequelize.STRING
    }
	});
}

async function down({ context: queryInterface }) {
	await queryInterface.dropTable('boat');
}

module.exports = { up, down };
