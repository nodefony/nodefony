/*
 *	PASSPORT LOCAL  FACTORY
 */
const GitHubStrategy = require('passport-github2').Strategy;

module.exports = nodefony.registerFactory("passport-github2", () => {

  class githubFactory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("github", security, settings);
      this.scopes = settings.scopes || ['user:email'];
      this.provider = null;
    }

    getStrategy(options) {
      return new Promise((resolve, reject) => {
        try {
          let strategy = new GitHubStrategy(options, (accessToken, refreshToken, profile, cb) => {
            this.logger("TRY AUTHENTICATION " + this.name, "DEBUG");
            let mytoken = new nodefony.security.tokens.github(profile, accessToken, refreshToken);
            return this.authenticateToken(mytoken).then((token) => {
              cb(null, token);
              return token;
            }).catch((error) => {
              cb(error, null);
              throw error;
            });
          });
          return resolve(strategy);
        } catch (e) {
          return reject(e);
        }
      });
    }

    createToken(context = null /*, providerName = null*/ ) {
      if (context.metaSecurity) {
        if (context.metaSecurity.token) {
          return new nodefony.security.tokens.github(
            context.metaSecurity.token.profile,
            context.metaSecurity.token.accessToken,
            context.metaSecurity.token.refreshToken);
        }
      }
      return new nodefony.security.tokens.github();
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

  }
  return githubFactory;
});