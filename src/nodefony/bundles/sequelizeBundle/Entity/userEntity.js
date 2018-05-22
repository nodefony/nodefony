const Sequelize = require("sequelize");
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
        type: Sequelize.STRING(126).BINARY,
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING(256).BINARY,
        set(value) {
          let encoded = encodePassword(value);
          return this.setDataValue("password", encoded);
        }
      },
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
        type: Sequelize.STRING
      },
      name: Sequelize.STRING,
      surname: Sequelize.STRING,
      lang: {
        type: Sequelize.STRING,
        defaultValue: "en_en"
      },
      roles: {
        type: Sequelize.STRING,
        defaultValue: 'ROLE_USER'
      },
      gender: Sequelize.STRING,
      url: Sequelize.STRING,
      image: Sequelize.STRING
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