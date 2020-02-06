/**
 *    @Route ("/documentation/framework")
 */
class documentationController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }


  indexAction(){
    let readme = path.resolve(this.bundle.path,"README.md") ;
    return this.render("framework:documentation:index.html.twig", {
      title: "README",
      readme:this.htmlMdParser(new nodefony.fileClass(readme).content())
    });
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/slides",
   *      name="framework-doc-slides"
   *    )
   */
  slidesAction(){
    return this.render("framework:documentation/slides:slides.html.twig", {
      title: "Presentation"
    });
  }

}

module.exports = documentationController;
