const fs = require('fs');

console.log(process.cwd());
module.exports = {
  development: {
    username: "root",
    password: "nodefony",
    database: "database_development",
    dbname: "nodefony.db",
    dialect: "sqlite"
  },
  test: {
    username: "root",
    password: "nodefony",
    database: "database_test",
    dbname: "nodefony.db",
    dialect: "sqlite"
  },
  production: {
    username: "root",
    password: "nodefony",
    database: "database_production",
    dbname: "nodefony.db",
    dialect: "sqlite"
  }
};