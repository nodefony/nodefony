let passport = null;
let nodefonyPassport = null;
try {
  passport = require('passport');
  nodefonyPassport = require("passport-nodefony");
} catch (e) {
  this.logger(e);
}

module.exports = nodefony.register('passeportFactory', () => {

  const Factory = class passeportFactory extends nodefony.Factory {

    constructor(name, security, settings) {
      super(name, security, settings);
      this.passport = passport;
      this.passport.framework(nodefonyPassport(this));
      this.strategy = this.getStrategy(this.settings);
      if (this.strategy) {
        this.passport.use(this.strategy);
      }
    }

    getStrategy() {
      throw new Error("You must define a strategy in method getStrategy !");
    }

    handle(context, callback) {
      return new Promise((resolve, reject) => {
        try {
          this.passport.authenticate(this.name, {
            session: false,
          })(context, (error, res) => {
            if (error) {
              if (callback) {
                callback(error, null);
              }
              return reject(error);
            }
            if (res) {
              context.user = res;
              this.logger("AUTHORISATION " + this.name + " SUCCESSFULLY : " + res.username, "INFO");
            }
            let token = {
              name: this.name,
              user: res
            };
            if (callback) {
              callback(null, token);
            }
            return resolve(token);
          });
        } catch (error) {
          if (callback) {
            callback(error, null);
          }
          return reject(error);
        }
      });
    }
  };
  return Factory;
});