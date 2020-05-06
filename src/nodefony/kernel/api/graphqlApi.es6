const JsonApi = require(path.resolve(__dirname, "jsonApi.es6"));
const {
  graphql,
  buildSchema
} = require('graphql');

class graphqlApi extends JsonApi {

  constructor(config = {}, context = null) {
    super(config, context);
    this.setResultName(config.resultName || "data");
  }

  async query(query, variables = null, operationName = null) {
    const controller = this.get("controller");
    try {
      let res = await graphql(this.schema, query, controller, this, variables, operationName);
      if (res.errors && res.errors.length) {
        throw res.errors;
      }
      return res;
    } catch (e) {
      throw e;
    }
  }

  buildSchema(schema) {
    this.schema = buildSchema(schema);
    return this.schema;
  }

}

nodefony.api.Graphql = graphqlApi;
module.exports = graphqlApi;
