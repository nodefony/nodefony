const shortId = require("shortid");

class Connections extends nodefony.Service {
  constructor (name, container, engine, classConnection) {
    super(name, container, container.notificationsCenter);
    this.engine = engine;
    this.classConnection = classConnection;
    this.connections = {};
  }

  boot () {
    if (this.kernel.ready) {
      this.readConfig();
    } else {
      this.kernel.on("onReady", () => {
        this.readConfig();
      });
    }
  }

  createConnection (name, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        if (!name) {
          name = this.generateId();
        }
        if (name in this.connections) {
          throw new Error(`${this.name} client ${name} already exit `);
        }
        const conn = new this.classConnection(name, options, this);
        this.connections[conn.name] = conn;
        return conn.create(options)
          .then((client) => {
            this.fire("connection", client, conn);
            return resolve(conn);
          })
          .catch((e) => reject(e));
      } catch (e) {
        return reject(e);
      }
    });
  }

  getConnection (name) {
    if (name in this.connections) {
      return this.connections[name];
    }
    return null;
  }

  getClient (name) {
    const connection = this.getConnection(name);
    if (connection) {
      return connection.client;
    }
    return null;
  }

  removeConnection (name) {
    if (name in this.connections) {
      delete this.connections[name];
      return true;
    }
    throw new Error(`${this.name} removeClient ${name} not found`);
  }

  generateId () {
    return shortId.generate();
  }

  displayTable (connection, severity = "DEBUG") {
    const options = {
      head: [
        `${this.name.toUpperCase()} CONNECTIONS NAME`,
        "HOST"
      ]
    };
    try {
      const table = this.kernel.cli.displayTable(null, options);
      const data = [];
      const hosts = JSON.stringify(connection.hosts);
      data.push(connection.name || "");
      data.push(hosts || "");
      table.push(data);
      this.log(`${this.name} Connection ${connection.name} : \n${table.toString()}`, severity);
    } catch (e) {
      throw e;
    }
  }
}

nodefony.services.Connections = Connections;
module.exports = Connections;
