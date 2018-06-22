class queryTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.ormService = this.get("sequelize");
  }

  showHelp(help = "") {
    help += `\t${this.cli.clc.green("sequelize:query:sql connectionName 'SQL'")}\t\t Query sql in database connection  example : nodefony  sequelize:query:sql nodefony  'select * from users'`;
    console.log(help);
    return help;
  }

  sql(db, sql) {
    this.ormService.listen(this, "onOrmReady", function ( /*service*/ ) {
      var conn = this.ormService.getConnection(db);
      if (!conn) {
        this.logger("CONNECTION : " + db + " NOT FOUND", "ERROR");
        this.terminate(1);
        return;
      }
      this.logger("CONNECTION : " + db + " \nEXECUTE REQUEST  : " + sql, "INFO");
      conn.query(sql)
        .catch((error) => {
          this.logger(error, "ERROR");
          this.terminate(1);
        })
        .then((result) => {
          //console.log(result[0])
          var ele = JSON.stringify(result);
          console.log(ele);
        })
        .done(() => {
          this.cli.terminate();
        });
    });
  }


}

module.exports = queryTask;