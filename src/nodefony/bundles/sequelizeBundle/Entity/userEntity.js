/*
 *
 *
 *    ENTITY USER
 *
 *
 */
const Sequelize = require("sequelize");

module.exports = nodefony.registerEntity("user", function () {

  const User = function (db, ormService) {

    const model = db.define("user", {
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
    });

    model.getUserPassword = function getUserPassword(username, callback) {
      return this.findOne({
        where: {
          username: username
        }
      }).then(function (user) {
        if (user) {
          return callback(null, user.password);
        }
        return callback({
          status: 401,
          message: "User : " + username + " not Found"
        }, null);
      }).catch(function (error) {
        if (error) {
          return callback(error, null);
        }
      });
    };

    model.loadUserByUsername = function (username, callback) {
      return this.findOne({
        where: {
          username: username
        }
      }).then(function (user) {
        return callback(null, user);
      }).catch(function (error) {
        if (error) {
          return callback(error, null);
        }
      });
    };

    model.generatePassword = function generatePassword() {
      let buf = crypto.randomBytes(256);
      let hash = crypto.createHash('md5');
      return hash.update(buf).digest("hex");
    };

    ormService.listen(this, 'onReadyConnection', function (connectionName, db, ormService) {
      if (connectionName === 'nodefony') {
        let session = ormService.getEntity("session");
        if (session) {
          model.hasMany(session, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
          });
        } else {
          throw "ENTITY ASSOCIATION session NOT AVAILABLE";
        }
      }
    });
    return model;
  };

  return {
    type: "sequelize",
    connection: "nodefony",
    entity: User
  };
});
