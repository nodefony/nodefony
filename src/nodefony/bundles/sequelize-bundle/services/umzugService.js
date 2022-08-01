const {
  Sequelize
} = require('sequelize');
const {
  Umzug,
  SequelizeStorage,
  memoryStorage,
  JSONStorage
} = require('umzug');

const logger = function (service) {
  return {
    log(data) {
      return service.log(data, "DEBUG");
    },
    info(data) {
      return service.log(data, "INFO");
    },
    warn(data) {
      return service.log(data, "WARNING");
    },
    error(data) {
      return service.log(data, "ERROR");
    }
  }
};

/*
    up        Applies pending migrations
    down      Revert migrations
    pending   Lists pending migrations
    executed  Lists executed migrations
*/
class umzug extends nodefony.Service {
  constructor(container, sequelize) {
    super("umzug", container);
    this.sequelizeService = sequelize;
    this.migrationPath = this.getMigrationPath();
    this.initialize();
  }

  // when server start
  async initialize() {
    if (this.kernel.environment === "dev") {
      if (this.kernel.ready) {
        await this.executed();
        return await this.pending()
      } else {
        this.sequelizeService.once("onOrmReady", async () => {
          await this.executed();
          return await this.pending()
        });
      }
    }
  }

  getMigrationPath() {
    if (this.bundle.settings.migrations && this.bundle.settings.migrations.path) {
      return this.bundle.settings.migrations.path;
    } else {
      return path.resolve(this.kernel.path, "migrations");
    }
  }

  getStorage(sequelize, connectorName) {
    try {
      if (this.bundle.settings.migrations) {
        this.optionsStorage = this.bundle.settings.migrations.options || {};
        switch (this.bundle.settings.migrations.storage) {
        case "sequelize":
        case "SequelizeStorage":
          return new SequelizeStorage({
            sequelize
          });
        case "memory":
          return memoryStorage();
        case "json":
          let file = path.resolve(this.migrationPath, `${connectorName}-migrate.json`);
          return new JSONStorage({
            path: file
          });
        default:
          return new SequelizeStorage({
            sequelize
          });
        }
      } else {
        return new SequelizeStorage({
          sequelize
        });
      }
    } catch (e) {
      throw e;
    }
  }

  revertAll(connectorName= null) {
    return new Promise(async (resolve, reject) => {
      if (connectorName) {
        try {
          const connection = this.sequelizeService.getConnection(connectorName);
          if (connection) {
            const db = connection.getConnection()
            const migrator = this.createMigrator(connectorName, db);
            this.log(`Revert all connector ${connectorName}`)
            return resolve(await migrator.down({
              to: 0
            }));
          }
          throw new Error(`Connector not found : ${connectorName}`)
        } catch (e) {
          return reject(e);
        }
      }
      try {
        let result = {}
        for (let connection in this.sequelizeService.connections) {
          const name = this.sequelizeService.connections[connection].name
          const db = this.sequelizeService.connections[connection].getConnection();
          const migrator = this.createMigrator(name, db);
          this.log(`Revert all connector ${name}`)
          result[connection] = await migrator.down({
            to: 0
          });
        }
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  }

  async migrate(connectorName = null) {
    return await this.up(connectorName);
  }
  async revert(connectorName = null) {
    return await this.revertAll(connectorName);
  }

  pending(connectorName, table = true) {
    return new Promise(async (resolve, reject) => {
      if (connectorName) {
        try {
          const connection = this.sequelizeService.getConnection(connectorName);
          if (connection) {
            const db = connection.getConnection()
            let migrator = this.createMigrator(connectorName, db);
            let data = await migrator.pending();
            if (table && data.length) {
              this.showTable(data, "pending", connectorName);
            }
            let res = {}
            res[connectorName] = data
            return resolve(res);
          }
          throw new Error(`Connector not found : ${connectorName}`);
        } catch (e) {
          return reject(e);
        }
      }
      try {
        let result = {};
        for (let connection in this.sequelizeService.connections) {
          const name = this.sequelizeService.connections[connection].name
          const db = this.sequelizeService.connections[connection].getConnection();
          const migrator = this.createMigrator(name, db);
          result[connection] = await migrator.pending()
          if (table) {
            this.showTable(result[connection], "pending", connection);
          }
        }
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  }

  executed(connectorName, table = true) {
    return new Promise(async (resolve, reject) => {
      if (connectorName) {
        try {
          const connection = this.sequelizeService.getConnection(connectorName);
          if (connection) {
            const db = connection.getConnection()
            let migrator = this.createMigrator(connectorName, db);
            let data = await migrator.executed();
            if (table && data.length) {
              this.showTable(data, "executed", connectorName);
            }
            let res = {}
            res[connectorName] = data
            return resolve(data);
          }
          throw new Error(`Connector not found : ${connectorName}`)
        } catch (e) {
          return reject(e);
        }
      }
      try {
        let result = {};
        for (let connection in this.sequelizeService.connections) {
          const name = this.sequelizeService.connections[connection].name
          const db = this.sequelizeService.connections[connection].getConnection();
          const migrator = this.createMigrator(name, db);
          result[connection] = await migrator.executed();
          if (table) {
            this.showTable(result[connection], "executed", connection, "INFO");
          }
        }
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  }

  up(connectorName, options = {}) {
    return new Promise(async (resolve, reject) => {
      if (connectorName) {
        try {
          const connection = this.sequelizeService.getConnection(connectorName);
          if (connection) {
            const db = connection.getConnection();
            let migrator = this.createMigrator(connectorName, db);
            this.log(`Migrate connector ${connectorName}`)
            return resolve(await migrator.up(options));
          }
          throw new Error(`Connector not found : ${connectorName}`)
        } catch (e) {
          return reject(e);
        }
      }
      try {
        let result = {}
        for (let connection in this.sequelizeService.connections) {
          const name = this.sequelizeService.connections[connection].name
          const db = this.sequelizeService.connections[connection].getConnection();
          const migrator = this.createMigrator(name, db);
          this.log(`Migrate connector ${name}`)
          result[connection] = await migrator.up(options);
        }
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  }

  down(connectorName, options = {}) {
    return new Promise(async (resolve, reject) => {
      if (connectorName) {
        console.log(connectorName)
        try {
          const connection = this.sequelizeService.getConnection(connectorName);
        console.log(connection)
          if (connection) {
            const db = connection.getConnection();
            const migrator = this.createMigrator(connectorName, db);
            this.log(`Revert connector ${connectorName}`)
            return resolve(await migrator.down(options));
          }
          throw new Error(`Connector not found : ${connectorName}`)
        } catch (e) {
          return reject(e);
        }
      }
      try {
        let result = {}
        for (let connection in this.sequelizeService.connections) {
          const name = this.sequelizeService.connections[connection].name
          const db = this.sequelizeService.connections[connection].getConnection();
          const migrator = this.createMigrator(name, db);
          this.log(`Revert connector ${name}`)
          result[connection] = await migrator.down(options);
        }
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  }

  createMigrator(connectorName, connection) {
    this.log(`Create migrator for connector : ${connectorName}`);
    const sequelize = connection;
    const connectorMigratorPath = path.resolve(this.migrationPath, connectorName, "*.js");
    const migrator = new Umzug({
      migrations: {
        glob: connectorMigratorPath
      },
      context: sequelize.getQueryInterface(),
      storage: this.getStorage(sequelize, connectorName),
      logger: logger(this)
    });
    return migrator;
  }

  async run(migrator, ...args) {
    this.log(`Run migrator Command : ${args}`);
    /*node migrate up # apply migrations
    node migrate down # revert the last migration
    node migrate down --to 0 # revert all migrations
    node migrate up --step 2 # run only two migrations*/
    return await migrator.runAsCLI(args);
  }

  showTable(data, type, connectionName, severity = "INFO") {
    let options = {
      head: [
          "NAME",
          "CONNECTOR",
          "PATH FILE"
        ]
    };
    let table = this.kernel.cli.displayTable(null, options);
    for (let i = 0; i < data.length; i++) {
      let tab = ["", ""];
      tab[0] = data[i].name;
      tab[1] = connectionName
      tab[2] = data[i].path;
      table.push(tab);
    }
    let res = table.toString();
    this.log(`Getting all ${type} migrations  connector : ${connectionName} \n${res}`, severity);
    return res;
  }

}

module.exports = umzug;
