/**
 *    @Route ("/api/users")
 */
module.exports = class apiUserController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.usersService = this.get("users");
    this.jsonApi = new nodefony.JsonApi(this.bundle.name, this.bundle.version, this.context);
  }

  /**
   *    @Method ({"GET"})
   *    @Route ( "/{username}",name="api-user",defaults={"username" = ""})
   *
   */
  async getAction(username) {
    let result = null;
    try {
      if (username) {
        result = await this.usersService.findOne(username);
      } else {
        result = await this.usersService.find();
      }
      return this.jsonApi.render(result);
    } catch (e) {
      throw e;
    }
  }

  postMethod() {

  }

  deleteMethod() {

  }

  putMethod() {

  }

  headMethod() {

  }

  optionsMethod() {

  }

  traceMethod() {

  }

  connectMethod() {

  }


};