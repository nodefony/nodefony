class queryTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.ormService = this.get("sequelize");
  }

  showHelp() {
    this.setHelp("sequelize:query:sql connectionName 'SQL'",
      "Query sql in database connection  example : nodefony  sequelize:query:sql nodefony  'select * from users'"
    );
  }

  sql(db, sql) {
    return new Promise((resolve, reject) => {
      this.ormService.listen(this, "onOrmReady", function ( /*service*/ ) {
        var conn = this.ormService.getConnection(db);
        if (!conn) {
          this.logger("CONNECTION : " + db + " NOT FOUND", "ERROR");
          return reject(1);
        }
        this.logger("CONNECTION : " + db + " \nEXECUTE REQUEST  : " + sql, "INFO");
        return resolve(conn.query(sql)
          .catch((error) => {
            this.logger(error, "ERROR");
            return reject(error);
          })
          .then((result) => {
            //console.log(result[0])
            var ele = JSON.stringify(result);
            console.log(ele);
            return resolve(ele);
          })
        );
      });
    });
  }
}

module.exports = queryTask;