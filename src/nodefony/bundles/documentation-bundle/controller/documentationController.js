/**
 *    @Route ("/documentation")
 */
class documentationController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "",
   *      name="nodefony-doc"
   *    )
   */
  indexAction(){
    return this.render("documentation:documentation:doc.html.twig", {
      title: "nodefony",
      bundles:this.kernel.bundles,
      include:""
    });
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/nodefony/readme",
   *      name="nodefony-readme"
   *    )
   */
  readmeAction(){
    let readme = path.resolve(this.kernel.rootDir,"README.md") ;
    return this.render("documentation:documentation:readme.html.twig", {
      title: "README",
      readme:this.htmlMdParser(new nodefony.fileClass(readme).content(),{
        linkify: true,
        typographer: true
      })
    });
  }

  /**
   *    @Method ({ "GET"})
   *    @Route ("/lang", name="nodefony-doc-lang")
   */
  langAction() {
    if (this.query.language) {
      if (this.session) {
        this.session.set("lang", this.query.language);
        let route = this.session.getMetaBag("lastRoute");
        if (route) {
          return this.redirect(this.url(route));
        }
      }
    }
    let referer = this.request.getHeader("referer");
    if (referer) {
      return this.redirect(referer);
    }
    return this.redirect("/");
  }

  /**
   *
   */
  headerAction(version) {
    return this.render("documentation:documentation:header.html.twig", {
      langs: this.get("translation").getLangs(),
      locale: this.getLocale(),
      version: version || this.defaultVersion,
      bundle: "nodefony"
    });
  }

  /**
   *
   */
  footerAction() {
    let version = this.kernel.settings.version;
    return this.render("documentation:documentation:footer.html.twig", {
      version: version,
      year: new Date().getFullYear()
    });
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/slides",
   *      name="nodefony-slides"
   *    )
   */
  slidesAction(){
    let readme = path.resolve(this.bundle.path,"README.md") ;
    return this.render("documentation:slides:nodefony.html.twig", {
      title: "README",
      readme:this.htmlMdParser(new nodefony.fileClass(readme).content())
    });
  }

}

module.exports = documentationController;
