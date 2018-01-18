try {
  var oauth2Strategy = require('passport-oauth2').Strategy;
} catch (e) {
  this.logger(e);
}

module.exports = nodefony.registerFactory("passport-oauth2", () => {

  const Factory = class passportOauth2Factory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("oauth2", security, settings);
      this.kernel.listen(this, "onReady", function () {
        this.orm = this.get("sequelize");
        this.User = this.orm.getEntity("user");
        this.connection = this.orm.getConnection("nodefony");
      });
      this.scopes = settings.scopes || ['profile'];
    }

    getPosition() {
      return "http";
    }

    getStrategy(options) {
      return new oauth2Strategy(options, (accessToken, refreshToken, profile, cb) => {
        let obj = null;
        if (profile) {
          this.logger("PROFILE AUTHORISATION " + this.name + " : " + profile.displayName, "DEBUG");
          obj = {
            username: profile.displayName,
            name: profile.name.familyName || "",
            surname: profile.name.givenName || "",
            email: profile.emails ? profile.emails[0].value : "",
            password: profile.token,
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
        cb(new Error("Profile Oauth2 error"), null);
      });
    }

    handle(context, callback) {
      let route = context.resolver.getRoute();
      if (route.name === "oauth2Area") {
        return this.passport.authenticate(this.name, {
          scope: this.scopes
        })(context);
      }
      if (route.name === "oauth2CallBackArea") {
        return this.passport.authenticate(this.name, {
          session: false
        })(context, (error, res) => {
          if (error) {
            return callback(error, null);
          }
          if (res) {
            context.user = res;
            //this.logger("AUTHORISATION "+this.getKey()+" SUCCESSFULLY : " + res.username ,"INFO");
          }
          let token = {
            name: this.name,
            user: res
          };
          return callback(error, token);
        });
      }
      return callback({
        status: 401,
        message: "PASSPORT oauth2 BAD ROUTE "
      }, null);
    }
  };

  return Factory;
});