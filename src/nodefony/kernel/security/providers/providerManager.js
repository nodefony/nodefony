module.exports = nodefony.register('providerManager', () => {

  const Manager = class providerManager extends nodefony.Service {

    constructor(firewall, providers = []) {
      super("providerManager", firewall.container);
      this.providers = providers ||  [];
      this.nbProviders = 0;
    }

    getProvider(name) {
      if (this.providers[name]) {
        return this.providers[name];
      }
      throw new Error(`Provider : ${name} nor found`);
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
            if (config.class) {
              if (config.class in nodefony.security.providers) {
                this.providers[name] = new nodefony.security.providers[config.class](this, config.entity);
              } else {
                this.logger(new Error(`provider class not exist : ${config.class}`), "ERROR");
              }
            } else {
              this.providers[name] = new nodefony.security.providers.userProvider(this, config.entity);
            }
            break;
          case !!config.chain:
            this.providers[name] = new nodefony.security.providers.chainProvider(this, config.chain);
            break;
          case !!config.memory:
            this.providers[name] = new nodefony.security.providers.memoryProvider(this, config.memory);
            break;
          case !!config.anonymous:
            if (config.anonymous.provider) {
              if (this.providers[config.anonymous.provider]) {
                this.providers[name] = this.providers[config.anonymous.provider];
              } else {
                this.providers[name] = new nodefony.security.providers.anonymousProvider(this, config.anonymous);
              }
            } else {
              this.providers[name] = new nodefony.security.providers.anonymousProvider(this, config.anonymous);
            }
            break;
          default:
            throw new Error("Bad Provider config ");
          }
        });
      }
    }
  };

  return Manager;
});