/**
 *  OVERRIDE ORM SEQUELIZE BUNDLE
 *
 *       @see SEQUELIZE BUNDLE config for more options
 *       @more options https://sequelize.org/docs/v6/other-topics/dialect-specific-things/
 *
 *       Nodefony Database Management
 *        dialect :               'mysql'|'sqlite'|'postgres'|'mssql'
 *
 *       By default nodefony create  connector name nodefony ( driver sqlite )
 *       for manage Sessions / Users
 *
 *       For mysql/mariadb create database nodefony before :
 *
 *       $ nodefony sequelize:create:database [force]  => Create database
 *
 *       Synchronize entities :
 *       $ nodefony sequelize:sync [force]    => Create tables index ...
 *
 *       Here create new databases connectors
 *       and use for sync connectors :
 *       nodefony sequelize:sync
 *
 *        connectors: {
 *         nodefony: {
 *           driver: "mysql",
 *           dbname: 'nodefony',
 *           username: 'nodefony',
 *           password: 'nodefony',
 *           options: {
 *             dialect: "mysql",
 *             host: "localhost",
 *             port: "3306",
 *             pool:{
 *               max:   5,
 *               min:   0,
 *               idle:  10000,
 *               acquire:60000
 *             }
 *           }
 *         }
 *
 */
 const {
   Transaction,
   Sequelize
 } = nodefony.Sequelize;

module.exports = {
  debug: false,
  strategy: "migrate", // sync || migrate || none  when nodefony build  or  nodefony install
  connectors: {
    nodefony: {
      driver: 'sqlite',
      dbname: path.resolve("app", "Resources", "databases", "nodefony.db"),
      options: {
        dialect: "sqlite",
        isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        retry: {
          match: [
            Sequelize.ConnectionError,
            Sequelize.ConnectionTimedOutError,
            Sequelize.TimeoutError,
            /Deadlock/i,
            'SQLITE_BUSY'
          ],
          max: 5
        },
        pool: {
          max: 5,
          min: 0,
          idle: 10000
        }
      }
    }
  },
  migrations: {
    storage: "sequelize", // sequelize || memory || json
    path: path.resolve(kernel.path, "migrations", "sequelize"),
    seedeersPath: path.resolve(kernel.path, "migrations", "seedeers"),
    storageSeedeers:"json",
    options: {}
  }
};
