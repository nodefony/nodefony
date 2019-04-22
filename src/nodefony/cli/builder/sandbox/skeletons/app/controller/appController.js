module.exports = class appController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

  /**
   *  @see Route home in routing.js
   */
  indexAction() {
    return this.render("app::index.html.twig", {
      description: this.kernel.package.description
    });
  }

};
