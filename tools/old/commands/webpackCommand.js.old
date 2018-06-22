module.exports = nodefony.registerCommand("webpack", function () {


  const webpack = class webpack extends nodefony.cliKernel {

    constructor(container, command, options) {

      super("webpack", container, container.get("notificationsCenter"), options);

      this.config = this.container.getParameters("bundles.app");
      this.configKernel = this.container.getParameters("kernel");
      let cmd = command[0].split(":");
      switch (cmd[1]) {
      case "dump":
        try {
          this.webpackCompile();
        } catch (e) {
          this.terminate(1);
          return;
        }
        break;
      default:
        this.showHelp();
        this.terminate(0);
      }
    }

    webpackCompile() {
      this.listen(this, "onReady", () => {
        let promiseWebpack = null;
        for (let bundle in this.kernel.bundles) {
          if (this.kernel.bundles[bundle].webpackCompiler) {
            if (promiseWebpack) {
              promiseWebpack.then(this.kernel.bundles[bundle].compileWebpack());
            } else {
              promiseWebpack = this.kernel.bundles[bundle].compileWebpack();
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
  };

  return {

    name: "webpack",
    commands: {
      dump: ["webpack:dump", "Compile webpack for all bundles "]
    },
    cli: webpack
  };
});