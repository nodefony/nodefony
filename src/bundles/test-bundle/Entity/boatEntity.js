const Sequelize = require("sequelize");
/*
 *    ENTITY boat
 */

module.exports = class boat extends nodefony.Entity {

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "boat", "sequelize", "nodefony");

  }

  getSchema() {
    return {
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
    };
  }

  registerModel(db) {
    let model = db.define(this.name, this.getSchema(), {
      logging: this.logger.bind(this)
    });
    return model;
  }

  logger(pci /*, sequelize*/ ) {
    const msgid = "Entity " + this.name;
    return super.logger(pci, "DEBUG", msgid);
  }
};