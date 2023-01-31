class entityTask extends nodefony.Task {
  constructor (name, command) {
    super(name, command);
    this.ormService = this.get("sequelize");
  }

  showHelp () {
    this.setHelp(
      "sequelize:entity:findAll entity",
      "Query findAll ENTITY"
    );
  }

  findAll (entity) {
    return new Promise((resolve, reject) => {
      if (this.ormService.ready) {
        try {
          const conn = this.ormService.getEntity(entity);
          if (!conn) {
            const error = new Error(`ENTITY : ${entity} NOT FOUND`);
            this.log(error, "ERROR");
            return reject(error);
          }
          this.log(`ENTITY :${entity} \nEXECUTE findAll   `, "INFO");
          return conn.findAll()
            .catch((error) => {
              this.log(error, "ERROR");
              return reject(1);
            })
            .then((result) => {
              const ele = JSON.stringify(result);
              console.log(ele);
              return resolve(ele);
            });
        } catch (e) {
          return reject(e);
        }
      } else {
        this.ormService.listen(this, "onOrmReady", function (/* service*/) {
          const conn = this.ormService.getEntity(entity);
          if (!conn) {
            const error = new Error(`ENTITY : ${entity} NOT FOUND`);
            this.log(error, "ERROR");
            return reject(error);
          }
          this.log(`ENTITY :${entity} \nEXECUTE findAll   `, "INFO");
          return conn.findAll()
            .catch((error) => {
              this.log(error, "ERROR");
              return reject(error);
            })
            .then((result) => {
              const ele = JSON.stringify(result);
              console.log(ele);
              return resolve(ele);
            });
        });
      }
    });
  }
}

module.exports = entityTask;
