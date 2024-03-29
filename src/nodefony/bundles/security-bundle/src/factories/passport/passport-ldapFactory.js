/*
 *	PASSPORT ldapauth  FACTORY
 */
try {
  var LdapStrategy = require("passport-ldapauth");
} catch (e) {
  this.log(e, "ERROR");
}

module.exports = nodefony.registerFactory("passport-ldap", () => {
  class ldapFactory extends nodefony.passeportFactory {
    constructor (security, settings) {
      super("ldapauth", security, settings);
      this.profileWrapper = this.settings.profile_wrapper;
    }

    getStrategy (options) {
      return new Promise((resolve, reject) => {
        try {
          const strategy = new LdapStrategy(options, (profile, done) => {
            this.log(`TRY AUTHENTICATION ${this.name} : ${profile.uid}`, "DEBUG");
            if (profile) {
              const mytoken = new nodefony.security.tokens.ldap(profile, this.profileWrapper);
              // mytoken.setProvider(this.settings.server.url);
              this.authenticateToken(mytoken).then((token) => {
                done(null, token);
                return token;
              })
                .catch((error) => {
                  done(error, null);
                  throw error;
                });
            } else {
              const error = new Error("Profile Ldap error");
              done(error, null);
              throw error;
            }
          });
          return resolve(strategy);
        } catch (e) {
          return reject(e);
        }
      });
    }

    createToken (context = null /* , providerName = null*/) {
      if (context.metaSecurity) {
        if (context.metaSecurity.token && context.metaSecurity.token.profile) {
          return new nodefony.security.tokens.ldap(context.metaSecurity.token.profile, this.profileWrapper);
        }
      }
      return new nodefony.security.tokens.ldap(null, this.profileWrapper);
    }
  }
  return ldapFactory;
});
