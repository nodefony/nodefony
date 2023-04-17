const mysql = require("mysql2/promise");
const pgtools = require("pgtools");

const createMysql = function createMysql (connector, settings) {
  return mysql.createConnection({
    host: settings.options.host || "127.0.0.1",
    port: settings.options.port || "3306",
    user: settings.username || "root",
    password: settings.password || "root"
  }).then((connection) => connection.query(`CREATE DATABASE IF NOT EXISTS ${settings.dbname};`)
    .then(async (result) => {
      await this.ormService.createConnection(connector, settings);
      this.log(`Database : ${settings.dbname} create or successfully checked`, "INFO", "mysql");
      return result;
    }));
};


// eslint-disable-next-line func-style
async function createPostgres (connector, settings) {
  try {
    const config = {
      user: settings.username || "root",
      password: settings.password || "root",
      port: settings.options.port,
      host: settings.options.host
    };
    await pgtools.createdb(config, settings.dbname);
    this.ormService.forceAssociated = true;
    await this.ormService.createConnection(connector, settings);
    this.log(`Database : ${settings.dbname}  successfull created`, "INFO", "postgres");
  } catch (err) {
    if (err && err.cause.code && err.cause.code === "42P04") {
      this.log(`Database : ${settings.dbname}  successfully checked`, "INFO", "postgres");
      return;
    }
    throw err;
  }
}


/* const createPostgres = function createPostgres (connector, settings) {
  return new Promise((resolve, reject) => {
    const config = {
      user: settings.username || "root",
      password: settings.password || "root",
      port: settings.options.port,
      host: settings.options.host
    };
    pgtools.createdb(config, settings.dbname, async (err, res) => {
      if (err) {
        if (err && err.pgErr && err.pgErr.code === "42P04") {
          this.log(`Database : ${settings.dbname}  successfully checked`, "INFO", "postgres");
          return resolve(res);
        }
        return reject(err);
      }
      await this.ormService.createConnection(connector, settings);
      this.log(`Database : ${settings.dbname}  successfull created`, "INFO", "postgres");
      return resolve(res);
    });
  });
};*/

/* const deletePostgresDb = function deletePostgresDb (settings) {
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
};*/

class createTask extends nodefony.Task {
  constructor (name, command) {
    super(name, command);
    this.ormService = this.get("sequelize");
  }

  showHelp () {
    this.setHelp(
      "sequelize:create:database [force]",
      "Create database. [force] to delete database if exist  example : nodefony sequelize:create:database "
    );
  }

  async database () {
    try {
      for (const connector in this.ormService.settings.connectors) {
        const conn = this.ormService.settings.connectors[connector];
        switch (conn.driver) {
        case "mysql":
          await createMysql.call(this, connector, conn)
            .then((res) => res)
            .catch((e) => {
              throw e;
            });
          break;
        case "postgres":
          await createPostgres.call(this, connector, conn)
            .then((res) => res)
            .catch((e) => {
              throw e;
            });
          break;
        default:
        }
      }
    } catch (e) {
      throw e;
    }
  }
}

module.exports = createTask;
