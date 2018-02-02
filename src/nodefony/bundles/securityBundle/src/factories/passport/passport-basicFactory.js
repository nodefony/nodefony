/*
 *	PASSPORT BASIC  FACTORY
 */
try {
  var BasicStrategy = require('passport-http').BasicStrategy;
} catch (e) {
  this.logger(e);
}

module.exports = nodefony.registerFactory("passport-basic", () => {

  const Factory = class passportBasicFactory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("basic", security, settings);
    }

    getStrategy(options) {
      return new BasicStrategy(options, (username, password, done) => {
        this.logger("TRY AUTHORISATION " + this.name + " : " + username, "DEBUG");
        // get passwd
        this.security.provider.getUserPassword(username, (error, passwd) => {
          if (error) {
            done(error, null);
            return error;
          }
          if (passwd !== password) {
            done(null, false);
            return false;
          }
          this.security.provider.loadUserByUsername(username, (error, result) => {
            if (error) {
              done(error, null);
              return error;
            }
            if (!result) {
              done(null, false);
              return false;
            }
            done(null, result);
            return result;
          });
        });
      });
    }

    getPosition() {
      return "http";
    }

    generatePasswd( /*realm, user, passwd*/ ) {

    }
  };

  return Factory;
});