const elasticsearch = require('elasticsearch');
const logger = require(path.resolve(__dirname, "..", "src", "elasticLogger.js"));

class elesticConnection extends nodefony.Service {
  constructor(name, options = {}, service = null) {
    super(name, service.container, service.container.notificationsCenter, options);
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
        this.hosts = this.client.transport._config.hosts;
        return resolve(this.client);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

module.exports = class Elastic extends nodefony.services.connections {

  constructor(container) {
    super("elastic", container, elasticsearch, elesticConnection);
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

  readConfig() {
    this.settings = this.bundle.settings.elasticsearch;
    this.globalOptions = this.settings.globalOptions;
    this.globalHostsOptions = this.settings.globalHostsOptions;
    for (let connection in this.settings.connections) {
      let options = this.setOptions(this.settings.connections[connection]);
      this.createConnection(connection, options)
        .then((conn) => {
          return conn.client.ping({
              requestTimeout: 3000
            })
            .then(() => {
              this.logger("PING OK", "INFO");
              this.displayTable(conn, "INFO");
              return conn;
            })
            .catch(e => {
              this.logger(e, "ERROR");
              throw e;
            });
        }).catch((e) => {
          this.logger(e, "ERROR");
          throw e;
        });
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
};