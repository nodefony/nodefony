/**
 *  The class is a **`slide` CONTROLLER** .
 *  @class default
 *  @constructor
 *  @param {class} container
 *  @param {class} context
 *
 */
module.exports = class slideController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
  }

  indexAction() {
    return this.render("documentation:slide:index.html.twig");
  }
};