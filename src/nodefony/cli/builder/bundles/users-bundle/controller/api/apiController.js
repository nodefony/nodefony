/**
 *    @Route ("/api/users")
 */
module.exports = class apiController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.setJsonContext();
    this.usersService = this.get("users");
  }

  /**
   *    @Method ({"GET"})
   *    @Route ( "/{username}",name="api-user",defaults={"username" = ""})
   *
   */
  async getAction(username) {
    let result = null;
    if (username) {
      result = await this.usersService.findOne(username);
    } else {
      result = await this.usersService.find();
    }
    return this.renderJson(result);
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
