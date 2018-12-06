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

  boot() {

  }


  createConnection(name, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        if (!name) {
          name = this.generateId();
        }
        if (name in this.clients) {
          throw new Error(`Redis client ${name} already exit `);
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