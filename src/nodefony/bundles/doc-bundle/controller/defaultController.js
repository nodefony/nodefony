
/**
 *	@class defaultController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/doc")
 */
class defaultController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

/**
 *    @Route ("*",
 *      name="route-doc-bundle-doc")
 */
  indexAction() {
    return this.render("doc-bundle::index.html.twig", {
			name: this.bundle.name,
			description: this.bundle.package.description    });

  }
}

module.exports = defaultController;
