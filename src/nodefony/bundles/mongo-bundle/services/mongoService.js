const mongodb = require('mongodb');
const shortId = require('shortid');

module.exports = class Mongo extends nodefony.Service {

  constructor(container) {
    super("mongo", container);
    this.engine = mongodb;

  }

  boot() {

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
      this.logger(`Mongo CLIENT ${client.name} : \n${table.toString()}`, severity);
    } catch (e) {
      throw e;
    }
  }

};