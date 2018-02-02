try {
  var GitHubStrategy = require('passport-github2').Strategy;
} catch (e) {
  this.logger(e);
}

module.exports = nodefony.registerFactory("passport-github2", () => {

  const Factory = class Factory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("github", security, settings);
      this.kernel.listen(this, "onReady", () => {
        this.orm = this.security.container.get("sequelize");
        this.User = this.orm.getEntity("user");
        this.connection = this.orm.getConnection("nodefony");
      });
      this.scopes = settings.scopes || ['user:email'];
    }

    getStrategy(options) {
      return new GitHubStrategy(options, (accessToken, refreshToken, profile, cb) => {
        let obj = null;
        if (profile) {
          this.logger("PROFILE AUTHORISATION " + this.name + " : " + profile.displayName, "DEBUG");
          obj = {
            username: profile._json.login,
            name: profile.username || "",
            surname: profile._json.name || "",
            email: profile.emails ? profile.emails[0].value : "",
            password: this.generatePassWd(),
            provider: profile.provider,
            roles: "USER",
            displayName: profile.displayName,
            url: profile._json.url || "",
            image: profile._json.avatar_url || ""
          };
        }

        if (obj) {
          this.User.findOrCreate({
            where: {
              username: obj.username
            },
            defaults: obj
          }).then(function (user) {
            if (nodefony.typeOf(user) === "array") {
              cb(null, user[0]);
            } else {
              cb(null, user);
            }
          }).catch(function (e) {
            cb(e, null);
          });
          return;
        }
        cb(new Error("Profile Github error"), null);
      });
    }

    generatePassWd() {
      let buf = crypto.randomBytes(256);
      let hash = crypto.createHash('md5');
      return hash.update(buf).digest("hex");
    }

    getPosition() {
      return "http";
    }

    handle(context, callback) {
      return new Promise((resolve, reject) => {
        let route = context.resolver.getRoute();
        if (route.name === "githubArea") {
          return this.passport.authenticate(this.name, {
            scope: this.scopes
          })(context);
        }
        if (route.name === "githubCallBackArea") {
          return this.passport.authenticate(this.name, {
            session: false,
          })(context, (error, res) => {
            if (error) {
              if (callback) {
                callback(error, null);
              }
              return reject(error);
            }
            let token = {
              name: this.name,
              user: res
            };
            if (callback) {
              callback(null, token);
            }
            return resolve(token);
          });
        }
        let error = new Error(`PASSPORT ${this.name} BAD ROUTE`);
        error.code = 401;
        if (callback) {
          callback(error, null);
        }
        return reject(error);
      });
    }
  };

  return Factory;
});