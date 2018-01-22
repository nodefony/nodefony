/*
 *
 *
 *    ENTITY USER
 *
 *
 */
//const Mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const schema = {
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
};

module.exports = class user extends nodefony.Entity {

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "user", "mongoose", "nodefony");
    this.once("onConnect", (name, db) => {
      this.model = this.registerModel(db);
      this.orm.setEntity(this);
    });
  }

  registerModel(db) {
    let mySchema = new Schema(schema, {
      timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
      }
    });

    mySchema.statics.getUserPassword = function getUserPassword(username, callback) {
      return this.findOne({
        username: username
      }).then(function (user) {
        if (user) {
          if (callback) {
            callback(null, user.password);
          }
          return user.password;
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

    mySchema.statics.loadUserByUsername = function (username, callback) {
      return this.findOne({
        username: username
      }).then((user) => {
        //throw user;
        if (user) {
          if (callback) {
            callback(null, user);
          }
          return user;
        }
        let error = new Error("User : " + username + " not Found");
        error.code = 401;
        if (callback) {
          callback(error, null);
        }
        throw error;
      }).catch(function (error) {
        if (error) {
          return callback(error, null);
        }
      });
    };

    mySchema.statics.generatePassword = function generatePassword() {
      let buf = crypto.randomBytes(256);
      let hash = crypto.createHash('md5');
      return hash.update(buf).digest("hex");
    };

    return db.model(this.name, mySchema);
  }
};