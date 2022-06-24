/*
 *
 *
 *    ENTITY REQUESTS
 *
 *
 */
const {
  Sequelize,
  DataTypes,
  Model
} = nodefony.Sequelize;

module.exports = class requests extends nodefony.Entity {

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "requests", "sequelize", "nodefony");
    this.orm.on("onOrmReady", ( orm ) => {
        let user = this.orm.getEntity("user");
        if (user) {
          user.hasMany(this.model, {
            foreignKey: {
              allowNull: true,
              name:"username"
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          })
          this.model.belongsTo(user, {
            foreignKey: {
              allowNull: true,
              name:"username"
            },
            targetKey:"username",
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          });
        } else {
          this.log("ENTITY ASSOCIATION user NOT AVAILABLE" , "WARNING");
          //throw new Error("ENTITY ASSOCIATION user NOT AVAILABLE");
        }
      });
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
      protocol: {
        type: DataTypes.STRING
      },
      scheme: {
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
