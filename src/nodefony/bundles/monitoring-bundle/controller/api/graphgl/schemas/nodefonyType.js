const type = `
  scalar Array
  scalar Object

  type Route {
    name: String!
    path: String
    host: String
    variables: Array
    requirements: Object
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
    createdAt: Date
    updatedAt: Date
    user: User
  }

  type resultSession {
    sessions:[Session]
    total: Int
  }

  type Jwt {
    id: Int!
    refreshToken: String!
    token: String!
    active: Boolean
    user: User
  }

  type JwtDecode {
    jwt:Jwt,
    decode:Object
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
    # bundle
    getBundle(name: String!): String
    getBundles(registred: Boolean): String
    getConfigByBundle(name: String!): String
    getBundlePackage(name: String!): String
    getServices: String
    getServicesbyBundle(name: String!): String
    outdated(bundle: String , dev: Boolean): String
    getWebpackConfigBundle(name: String, dev: Boolean): String
    # orm
    getOrm: String
    getConnectors: String
    getConnector(name: String!): String
    getEntities: String
    getEntity(name: String!): String
    getEntitiesByBundle(name: String!): String
    getEntitiesByConnector(name: String!): String
    getMigrations: String
    # sessions
    getSessions(username: String, query: Object): resultSession
    getSessionsByUser(username: String!, query: Object): resultSession
    # Request
    getRequests: String
    getRequestsById(id: String!): String
    # log
    getLogs: String
    # Jwt
    getActivity(username: String) :[JwtDecode]
  }

  type Mutation {
    upMigrate(name: String!, path: String!, connector: String! ): String
    downMigrate(name: String!, path: String!, connector: String! ): String
    allMigrate(connector: String ): String
    allRevert(connector: String ): String
  }
`;

module.exports = type;
