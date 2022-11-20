// migrations/00_initial.js
const { Sequelize } = require('sequelize');

class Migrate extends nodefony.Service {
	constructor(kernel) {
		super("Migrate", kernel.container);
		//this.serviceUmzug = this.get("umzug");
		//this.orm = this.kernel.getOrm();
	}

	async up({ context: queryInterface }){
		await queryInterface.createTable('boats', {
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

	async down({ context: queryInterface }){
		await queryInterface.dropTable('boats');
	}
}

module.exports = new Migrate(kernel);
