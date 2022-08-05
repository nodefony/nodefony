
/**
 *	@class defaultController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/vault")
 */
module.exports = class defaultController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

/**
 *    @Route ("",
 *      name="route-vault-bundle-vault")
 */
  indexAction() {
    return this.renderJson({})
  }

}
