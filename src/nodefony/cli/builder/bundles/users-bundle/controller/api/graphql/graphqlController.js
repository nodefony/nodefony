/**
 *    @Route ("/api/graphql/users")
 *
 *    query test {
 *      user(username: "admin") {
 *        username
 *        surname
 *        name
 *      }
 *      users {
 *        username
 *        name
 *        surname
 *        updatedAt
 *        roles
 *      }
 *    }
 *
 *    mutation addUser {
 *      addUser(username: "Jon", email: "Doe@foo.fr", password:"mypass") {
 *        username
 *        email
 *        name
 *        role  s
 *      }
 *    }
 *
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
      scalar Date
      scalar Url
      scalar Array

      type User {
        username: String!
        surname: String
        name: String
        enabled: Boolean
        userNonExpired: Boolean
        credentialsNonExpired : Boolean
        accountNonLocked: Boolean
        email : String!
        lang : String
        gender: String
        url : Url
        createdAt: Date
        updatedAt: Date
        image: String
        roles : Array
      }

      # the schema allows the following query:
      type Query {
        user(username: String!): User
        users: [User]
      }

      # this schema allows the following mutation:
      type Mutation {
        addUser(username: String!, email: String!, password: String!): User
      }
  `);
  }

  /**
   *    @Method ({"GET", "POST","OPTIONS"})
   *    @Route ( "*",name="api-user-graphql")
   *    @Firewall ({bypass:true})
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

  async user(field) {
    return await this.usersService.findOne(field.username);
  }

  async users() {
    let res = await this.usersService.find();
    return res.rows   ;
  }

  async addUser(field) {
    let res = await this.usersService.create(field);
    return res;
  }

}

module.exports = graphqlController;
