class React extends nodefony.builders.sandbox {
  constructor(cli, cmd, args) {
    super(cli, cmd, args, {
      addons: {
        webpack: false
      }
    });
    this.pathSkeleton = path.resolve(__dirname, "skeletons");
    this.cliReact = this.getCli();
  }

  run() {
    return super.run(false);
  }

  generate(response, force) {
    return this.buiReact()
      .then((dir) => {
        return this.ejectReact(dir, this.cli.response)
          .then(() => {
            return super.generate(response, force)
              .then(() => {
                return response;
              });
          })
          .catch((e) => {
            throw e;
          });
      });
  }

  buiReact() {
    let name = null;
    let location = null;
    switch (this.cli.response.command) {
      case "project":
        name = "app";
        location = this.location ;
        break;
      case "bundle":
        name = this.cli.response.bundleName;
        location = this.cli.response.location;
        break;
    }
    return new Promise((resolve, reject) => {
      //console.log(this.bundleName)
      let args = [name];
      this.logger("install React cli : create-react-app " + args.join(" "));
      let cmd = null;
      try {
        cmd = this.cli.spawn(this.cliReact, args, {
          cwd: location,
          stdio: "inherit"
        }, (code) => {
          if (code === 1) {
            //.cleanTmp();
            return reject(new Error("install React cli  create-react-app new error : " + code));
          }
          return resolve(path.resolve(this.location, name));
        });
      } catch (e) {
        this.logger(e, "ERROR");
        //this.cleanTmp();
        return reject(e);
      }
    });
  }

  ejectReact(dir, response) {
    return new Promise((resolve, reject) => {
      let args = ['run', 'eject'];
      this.logger(" eject  webpack config React : " + args.join(" "));
      try {
        return this.cli.packageManager(args, dir)
          .then(() => {
            /*try {
              this.moveToRealPath();
            } catch (e) {
              this.cleanTmp();
              return reject(e);
            }*/
            return resolve(path.resolve(this.location, response.name));
          })
          .catch((error) => {
            //this.cleanTmp();
            return reject(new Error("React eject error : " + error));
          });
      } catch (e) {
        //this.cleanTmp();
        this.logger("React eject ", "ERROR");
        return reject(e);
      }
    });
  }

  getCli() {
    let cliPath = null;
    try {
      cliPath = path.resolve(__dirname, "..", "..", "..", "node_modules", ".bin", "create-react-app");
      new nodefony.fileClass(cliPath);
      return cliPath;
    } catch (e) {}
    try {
      cliPath = path.resolve(process.cwd(), "node_modules", ".bin", "create-react-app");
      new nodefony.fileClass(cliPath);
      return cliPath;
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
nodefony.builders.react = React;
module.exports = React;
