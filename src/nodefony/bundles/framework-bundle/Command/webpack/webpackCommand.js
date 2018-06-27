class webpackCommand extends nodefony.Command {
  constructor(cli, bundle) {
    super("webpack", cli, bundle);
  }

  showHelp() {
    this.setHelp("webpack:dump",
      "Compile webpack for all bundles"
    );
  }

  dump() {
    return new Promise((resolve, reject) => {
      this.kernel.listen(this, "onReady", () => {
        let promiseWebpack = null;
        for (let bundle in this.kernel.bundles) {
          if (this.kernel.isCore) {
            if (this.kernel.bundles[bundle].webpackCompiler) {
              if (promiseWebpack) {
                promiseWebpack.then(this.kernel.bundles[bundle].compileWebpack());
              } else {
                promiseWebpack = this.kernel.bundles[bundle].compileWebpack();
              }
            }
          } else {
            if (!this.kernel.isBundleCore(bundle)) {
              if (this.kernel.bundles[bundle].webpackCompiler) {
                if (promiseWebpack) {
                  promiseWebpack.then(this.kernel.bundles[bundle].compileWebpack());
                } else {
                  promiseWebpack = this.kernel.bundles[bundle].compileWebpack();
                }
              }
            }
          }
        }
        if (promiseWebpack) {
          return resolve(promiseWebpack);
        } else {
          return reject(1);
        }
      });
    });

  }

}
module.exports = webpackCommand;