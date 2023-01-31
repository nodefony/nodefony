/*
 *	Token openid
 */

nodefony.registerToken("openid", () => {
  class openidToken extends nodefony.Token {
    constructor (profile, param, accessToken, refreshToken) {
      super("openid");
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.profile = profile;
      this.params = param;
      if (profile && Object.keys(profile).length) {
        const obj = {
          username: profile.user_name,
          name: profile.given_name || "",
          surname: profile.family_name || "",
          email: profile.email,
          lang: profile.locale,
          roles: profile.role,
          gender: profile.gender || "",
          displayName: profile.name
        };
        if (obj.username) {
          const user = new nodefony.User(obj.username);
          user.unserialize(obj);
          this.setUser(user);
        }
      }
    }

    serialize () {
      const serial = super.serialize();
      serial.profile = this.profile;
      serial.params = this.params;
      serial.refreshToken = this.refreshToken;
      serial.accessToken = this.accessToken;
      return serial;
    }

    unserialize (token) {
      this.profile = token.profile;
      this.refreshToken = token.refreshToken;
      this.accessToken = token.accessToken;
      this.params = token.params;
      return super.unserialize(token);
    }
  }
  return openidToken;
});
