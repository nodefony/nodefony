// const Mongoose = require('mongoose');
const {Schema} = require("mongoose");

const schema = {
  session_id: {
    type: String,
    index: true,
    unique: true
  },
  context: {
    type: String,
    default: "default"
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  Attributes: {
    type: Object,
    default: {}
  },
  flashBag: {
    type: Object,
    default: {}
  },
  metaBag: {
    type: Object,
    default: {}
  }
};

module.exports = class session extends nodefony.Entity {
  constructor (bundle) {
    super(bundle, "session", "mongoose", "nodefony");
  }

  registerModel (db) {
    const mySchema = new Schema(schema, {
      collection: "sessions",
      timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt"
      }
    });
    mySchema.statics.fetchAll = function fetchAll (callback) {
      return this.findAll().then((result) => callback(null, result))
        .catch((error) => {
          if (error) {
            return callback(error, null);
          }
        });
    };
    return db.model(this.name, mySchema);
  }
};
