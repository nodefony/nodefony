const schema = /* GraphQL */`
  scalar Date
  scalar Url
  scalar Array
  scalar Object

  type Route {
    name: String!
    path: String
    host: String
    variables: Array
    bypassFirewall: Boolean
    defaultLang: String
    hash: String
    prefix: String
    schemes: String
    filePath: String
    bundle: String
    index: Int
  }

  #type Config {
  #  type: String
  #  locale: String
  #  watch : Boolean
  #}


  # the schema allows the following query:
  type Query {
    getNodefonyStatus: String
    getApplicationSettings: String
    getKernelSettings: String
    getServers : String
    getServerHttp: String
    getServerHttps: String
    getServerWebsocket: String
    getServerWebsocketSecure: String
    getNetwork: String
    getRoutes: [Route]
    getRouteByBundle(name: String!): [Route]
    getConfig: String
    getBundle(name: String!): String
    getBundles(registred: Boolean): String
    getConfigByBundle(name: String!): String
    getBundlePackage(name: String!): String
    getServices: String
    getServicesbyBundle(name: String!): String
    getOrm: String
    getConnectors: String
    getConnector(name: String!): String
    getEntities: String
    getEntity(name: String!): String
    getEntitiesByBundle(name: String!): String
    getEntitiesByConnector(name: String!): String
    getSessions: String
    getSessionsByUser(username: String!): String
    getRequests: String
    getRequestsById(id: String!): String
    getLogs: String
  }


`;
module.exports = nodefony.graphql.buildSchema(schema);
