class React extends nodefony.Service {
  constructor(builder) {
    super("React Builder", builder.cli.container, builder.cli.notificationsCenter);
    this.builder = builder;
    this.inquirer = this.builder.cli.inquirer;
    this.cliVue = this.getCli();
  }

  getCli() {
    let cliPath = null;
    try {
      cliPath = path.resolve(__dirname, "..", "..", "..", "node_modules", ".bin", "create-react-app");
    } catch (e) {}
    try {
      cliPath = path.resolve(process.cwd(), "node_modules", ".bin", "create-react-app");
    } catch (e) {}
    try {
      cliPath = path.resolve(nodefony.autoloader, "node_modules", ".bin", "create-react-app");
    } catch (e) {}
    try {
      new nodefony.fileClass(cliPath);
    } catch (e) {
      throw new Error("React  create-react-app not found ");
    }
    return cliPath;
  }

}


module.exports = React;