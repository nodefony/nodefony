module.exports = nodefony.registerProvider("chainProvider", () => {

  const chainProvider = class chainProvider extends nodefony.Provider {

    constructor(manager, config) {
      super("chainProvider", manager);
      this.config = config;
      this.providers = [];
      this.provider = [];
      this.nbProviders = 0;
      this.kernel.on("onReady", () => {
        if (this.config.providers) {
          for (let i = 0; i < this.config.providers.length; i++) {
            this.setProvider(this.config.providers[i]);
          }
        }
      });
    }

    setProvider(name) {
      let provider = this.manager.getProvider(name);
      if (provider) {
        this.providers.push(provider);
        this.nbProviders++;
      } else {
        this.logger(new Error(`In Chain Provider ${name} not exist `), "ERROR");
      }
    }

    authenticateProviders(token, index = 1) {
      return new Promise((resolve, reject) => {
        if (this.nbProviders) {
          try {
            return this.providers[index - 1].authenticate(token)
              .then((token) => {
                this.provider.push(this.providers[index - 1]);
                if (index === this.nbProviders) {
                  return resolve(token);
                }
                return resolve(this.authenticateProviders(token, ++index));
              })
              .catch((e) => {
                this.providers[index - 1].logger(e, "ERROR");
                if (index === this.nbProviders) {
                  return reject(e);
                }
                return resolve(this.authenticateProviders(token, ++index));
              });
          } catch (e) {
            return reject(e);
          }
        } else {
          return reject(null);
        }
      });
    }

    authenticate(token) {
      return new Promise((resolve, reject) => {
        return this.authenticateProviders(token)
          .then((token) => {
            return resolve(token);
          })
          .catch((e) => {
            return reject(e);
          });
      });
    }

    loadUsersByUsername(username, index = 1) {
      return new Promise((resolve, reject) => {
        if (this.provider.length) {
          try {
            return this.provider[index - 1].loadUserByUsername(username)
              .then((user) => {
                return resolve(user);
              })
              .catch((e) => {
                this.providers[index - 1].logger(e, "ERROR");
                if (index === this.provider.length) {
                  return reject(e);
                }
                return resolve(this.loadUsersByUsername(username, ++index));
              });
          } catch (e) {
            return reject(e);
          }
        } else {
          return reject(new Error("No provider valid "));
        }

      });
    }

    loadUserByUsername(username) {
      if (this.provider.length) {
        return this.loadUsersByUsername(username);
      } else {
        return new Promise((resolve, reject) => {
          return reject(new Error(`Chain Provider not ready`));
        });
      }
    }

    refreshUser(user) {
      if (user instanceof nodefony.User) {
        return this.provider.loadUserByUsername(user.getUsername());
      }
      throw new Error("refreshUser bad user type");
    }

  };

  return chainProvider;
});