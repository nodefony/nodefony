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
    let tab = [];
    this.ormService.listen(this, "onConnect", (connectionName, connection /*, service*/ ) => {
      this.logger("DATABASE  : " + connection.options.dialect + " CONNECTION : " + connectionName, "INFO");

      tab.push(new Promise((resolve, reject) => {
        this.logger("DATABASE SYNC : " + connectionName);
        switch (connection.options.dialect) {
        case "sqlite":
          connection.sync({
            force: force,
            logging: this.cli.logger,
            hooks: true
          }).then((db) => {
            this.logger("DATABASE :" + db.config.database + " CONNECTION : " + connectionName + " CREATE ALL TABLES", "INFO");
            resolve(connectionName);
          }).catch((error) => {
            this.logger("DATABASE :" + connection.config.database + " CONNECTION : " + connectionName + " : " + error, "ERROR");
            reject(error);
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
                resolve(connectionName);
              }).catch((error) => {
                this.logger("DATABASE :" + connection.config.database + " CONNECTION : " + connectionName + " : " + error, "ERROR");
                reject(error);
              });
            });
          break;
        }
      }));
    });
    this.ormService.listen(this, "onOrmReady", ( /*service*/ ) => {
      Promise.all(tab)
        .catch((e) => {
          this.logger(e, "ERROR");
          this.cli.terminate(1);
        })
        .done(() => {
          this.cli.terminate(0);
        });
    });
  }


}

module.exports = generateTask;