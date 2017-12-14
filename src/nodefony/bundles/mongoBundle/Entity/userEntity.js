/*
 *
 *
 *    ENTITY USER
 *
 *
 */
//const Mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

module.exports = nodefony.registerEntity("user", function () {

  const User = function (db, ormService) {
    let schema = new Schema({
      username: {
        type: String,
        unique: true,
        required: true
      },
      password: {
        type: String
      },
      provider: {
        type: String,
        default: "nodefony"
      },
      enabled: {
        type: Boolean,
        default: true
      },
      credentialsNonExpired: {
        type: Boolean,
        default: true
      },
      accountNonLocked: {
        type: Boolean,
        default: true
      },
      email: {
        type: String
        //unique: true
      },
      name: {
        type: String
      },
      surname: {
        type: String
      },
      lang: {
        type: String,
        default: "en_en"
      },
      roles: {
        type: String,
        default: 'ROLE_USER'
      },
      gender: {
        type: String
      },
      displayName: {
        type: String
      },
      url: {
        type: String
      },
      image: {
        type: String
      }
    });

    schema.statics.getUserPassword = function getUserPassword(username, callback) {
      return this.findOne({
        username: username
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

    schema.statics.loadUserByUsername = function (username, callback) {
      return this.findOne({
        username: username
      }).then(function (user) {
        return callback(null, user);
      }).catch(function (error) {
        if (error) {
          return callback(error, null);
        }
      });
    };

    schema.statics.generatePassword = function generatePassword() {
      let buf = crypto.randomBytes(256);
      let hash = crypto.createHash('md5');
      return hash.update(buf).digest("hex");
    };

    ormService.listen(this, 'onReadyConnection', function (connectionName, db, ormService) {
      if (connectionName === 'nodefony') {
        let session = ormService.getEntity("session");
        if (session) {
          /*model.hasMany(session, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
          });*/
        } else {
          throw "ENTITY ASSOCIATION session NOT AVAILABLE";
        }
      }
    });
    return db.model('user', schema);
  };

  return {
    type: "mongoose",
    connection: "nodefony",
    entity: User
  };
});