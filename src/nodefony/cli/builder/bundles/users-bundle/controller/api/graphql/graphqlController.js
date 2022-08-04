/**
 *    @Route ("/api/graphql/users")
 *
 */
const userSchema = require("./userSchema.js");
const userType = require("./userType.js");

module.exports = class graphqlController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // service entity
    this.usersService = this.get("users");
    // graphql api
    this.api = new nodefony.api.Graphql({
      name: "users-grahql-api",
      version: this.bundle.version,
      description: "Nodefony Users graphql Api",
      basePath: "/api/graphql/users",
      schema: graphqlController.schema(this.context),
      rootValue: graphqlController.provider(this.context)
    }, this.context);
  }

  /**
   *    @Method ({"GET", "POST","OPTIONS"})
   *    @Route ( "*",name="api-user-graphql")
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

  static provider(context) {
    // service entity
    const usersService = context.get("users");
    return {
      async user(field, context) {
        const user = context.getUser()
        return await usersService.findOne(field.username, user);
      },
      async users(field, context) {
        const user = context.getUser()
        let res = await usersService.find({}, {}, user);
        return res.rows;
      },
      async addUser(field, context) {
        const user = context.getUser()
        let res = await usersService.create(field, user);
        return res;
      }
    };
  }

  static schema(context) {
    return  nodefony.api.Graphql.makeExecutableSchema({
      typeDefs: [graphqlController.types(context)]
    });
  }

  static types(context) {
    return [userType, userSchema];
  }

}
