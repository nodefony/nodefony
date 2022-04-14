const JsonApi = require(path.resolve(__dirname, "jsonApi.es6"));
/*const {
  graphql,
  buildSchema
} = require('graphql');*/
nodefony.graphql = require('graphql');
nodefony["graphql-tools"] = {};
nodefony["graphql-tools"].schema = require("@graphql-tools/schema");
nodefony["graphql-tools"].merge = require('@graphql-tools/merge');

class graphqlApi extends JsonApi {

  constructor(config = {}, context = null) {
    let schema = null;
    let rootValue = null;
    let contextValue = null;
    if (config.schema) {
      schema = config.schema;
      delete config.schema;
    }
    if( config.rootValue){
      rootValue = config.rootValue;
      delete config.rootValue;
    }
    if( config.contextValue){
      contextValue = config.contextValue;
      delete config.contextValue;
    }
    super(config, context);
    this.json.operationName = null;
    this.setResultName(config.resultName || "data");
    if (schema) {
      this.setSchema(schema);
    }
    if (rootValue) {
      this.setRootValue(rootValue);
    }
    if(contextValue){
      this.setContextValue(contextValue);
    }
  }

  static mergeSchemas(options){
    return nodefony["graphql-tools"].schema.mergeSchemas(options);
  }

  static mergeTypeDefs(options){
    return nodefony["graphql-tools"].merge.mergeTypeDefs(options);
  }

  static mergeResolvers(tab){
    return nodefony["graphql-tools"].merge.mergeResolvers(tab);
  }

  async query(query, variables = null, operationName = null, fieldResolver = null, typeResolver = null) {
    const controller = this.get("controller");
    this.json.operationName = operationName;
    try {
      const conf = {
        schema: this.schema,
        source: query,
        rootValue: this.rootValue || controller,
        contextValue: this.contextValue || controller,
        variableValues: variables,
        operationName: operationName,
        fieldResolver: fieldResolver,
        typeResolver: typeResolver
      };
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
  setRootValue(rootValue) {
    this.rootValue = rootValue;
    return this.rootValue;
  }
  setContextValue(contextValue){
    this.contextValue = contextValue;
    return this.contextValue;
  }

}

nodefony.api.Graphql = graphqlApi;
module.exports = graphqlApi;
