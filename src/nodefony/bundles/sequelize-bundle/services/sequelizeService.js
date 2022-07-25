//const cls = require('cls-hooked');
//const namespace = cls.createNamespace('nodefony');
nodefony.Sequelize = require('sequelize');
const {
  Sequelize
} = nodefony.Sequelize;
//Sequelize.useCLS(namespace);
const {
  JsonSchemaManager,
  OpenApi3Strategy
} = require('@alt3/sequelize-to-json-schemas');

const myerror = function (err) {
  if (this.state !== "DISCONNECTED") {
    this.orm.kernel.fire('onError', err, this);
  }
  this.log(err, "ERROR");
  this.log(this.settings, "INFO", `CONFIGURATION Sequelize ${this.name}`);
  if (err.code) {
    switch (err.code) {
    case 'PROTOCOL_CONNECTION_LOST':
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

/*const Op = Sequelize.Op;
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

  constructor(name, type, options, orm) {
    this.state = "DISCONNECTED";
    this.name = name;
    this.type = type;
    this.db = null;
    this.orm = orm;
    this.intervalId = null;
    /*if (options.options) {
      options.options = nodefony.extend(true, {
        operatorsAliases: operatorsAliases
      }, options.options);
    }*/
    this.settings = options;
    this.connect(type, this.settings);
  }

  setConnection(db, config) {
    if (!db) {
      throw new Error("Cannot create class connection without db native");
    }
    this.db = db;
    /*this.db.afterDisconnect((connection)=>{
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
    this.log('Connection been established successfully Type : ' + this.type + " Database : " + config.dbname, severity);
  }

  getConnection() {
    return this.db;
  }

  connect(type, config) {
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
      }
      conn = new this.orm.engine(config.dbname, config.username, config.password, config.options);
      process.nextTick(() => {
        conn
          .authenticate()
          .then(() => {
            this.setConnection(conn, config);
          })
          .catch(err => {
            this.log('Unable to connect to the database : ' + err, "ERROR");
            myerror.call(this, err);
            this.orm.fire('onErrorConnection', this.name, conn, this.orm);
          });
      });
    } catch (err) {
      myerror.call(this, err);
      this.orm.fire('onErrorConnection', this.name, conn, this.orm);
    }
    return conn;
  }

  log(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = `CONNECTION Sequelize ${this.name}`;
    }
    return this.orm.log(pci, severity, msgid, msg);
  }
}

/*
 *
 * CLASS SERVICE sequelize
 *
 */
class sequelize extends nodefony.Orm {

  constructor(container, kernel, autoLoader) {
    super("sequelize", container, kernel, autoLoader);
    this.engine = Sequelize;
    this.boot();
  }

  static isError(error) {
    return error instanceof Sequelize.Error;
  }

  static errorToString(error) {
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
      case "SequelizeInstanceError":
        let parser = "";
        if (error.errors && error.errors.length) {
          error.errors.map((ele) => {
            parser += `\n\tfield ${ele.path} : ${ele.message}`;
          });
        }
        return ` ${clc.red(error.message)}
            ${clc.blue("Name :")} ${error.name}
            ${clc.blue("Type :")} ${error.errorType}
            ${clc.red("Message :")} ${error.message}
            ${clc.red("fields :")} ${error.fields}
            ${clc.red("errors :")} ${parser}
            ${clc.green("Stack :")} ${error.stack}`;
      default:
        return `${clc.red(error.message)}`;
      }
    }
    return ` ${error.message}
      ${clc.blue("Name :")} ${error.name}
      ${clc.blue("Type :")} ${error.errorType}`;
  }

  boot() {
    super.boot();
    this.kernel.once('onBoot', async ( /*kernel*/ ) => {
      this.settings = this.getParameters("bundles.sequelize");
      this.debug = this.settings.debug;
      if (this.settings.connectors && Object.keys(this.settings.connectors).length) {
        for (let name in this.settings.connectors) {
          this.createConnection(name, this.settings.connectors[name]);
        }
      } else {
        process.nextTick(() => {
          this.log('onOrmReady', "DEBUG", "EVENTS SEQUELIZE");
          this.fire('onOrmReady', this);
          this.ready = true;
        });
      }
    });

    this.kernel.once("onReady", async () => {
      if (this.kernel.type === "SERVER") {
        this.displayTable("INFO");
      } else {
        this.displayTable();
      }
    });
  }

  getConnectorSettings(tab) {
    for (let dbname in this.settings.connectors) {
      let conn = ["", "", "", "", ""];
      conn[0] = dbname;
      for (let data in this.settings.connectors[dbname]) {
        switch (data) {
        case "dbname":
          conn[2] = this.settings.connectors[dbname][data];
          break;
        case "options":
          conn[1] = this.settings.connectors[dbname][data].dialect;
          if (this.settings.connectors[dbname][data].host) {
            conn[3] = this.settings.connectors[dbname][data].host + ":" + this.settings.connectors[dbname][data].port;
          }
          break;
        }
      }
      if (this.connections[dbname]) {
        conn[4] = (this.connections[dbname].state);
      }
      tab.push(conn);
    }
    return tab;
  }

  displayTable(severity = "DEBUG") {
    let options = {
      head: [
        "CONNECTOR NAME",
        "DRIVER",
        "NAME DATABASE",
        "HOST",
        "status"
      ]
    };
    let table = this.kernel.cli.displayTable(null, options);
    this.getConnectorSettings(table);

    let res = table.toString();
    this.log("ORM CONNECTORS LIST  : \n" + res, severity);
    return res;
  }

  createConnection(name, config) {
    try {
      return this.connections[name] = new connectionDB(name, config.driver, config, this);
    } catch (e) {
      throw e;
    }
  }

  getConnection(connector){
    return this.connections[connector] || null;
  }

  getTransactionConnector(connector){
    let connection = this.getConnection(connector);
    if( connection){
      let db = connection.getConnection();
      return db.transaction.bind(db);
    }
    throw new error(`transaction not found for CONNECTOR : ${name}`);
  }

  async startTransaction(entityName, options) {
    const entity = this.getNodefonyEntity(entityName);
    if (!entity) {
      throw new Error(`Entity : ${entityName} not found`);
    }
    let db = entity.db;
    return await db.transaction.call(db, options);
  }

  getTransaction(entityName) {
    const entity = this.getNodefonyEntity(entityName);
    if (!entity) {
      throw new Error(`Entity : ${entityName} not found`);
    }
    let db = entity.db;
    return db.transaction.bind(db);
  }

  getOpenApiSchema(entity) {
    try {
      const schemaManager = new JsonSchemaManager();
      const schema = schemaManager.generate(entity, new OpenApi3Strategy());
      return schema;
    } catch (e) {
      throw e;
    }
  }

  getConnectorsList(name=null){
    let obj = {};
    for (let ele in this.connections) {
      if( name){
        if( name !== ele){
          continue;
        }
      }
      obj[ele] = this.connections[ele];
      delete obj[ele].orm;
      delete obj[ele].db;
      delete obj[ele].intervalId;
    }
    return obj;
  }

  parseAtribute(attributes) {
    const obj = {};
    for (let attr in attributes) {
      obj[attr] = {
        fieldName: attributes[attr].fieldName,
        field: attributes[attr].field,
        defaultValue: attributes[attr].defaultValue,
        type:attributes[attr].type.toString()
      };
    }
    return obj;
  }

  getEntitiesList(bundle=null, name=null){
    let obj = {};
    for (let ele in this.entities) {
      if( bundle){
          if( bundle !== this.entities[ele].bundle.name){
            continue;
          }
      }
      if( name){
        if( name !== ele){
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

  /*getOpenApiSchema(entity) {
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
