const mongodb = require('mongodb');
const shortId = require('shortid');

class Mongo extends nodefony.Service {

  constructor(container) {
    super("mongo", container);
    this.engine = mongodb;
  }

  boot() {}

  generateId() {
    return shortId.generate();
  }

}

nodefony.services.Mongo = Mongo;
module.exports = Mongo;