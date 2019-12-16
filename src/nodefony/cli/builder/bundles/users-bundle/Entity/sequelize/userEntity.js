const Sequelize = require("sequelize");
const Model = Sequelize.Model;
const validator = require('validator');
/*
 *
 *
 *    ENTITY USER
 *
 *
 */
class userEntity extends nodefony.Entity {

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "user", "sequelize", "nodefony");
    /*this.orm.on("onOrmReady", ( orm ) => {
        let session = this.orm.getEntity("session");
        if (session) {
          this.model.hasMany(session, {
            foreignKey: 'username',
            onDelete: 'CASCADE'
          });

        } else {
          throw new Error("ENTITY ASSOCIATION session NOT AVAILABLE");
        }
      });*/
  }

  getSchema() {
    return {
      username: {
        type: Sequelize.STRING(126),
        primaryKey: true,
        unique: true,
        allowNull: false,
        validate: {
          isAlphanumeric: {
            msg: "username only allow alphanumeric characters"
          }
          /*notIn: {
            args: [['admin', 'root']],
            msg: `username don't allow (admin , root) login name`
          }*/
        }
      },
      password: {
        type: Sequelize.STRING(256),
        allowNull: false,
        validate: {
          min: {
            args:[[4]],
            msg: `password  allow 4 characters min  `
          }
        }
      },
      "2fa": {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      "2fa-token": Sequelize.STRING(256),
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      userNonExpired: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      credentialsNonExpired: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      accountNonLocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      email: {
        type: Sequelize.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: {
            msg:"invalid email"
          }
        }
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          is: /^[a-z]+$/i
        }
      },
      surname: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          is: /^[a-z]+$/i
        }
      },
      lang: {
        type: Sequelize.STRING,
        defaultValue: "en_en"
      },
      roles: {
        type: Sequelize.JSON,
        defaultValue: ["ROLE_USER"],
        get(key) {
          let val = this.getDataValue(key);
          if (typeof (val) === "string") {
            val = JSON.parse(val);
          }
          return val;
        }
      },
      gender: {
        type: Sequelize.STRING,
        defaultValue: "none"
      },
      url: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      image: Sequelize.STRING
    };
  }

  validPassword(value){
    let valid = validator.isLength(value, {
      min:4,
      max:undefined
    });
    if (! valid){
      throw new nodefony.Error("password must have 4 characters min");
    }
    return value;
  }

  registerModel(db) {
    class MyModel extends Model {}
    MyModel.init(this.getSchema(), {
      sequelize: db,
      modelName: this.name,
      hooks: {
        beforeCreate: (user) => {
          this.validPassword(user.password);
          return this.encode(user.password)
            .then(hash => {
              user.password = hash;
            })
            .catch(err => {
              this.logger(err, "ERROR");
              throw err;
            });
        },
        beforeBulkUpdate: (userUpate) => {
          if ("password" in userUpate.attributes) {
            this.validPassword(userUpate.attributes.password);
            return this.encode(userUpate.attributes.password)
              .then(hash => {
                userUpate.attributes.password = hash;
              })
              .catch(err => {
                this.logger(err, "ERROR");
                throw err;
              });
          }
        }
      },
      freezeTableName: true,
      //add indexes
      indexes: [{
        unique: true,
        fields: ['email']
      }]
      // add custom validations
      //validate: {}
    });
    return MyModel;
  }

  logger(pci /*, sequelize*/ ) {
    const msgid = "Entity " + this.name;
    return super.logger(pci, "DEBUG", msgid);
  }
}

module.exports = userEntity;
