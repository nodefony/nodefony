/*
 *
 */
module.exports = class appController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

  indexAction() {
    // Example server push http2 if serverPush client is allowed
    /*this.push(path.resolve(this.bundle.publicPath, "assets", "css", "app.css"), {
      path: "/app/assets/css/app.css"
    }).catch((e) => {
      this.logger(e, "ERROR");
    });
    this.push(path.resolve(this.bundle.publicPath, "assets", "js", "app.js"), {
      path: "/app/assets/js/app.js"
    }).catch((e) => {
      this.logger(e, "ERROR");
    });*/
    let core = this.kernel.isCore ? "CORE" : this.kernel.settings.version;
    let demo = this.kernel.getBundle("demo");
    let readme = null;
    try {
      readme = new nodefony.fileClass(path.resolve(this.kernel.rootDir, "readme.md"));
    } catch (e) {
      readme = false;
    }
    return this.render("app::index.html.twig", {
      core: core,
      demo: demo ? true : false,
      user: this.context.user,
      readme: null //readme ? this.htmlMdParser(readme.content()) : false
    });
  }


  headerAction() {
    return this.render("app::header.html.twig");
  }

  footerAction() {
    let translateService = this.get("translation");
    let version = this.kernel.settings.version;
    let year = new Date().getFullYear();
    let langs = translateService.getLangs();
    let locale = this.getLocale();
    return this.render("app::footer.html.twig", {
      langs: langs,
      version: version,
      year: year,
      locale: locale,
      description: this.kernel.app.settings.App.description
    });
  }

  /**
   *
   */
  langAction() {
    if (this.query.lang) {
      if (this.context.session) {
        this.context.session.set("lang", this.query.lang);
        let route = this.context.session.getMetaBag("lastRoute");
        if (route) {
          return this.redirect(this.url(route));
        }
        return this.redirect("/");
      }
    }
    return this.redirect("/");
  }
};