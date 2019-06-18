class controllerTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    nodefony.extend(this.cli.response, {
      config: this.getParameters("bundles.app"),
      configKernel: this.getParameters("kernel")
    });
    let generaterController = nodefony.builders.bundle.controller();
    this.controller = new generaterController(this.cli);
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
      this.controller.setBundle(bundle);
      return bundle;
    }
    throw new Error(`Bundle: ${name} not found`);
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
        }]);
      }).then((response) => {
        return nodefony.extend(this.cli.response, response);
      }).catch((e) => {
        return Promise.reject(e);
      });
  }

  generate(args, response) {
    return this.controller.run(this.cli.interactive);
  }

}

module.exports = controllerTask;
