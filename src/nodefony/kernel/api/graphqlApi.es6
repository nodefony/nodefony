const JsonApi = require(path.resolve(__dirname, "jsonApi.es6"));
/*const {
  graphql,
  buildSchema
} = require('graphql');*/
nodefony.graphql = require('graphql');

class graphqlApi extends JsonApi {

  constructor(config = {}, context = null) {
    let schema = null;
    if (config.schema) {
      schema = config.schema;
      delete config.schema;
    }
    super(config, context);
    this.json.operationName = null;
    this.setResultName(config.resultName || "data");
    if (schema) {
      this.setSchema(schema);
    }
  }

  async query(query, variables = null, operationName = null, fieldResolver = null, typeResolver = null) {
    const controller = this.get("controller");
    this.json.operationName = operationName;
    try {
      const conf = {
        schema: this.schema,
        source: query,
        rootValue: controller,
        contextValue: this,
        variableValues: variables,
        operationName: operationName,
        fieldResolver: fieldResolver,
        typeResolver: typeResolver
      }
      let res = await nodefony.graphql.graphql(conf);
      if (res.errors && res.errors.length) {
        throw res.errors;
      }
      return res;
    } catch (e) {
      throw e;
    }
  }

  buildSchema(schema) {
    this.schema = nodefony.graphql.buildSchema(schema);
    return this.schema;
  }

  setSchema(schema) {
    this.schema = schema;
    return this.schema;
  }
}

nodefony.api.Graphql = graphqlApi;
module.exports = graphqlApi;
