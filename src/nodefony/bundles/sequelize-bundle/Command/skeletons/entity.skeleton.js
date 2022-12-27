const {
  Sequelize,
  DataTypes,
  Model
} = nodefony.Sequelize;

/*
 *    ENTITY {{name}}
 */

module.exports = class {{name}} extends nodefony.Entity {

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "{{name}}", "sequelize", "{{connector}}");

    // this.orm.on("onOrmReady", ( orm ) => {
    //    let user = orm.getEntity("user");
    //    who can define associations here but prefere static method associate in class
    // });
  }

  getSchema() {
    return {{models}}
  }

  registerModel(sequelize) {
    class MyModel extends Model {

      static associate(models) {
        // Define Associations here
        // if (models.user) {}
      }

    }
    /**
     *    for options https://sequelize.org
     */
    MyModel.init(this.getSchema(), {
      sequelize,
      modelName: this.name,
      hooks: {}
    });
    return MyModel;

  }

};
