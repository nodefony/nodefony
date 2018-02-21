module.exports = nodefony.register('Token', () => {

  const Token = class Token {

    constructor(name, roles = []) {
      this.name = name;
      this.roles = [];
      this.setRoles(roles);
      this.user = null;
      this.credentials = "";
      this.authenticated = false;
      this.factory = null;
      this.provider = null;
    }

    setFactory(name) {
      this.factory = name;
    }

    setProvider(name) {
      this.provider = name;
    }

    getRoles() {
      return this.roles;
    }

    hasRole(name) {
      for (let role in this.roles) {
        if (this.roles[role].role === name) {
          return true;
        }
      }
      return false;
    }

    setRoles(roles) {
      switch (nodefony.typeOf(roles)) {
      case "string":
        if (!this.hasRole(roles)) {
          this.roles.push(new nodefony.Role(roles));
        }
        break;
      case "array":
        if (roles && roles.length) {
          for (let i = 0; i < roles.length; i++) {
            try {
              if (!this.hasRole(roles[i])) {
                this.roles.push(new nodefony.Role(roles[i]));
              }
            } catch (e) {
              throw e;
            }
          }
        }
        break;
      default:
        throw new Error("Bad typeof roles ");
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
        this.setRoles(this.user.roles);
        this.credentials = this.user.password;
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
      let user = null;
      if (this.user && this.user.serialize) {
        user = this.user.serialize();
      }
      return {
        name: this.name,
        roles: this.roles,
        user: user,
        authenticated: this.authenticated,
        factory: this.factory,
        provider: this.provider
      };
    }

    unserialize(token) {
      try {
        for (let ele in token) {
          switch (ele) {
          case "name":
            break;
          case "user":
            this.user.unserialize(token[ele]);
            break;
          case "roles":
            this.setRoles(token[ele]);
            break;
          default:
            this[ele] = token[ele];
          }
        }
      } catch (e) {
        throw e;
      }
    }
  };

  return Token;
});