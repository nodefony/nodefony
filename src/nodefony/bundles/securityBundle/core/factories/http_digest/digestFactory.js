/*
 *	HTTP DIGEST  FACTORY
 */
module.exports = nodefony.registerFactory("http_digest", () => {

  const Factory = class digestFactory extends nodefony.Factory {

    constructor(security, settings) {
      super("http_digest", security, settings);
      this.token = "Digest";
    }

    getPosition() {
      return "http";
    }

    handle(context, callback) {
      return new Promise((resolve, reject) => {
        let token = null;
        try {
          token = new nodefony.security.tokens[this.token](context.request, context.response, this.settings);
          this.logger("TRY AUTHORISATION " + token.name, "DEBUG");
          if (!token.authorization) {
            context.response.setHeader("WWW-Authenticate", token.generateResponse());
            let error = new Error("Unauthorized");
            error.code = 401;
            if (callback) {
              callback(error, null);
            }
            return reject(error);
          }
          token.checkResponse(this.security.provider.getUserPassword.bind(this.security.provider), (error, result) => {
            if (error) {
              context.response.setHeader("WWW-Authenticate", token.generateResponse());
              if (callback) {
                callback(error, null);
              }
              return reject(error);
            }
            if (result === true) {
              this.security.provider.loadUserByUsername(token.username, (error, result) => {
                if (error) {
                  context.response.setHeader("WWW-Authenticate", token.generateResponse());
                  if (callback) {
                    callback(error, null);
                  }
                  return reject(error);
                }
                console.log(result)
                context.user = result;
                if (callback) {
                  callback(null, token);
                }
                return resolve(token);
              });
            }
            return resolve(token);
          });
        } catch (e) {
          context.response.setHeader("WWW-Authenticate", token.generateResponse());
          if (callback) {
            callback(e, null);
          }
          return reject(e);
        }
      });
    }

    generatePasswd(realm, user, passwd) {
      var func = new nodefony.security.tokens.Digest();
      return func(realm, user, passwd);
    }
  };

  return Factory;
});