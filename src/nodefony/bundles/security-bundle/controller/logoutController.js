module.exports = class logoutController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.firewall = this.get("security");
  }

  logoutAction() {
    if (this.context.session) {
      let security = this.context.session.getMetaBag("security");
      if (!security) {
        return this.context.session.destroy(true).then(() => {
          return this.redirect("/", null, true);
        });
      }
      if (this.context.token) {
        this.request.request.headers.authorization = "";
        this.response.setHeader("authorization", "");
        try {
          let formlogin = this.firewall.getSecuredArea(security.firewall).formLogin;
          return this.context.session.destroy(true).then(() => {
            if (formlogin) {
              return this.redirect(formlogin, null, true);
            }
            return this.redirect("/", null, true);
          });
        } catch (e) {
          this.logger(e, "ERROR");
          return this.context.session.destroy(true).then(() => {
            return this.redirect("/", null, true);
          });
        }
      }
    }
    return this.redirect("/", null, true);
  }
};