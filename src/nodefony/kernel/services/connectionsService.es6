nodefony.registerService("connections", () => {

  const shortId = require('shortid');

  class Connections extends nodefony.Service {

    constructor(name, container, engine, classConnection) {
      super(name, container, container.notificationsCenter);
      this.engine = engine;
      this.classConnection = classConnection;
      this.connections = {};
    }

    boot() {
      if (this.kernel.ready) {
        this.readConfig();
      } else {
        this.kernel.on("onReady", () => {
          this.readConfig();
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
            throw new Error(`${this.name} client ${name} already exit `);
          }
          let conn = new this.classConnection(name, options, this);
          this.connections[conn.name] = conn;
          return conn.create(options)
            .then((client) => {
              return resolve(conn);
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
      throw new Error(`${this.name} removeClient ${name} not found`);
    }

    generateId() {
      return shortId.generate();
    }

    displayTable(connection, severity = "DEBUG") {
      let options = {
        head: [
          "CONNECTION NAME",
          "HOST"
        ]
      };
      try {
        let table = this.kernel.cli.displayTable(null, options);
        let data = [];
        let hosts = JSON.stringify(connection.hosts);
        data.push(connection.name || "");
        data.push(hosts || "");
        table.push(data);
        this.logger(`${this.name} Connection ${connection.name} : \n${table.toString()}`, severity);
      } catch (e) {
        throw e;
      }
    }
  }

  return Connections;
});