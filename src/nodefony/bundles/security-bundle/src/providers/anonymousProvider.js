module.exports = nodefony.registerProvider("anonymousProvider", () => {
  class anonymousProvider extends nodefony.Provider {
    constructor (security, config) {
      super("anonymous", security);
      this.config = config;
      this.secret = this.config.secret || "nodefony";
    }

    loadUserByUsername (username) {
      return new Promise((resolve, reject) => {
        try {
          return resolve(new nodefony.User(username, this.secret, ["ROLE_ANONYMOUS"]));
        } catch (e) {
          return reject(e);
        }
      });
    }

    supports (token) {
      if (token instanceof nodefony.security.tokens.anonymous) {
        if (this.secret !== token.getSecret()) {
          throw new Error("The Token does not contain the expected key.");
        }
        return true;
      }
      return false;
    }
  }
  return anonymousProvider;
});
