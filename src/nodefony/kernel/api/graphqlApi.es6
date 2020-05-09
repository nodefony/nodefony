const JsonApi = require(path.resolve(__dirname, "jsonApi.es6"));
/*const {
  graphql,
  buildSchema
} = require('graphql');*/
nodefony.graphql = require('graphql');

class graphqlApi extends JsonApi {

  constructor(config = {}, context = null) {
    let schema = null;
    if (config.schema){
      schema = config.schema;
      delete config.schema;
    }
    super(config, context);
    this.json.operationName = null;
    this.setResultName(config.resultName || "data");
    if ( schema ){
      this.setSchema(schema);
    }
  }

  async query(query, variables = null, operationName = null) {
    const controller = this.get("controller");
    this.json.operationName = operationName;
    try {
      let res = await nodefony.graphql.graphql(this.schema, query, controller, this, variables, operationName);
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

  setSchema(schema){
    this.schema = schema ;
    return this.schema ;
  }
}

nodefony.api.Graphql = graphqlApi;
module.exports = graphqlApi;
