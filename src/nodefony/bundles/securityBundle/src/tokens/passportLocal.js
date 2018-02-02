/*
 *	Token passport-local
 */
const LocalStrategy = require('passport-local').Strategy;

nodefony.registerToken("passportLocal", function () {

  const passportLocal = class passportLocal extends nodefony.Token {

    constructor(passport, strategy, provider) {
      super("local", roles);

      this.provider = provider;
      this.passport = passport;
      this.strategy = this.getStrategy(strategy);

      if (user) {
        this.setUser(new nodefony.User(user, null, roles));
      }
      if (roles && roles.length) {
        this.setAuthenticated(true);
      }
    }

    getStrategy(options) {
      /*return new LocalStrategy(options, (username, password, done) => {
        this.logger("TRY AUTHORISATION " + this.name + " : " + username, "DEBUG");
        // get passwd
        return this.provider.getUserPassword(username, (error, passwd) => {
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
          return this.security.provider.loadUserByUsername(username, (error, result) => {
            if (error) {
              return done(error, null);
            }
            return done(null, result);
          });
        });
      });*/
    }

  };
  return passportLocal;
});