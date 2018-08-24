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
      if (this.ormService.ready) {
        return this.loadFixture()
          .then((ele) => {
            return resolve(ele);
          })
          .catch((e) => {
            return reject(e);
          });
      }
      this.ormService.listen(this, "onOrmReady", ( /*service*/ ) => {
        try {
          this.tabPromise = this.findFixtures();
        } catch (e) {
          return reject(e);
        }
      });
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
            this.logger(e, "ERROR");
            return reject(e);
          });
      });
    });
  }

  loadFixture() {
    return new Promise((resolve, reject) => {
      this.tabPromise = this.findFixtures();
      let actions = this.tabPromise.map(function (ele) {
        return new Promise(ele);
      });
      return Promise.all(actions)
        .then((ele) => {
          return resolve(ele);
        })
        .catch((e) => {
          return reject(e);
        });
    });
  }

  findFixtures() {
    let bundles = this.ormService.kernel.bundles;
    let tabPromise = [];
    for (let bundle in bundles) {
      let fixtures = bundles[bundle].getFixtures();
      if (Object.keys(fixtures).length) {
        for (let fixture in fixtures) {
          if (fixtures[fixture].type === "sequelize") {
            this.logger("LOAD FIXTURES BUNDLE : " + bundles[bundle].name, "INFO");
            this.ormService.getConnection(fixtures[fixture].connection);
            this.ormService.getEntity(fixtures[fixture].entity);
            var entityName = fixtures[fixture].entity;
            var connectionName = fixtures[fixture].connection;
            this.logger("LOAD FIXTURE ENTITY : " + entityName + " CONNECTIONS : " + connectionName, "INFO");
            var toPush = fixtures[fixture].fixture.bind(this.ormService);
            tabPromise.push(toPush);
          }
        }
      }
    }
    return tabPromise;
  }
}
module.exports = fixturesTask;