/*
 *	Token Anonymous
 */

nodefony.registerToken("anonymous", function () {

  const Anonymous = class anonymousToken extends nodefony.Token {

    constructor(secret, user, roles) {
      super("anonymous", roles);
      this.secret = secret;
      if (user) {
        this.setUser(new nodefony.User(user, null, roles));
      }
      if (roles && roles.length) {
        this.setAuthenticated(true);
      }
    }

    getSecret() {
      return this.secret;
    }

    unserialize(token) {
      if (!token.user) {
        this.setUser(new nodefony.User("anonymous"));
      }
      return super.unserialize(token);
    }

  };
  return Anonymous;
});