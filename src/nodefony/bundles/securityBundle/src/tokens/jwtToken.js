/*
 *	Token jwt
 */
nodefony.registerToken("jwt", function () {

  class jwtToken extends nodefony.Token {

    constructor(jwtToken) {
      super("jwt");
      this.jwtToken = jwtToken;
      /*if (jwtToken.data) {
        if (jwtToken.data.user) {
          this.setUser(new nodefony.User(jwtToken.data.user.username));
        }
        this.unserialize(jwtToken.data);
      }*/
    }
    serialize() {
      let serial = super.serialize();
      serial.jwtToken = this.jwtToken;
      return serial;
    }

    unserialize(token) {
      this.jwtToken = token.jwtToken;
      if (this.jwtToken.data) {
        if (this.jwtToken.data.user) {
          this.setUser(new nodefony.User(this.jwtToken.data.user.username));
        }
      }
      return super.unserialize(token);
    }
  }
  return jwtToken;
});