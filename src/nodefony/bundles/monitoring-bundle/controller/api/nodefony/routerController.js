/**
 *	@class routerController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/nodefony/api/router")
 */

module.exports = class routerController extends nodefony.Controller {
  constructor (container, context) {
    super(container, context);
    // start session
    this.startSession();

    // graphql api
    this.api = new nodefony.api.Graphql({
      name: "nodefony-router-api",
      version: this.bundle.version,
      description: "nodefony router Api",
      basePath: "/nodefony/api/router"
    }, this.context);
  }

  /**
   *    @Method ({"GET"})
   *    @Route ( "/list",name="api-nodefony-router-list")
   */
  listAction () {
    try {
      return this.api.render(this.get("router").routes);
    } catch (e) {
      throw e;
    }
  }
};
