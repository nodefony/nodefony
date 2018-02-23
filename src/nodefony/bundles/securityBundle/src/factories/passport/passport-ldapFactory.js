/*
 *	PASSPORT ldapauth  FACTORY
 */
try {
  var LdapStrategy = require('passport-ldapauth');
} catch (e) {
  this.logger(e);
}

module.exports = nodefony.registerFactory("passport-ldap", () => {

  const Factory = class Factory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("ldapauth", security, settings);
      this.profileWrapper = this.settings.profile_wrapper;
    }

    getStrategy(options) {
      return new LdapStrategy(options, (profile, done) => {
        this.logger("TRY AUTHENTICATION " + this.name + " : " + profile.uid, "DEBUG");
        if (profile) {
          this.logger("PROFILE AUTHENTICATION " + this.name + " : " + profile.displayName, "DEBUG");
          let mytoken = this.createToken(profile, this.profileWrapper);
          this.authenticateToken(mytoken, this.provider).then((token) => {
            done(null, token);
            return token;
          }).catch((error) => {
            done(error, null);
            throw error;
          });
        } else {
          return done(new Error("Profile Ldap error"), null);
        }
      });
    }

    createToken(profile, wrapper) {
      return new nodefony.security.tokens.ldap(profile, wrapper);
    }

  };
  return Factory;
});