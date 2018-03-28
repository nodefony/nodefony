/*
 *	PASSPORT DIGEST  FACTORY
 */
const DigestStrategy = require('passport-http').DigestStrategy;

module.exports = nodefony.registerFactory("passport-digest", () => {

  const Factory = class Factory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("digest", security, settings);
    }

    getStrategy(options) {
      return new DigestStrategy(options, (username, done) => {
        this.logger("TRY AUTHORISATION " + this.name + " : " + username, "DEBUG");
        let mytoken = new nodefony.security.tokens.userPassword(username);
        this.authenticateToken(mytoken).then((token) => {
          done(null, token, token.getCredentials());
          return token;
        }).catch((error) => {
          done(error, null);
          throw error;
        });
      });
    }

  };
  return Factory;
});