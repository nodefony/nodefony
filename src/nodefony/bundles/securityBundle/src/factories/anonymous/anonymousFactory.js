/*
 *
 * Anonymous  FACTORY
 *
 */
module.exports = nodefony.registerFactory("anonymous", () => {

  const Factory = class anonymousFactory extends nodefony.Factory {

    constructor(security, settings) {
      super("anonymous", security, settings);
      this.createToken();
    }

    createToken( /*context = null, provider= null*/ ) {
      try {
        return new nodefony.security.tokens.anonymous('nodefony', this.name, ["ROLE_ANONYMOUS"]);
      } catch (e) {
        throw e;
      }
    }

    supportsToken(token) {
      if (token && token instanceof nodefony.security.tokens.anonymous) {
        return true;
      }
      if (token && token.name) {
        throw new Error("Token Unauthorized !! " + token.name);
      }
      throw new Error("Factory " + this.name + " Token not valid !! ");
    }

  };

  return Factory;
});