module.exports = nodefony.register('passeportFactory', () => {

  class passeportFactory extends nodefony.Factory {

    constructor(name, security, settings) {
      super(name, security, settings);
      this.passport = security.firewall.passport;
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
              /*if (error instanceof Error) {
                return reject(error);
              }
              let err = null;
              if (error.message && error.status) {
                err = new Error(error.message);
                err.code = error.status;
                return reject(err);
              }
              if (error.error) {
                err = new Error(error.error);
                err.code = error.status ||  401;
                return reject(err);
              }
              err = new Error(error);
              return reject(err);*/
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