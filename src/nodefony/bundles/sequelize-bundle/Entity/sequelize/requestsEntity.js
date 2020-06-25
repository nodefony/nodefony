/*
 *
 *
 *    ENTITY REQUESTS
 *
 *
 */
const { Sequelize, DataTypes, Model } = require("sequelize");

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
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      remoteAddress: {
        type: DataTypes.STRING
      },
      userAgent: {
        type: DataTypes.STRING
      },
      url: {
        type: DataTypes.TEXT
      },
      route: {
        type: DataTypes.STRING
      },
      method: {
        type: DataTypes.STRING
      },
      state: {
        type: DataTypes.STRING
      },
      protocole: {
        type: DataTypes.STRING
      },
      username: {
        type: DataTypes.STRING
      },
      data: {
        type: DataTypes.TEXT
      }
    };
  }

  registerModel(db) {
    class MyModel extends Model{}
    MyModel.init(this.getSchema(), {
      sequelize: db,
      modelName: this.name,
      logging:this.logger.bind(this)
    });
    return MyModel;
  }

};
