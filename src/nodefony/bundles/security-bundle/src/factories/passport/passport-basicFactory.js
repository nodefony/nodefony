/*
 *	PASSPORT BASIC  FACTORY
 */
const BasicStrategy = require('passport-http').BasicStrategy;

module.exports = nodefony.registerFactory("passport-basic", () => {

  class basicFactory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("basic", security, settings);
    }

    getStrategy(options) {
      return new BasicStrategy(options, (username, password, done) => {
        this.logger("TRY AUTHENTICATION " + this.name + " : " + username, "DEBUG");
        let mytoken = new nodefony.security.tokens.userPassword(username, password);
        this.authenticateToken(mytoken).then((token) => {
          done(null, token);
          return token;
        }).catch((error) => {
          done(error, null);
          throw error;
        });
      });
    }
  }

  return basicFactory;
});