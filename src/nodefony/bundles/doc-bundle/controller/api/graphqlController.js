/**
 *	@class graphqlController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/api/graphql")
 */

const userSchema = require( path.resolve(__dirname, "..", "..", "..", "..","cli/builder/bundles/users-bundle/controller/api/graphql/userSchema.js"));
const userApi = require( path.resolve(__dirname, "..", "..", "..", "..","cli/builder/bundles/users-bundle/controller/api/graphql/usersApi.js"));


class graphqlController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();

    const schema = nodefony.api.Graphql.mergeSchemas({
      schemas: [ userSchema]
    })

    const apis =nodefony.extend( {}, userApi)

    // graphql api
    this.api = new nodefony.api.Graphql({
      name: "nodefony-grahql-api",
      version: this.bundle.version,
      description: "nodefony graphql Api",
      basePath: "/api/graphql",
      schema: schema,
      rootValue:apis
    }, this.context);

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
          this.api.logger(e, "ERROR");
          return this.api.renderError(e, 400);
        });
    } catch (e) {
      throw e;
    }
  }

}

module.exports = graphqlController;
