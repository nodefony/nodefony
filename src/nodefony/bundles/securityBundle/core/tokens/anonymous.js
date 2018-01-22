/*
 *	Token Anonymous
 */

nodefony.register.call(nodefony.security.tokens, "Anonymous", function () {

  const settingsAnonymous = {
    realm: "user@",
  };

  const Anonymous = class Anonymous extends nodefony.Token {

    constructor(request, response, options) {
      super("Anonymous", request, response, nodefony.extend({}, settingsAnonymous, options));
    }

    generateToken() {
      return this.settings.realm + this.name;
    }

    checkToken(getUserPassword, callback) {
      if (callback) {
        callback(null, true);
      }
      return true;
    }

    generatePasswd( /*realm, username, passwd*/ ) {
      return this.settings.realm + this.name;
    }
  };
  return Anonymous;
});