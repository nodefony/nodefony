/**
 *	@class graphqlController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/api/graphql")
 */

const nodefonySchema = require(path.resolve(__dirname, "schemas", "nodefonySchema.js"));
const router = require(path.resolve(__dirname, "router", "router.js"));
const Config = require(path.resolve(__dirname, "configurations", "config.js"));
const usersStaticProvider = kernel.getBundles("users").getController('graphql').provider;
const usersStaticSchema = kernel.getBundles("users").getController('graphql').schema;

class graphqlController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
    try {
      // graphql api
      this.api = new nodefony.api.Graphql({
        name: "nodefony-grahql-api",
        version: this.bundle.version,
        description: "nodefony graphql Api",
        basePath: "/api/graphql",
        schema: graphqlController.schema(this),
        rootValue: graphqlController.provider(this)
      }, this.context);
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  /**
   *    @Method ({"GET", "POST","OPTIONS"})
   *    @Route ( "*",name="api-nodefony-graphql")
   */
  graphqlAction() {
    try {
      return this.api.query(this.query.query, this.query.variables, this.query.operationName)
        .then((data) => {
          return this.api.render(data);
        }).catch((e) => {
          this.api.log(e, "ERROR");

          return this.api.renderError(e, 400);
        });
    } catch (e) {
      this.api.log(e, "ERROR");
      throw e;
    }
  }


  static provider(context){
      const usersProvider =  usersStaticProvider(context);
      return  nodefony.extend({}, usersProvider, router, Config);
  }

  static schema(context){
    const usersShema = usersStaticSchema(context);
    return nodefony.api.Graphql.mergeSchemas({
      schemas: [usersShema, nodefonySchema]
    });
  }

}

module.exports = graphqlController;
