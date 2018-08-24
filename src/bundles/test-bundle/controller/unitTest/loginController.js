module.exports = class loginController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
  }

  loginAction() {
    return this.renderJson(this.getRoute());
  }


  logoutAction() {
    return this.renderJson({});
  }
};
