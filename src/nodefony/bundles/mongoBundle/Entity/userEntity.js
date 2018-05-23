/*
 *
 *
 *    ENTITY USER
 *
 *
 */
//const Mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

module.exports = class user extends nodefony.Entity {

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "user", "mongoose", "nodefony");

  }

  getSchema() {
    const encodePassword = this.encode.bind(this);
    return {
      username: {
        type: String,
        unique: true,
        required: true
      },
      password: {
        type: String,
        set: (value) => {
          return encodePassword(value);
        }
      },
      enabled: {
        type: Boolean,
        default: true
      },
      userNonExpired: {
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
      url: {
        type: String
      },
      image: {
        type: String
      }
    };
  }

  registerModel(db) {
    let mySchema = new Schema(this.getSchema(), {
      timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
      }
    });

    return db.model(this.name, mySchema);
  }
};