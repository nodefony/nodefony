module.exports = class defaultController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
  }

  indexAction(message) {
    var realtime = this.get("realTime");
    var context = this.getContext();
    switch (this.getRequest().method) {
    case "GET":
      return this.getResponse("PING");
    case "POST":
      return realtime.handleConnection(this.getParameters("query").request, context);
    case "WEBSOCKET":
      if (message) {
        realtime.handleConnection(message.utf8Data, context);
      }
      break;
    default:
      throw new Error("REALTIME METHOD NOT ALLOWED");
    }
  }
};
