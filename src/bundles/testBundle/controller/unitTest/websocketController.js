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
module.exports = nodefony.registerController("websocket", function(){

    const websocketController = class websocketController extends nodefony.controller {

        constructor(container, context){
            super(container, context);
        }

        /**
        *
        *  Routing
        *
        */
        ["401Action"](message){
            if (message){
                // LOG  MESSAGE CLIENT IN TERMINAL
                this.logger( message.utf8Data , "INFO");
            }else{
                return this.createUnauthorizedException();
            }
        }

        ["403Action"](){
            this.response.setStatusCode(403) ;
            throw new Error();
        }

    };

    return websocketController;
});
