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
   *    @Route ("/nodefony/manifest.json",
   *      name="index-doc-manifest")
   */
  async manifesAction() {
    const manifestPath = path.resolve(this.bundle.path,'Resources','public','manifest.json')
    const file = this.getFile(manifestPath)
    this.setContentType( "application/manifest+json");
    return await file.readAsync();
  }
  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/api/nodefony/swagger",
   *      name="api-doc-swagger"
   *    )
   */
  swaggerAction() {
    this.hideDebugBar()
    this.response.setHeader("X-Frame-Options", "SAMEORIGIN")
    return this.render("monitoring-bundle:swagger:index.html.twig", {
      title: "Swagger openapi"
    });
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/api/nodefony/graphql",
   *      name="api-doc-graphql"
   *    )
   */
  graphiqlAction() {
    this.hideDebugBar()
    this.response.setHeader("X-Frame-Options", "SAMEORIGIN")
    return this.render("monitoring-bundle:graphiql:index.html.twig", {
      title: "graphiql"
    });
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/documentation/{bundle}/readme",
   *      name="nodefony-idocumentation-readme"
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


  /**
   *    @Route ("/nodefony*",
   *      name="monitoring-index")
   */
  indexAction() {
    return this.render("monitoring-bundle::index.html.twig", {
      name: this.bundle.name,
      description: this.bundle.package.description
    });
  }



}

module.exports = defaultController;
