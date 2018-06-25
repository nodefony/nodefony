module.exports = class npmTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
  }

  showHelp() {
    this.setHelp("nodefony:npm:list",
      "List Nodefony dependencies"
    );
    this.setHelp("nodefony:npm:install [environment]",
      "Install Nodefony dependencies"
    );
  }

  list() {
    return this.cli.listPackage(this.kernel.rootDir);
  }

  install(environment = "development") {
    for (let bundle in this.kernel.bundles) {
      if (this.kernel.isCore) {
        this.cli.installPackage(this.kernel.bundles[bundle], environment);
      } else {
        if (!this.kernel.isBundleCore(bundle)) {
          this.cli.installPackage(this.kernel.bundles[bundle], environment);
        }
      }
    }
  }
};