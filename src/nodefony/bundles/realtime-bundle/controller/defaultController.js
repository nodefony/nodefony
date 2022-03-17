module.exports = class defaultController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.realtime = this.get("realTime");
  }

  /**
   *    @Route ("/nodefony/socket",
   *      name="socket",requirements={"protocol" = "bayeux"})
   */
  indexAction(message) {
    switch (this.method) {
    case "GET":
      return this.getResponse("PING");
    case "POST":
      const res = this.realtime.handleConnection(this.query, this.context);
      return this.renderJson(res);
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
