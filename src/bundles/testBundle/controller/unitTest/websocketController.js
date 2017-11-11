module.exports = class websocketController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
  }

  /**
   *
   *  Routing
   *
   */
  websocketAction(code) {
    switch (code) {
    case "404":
      return this.createNotFoundException();
    case "403":
      this.response.setStatusCode(403);
      throw new Error();
    case "401":
      return this.createUnauthorizedException();
    case "500":
      throw new Error("My Error");
    default:
      return this.createNotFoundException();
    }
  }

  protocolAction() {
    //console.log(this.context.request)
    return this.renderJson({
      protocol: this.context.acceptedProtocol,
      origin: this.context.originUrl
    });
  }
  protocolSipAction() {
    return this.protocolAction();
  }

  corsAction() {
    console.log(this.context.isCrossDomain());
    return this.renderJson({
      crossDomain: this.context.isCrossDomain(),
      protocol: this.context.acceptedProtocol,
      origin: this.context.originUrl
    });
  }

};
