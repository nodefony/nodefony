const type = `
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

  type Session {
    session_id: String!
    context: String
    Attributes: Object
    flashBag: Object
    metaBag: Object
    user: User
  }

  type Jwt {
    id: Int!
    refreshToken: String!
    token: String!
    active: Boolean
    user: User
  }

  # the schema allows the following query:
  type Query {
    getNodefonyStatus: String
    getProfilingStatus: String
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
    # sessions
    getSessions(username: String): [Session]
    getSessionsByUser(username: String!): [Session]
    getRequests: String
    getRequestsById(id: String!): String
    getLogs: String
    getMigrations: String
    outdated(bundle: String , dev: Boolean): String
  }

  type Mutation {
    upMigrate(name: String!, path: String!, connector: String! ): String
    downMigrate(name: String!, path: String!, connector: String! ): String
    allMigrate(connector: String ): String
    allRevert(connector: String ): String
  }

`

module.exports = type
