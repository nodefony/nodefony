const lib = require("./lib.js");

const flush = function (context, i) {
  context.flush("flush : " + i);
  console.log("flush : " + i);
};

/**
 */
module.exports = class defaultController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    // start session for all actions
    this.startSession();


    /*let i = 0;
    //flush(this.context, i);
    let interval = setInterval(() => {
      //flush(this.context, i++);
    }, 1);
    this.context.on("onRequestEnd", () => {
      clearInterval(interval);
      console.log("pass onrequestEnd");
    });*/

    /*let cookie = new nodefony.cookies.cookie("sboob", JSON.stringify({
      "foo": "bar"
    }), {
      signed: true,
      secure: true,
      path: "/test"
    });*/
    //this.response.addCookie(cookie);
    //console.log(this.context.cookies.sboob.unsign());

  }

  indexAction() {
    try {
      return this.render("testBundle::index.html.twig");
    } catch (e) {
      throw e;
    }
  }

  /**
   *
   */
  watcherAction() {
    return this.renderJson(lib.toJson());
  }

  /**
   *
   *    render JSON
   */
  jsonAction() {
    return this.renderJson({
      foo: "bar",
      bar: "foo"
    });
  }

  restAction() {
    let error = new Error("API");
    error.pdu = JSON.stringify(new nodefony.PDU(error.message, "ERROR", "MONGODB", "USERNOTFOUND"));
    throw error;
  }

  /**
   *
   *    DEMO WEBSOCKET
   */
  websoketAction(message) {

    switch (this.getMethod()) {
    case "WEBSOCKET":
      if (message) {
        // MESSAGES CLIENT
        this.logger(message.utf8Data, "INFO");
      } else {
        // PREPARE  PUSH MESSAGES SERVER
        // SEND MESSAGES TO CLIENTS
        var i = 0;
        var id = setInterval(() => {
          var mess = "I am a  message " + i + "\n";
          this.logger("SEND TO CLIENT :" + mess, "INFO");
          //this.context.send(mess);
          this.renderResponse(mess);
          i++;
        }, 1000);

        setTimeout(() => {
          clearInterval(id);
          // close reason , descripton
          this.context.close(1000, "NODEFONY CONTROLLER CLOSE SOCKET");
          id = null;
        }, 10000);
        this.context.listen(this, "onClose", () => {
          if (id) {
            clearInterval(id);
          }
        });
      }
      break;
    default:
      throw new Error("REALTIME METHOD NOT ALLOWED");
    }
  }
};
