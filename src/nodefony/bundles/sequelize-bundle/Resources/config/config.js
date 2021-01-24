module.exports = {
  locale: "en_en",
  debug: true,
  connectors: {
    nodefony: {
      driver: 'sqlite',
      dbname: path.resolve("app", "Resources", "databases", "nodefony.db"),
      options: {
        dialect: "sqlite",
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
  }
};
