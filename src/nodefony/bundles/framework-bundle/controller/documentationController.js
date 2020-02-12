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

  /**
   *    @Method ({"GET"})
   *    @Route ("/{section}/{subsection}",
   *        defaults={"subsection" = ""},
   *        name="framework-doc")
   */
  sectionAction(section, subsection){
    if ( subsection ){
      return this.render(`framework:documentation/${section}/${subsection}:index.html.twig`, {});
    }
    return this.render(`framework:documentation/${section}:index.html.twig`, {});
  }


}

module.exports = documentationController;
