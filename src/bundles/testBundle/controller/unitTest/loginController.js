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

module.exports = nodefony.registerController("login", function () {

    const loginController = class loginController extends nodefony.controller {

        constructor(container, context) {
            super(container, context);
        }

        loginAction() {
            return this.renderJson(this.getRoute());
        }


        logoutAction() {
            return this.renderJson({});
        }
    };

    return loginController;
});
