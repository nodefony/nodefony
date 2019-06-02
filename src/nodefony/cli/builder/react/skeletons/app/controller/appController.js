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
    try {
      let index = path.resolve(this.bundle.publicPath, "dist", "index.html");
      let file = new nodefony.fileClass(index);
      return this.renderResponse(file.content(file.encoding));
    } catch (e) {
      throw e;
    }
  }

};
