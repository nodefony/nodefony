const connectionMonitor = function ( /*name, db*/ ) {
  this.connectionNotification++;
  if (Object.keys(this.settings.connectors).length === this.connectionNotification) {
    process.nextTick(() => {
      if (this.kernel.type !== "CONSOLE") {
        this.logger('onOrmReady', "INFO", `EVENTS ${this.name} ORM`);
      }
        //this.logger('onOrmReady', "INFO", `EVENTS ${this.name} ORM`);
      this.fire('onOrmReady', this);
      this.ready = true;
    });
  }
};

class Orm extends nodefony.Service {

  constructor(name, container /*, kernel, autoLoader*/ ) {
    super(name, container);
    if ((this.kernel.debug === false && this.debug === true) || this.debug === undefined) {
      this.debug = this.kernel.debug;
    }
    this.entities = {};
    this.connections = {};
    this.connectionNotification = 0;
    this.ready = false;
  }

  boot() {
    this.on("onConnect", connectionMonitor.bind(this));
    this.on("onErrorConnection", connectionMonitor.bind(this));
  }

  logger(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = this.kernel.cli.clc.magenta(this.name + " ");
    }
    return super.logger(pci, severity, msgid, msg);
  }

  getConnection(name) {
    if (this.connections[name]) {
      return this.connections[name].db;
    }
    return null;
  }

  getConnections(name) {
    if (name) {
      return this.getConnection(name);
    }
    return this.connections;
  }

  getEntity(name) {
    if (name) {
      if (name in this.entities) {
        return this.entities[name].model;
      }
      return null;
    } else {
      return this.entities;
    }
  }

  getNodefonyEntity(name) {
    if (name) {
      if (name in this.entities) {
        return this.entities[name];
      }
      return null;
    } else {
      return this.entities;
    }
  }

  getEntityTable(severity = "DEBUG") {
    let options = {
      head: [
          "NAME ENTITY",
          "BUNDLE",
          "CONNECTION"
        ]
    };
    let table = this.kernel.cli.displayTable(null, options);
    for (let entity in this.entities) {
      let tab = ["", "", ""];
      tab[0] = this.entities[entity].name;
      tab[1] = this.entities[entity].bundle.name;
      tab[2] = this.entities[entity].connectionName;
      table.push(tab);
    }
    let res = table.toString();
    this.logger("ORM ENTITY LIST  : \n" + res, severity);
    return res;

  }

  setEntity(entity) {
    if (!entity) {
      throw new Error(this.name + " setEntity : entity  is null ");
    }
    if (!(entity instanceof nodefony.Entity)) {
      throw new Error(this.name + " setEntity  : not instance of nodefony.Entity");
    }
    if (this.entities[entity.name]) {
      throw new Error(this.name + " setEntity  : Entity Already exist " + entity.name);
    }
    if (!entity.model) {
      throw new Error(this.name + " setEntity  : Bundle : " + entity.bundle.name + " Model is undefined in Entity : " + entity.name);
    }
    this.entities[entity.name] = entity;
    if (this.kernel.type === "SERVER") {
      this.logger(" REGISTER ENTITY : " + entity.name + " PROVIDE BUNDLE : " + entity.bundle.name, "INFO");
    }
  }
}

nodefony.Orm = Orm;
module.exports = Orm;
