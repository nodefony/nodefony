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
    this.socketio = this.get("socketio");
  }

  /**
   *
   *	@method indexAction
   *
   */
  indexAction() {
    switch (this.context.method) {
    case "GET":
      try {
        return this.render("socketio-bundle::index.html.twig", {
          name: "socketio-bundle"
        });
      } catch (e) {
        throw e;
      }
    }
  }
};