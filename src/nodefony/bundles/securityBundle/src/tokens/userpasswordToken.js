/*
 *	Token passport-local
 */

nodefony.registerToken("userPassword", function () {

  const userPasswordToken = class userPasswordToken extends nodefony.Token {

    constructor(user, passwd) {
      super("userPassword");

      if (user) {
        this.setUser(new nodefony.User(user, passwd));
      }

    }

    unserialize(user) {
      if (!this.user) {
        this.setUser(new nodefony.User(user.username));
      }
      return super.unserialize(user);
    }

  };
  return userPasswordToken;
});