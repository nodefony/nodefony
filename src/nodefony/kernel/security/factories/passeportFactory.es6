module.exports = nodefony.register('passeportFactory', () => {

  class passeportFactory extends nodefony.Factory {

    constructor(name, security, settings) {
      super(name, security, settings);
      this.passport = security.firewall.passport;
      if (this.name in this.passport._strategies) {
        this.logger(`Passport Strategy ${this.name} Already Defined in firewall !!!
        ${clc.green( "Only one Factory with passport strategy type must be use in firewall config")}
        Secure Area  : ${clc.blue(security.name)}
        Factory  : ${clc.blue(this.name)}
        Settings : ${clc.blue(util.inspect(this.settings))}
        `, "WARNING");
      }
      this.strategy = this.getStrategy(this.settings);
      this.passport.use(this.strategy);
    }

    getStrategy( /*options*/ ) {
      throw new Error("Passport Factory must redefine getStrategy method");
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
              this.logger(`AUTHENTICATION ${token.getUsername()} SUCCESSFULLY`, "INFO");
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