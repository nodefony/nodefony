/*
 *
 *
 *    ENTITY requests
 *
 *
 */
//const Mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

module.exports = nodefony.registerEntity("requests", function () {

  const Requests = function (db /*, ormService*/ ) {
    let schema = new Schema({
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
    }, {
      timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
      }
    });
    return db.model('requests', schema);
  };

  return {
    type: "mongoose",
    connection: "nodefony",
    entity: Requests
  };
});