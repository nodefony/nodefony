module.exports = nodefony.register("Entity", function () {

  class Entity extends nodefony.Service {
    constructor(bundle, name, orm, connectionName) {
      super(name, bundle.container);
      this.bundle = bundle;
      this.orm = this.get(orm);
      this.connectionName = connectionName;
      this.model = null;
      this.encoder = null;
      if (!this.orm) {
        throw new Error(this.name + " entity can't be registered  ORM not found : " + orm);
      }
      this.orm.on('onConnect', (connectionName, db) => {
        if (connectionName === this.connectionName) {
          this.db = db;
          this.model = this.registerModel(this.db);
          this.orm.setEntity(this);
        }
      });
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = "Entity " + this.name;
      }
      return super.logger(pci, severity, msgid, msg);
    }

    setEncoder(encoder) {
      if (encoder instanceof nodefony.Encoder) {
        return this.encoder = encoder;
      }
      throw new Error(`setEncoder : Entity ${this.name} encoder must be an instance of nodefony.Encoder`);
    }

    getEncoder() {
      return this.encoder;
    }

    hasEncoder() {
      if (this.encoder instanceof nodefony.Encoder) {
        return true;
      }
      if (this.encoder === null) {
        return false;
      }
      throw new Error(`setEncoder : Entity ${this.name} encoder must be an instance of nodefony.Encoder`);
    }

    encode(value) {
      if (this.hasEncoder()) {
        return this.encoder.encodePassword.apply(this.encoder, arguments);
      }
      return value;
    }

  }

  return Entity;
});