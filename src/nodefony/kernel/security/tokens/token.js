module.exports = nodefony.register('Token', () => {

  const Token = class Token {

    constructor(name, roles = []) {
      this.name = name;
      this.roles = [];
      this.setRoles(roles);
      this.user = null;
      this.credentials = "";
      this.authenticated = false;
    }

    getRoles() {
      return this.roles;
    }

    setRoles(roles) {
      for (let i = 0; i < roles.length; i++) {
        try {
          this.roles.push(new nodefony.Role(roles[i]));
        } catch (e) {
          throw e;
        }
      }
    }

    getCredentials() {
      return this.credentials;
    }

    eraseCredentials() {
      if (this.user instanceof nodefony.User) {
        this.user.eraseCredentials();
      }
      this.credentials = "";
    }

    getUser() {
      return this.user;
    }

    setUser(user) {
      if (user instanceof nodefony.User) {
        this.user = user;
        this.setRoles(user.roles);
      } else {
        this.user = user;
      }
    }

    getUsername() {
      if (this.user instanceof nodefony.User) {
        return this.user.getUsername();
      }
      return this.user;
    }

    isAuthenticated() {
      return this.authenticated;
    }

    setAuthenticated(val) {
      this.authenticated = val;
    }

    serialize() {
      if (this.user && this.user.serialize) {
        return this.user.serialize();
      }
      return {};
    }

    unserialize(user) {
      try {
        if (user) {
          return this.user.unserialize(user);
        }
      } catch (e) {
        throw new Error("Bad User format !!");
      }
      throw new Error("Bad User format !!");
    }
  };

  return Token;
});