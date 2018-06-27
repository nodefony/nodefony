class entityTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.ormService = this.get("sequelize");
  }

  showHelp() {
    this.setHelp("sequelize:entity:findAll entity",
      "Query findAll ENTITY"
    );
  }

  findAll(entity) {
    return new Promise((resolve, reject) => {
      this.ormService.listen(this, "onOrmReady", function ( /*service*/ ) {
        var conn = this.ormService.getEntity(entity);
        if (!conn) {
          this.logger("ENTITY : " + entity + " NOT FOUND", "ERROR");
          //this.cli.terminate(1);
          return reject(1);
        }
        this.logger("ENTITY :" + entity + " \nEXECUTE findAll   ", "INFO");
        resolve(conn.findAll()
          .catch((error) => {
            this.logger(error, "ERROR");
            //this.cli.terminate(1);
            return reject(1);
          })
          .then((result) => {
            //var attribute = result[0].$options.attributes ;
            var ele = JSON.stringify(result);
            console.log(ele);
            return resolve(ele);
          })
        );
      });
    });
  }
}

module.exports = entityTask;