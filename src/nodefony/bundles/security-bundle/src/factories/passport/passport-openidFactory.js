/*
 *	PASSPORT OPENID  FACTORY
 */
const oauth2Strategy = require('passport-oauth2');

const openidStrategy = class openidStrategy extends oauth2Strategy {
  constructor(options, verify) {
    super(options, verify);
    this.name = "openid";
    this._userProfileURL = options.userInfoURL;
  }

  userProfile(accessToken, done) {
    this._oauth2.get(this._userProfileURL, accessToken, (err, body /*, res*/ ) => {
      let json = null;
      if (err) {
        try {
          json = JSON.parse(err.data);
        } catch (_) {}
        if (json && json.error && json.error.message) {
          return done(new Error(json.error.message));
        }
        return new Error(err);
      }
      try {
        json = JSON.parse(body);
      } catch (ex) {
        return done(new Error('Failed to parse user profile'));
      }
      return done(null, json);
    });
  }

  authorizationParams(options) {
    //console.log("PASSSSS", options);
    //let params = {};
    return options;
  }

};



module.exports = nodefony.registerFactory("passport-openid", () => {

  const Factory = class openidFactory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("openid", security, settings);

    }

    getStrategy(options) {
      return new openidStrategy(options, (accessToken, refreshToken, params, profile, done) => {
        this.logger("TRY AUTHENTICATION " + this.name, "INFO");
        let mytoken = null;
        try {
          mytoken = new nodefony.security.tokens.openid(profile, params, accessToken, refreshToken);
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
    }

    authenticate(context) {
      let url = context.url.replace(context.request.url.search, "");
      if (url !== this.settings.callbackURL) {
        return new Promise((resolve, reject) => {
          try {
            this.passport.authenticate(this.name, {
              scope: this.settings.scope,
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
          return new nodefony.security.tokens.openid(
            context.metaSecurity.token.profile,
            context.metaSecurity.token.params,
            context.metaSecurity.token.accessToken,
            context.metaSecurity.token.refreshToken
          );
        }
      }
      return new nodefony.security.tokens.openid();
    }



  };
  return Factory;
});