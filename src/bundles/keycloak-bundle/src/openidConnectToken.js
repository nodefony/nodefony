/*
 *  Token openid
 */

nodefony.registerToken("openidconnect", () => {
  class OpenidConnectToken extends nodefony.Token {
    constructor (profile, param, accessToken, refreshToken) {
      super("openidconnect");
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.profile = profile;
      this.params = param;
      if (profile && Object.keys(profile).length) {
        const obj = {
          username: profile.username,
          name: profile.name.familyName || "",
          surname: profile.name.givenName || "",
          email: profile.emails[0].value,
          // lang: profile.locale,
          roles: this.checkRoles(this.profile),
          // gender: profile.gender || "",
          displayName: profile.displayName
        };
        if (obj.username) {
          const user = new nodefony.User(obj.username);
          user.unserialize(obj);
          this.setUser(user);
        }
      }
    }

    checkRoles (profile) {
      const roles = [];
      this.checkGroupsRoles(profile, roles);
      this.checkRessourcesAccessRoles(profile, roles);
      this.checkRealmAccessRoles(profile, roles);
      const uniqueChars = [];
      roles.forEach((element) => {
        if (!uniqueChars.includes(element)) {
          uniqueChars.push(element);
        }
      });
      return uniqueChars;
    }

    checkGroupsRoles (profile, roles = []) {
      if (profile._json && profile._json.groups) {
        for (const role of profile._json.groups) {
          roles.push(role);
        }
      }
      return roles;
    }

    checkRessourcesAccessRoles (profile, roles = []) {
      if (profile._json && profile._json.resource_access) {
        for (const clientName in profile._json.resource_access) {
          if (clientName === "portal") {
            const client = profile._json.resource_access[clientName];
            if (client.roles) {
              // eslint-disable-next-line max-depth
              for (const role of client.roles) {
                roles.push(role);
              }
            }
          }
        }
      }
      return roles;
    }

    checkRealmAccessRoles (profile, roles = []) {
      if (profile._json && profile._json.realm_access && profile._json.realm_access.roles) {
        for (const role of profile._json.realm_access.roles) {
          roles.push(role);
        }
      }
      return roles;
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
  return OpenidConnectToken;
});
