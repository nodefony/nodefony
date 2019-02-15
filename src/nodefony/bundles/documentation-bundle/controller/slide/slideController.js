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

  slidesAction() {
    this.hideDebugBar();
    return this.render("documentation:slide:slides-demo.html.twig");
  }

  notesAction() {
    this.hideDebugBar();
    return this.render("documentation:slide:notes.html.twig");
  }

  /*slidesServerAction() {
    this.hideDebugBar();
    return this.render("documentation:slide:slides-server.html.twig");
  }

  notesServerAction() {
    this.hideDebugBar();
    return this.render("documentation:slide:notes-server.html.twig");
  }*/

};