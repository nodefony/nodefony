const {
  Sequelize
} = require('sequelize');

const MigrateEntity = require(path.resolve(__dirname, "..", "src", "migrate", "MigrateEntity.js"));

const {
  Umzug,
  SequelizeStorage,
  memoryStorage,
  JSONStorage
} = require('umzug');

const logger = function(service) {
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
    this.seedeersPath = this.getSeedeersPath()
    this.initialize();
  }

  // when server start
  async initialize() {
    if (this.kernel.environment === "dev") {
      if (this.kernel.ready) {
        //await this.executed();
        return await this.pending()
      } else {
        this.kernel.once("onPostReady", async () => {
          //await this.executed();
          return await this.pending()
        });
      }
    }
  }

  createMigrateEntity(entiyName, queryInterface, kernel) {
    return new MigrateEntity(entiyName, queryInterface, kernel);
  }

  getMigrationPath() {
    if (this.bundle.settings.migrations && this.bundle.settings.migrations.path) {
      return this.bundle.settings.migrations.path;
    } else {
      return path.resolve(this.kernel.path, "migrations", "sequelize");
    }
  }

  getSeedeersPath() {
    if (this.bundle.settings.migrations && this.bundle.settings.migrations.seedeersPath) {
      return this.bundle.settings.migrations.seedeersPath;
    } else {
      return path.resolve(this.kernel.path, "migrations", "seedeers");
    }
  }

  getStorage(sequelize, connectorName, seedeers = false) {
    try {
      if (this.bundle.settings.migrations) {
        let pathStorage = this.migrationPath
        let storage = this.bundle.settings.migrations.storage
        let jsonName = path.resolve(pathStorage, `${connectorName}-migrate-nodefony.json`);
        if (seedeers) {
          pathStorage = this.seedeersPath
          storage = this.bundle.settings.migrations.storageSeedeers
          jsonName = path.resolve(pathStorage, `${connectorName}-seedeers-nodefony.json`);
        }
        switch (storage) {
          case "sequelize":
          case "SequelizeStorage":
            return new SequelizeStorage({
              sequelize
            });
          case "memory":
            return memoryStorage();
          case "json":
            return new JSONStorage({
              path: jsonName
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

  revertAll(connectorName = null, type = "migrate") {
    return new Promise(async (resolve, reject) => {
      if (connectorName) {
        try {
          const connection = this.sequelizeService.getConnection(connectorName);
          if (connection) {
            const db = connection.getConnection()
            let migrator = null
            if (type === "migrate") {
              migrator = this.createMigrator(connectorName, db);
            } else {
              migrator = this.createMigratorSeedeers(connectorName, db);
            }
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
          let migrator = null
          if (type === "migrate") {
            migrator = this.createMigrator(name, db);
          } else {
            migrator = this.createMigratorSeedeers(name, db);
          }
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

  pending(connectorName, table = true, type = "migrate") {
    return new Promise(async (resolve, reject) => {
      let severity = "INFO"
      if (this.kernel.type === "SERVER") {
        severity = "WARNING"
      }
      if (connectorName) {
        try {
          const connection = this.sequelizeService.getConnection(connectorName);
          if (connection) {
            const db = connection.getConnection()
            let migrator = null
            if (type === "migrate") {
              migrator = this.createMigrator(connectorName, db);
            } else {
              migrator = this.createMigratorSeedeers(connectorName, db);
            }
            let data = await migrator.pending();
            if (table && data.length) {
              this.showTable(data, "pending", connectorName, severity);
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
          let migrator = null
          if (type === "migrate") {
            migrator = this.createMigrator(name, db);
          } else {
            migrator = this.createMigratorSeedeers(name, db);
          }
          result[connection] = await migrator.pending()
          if (table && result[connection] && result[connection].length) {
            this.showTable(result[connection], "pending", connection, severity);
          }
        }
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  }

  executed(connectorName, table = true, type = "migrate") {
    return new Promise(async (resolve, reject) => {
      if (connectorName) {
        try {
          const connection = this.sequelizeService.getConnection(connectorName);
          if (connection) {
            const db = connection.getConnection()
            let migrator = null
            if (type === "migrate") {
              migrator = this.createMigrator(connectorName, db);
            } else {
              migrator = this.createMigratorSeedeers(connectorName, db);
            }
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
          let migrator = null
          if (type === "migrate") {
            migrator = this.createMigrator(name, db);
          } else {
            migrator = this.createMigratorSeedeers(name, db);
          }
          result[connection] = await migrator.executed();
          if (table && result[connection] && result[connection].length) {
            this.showTable(result[connection], "executed", connection);
          }
        }
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  }

  up(connectorName, options = {}, type = "migrate") {
    return new Promise(async (resolve, reject) => {
      if (connectorName) {
        try {
          const connection = this.sequelizeService.getConnection(connectorName);
          if (connection) {
            const db = connection.getConnection();
            let migrator = null
            if (type === "migrate") {
              migrator = this.createMigrator(connectorName, db);
            } else {
              migrator = this.createMigratorSeedeers(connectorName, db);
            }
            this.log(`${type} connector ${connectorName}`)
            return resolve(await migrator.up(options));
          }
          throw new Error(`Connector not found : ${connectorName}`)
        } catch (e) {
          console.error(e)
          return reject(e);
        }
      }
      try {
        let result = {}
        for (let connection in this.sequelizeService.connections) {
          const name = this.sequelizeService.connections[connection].name
          const db = this.sequelizeService.connections[connection].getConnection();
          let migrator = null
          if (type === "migrate") {
            migrator = this.createMigrator(name, db);
          } else {
            migrator = this.createMigratorSeedeers(name, db);
          }
          this.log(`${type} connector ${name}`)
          result[connection] = await migrator.up(options);
        }
        return resolve(result);
      } catch (e) {
        console.error(e)
        return reject(e);
      }
    });
  }

  down(connectorName, options = {}, type = "migrate") {
    return new Promise(async (resolve, reject) => {
      if (connectorName) {
        try {
          const connection = this.sequelizeService.getConnection(connectorName);
          if (connection) {
            const db = connection.getConnection();
            let migrator = null
            if (type === "migrate") {
              migrator = this.createMigrator(connectorName, db);
            } else {
              migrator = this.createMigratorSeedeers(connectorName, db);
            }
            this.log(`Revert connector ${connectorName}`)
            return resolve(await migrator.down(options));
          }
          throw new Error(`Connector not found : ${connectorName}`)
        } catch (e) {
          console.error(e)
          return reject(e);
        }
      }
      try {
        let result = {}
        for (let connection in this.sequelizeService.connections) {
          const name = this.sequelizeService.connections[connection].name
          const db = this.sequelizeService.connections[connection].getConnection();
          let migrator = null
          if (type === "migrate") {
            migrator = this.createMigrator(name, db);
          } else {
            migrator = this.createMigratorSeedeers(name, db);
          }
          this.log(`Revert connector ${name}`)
          result[connection] = await migrator.down(options);
        }
        return resolve(result);
      } catch (e) {
        console.error(e)
        return reject(e);
      }
    });
  }

  createMigrator(connectorName, connection, create = false) {
    //this.log(`Create migrator for connector : ${connectorName}`);
    try {
      const sequelize = connection;
      const connectorMigratorPath = path.resolve(this.migrationPath, connectorName, "*.js");
      let template = path.resolve(__dirname, "..", "src", "migrate", 'templates/sample-migration.js');
      let options = {
        migrations: {
          glob: connectorMigratorPath
        },
        context: sequelize.getQueryInterface(),
        storage: this.getStorage(sequelize, connectorName),
        logger: logger(this),
      }
      if (create) {
        options.create = {
          folder: path.join(this.migrationPath, connectorName),
          template: filepath => [
            // read template from filesystem
            [filepath, fs.readFileSync(template).toString()],
          ]
        }
      }
      return new Umzug(options);
    } catch (e) {
      this.log(e, "ERROR")
      throw e
    }
  }

  async create(connectorName = "nodefony", filepath = "migrate-nodefony.js") {
    const connection = this.sequelizeService.getConnection(connectorName);
    if (connection) {
      const db = connection.getConnection();
      let migrator = this.createMigrator(connectorName, db, true);
      return await migrator.create({
        name: filepath
      })
    }
    throw new Error(`Bad Connector`);
  }

  // Seedeers

  createMigratorSeedeers(connectorName, connection, create = false) {
    try {
      const sequelize = connection;
      const connectorSeedeersPath = path.resolve(this.seedeersPath, connectorName, "*.js");
      let template = path.resolve(__dirname, "..", "src", "migrate", 'templates/sample-seedeers.js');
      let options = {
        migrations: {
          glob: connectorSeedeersPath
        },
        context: sequelize.getQueryInterface(),
        storage: this.getStorage(sequelize, connectorName, true),
        logger: logger(this),
      }
      if (create) {
        options.create = {
          folder: path.join(this.seedeersPath, connectorName),
          template: filepath => [
            // read template from filesystem
            [filepath, fs.readFileSync(template).toString()],
          ]
        }
      }
      return new Umzug(options);
    } catch (e) {
      this.log(e, "ERROR")
      throw e
    }
  }

  async createSeedeers(connectorName = "nodefony", filepath = "seedeers-nodefony.js") {
    const connection = this.sequelizeService.getConnection(connectorName);
    if (connection) {
      const db = connection.getConnection();
      let migrator = this.createMigratorSeedeers(connectorName, db, true);
      return await migrator.create({
        name: filepath
      })
    }
    throw new Error(`Bad Connector`);
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
        "PATH FILE",
        "STATE"
      ]
    };
    let table = this.kernel.cli.displayTable(null, options);
    for (let i = 0; i < data.length; i++) {
      let tab = ["", ""];
      tab[0] = data[i].name;
      tab[1] = connectionName
      tab[2] = data[i].path;
      tab[3] = type;
      table.push(tab);
    }
    let res = table.toString();
    this.log(`Getting all ${type} migrations  connector : ${connectionName} \n${res}`, severity);
    return res;
  }

}

module.exports = umzug;
