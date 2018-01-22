module.exports = class logoutController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
  }

  logoutAction() {
    this.request.request.headers.authorization = "";
    if (this.context.session) {
      var security = this.context.session.getMetaBag("security");
      if (!security) {
        this.context.session.invalidate();
        return this.redirect("/", null, true);
      }
      switch (security.factory) {
      case "basic":
      case "digest":
        this.get("security").getSecuredArea(security.firewall).factory.handle(this.context, () => {
          this.context.session.invalidate();
          return this.createUnauthorizedException();
        });
        return;
      default:
        try {
          let formlogin = this.get("security").getSecuredArea(security.firewall).formLogin;
          this.context.session.invalidate();
          if (formlogin) {
            return this.redirect(formlogin, null, true);
          }
        } catch (e) {
          this.logger(e, "ERROR");
          this.context.session.invalidate();
          return this.redirect("/", null, true);
        }
      }
    }

    return this.redirect("/");
  }
};