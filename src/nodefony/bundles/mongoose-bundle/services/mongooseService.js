/**
 *   SERVIVE Mongoose
 */
const Mongoose = require('mongoose');
Mongoose.Promise = BlueBird;

const defaultconfigServer = {
  host: "localhost",
  port: 27017
};

const defaultConfigConnection = {
  socketTimeoutMS: 0,
  keepAlive: true,
  //useNewUrlParser: true,
  //replicaSet: 'rs'
};

class mongoose extends nodefony.Orm {

  constructor(container, kernel, autoLoader) {
    super("mongoose", container, kernel, autoLoader);
    this.engine = Mongoose;
    this.strategy = 'migrate'
  }

  static isError(error) {
    return error instanceof Mongoose.Error;
  }

  static errorToString(error) {
    return `${error.message}`;
  }

  boot() {
    super.boot();
    if (this.kernel.ready) {
      this.initialize()
      this.displayTable("INFO");
    } else {
      this.kernel.once("onBoot", async () => {
        this.initialize()
      });

      this.kernel.once("onReady", () => {
        this.displayTable("INFO");
      });
    }
  }

  initialize() {
    this.settings = nodefony.extend({}, defaultconfigServer, this.bundle.settings.mongoose);
    if (this.settings.strategy) {
      this.strategy = this.settings.strategy
    }
    if (this.settings.connectors && Object.keys(this.settings.connectors).length) {
      for (let name in this.settings.connectors) {
        this.createConnection(name, this.settings.connectors[name]);
      }
    } else {
      process.nextTick(() => {
        this.log('onOrmReady', "DEBUG", "EVENTS MOOGODB");
        this.fire('onOrmReady', this);
        this.ready = true;
      });
    }
  }

  createConnection(name, config) {
    if (!name) {
      throw new Error("Mongodb createConnnetion no name connection");
    }
    let host = config.host || this.settings.host;
    let port = config.port || this.settings.port;
    let url = `mongodb://${host}:${port}/${config.dbname}`;

    let settings = nodefony.extend(true, {}, defaultConfigConnection, config.settings);
    return this.engine.createConnection(url, settings).asPromise()
      .then((db) => {
        this.connections[name] = db;
        db.on('close', () => {
          this.closeConnetion(name, db);
        });
        db.on('reconnect', () => {
          this.log(`Reconnection to mongodb database ${name}`, 'INFO');
          this.fire('onReconnect', name, db);
          //this.createConnection(name, config);
          this.connections[name] = db;
        });
        db.on('timeout', () => {
          this.log(`Timeout to mongodb database ${name}`, 'INFO');
          this.fire('onTimeout', name, db);
        });
        db.on('parseError', (error) => {
          this.log(`ParseError on mongodb database ${name}`, 'ERROR');
          this.log(error, 'ERROR');
        });
        db.on('error', (error) => {
          this.log(`Error on mongodb database ${name}`, 'ERROR');
          this.log(error, 'ERROR');
        });
        db.on('reconnectFailed', (error) => {
          this.log(`Error on mongodb database reconnect Failed ${name}`, 'ERROR');
          this.log(error, 'ERROR');
        });
        db.on('disconnected', () => {
          this.log(`mongodb database disconnected ${name}`, 'WARNING');
        });
        this.fire("onConnect", name, db);
        //this.log("Connect to " + name + " : " + url);
        return db;
      }).catch(error => {
        this.log(`Cannot connect to mongodb ( ${host}:${port}/${config.dbname} )`, "ERROR");
        this.log(error, "ERROR");
      });
  }

  closeConnetion(name, connection) {
    if (!name) {
      throw new Error("Close connection no name connection !!");
    }
    this.fire('onClose', name, connection);
    this.log(`Close connection to mongodb database ${name}`, 'WARNING');
    if (this.connections[name]) {
      delete this.connections[name];
    }
  }

  displayTable(severity = "DEBUG") {
    let options = {
      head: [
        `${this.name.toUpperCase()} CONNECTIONS NAME`,
        "NAME DATABASE",
        "DRIVER",
        "URI"
      ]
    };
    let table = this.kernel.cli.displayTable(null, options);
    //let tab = [];
    for (let dbname in this.settings.connectors) {
      let conn = ["", "", "mongodb", ""];
      conn[0] = dbname;
      for (let data in this.settings.connectors[dbname]) {
        switch (data) {
          case "dbname":
            conn[1] = this.settings.connectors[dbname][data];
            break;
          case "host":
            conn[3] = this.settings.connectors[dbname][data];
            break;
          case "port":
            conn[3] += ":" + this.settings.connectors[dbname][data];
            break;
        }
      }
      table.push(conn);
    }
    if (this.kernel && this.kernel.type === "CONSOLE") {
      severity = "DEBUG";
    }
    this.log("ORM CONNECTORS LIST  : \n" + table.toString(), severity);
  }

  async startTransaction(entityName) {
    const entity = this.getNodefonyEntity(entityName);
    if (!entity) {
      throw new Error(`Entity : ${entityName} not found`);
    }
    let db = entity.db;
    const session = await db.startSession.call(db);
    await session.startTransaction()
    return session
  }

  async getTransaction(entityName) {
    const entity = this.getNodefonyEntity(entityName);
    if (!entity) {
      throw new Error(`Entity : ${entityName} not found`);
    }
    let db = entity.db;
    const session = await db.startSession.bind(db);
    await session.startTransaction()
    return session
  }

  getConnectorsList(name = null) {
    let obj = {}
    for (let ele in this.connections) {
      if (name) {
        if (name !== ele) {
          continue
        }
      }
      const conn = this.connections[ele];
      obj[ele] = {
        name: conn.name,
        type: 'mongodb',
        state: conn.states[conn._readyState],
        options: conn._connectionOptions
      }
      obj[ele].settings = {
        host: conn.host,
        port: conn.port,
        path: conn._connectionString
      }
    }
    return obj;
  }

  parseAtribute(attributes) {
    const obj = {}
    for (let attr in attributes) {
      if (attr === "__v") {
        continue
      }
      obj[attr] = {
        fieldName: attributes[attr].path,
        field: attributes[attr].path,
        defaultValue: attributes[attr].defaultValue,
        type: attributes[attr].instance
      }
    }
    return obj
  }

  getEntitiesList(bundle = null, name = null) {
    //console.log(this.entities, this.connections)
    let obj = {}
    for (let ele in this.entities) {
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
      obj[ele].attributes = this.parseAtribute(this.entities[ele].model.schema.paths);
      obj[ele].tableName = name; //this.entities[ele].model.getTableName();
      obj[ele].connectorName = this.entities[ele].connectionName;
      obj[ele].bundleName = this.entities[ele].bundle.name;
      obj[ele].schema = this.getOpenApiSchema(this.entities[ele].model);
    }
    return obj
  }

  getOpenApiSchema(entity) {
    let attr = {
      type: "object",
      properties: {},
      required: []
    };
    const attributes = entity.schema.paths || {};
    for (let ele in attributes) {
      let prop = attr.properties[ele] = {};
      if (attributes[ele].isRequired === true) {
        attr.required.push(ele);
      }
      if (!nodefony.isUndefined(attributes[ele].defaultValue)) {
        prop.default = attributes[ele].defaultValue;
      }
      switch (attributes[ele].instance) {
        case "String":
        case 'SchemaString':
        case 'SchemaBuffer':
        case 'SchemaObjectId':
        case 'ObjectId':
        case 'ObjectID':
        case 'SchemaDate':
          prop.type = "string";
          break;
        case 'Number':
        case 'SchemaNumber':
          prop.type = "number";
          break;
        case 'Mixed':
          prop.type = "object";
          break;
        case "Array":
        case 'DocumentArray':
        case 'SchemaArray':
          prop.type = "array";
          break;
        case 'Boolean':
        case 'SchemaBoolean':
          prop.type = "boolean";
          break;
        case "Date":
          prop.type = "string";
          prop.format = "date";
          break;
        default:
          prop.type = "string";
          prop.format = attributes[ele].instance;
      }
    }
    return attr;
  }
}

nodefony.mongoose = mongoose;
module.exports = mongoose;
