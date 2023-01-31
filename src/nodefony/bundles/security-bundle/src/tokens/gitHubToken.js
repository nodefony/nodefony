/*
 *	Token gitHub
 */

nodefony.registerToken("github", () => {
  class gitHubToken extends nodefony.Token {
    constructor (profile, accessToken, refreshToken) {
      super("github");
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.profile = profile;
      if (profile) {
        const obj = {
          username: profile._json.login,
          name: profile.username || "",
          surname: profile._json.name || "",
          email: profile.emails ? profile.emails[0].value : "",
          roles: ["ROLE_USER"],
          displayName: profile.displayName,
          url: profile._json.url || "",
          image: profile._json.avatar_url || ""
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
      serial.refreshToken = this.refreshToken;
      serial.accessToken = this.accessToken;
      return serial;
    }

    unserialize (token) {
      this.profile = token.profile;
      this.refreshToken = token.refreshToken;
      this.accessToken = token.accessToken;
      return super.unserialize(token);
    }
  }
  return gitHubToken;
});
