/*
 *
 * Anonymous  FACTORY
 *
 */
nodefony.register.call(nodefony.security.factory, "anonymous", function () {


  /*const User = class User {
      constructor() {
          this.username = "anonymous";
          this.name = "anonymous";
          this.surname = "anonymous";
          this.lang = null;
          this.roles = "ANONYMOUS";
      }
  };*/

  const Factory = class Factory {
    constructor(contextSecurity, settings) {
      this.name = this.getKey();
      this.contextSecurity = contextSecurity;
      this.settings = settings;
      this.token = "Anonymous";
    }

    getKey() {
      return "anonymous";
    }

    getPosition() {
      return "http";
    }

    handle(context, callback) {
      try {
        let token = new nodefony.security.tokens[this.token](context.request, context.response, this.settings);
        this.contextSecurity.logger("TRY AUTHORISATION " + token.name, "DEBUG");
        return this.contextSecurity.provider.loadUserByUsername(this.getKey(), (error, result) => {
          if (error) {
            callback(error, null);
            return error;
          }
          context.user = result;
          callback(null, token);
          return result;
        });
      } catch (e) {
        callback(e, null);
      }
    }
  };
  return Factory;
});