module.exports = nodefony.register('Provider', () => {

  const Provider = class Provider extends nodefony.Service {

    constructor(name, manager) {
      super(name, manager.container);
      this.manager = manager;
    }

    authenticate(token) {
      return new Promise((resolve, reject) => {
        if (token && this.supports(token)) {
          return this.loadUserByUsername(token.getUsername()).then((user) => {
            if (user) {
              token.setUser(user);
              token.setProvider(this.name);
              this.logger(`TRY AUTHENTICATION  ${token.getUsername()}  PROVIDER ${this.name}`, "DEBUG");
              return resolve(token);
            }
            return reject(new Error(`user ${token.getUsername()} not found `));
          }).catch((error) => {
            return reject(error);
          });
        }
        return reject(new Error("The token is not supported by this authentication provider " + this.name));
      });
    }

    loadUserByUsername( /*username*/ ) {
      return new Promise((resolve, reject) => {
        return reject(new Error(`Provider : ${this.name} loadUserByUsername method  not defined`));
      });
    }

    refreshUser(user) {
      if (user instanceof nodefony.User) {
        return this.loadUserByUsername(user.getUsername());
      }
      return new Promise((resolve, reject) => {
        return reject(new Error("refreshUser bad user type"));
      });
    }

    supports( /*token*/ ) {
      return true;
    }

  };

  return Provider;
});