class Vue extends nodefony.Service {
  constructor(builder, bundle = "app", cwd = process.cwd()) {
    super("Vue Builder", builder.cli.container, builder.cli.notificationsCenter);
    this.builder = builder;
    this.cli = builder.cli;
    this.inquirer = this.builder.cli.inquirer;
    this.cliVue = this.getCli();
    this.bundleName = bundle;
    this.location = cwd;
  }

  getCli() {
    let cliPath = null;
    try {
      cliPath = path.resolve(__dirname, "..", "..", "..", "node_modules", ".bin", "vue");
    } catch (e) {}
    try {
      cliPath = path.resolve(process.cwd(), "node_modules", ".bin", "vue");
    } catch (e) {}
    try {
      cliPath = path.resolve(nodefony.autoloader, "node_modules", ".bin", "vue");
    } catch (e) {}
    try {
      new nodefony.fileClass(cliPath);
    } catch (e) {
      throw new Error("Vue.js CLI not found ");
    }
    return cliPath;
  }

  setEnv() {
    process.env.NODE_ENV = "development";
  }

  generateProject( /*argv*/ ) {
    return new Promise((resolve, reject) => {
      let args = ["create", this.bundleName];
      this.logger("install Vue cli : vue " + args.join(" "));
      let cmd = null;
      try {
        cmd = this.cli.spawn(this.cliVue, args, {
          cwd: this.location,
          stdio: "inherit"
        }, (code) => {
          if (code === 1) {
            this.cleanTmp();
            return reject(new Error("install Vue cli new error : " + code));
          }
          return resolve(path.resolve(this.location, this.bundleName));
        });
      } catch (e) {
        this.logger(e, "ERROR");
        this.cleanTmp();
        return reject(e);
      }
    });
  }

  createBuilder() {

  }

  cleanTmp() {

  }

}


module.exports = Vue;