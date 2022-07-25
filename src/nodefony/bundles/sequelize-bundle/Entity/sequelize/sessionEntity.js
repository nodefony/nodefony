const {
  Sequelize,
  DataTypes,
  Model
} = nodefony.Sequelize;

module.exports = class session extends nodefony.Entity {

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "session", "sequelize", "nodefony");

    this.orm.on("onOrmReady", ( orm ) => {
        let user = this.orm.getEntity("user");
        //console.log(user instanceof Model)
        //console.log(this.model)
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
      session_id: {
        type: DataTypes.STRING(126),
        primaryKey: true
      },
      context: {
        type: DataTypes.STRING(126),
        defaultValue: "default",
        //primaryKey: true
      },
      /*username: {
        type: DataTypes.STRING(126),
        defaultValue: "",
        allowNull: true
      },*/
      Attributes: {
        type: DataTypes.JSON
        /*set(value) {
          return this.setDataValue('Attributes', JSON.stringify(value));
        },
        get(value) {
          return JSON.parse(this.getDataValue(value));
        }*/
      },
      flashBag: {
        type: DataTypes.JSON
        /*set: function (value) {
          return this.setDataValue('flashBag', JSON.stringify(value));
        },
        get(value) {
          return JSON.parse(this.getDataValue(value));
        }*/
      },
      metaBag: {
        type: DataTypes.JSON,
        /*set(value) {
          return this.setDataValue('metaBag', JSON.stringify(value));
        },
        get(value) {
          return JSON.parse(this.getDataValue(value));
        }*/
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
      }
    };
  }

  registerModel(db) {
    class MyModel extends Model {
      fetchAll(callback) {
        return this.findAll()
          .then(function(result) {
            return callback(null, result);
          }).catch(function(error) {
            if (error) {
              return callback(error, null);
            }
          });
      }
    }
    MyModel.init(this.getSchema(), {
      sequelize: db,
      modelName: this.name
    });
    return MyModel;

    /*let model = db.define(this.name, this.getSchema(), {
      logging: false
    });

    model.fetchAll = function (callback) {
      return this.findAll().then(function (result) {
        return callback(null, result);
      }).catch(function (error) {
        if (error) {
          return callback(error, null);
        }
      });
    };

    return model;*/
  }
};
