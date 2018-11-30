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
    return options;
  }
};

module.exports = nodefony.registerFactory("passport-openid", () => {

  const Factory = class openidFactory extends nodefony.passeportFactory {
    constructor(security, settings) {
      super("openid", security, settings);
      if (this.security.kernel.environment === "dev") {
        require('https').globalAgent.options.rejectUnauthorized = false;
      }
    }

    http(url, options) {
      this.request = this.get("requestClient");
      let settings = nodefony.extend({
        agentOptions: {
          rejectUnauthorized: (this.security.kernel.environment === "dev" ? false : true)
        }
      }, options);
      return this.request.http(url, settings, this.container);
    }

    discoverOpenIdConnect(Url, options) {
      if (Url) {
        if (typeof url === "string") {
          this.urlDiscovry = url.parse(Url);
        } else {
          this.urlDiscovry = Url;
        }
      }
      this.logger(`openID DISCOVERY url : ${this.urlDiscovry.href}`, "INFO");
      return this.http(this.urlDiscovry.href, options)
        .then((response) => {
          return response.json.body;
        }).catch((e) => {
          this.logger(e, "ERROR");
          throw e;
        });
    }

    setDiscovery(json) {
      if (json) {
        this.discovery = json;
        for (let ele in json) {
          switch (ele) {
            case "authorization_endpoint":
              this.settings.authorizationURL = json.authorization_endpoint;
              break;
            case "token_endpoint":
              this.settings.tokenURL = json.token_endpoint;
              break;
            case "userinfo_endpoint":
              this.settings.userInfoURL = json.userinfo_endpoint;
              break;
            case "end_session_endpoint":
              this.logoutUrl = json.end_session_endpoint;
              break;
          }
        }
      }
    }

    getStrategy(options) {
      if (this.settings.issuer) {
        this.uriDiscovry = ".well-known/openid-configuration";
        this.urlDiscovry = url.parse(`${options.issuer}/${this.uriDiscovry}`);
        this.loadDiscovry = true;
      } else {
        this.urlDiscovry = null;
        this.loadDiscovry = false;
      }
      if (this.loadDiscovry === true && this.security.kernel.type !== "CONSOLE") {
        return this.discoverOpenIdConnect(this.urlDiscovry, {
          json: true,
          timeout: 10000
        }).then((discovery) => {
          this.setDiscovery(discovery);
          return new Promise((resolve, reject) => {
            try {
              this.strategy = new openidStrategy(this.settings, (accessToken, refreshToken, params, profile, done) => {
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
              return resolve(this.strategy);
            } catch (e) {
              return reject(e);
            }
          });
        }).catch(e => {
          this.logger(e, "ERROR");
          throw e;
        });
      }
      return new Promise((resolve, reject) => {
        try {
          this.strategy = new openidStrategy(options, (accessToken, refreshToken, params, profile, done) => {
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
          return resolve(this.strategy);
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

    logout(context) {
      if (this.logoutUrl) {
        this.logger(`logout url : ${this.logoutUrl}`, "INFO");
        return new Promise((resolve, reject) => {
          if (this.strategy) {
            this.strategy._oauth2.get(this.logoutUrl, context.token.accessToken, (err /*, body , res*/ ) => {
              if (err) {
                let error = new nodefony.securityError(err.data, err.statusCode, this.security, context);
                return reject(error);
              }
              return super.logout(context)
                .catch(e => {
                  throw e;
                });
            });
          } else {
            return reject(new Error("No strategy"));
          }
        });
      }
      return super.logout(context)
        .catch(e => {
          throw e;
        });
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