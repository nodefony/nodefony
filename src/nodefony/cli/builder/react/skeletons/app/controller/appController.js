module.exports = class appController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

  /**
   *  @see Route home in routing.js
   */
  indexAction() {
    try {
      let index = path.resolve(this.bundle.publicPath, "dist", "index.html");
      let file = new nodefony.fileClass(index);
      return this.renderResponse(file.content(file.encoding));
    } catch (e) {
      throw e;
    }
  }

  /**
   *
   */
  headerAction() {
    let urlDoc = null;
    if (this.documentation) {
      urlDoc = this.generateUrl("documentation");
    }
    return this.render("app::header.html.twig", {
      langs: this.get("translation").getLangs(),
      locale: this.getLocale(),
      version: nodefony.version,
      urlDoc: urlDoc
    });
  }

  /**
   *
   */
  footerAction() {
    let version = this.kernel.settings.version;
    return this.render("app::footer.html.twig", {
      version: version,
      year: new Date().getFullYear()
    });
  }


};