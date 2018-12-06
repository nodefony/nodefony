const elasticsearch = require('elasticsearch');
const shortId = require('shortid');

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
        this.client = new this.service.engine.Client(options);
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
    this.clients = {};
    this.degug = false;
  }

  setOption(connection) {
    if (connection) {
      switch (nodefony.typeOf(connection.hosts)) {
        case "array":
          console.log("pass");
          for (let i = 0; i < connection.hosts.length; i++) {
            nodefony.extend(connection.hosts[i], this.globalHostsOptions);
          }
          return nodefony.extend({}, this.globalOptions, connection);
        default:
          return nodefony.extend({}, this.globalOptions, connection);
      }


    }
  }

  boot() {
    if (this.kernel.ready) {
      this.settings = this.bundle.settings.elasticsearch;
      this.globalOptions = this.settings.globalOptions;
      this.globalHostsOptions = this.settings.globalHostsOptions;
    } else {
      this.kernel.on("onReady", () => {
        this.settings = this.bundle.settings.elasticsearch;
        this.globalOptions = this.settings.globalOptions;
        this.globalHostsOptions = this.settings.globalHostsOptions;
        for (let connection in this.settings.connections) {
          let options = this.setOption(this.settings.connections[connection]);
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
        if (name in this.clients) {
          throw new Error(`ElasticSearch client ${name} already exit `);
        }
        let conn = new elesticConnection(name, options, this);
        this.clients[conn.name] = conn;
        return conn.create(options)
          .then(() => {
            return resolve(conn);
          }).catch((e) => {
            return reject(e);
          });
      } catch (e) {
        return reject(e);
      }
    });
  }

  getClient(name) {
    if (name in this.clients) {
      return this.clients[name];
    }
    return null;
  }

  removeClient(name) {
    if (name in this.clients) {
      delete this.clients[name];
      return true;
    }
    throw new Error(`ElasticSearch removeClient ${name} not found`);
  }

  generateId() {
    return shortId.generate();
  }

  displayTable(client, severity = "DEBUG") {
    let options = {
      head: [
        "NAME CONNECTOR",
        "Address",
        "connected"
      ]
    };
    try {
      let table = this.kernel.cli.displayTable(null, options);
      let data = [];
      data.push(client.name || "");
      data.push(client.client.address || "");
      data.push(client.client.connected || "");
      table.push(data);
      this.logger(`ELASTIC CLIENT ${client.name} : \n${table.toString()}`, severity);
    } catch (e) {
      throw e;
    }
  }

};