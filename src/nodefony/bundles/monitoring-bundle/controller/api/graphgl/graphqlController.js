/**
 *@class graphqlController
 *  @constructor
 *  @param {class} container
 *  @param {class} context
 *  @Route ("/api")
 */

// schemas
const NodefonyType = require(path.resolve(__dirname, "schemas", "nodefonyType.js"));
let usersStaticType = null;
let usersStaticResolver = null;
if (kernel.ready) {
  usersStaticType = kernel.getBundles("users").getController("graphql").types;
  usersStaticResolver = kernel.getBundles("users").getController("graphql").resolvers;
} else {
  kernel.on("onReady", () => {
    usersStaticType = kernel.getBundles("users").getController("graphql").types;
    usersStaticResolver = kernel.getBundles("users").getController("graphql").resolvers;
  });
}
// resolvers
const Router = require(path.resolve(__dirname, "resolvers", "router.js"));
const Sessions = require(path.resolve(__dirname, "resolvers", "sessions.js"));
const Requests = require(path.resolve(__dirname, "resolvers", "requests.js"));
const Logs = require(path.resolve(__dirname, "resolvers", "logs.js"));
const Bundle = require(path.resolve(__dirname, "resolvers", "bundle.js"));
const Outdated = require(path.resolve(__dirname, "resolvers", "outdated.js"));
const Config = require(path.resolve(__dirname, "resolvers", "config.js"));
const Services = require(path.resolve(__dirname, "resolvers", "services.js"));
const Orm = require(path.resolve(__dirname, "resolvers", "orm.js"));
const Migrations = require(path.resolve(__dirname, "resolvers", "migration.js"));
const Nodefony = require(path.resolve(__dirname, "resolvers", "nodefony.js"));
const Jwt = require(path.resolve(__dirname, "resolvers", "jwt.js"));
const Webpack = require(path.resolve(__dirname, "resolvers", "webpack.js"));

module.exports = class graphqlController extends nodefony.Controller {
  constructor (container, context) {
    super(container, context);
    try {
      // this.startSession("graphql")
      // graphql api
      const schema = graphqlController.schema(this.context);
      this.api = new nodefony.api.Graphql({
        name: "nodefony-grahql-api",
        version: this.bundle.version,
        description: "nodefony graphql Api",
        basePath: "/api/graphql",
        schema
        // rootValue: this
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
  graphqlAction () {
    // console.log(this.getSession() ? this.getSession().contextSession : null)
    try {
      return this.api.query(this.query.query, this.query.variables, this.query.operationName)
        .then((data) => this.api.render(data))
        .catch((e) => {
          this.api.logger(this.query.query, "WARNING");
          this.api.log(e, "ERROR");
          return this.api.renderError(e, 400);
        });
    } catch (e) {
      this.api.log(e, "ERROR");
      throw e;
    }
  }

  static schema (context) {
    return nodefony.api.Graphql.makeExecutableSchema({
      typeDefs: graphqlController.types(context),
      resolvers: graphqlController.resolvers(context)
    });
  }

  static types (context) {
    const types = [NodefonyType];
    if (usersStaticType) {
      types.push(usersStaticType(context));
    }
    return types;
  }

  static resolvers (context) {
    const resolvers = [
      Nodefony,
      Config,
      Bundle,
      Outdated,
      Services,
      Router,
      Orm,
      Sessions,
      Requests,
      Logs,
      Migrations,
      Jwt,
      Webpack
    ];
    if (usersStaticResolver) {
      resolvers.push(usersStaticResolver(context));
    }
    return resolvers;
  }
};
