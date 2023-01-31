class generateTask extends nodefony.Task {
  constructor (name, command) {
    super(name, command);
    this.orm = this.get("sequelize");
    this.builder = new nodefony.Builder(this.cli);
    this.connectionsSettings = [];
    this.connections = [];
    this.umzug = this.get("umzug");
    this.bundles = this.getBundles();
    this.location = path.resolve("Entity", "sequelize");
    this.skeleton = path.resolve(__dirname, "skeletons", "entity.skeleton.js");
    this.skeletonMigrate = path.resolve(__dirname, "skeletons", "migrateEntity.skeleton.js");
    this.dataType = this.orm.engine.DataTypes;
    this.types = [];
    this.models = [];
  }

  showHelp () {
    this.setHelp(
      "sequelize:generate:entity name bundle connector",
      "Generate Sequelize Entity"
    );
  }

  entity () {
    return this.run();
  }

  getBundle (name) {
    const bundle = this.kernel.getBundle(name);
    if (bundle) {
      return bundle;
    }
    throw new Error(`Bundle: ${name} not found`);
  }

  getBundles () {
    const bundles = [];
    const allBundles = this.kernel.getBundles();
    for (const bundle in allBundles) {
      if (!this.kernel.isBundleCore(allBundles[bundle].name)) {
        bundles.push(allBundles[bundle].name);
      }
    }
    return bundles;
  }

  getConnections () {
    const connections = this.orm.getConnections();
    const tab = [];
    for (const connection in connections) {
      tab.push(connection.name);
    }
    return tab;
  }

  getConnection (name) {
    return this.orm.getConnection(name);
  }

  checkEntity (name) {
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

  interaction (/* args*/) {
    return this.cli.showAsciify(this.name)
      .then(() => this.cli.prompt([{
        type: "list",
        name: "bundle",
        message: () => {
          this.orm.getEntityTable("INFO");
          return "Choose a bundle to generate an Entity : ";
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
        type: "list",
        name: "connection",
        message: () => {
          this.orm.getConnectorSettings(this.connectionsSettings);
          this.connectionsSettings.map((ele) => {
            this.connections.push(ele[0]);
          });
          this.orm.displayTable("INFO");
          return "Choose Connector to use : ";
        },
        default: 0,
        pageSize: this.connections.length,
        choices: this.connections,
        filter: (val) => {
          if (val === "Quit") {
            return Promise.reject("Quit");
          }
          const connection = this.getConnection(val);
          this.connector = val;
          return connection;
        }
      }, {
        type: "input",
        name: "name",
        message: (response) => "Enter Entity Name : ",
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
        type: "confirm",
        name: "migrate",
        message: "Do you want define migrate model ?",
        default: true
      }, {
        type: "confirm",
        name: "column_generate",
        message: "Do you want define model ?",
        default: true
      }]))
      .then((response) => {
        response.connector = this.connector;
        this.dialect = response.connection.settings.options.dialect;
        for (const type in this.dataType[this.dialect]) {
          this.types.push(type);
        }
        if (response.column_generate) {
          return this.createModel(response)
            .then((myresponse) => nodefony.extend(this.cli.response, response, myresponse));
        }
        return nodefony.extend(this.cli.response, response);
      })
      .catch((e) => Promise.reject(e));
  }

  generate (args, response) {
    return this.createClassEntity(response);
  }

  createModel (response) {
    const {name} = response;
    return this.cli.prompt([{
      type: "input",
      name: "column_mapping",
      message: `Mapping Define Model <${name}> Enter column Name: `,
      validate: (value, response) => true
    }, {
      type: "list",
      name: "type",
      message: "Add Mappings Type",
      default: 0,
      pageSize: this.types.length,
      choices: this.types,
      filter: (value) => value
    }])
      .then((myresponse) => {
        this.models[myresponse.column_mapping] = {
          name: myresponse.column_mapping
        };
        this.models.push(this.models[myresponse.column_mapping]);
        this.models[myresponse.column_mapping].type = myresponse.type;
        return this.cli.prompt([{
          type: "confirm",
          message: `Model <${name}> Do you want to define other column `,
          name: "column_generate",
          default: true
        }])
          .then((confirm) => {
            if (confirm.column_generate) {
              return this.createModel(response);
            }
            return response;
          });
      });
  }

  async createClassEntity (response) {
    this.location = path.resolve(response.bundle.path, "Entity", "sequelize");
    response.name = this.entityName;
    try {
      const Path = path.resolve(this.location, `${this.entityName}Entity.js`);
      response.models = this.parseColumns(this.models, response.migrate);
      response.entityPath = Path;
      const fileEntity = this.builder.createFile(Path, this.skeleton, true, response);
      if (response.migrate) {
        await this.createMigration(response)
          .catch((e) => {
            this.log(e, "ERROR");
          });
      }
      return fileEntity;
    } catch (e) {
      throw e;
    }
  }

  parseColumns (models, migrate) {
    if (!models.length) {
      return `{
          createdAt: {
            allowNull: false,
            type: DataTypes.DATE
          },
          updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
          }
        }`;
    }
    let obj = "\t{\n";
    models.map((ele, index) => {
      obj += `\t\t${ele.name}: {\n`;
      if (ele.type) {
        obj += `\t\t  type: DataTypes.${ele.type}\n`;
      }
      obj += "\t\t}";
      if (models.length !== 1 && index + 1 !== models.length) {
        obj += ",\n";
      } else {
        if (migrate) {
          obj += ",\n";
          obj += `\t\tcreatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }`;
        }
        obj += "\n";
      }
    });
    return obj += "\t}";
  }

  async createMigration (response) {
    const fileMigrate = `entity-${response.name}.js`;
    return await this.umzug.create(response.connector, fileMigrate, {
      // allowConfusingOrdering:true
    }, {
      path: this.skeletonMigrate,
      data: response
    })
      .catch((e) => {
        throw e;
      });
  }
}

module.exports = generateTask;
