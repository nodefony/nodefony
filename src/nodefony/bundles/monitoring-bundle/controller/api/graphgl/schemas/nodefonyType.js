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

`

module.exports = type
