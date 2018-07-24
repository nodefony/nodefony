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
      if (this.ormService.ready) {
        try {
          let conn = this.ormService.getEntity(entity);
          if (!conn) {
            let error = new Error("ENTITY : " + entity + " NOT FOUND");
            this.logger(error, "ERROR");
            return reject(error);
          }
          this.logger("ENTITY :" + entity + " \nEXECUTE findAll   ", "INFO");
          return conn.findAll()
            .catch((error) => {
              this.logger(error, "ERROR");
              return reject(1);
            })
            .then((result) => {
              let ele = JSON.stringify(result);
              console.log(ele);
              return resolve(ele);
            });
        } catch (e) {
          return reject(e);
        }
      } else {
        this.ormService.listen(this, "onOrmReady", function ( /*service*/ ) {
          let conn = this.ormService.getEntity(entity);
          if (!conn) {
            let error = new Error("ENTITY : " + entity + " NOT FOUND");
            this.logger(error, "ERROR");
            return reject(error);
          }
          this.logger("ENTITY :" + entity + " \nEXECUTE findAll   ", "INFO");
          return conn.findAll()
            .catch((error) => {
              this.logger(error, "ERROR");
              return reject(error);
            })
            .then((result) => {
              let ele = JSON.stringify(result);
              console.log(ele);
              return resolve(ele);
            });
        });
      }
    });
  }
}

module.exports = entityTask;