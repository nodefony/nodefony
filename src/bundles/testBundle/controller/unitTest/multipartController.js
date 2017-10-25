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
            console.log("CONTROLLER :");
            //console.log(this.query)
            //console.log(this.queryPost)
            //console.log(this.queryFile)
            return this.renderJson({
                query: this.query,
                post: this.queryPost,
                //file: this.queryFile
            });
        }
    };

    return multipartController;
});
