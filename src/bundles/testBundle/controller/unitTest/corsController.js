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

module.exports = nodefony.registerController("cors", function () {

    const corsController = class corsController extends nodefony.controller {

        constructor(container, context) {
            super(container, context);
        }
        httpAction(area) {
            let firewall = this.get("security");
            return this.renderJson(firewall.securedAreas[area].cors.headers);
        }
    };

    return corsController;
});
