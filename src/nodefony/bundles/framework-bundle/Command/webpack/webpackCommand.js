class webpackCommand extends nodefony.Command {
  constructor(cli, bundle) {
    super("webpack", cli, bundle);
  }

  showHelp(help = "") {
    help += `\t${this.cli.clc.green("webpack:dump")}\t Compile webpack for all bundles`;
    console.log(help);
    return help;
  }

  dump() {
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
        promiseWebpack.then(( /*err, stats*/ ) => {
          process.nextTick(() => {
            //this.terminate(0);
          });
        });
      } else {
        this.terminate(0);
      }
    });
  }

}
module.exports = webpackCommand;