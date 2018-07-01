class fixturesTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.ormService = this.get("mongoose");
  }

  showHelp() {
    this.setHelp("mongo:fixtures:load", "Load data fixtures in database");
  }

  load() {
    return new Promise((resolve, reject) => {
      this.ormService.listen(this, "onOrmReady", (service) => {
        let bundles = this.ormService.kernel.bundles;
        this.tabPromise = [];
        for (let bundle in bundles) {
          let fixtures = bundles[bundle].getFixtures();
          if (Object.keys(fixtures).length) {
            for (let fixture in fixtures) {
              if (fixtures[fixture].type === "mongoose") {
                this.logger("LOAD FIXTURES BUNDLE : " + bundles[bundle].name, "INFO");
                service.getConnection(fixtures[fixture].connection);
                service.getEntity(fixtures[fixture].entity);
                let entityName = fixtures[fixture].entity;
                let connectionName = fixtures[fixture].connection;
                this.logger("LOAD FIXTURE ENTITY : " + entityName + " CONNECTIONS : " + connectionName, "INFO");
                let toPush = fixtures[fixture].fixture.bind(this.ormService);
                this.tabPromise.push(toPush);
              }
            }
          }
        }
        this.kernel.listen(this, "onPostReady", ( /*service*/ ) => {
          let actions = this.tabPromise.map(function (ele) {
            return new Promise(ele);
          });
          return Promise.all(actions)
            .then((ele) => {
              this.logger("LOAD FIXTURE ENTITY :  SUCCESS");
              return resolve(ele);
            })
            .catch((e) => {
              return reject(e);
            });

        });
      });
    });
  }
}

module.exports = fixturesTask;