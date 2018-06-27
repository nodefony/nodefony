class fixturesTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.ormService = this.get("sequelize");
  }

  showHelp() {
    this.setHelp("sequelize:fixtures:load",
      "Load fixtures in database"
    );
  }

  load() {
    return new Promise((resolve, reject) => {
      this.ormService.listen(this, "onOrmReady", (service) => {
        try {
          let bundles = this.ormService.kernel.bundles;
          this.tabPromise = [];
          for (let bundle in bundles) {
            let fixtures = bundles[bundle].getFixtures();
            if (Object.keys(fixtures).length) {
              for (let fixture in fixtures) {
                if (fixtures[fixture].type === "sequelize") {
                  this.logger("LOAD FIXTURES BUNDLE : " + bundles[bundle].name, "INFO");
                  service.getConnection(fixtures[fixture].connection);
                  service.getEntity(fixtures[fixture].entity);
                  var entityName = fixtures[fixture].entity;
                  var connectionName = fixtures[fixture].connection;
                  this.logger("LOAD FIXTURE ENTITY : " + entityName + " CONNECTIONS : " + connectionName, "INFO");
                  var toPush = fixtures[fixture].fixture.bind(this.ormService);
                  this.tabPromise.push(toPush);
                }
              }
            }
          }
        } catch (e) {
          return reject(e);
        }
      });
      this.kernel.listen(this, "onPostReady", ( /*service*/ ) => {
        let actions = this.tabPromise.map(function (ele) {
          return new Promise(ele);
        });
        resolve(Promise.all(actions)
          .catch((e) => {
            this.logger(e, "ERROR");
            return reject(e);
            //this.cli.terminate(1);
          })
          .then(() => {
            this.logger("LOAD FIXTURE ENTITY :  SUCCESS");
            //this.cli.terminate(0);
            return resolve(0);
          })
        );
      });
    });
  }

}

module.exports = fixturesTask;