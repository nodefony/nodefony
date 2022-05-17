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
    getRoutes: [Route]
    getRouteByBundle(name: String!): [Route]
    getConfig :String
    getConfigByBundle(name: String!):String
    getBundlePackage(name: String!):String
  }





`;
module.exports = nodefony.graphql.buildSchema(schema);
