module.exports = class logoutController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.firewall = this.get("security");
  }

  logoutAction() {
    if (this.context.session) {
      var security = this.context.session.getMetaBag("security");
      if (!security) {
        this.context.session.destroy(true);
        return this.redirect("/", null, true);
      }
      if (this.context.token) {
        switch (this.context.token.factory) {
        case "basic":
        case "digest":
          this.request.request.headers.authorization = "";
          this.response.setHeader("authorization", "");
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
          break;
        default:
          try {
            let formlogin = this.firewall.getSecuredArea(security.firewall).formLogin;
            this.context.session.destroy(true);
            if (formlogin) {
              return this.redirect(formlogin, null, true);
            }
            return this.redirect("/", null, true);
          } catch (e) {
            this.logger(e, "ERROR");
            this.context.session.destroy(true);
            return this.redirect("/", null, true);
          }
        }
      }
    }
    return this.redirect("/", null, true);
  }
};