class webpackCommand extends nodefony.Command {
  constructor(cli, bundle) {
    super("webpack", cli, bundle);
    this.webpackService = this.get("webpack");
  }

  showHelp() {
    this.setHelp("webpack:dump",
      "Compile webpack for all bundles"
    );
  }

  dump() {
    return this.webpackService.compile();
  }

}
module.exports = webpackCommand;
