/**
 *    @Route ("/app/documentation")
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
   *      name="app-doc"
   *    )
   */
  indexAction(){
    let readme = path.resolve(this.bundle.path,"readme.md") ;
    return this.render("app:documentation:index.html.twig", {
      title: "README",
      readme:this.htmlMdParser(new nodefony.fileClass(readme).content())
    });
  }

}

module.exports = documentationController;
