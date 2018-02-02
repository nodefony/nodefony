/*
 *
 * Anonymous  FACTORY
 *
 */
module.exports = nodefony.registerFactory("anonymous", () => {

  const Factory = class anonymousFactory extends nodefony.Factory {

    constructor(security, settings) {
      super("anonymous", security, settings);
    }

    createToken( /*context = null, provider= null*/ ) {
      try {
        return new nodefony.security.tokens.anonymous();
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

    authenticateToken(token, provider) {
      return new Promise((resolve, reject) => {
        if (provider) {
          try {
            return provider.loadUserByUsername(this.name).then((user) => {
              if (user) {
                let mytoken = new nodefony.security.tokens.anonymous("", user.username);
                mytoken.setUser(user);
                mytoken.setAuthenticated(true);
                this.logger("AUTHENTICATION " + mytoken.getUsername() + " SUCCESSFULLY ", "INFO");
                return resolve(mytoken);
              }
              return reject(new Error("user not found"));
            }).catch((error) => {
              return reject(error);
            });
          } catch (e) {
            return reject(e);
          }
        } else {
          try {
            let user = new nodefony.User("anonymous", null, ["ROLE_ANONYMOUS"]);
            token.setUser(user);
            token.setAuthenticated(true);
            this.logger("AUTHENTICATION " + token.getUsername() + " SUCCESSFULLY : ", "INFO");
          } catch (e) {
            return reject(e);
          }
          return resolve(token);
        }
      });
    }
  };
  return Factory;
});