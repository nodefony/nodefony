const JsonApi = require(path.resolve(__dirname, "jsonApi.es6"));
const {
  graphql,
  buildSchema
} = require('graphql');

class graphqlApi extends JsonApi {

  constructor(config, context = null) {
    super(config, context);
  }

  query(query, variables = null, operationName = null) {
    const controller = this.get("controller");
    return graphql(this.schema, query, controller, this, variables, operationName);
  }

  buildSchema(schema) {
    this.schema = buildSchema(schema);
    return this.schema;
  }

}

nodefony.api.Graphql = graphqlApi;
module.exports = graphqlApi;