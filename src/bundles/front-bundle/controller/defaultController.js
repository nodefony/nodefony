
/**
 *	@class defaultController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/front")
 */
module.exports = class defaultController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

/**
 *    @Route ("*",
 *      name="route-front-bundle-front")
 */
  indexAction() {
    return this.render("front-bundle::index.html.twig", {
			name: this.bundle.name,
			description: this.bundle.package.description    });

  }
};
