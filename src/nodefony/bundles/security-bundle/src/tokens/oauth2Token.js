/*
 *	Token google
 */

nodefony.registerToken("oauth2", () => {
  class oauth2Token extends nodefony.Token {
    constructor (profile, param, accessToken, refreshToken) {
      super("oauth2");
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.profile = profile;
      this.params = param;
      if (profile && Object.keys(profile).length) {
        const obj = {
          username: profile.displayName,
          name: profile.name.familyName || "",
          surname: profile.name.givenName || "",
          email: profile.emails ? profile.emails[0].value : "",
          // provider: profile.provider,
          lang: profile._json.language,
          roles: ["ROLE_USER"],
          gender: profile.gender || "",
          displayName: profile.displayName,
          url: profile._json.url || "",
          image: profile._json.image.url || ""
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
  return oauth2Token;
});
