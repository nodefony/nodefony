const elasticsearch = require('@elastic/elasticsearch');
const {
  Client
} = require('@elastic/elasticsearch');
/*const {
  ConnectionPool,
  Connection
} = require('@elastic/elasticsearch');
class MyConnectionPool extends ConnectionPool {
  markAlive(connection) {
    // your code
    kernel.log(connection, "DEBUG", "ELASTIC POOL CONNECTION");
    super.markAlive(connection);
  }
}
class MyConnection extends Connection {
  request(params, callback) {
    // your code
    kernel.log(params, "DEBUG", "ELASTIC CONNECTION");
  }
}*/

//const { events } = require('@elastic/elasticsearch')
//console.log(events)
//const { errors } = require('@elastic/elasticsearch');
//console.log(errors);

class elesticConnection extends nodefony.Service {
  constructor(name, options = {}, service = null) {
    super(name, service.container, service.container.notificationsCenter, options);
    this.service = service;
    this.client = null;
  }

  logger(pci, severity, msgid, msg) {
    if (!msgid) {
      if (msg) {
        msgid = `\x1b[36mELASTICSEARCH CLIENT ${this.name}  ${msg} \x1b[0m`;
      } else {
        msgid = `\x1b[36mELASTICSEARCH CLIENT ${this.name}\x1b[0m`;
      }
    }
    return super.logger(pci, severity, msgid, msg);
  }

  create(options = {}) {
    return new Promise((resolve, reject) => {
      try {
        this.settings = nodefony.extend({}, this.settings, options);
        this.client = new Client(this.settings);
        if (this.settings.log) {
          //this.settings.log = logger;
          //this.settings.log.prototype.logger = this.logger.bind(this);
          //this.settings.ConnectionPool = MyConnectionPool;
          //this.settings.Connection = MyConnection;
          if (this.settings.log.request) {
            this.client.on('request', (err, result) => {
              if (err) {
                this.logger(err, "ERROR");
                this.logger(err.meta, "ERROR");
                return err;
              }
              this.logger(result.meta.request, "DEBUG", null, "REQUEST");
            });
          }
          if (this.settings.log.response) {
            this.client.on('response', (err, result) => {
              if (err) {
                this.logger(err, "ERROR");
                return;
              }
              this.logger(result, "DEBUG", null, "RESPONSE");
            });
          }
          if (this.settings.log.sniff) {
            this.client.on('sniff', (err, result) => {
              if (err) {
                this.logger(err, "ERROR");
                return;
              }
              this.logger(`${JSON.stringify(result.meta.sniff,null, '\t')}`, "DEBUG", null, "SNIFF");
            });
          }
          if (this.settings.log.resurrect) {
            this.client.on('resurrect', (err, result) => {
              if (err) {
                this.logger(err, "ERROR");
                return;
              }
              this.logger(result, "INFO", null, "RESURRECT");
            });
          }
        }
        return resolve(this.client);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

class Elastic extends nodefony.services.Connections {

  constructor(container) {
    super("elastic", container, elasticsearch, elesticConnection);
  }

  setOptions(connection) {
    if (connection) {
      let myOpt = {};
      switch (nodefony.typeOf(connection.nodes)) {
      case "array":
        nodefony.extend(myOpt, this.globalOptions, connection);
        break;
      default:
        nodefony.extend(myOpt, this.globalOptions, connection);
      }
      try {
        if (myOpt.ssl) {
          myOpt.ssl = this.readCertificates(myOpt.ssl);
        }

        return myOpt;
      } catch (e) {
        throw e;
      }
    }
  }

  getConnection(name) {
    return new Promise((resolve, reject) => {
      if (name in this.connections) {
        return resolve(super.getConnection(name));
      } else {
        this.on("connection", (connection) => {
          if (connection) {
            return resolve(connection);
          }
          return reject(new Error("No connection : " + name));
        });
      }
    });
  }

  async readConfig() {
    this.settings = this.bundle.settings.elasticsearch;
    this.globalOptions = this.settings.globalOptions;
    //this.globalHostsOptions = this.settings.globalHostsOptions;
    for (let connection in this.settings.connections) {
      try {
        let options = this.setOptions(this.settings.connections[connection]);
        let conn = await this.createConnection(connection, options);
        this.logger(`Ping Elastic connection`, "INFO");
        let ping = await conn.client.ping();
        this.logger(ping, "DEBUG", );
        this.logger(`Info Elastic connection`, "INFO");
        let info = await conn.client.info();
        this.logger(info, "DEBUG");
      } catch (e) {
        this.logger(e, "ERROR");
        continue;
      }
    }
    this.displayTable(this.connections, "INFO");
  }

  async displayTable(connections, severity = "DEBUG") {
    let options = {
      head: [
        `${this.name.toUpperCase()} CONNECTIONS NAME`,
        "HOST"
      ]
    };
    try {
      let table = this.kernel.cli.displayTable(null, options);
      let data = [];
      for (let connection in connections) {
        data.push(connection || "");
        data.push(connections[connection].client.name || "");
      }
      table.push(data);
      this.logger(`${this.name} Connections : \n${table.toString()}`, severity);
    } catch (e) {
      throw e;
    }
  }

  readCertificates(ssl) {
    let certif = nodefony.extend({}, ssl);
    try {
      let keyPath = null;
      if (ssl.key) {
        keyPath = this.kernel.checkPath(path.resolve(ssl.key));
        if (keyPath) {
          certif.key = fs.readFileSync(keyPath);
        }
      }
      let certPath = null;
      if (ssl.cert) {
        certPath = this.kernel.checkPath(path.resolve(ssl.cert));
        if (certPath) {
          certif.cert = fs.readFileSync(certPath);
        }
      }
      let caPath = null;
      if (ssl.ca) {
        caPath = this.kernel.checkPath(path.resolve(ssl.ca));
        if (caPath) {
          certif.ca = fs.readFileSync(caPath);
        }
      }
      let pfxPath = null;
      if (ssl.pfx) {
        pfxPath = this.kernel.checkPath(path.resolve(ssl.ca));
        if (pfxPath) {
          certif.pfx = fs.readFileSync(pfxPath);
        }
      }
      return certif;
    } catch (e) {
      throw e;
    }
  }
}

nodefony.services.Elastic = Elastic;
module.exports = Elastic;