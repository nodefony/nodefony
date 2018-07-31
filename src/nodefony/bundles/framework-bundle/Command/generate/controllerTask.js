class controllerTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    nodefony.extend(this.cli.response, {
      config: this.getParameters("bundles.app"),
      configKernel: this.getParameters("kernel")
    });
    this.bundleBuilder = new nodefony.builders.bundles.nodefony(this.cli, "js");
  }

  showHelp() {
    this.setHelp("generate:controller [-i] bundle name [path]",
      "Generate a Bundle Controller  Example : nodefony generate:controller name ./controller/name"
    );
  }

  run() {

  }

}

module.exports = controllerTask;