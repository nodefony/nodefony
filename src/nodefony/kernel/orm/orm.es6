
class Orm extends nodefony.Service {

  constructor(name, container /*, kernel, autoLoader*/ ) {
    super(name, container, null, {
      events: {
        nbListeners: 100,
      }
    });
    if ((this.kernel.debug === false && this.debug === true) || this.debug === undefined) {
      this.debug = this.kernel.debug;
    }
    this.entities = {};
    this.connections = {};
    this.connectionNotification = 0;
    this.ready = false;
    this.prependOnceListener("onOrmReady", async () => {
      if (this.bundle.booted) {
        return await this.bundle.emitAsync("onReady", this.bundle)
          .then(() => {
            this.bundle.ready = true
          })
          .catch(e => {
            throw e
          })
      }
      this.bundle.ready = true
    })
  }

  boot() {
    this.on("onConnect", async (connection) => {
      return this.ormReady(connection)
    })
    this.on("onErrorConnection", async (connection, error) => {
      return this.ormReady(connection, error)
    })
  }

  ormReady(connection, error = null) {
    const nbConnectors = Object.keys(this.settings.connectors).length
    this.connectionNotification++;
    if( error){
      this.log(error, "ERROR")
    }
    if (nbConnectors === this.connectionNotification) {
      process.nextTick(async () => {
        return await this.emitAsync('onOrmReady', this)
          .then(() => {
            if (this.kernel.type !== "CONSOLE") {
              this.log('onOrmReady', "INFO", `EVENTS ${this.name} ORM`);
            }
            this.connectionNotification = 0
            this.ready = true;
          })
          .catch(e => {
            this.log(e, "ERROR")
          })
      });
    }
  }

  log(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = this.kernel.cli.clc.magenta(this.name + " ");
    }
    return super.log(pci, severity, msgid, msg);
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
    this.log("ORM ENTITY LIST  : \n" + res, severity);
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
      this.log(" REGISTER ENTITY : " + entity.name + " PROVIDE BUNDLE : " + entity.bundle.name, "INFO");
    }
  }
}

nodefony.Orm = Orm;
module.exports = Orm;
