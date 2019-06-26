const regController = /^(.*)Controller$/;

class generateController extends nodefony.Builder {

  constructor(cli, options = {}) {
    super(cli, cli.cmd, cli.args);
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
    //console.log(this.response)
    //console.log(this.bundle.bundleName)
    this.response.bundleName = this.bundle.bundleName ;
    this.setLocation(path.resolve(bundle.path, "controller"));
  }

  createBuilder() {
    this.buildFront(this.response, this.bundle.path);
    return this.Front.generateController(this.response.directory);
  }

  checkName(name, response) {
    let res = regController.exec(name);
    this.shortName = null;
    if (res) {
      this.name = name;
      this.shortName = res[1];
      response.name = this.shortName ;
      response.shortName = this.shortName ;
      response.directory = this.shortName ;
    } else {
      throw new Error("Bad controller name : " + name);
    }
  }


}

module.exports = generateController;
