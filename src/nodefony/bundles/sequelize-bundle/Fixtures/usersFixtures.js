const Sequelize = require("sequelize");
module.exports = nodefony.registerFixture("users", function () {

  const userPromise = function (resolve, reject) {

    const user = this.getEntity("user");

    const tab = [{
      username: "anonymous",
      name: "anonymous",
      surname: "anonymous",
      displayName: "Anonymous",
      password: "anonymous",
      lang: "en_en",
      roles: ["ROLE_ANONYMOUS"]
    }, {
      username: "admin",
      name: "administrator",
      surname: "nodefony",
      displayName: "administrator",
      password: "admin",
      roles: ["ROLE_ADMIN"]
    }, {
      username: "1000",
      name: "User",
      surname: "1000",
      displayName: "1000",
      password: "1234",
      lang: "fr_fr",
      roles: ["ROLE_USER"]
    }, {
      username: "2000",
      name: "User",
      surname: "2000",
      displayName: "2000",
      password: "1234",
      lang: "fr_fr",
      roles: ["ROLE_USER"]
    }, {
      username: "3000",
      name: "User",
      surname: "3000",
      displayName: "3000",
      password: "1234",
      lang: "fr_fr",
      roles: ["ROLE_USER"]
    }];

    const connection = this.getConnection("nodefony");
    switch (connection.options.dialect) {
    case "mysql":
      connection.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
          return user.sync({
            force: false
          });
        })
        .then((User) => {
          this.logger("Database synchronised  ", "INFO");
          return Sequelize.Promise.map(tab, (obj) => {
            return User.findOrCreate({
              where: {
                username: obj.username
              },
              defaults: obj
            });
          });
        })
        .spread((...args) => {
          for (var i = 0; i < args.length; i++) {
            if (args[i][1]) {
              this.logger("ADD USER : " + args[i][0].username, "INFO");
            } else {
              this.logger("ALREADY EXIST USER : " + args[i][0].username, "INFO");
            }
          }
          return args;
        })
        .then(() => {
          return connection.query('SET FOREIGN_KEY_CHECKS = 1');
        })
        .catch((error) => {
          this.logger(error);
          return reject(error);
        })
        .done(function ( /*error, result*/ ) {
          return resolve("userEntity");
        });
      break;
    case "sqlite":
      /*user.sync({
          force: false
        })
        .then(() => {
          this.logger("Database synchronised  ", "INFO");
          return Sequelize.Promise.map(tab, function (obj) {
            return user.findOrCreate({
              where: {
                username: obj.username
              },
              defaults: obj
            });
          });
        })
        .spread(function () {
          for (var i = 0; i < arguments.length; i++) {
            if (arguments[i][1]) {
              this.logger("ADD USER : " + arguments[i][0].username, "INFO");
            } else {
              this.logger("ALREADY EXIST USER : " + arguments[i][0].username, "INFO");
            }
          }
        }.bind(this))
        .catch(function (error) {
          this.logger(error);
          reject(error);
        }.bind(this))
        .done(() => {
          resolve("userEntity");
        });*/

      //connection.query('SELECT * FROM users  ')
      connection.query('PRAGMA foreign_keys = 0  ')
        .then(() => {
          return user.sync({
            force: false
          });
        })
        .then((User) => {
          this.logger("Database synchronised  ", "INFO");
          return Sequelize.Promise.map(tab, (obj) => {
            return User.findOrCreate({
              where: {
                username: obj.username
              },
              defaults: obj
            });
          });
        })
        .spread((...args) => {
          for (var i = 0; i < args.length; i++) {
            if (args[i][1]) {
              this.logger("ADD USER : " + args[i][0].username, "INFO");
            } else {
              this.logger("ALREADY EXIST USER : " + args[i][0].username, "INFO");
            }
          }
        })
        .catch((error) => {
          this.logger(error, "ERROR");
          return reject(error);
        })
        .done(() => {
          return resolve("userEntity");
        });
      break;
    }
  };

  return {
    type: "sequelize",
    connection: "nodefony",
    entity: "user",
    fixture: userPromise
  };
});