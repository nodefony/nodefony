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
      let index = new nodefony.fileClass(path.resolve(this.bundle.path, "Resources", "public", "dist", "index.html"));
      return this.renderResponse(index.content());
    } catch (e) {
      throw e;
    }
  }
};