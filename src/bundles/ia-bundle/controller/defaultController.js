
/**
 *	@class defaultController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/ia")
 */
class defaultController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

/**
 *    @Route ("*",
 *      name="route-ia-bundle-ia")
 */
  indexAction() {
    return this.render("ia-bundle::index.html.twig", {
			name: this.bundle.name,
			description: this.bundle.package.description    });

  }
}

module.exports = defaultController;
