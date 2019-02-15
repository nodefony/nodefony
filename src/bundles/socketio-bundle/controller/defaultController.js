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
    this.interval = null;
  }

  /**
   *
   *	@method indexAction
   *
   */
  indexAction() {
    try {
      return this.render("socketio-bundle::index.html.twig", {
        name: "socketio-bundle"
      });
    } catch (e) {
      throw e;
    }
  }

  chatAction(eventName, message) {
    //console.log(arguments)
    switch (eventName) {
      case "connect":
        this.logger(`${eventName} : ${message.nsp.name}`);
        this.interval = setInterval(() => {
          this.context.socket.emit("message", {
            nodefony: "dqslkdjqlsdkj"
          });
        }, 10000);
        break;
      case "ready":
        this.logger(`${eventName} ${message}`);
        break;
      case "disconnect":
        console.log("disconnect");
        //this.logger(message);
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }

        break;
    }
  }

  eventsAction(eventName, message, ack) {
    //console.log(arguments)
    switch (eventName) {
      case "connect":
        this.logger(`${eventName} : ${message.nsp.name}`);
        break;
      case "ready":
        //console.log(arguments)
        this.logger(`${eventName} ${message}`);
        if (ack) {
          ack("sbobobobo")
        }
        return this.renderJson(["myevent", {
          pastis: "51"
        }]);
      case "disconnect":
        console.log("disconnect");
        break;
    }
  }


};