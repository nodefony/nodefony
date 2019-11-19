const User = require(path.resolve(__dirname, "..", "src", "user.js"));
/**
 *    @Route ("/api/users")
 */
module.exports = class apiController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);

  }

  /**
   *    @Method ({"GET"})
   *    @Route ( "/{username}",name="api-user",defaults={"username" = ""})
   *
   */
  async getAction(username){
    const user = new User(this);
    let result = null;
    if ( username){
      result = await user.findOne(username);
    }else{
      result = await user.find();
    }
    return this.renderJson(result);
  }

  postMethod(){

  }

  deleteMethod(){

  }

  putMethod(){

  }

  headMethod(){

  }

  optionsMethod(){

  }

  traceMethod(){

  }

  connectMethod(){

  }


};
