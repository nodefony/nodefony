module.exports = nodefony.register('passeportFactory', () => {

  class passeportFactory extends nodefony.Factory {

    constructor(name, security, settings) {
      super(name, security, settings);
      this.passport = security.firewall.passport;
      this.getStrategy(this.settings)
        .then((strategy) => {
          if (this.name in this.passport._strategies) {
            this.log(`Passport Strategy ${this.name} Already Defined in firewall !!!
            ${clc.green( "Only one Factory with passport strategy type must be use in firewall config")}
            Secure Area  : ${clc.blue(security.name)}
            Factory  : ${clc.blue(this.name)}
            Settings : ${clc.blue(util.inspect(this.settings))}
            `, "WARNING");
          }
          this.strategy = strategy;
          if (this.strategy) {
            this.passport.use(this.strategy);
          }
        }).catch((e) => {
          this.log(e, "ERROR");
          throw e;
        });
    }

    getStrategy( /*options*/ ) {
      return new Promise((resolve, reject) => {
        return reject(new Error("Passport Factory must redefine getStrategy method"));
      });
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
              this.log(`AUTHENTICATION ${token.getUsername()} SUCCESSFULLY`, "DEBUG");
              return resolve(token);
            }
            return resolve(null);
          });
        } catch (error) {
          return reject(error);
        }
      });
    }
  }
  return passeportFactory;
});