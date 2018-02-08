let passport = null;
let nodefonyPassport = null;
try {
  passport = require('passport');
  nodefonyPassport = require("passport-nodefony");
} catch (e) {
  this.logger(e);
}
//console.log(passport);

module.exports = nodefony.registerFactory('passport', () => {

  const Factory = class passeportFactory extends nodefony.Factory {

    constructor(name, security, settings) {
      super(name, security, settings);
      this.passport = passport;
      this.passport.framework(nodefonyPassport(this));
      this.strategy = this.getStrategy(this.settings);
      if (!this.hasStrategy(this.strategy)) {
        this.passport.use(this.strategy);
      }
    }

    hasStrategy(strategy) {

    }

    getStrategy(options) {

    }

    createToken(context = null, provider = null) {
      try {
        return new nodefony.security.tokens[this.strategy.name](this.strategy, provider);
      } catch (e) {
        throw e;
      }
    }

    authenticateToken(context, token) {
      return new Promise((resolve, reject) => {
        try {
          this.passport.authenticate(token.name, {
            session: false,
          })(context, (error, user) => {
            if (error) {
              return reject(error);
            }
            if (user) {
              this.logger("AUTHORISATION " + this.name + " SUCCESSFULLY : " + user.username, "INFO");
              token.setUser(user);
              return resolve(token);
            }
            return resolve(null);
          });
        } catch (error) {
          return reject(error);
        }
      });
    }
  };




  return Factory;
});