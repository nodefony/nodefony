const Sequelize = require("sequelize");
const Model = Sequelize.Model;
/*
 *
 *
 *    ENTITY USER
 *
 *
 */

module.exports = class user extends nodefony.Entity {

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
    const encodePassword = this.encode.bind(this);
    return {
      /*id: {
        type: Sequelize.INTEGER,
        //primaryKey: true,
        autoIncrement: true
      },*/
      username: {
        type: Sequelize.STRING(126),
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING(256),
        set(value) {
          let encoded = encodePassword(value);
          return this.setDataValue("password", encoded);
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
        allowNull: false
      },
      name: Sequelize.STRING,
      surname: Sequelize.STRING,
      lang: {
        type: Sequelize.STRING,
        defaultValue: "en_en"
      },
      roles: {
        type: Sequelize.JSON,
        defaultValue: [],
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
      url: Sequelize.STRING,
      image: Sequelize.STRING
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
