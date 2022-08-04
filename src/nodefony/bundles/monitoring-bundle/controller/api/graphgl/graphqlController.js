/**
 *	@class graphqlController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/api")
 */

const NodefonySchema = require(path.resolve(__dirname, "schemas", "nodefonySchema.js"));
const NodefonyType = require(path.resolve(__dirname, "schemas", "nodefonyType.js"));
const Router = require(path.resolve(__dirname, "providers", "router.js"));
const Sessions = require(path.resolve(__dirname, "providers", "sessions.js"));
const Requests = require(path.resolve(__dirname, "providers", "requests.js"));
const Logs = require(path.resolve(__dirname, "providers", "logs.js"));
const Bundle = require(path.resolve(__dirname, "providers", "bundle.js"));
const Config = require(path.resolve(__dirname, "providers", "config.js"));
const Services = require(path.resolve(__dirname, "providers", "services.js"));
const Orm = require(path.resolve(__dirname, "providers", "orm.js"));
const Migrations = require(path.resolve(__dirname, "providers", "migration.js"));
const Nodefony = require(path.resolve(__dirname, "providers", "nodefony.js"));
let usersStaticSchema = null
let usersStaticProvider = null

if (kernel.ready) {
  usersStaticType = kernel.getBundles("users").getController('graphql').types;
  usersStaticProvider = kernel.getBundles("users").getController('graphql').provider;
} else {
  kernel.on("onReady", () => {
    usersStaticType = kernel.getBundles("users").getController('graphql').types;
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
        schema: graphqlController.schema(this.context),
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
      Migrations,
      Logs);
    if (UsersProvider) {
      return nodefony.extend(prov, UsersProvider)
    }
    return prov
  }

  static schema(context) {
    return nodefony.api.Graphql.makeExecutableSchema({
      typeDefs: graphqlController.types(context)
    })
  }

  static types(context){
    let UserType = null ;
    const types = [NodefonyType, NodefonySchema]
    if(usersStaticType){
      UserType = usersStaticType(context);
      types.push(UserType);
    }
    return types
  }

}
