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

  install(...args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i] instanceof nodefony.fileClass) {
        if (this.kernel.isCore) {
          this.cli.installPackage(args[i], this.kernel.environment);
        } else {
          if (!this.kernel.isBundleCore(args[i].name)) {
            this.cli.installPackage(args[i], this.kernel.environment);
          }
        }
      }
    }
    /*for (let bundle in this.kernel.bundles) {
      if (this.kernel.isCore) {
        this.cli.installPackage(this.kernel.bundles[bundle], environment);
      } else {
        if (!this.kernel.isBundleCore(bundle)) {
          this.cli.installPackage(this.kernel.bundles[bundle], environment);
        }
      }
    }*/
  }
};