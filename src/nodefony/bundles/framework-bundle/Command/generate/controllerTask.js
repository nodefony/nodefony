class controllerTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    nodefony.extend(this.cli.response, {
      config: this.getParameters("bundles.app"),
      configKernel: this.getParameters("kernel")
    });
    this.bundleBuilder = new nodefony.builders.bundles.nodefony(this.cli, "js");
    this.controller = this.bundleBuilder.controller;
    this.defaultOptions = {
      bundle: "app",
      controllerName: "defaultController",
    };
  }

  showHelp() {
    this.setHelp("generate:controller [-i] name [bundle]",
      "Generate a Bundle Controller  Example : nodefony generate:controller defaultController demo "
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
      this.bundleBuilder.setPath(null, bundle);
      return bundle;
    }
    throw new Error(`Bundle: ${name} not found`);
  }

  controllerExist(bundle, nameController) {
    return true
  }

  interaction( /*args*/ ) {
    return this.cli.showAsciify(this.name)
      .then(() => {
        let bundles = this.getBundles();
        bundles.push(this.cli.getSeparator());
        bundles.push("Quit");
        return this.cli.prompt([{
          type: 'list',
          name: 'bundle',
          message: 'Choose a bundle to generate a controller : ',
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
          name: 'controllerName',
          default: (response) => {
            if (response.bundle === "Quit") {
              return Promise.reject("Quit");
            }
            return `${response.bundle.name}Controller`;
          },
          message: `Enter Controller Name : `,
          validate: (value, response) => {
            if (value) {
              let res = this.controller.checkName(value);
              if (res) {
                return `${value} Unauthorised Please enter a valid Controller name`;
              }
              try {
                res = this.controllerExist(response.bundle, value);
              } catch (e) {
                return "Controller already exist " + value;
              }
              return true;
            }
            return `${value} Unauthorised Please enter a valid Controller name`;
          }
        }]);
      }).then((response) => {
        return nodefony.extend(this.cli.response, response);
      }).catch((e) => {
        return Promise.reject(e);
      });
  }

  generate(args, response) {
    return new Promise((resolve, reject) => {
      try {
        if (this.interactive && response) {
          //this.controller.generateController(response.controllerName);
        }
        if (args.length) {
          let bundle = null;
          if (!args[1]) {
            bundle = this.getBundle("app");
          } else {
            bundle = this.getBundle(args[1]);
          }
          if (bundle) {
            this.controllerExist(bundle, args[0]);
            //this.controller.generateController(args[0]);
          }
        }
        return reject(new Error("Bad Arguments"));
      } catch (e) {
        return reject(e);
      }
    });
  }

}

module.exports = controllerTask;