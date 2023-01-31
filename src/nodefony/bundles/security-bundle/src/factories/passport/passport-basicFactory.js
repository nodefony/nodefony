/*
 *	PASSPORT BASIC  FACTORY
 */
const {BasicStrategy} = require("passport-http");

module.exports = nodefony.registerFactory("passport-basic", () => {
  class basicFactory extends nodefony.passeportFactory {
    constructor (security, settings) {
      super("basic", security, settings);
    }

    getStrategy (options) {
      return new Promise((resolve, reject) => {
        try {
          const strategy = new BasicStrategy(options, (username, password, done) => {
            this.log(`TRY AUTHENTICATION ${this.name} : ${username}`, "DEBUG");
            const mytoken = new nodefony.security.tokens.userPassword(username, password);
            this.authenticateToken(mytoken).then((token) => {
              done(null, token);
              return token;
            })
              .catch((error) => {
                done(error, null);
                throw error;
              });
          });
          return resolve(strategy);
        } catch (e) {
          return reject(e);
        }
      });
    }
  }

  return basicFactory;
});
