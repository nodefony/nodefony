class generateTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.ormService = this.get("sequelize");
  }

  showHelp() {
    this.setHelp("sequelize:sync [force]",
      "Synchronize All Entities. [force] to delete table if exist  example : nodefony sequelize:sync force"
    );
  }

  generate(args, response) {
    let force = false;
    let alter = false;
    if (response) {
      force = response.force || false;
      alter = response.alter || false;
    } else {
      if (args.length) {
        if (args[0] === "force") {
          force = true;
        }
        if (args[0] === "alter") {
          alter = true;
        }
      }
    }
    if (!this.cli.commander.opts().force && (force || alter)) {
      let name = force ? "force" : "alter"
      let message = `Synchronize ${name}`
      if (name === "force") {
        message += ` WARNING drop tables `
      } else {
        message += ` WARNING alter tables`
      }
      message += ` Are you sure ?`
      return this.cli.prompt([{
          type: 'confirm',
          message: message,
          name: "sync",
          default: false
        }])
        .then((response) => {
          if (response.sync) {
            return this.entities({
              force,
              alter
            });
          }
          return response
        })
    }
    return this.entities({
      force,
      alter
    });
  }

  entities(options) {
    return new Promise((resolve, reject) => {
      try {
        //let tab = [];
        if (this.ormService.ready) {
          return this.installEntities(options)
            .then((ele) => {
              return resolve(ele);
            })
            .catch((e) => {
              return reject(e);
            });
        }
        this.ormService.listen(this, "onOrmReady", ( /*service*/ ) => {
          return this.installEntities(options)
            .then((ele) => {
              return resolve(ele);
            })
            .catch((e) => {
              return reject(e);
            });
        });
      } catch (e) {
        return reject(e);
      }
    });
  }

  installEntities(options) {
    return new Promise(async (resolve, reject) => {
      try {
        let tab = [];
        for (let connectionName in this.ormService.connections) {
          let connection = this.ormService.connections[connectionName].db;
          if (!connection) {
            this.log("CONNECTION : " + connectionName + " State : " + this.ormService.connections[connectionName].state, "ERROR");
            continue;
          }
          this.log("DATABASE  : " + connection.options.dialect + " CONNECTION : " + connectionName, "INFO");
          tab.push(await this.sync(connectionName, connection, options))
        }
        return resolve(tab)
      } catch (e) {
        return reject(e);
      }
    });
  }

  sync(connectionName, connection, {
    force,
    alter
  }) {
    return new Promise((resolve, reject) => {
      this.log("DATABASE SYNC : " + connectionName);
      switch (connection.options.dialect) {
        case "mysql":
          return connection.query('SET FOREIGN_KEY_CHECKS = 0', null, {
              raw: true
            })
            .then(() => {
              return connection.sync({
                force: force,
                alter: alter,
                logging: (value) => {
                  return this.cli.log(value, "INFO");
                },
                hooks: true
              }).then((db) => {
                this.log("DATABASE :" + db.config.database + " CONNECTION : " + connectionName, "INFO", "SYNC SEQUELIZE");
                return resolve(connectionName);
              }).catch((error) => {
                this.log("DATABASE :" + connection.config.database + " CONNECTION : " + connectionName + " : " + error, "ERROR");
                return reject(error);
              });
            }).catch(e => {
              this.log(e, "ERROR");
              return reject(e);
            });
        default:
          return connection.sync({
            force: force,
            alter: alter,
            logging: (value) => {
              return this.cli.log(value, "INFO");
            },
            hooks: true
          }).then((db) => {
            this.log("DATABASE :" + db.config.database + " CONNECTION : " + connectionName, "INFO", "SYNC SEQUELIZE");
            return resolve(connectionName);
          }).catch((error) => {
            this.log("DATABASE :" + connection.config.database + " CONNECTION : " + connectionName + " : " + error, "ERROR");
            return reject(error);
          });
      }
    });
  }
}

module.exports = generateTask;
