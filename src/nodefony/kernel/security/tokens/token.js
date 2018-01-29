module.exports = nodefony.register('Token', () => {

  const Token = class Token {

    constructor(name, roles = []) {
      this.name = name;
      this.roles = [];
      for (let i = 0; i < roles.length; i++) {
        try {
          this.roles.push(new nodefony.Role(roles[i]));
        } catch (e) {
          throw e;
        }
      }
      this.user = null;
      this.authenticated = false;
    }

    getRoles() {
      return this.roles;
    }

    getCredentials() {

    }

    getUser() {
      return this.user;
    }

    setUser(user) {
      if (user instanceof nodefony.User) {
        this.user = user;
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

    eraseCredentials() {
      if (this.user instanceof nodefony.User) {
        return this.user.eraseCredentials();
      }
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
          return this.user.unserialize();
        }
      } catch (e) {
        throw new Error("Bad User format !!");
      }
      throw new Error("Bad User format !!");
    }
  };

  return Token;
});