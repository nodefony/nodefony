class generateTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.ormService = this.get("sequelize");
  }

  showHelp() {
    this.setHelp("sequelize:generate:entities [force]",
      "Generate All Entities force to delete table if exist  example : nodefony sequelize:generate:entities force"
    );
  }

  entities(force = false) {
    return new Promise((resolve, reject) => {
      try {
        //let tab = [];
        if (this.ormService.ready) {
          return this.installEntities(force)
            .then((ele) => {
              return resolve(ele);
            })
            .catch((e) => {
              return reject(e);
            });
        }
        this.ormService.listen(this, "onOrmReady", ( /*service*/ ) => {
          return this.installEntities(force)
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

  installEntities(force = false) {
    return new Promise((resolve, reject) => {
      try {
        let tab = [];
        for (let connectionName in this.ormService.connections) {
          let connection = this.ormService.connections[connectionName].db;
          this.logger("DATABASE  : " + connection.options.dialect + " CONNECTION : " + connectionName, "INFO");
          tab.push(this.sync(connectionName, connection, force));
        }
        return Promise.all(tab)
          .then((ele) => {
            return resolve(ele);
          });
      } catch (e) {
        return reject(e);
      }
    });
  }

  sync(connectionName, connection, force) {
    return new Promise((resolve, reject) => {
      this.logger("DATABASE SYNC : " + connectionName);
      switch (connection.options.dialect) {
      case "sqlite":
        connection.sync({
          force: force,
          logging: this.cli.logger,
          hooks: true
        }).then((db) => {
          this.logger("DATABASE :" + db.config.database + " CONNECTION : " + connectionName + " CREATE ALL TABLES", "INFO");
          return resolve(connectionName);
        }).catch((error) => {
          this.logger("DATABASE :" + connection.config.database + " CONNECTION : " + connectionName + " : " + error, "ERROR");
          return reject(error);
        });
        break;
      case "mysql":
        connection.query('SET FOREIGN_KEY_CHECKS = 0', null, {
            raw: true
          })
          .then(() => {
            connection.sync({
              force: force,
              logging: this.cli.logger,
              hooks: true
            }).then((db) => {
              this.logger("DATABASE :" + db.config.database + " CONNECTION : " + connectionName + " CREATE ALL TABLES", "INFO");
              return resolve(connectionName);
            }).catch((error) => {
              this.logger("DATABASE :" + connection.config.database + " CONNECTION : " + connectionName + " : " + error, "ERROR");
              return reject(error);
            });
          });
        break;
      }
    });
  }
}

module.exports = generateTask;