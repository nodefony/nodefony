/*
 *
 *
 *
 *  CONTROLLER test unit
 *
 *
 *
 *
 */

module.exports = nodefony.registerController("multipart", function () {

  const multipartController = class multipartController extends nodefony.controller {

    constructor(container, context) {
      super(container, context);
    }

    requestMultiPartAction() {

      /*console.dir(this.queryFile, {
        //depth: null,
        colors: true
      });*/
      return this.renderJson({
        query: this.query,
        get: this.queryGet,
        post: this.queryPost,
        file: this.queryFile
      });
    }
  };

  return multipartController;
});
