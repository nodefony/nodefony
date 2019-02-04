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
    this.hideDebugBar();
    return this.render("documentation:slide:index.html.twig");
  }

  notesAction() {
    this.hideDebugBar();
    return this.render("documentation:slide:notes.html.twig");
  }
};