/**
 *    @Route ("/api/graphql/users")
 */
class graphqlController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // service entity
    this.usersService = this.get("users");
    this.api = new nodefony.api.Graphql({
      name: "users-grahql-api",
      version: this.bundle.version,
      description: "Nodefony Users graphql Api",
      basePath: "/api/graphql/users"
    }, this.context);
    this.api.buildSchema(`
      type Query {
        hello: String
      }
    `);

  }

  /**
   *    @Method ({"OPTIONS"})
   *    @Route ( "",name="api-users-options",)
   */
  optionsAction() {
    try {
      return this.api.renderSchema();
    } catch (e) {
      return this.api.renderError(e, 400);
    }
  }

  /**
   *    @Method ({"GET", "POST"})
   *    @Route ( "*",name="api-user-graphql")
   *    @Firewall ({bypass:true})
   */
  graphqlAction() {
    try {
      return this.api.query(this.query.query, this.query.variables, this.query.operationName)
        .then((data) => {
          return this.api.render(data.data);
        }).catch((e) => {
          throw e;
        });
    } catch (e) {
      throw e;
    }
  }

  hello(field, api) {
    return 'Hello world!';
  }

}

module.exports = graphqlController;