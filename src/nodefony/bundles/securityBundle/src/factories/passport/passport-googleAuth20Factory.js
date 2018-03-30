/*
 *	PASSPORT LOCAL  FACTORY
 */
const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = nodefony.registerFactory("passport-google-oauth20", () => {

  class googleFactory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("google", security, settings);
      this.scopes = settings.scopes || ['profile'];
    }

    getStrategy(options) {
      return new GoogleStrategy(options, (accessToken, refreshToken, profile, cb) => {
        this.logger("TRY AUTHENTICATION " + this.name, "DEBUG");
        let mytoken = new nodefony.security.tokens.google(profile, accessToken, refreshToken);
        return this.authenticateToken(mytoken).then((token) => {
          cb(null, token);
          return token;
        }).catch((error) => {
          cb(error, null);
          throw error;
        });
      });
    }

    createToken(context = null /*, providerName = null*/ ) {
      if (context.metaSecurity) {
        if (context.metaSecurity.token) {
          return new nodefony.security.tokens.googleToken(context.metaSecurity.token.payload);
        }
      }
      return new nodefony.security.tokens.google();
    }

    authenticate(context) {
      if (context.url !== this.settings.callbackURL) {
        return new Promise((resolve, reject) => {
          return this.passport.authenticate(this.name, {
            scope: this.scopes
          })(context, (error /*, token*/ ) => {
            if (error) {
              return reject(error);
            }
            return resolve(null);
          });
        });
      }
      return super.authenticate(context);
    }

  }
  return googleFactory;
});