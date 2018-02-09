const Sequelize = require("sequelize");
/*
 *
 *
 *    ENTITY USER
 *
 *
 */
const schema = {
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
  password: Sequelize.STRING,
  provider: {
    type: Sequelize.STRING,
    defaultValue: "nodefony"
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

module.exports = class user extends nodefony.Entity {

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "user", "sequelize", "nodefony");

    this.orm.on("onOrmReady", ( /*orm*/ ) => {
      let session = this.orm.getEntity("session");
      if (session) {
        this.model.hasMany(session, {
          foreignKey: 'username',
          onDelete: 'CASCADE'
        });
      } else {
        throw new Error("ENTITY ASSOCIATION session NOT AVAILABLE");
      }
    });
  }

  registerModel(db) {
    return db.define(this.name, schema, {
      logging: false
    });
  }
};