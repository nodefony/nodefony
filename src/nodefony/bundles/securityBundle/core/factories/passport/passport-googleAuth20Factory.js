try {
  var GoogleStrategy = require('passport-google-oauth20').Strategy;
} catch (e) {
  this.logger(e);
}

module.exports = nodefony.registerFactory("passport-google-oauth20", () => {

  const Factory = class Factory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("google", security, settings);
      this.kernel.listen(this, "onReady", function () {
        this.orm = this.get("sequelize");
        this.User = this.orm.getEntity("user");
        this.connection = this.orm.getConnection("nodefony");
      });
      this.scopes = settings.scopes || ['profile'];
    }

    getStrategy(options) {
      return new GoogleStrategy(options, (accessToken, refreshToken, profile, cb) => {
        let obj = null;
        if (profile) {
          this.logger("PROFILE AUTHORISATION " + this.name + " : " + profile.displayName, "DEBUG");
          obj = {
            username: profile.displayName,
            name: profile.name.familyName || "",
            surname: profile.name.givenName || "",
            email: profile.emails ? profile.emails[0].value : "",
            password: this.generatePassWd(),
            provider: profile.provider,
            lang: profile._json.language,
            roles: "USER",
            gender: profile.gender || "",
            displayName: profile.displayName,
            url: profile._json.url || "",
            image: profile._json.image.url || ""
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
        cb(new Error("Profile Google error"), null);
      });
    }

    generatePassWd() {
      //var date = new Date().getTime();
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
        if (route.name === "googleArea") {
          return this.passport.authenticate(this.name, {
            scope: this.scopes
          })(context);
        }
        if (route.name === "googleCallBackArea") {
          return this.passport.authenticate(this.name, {
            session: false,
          })(context, (error, res) => {
            if (error) {
              if (callback) {
                callback(error, null);
              }
              return reject(error);
            }
            if (res) {
              context.user = res;
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