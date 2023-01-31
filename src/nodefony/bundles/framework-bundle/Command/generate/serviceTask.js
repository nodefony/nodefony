class serviceTask extends nodefony.Task {
  constructor (name, command) {
    super(name, command);
    this.dependencies = [];
    this.builder = new nodefony.Builder(this.cli);
    this.defaultResponse = {
      bundle: "app",
      serviceName: "defaultService"
    };
    this.skeleton = path.resolve(__dirname, "skeletons", "services", "classService.skeleton");
    this.skeletonConfig = path.resolve(__dirname, "skeletons", "services", "configService.skeleton");
  }

  showHelp () {
    this.setHelp(
      "generate:service [-i]",
      "Generate Service"
    );
  }

  getBundles () {
    const bundles = [];
    const allBundles = this.kernel.getBundles();
    for (const bundle in allBundles) {
      if (!this.kernel.isBundleCore(allBundles[bundle].name)) {
        bundles.push(allBundles[bundle].name);
      }
    }
    return bundles;
  }

  getBundle (name) {
    const bundle = this.kernel.getBundle(name);
    if (bundle) {
      return bundle;
    }
    throw new Error(`Bundle: ${name} not found`);
  }

  getServices () {
    const serviceParam = this.container.getParameters("services");
    const services = [];
    services.push("quit");
    for (const service in serviceParam) {
      services.push(service);
    }
    return services;
  }

  showService (services, val) {
    this.log(`Add ${val} Injector dependencies arguments : [${this.dependencies}]`);
    return this.cli.prompt([{
      type: "list",
      name: "services",
      message: `Add an Injection Dependency to inject in service : ${this.seviceName} constructor arguments : `,
      default: 0,
      pageSize: services.length,
      choices: services,
      filter: (val) => {
        if (val === "quit") {
          return Promise.resolve();
        }
        this.dependencies.push(val);
        return this.showService(services, val);
      }
    }]);
  }

  getService (name) {
    return this.get(name);
  }

  checkService (name) {
    const regService = /^(.+)Service$/;
    const ret = regService.exec(name);
    if (!ret) {
      this.serviceName = name;
    } else {
      this.serviceName = ret[1];
    }
    if (nodefony.services[this.serviceName]) {
      throw new Error(`Service ${this.serviceName} already exist !`);
    }
  }

  interaction (/* args*/) {
    return this.cli.showAsciify(this.name)
      .then(() => {
        const bundles = this.getBundles();
        const services = this.getServices();
        bundles.push(this.cli.getSeparator());
        bundles.push("Quit");
        return this.cli.prompt([{
          type: "list",
          name: "bundle",
          message: "Choose a bundle to generate a Service : ",
          default: 0,
          pageSize: bundles.length,
          choices: bundles,
          filter: (val) => {
            if (val === "Quit") {
              return Promise.reject("Quit");
            }
            return this.getBundle(val);
          }
        }, {
          type: "input",
          name: "serviceName",
          default: (response) => {
            if (response.bundle === "Quit") {
              return Promise.reject("Quit");
            }
            return `${response.bundle.name}Service`;
          },
          message: "Enter Service Name : ",
          validate: (value /* , response*/) => {
            if (value) {
              try {
                this.checkService(value);
              } catch (e) {
                return e.message;
              }
              return true;
            }
            return `${value} Unauthorised Please enter a valid Service name`;
          }
        }, {
          type: "list",
          name: "services",
          message: (response) => `Choose an Injection Dependency to inject in service : ${response.serviceName}  constructor arguments : `,
          default: 0,
          pageSize: services.length,
          choices: services,
          filter: (val) => {
            if (val === "quit") {
              return Promise.resolve();
            }
            this.dependencies.push(val);
            return this.showService(services, val);
          }
        }]);
      })
      .then((response) => nodefony.extend(this.cli.response, response))
      .catch((e) => Promise.reject(e));
  }

  generate (args, response) {
    return this.createClassService(response)
      .then(() => this.addConfigService(response));
  }

  createClassService (response) {
    try {
      this.location = path.resolve(response.bundle.path, "services");
      if (!this.cli.exists(this.location)) {
        this.cli.mkdir(this.location);
      }
      response.name = this.serviceName;
      const Path = path.resolve(this.location, `${this.serviceName}Service.js`);
      if (this.dependencies.length) {
        response.injections = this.dependencies.map((ele) => ` ${ele}`);
      } else {
        response.injections = null;
      }
      response.servicePath = Path;
      return this.builder.createFile(Path, this.skeleton, true, response);
    } catch (e) {
      throw e;
    }
  }

  addConfigService (response) {
    try {
      response.injections = this.dependencies.map((ele) => ` "@${ele}"`);
    } catch (e) {
      throw e;
    }
    return this.builder.buildSkeleton(this.skeletonConfig, true, response)
      .then((result) => {
        this.configLocation = path.resolve(response.bundle.path, "Resources", "config", "services.js");
        this.log(`You must Add this configuration services in ${this.configLocation} :\n${result}`);
        return result;
      });
  }
}

module.exports = serviceTask;
