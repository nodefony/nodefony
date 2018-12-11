const elasticsearch = require('elasticsearch');
const shortId = require('shortid');
const logger = require(path.resolve(__dirname, "..", "src", "elasticLogger.js"));

class elesticConnection extends nodefony.Service {
  constructor(name, options = {}, service = null) {
    super(name, service.container, nodefony.notificationsCenter.create(), options);
    this.service = service;
    this.client = null;
  }

  logger(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = `\x1b[36mELASTICSEARCH CLIENT ${this.name} \x1b[0m`;
    }
    return super.logger(pci, severity, msgid, msg);
  }

  create(options = {}) {
    return new Promise((resolve, reject) => {
      try {
        this.settings = nodefony.extend({}, this.settings, options);
        if (!this.settings.log) {
          this.settings.log = logger;
          this.settings.log.prototype.logger = this.logger.bind(this);
        }
        this.client = new this.service.engine.Client(this.settings);
        return resolve(this.client);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

module.exports = class Elastic extends nodefony.Service {

  constructor(container) {
    super("elastic", container);
    this.engine = elasticsearch;
    this.connections = {};
    this.degug = false;

  }

  setOptions(connection) {
    if (connection) {
      let myOpt = {};
      switch (nodefony.typeOf(connection.hosts)) {
        case "array":
          for (let i = 0; i < connection.hosts.length; i++) {
            connection.hosts[i] = nodefony.extend({}, this.globalHostsOptions, connection.hosts[i]);
          }
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

  boot() {
    let options = null;
    if (this.kernel.ready) {
      this.settings = this.bundle.settings.elasticsearch;
      this.globalOptions = this.settings.globalOptions;
      this.globalHostsOptions = this.settings.globalHostsOptions;
      for (let connection in this.settings.connections) {
        options = this.setOptions(this.settings.connections[connection]);
        this.createConnection(connection, options)
          .then((conn) => {
            this.displayTable(conn, "INFO");
            return conn;
          }).catch((e) => {
            this.logger(e, "ERROR");
          });
      }
    } else {
      this.kernel.on("onReady", () => {
        this.settings = this.bundle.settings.elasticsearch;
        this.globalOptions = this.settings.globalOptions;
        this.globalHostsOptions = this.settings.globalHostsOptions;
        for (let connection in this.settings.connections) {
          options = this.setOptions(this.settings.connections[connection]);
          this.createConnection(connection, options)
            .then((conn) => {
              return conn.client.ping({
                  requestTimeout: 3000,
                })
                .then(() => {
                  this.logger("PING OK", "INFO");
                  this.displayTable(conn, "INFO");
                  return conn;
                  /*setInterval(() => {
                    client.search({
                      index: 'products',
                      body: {
                        query: {
                          match_all: {}
                        }
                      }
                    });
                  }, 10000);*/
                })
                .catch(e => {
                  this.logger(e, "ERROR");
                  throw e;
                });
            }).catch((e) => {
              this.logger(e, "ERROR");
            });
        }
      });
    }
  }

  createConnection(name, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        if (!name) {
          name = this.generateId();
        }
        if (name in this.connections) {
          throw new Error(`ElasticSearch client ${name} already exit `);
        }
        let conn = new elesticConnection(name, options, this);
        this.connections[conn.name] = conn;
        return conn.create(options)
          .then((client) => {
            return resolve(conn);


            /*let res = client.search({
              index: 'products',
              body: {
                query: {
                  match_all: {}
                }
              }
            });*/

          }).catch((e) => {
            return reject(e);
          });
      } catch (e) {
        return reject(e);
      }
    });
  }

  getConnection(name) {
    if (name in this.connections) {
      return this.connections[name];
    }
    return null;
  }

  getClient(name) {
    let connection = this.getConnection(name);
    if (connection) {
      return connection.client;
    }
    return null;
  }

  removeConnection(name) {
    if (name in this.connections) {
      delete this.connections[name];
      return true;
    }
    throw new Error(`ElasticSearch removeClient ${name} not found`);
  }

  generateId() {
    return shortId.generate();
  }

  displayTable(connection, severity = "DEBUG") {
    let options = {
      head: [
        "NAME CONNECTOR",
        "hosts"
      ]
    };
    try {
      let table = this.kernel.cli.displayTable(null, options);
      let data = [];
      let hosts = JSON.stringify(connection.client.transport._config.hosts);
      data.push(connection.name || "");
      data.push(hosts || "");
      table.push(data);
      this.logger(`ELASTIC CLIENT ${connection.name} : \n${table.toString()}`, severity);
    } catch (e) {
      throw e;
    }
  }

};