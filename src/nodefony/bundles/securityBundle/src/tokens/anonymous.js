/*
 *	Token Anonymous
 */

nodefony.register.call(nodefony.security.tokens, "anonymous", function () {

  const Anonymous = class Anonymous extends nodefony.Token {

    constructor(secret, user, roles) {
      super("Anonymous", roles);
      this.secret = secret;
      if (user) {
        this.setUser(new nodefony.User(user, null, roles));
      }
      if (roles && roles.length) {
        this.setAuthenticated(true);
      }
    }

  };
  return Anonymous;
});