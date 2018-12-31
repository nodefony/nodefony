module.exports = class loginController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.firewall = this.get("security");
    this.startSession();
  }

  /**
   *    @Method ({ "GET"})
   *    @Route (
   *      "/login/{type}",
   *      name="login",
   *      defaults={"type" = "nodefony"},
   *      requirements={"type" = "\w+"}
   *    )
   */
  loginAction(type) {
    let area = this.firewall.getSecuredArea(type);
    let action = "/" + type;
    if (area && area.checkLogin) {
      action = area.checkLogin;
    }
    return this.render("app:login:login.html.twig", {
      type: type,
      action: action,
      year: new Date().getFullYear()
    });
  }

  /**
   *    @Method ({ "GET"})
   *    @Route ("/logout", name="logout")
   */
  logoutAction() {
    return this.firewall.logout(this.context)
      .catch((e) => {
        throw e;
      });
  }

};