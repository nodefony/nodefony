class queryTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.ormService = this.get("sequelize");
  }

  showHelp() {
    this.setHelp("sequelize:query:sql connectionName 'SQL'",
      "Query sql in database connection  example : nodefony  sequelize:query:sql nodefony 'select * from users'"
    );
  }

  sql(db, sql) {
    return new Promise((resolve, reject) => {
      if (this.ormService.ready) {
        try {
          return this.query(db, sql)
            .catch((error) => {
              this.log(error, "ERROR");
              return reject(error);
            })
            .then((result) => {
              //console.log(result[0])
              var ele = JSON.stringify(result);
              console.log(ele);
              return resolve(ele);
            });
        } catch (error) {
          return reject(error);
        }
      } else {
        this.ormService.listen(this, "onOrmReady", function ( /*service*/ ) {
          return this.query(db, sql)
            .catch((error) => {
              this.log(error, "ERROR");
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

  query(db, sql) {
    let conn = this.ormService.getConnection(db);
    if (!conn) {
      this.log("CONNECTION : " + db + " NOT FOUND", "ERROR");
      throw new Error("CONNECTION : " + db + " NOT FOUND");
    }
    return conn.query(sql);
  }
}

module.exports = queryTask;
