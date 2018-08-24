/*
 *
 *
 *    ENTITY REQUESTS
 *
 *
 */
const Sequelize = require("sequelize");

module.exports = class requests extends nodefony.Entity {

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "requests", "sequelize", "nodefony");

  }

  getSchema() {
    return {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      remoteAddress: {
        type: Sequelize.STRING
      },
      userAgent: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.TEXT
      },
      route: {
        type: Sequelize.STRING
      },
      method: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      protocole: {
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING
      },
      data: {
        type: Sequelize.TEXT
      }
    };
  }

  registerModel(db) {
    return db.define(this.name, this.getSchema(), {
      logging: false
    });
  }

};