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

const connectors = {};
// eslint-disable-next-line no-unused-vars
const vault = async () => {
  const serviceVault = kernel.get("vault");
  return await serviceVault.getSecret({
    path: "nodefony/data/database/mongo/connector/nodefony"
  })
    .then((secret) => secret.data.data)
    .catch((e) => {
      throw e;
    });
};

switch (kernel.appEnvironment.environment) {
  case "production":
  case "development":
  default:
    connectors.nodefony = {
      host: "localhost",
      port: 27017,
      dbname: "nodefony",
      // credentials: vault,
      settings: {
        user: "nodefony",
        pass: "nodefony",
        maxPoolSize: 50,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        connectTimeoutMS: 5000
      }
    };
}

module.exports = {
  mongoose: {
    debug: true,
    connectors
  }
};
