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
        let promiseWebpack = [];
        try {
          for (let bundle in this.kernel.bundles) {
            if (this.kernel.isCore) {
              if (this.kernel.bundles[bundle].webpackCompiler) {
                promiseWebpack.push(this.kernel.bundles[bundle].compileWebpack());
              }
            } else {
              if (!this.kernel.isBundleCore(bundle)) {
                if (this.kernel.bundles[bundle].webpackCompiler) {
                  promiseWebpack.push(this.kernel.bundles[bundle].compileWebpack());
                }
              }
            }
          }
        } catch (e) {
          return reject(e);
        }
        return resolve(Promise.all(promiseWebpack));
      });
    });
  }
}
module.exports = webpackCommand;