const mysql = require('mysql2/promise');
const pgtools = require('pgtools');

const createMysql = function (settings) {
  return mysql.createConnection({
    host: settings.options.host || "127.0.0.1",
    port: settings.options.port || "3306",
    user: settings.username || "root",
    password: settings.password || "root",
  }).then(connection => {
    return connection.query(`CREATE DATABASE IF NOT EXISTS ${settings.dbname};`)
      .then((result) => {
        this.log(`Database : ${settings.dbname} create or successfully checked`);
        return result;
      });
  });
};

const createPostgres = function (settings) {
  return new Promise((resolve, reject) => {
    const config = {
      user: settings.username || "root",
      password: settings.password || "root",
      port: settings.options.port,
      host: settings.options.host
    };
    pgtools.createdb(config, settings.dbname, (err, res) => {
      if (err) {
        if (err && err.pgErr && err.pgErr.code === "42P04") {
          this.log(`Database : ${settings.dbname}  successfully checked`);
          return resolve(res);
        }
        return reject(err);
      }
      this.log(`Database : ${settings.dbname}  successfull created`);
      return resolve(res);
    });
  });
};

const deletePostgresDb = function (settings) {
  return new Promise((resolve, reject) => {
    const config = {
      user: settings.username || "root",
      password: settings.password || "root",
      port: settings.options.port,
      host: settings.options.host
    };
    pgtools.dropdb(config, settings.dbname, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
};

class createTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.ormService = this.get("sequelize");
  }

  showHelp() {
    this.setHelp("sequelize:create:database [force]",
      "Create database. [force] to delete database if exist  example : nodefony sequelize:create:database "
    );
  }

  async database() {
    try {
      for (let connector in this.ormService.settings.connectors) {
        let conn = this.ormService.settings.connectors[connector];
        switch (conn.driver) {
        case "mysql":
          await createMysql.call(this, conn);
          break;
        case "postgres":
          await createPostgres.call(this, conn);
          break;
        default:
          continue;
        }
      }
    } catch (e) {
      throw e;
    }
  }
}

module.exports = createTask;