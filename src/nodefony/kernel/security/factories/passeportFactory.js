//console.log(passport);

module.exports = nodefony.register('passeportFactory', () => {

  const Factory = class passeportFactory extends nodefony.Factory {

    constructor(name, security, settings) {
      super(name, security, settings);
      this.passport = security.firewall.passport;
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
              if (error.status) {
                let err = new Error(error.message);
                err.code = error.status;
                return reject(err);
              }
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