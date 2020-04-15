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

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/slides/{type}",
   *      name="app-doc-slides",
   *      defaults={type='app'}
   *    )
   */
  slidesAction(type){
    return this.render("app:documentation/slides:slides.html.twig", {
      title: "Presentation",
      type:type
    });
  }

}

module.exports = documentationController;
