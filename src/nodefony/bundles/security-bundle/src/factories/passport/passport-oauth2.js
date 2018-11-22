/*
 *	PASSPORT oauth2  FACTORY
 */
const Strategy = require('passport-oauth2');

module.exports = nodefony.registerFactory("passport-oauth2", () => {

  const Factory = class oauth2Factory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("oauth2", security, settings);
      if (this.security.kernel.environment === "dev") {
        require('https').globalAgent.options.rejectUnauthorized = false;
      }
    }

    getStrategy(options) {
      return new Promise((resolve, reject) => {
        try {
          let strategy = new Strategy(options, (accessToken, refreshToken, params, profile, done) => {
            this.logger("TRY AUTHENTICATION " + this.name, "INFO");
            let mytoken = null;
            try {
              mytoken = new nodefony.security.tokens.oauth2(profile, params, accessToken, refreshToken);
            } catch (e) {
              return done(e);
            }
            return this.authenticateToken(mytoken)
              .then((token) => {
                done(null, token);
                return token;
              }).catch((error) => {
                done(error, null);
                throw error;
              });
          });
          return resolve(strategy);
        } catch (e) {
          return reject(e);
        }
      });
    }

    authenticate(context) {
      let url = context.url.replace(context.request.url.search, "");
      if (url !== this.settings.callbackURL) {
        return new Promise((resolve, reject) => {
          try {
            this.passport.authenticate(this.name, {
              scope: this.settings.scopes,
              session: false
            })(context);
            return resolve(null);
          } catch (e) {
            return reject(e);
          }
        });
      }
      return super.authenticate(context);
    }

    createToken(context = null /*, providerName = null*/ ) {
      if (context.metaSecurity) {
        if (context.metaSecurity.token) {
          return new nodefony.security.tokens.oauth2(
            context.metaSecurity.token.profile,
            context.metaSecurity.token.params,
            context.metaSecurity.token.accessToken,
            context.metaSecurity.token.refreshToken
          );
        }
      }
      return new nodefony.security.tokens.oauth2();
    }

  };
  return Factory;
});