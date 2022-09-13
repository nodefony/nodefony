const {
  Sequelize,
  DataTypes,
  Model
} = nodefony.Sequelize;
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
    super(bundle, "boat", "sequelize", "myconnector");

  }

  getSchema() {
    return {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING
      },
      size: {
        type: DataTypes.STRING
      }
    };
  }

  registerModel(db) {
    let model = db.define(this.name, this.getSchema(), {
      logging: this.log.bind(this)
    });
    return model;
  }

  logger(pci /*, sequelize*/ ) {
    const msgid = "Entity " + this.name;
    return super.logger(pci, "DEBUG", msgid);
  }
};
