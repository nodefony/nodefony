/**
 *   SERVIVE MONGO
 */
const mongoClient = require('mongodb').MongoClient;

const defaultconfigServer = {
  host: "localhost",
  port: 27017
};

const defaultConfigConnection = {
  reconnectTries: Number.MAX_VALUE,
  autoReconnect: true,
};

module.exports = class mongo extends nodefony.Service {

  constructor(container) {
    super("MONGODB", container);
    this.connections = {};
    this.engine = mongoClient;

    this.kernel.listen(this, "onBoot", () => {
      this.settings = nodefony.extend({}, defaultconfigServer, this.bundle.settings.mongodb);
    });

    this.kernel.listen(this, "onReady", () => {
      for (let name in this.settings.connectors) {
        this.createConnection(name, this.settings.connectors[name]);
      }
    });
  }

  createConnection(name, config) {
    if (!name) {
      throw new Error("Mongodb createConnnetion no name connection");
    }
    let host = config.host || this.settings.host;
    let port = config.port || this.settings.port;
    let url = `mongodb://${host}:${port}/${config.dbname}`;

    let settings = nodefony.extend({}, defaultConfigConnection, config.settings);

    settings.promiseLibrary = BlueBird;

    return this.engine.connect(url, settings).then((db) => {

      this.connections[name] = db;
      db.on('close', () => {
        this.closeConnetion(name, db);
      });
      db.on('reconnect', () => {
        this.logger(`Reconnection to mongodb database ${name}`, 'INFO');
        this.fire('onReconnect', name, db);
        this.createConnection(name, config);
      });
      db.on('timeout', () => {
        this.logger(`Timeout to mongodb database ${name}`, 'INFO');
        this.fire('onTimeout', name, db);
      });
      db.on('parseError', (error) => {
        this.logger(`ParseError on mongodb database ${name}`, 'ERROR');
        this.logger(error, 'ERROR');
      });
      this.fire("onConnect", name, db);
      this.logger("Connect to " + name + " : " + url);
      return db;
    }).catch(error => {
      this.logger(`Cannot connect to mongodb ( ${host}:${port}/${config.dbname} )`, "ERROR");
      this.logger(error, "ERROR");
      setTimeout(() => {
        this.createConnection(name, config);
      }, 5000);
    });
  }

  closeConnetion(name, connection) {
    if (!name) {
      throw new Error("Close connection no name connection !!");
    }
    this.fire('onClose', name, connection);
    this.logger(`Close connection to mongodb database ${name}`, 'WARNING');
    if (this.connections[name]) {
      delete this.connections[name];
    }
  }

  testRead(db) {
    db.collection("couscous").find({}).toArray().then((ele) => {
      console.log("PASS ", ele);
    });
  }

  testWrite(db) {

  }

};