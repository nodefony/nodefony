/*
 *	Token jwt
 */

nodefony.registerToken("jwt", function () {

  const jwtToken = class jwtToken extends nodefony.Token {

    constructor(jwtToken) {
      super("jwt");
      this.jwtToken = jwtToken;
      if (jwtToken.data && jwtToken.data) {
        if (jwtToken.data.user) {
          this.setUser(new nodefony.User(jwtToken.data.user.username));
        }
        this.unserialize(jwtToken.data);
      }
    }

  };
  return jwtToken;
});