const binding = require('../build/Release/webAssembly.node');

/**
 *	@class defaultController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/webAssembly")
 */
class defaultController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

/**
 *    @Route ("",
 *      name="route-webAssembly-bundle-webAssembly")
 */
  indexAction() {

    return this.render("webAssembly-bundle::index.html.twig", {
			name: this.bundle.name,
			description: this.bundle.package.description,
      binding: binding.webAssembly()
    });

  }
}

module.exports = defaultController;
