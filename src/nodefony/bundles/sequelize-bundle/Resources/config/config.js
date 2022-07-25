/*const {
  Transaction
} = nodefony.Sequelize;*/

module.exports = {
  locale: "en_en",
  debug: true,
  connectors: {
    nodefony: {
      driver: 'sqlite',
      dbname: path.resolve("app", "Resources", "databases", "nodefony.db"),
      options: {
        dialect: "sqlite",
        //isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        retry: {
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
    path: path.resolve(kernel.path, "migrations"),
    options: {}
  }
};
