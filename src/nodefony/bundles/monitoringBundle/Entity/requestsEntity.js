/*
 *
 *
 *    ENTITY REQUESTS
 *
 *
 */
const Sequelize = require("sequelize");

module.exports = nodefony.registerEntity("requests", function () {

  const requests = function (db /*, ormService*/ ) {

    const model = db.define("requests", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      remoteAddress: {
        type: Sequelize.STRING
      },
      userAgent: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.TEXT
      },
      route: {
        type: Sequelize.STRING
      },
      method: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      protocole: {
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING
      },
      data: {
        type: Sequelize.TEXT
      },
    });

    /*ormService.listen(this, 'onReadyConnection', function(connectionName, db, ormService){
        if(connectionName == 'nodefony'){

        }
    });*/
    return model;
  };
  return {
    type: "sequelize",
    connection: "nodefony",
    entity: requests
  };
});
