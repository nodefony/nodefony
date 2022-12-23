/*
 *
 *
 *    ENTITY requests
 *
 *
 */
//const Mongoose = require('mongoose');
const {Schema} = require('mongoose');

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
  time: {
    type: Number
  },
  method: {
    type: String
  },
  state: {
    type: String
  },
  protocol: {
    type: String
  },
  scheme: {
    type: String
  },
  username: {
    type: String,
    ref:"user"
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
