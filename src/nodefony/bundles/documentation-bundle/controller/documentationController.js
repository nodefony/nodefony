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
   *      "/search",
   *      name="nodefony-search")
   *
   */
  searchAction() {
    return new Promise((resolve, reject)=>{
      try {
        let url = this.generateUrl("nodefony-doc", {
          bundle: "nodefony"
          //version: this.defaultVersion
        }, true);
        if (this.query.search) {
          let webCrawler = this.get("webCrawler");
          webCrawler.siteAll(url, this.query.search, this.context, (data) => {
            return resolve( this.renderJson(data) );
          });
        } else {
          return resolve(this.renderJson({}));
        }
      }catch(e){
        return reject(e);
      }
    });

  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/notes.html",
   *      name="nodefony-slides-notes")
   *
   */
  notesAction() {
    this.hideDebugBar();
    return this.render("documentation:documentation/slides/notes:notes.html.twig");
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/{bundle}/slides",
   *      name="nodefony-slides",
   *      defaults={"bundle" = "nodefony"})
   *
   */
  slidesAction(bundle) {
    this.hideDebugBar();
    let readme = null;
    if (bundle === "nodefony") {
      readme = path.resolve(this.kernel.rootDir, "README.md");
      return this.render("documentation:documentation/slides:index.html.twig", {
        title: "README",
        readme: this.htmlMdParser(new nodefony.fileClass(readme).content())
      });
    } else {
      return this.forward(`${bundle}:documentation:slides`);
    }
  }

  /*slidesServerAction() {
    this.hideDebugBar();
    return this.render("documentation:slides:slides-server.html.twig");
  }

  notesServerAction() {
    this.hideDebugBar();
    return this.render("documentation:slides:notes-server.html.twig");
  }*/

  /**
   *    @Method ({"GET"})
   *    @Route ("/{bundle}",
   *        name="nodefony-doc",
   *        defaults={"bundle" = "nodefony"})
   */
  indexAction(bundle) {
    if (bundle === "nodefony") {
      return this.render(`documentation:documentation:index.html.twig`, {
        title: bundle,
        bundle: this.kernel.bundles,
        url: this.bundle.settings.github.url
      });
    } else {
      try {
        return this.forward(`${bundle}:documentation:index`);
      }catch(e){
        return this.render(`documentation:documentation:progress.html.twig`, {
          title: bundle,
          bundle: bundle
        });
      }
    }
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/{bundle}/readme",
   *      name="nodefony-readme",
   *      defaults={"bundle" = "nodefony"})
   *
   */
  readmeAction(bundle) {
    let readme = null;
    if (bundle === "nodefony") {
      readme = path.resolve(this.kernel.rootDir, "README.md");
      return this.render("documentation:documentation:readme.html.twig", {
        title: "README",
        readme: this.htmlMdParser(new nodefony.fileClass(readme).content(), {
          linkify: true,
          typographer: true
        })
      });
    } else {
      if (this.kernel.bundles[bundle]) {
        readme = path.resolve(this.kernel.bundles[bundle].path, "README.md");
      }
      return this.render(`${bundle}:documentation:readme.html.twig`, {
        title: "README",
        readme: this.htmlMdParser(new nodefony.fileClass(readme).content(), {
          linkify: true,
          typographer: true
        })
      });
    }
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/nodefony/{section}/{subsection}",
   *        defaults={"subsection" = ""},
   *        name="nodefony-doc-index")
   */
  nodefonyAction(section, subsection) {
    if (subsection)  {
      return this.render(`documentation:nodefony/${section}/${subsection}:index.html.twig`, {});
    }
    return this.render(`documentation:nodefony/${section}:index.html.twig`, {});
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

}

module.exports = documentationController;
