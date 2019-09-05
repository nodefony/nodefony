
/**
 *	@class defaultController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/monitor")
 */
module.exports = class defaultController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

/**
 *    @Route ("*",
 *      name="route-monitor-bundle-monitor")
 */
  indexAction() {
    return this.render("monitor-bundle::index.html.twig", {
			name: this.bundle.name,
			description: this.bundle.package.description    });

  }
};
