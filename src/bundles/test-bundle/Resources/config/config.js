module.exports = {

  locale: "fr__FR",

  watch: {
    controllers: true,
    config: true,
    views: true,
    translations: true,
    services: true,
    webpack: false
  },

  "http-bundle": {
    statics: {
      doc: {
        path: "doc",
        options: {
          maxAge: 30 * 24 * 60 * 60 * 1000
        }
      }
    }
  },
  "sequelize-bundle": {
    connectors: {
      myconnector: {
        driver: 'sqlite',
        dbname: path.resolve(__dirname, "..", "databases", "myconnector.db"),
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
  }

};