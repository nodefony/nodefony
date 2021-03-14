// migrations/00_initial.js

const { Sequelize } = require('sequelize');
const serviceUmzug = kernel.get("umzug");

async function up({ context: queryInterface }) {
	serviceUmzug.log("pass up")
}

async function down({ context: queryInterface }) {
	serviceUmzug.log("pass down")
}

module.exports = { up, down };
