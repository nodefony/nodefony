/*
 *
 * Anonymous  FACTORY
 *
 */
module.exports = nodefony.registerFactory("anonymous", () => {
  class anonymousFactory extends nodefony.Factory {
    constructor (security, settings) {
      super("anonymous", security, settings);
    }

    createToken (/* context = null, providerName= null*/) {
      try {
        return new nodefony.security.tokens.anonymous(this.settings.secret || "nodefony", this.name, ["ROLE_ANONYMOUS"]);
      } catch (e) {
        throw e;
      }
    }

    supportsToken (token) {
      if (token && token instanceof nodefony.security.tokens.anonymous) {
        return true;
      }
      if (token && token.name) {
        throw new Error(`Token Unauthorized !! ${token.name}`);
      }
      throw new Error(`Factory ${this.name} Token not valid !! `);
    }
  }

  return anonymousFactory;
});
