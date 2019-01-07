module.exports = nodefony.register('Token', () => {

  class Token {

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

    setProvider(provider) {
      this.provider = provider;
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
                this.setRoles(roles[i]);
              } catch (e) {
                throw e;
              }
            }
          }
          break;
        case "object":
          if (roles instanceof nodefony.Role) {
            if (!this.hasRole(roles.role)) {
              this.roles.push(roles);
            }
          } else {
            if (roles.role) {
              if (!this.hasRole(roles.role)) {
                this.roles.push(new nodefony.Role(roles.role));
              }
            } else {
              throw new Error("Bad typeof roles ");
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
      return this.user;
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

    refreshToken(context) {
      if (this.provider) {
        let user = context.user;
        return this.provider.loadUserByUsername(user.username)
          .then((user) => {
            this.roles = [];
            this.user = null;
            this.setUser(user);
            if (context) {
              //context.session.setMetaBag("security.token", {});
              context.session.setMetaBag("security.token", this.serialize());
            }
            return user;
          });
      }
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
        provider: this.provider ? this.provider.name : null
      };
    }

    unserialize(token) {
      try {
        for (let ele in token) {
          switch (ele) {
            case "name":
              break;
            case "user":
              if (this.user) {
                this.user.unserialize(token[ele]);
              }
              break;
            case "roles":
              this.setRoles(token[ele]);
              break;
            case "provider":
              break;
            default:
              this[ele] = token[ele];
          }
        }
      } catch (e) {
        throw e;
      }
      return token;
    }
  }
  return Token;
});