module.exports = class oauthController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);

    this.oauth2Server = this.get("oauth2");
  }

  tokenAction() {
    return this.renderResponse("oauth2");

  }
  loginAction() {
    return this.render("securityBundle::login.html.twig");
  }

  accountAction() {
    return this.render("securityBundle::account.html.twig");
  }

  decisionAction() {
    return this.render("securityBundle::decision.html.twig");

  }
};
