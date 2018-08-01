class controllerTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    nodefony.extend(this.cli.response, {
      config: this.getParameters("bundles.app"),
      configKernel: this.getParameters("kernel")
    });
    this.bundleBuilder = new nodefony.builders.bundles.nodefony(this.cli, "js");
    this.controller = this.bundleBuilder.controller;
  }

  showHelp() {
    this.setHelp("generate:controller [-i] bundle name [path]",
      "Generate a Bundle Controller  Example : nodefony generate:controller name ./controller/name"
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
    return this.kernel.getBundle(name);
  }

  controllerExist() {

  }

  interaction( /*args*/ ) {
    return this.cli.showAsciify(this.name)
      .then(() => {
        let bundles = this.getBundles();
        return this.cli.prompt([{
          type: 'list',
          name: 'bundle',
          message: 'Choose a bundle to generate a controller : ',
          default: 0,
          pageSize: bundles.length,
          choices: bundles,
          filter: (val) => {
            let bundle = this.getBundle(val);
            this.bundleBuilder.setPath(null, bundle);
            return bundle;
          }
        }, {
          type: 'input',
          name: 'controllerName',
          default: (response) => {
            return `${response.bundle.name}Controller`;
          },
          message: `Enter Controller Name : `,
          validate: (value) => {
            if (value) {
              let res = this.controller.checkName(value);
              if (res) {
                return `${value} Unauthorised Please enter a valid Controller name`;
              }
              try {
                res = this.controllerExist(value);
              } catch (e) {
                return "Controller already exist " + value;
              }
              return true;
            }
          }
        }]);
      }).then((response) => {
        return nodefony.extend(this.cli.response, response);
      });
  }

  generate(args, response) {
    return new Promise((resolve, reject) => {
      try {
        this.controller.generateController(response.controllerName);
        return resolve();
      } catch (e) {
        return reject(e);
      }
    });
  }

}

module.exports = controllerTask;