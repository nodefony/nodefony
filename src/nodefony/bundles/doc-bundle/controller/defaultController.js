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
   *    @Route ("/doc/*",
   *      name="route-doc-bundle-doc")
   */
  indexAction() {
    return this.render("doc-bundle::index.html.twig", {
      name: this.bundle.name,
      description: this.bundle.package.description
    });

  }
  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/app/documentation/swagger",
   *      name="app-documentation-swagger"
   *    )
   */
  swaggerAction() {
    this.hideDebugBar()
    return this.render("doc-bundle:swagger:index.html.twig", {
      title: "Swagger openapi"
    });
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/app/documentation/graphql",
   *      name="app-documentation-graphql"
   *    )
   */
  graphiqlAction() {
    this.hideDebugBar()
    return this.render("doc-bundle:graphiql:index.html.twig", {
      title: "graphiql"
    });
  }
}

module.exports = defaultController;
