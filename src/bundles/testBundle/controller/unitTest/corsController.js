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

    protocolSessionAction(protocol) {
      switch (protocol) {
      case "start":
        return this.sessionService.start(this.context).then((session) => {
          return this.renderJson({
            id: session.id,
            cross: this.context.crossDomain
          });
        });
      case "http":
        return this.renderJson({
          id: this.context.session.id,
          cross: this.context.crossDomain
        });
      default:
        throw new Error("protocol " + protocol + " not defined");
      }
    }
  };

  return corsController;
});
