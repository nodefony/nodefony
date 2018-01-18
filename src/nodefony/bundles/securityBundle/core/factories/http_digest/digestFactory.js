/*
 *	HTTP DIGEST  FACTORY
 */
nodefony.register.call(nodefony.security.factory, "http_digest", function () {

  const Factory = class digestFactory {

    constructor(contextSecurity, settings) {
      this.name = this.getKey();
      this.contextSecurity = contextSecurity;
      this.settings = settings;
      this.token = "Digest";
    }

    getKey() {
      return "http_digest";
    }

    getPosition() {
      return "http";
    }

    handle(context, callback) {
      var token = new nodefony.security.tokens[this.token](context.request, context.response, this.settings);
      this.contextSecurity.logger("TRY AUTHORISATION " + token.name, "DEBUG");
      try {
        if (!token.authorization) {
          context.response.setHeader("WWW-Authenticate", token.generateResponse());
          callback({
            status: 401,
            message: "Unauthorized"
          }, null);
          return;
        }
        token.checkResponse(this.contextSecurity.provider.getUserPassword.bind(this.contextSecurity.provider), (error, result) => {
          if (error) {
            context.response.setHeader("WWW-Authenticate", token.generateResponse());
            callback(error, null);
            return error;
          }
          if (result === true) {
            this.contextSecurity.provider.loadUserByUsername(token.username, (error, result) => {
              if (error) {
                context.response.setHeader("WWW-Authenticate", token.generateResponse());
                throw error;
              }
              context.user = result;
              callback(null, token);
              return result;
            });
          }
          return result;
        });

      } catch (e) {
        context.response.setHeader("WWW-Authenticate", token.generateResponse());
        callback(e, null);
      }
    }

    generatePasswd(realm, user, passwd) {
      var func = new nodefony.security.tokens.Digest();
      return func(realm, user, passwd);
    }
  };

  return Factory;
});