/*
 *	PASSPORT DIGEST  FACTORY
 */
try {
  var DigestStrategy = require('passport-http').DigestStrategy;
} catch (e) {
  this.logger(e);
}


module.exports = nodefony.registerFactory("passport-digest", () => {

  const Factory = class passportDigestFactory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("digest", security, settings);
    }

    getStrategy(options) {

      return new DigestStrategy(options, (username, done) => {
        this.logger("TRY AUTHORISATION " + this.name + " : " + username, "DEBUG");
        // get passwd
        this.security.provider.getUserPassword(username, (error, passwd) => {
          if (error) {
            return done(error, null);
          }
          this.security.provider.loadUserByUsername(username, (error, result) => {
            if (error) {
              return done(error, null);
            }
            return done(null, result, passwd);

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