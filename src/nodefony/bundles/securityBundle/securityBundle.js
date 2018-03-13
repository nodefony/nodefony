module.exports = class securityBundle extends nodefony.Bundle {
  constructor(name, kernel, container) {
    super(name, kernel, container);
    // load bundle library
    this.autoLoader.loadDirectory(path.resolve(this.path, "src"));
    /*nodefony.register.call(nodefony.security.passport, () => {
      return {
        local: require('passport-local').Strategy,
        oauth2: require('passport-oauth2').Strategy,
        digest: require('passport-http').DigestStrategy,
        basic: require('passport-http').BasicStrategy,
        "google-oauth20": require('passport-google-oauth20').Strategy,
        github2: require('passport-github2').Strategy,
        ldapauth: require('passport-ldapauth'),
        jwt: require('passport-jwt').Strategy
      };
    });*/

  }
};