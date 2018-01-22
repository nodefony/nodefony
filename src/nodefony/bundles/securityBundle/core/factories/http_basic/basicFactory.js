/*
 *	HTTP BASIC  FACTORY
 */
module.exports = nodefony.registerFactory("http_basic", () => {

  const Factory = class BasicFactory extends nodefony.Factory {

    constructor(security, settings) {
      super("http_basic", security, settings);
      this.token = "Basic";
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
            if (result) {
              this.security.provider.loadUserByUsername(token.username, (error, user) => {
                if (error) {
                  context.response.setHeader("WWW-Authenticate", token.generateResponse());
                  if (callback) {
                    callback(error, null);
                  }
                  return reject(error);
                }
                if (user) {
                  this.logger("AUTHORISATION " + this.name + " SUCCESSFULLY : " + user.username, "INFO");
                  let mytoken = {
                    name: this.name,
                    user: user
                  };
                  if (callback) {
                    callback(null, mytoken);
                  }
                  return resolve(mytoken);
                }
                return resolve(null);
              });
            } else {
              context.response.setHeader("WWW-Authenticate", token.generateResponse());
              if (callback) {
                callback(error, null);
              }
              return reject(error);
            }
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
  };
  return Factory;
});