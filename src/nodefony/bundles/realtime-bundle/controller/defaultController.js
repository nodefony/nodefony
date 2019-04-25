module.exports = class defaultController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.realtime = this.get("realTime");
  }

  indexAction(message) {
    switch (this.method) {
      case "GET":
        return this.getResponse("PING");
      case "POST":
        return this.realtime.handleConnection(this.getParameters("query").request, this.context);
      case "WEBSOCKET":
        if (message) {
          this.realtime.handleConnection(message.utf8Data, this.context);
        }
        break;
      default:
        throw new Error("REALTIME METHOD NOT ALLOWED");
    }
  }
};