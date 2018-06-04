/*
 *
 */
module.exports = class appController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
  }

  indexAction() {
    // Example server push http2 if serverPush client is allowed
    this.push(path.resolve(this.bundle.publicPath, "assets", "css", "app.css"), {
      path: "/app/assets/css/app.css"
    }).catch((e) => {
      this.logger(e, "ERROR");
    });
    this.push(path.resolve(this.bundle.publicPath, "assets", "js", "app.js"), {
      path: "/app/assets/js/app.js"
    }).catch((e) => {
      this.logger(e, "ERROR");
    });
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
      readme: readme ? this.htmlMdParser(readme.content()) : false
    });
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
    });
  }
};