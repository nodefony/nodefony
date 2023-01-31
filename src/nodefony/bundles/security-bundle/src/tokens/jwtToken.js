/*
 *	Token jwt
 */
nodefony.registerToken("jwt", () => {
  class jwtToken extends nodefony.Token {
    constructor (jwtToken) {
      super("jwt");
      this.jwtToken = jwtToken;
      if (this.jwtToken && this.jwtToken.data) {
        if (this.jwtToken.data.user) {
          const user = new nodefony.User(this.jwtToken.data.user.username);
          user.unserialize(this.jwtToken.data.user);
          this.setUser(user);
        }
      }
    }

    serialize () {
      const serial = super.serialize();
      serial.jwtToken = this.jwtToken;
      return serial;
    }

    unserialize (token) {
      this.jwtToken = token.jwtToken;

      /* if (this.jwtToken && this.jwtToken.data) {
        if (this.jwtToken.data.user) {
          let user = new nodefony.User(this.jwtToken.data.user.username);
          user.unserialize(this.jwtToken.data.user);
          this.setUser(user);
        }
      }*/
      return super.unserialize(token);
    }
  }
  return jwtToken;
});
