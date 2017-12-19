/*
 *
 *
 *    ENTITY requests
 *
 *
 */
//const Mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const schema = {
  remoteAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  url: {
    type: String
  },
  route: {
    type: String
  },
  method: {
    type: String
  },
  state: {
    type: String
  },
  protocole: {
    type: String
  },
  username: {
    type: String
  },
  data: {
    type: String
  }
};
module.exports = class requests extends nodefony.Entity {

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "requests", "mongoose", "nodefony");
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

    return db.model(this.name, mySchema);
  }
};