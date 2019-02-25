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
    //return this.render("documentation:slide:slides-demo.html.twig");
    return this.render("documentation:slides:nodefony.html.twig");
  }

  notesAction() {
    this.hideDebugBar();
    return this.render("documentation:slides/notes:notes.html.twig");
  }

  /*slidesServerAction() {
    this.hideDebugBar();
    return this.render("documentation:slides:slides-server.html.twig");
  }

  notesServerAction() {
    this.hideDebugBar();
    return this.render("documentation:slides:notes-server.html.twig");
  }*/

};