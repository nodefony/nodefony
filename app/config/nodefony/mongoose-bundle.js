/**
 *   OVERRIDE ORM BUNDLE MONGOOSE
 *
 *       @see MONGO BUNDLE config for more options
 *       @more options https://mongoosejs.com/docs/connections.html
 *              https://mongoosejs.com/docs/api.html#mongoose_Mongoose-createConnection
 *
 *       By default nodefony create connector name nodefony
 *       for manage Sessions / Users
 */
module.exports = {
  mongoose: {
    debug: true,
    connectors: {
      nodefony: {
        host: "localhost",
        port: 27017,
        dbname: "nodefony",
        settings: {
          user: "nodefony",
          pass: "nodefony",
          maxPoolSize: 50,
          useNewUrlParser: true,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 5000,
          connectTimeoutMS: 5000
        }
      }
    }
  }
};
