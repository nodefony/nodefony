const Sequelize = require("sequelize");
module.exports = nodefony.registerFixture("users", function () {

  const userPromise = function (resolve, reject) {

    const user = this.getEntity("user");


    const createUser = function (entity, user) {
      return new Promise((resolve) => {
          return resolve(entity.findOrCreate({
            where: {
              username: user.username
            },
            defaults: user
          }));
        })
        .then((args) => {
          if (args[1]) {
            this.logger("ADD USER : " + args[0].username, "INFO");
          } else {
            this.logger("ALREADY EXIST USER : " + args[0].username, "INFO");
          }
          return args;
        })
        .catch(e => {
          throw e;
        });
    };

    const syncCall = function (User, tab) {
      if (tab.length) {
        let fix = tab.shift();
        return createUser.call(this, User, fix)
          .then(() => {
            return syncCall.call(this, User, tab);
          });
      }
      return Promise.resolve();
    };

    const tab = [{
      username: "anonymous",
      name: "anonymous",
      surname: "anonymous",
      password: "anonymous",
      email: "anonymous@nodefony.com",
      lang: "en_en",
      roles: ["ROLE_ANONYMOUS"]
    }, {
      username: "admin",
      name: "administrator",
      surname: "nodefony",
      password: "admin",
      email: "administrator@nodefony.com",
      roles: ["ROLE_ADMIN"]
    }, {
      username: "1000",
      name: "Michael",
      surname: "Corleone",
      password: "1234",
      lang: "fr_fr",
      email: "michael@nodefony.com",
      gender: "male",
      roles: ["ROLE_ADMIN", "ROLE_USER"]
    }, {
      username: "2000",
      name: "Vito",
      surname: "Corleone",
      password: "1234",
      lang: "fr_fr",
      email: "vito@nodefony.com",
      gender: "male",
      roles: ["ROLE_USER"]
    }, {
      username: "3000",
      name: "Connie",
      surname: "Corleone",
      password: "1234",
      email: "connie@nodefony.com",
      gender: "female",
      lang: "fr_fr",
      roles: ["ROLE_USER"]
    }];

    const connection = this.getConnection("nodefony");
    switch (connection.options.dialect) {
    case "mysql":
      return connection.query('SET FOREIGN_KEY_CHECKS = 0')
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
    case "sqlite":
      return connection.query('PRAGMA foreign_keys = 0  ')
        .then(() => {
          return user.sync({
            force: false
          });
        })
        .then((User) => {
          this.logger("Database synchronised  ", "INFO");
          return syncCall.call(this, User, tab);
        })
        .catch((error) => {
          this.logger(error, "ERROR");
          return reject(error);
        })
        .done(() => {
          return resolve("userEntity");
        });
    }
  };

  return {
    type: "sequelize",
    connection: "nodefony",
    entity: "user",
    fixture: userPromise
  };
});