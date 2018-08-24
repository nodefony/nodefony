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
          message: () => {
            this.orm.getEntityTable("INFO");
            return 'Choose a bundle to generate a Service : ';
          },
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
            this.connector = val;
            return connection;
          }
        }, {
          type: 'input',
          name: 'name',
          message: (response) => {
            return `Enter Entity Name : `;
          },
          filter: (value) => {
            if (value) {
              try {
                this.checkEntity(value);
                return value;
              } catch (e) {
                return e.message;
              }
            }
            return `${value} Unauthorised Please enter a valid Entity Name`;
          }
        }, {
          type: 'confirm',
          name: 'column_generate',
          message: `Do you want define model ?`,
          default: false
        }]);
      }).then((response) => {
        response.connector = this.connector;
        this.dialect = response.connection.options.dialect;
        for (let type in this.dataType[this.dialect]) {
          this.types.push(type);
        }
        if (response.column_generate) {
          return this.createModel(response)
            .then((myresponse) => {
              return nodefony.extend(this.cli.response, response, myresponse);
            });
        }
        return nodefony.extend(this.cli.response, response);
      }).catch((e) => {
        return Promise.reject(e);
      });
  }

  generate(args, response) {
    return this.createClassEntity(response);
  }

  createModel(response) {
    let name = response.name;
    return this.cli.prompt([{
        type: 'input',
        name: 'column_mapping',
        message: `Mapping Define Model <${name}> Enter column Name: `,
        validate: (value, response) => {
          return true;
        }
      }, {
        type: 'list',
        name: 'type',
        message: `Add Mappings Type`,
        default: 0,
        pageSize: this.types.length,
        choices: this.types,
        filter: (value) => {
          return value;
        }
      }])
      .then((myresponse) => {
        this.models[myresponse.column_mapping] = {
          name: myresponse.column_mapping
        };
        this.models.push(this.models[myresponse.column_mapping]);
        this.models[myresponse.column_mapping].type = myresponse.type;
        return this.cli.prompt([{
            type: 'confirm',
            message: `Model <${name}> Do you want to define other column `,
            name: 'column_generate',
            default: false
          }])
          .then((confirm) => {
            if (confirm.column_generate) {
              return this.createModel(response);
            }
            return response;
          });
      });
  }

  createClassEntity(response) {
    this.location = path.resolve(response.bundle.path, "Entity");
    response.name = this.entityName;
    try {
      let Path = path.resolve(this.location, `${this.entityName}Entity.js`);
      if (this.models.length) {
        let obj = "{\n";
        this.models.map((ele, index) => {
          obj += `    ${ele.name}: {\n`;
          if (ele.type) {
            obj += `      type: Sequelize.${ele.type}\n`;
          }
          obj += `    }`;
          if (this.models.length !== 1 && index + 1 !== this.models.length) {
            obj += ",\n";
          } else {
            obj += "\n";
          }
        });
        obj += "}";
        response.models = obj;
      } else {
        response.models = JSON.stringify({});
      }

      response.entityPath = Path;
      return this.builder.createFile(Path, this.skeleton, true, response);
    } catch (e) {
      throw e;
    }
  }
}

module.exports = generateTask;