module.exports = {
  locale: "en_en",
  debug: true,
  connectors: {
    nodefony: {
      driver: 'sqlite',
      dbname: path.resolve("app", "Resources", "databases", "nodefony.db"),
      options: {
        dialect: "sqlite",
        pool: {
          max: 5,
          min: 0,
          idle: 10000
        }
      }
    }
  }
};