const elasticsearch = require("@elastic/elasticsearch");
const {
  Client
} = require("@elastic/elasticsearch");

/* const {
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

// const { events } = require('@elastic/elasticsearch')
// console.log(events)
// const { errors } = require('@elastic/elasticsearch');
// console.log(errors);

class elesticConnection extends nodefony.Service {
  constructor (name, options = {}, service = null) {
    super(name, service.container, service.container.notificationsCenter, options);
    this.service = service;
    this.client = null;
  }

  log (pci, severity, msgid, msg) {
    if (!msgid) {
      if (msg) {
        msgid = `\x1b[36mELASTICSEARCH CLIENT ${this.name}  ${msg} \x1b[0m`;
      } else {
        msgid = `\x1b[36mELASTICSEARCH CLIENT ${this.name}\x1b[0m`;
      }
    }
    return super.log(pci, severity, msgid, msg);
  }

  create (options = {}) {
    return new Promise((resolve, reject) => {
      try {
        this.settings = nodefony.extend({}, this.settings, options);
        this.client = new Client(this.settings);
        if (this.settings.log) {
          // this.settings.log = logger;
          // this.settings.log.prototype.logger = this.log.bind(this);
          // this.settings.ConnectionPool = MyConnectionPool;
          // this.settings.Connection = MyConnection;
          if (this.settings.log.request) {
            this.client.on("request", (err, result) => {
              if (err) {
                this.log(err, "ERROR");
                this.log(err.meta, "ERROR");
                return err;
              }
              this.log(result.meta.request, "DEBUG", null, "REQUEST");
            });
          }
          if (this.settings.log.response) {
            this.client.on("response", (err, result) => {
              if (err) {
                this.log(err, "ERROR");
                return;
              }
              this.log(result, "DEBUG", null, "RESPONSE");
            });
          }
          if (this.settings.log.sniff) {
            this.client.on("sniff", (err, result) => {
              if (err) {
                this.log(err, "ERROR");
                return;
              }
              this.log(`${JSON.stringify(result.meta.sniff, null, "\t")}`, "DEBUG", null, "SNIFF");
            });
          }
          if (this.settings.log.resurrect) {
            this.client.on("resurrect", (err, result) => {
              if (err) {
                this.log(err, "ERROR");
                return;
              }
              this.log(result, "INFO", null, "RESURRECT");
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
  constructor (container) {
    super("elastic", container, elasticsearch, elesticConnection);
  }

  setOptions (connection) {
    if (connection) {
      const myOpt = {};
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

  getConnection (name) {
    return new Promise((resolve, reject) => {
      if (name in this.connections) {
        return resolve(super.getConnection(name));
      }
      this.on("connection", (connection) => {
        if (connection) {
          return resolve(connection);
        }
        return reject(new Error(`No connection : ${name}`));
      });
    });
  }

  async readConfig () {
    this.settings = this.bundle.settings.elasticsearch;
    this.globalOptions = this.settings.globalOptions;
    // this.globalHostsOptions = this.settings.globalHostsOptions;
    for (const connection in this.settings.connections) {
      try {
        const options = this.setOptions(this.settings.connections[connection]);
        const conn = await this.createConnection(connection, options);
        this.log("Ping Elastic connection", "INFO");
        const ping = await conn.client.ping();
        this.log(ping, "DEBUG");
        this.log("Info Elastic connection", "INFO");
        const info = await conn.client.info();
        this.log(info, "DEBUG");
      } catch (e) {
        this.log(e, "ERROR");
        continue;
      }
    }
    this.displayTable(this.connections, "INFO");
  }

  async displayTable (connections, severity = "DEBUG") {
    const options = {
      head: [
        `${this.name.toUpperCase()} CONNECTIONS NAME`,
        "HOST"
      ]
    };
    try {
      const table = this.kernel.cli.displayTable(null, options);
      const data = [];
      for (const connection in connections) {
        data.push(connection || "");
        data.push(connections[connection].client.name || "");
      }
      table.push(data);
      this.log(`${this.name} Connections : \n${table.toString()}`, severity);
    } catch (e) {
      throw e;
    }
  }

  readCertificates (ssl) {
    const certif = nodefony.extend({}, ssl);
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
