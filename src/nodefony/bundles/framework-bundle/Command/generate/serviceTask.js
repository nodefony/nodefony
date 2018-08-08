class serviceTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.dependencies = [];
    this.defaultResponse = {
      bundle: "app",
      serviceName: "defaultService",
    };
  }

  showHelp() {
    this.setHelp("generate:service [-i]",
      "Generate Service"
    );
  }

  getBundles() {
    let bundles = [];
    let allBundles = this.kernel.getBundles();
    for (let bundle in allBundles) {
      if (!this.kernel.isBundleCore(allBundles[bundle].name)) {
        bundles.push(allBundles[bundle].name);
      }
    }
    return bundles;
  }

  getBundle(name) {
    let bundle = this.kernel.getBundle(name);
    if (bundle) {
      return bundle;
    }
    throw new Error(`Bundle: ${name} not found`);
  }

  getServices() {
    let serviceParam = this.container.getParameters("services");
    let services = [];
    services.push("quit");
    for (let service in serviceParam) {
      services.push(service);
    }
    return services;
  }

  showService(services, val) {
    this.logger(`Add ${val} Injector dependencies arguments : [${this.dependencies}]`);
    return this.cli.prompt([{
      type: 'list',
      name: 'services',
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

  getService(name) {
    return this.get(name);
  }

  checkService(name, bundle) {
    this.seviceName = name;
  }

  interaction( /*args*/ ) {
    return this.cli.showAsciify(this.name)
      .then(() => {
        let bundles = this.getBundles();
        let services = this.getServices();
        bundles.push(this.cli.getSeparator());
        bundles.push("Quit");
        return this.cli.prompt([{
          type: 'list',
          name: 'bundle',
          message: 'Choose a bundle to generate a Service : ',
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
          type: 'input',
          name: 'serviceName',
          default: (response) => {
            if (response.bundle === "Quit") {
              return Promise.reject("Quit");
            }
            return `${response.bundle.name}Service`;
          },
          message: `Enter Service Name : `,
          validate: (value, response) => {
            if (value) {
              try {
                this.checkService(value, response.bundle);
              } catch (e) {
                return e.message;
              }
              return true;
            }
            return `${value} Unauthorised Please enter a valid Service name`;
          }
        }, {
          type: 'list',
          name: 'services',
          message: (response) => {
            return `Choose an Injection Dependency to inject in service : ${response.serviceName}  constructor arguments : `;
          },
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
      }).then((response) => {
        return nodefony.extend(this.cli.response, response);
      }).catch((e) => {
        return Promise.reject(e);
      });
  }

  generate(args, response) {
    console.log(this.dependencies)
    return Promise.resolve();

  }

}

module.exports = serviceTask;