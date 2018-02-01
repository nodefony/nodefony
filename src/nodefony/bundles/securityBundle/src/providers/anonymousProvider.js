module.exports = nodefony.registerProvider("anonymousProvider", () => {

  const anonymousProvider = class anonymousProvider extends nodefony.Provider {

    constructor(security, config) {
      super("anonymous", security);
      this.config = config;
      this.secret = this.config.secret || "nodefony";
    }

    loadUserByUsername(username) {
      return new Promise((resolve, reject) => {
        try {
          return resolve(new nodefony.User(username, null, ["ROLE_ANONYMOUS"]));
        } catch (e) {
          return reject(e);
        }
      });
    }

    refreshUser(user) {
      return user;
    }

    authenticate(token) {
      this.secret = token.secret;
      if (this.supports(token)) {
        throw new Error('The token is not supported by this authentication provider.');
      }
      if (this.secret !== token.getSecret()) {
        throw new Error('The Token does not contain the expected key.');
      }
      return token;
    }

    supports(token) {
      if (token instanceof nodefony.security.tokens.anonymous) {
        if (this.secret === token.getSecret()) {
          return true;
        }
        return false;
      }
      return false;
    }
  };

  return anonymousProvider;
});