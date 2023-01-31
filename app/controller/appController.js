module.exports = class appController extends nodefony.controller {
  constructor (container, context) {
    super(container, context);
    // start session
    this.startSession();
  }


  /**
   *  @see Route home in routing.js
   *
   *    @Route ("/",
   *      name="home")
   **/
  indexAction () {
    return this.redirectToRoute("app");
  }

  /**
   *
   *    @Route ("/app",
   *      name="app")
   **/
  appAction () {
    return this.render("app::index.html.twig", {
      user: this.getUser(),
      description: this.kernel.package.description
    });
  }

  /**
   *
   */
  headerAction () {
    let urlDoc = null;
    const doc = this.kernel.getBundles("documentation");
    if (doc) {
      urlDoc = this.generateUrl("index-documentation");
    }
    return this.render("app::header.html.twig", {
      langs: this.get("translation").getLangs(),
      locale: this.getLocale(),
      version: nodefony.version,
      urlDoc
    });
  }

  /**
   *
   */
  footerAction () {
    const {version} = this.kernel.settings;
    return this.render("app::footer.html.twig", {
      version,
      year: new Date().getFullYear()
    });
  }
};
