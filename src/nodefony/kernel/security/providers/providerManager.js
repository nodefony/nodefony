module.exports = nodefony.register('providerManager', () => {

  const Manager = class providerManager extends nodefony.Service {

    constructor(firewall, providers = []) {
      super("providerManager", firewall.container);
      this.providers = providers ||  [];
      this.nbProviders = 0;
    }


    authenticateProviders(token, index = 1) {
      return new Promise((resolve, reject) => {
        if (this.nbProviders) {
          try {
            this.providers[index - 1].authenticate(token)
              .then((token) => {
                return resolve(token);
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

    addConfiguration(name, config) {
      if (name in this.providers) {

      }
      if (config) {
        switch (config.type) {}
      }
      //throw new Error("Bad Provider config ");
    }
  };

  return Manager;
});