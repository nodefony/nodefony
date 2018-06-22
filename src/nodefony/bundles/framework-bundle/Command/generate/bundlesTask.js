class bundlesTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.cli.config = this.getParameters("bundles.app");
    this.cli.configKernel = this.getParameters("kernel");
  }

  showHelp(help = "") {
    help += `\t${this.cli.clc.green("generate:bundle name [path]")}\t\t Generate a nodefony Bundle  Example : nodefony generate:bundle name ./src/bundles\n`;
    help += `\t${this.cli.clc.green("generate:bundle:angular name [path]")}\t Generate a Angular Bundle  Example : nodefony generate:bundle:angular name ./src/bundles\n`;
    help += `\t${this.cli.clc.green("generate:bundle:react name [path]")}\t Generate a React Bundle Example : nodefony generate:bundle:react name ./src/bundles`;
    console.log(help);
    return help;
  }

  nodefony(name, Path) {
    //console.log(arguments);
    if (!name) {
      throw new Error("No bundle name argument");
    }
    let bundle = null;
    try {
      bundle = new nodefony.builders.bundles.nodefony(this.cli, "js");
      let result = bundle.createBuilder(name, Path);
      bundle.build(result, bundle.location);
    } catch (e) {
      throw e;
    }
    return bundle.install().then(() => {
      this.cli.terminate(0);
    }).catch((e) => {
      this.logger(e, "ERROR");
      this.cli.terminate(0);
    });
  }

  angular(name, Path) {
    if (!name) {
      throw new Error("No bundle name argument");
    }
    let bundle = null;
    try {
      bundle = new nodefony.builders.bundles.angular(this.cli, "js");
      bundle.generateProject(name, Path, this.command.interactive).then((builder) => {
        builder.build(builder.createBuilder(), builder.location, true);
        builder.install();
        this.cli.terminate(0);
      });
    } catch (e) {
      throw e;
    }
  }

  react(name, Path) {
    if (!name) {
      throw new Error("No bundle name argument");
    }
    let bundle = null;
    try {
      bundle = new nodefony.builders.bundles.react(this.cli, "js");
      bundle.generateProject(name, Path, this.command.interactive).then((builder) => {
        builder.build(builder.createBuilder(), builder.location, true);
        builder.install();
        this.cli.terminate(0);
      });
    } catch (e) {
      throw e;
    }
  }

}

module.exports = bundlesTask;