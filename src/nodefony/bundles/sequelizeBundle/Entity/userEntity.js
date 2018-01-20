const Sequelize = require("sequelize");
/*
 *
 *
 *    ENTITY USER
 *
 *
 */
const schema = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: Sequelize.STRING(126).BINARY,
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
    defaultValue: 'ADMIN'
  },
  gender: Sequelize.STRING,
  displayName: Sequelize.STRING,
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
    this.on("onConnect", (name, db) => {
      this.model = this.registerModel(db);
      this.orm.setEntity(this);
    });
    this.orm.on("onOrmReady", ( /*orm*/ ) => {
      let session = this.orm.getEntity("session");
      if (session) {
        this.model.hasMany(session, {
          foreignKey: 'user_id',
          onDelete: 'CASCADE'
        });
      } else {
        throw new Error("ENTITY ASSOCIATION session NOT AVAILABLE");
      }
    });
  }

  registerModel(db) {
    let model = db.define(this.name, schema, {
      logging: false
    });

    model.getUserPassword = function getUserPassword(username, callback) {
      return this.findOne({
        where: {
          username: username
        }
      }).then(function (user) {
        if (user) {
          if (callback) {
            callback(null, user.get("password"));
          }
          return user.get("password");
        }
        let error = new Error("User : " + username + " not Found");
        error.code = 401;
        if (callback) {
          callback(error, null);
        }
        throw error;
      }).catch(function (error) {
        if (error) {
          if (callback) {
            callback(error, null);
          }
          return error;
        }
      });
    };

    model.loadUserByUsername = function (username, callback) {
      return this.findOne({
        where: {
          username: username
        }
      }).then(function (user) {
        if (callback) {
          callback(null, user.get());
        }
        return user.get();
      }).catch(function (error) {
        if (error) {
          if (callback) {
            callback(error, null);
          }
          return error;
        }
      });
    };

    model.generatePassword = function generatePassword() {
      let buf = crypto.randomBytes(256);
      let hash = crypto.createHash('md5');
      return hash.update(buf).digest("hex");
    };

    return model;
  }
};