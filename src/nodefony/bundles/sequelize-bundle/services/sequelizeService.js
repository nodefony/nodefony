// const cls = require('cls-hooked');
// const namespace = cls.createNamespace('nodefony');
nodefony.Sequelize = require("sequelize");
const {
  Sequelize
} = nodefony.Sequelize;
// Sequelize.useCLS(namespace);
const {
  JsonSchemaManager,
  OpenApi3Strategy
} = require("@alt3/sequelize-to-json-schemas");

const myerror = function myerror (err) {
  if (this.state !== "DISCONNECTED") {
    this.orm.kernel.fire("onError", err, this);
  }
  // this.log(err, "ERROR");
  // this.log(this.settings, "INFO", `CONFIGURATION Sequelize ${this.name}`);
  if (err.code) {
    switch (err.code) {
    case "PROTOCOL_CONNECTION_LOST":
    case "ECONNREFUSED":
      this.state = "DISCONNECTED";
      return {
        status: 500,
        code: err.code,
        message: err.message
      };
    default:
      return err;
    }
  } else {
    return err;
  }
};

/* const Op = Sequelize.Op;
const operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col
};*/

/*
 *
 * CLASS LIBRARY CONNECTION
 *
 */
class connectionDB {
  constructor (name, type, options, orm) {
    this.state = "DISCONNECTED";
    this.name = name;
    this.type = type;
    this.db = null;
    this.orm = orm;
    this.intervalId = null;
    this.settings = options;
  }

  async close () {
    if (this.db) {
      this.log(`Close connection ${this.name}`);
      return await this.db.close()
        .catch((e) => {
          this.log(e, "ERROR");
          throw e;
        });
    }
    return Promise.resolve();
  }

  toObject () {
    return {
      state: this.state,
      name: this.name,
      type: this.type,
      settings: this.settings
    };
  }

  setConnection (db, config) {
    if (!db) {
      throw new Error("Cannot create class connection without db native");
    }
    this.db = db;

    /* this.db.afterDisconnect((connection)=>{
      this.log(connection,"WARNING");
    });
    this.db.beforeConnect((config)=>{
      this.log(config, "WARNING");
    });*/
    this.orm.fire("onConnect", this.name, this.db);
    this.state = "CONNECTED";
    let severity = "INFO";
    if (this.orm.kernel.type === "CONSOLE") {
      severity = "DEBUG";
    }
    this.log(`Connection been established successfully Type : ${this.type} Database : ${config.dbname}`, severity);
    return db;
  }

  getConnection () {
    return this.db;
  }

  async connect (type, config) {
    if (this.orm.debug) {
      config.options.logging = (value) => {
        this.log(value, "INFO");
      };
    } else {
      config.options.logging = false;
    }
    let conn = null;
    try {
      switch (type) {
      case "sqlite":
        config.options.storage = path.resolve(config.dbname);
        break;
      default:
      }
      let {username} = config;
      let {password} = config;
      try {
        if (config.credentials && nodefony.typeOf(config.credentials) === "function") {
          this.log("Try Get Credentials (async method)");
          const auth = await config.credentials(this)
            .catch((e) => {
              throw e;
            });
          if (auth.username) {
            this.log(`Add username Credential for connector ${this.name}`);
            username = auth.username;
          } else {
            this.log("Credentials (async method) no username secret", "WARNING");
          }
          if (auth.password) {
            this.log(`Add password Credential for connector ${this.name}`);
            password = auth.password;
          } else {
            this.log("Credentials (async method) no password secret", "WARNING");
          }
          this.log(`Success Credential (async method) ${auth}`, "DEBUG");
        }
      } catch (e) {
        this.log(e, "WARNING");
      }
      this.log("Try Connect engine database", "DEBUG");
      // eslint-disable-next-line new-cap
      conn = new this.orm.engine(config.dbname, username, password, config.options);
      // process.nextTick(() => {
      return conn
        .authenticate()
        .then(() => this.setConnection(conn, config))
        .catch((err) => {
          this.log(`Unable to connect to the database : ${err}`, "ERROR");
          myerror.call(this, err);
          this.orm.fire("onErrorConnection", this, err);
        });
      // });
    } catch (err) {
      myerror.call(this, err);
      this.orm.fire("onErrorConnection", this, err);
    }
    return conn;
  }

  log (pci, severity, msgid = `CONNECTION Sequelize ${this.name}`, msg = null) {
    return this.orm.log(pci, severity, msgid, msg);
  }
}

/*
 *
 * CLASS SERVICE sequelize
 *
 */
class sequelize extends nodefony.Orm {
  constructor (container, kernel, autoLoader) {
    super("sequelize", container, kernel, autoLoader);
    this.engine = Sequelize;
    this.strategy = "migrate";
    this.isAssociated = false;
    this.forceAssociated = false;
    this.kernel.once("onTerminate", async () => await this.closeConnections());
  }

  static isError (error) {
    return error instanceof Sequelize.Error;
  }

  static errorToString (error) {
    if (error.name) {
      switch (error.name) {
      case "SequelizeBaseError":
      case "SequelizeValidationError":
      case "SequelizeDatabaseError":
      case "SequelizeTimeoutError":
      case "SequelizeUniqueConstraintError":
      case "SequelizeForeignKeyConstraintError":
      case "SequelizeExclusionConstraintError":
      case "SequelizeConnectionError":
      case "SequelizeConnectionRefusedError":
      case "SequelizeAccessDeniedError":
      case "SequelizeHostNotFoundError":
      case "SequelizeHostNotReachableError":
      case "SequelizeInvalidConnectionError":
      case "SequelizeConnectionTimedOutError":
      case "SequelizeInstanceError": {
        let parser = "";
        if (error.errors && error.errors.length) {
          error.errors.map((ele) => {
            parser += `\n\tfield ${ele.path} : ${ele.message}`;
            return parser;
          });
        }
        return ` ${clc.red(error.message)}
            ${clc.blue("Name :")} ${error.name}
            ${clc.blue("Type :")} ${error.errorType}
            ${clc.red("Message :")} ${error.message}
            ${clc.red("fields :")} ${error.fields}
            ${clc.red("errors :")} ${parser}
            ${clc.green("Stack :")} ${error.stack}`;
      }
      default:
        return `${clc.red(error.message)}`;
      }
    }
    return ` ${error.message}
      ${clc.blue("Name :")} ${error.name}
      ${clc.blue("Type :")} ${error.errorType}`;
  }

  async closeConnections () {
    for (const connection in this.connections) {
      await this.connections[connection].close();
    }
  }

  boot () {
    return new Promise((resolve, reject) => {
      super.boot();

      this.kernel.once("onBoot", async (/* kernel*/) => {
        this.settings = this.getParameters("bundles.sequelize");
        this.debug = this.settings.debug;
        if (this.settings.strategy) {
          this.strategy = this.settings.strategy;
        }
        if (this.settings.connectors && Object.keys(this.settings.connectors).length) {
          for (const name in this.settings.connectors) {
            await this.createConnection(name, this.settings.connectors[name]);
          }
        } else {
          process.nextTick(async () => {
            this.log("onOrmReady", "DEBUG", "EVENTS SEQUELIZE");
            try {
              await this.fireAsync("onOrmReady", this);
              this.ready = true;
              return resolve(this);
            } catch (e) {
              this.log(e, "ERROR", "EVENTS onOrmReady");
              return reject(e);
            }
          });
        }
      });

      this.prependListener("onOrmReady", async () => {
        if (this.isAssociated && !this.forceAssociated) {
          return;
        }
        for (const entity in this.entities) {
          if (this.entities[entity].model && this.entities[entity].model.associate) {
            await this.entities[entity].model.associate(this.entities[entity].db.models);
            this.log(`ASSOCIATE model : ${this.entities[entity].model.name}`, "DEBUG");
          }
        }
        this.isAssociated = true;
      });

      this.kernel.once("onReady", () => {
        if (this.kernel.type === "SERVER") {
          this.displayTable("INFO");
        } else {
          this.displayTable();
        }
      });
    });
  }

  getConnectorSettings (tab) {
    for (const dbname in this.settings.connectors) {
      const conn = ["", "", "", "", ""];
      conn[0] = dbname;
      for (const data in this.settings.connectors[dbname]) {
        switch (data) {
        case "dbname":
          conn[2] = this.settings.connectors[dbname][data];
          break;
        case "options":
          conn[1] = this.settings.connectors[dbname][data].dialect;
          if (this.settings.connectors[dbname][data].host) {
            conn[3] = `${this.settings.connectors[dbname][data].host}:${this.settings.connectors[dbname][data].port}`;
          }
          break;
        default:
        }
      }
      if (this.connections[dbname]) {
        conn[4] = this.connections[dbname].state;
      }
      tab.push(conn);
    }
    return tab;
  }

  displayTable (severity = "DEBUG") {
    const options = {
      head: [
        "CONNECTOR NAME",
        "DRIVER",
        "NAME DATABASE",
        "HOST",
        "status"
      ]
    };
    const table = this.kernel.cli.displayTable(null, options);
    this.getConnectorSettings(table);

    const res = table.toString();
    this.log(`ORM CONNECTORS LIST  : \n${res}`, severity);
    return res;
  }

  async createConnection (name, config) {
    try {
      if (this.connections[name]) {
        delete this.connections[name];
      }
      // eslint-disable-next-line new-cap
      this.connections[name] = new connectionDB(name, config.driver, config, this);
    } catch (e) {
      throw e;
    }

    /* if (this.kernel.cli.command === "sequelize" && this.kernel.cli.task === "create") {
      return Promise.resolve();
    }*/
    return await this.connections[name].connect(config.driver, config)
      .catch((e) => {
        throw e;
      });
  }

  getConnection (connector) {
    return this.connections[connector] || null;
  }

  getTransactionConnector (connector) {
    const connection = this.getConnection(connector);
    if (connection) {
      const db = connection.getConnection();
      return db.transaction.bind(db);
    }
    throw new Error(`transaction not found for CONNECTOR : ${name}`);
  }

  async startTransaction (entityName, options) {
    const entity = this.getNodefonyEntity(entityName);
    if (!entity) {
      throw new Error(`Entity : ${entityName} not found`);
    }
    const {db} = entity;
    return await db.transaction(options);
  }

  getTransaction (entityName) {
    const entity = this.getNodefonyEntity(entityName);
    if (!entity) {
      throw new Error(`Entity : ${entityName} not found`);
    }
    const {db} = entity;
    return db.transaction.bind(db);
  }

  getOpenApiSchema (entity) {
    try {
      const schemaManager = new JsonSchemaManager();
      const schema = schemaManager.generate(entity, new OpenApi3Strategy());
      return schema;
    } catch (e) {
      throw e;
    }
  }

  getConnectorsList (name = null) {
    const obj = {};
    for (const ele in this.connections) {
      if (name) {
        if (name !== ele) {
          continue;
        }
      }
      obj[ele] = this.connections[ele].toObject();
    }
    return obj;
  }

  parseAtribute (attributes) {
    const obj = {};
    for (const attr in attributes) {
      let type = null;
      try {
        type = attributes[attr].type.toString();
      } catch (e) {
        type = attributes[attr].type.values;
      }
      obj[attr] = {
        fieldName: attributes[attr].fieldName,
        field: attributes[attr].field,
        defaultValue: attributes[attr].defaultValue,
        type
      };
    }
    return obj;
  }

  getEntitiesList (bundle = null, name = null) {
    const obj = {};
    for (const ele in this.entities) {
      if (bundle) {
        if (bundle !== this.entities[ele].bundle.name) {
          continue;
        }
      }
      if (name) {
        if (name !== ele) {
          continue;
        }
      }
      obj[ele] = {};
      obj[ele].name = this.entities[ele].name;
      obj[ele].attributes = this.parseAtribute(this.entities[ele].model.getAttributes());
      obj[ele].tableName = this.entities[ele].model.getTableName();
      obj[ele].connectorName = this.entities[ele].connectionName;
      obj[ele].bundleName = this.entities[ele].bundle.name;
      obj[ele].schema = this.getOpenApiSchema(this.entities[ele].model);
    }
    return obj;
  }

  /* getOpenApiSchema(entity) {
    let attr = {
      type: "object",
      properties: {},
      required: []
    };
    const attributes = entity.rawAttributes || {};
    for (let ele in attributes) {
      let prop = attr.properties[ele] = {};
      if (attributes[ele].allowNull === false && !attributes[ele]._autoGenerated) {
        attr.required.push(ele);
      }
      if (!nodefony.isUndefined(attributes[ele].defaultValue)) {
        prop.default = attributes[ele].defaultValue;
      }
      switch (attributes[ele].type.constructor.name) {
        case "STRING":
          prop.type = "string";
          if (attributes[ele].type._binary) {
            prop.format = "binary";
          }
          break;
        case "INTEGER":
          prop.type = "integer";
          prop.format = "int32";
          break;
        case "BIGINT":
          prop.type = "integer";
          prop.format = "int64";
          break;
        case "FLOAT":
        case "REAL":
          prop.type = "number";
          prop.format = "float";
          break;
        case "DOUBLE":
          prop.type = "number";
          prop.format = "double";
          break;
        case "JSONTYPE":
          prop.type = "array";
          break;
        case 'BOOLEAN':
          prop.type = "boolean";
          break;
        case "DATE":
        case "DATEONLY":
          prop.type = "string";
          prop.format = "date";
          break;
        default:
          prop.type = "string";
          prop.format = attributes[ele].instance;
      }
    }
    return attr;
  }*/
}

nodefony.sequelize = sequelize;
module.exports = sequelize;
