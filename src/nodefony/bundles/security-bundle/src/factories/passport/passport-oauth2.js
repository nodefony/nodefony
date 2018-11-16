/*
 *	PASSPORT OPENID  FACTORY
 */
const Strategy = require('passport-oauth2');

module.exports = nodefony.registerFactory("passport-oauth2", () => {

  const Factory = class oauth2Factory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("oauth2", security, settings);
    }

    getStrategy(options) {
      return new Strategy(options, (accessToken, refreshToken, profile, done) => {
        this.logger("TRY AUTHENTICATION " + this.name, "DEBUG");
        //let mytoken = new nodefony.security.tokens.google(profile, accessToken, refreshToken);
        return this.authenticateToken(accessToken)
          .then((token) => {
            done(null, token);
            return token;
          }).catch((error) => {
            done(error, null);
            throw error;
          });
      });
    }

    authenticate(context) {
      let url = context.url.replace(context.request.url.search, "");
      if (url !== this.settings.callbackURL) {
        return new Promise((resolve, reject) => {
          try {
            this.passport.authenticate(this.name, {
              scope: this.scopes
            })(context);
            return resolve(null);
          } catch (e) {
            return reject(e);
          }
        });
      }
      return super.authenticate(context);
    }
  };
  return Factory;
});