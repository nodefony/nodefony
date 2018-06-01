module.exports = nodefony.registerCommand("mongo", () => {

  const mongo = class mongo extends nodefony.cliKernel {

    constructor(container, command, options) {

      super("mongo", container, container.get("notificationsCenter"), options);

      let cmd = command[0].split(":");
      this.ormService = this.get("mongoose");
      switch (cmd[1]) {
      case "fixtures":
        switch (cmd[2]) {
        case 'load':
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
                    var entityName = fixtures[fixture].entity;
                    var connectionName = fixtures[fixture].connection;
                    this.logger("LOAD FIXTURE ENTITY : " + entityName + " CONNECTIONS : " + connectionName, "INFO");
                    var toPush = fixtures[fixture].fixture.bind(this.ormService);
                    this.tabPromise.push(toPush);
                  }
                }
              }
            }
            this.kernel.listen(this, "onPostReady", ( /*service*/ ) => {
              let actions = this.tabPromise.map(function (ele) {
                return new Promise(ele);
              });

              Promise.all(actions)
                .catch((e) => {
                  this.logger(e, "ERROR");
                  this.terminate(1);
                })
                .then(() => {
                  this.logger("LOAD FIXTURE ENTITY :  SUCCESS");
                  this.terminate(0);
                })
                .done(() => {
                  this.terminate(1);
                });
            });
          });
          break;
        }

        break;
      default:
        this.logger(cmd[1] + " : Not found ", "ERROR");
        this.showHelp();
      }
    }
  };

  return {
    name: "mongo",
    commands: {
      fixtures: ["mongo:fixtures:load", "Load data fixtures to your database"],
    },
    cli: mongo
  };
});