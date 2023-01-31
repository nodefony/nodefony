module.exports = {

  locale: "fr__FR",

  watch: {
    controllers: false,
    config: false,
    views: false,
    translations: false,
    services: false,
    webpack: false
  },

  "mail-bundle": {

    /* nodemailer: {
      default: "free",
      transporters: {
        free: {
          host: "smtp.free.fr",
          port: 465,
          secure: true, // true for 465, false for other ports
          auth: {
            user: "xxxxxx",
            pass: "xxxxxx"
          }
        }
      }
    }*/
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
        driver: "sqlite",
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
