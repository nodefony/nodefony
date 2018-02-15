let passport = null;
let nodefonyPassport = null;
try {
  passport = require('passport');
  nodefonyPassport = require("passport-nodefony");
} catch (e) {
  this.logger(e);
}
//console.log(passport);

module.exports = nodefony.register('passeportFactory', () => {

  const Factory = class passeportFactory extends nodefony.Factory {

    constructor(name, security, settings) {
      super(name, security, settings);
      this.passport = passport;
      this.passport.framework(nodefonyPassport(this));
      this.strategy = this.getStrategy(this.settings);
      this.passport.use(this.strategy);
    }

    authenticate(context) {
      return new Promise((resolve, reject) => {
        try {
          this.passport.authenticate(this.name, {
            session: false,
          })(context, (error, token) => {
            if (error) {
              return reject(error);
            }
            if (token) {
              token.setAuthenticated(true);
              token.setFactory(this.name);
              token.setProvider(this.providerName);
              this.logger(`AUTHENTICATION  ${token.getUsername()}  SUCCESSFULLY `, "INFO");
              return resolve(token);
            }
            return resolve(null);
          });
        } catch (error) {
          return reject(error);
        }
      });
    }

    createToken(username, password) {
      return new nodefony.security.tokens.userPassword(username, password);
    }

  };

  return Factory;
});