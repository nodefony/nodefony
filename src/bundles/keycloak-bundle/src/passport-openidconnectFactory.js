/*
 *  ASSPORT oauth2  FACTORY
 */
const Strategy = require("passport-openidconnect");

const defaultCookiesSettings = {
  path: "/",
  secure: true,
  maxAge: 300
};

class SessionStorage {
  constructor (factory) {
    this.factory = factory;
  }

  async store (req, ctx, appState, meta, cb) {
    // console.log(req, ctx, appState, meta)
    // console.log("STORE", ctx, appState, meta);
    const handle = nodefony.generateId();
    if (!req.session) {
      return cb(new Error("OpenID Connect requires session support. Did you forget to use `nodefony-session` middleware?"));
    }
    // console.log("store");

    const state = {handle};
    if (ctx.maxAge) {
      state.maxAge = ctx.maxAge;
    }
    if (ctx.nonce) {
      state.nonce = ctx.nonce;
    }
    if (ctx.issued) {
      state.issued = ctx.issued;
    }
    if (appState) {
      state.state = appState;
    }

    const cookiesSettings = nodefony.extend({}, req.session.settings.cookie, this.factory.cookieSettings);
    await req.session.invalidate(cookiesSettings.maxAge, null, cookiesSettings);
    req.session.set("state", state);
    // console.log(req.session.cookieSession);
    return cb(null, handle);
  }

  verify (req, handle, cb) {
    if (!req.session) {
      return cb(new Error("OpenID Connect requires session support. Did you forget to use `nodefony-session` middleware?"));
    }
    // console.log("verify");
    const state = req.session.get("state");
    if (!state) {
      return cb(null, false, {message: "Unable to verify authorization request state."});
    }
    req.session.remove("state");
    // delete req.session[key].state;
    // if (Object.keys(req.session[key]).length === 0) {
    // delete req.session[key];
    // }
    if (state.handle !== handle) {
      return cb(null, false, {message: "Invalid authorization request state."});
    }
    const ctx = {
      maxAge: state.maxAge,
      nonce: state.nonce,
      issued: state.issued
    };
    if (typeof ctx.issued === "string") {
      // convert issued to a Date object
      ctx.issued = new Date(ctx.issued);
    }
    return cb(null, ctx, state);
  }
}

// eslint-disable-next-line max-lines-per-function
module.exports = nodefony.registerFactory("passport-openidconnect", () => {
  const Factory = class OpenidConnectFactory extends nodefony.passeportFactory {
    constructor (security, settings) {
      super("openidconnect", security, settings);
      this.userModel = this.kernel.getORM().getEntity("user");
      this.callbackLogoutURL = this.settings.callbackLogoutURL;
      this.cookieSettings = nodefony.extend({}, defaultCookiesSettings, this.settings.cookieSettings);
    }

    async instStrategy (options) {
      this.storage = new SessionStorage(this);
      options.store = this.storage;
      if (options.credentials) {
        const res = await options.credentials(this);
        if (res && res.clientID) {
          options.clientID = res.clientID;
        }
        if (res && res.clientSecret) {
          options.clientSecret = res.clientSecret;
        }
      }
      // eslint-disable-next-line max-params
      const strategy = new Strategy(options, async (issuer, profile, idProfile, context, idToken, accessToken, refreshToken, params, cb) => {
        this.log(`TRY AUTHENTICATION ${this.name}`, "INFO");

        console.log(
          "getStrategy callback ",
          // context,
          // idProfile,
          "\n",
          params,
          "\n",
          profile,
          "\n",
          // issuer,
          "\n",
          // refreshToken,
          "\n",
          // accessToken,
          "\n"
          // idToken
        );

        const password = profile.id.replace(/-/gu, "");
        const familyName = profile.name && profile.name.familyName ? profile.name.familyName.replace(/\s+/ug, "-") : "";
        const givenName = profile.name && profile.name.givenName ? profile.name.givenName.replace(/\s+/ug, "-") : "";
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const roles = profile._json && profile._json.groups ? profile._json.groups : [];
        const lang = profile._json && profile._json.locale ? profile._json.locale : null;
        const defaults = {
          username: profile.username,
          name: givenName,
          surname: familyName,
          email,
          password,
          roles,
          lang
        };

        /* let user = await this.userModel.findOne({
          where: {
            username: profile.username
          }
        })
          .catch((e) => cb(e, null));
        if (!user) {
          console.log(defaults);
          user = await await this.userModel.create(defaults)
            .catch((e) => cb(e, null));
        }*/

        const user = await this.userModel.findOrCreate({
          where: {
            username: profile.username
          },
          defaults
        })
          .catch((e) => cb(e, null));
        if (!user) {
          return cb(new nodefony.Error("User not found", 404), null);
        }
        let mytoken = null;
        try {
          // eslint-disable-next-line new-cap
          mytoken = new nodefony.security.tokens.openidconnect(profile, params, accessToken, refreshToken);
          // console.log(mytoken);
        } catch (e) {
          return cb(e);
        }
        return this.authenticateToken(mytoken)
          .then((token) => cb(null, token))
          .catch((error) => cb(error, null));
      });
      return strategy;
    }

    getStrategy (/* options*/) {
      return new Promise(async (resolve, reject) => {
        if (this.settings.issuer) {
          this.uriDiscovry = ".well-known/openid-configuration";
          this.urlDiscovry = url.parse(`${this.settings.issuer}/${this.uriDiscovry}`);
          this.loadDiscovry = true;
        } else {
          this.urlDiscovry = null;
          this.loadDiscovry = false;
        }
        if (this.loadDiscovry === true && this.security.kernel.type !== "CONSOLE") {
          this.kernel.on("onReady", () => this.discoverOpenIdConnect(this.urlDiscovry, {
            json: true,
            timeout: 10000
          })
            .then(async (discovery) => {
              // console.log(discovery);
              this.setDiscovery(discovery);
              const strategy = await this.instStrategy(this.settings);
              resolve(strategy);
              return strategy;
            })
            .catch((e) => {
              reject(e);
              throw e;
            }));
        } else {
          try {
            const strategy = await this.instStrategy(this.settings);
            resolve(strategy);
          } catch (e) {
            reject(e);
          }
        }
      });
    }

    authenticate (context) {
      return new Promise((resolve, reject) => {
        try {
          this.passport.authenticate(this.name, {
            session: false
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
          reject(error);
        }
      });
    }

    fetch (url, options = {}) {
      const {fetch} = this.get("fetch");
      const settings = nodefony.extend({
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }

        /* agent: new Agent({
          rejectUnauthorized:  this.rejectUnauthorized,
        })*/
      }, options);
      return fetch(url, settings);
    }

    discoverOpenIdConnect (Url, options) {
      if (Url) {
        if (typeof Url === "string") {
          this.urlDiscovry = url.parse(Url);
        } else {
          this.urlDiscovry = Url;
        }
      }
      this.log(`openID DISCOVERY url : ${this.urlDiscovry.href}`, "INFO");
      return this.fetch(this.urlDiscovry.href, options)
        .then(async (response) => await response.json())
        .catch((e) => {
          this.log(e, "ERROR");
          throw e;
        });
    }

    setDiscovery (json) {
      if (json) {
        this.discovery = json;
        for (const ele in json) {
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
          default:
          }
        }
      }
    }

    parseProfile (json) {
      const profile = {};
      profile.id = json.sub;
      // Prior to OpenID Connect Basic Client Profile 1.0 - draft 22, the "sub"
      // claim was named "user_id".  Many providers still use the old name, so
      // fallback to that.
      if (!profile.id) {
        profile.id = json.user_id;
      }
      if (json.name) {
        profile.displayName = json.name;
      }
      if (json.preferred_username) {
        profile.username = json.preferred_username;
      }
      if (json.family_name || json.given_name || json.middle_name) {
        profile.name = {};
        if (json.family_name) {
          profile.name.familyName = json.family_name;
        }
        if (json.given_name) {
          profile.name.givenName = json.given_name;
        }
        if (json.middle_name) {
          profile.name.middleName = json.middle_name;
        }
      }
      if (json.email) {
        profile.emails = [{value: json.email}];
      }
      return profile;
    }

    refreshToken (context, token = null) {
      // const url = "http://localhost:8080/realms/nodefony/protocol/openid-connect/token";
      return new Promise(async (resolve, reject) => {
        try {
          if (!token) {
            token = context.getToken();
            if (!token) {
              throw new nodefony.Error("No token found", 401);
            }
            if (!token.factory) {
              throw new nodefony.Error("No token Factory  found", 401);
            }
            const factory = context.security.getFactory(token.factory);
            if (!factory) {
              throw new nodefony.Error("No Factory  found", 401);
            }
          }
          const params = {};
          params.grant_type = "refresh_token";
          const code = token.refreshToken;
          // params.refresh_token = token.refreshToken;
          // params.client_id = this.settings.clientID;
          // params.client_secret = this.settings.clientSecret;
          // params.userId = token.profile.id;
          params.max_age = this.settings.maxAge;
          // console.log(params);
          this.strategy._oauth2.getOAuthAccessToken(code, params, (err, accessToken, refreshToken, myparam) => {
            // console.log("passsss", myparam);
            if (err) {
              reject(err);
              throw err;
            }
            this.strategy._oauth2.get(this.settings.userInfoURL, accessToken, async (myerr, body /* res*/) => {
              // console.log("passsss profile");
              if (myerr) {
                reject(myerr);
                throw myerr;
              }
              // eslint-disable-next-line init-declarations
              let json;
              try {
                json = JSON.parse(body);
              } catch (ex) {
                reject(new nodefony.Error("Failed to parse user profile"));
                return;
              }
              // console.log(json);
              const profile = this.parseProfile(json);
              profile._raw = body;
              profile._json = json;
              try {
                // eslint-disable-next-line new-cap
                const newtoken = new nodefony.security.tokens.openidconnect(profile, myparam, accessToken, refreshToken);
                await this.authenticateToken(newtoken)
                  .then((Token) => {
                    newtoken.setAuthenticated(true);
                    newtoken.setFactory(this.name);
                    return resolve(Token);
                  })
                  .catch((e) => reject(e));
                context.user = newtoken.user;
                context.token = newtoken;
                // console.log(context.token);
                if (context.session) {
                  context.session.setMetaBag("security", {
                    firewall: this.name,
                    token: newtoken ? newtoken.serialize() : null
                  });
                }
              } catch (e) {
                reject(e);
                throw e;
              }
              resolve(myparam);
            });
          });
        } catch (e) {
          reject(e);
        }
      });
    }

    async logout (context) {
      if (this.logoutUrl) {
        let query = "";
        if (this.callbackLogoutURL) {
          query = `?post_logout_redirect_uri=${this.callbackLogoutURL}&client_id=${this.strategy._oauth2._clientId}`;
        }
        const url = `${this.logoutUrl}${query}`;
        this.log(`logout url : ${url}`, "INFO");
        await super.logout(context);
        return context.redirect(url);
      }
      return super.logout(context)
        .catch((e) => {
          throw e;
        });
    }

    createToken (context = null /* , providerName = null*/) {
      if (context.metaSecurity) {
        if (context.metaSecurity.token) {
          // eslint-disable-next-line new-cap
          return new nodefony.security.tokens.openidconnect(
            context.metaSecurity.token.profile,
            context.metaSecurity.token.params,
            context.metaSecurity.token.accessToken,
            context.metaSecurity.token.refreshToken
          );
        }
      }
      // eslint-disable-next-line new-cap
      return new nodefony.security.tokens.openidconnect();
    }
  };
  return Factory;
});

