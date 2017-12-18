//const Mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const schema = {
  session_id: {
    type: String,
    index: true,
    unique: true,
  },
  context: {
    type: String,
    default: "default"
  },
  user_id: {
    type: "ObjectId",
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

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "session", "mongoose", "nodefony");
    this.once("onConnect", (name, db) => {
      this.model = this.registerModel(db);
      this.orm.setEntity(this);
    });
  }

  registerModel(db) {
    let mySchema = new Schema(schema, {
      collection: 'sessions',
      timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
      }
    });
    mySchema.statics.fetchAll = function (callback) {
      return this.findAll().then(function (result) {
        return callback(null, result);
      }).catch(function (error) {
        if (error) {
          return callback(error, null);
        }
      });
    };
    return db.model(this.name, mySchema);
  }
};