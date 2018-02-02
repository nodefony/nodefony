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
        this.logger(`Provider ${name} already exist`, "WARNING");
        return null;
      }
      if (config) {
        this.kernel.once("onBoot", () => {
          switch (true) {
          case !!config.entity:
            this.providers[name] = new nodefony.security.providers.userProvider(this, config.entity);
            break;
          case !!config.chain:
            this.providers[name] = new nodefony.security.providers.chainProvider(this, config.chain);
            break;
          case !!config.memory:
            this.providers[name] = new nodefony.security.providers.memoryProvider(this, config.memory);
            break;
          case !!config.anonymous:
            if (config.anonymous.provider) {
              //this.kernel.once("onBoot", () => {
              if (this.providers[config.anonymous.provider]) {
                this.providers[name] = this.providers[config.anonymous.provider];
              } else {
                this.providers[name] = new nodefony.security.providers.anonymousProvider(this, config.anonymous);
              }
              //});
            } else {
              this.providers[name] = new nodefony.security.providers.anonymousProvider(this, config.anonymous);
            }
            break;
          default:
            throw new Error("Bad Provider config ");
          }
        });
      }
      //return this.providers[name];
    }
  };

  return Manager;
});