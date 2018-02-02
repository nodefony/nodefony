/*
 *	PASSPORT LOCAL  FACTORY
 */
const LocalStrategy = require('passport-local').Strategy;

module.exports = nodefony.registerFactory("passport-local", () => {

  const Factory = class Factory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("local", security, settings);
    }

    getStrategy(options) {
      return new LocalStrategy(options, (username, password, done) => {
        this.logger("TRY AUTHORISATION " + this.name + " : " + username, "DEBUG");
        // get passwd
        return this.security.provider.getUserPassword(username, (error, passwd) => {
          if (error) {
            return done(error, false, {
              message: 'Incorrect username.'
            });
          }
          if (passwd !== password) {
            return done(null, false, {
              message: 'Incorrect password.'
            });
          }
          this.security.provider.loadUserByUsername(username, (error, result) => {
            if (error) {
              return done(error, null);
            }
            return done(null, result);
          });
        });
      });
    }

    getPosition() {
      return "http";
    }

    generatePasswd( /*realm, user, passwd*/ ) {}
  };
  return Factory;
});