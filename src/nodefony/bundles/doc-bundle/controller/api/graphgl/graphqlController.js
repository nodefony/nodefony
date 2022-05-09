/**
 *	@class graphqlController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/api/graphql")
 */

const userSchema = require(path.resolve(__dirname, "..", "..", "..", "..", "..", "cli/builder/bundles/users-bundle/controller/api/graphql/userSchema.js"));
const user = require(path.resolve(__dirname, "..", "..", "..", "..", "..", "cli/builder/bundles/users-bundle/controller/api/graphql/usersApi.js"));
const nodefonySchema = require(path.resolve(__dirname, "schemas", "nodefonySchema.js"));
const router = require(path.resolve(__dirname, "router", "router.js"))
const config = require(path.resolve(__dirname, "configurations", "config.js"))

class graphqlController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
    try {
      const schema = nodefony.api.Graphql.mergeSchemas({
        //schemas: [userSchema]
        schemas: [userSchema, nodefonySchema]
      })

      const apis = nodefony.extend({}, user, router, config)
      // graphql api
      this.api = new nodefony.api.Graphql({
        name: "nodefony-grahql-api",
        version: this.bundle.version,
        description: "nodefony graphql Api",
        basePath: "/api/graphql",
        schema: schema,
        rootValue: apis
      }, this.context);
    } catch (e) {
      this.log(e, "ERROR");
      throw e
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

}

module.exports = graphqlController;
