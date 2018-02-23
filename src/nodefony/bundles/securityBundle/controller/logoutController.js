module.exports = class logoutController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.firewall = this.get("security");
  }

  logoutAction() {
    if (this.context.session) {
      var security = this.context.session.getMetaBag("security");
      if (!security) {
        this.context.session.destroy(true).then(() => {
          return this.redirect("/", null, true);
        });
        return;
      }
      if (this.context.token) {
        this.request.request.headers.authorization = "";
        this.response.setHeader("authorization", "");
        try {
          let formlogin = this.firewall.getSecuredArea(security.firewall).formLogin;
          this.context.session.destroy(true).then(() => {
            if (formlogin) {
              return this.redirect(formlogin, null, true);
            }
            return this.redirect("/", null, true);
          });
          return;
        } catch (e) {
          this.logger(e, "ERROR");
          this.context.session.destroy(true);
          return this.redirect("/", null, true);
        }
        /*switch (this.context.token.factory) {
        case "basic":
        case "digest":
          let factory = this.firewall.getSecuredArea(security.firewall).getFactory(this.context.token.factory);
          factory.handle(this.context)
            .then(() => {
              this.context.session.destroy(true);
              return this.createUnauthorizedException();
            }).catch((error) => {
              console.log(error);
              this.context.session.destroy(true);
              return this.createUnauthorizedException();
            });
        default:
      }*/
      }
    }
    return this.redirect("/", null, true);
  }
};