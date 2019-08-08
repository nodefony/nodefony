module.exports = class appController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
    this.documentation = this.kernel.getBundles("documentation");
  }

  /**
   *  @see Route home in routing.js
   */
  indexAction() {
    return this.render("app::index.html.twig", {
      user: this.getUser(),
      description: this.kernel.package.description
    });
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

  /**
   *	Documentation
   *  @see Route documentation in routing.js
   */
  documentationAction() {
    if (this.documentation) {
      return this.forward("documentation:default:index");
    }
    try {
      let file = new nodefony.fileClass(path.resolve(this.kernel.rootDir, "README.md"));
      if (file) {
        let res = this.htmlMdParser(file.content(file.encoding), {
          linkify: true,
          typographer: true
        });
        return this.render("app:documentation:documentation.html.twig", {
          readme: res,
        });
      }
    } catch (e) {
      throw e;
    }
    return this.render('app:documentation:documentation.html.twig');
  }

};
