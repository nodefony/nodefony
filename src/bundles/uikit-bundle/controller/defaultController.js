/**
 *	@class defaultController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *
 */
module.exports = class defaultController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
  }

  /**
   *
   *	@method indexAction
   *
   */
  indexAction() {
    try {
      return this.render("uikit-bundle::index.html.twig", {
        name: "uikit-bundle"
      });
    } catch (e) {
      throw e;
    }
  }
  /**
   *
   *	@method docAction
   *
   */
  docAction() {
    try {
      return this.render("uikit-bundle::documentation.html.twig", {
        name: "uikit-bundle"
      });
    } catch (e) {
      throw e;
    }
  }
};