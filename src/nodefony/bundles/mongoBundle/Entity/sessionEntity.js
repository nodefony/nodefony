//const Mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

module.exports = nodefony.registerEntity("session", function () {

  const Session = function (db /*, ormService*/ ) {

    let schema = new Schema({
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
    }, {
      collection: 'sessions',
      timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
      }
    });

    schema.statics.fetchAll = function (callback) {
      return this.findAll().then(function (result) {
        return callback(null, result);
      }).catch(function (error) {
        if (error) {
          return callback(error, null);
        }
      });
    };

    return db.model('session', schema);
  };

  return {
    type: "mongoose",
    connection: "nodefony",
    entity: Session
  };

});