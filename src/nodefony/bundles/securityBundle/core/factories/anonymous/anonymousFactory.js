/*
 *
 * Anonymous  FACTORY
 *
 */
module.exports = nodefony.registerFactory("anonymous", () => {

  const Factory = class anonymousFactory extends nodefony.Factory {
    constructor(security, settings) {
      super("anonymous", security, settings);
      this.token = "Anonymous";
    }

    getPosition() {
      return "http";
    }

    handle(context, callback) {
      return new Promise((resolve, reject) => {
        try {
          let token = new nodefony.security.tokens[this.token](context.request, context.response, this.settings);
          this.logger("TRY AUTHORISATION " + token.name, "DEBUG");
          return this.security.provider.loadUserByUsername(this.name, (error, result) => {
            if (error) {
              if (callback) {
                callback(error, null);
              }
              return reject(error);
            }
            context.user = result;
            if (callback) {
              callback(null, token);
            }
            return resolve(result);
          });
        } catch (e) {
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