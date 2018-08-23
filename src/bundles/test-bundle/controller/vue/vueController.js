/**
 *	@class vueController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *
 */
module.exports = class vueController extends nodefony.controller {

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
      return this.render("test-bundle:vue:index.html.twig", {
        name: "Vue.js"
      });
    } catch (e) {
      throw e;
    }
  }
};