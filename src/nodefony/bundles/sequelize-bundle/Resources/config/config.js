const {
  //Transaction,
  Sequelize
} = nodefony.Sequelize;

module.exports = {
  locale: "en_en",
  debug: true,
  strategy: "migrate", // sync || migrate || none  when nodefony build  or  nodefony install
  //watch: true,
  connectors: {
    nodefony: {
      driver: 'sqlite',
      dbname: path.resolve("app", "Resources", "databases", "nodefony.db"),
      options: {
        dialect: "sqlite",
        //isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
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
