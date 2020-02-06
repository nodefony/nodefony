/**
 *    @Route ("/documentation/elastic")
 */
class documentationController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

  indexAction(){
    let readme = path.resolve(this.bundle.path,"README.md") ;
    return this.render("elastic:documentation:index.html.twig", {
      title: "README",
      readme:this.htmlMdParser(new nodefony.fileClass(readme).content())
    });
  }

}

module.exports = documentationController;
