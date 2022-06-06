/**
 *	@class defaultController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 */
class defaultController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

  /**
   *    @Route ("/doc/manifest.json",
   *      name="index-doc-manifest")
   */
  manifesAction() {
    const manifestPath = path.resolve(this.bundle.path,'Resources','public','manifest.json')
    const file = this.getFile(manifestPath)
    this.setContentType( "application/manifest+json");
    return file.readAsync();
  }

  /**
   *    @Route ("/doc*",
   *      name="index-documentation")
   */
  indexAction() {
    return this.render("documentation-bundle::index.html.twig", {
      name: this.bundle.name,
      description: this.bundle.package.description
    });
  }



  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/app/documentation/swagger",
   *      name="api-doc-swagger"
   *    )
   */
  swaggerAction() {
    this.hideDebugBar()
    return this.render("documentation-bundle:swagger:index.html.twig", {
      title: "Swagger openapi"
    });
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/app/documentation/graphql",
   *      name="api-doc-graphql"
   *    )
   */
  graphiqlAction() {
    this.hideDebugBar()
    return this.render("documentation-bundle:graphiql:index.html.twig", {
      title: "graphiql"
    });
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/nodefony/documentation/{bundle}/readme",
   *      name="nodefony-documentation-readme"
   *    )
   */
  async readmeAction(bundle){
    let Bundle = null
    if( bundle === "nodefony"){
      Bundle = this.kernel
    }else{
      Bundle = this.kernel.getBundle(bundle)
    }

    try {
      const readmePath = path.resolve(Bundle.path, "README.md")
      if( readmePath ){
        const readme = this.getFile(readmePath)
        return this.renderJson({readme: await readme.readAsync()})
      }
      throw new Error('readme not found')
    }catch(e){
      return this.createNotFoundException('readme not found')
    }

  }


}

module.exports = defaultController;
