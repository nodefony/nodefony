/**
 *	The class is a **`demo` CONTROLLER** .
 *	@class demoController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *
 */
module.exports = class demoController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
  }

  /**
   *	@method htmlAction
   */
  htmlAction(name) {
    return this.renderResponse('<h1>' + name + '</h1>');
  }

  /**
   *	@method renderAction
   */
  renderAction(name) {
    return this.render('documentation-bundle:demo:doc.html.twig', {
      name: name
    });

  }
};