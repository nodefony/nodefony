module.exports = class bundlesTask extends nodefony.Task {
  constructor (name, command) {
    super(name, command);
  }

  showHelp () {

    /* this.setHelp("nodefony:bundles:listDependencies",
      "List Nodefony dependencies"
    );
    this.setHelp("nodefony:bundles:install [environment]",
      "Install Nodefony dependencies"
    );*/
  }

  /* async dependencies() {
    return await this.cli.listPackage(this.kernel.rootDir);
  }*/

  async install (...args) {
    try {
      for (let i = 0; i < args.length; i++) {
        if (args[i] instanceof nodefony.fileClass || args[i] instanceof nodefony.Bundle) {
          if (this.kernel.isCore) {
            // mypromise.push(this.cli.installPackage(args[i], this.kernel.environment));
            await this.cli.installPackage(args[i], this.kernel.environment);
          } else if (!this.kernel.isBundleCore(args[i].name)) {
            // mypromise.push(this.cli.installPackage(args[i], this.kernel.environment));
            await this.cli.installPackage(args[i], this.kernel.environment);
          }
        }
      }
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
    this.log("Install success");
  }

  async outdated (...args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i] instanceof nodefony.fileClass || args[i] instanceof nodefony.Bundle) {
        if (this.kernel.isCore) {
          await this.cli.outdatedPackage(args[i]);
        } else if (!this.kernel.isBundleCore(args[i].name)) {
          await this.cli.outdatedPackage(args[i]);
        }
      }
    }
  }

  async rebuild (...args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i] instanceof nodefony.fileClass || args[i] instanceof nodefony.Bundle) {
        await this.cli.rebuildPackage(args[i]);
      }
    }
  }
};
