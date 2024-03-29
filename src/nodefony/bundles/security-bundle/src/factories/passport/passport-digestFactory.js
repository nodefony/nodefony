/*
 *	PASSPORT DIGEST  FACTORY
 */
const {DigestStrategy} = require("passport-http");

module.exports = nodefony.registerFactory("passport-digest", () => {
  class digestFactory extends nodefony.passeportFactory {
    constructor (security, settings) {
      super("digest", security, settings);
    }

    getStrategy (options) {
      return new Promise((resolve, reject) => {
        try {
          const strategy = new DigestStrategy(options, (username, done) => {
            this.log(`TRY AUTHENTICATION ${this.name} : ${username}`, "DEBUG");
            const mytoken = new nodefony.security.tokens.userPassword(username);
            this.authenticateToken(mytoken)
              .then((token) => {
                done(null, token, token.getCredentials());
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
  return digestFactory;
});
