const regController = /^(.*)Controller$/;

class generateController extends nodefony.Builder {

  constructor(cli, options = {}) {
    super(cli, cli.cmd, cli.args);
    this.skeletonController = path.resolve(this.globalSkeleton, "controller", "controllerClass.js");
    this.directory = "controller";
    this.bundle = this.kernel.getBundle("app");
    nodefony.extend(true, this.response, {
      addons: {
        annotations: true
      },
      directory: this.directory,
      bundle: this.bundle.name,
      controllerName: "defaultController",
      shortName:"default"
    }, options);
  }

  interaction( ) {
    return this.cli.prompt([{
        type: 'input',
        name: 'controllerName',
        default: (response) => {
          if (response.bundle === "Quit") {
            return Promise.reject("Quit");
          }
          return `${this.bundle.name}Controller`;
        },
        message: `Enter Controller Name : `,
        validate: (value, response) => {
          if (value) {
            try {
              this.checkName( value, response);
            } catch (e) {
              return e.message;
            }
            return true;
          }
          return `${value} Unauthorised Please enter a valid Controller name`;
        }
    }]);
  }

  setBundle(bundle){
    this.bundle = bundle ;
    this.response.bundle = bundle.name ;
  }

  createBuilder() {
    console.log(this.response);

  }

  createFile(name) {
    return {
      name: name + ".js",
      type: "file",
      skeleton: this.skeletonController,
      params: this.response
    };
  }

  checkName(name, response) {
    let res = regController.exec(name);
    this.shortName = null;
    if (res) {
      this.name = name;
      this.shortName = res[1];
      response.shortName = this.shortName ;
      response.directory = this.shortName ;
    } else {
      throw new Error("Bad controller name : " + name);
    }
  }


}

module.exports = generateController;
