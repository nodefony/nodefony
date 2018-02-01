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

    unserialize(user) {
      if (!this.user) {
        this.setUser(new nodefony.User("anonymous"));
      }
      return super.unserialize(user);
    }

  };
  return Anonymous;
});