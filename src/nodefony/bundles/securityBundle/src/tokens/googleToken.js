/*
 *	Token jwt
 */

nodefony.registerToken("google", function () {

  class googleToken extends nodefony.Token {

    constructor(profile, accessToken, refreshToken) {
      super("google");
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.profile = profile;
      if (profile) {
        let obj = {
          username: profile.displayName,
          name: profile.name.familyName || "",
          surname: profile.name.givenName || "",
          email: profile.emails ? profile.emails[0].value : "",
          provider: profile.provider,
          lang: profile._json.language,
          roles: ["USER"],
          gender: profile.gender || "",
          displayName: profile.displayName,
          url: profile._json.url || "",
          image: profile._json.image.url || ""
        };
        this.setUser(new nodefony.User(
          obj.username,
          null,
          obj.roles,
          obj.lang,
          obj.enabled,
          obj.userNonExpired,
          obj.credentialsNonExpired,
          obj.accountNonLocked,
          obj.name,
          obj.surname,
          obj.email,
          obj.gender,
          obj.url,
          obj.image));
      }
    }
    serialize() {
      let serial = super.serialize();
      serial.profile = this.profile;
      serial.refreshToken = this.refreshToken;
      serial.accessToken = this.accessToken;
      return serial;
    }

    unserialize(token) {
      this.profile = token.profile;
      this.refreshToken = token.refreshToken;
      this.accessToken = token.accessToken;
      return super.unserialize(token);
    }
  }
  return googleToken;
});