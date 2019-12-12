/**
 *    @Route ("/api/users")
 */
class apiController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    // service entity
    this.usersService = this.get("users");
    // api
    this.jsonApi = new nodefony.JsonApi("users-api", this.bundle.version, "Nodefony Users Api", this.context);
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/documentation",
   *      name="nodefony-users-apidoc"
   *    )
   *    @Firewall ({bypass:true})
   */
  swaggerAction() {
    return this.optionsAction();
  }

  /**
   *    @Method ({"OPTIONS"})
   *    @Route ( "",name="api-users-options",)
   */
  optionsAction() {
    try {
      let openApiConfig = require(path.resolve(this.bundle.path, "Resources", "config", "openapi", "users.js"));
      return this.jsonApi.renderSchema(openApiConfig, this.usersService.entity);
    } catch (e) {
      return this.jsonApi.renderError(e, 400);
    }
  }

  /**
   *    @Method ({"GET"})
   *    @Route ( "/{username}",name="api-user",defaults={"username" = ""})
   */
  async getAction(username) {
    let result = null;
    try {
      if (username) {
        result = await this.usersService.findOne(username, this.query);
      } else {
        result = await this.usersService.find(this.query.query, this.query);
      }
      return this.jsonApi.render(result);
    } catch (e) {
      return this.jsonApi.renderError(e);
    }
  }

  /**
   *    @Method ({"HEAD"})
   *    @Route ( "",name="api-users-head",)
   */
  headAction() {
    return this.renderResponse("");
  }

  /**
   *    @Method ({"POST"})
   *    @Route ( "",name="api-users-post")
   */
  async postAction() {
    console.log(this.query);
    let user = null;
    try {
      //user = await this.usersService.create(this.query);
      if (user) {
        return this.jsonApi.render(user);
      }
      return this.jsonApi.render({});
    } catch (e) {
      return this.jsonApi.renderError(e, 400);
    }

  }

  /**
   *    @Method ({"PUT"})
   *    @Route ( "/{username}",name="api-user-put")
   */
  async putAction(username) {
    this.log(username);
  }

  /**
   *    @Method ({"PATCH"})
   *    @Route ( "/{username}",name="api-user-patch")
   */
  async patchAction(username) {
    this.log(username);
  }

  /**
   *    @Method ({"DELETE"})
   *    @Route ( "/{username}",name="api-user-delete")
   */
  async deleteAction(username) {
    this.log(username);
  }

  /**
   *    @Method ({"TRACE"})
   *
   */
  traceAction() {
    return this.renderResponse(JSON.stringify(this.request.request.headers, null, " "), 200, {
      "Content-Type": "message/http"
    });
  }

}

module.exports = apiController;