/**
 *	@class graphqlController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/api")
 */

const NodefonySchema = require(path.resolve(__dirname, "schemas", "nodefonySchema.js"));
const Router = require(path.resolve(__dirname, "providers", "router.js"));
const Sessions = require(path.resolve(__dirname, "providers", "sessions.js"));
const Requests = require(path.resolve(__dirname, "providers", "requests.js"));
const Logs = require(path.resolve(__dirname, "providers", "logs.js"));
const Bundle = require(path.resolve(__dirname, "providers", "bundle.js"));
const Config = require(path.resolve(__dirname, "providers", "config.js"));
const Services = require(path.resolve(__dirname, "providers", "services.js"));
const Orm = require(path.resolve(__dirname, "providers", "orm.js"));
const Nodefony = require(path.resolve(__dirname, "providers", "nodefony.js"));
let usersStaticSchema = null
let usersStaticProvider = null

if (kernel.ready) {
  usersStaticSchema = kernel.getBundles("users").getController('graphql').schema;
  usersStaticProvider = kernel.getBundles("users").getController('graphql').provider;
} else {
  kernel.on("onReady", () => {
    usersStaticSchema = kernel.getBundles("users").getController('graphql').schema;
    usersStaticProvider = kernel.getBundles("users").getController('graphql').provider;
  })
}


module.exports = class graphqlController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    try {
      // graphql api
      this.api = new nodefony.api.Graphql({
        name: "nodefony-grahql-api",
        version: this.bundle.version,
        description: "nodefony graphql Api",
        basePath: "/api/graphql",
        schema: graphqlController.schema(this),
        rootValue: graphqlController.provider(this.context)
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
    const UsersProvider = usersStaticProvider(context);
    const prov = nodefony.extend(Nodefony,
      Router,
      Config,
      Bundle,
      Services,
      Orm,
      Sessions,
      Requests,
      Logs);
    if (UsersProvider) {
      return nodefony.extend(prov, UsersProvider)
    }
    return prov
  }

  static schema(context) {
    let UsersShema = null
    const schemas = [NodefonySchema]
    if (usersStaticSchema) {
      UsersShema = usersStaticSchema(context);
      schemas.push(UsersShema)
    }
    return nodefony.api.Graphql.mergeSchemas({
      schemas: schemas
    });
  }

}
