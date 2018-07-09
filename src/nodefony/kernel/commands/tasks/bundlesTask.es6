module.exports = class bundlesTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
  }

  showHelp() {
    this.setHelp("nodefony:bundles:listDependencies",
      "List Nodefony dependencies"
    );
    this.setHelp("nodefony:bundles:install [environment]",
      "Install Nodefony dependencies"
    );
  }

  listDependencies() {
    return this.cli.listPackage(this.kernel.rootDir);
  }

  install(...args) {
    let mypromise = [];
    try {
      for (let i = 0; i < args.length; i++) {
        if (args[i] instanceof nodefony.fileClass || args[i] instanceof nodefony.Bundle) {
          if (this.kernel.isCore) {
            mypromise.push(this.cli.installPackage(args[i], this.kernel.environment));
          } else {
            if (!this.kernel.isBundleCore(args[i].name)) {
              mypromise.push(this.cli.installPackage(args[i], this.kernel.environment));
            }
          }
        }
      }
    } catch (e) {
      throw e;
    }
    return Promise.all(mypromise)
      .then(() => {
        this.logger("Install success");
      })
      .catch(e => {
        this.logger(e, "ERROR");
        return e;
      });
  }

  outdated(...args) {
    let mypromise = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] instanceof nodefony.fileClass || args[i] instanceof nodefony.Bundle) {
        if (this.kernel.isCore) {
          mypromise.push(this.cli.outdatedPackage(args[i]));
        } else {
          if (!this.kernel.isBundleCore(args[i].name)) {
            mypromise.push(this.cli.outdatedPackage(args[i]));
          }
        }
      }
    }
    return Promise.all(mypromise)
      .catch(e => {
        this.logger(e, "ERROR");
        return e;
      });
  }

};