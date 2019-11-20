const Sequelize = require("sequelize");
const Model = Sequelize.Model;
/*
 *
 *
 *    ENTITY JWT
 *
 *
 */

module.exports = class jwt extends nodefony.Entity {

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "jwt", "sequelize", "nodefony");

  }

  getSchema() {

    return {
      username:{
        type: Sequelize.STRING(256)
      },
      refreshToken: {
        type: Sequelize.STRING(256),
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      token: {
        type: Sequelize.STRING(256)
      }
    };
  }

  registerModel(db) {
    class MyModel extends Model{}
    MyModel.init(this.getSchema(), {
      sequelize: db,
      modelName: this.name
    });
    return MyModel;
  }

  logger(pci /*, sequelize*/ ) {
    const msgid = "Entity " + this.name;
    return super.logger(pci, "DEBUG", msgid);
  }
};
