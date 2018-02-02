/**
 *	@class apiController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *
 *  @Route ("/test/firewall/api")
 */
module.exports = class apiController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
  }

  /**
   *
   *	@method indexAction
   *  @Route ("/stateless", name="api-stateless")
   */
  indexAction() {
    try {
      return this.renderJson({
        foo: "bar"
      });
    } catch (e) {
      throw e;
    }
  }

};