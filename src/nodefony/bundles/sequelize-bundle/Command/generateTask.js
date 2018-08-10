class generateTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.orm = this.get("sequelize");
    this.builder = new nodefony.Builder(this.cli);
    this.connectionsSettings = [];
    this.connections = [];
    this.bundles = this.getBundles();
    this.location = path.resolve("Entity");
    this.skeleton = path.resolve(__dirname, "skeletons", "entity.skeleton");
    this.dataType = this.orm.engine.DataTypes;
    this.types = [];
    this.models = [];
  }

  showHelp() {
    this.setHelp("sequelize:generate:entity name bundle connector",
      "Generate Sequelize Entity"
    );
  }

  getBundle(name) {
    let bundle = this.kernel.getBundle(name);
    if (bundle) {
      return bundle;
    }
    throw new Error(`Bundle: ${name} not found`);
  }

  getBundles() {
    let bundles = [];
    let allBundles = this.kernel.getBundles();
    for (let bundle in allBundles) {
      if (!this.kernel.isBundleCore(allBundles[bundle].name)) {
        bundles.push(allBundles[bundle].name);
      }
    }
    return bundles;
  }

  getConnections() {
    let connections = this.orm.getConnections();
    let tab = [];
    for (let connection in connections) {
      tab.push(connection.name);
    }
    return tab;
  }

  getConnection(name) {
    return this.orm.getConnection(name);
  }

  checkEntity(name) {
    const regEntity = /^(.+)Entity$/;
    let ret = regEntity.exec(name);
    if (!ret) {
      this.entityName = name;
    } else {
      this.entityName = ret[1];
    }
    ret = this.orm.getEntity(this.entityName);
    if (ret) {
      throw new Error(`Entity ${this.entityName} already exist !`);
    }
  }

  interaction( /*args*/ ) {
    return this.cli.showAsciify(this.name)
      .then(() => {
        return this.cli.prompt([{
          type: 'list',
          name: 'bundle',
          message: 'Choose a bundle to generate a Service : ',
          default: 0,
          pageSize: this.bundles.length,
          choices: this.bundles,
          filter: (val) => {
            if (val === "Quit") {
              return Promise.reject("Quit");
            }
            return this.getBundle(val);
          }
        }, {
          type: 'list',
          name: 'connection',
          message: () => {
            this.orm.getConnectorSettings(this.connectionsSettings);
            this.connectionsSettings.map((ele) => {
              this.connections.push(ele[0]);
            });
            this.orm.displayTable("INFO");
            return 'Choose Connector to use : ';
          },
          default: 0,
          pageSize: this.connections.length,
          choices: this.connections,
          filter: (val) => {
            if (val === "Quit") {
              return Promise.reject("Quit");
            }

            let connection = this.getConnection(val);
            return connection;
          }
        }, {
          type: 'input',
          name: 'name',
          message: (response) => {
            this.dialect = response.connection.options.dialect;
            for (let type in this.dataType[this.dialect]) {
              this.types.push(type);
            }
            return `Enter Entity Name : `;
          },
          validate: (value /*, response*/ ) => {
            if (value) {
              try {
                this.checkEntity(value);
              } catch (e) {
                return e.message;
              }
              return true;
            }
            return `${value} Unauthorised Please enter a valid Entity Name`;
          }
        }, {
          type: 'input',
          name: 'name_mapping',
          message: `Enter Name to mappings between a model and a table: `,
          validate: ( /*value , response*/ ) => {
            return true;
          },
          filter: (val) => {
            return this.createModel(val);
          }
        }]);
      });
  }

  generate(args, response) {
    return this.createClassEntity(response);
  }

  createModel(name) {
    this.logger(name);
    return this.cli.prompt([{
      type: 'input',
      name: 'column_mapping',
      message: `Mapping Define <${name}> Enter column Name: `,
      validate: ( /*value , response*/ ) => {
        return true;
      }
    }, {
      type: 'list',
      name: 'type',
      message: `Add Mappings Type`,
      default: 0,
      pageSize: this.types.length,
      choices: this.types,
      filter: (val) => {
        if (val === "quit") {
          return Promise.resolve();
        }
        return val;
      }
    }]);
  }

  createClassEntity(response) {
    this.location = path.resolve(response.bundle.path, "Entity");
    response.name = this.entityName;
    try {
      let Path = path.resolve(this.location, `${this.entityName}Entity.js`);
      if (this.models.length) {
        response.models = this.models;
      } else {
        response.models = "{}";
      }
      response.entityPath = Path;
      return this.builder.createFile(Path, this.skeleton, true, response);
    } catch (e) {
      throw e;
    }
  }

}

module.exports = generateTask;