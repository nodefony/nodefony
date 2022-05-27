/**
 *	@class graphqlController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/api")
 */

const nodefonySchema = require(path.resolve(__dirname, "schemas", "nodefonySchema.js"));
const Router = require(path.resolve(__dirname, "providers", "router.js"));
const Bundle = require(path.resolve(__dirname, "providers", "bundle.js"));
const Config = require(path.resolve(__dirname, "providers", "config.js"));
const Services = require(path.resolve(__dirname, "providers", "services.js"));
const Orm = require(path.resolve(__dirname, "providers", "orm.js"));
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
   *    @Route ( "/graphql",name="api-nodefony-graphql")
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
  /**
   *    @Method ({"WEBSOCKET"})
   *    @Route (
   *     "/ws/graphql",
   *      name="api-nodefony-ws-graphql",
   *      requirements={"protocol" = "graphql-transport-ws"}
   *    )
   *    @Firewall ({bypass:true})
   */
  /*graphqlWsAction(message) {
    if(message){
      console.log("pass message", message)
    }else{
      console.log("PASS HAND",this.context.connection.pong)

      console.log("pass hanshake")
    }
  }*/

  static provider(context) {
    const usersProvider = usersStaticProvider(context);
    return nodefony.extend({}, usersProvider, Router, Config, Bundle, Services, Orm);
  }

  static schema(context) {
    const usersShema = usersStaticSchema(context);
    return nodefony.api.Graphql.mergeSchemas({
      schemas: [usersShema, nodefonySchema]
    });
  }

}

module.exports = graphqlController;
