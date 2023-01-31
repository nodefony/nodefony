class providerManager extends nodefony.Service {
  constructor (firewall, providers = []) {
    super("providerManager", firewall.container);
    this.providers = providers || [];
    this.nbProviders = 0;
  }

  getProvider (name) {
    if (this.providers[name]) {
      return this.providers[name];
    }
    throw new Error(`Provider : ${name} nor found`);
  }

  getProviders (name) {
    if (name) {
      return this.getProvider(name);
    }
    return this.providers;
  }

  addConfiguration (name, config) {
    if (name in this.providers) {
      this.log(`Provider ${name} already exist`, "WARNING");
      return null;
    }
    if (config) {
      this.kernel.prependOnceListener("onBoot", async () => {
        switch (true) {
        case Boolean(config.entity):
          if (config.class) {
            if (config.class in nodefony.security.providers) {
              this.providers[name] = new nodefony.security.providers[config.class](name, this, config.entity);
            } else {
              this.log(new Error(`provider class not exist : ${config.class}`), "ERROR");
            }
          } else if (nodefony.security.providers.userProvider) {
            this.providers[name] = new nodefony.security.providers.userProvider(name, this, config.entity);
          }
          break;
        case Boolean(config.chain):
          this.providers[name] = new nodefony.security.providers.chainProvider(this, config.chain);
          break;
        case Boolean(config.memory):
          this.providers[name] = new nodefony.security.providers.memoryProvider(this, config.memory);
          break;
        case Boolean(config.anonymous):
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
}

nodefony.providerManager = providerManager;
module.exports = providerManager;
