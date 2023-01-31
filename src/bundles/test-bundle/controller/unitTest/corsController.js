module.exports = class corsController extends nodefony.controller {
  constructor (container, context) {
    super(container, context);
    this.firewall = this.get("security");
  }

  httpAction (area) {
    return this.renderJson(this.firewall.securedAreas[area].cors.headers);
  }

  protocolSessionAction (protocol) {
    switch (protocol) {
    case "start":
      return this.renderJson({
        id: this.context.session.id,
        cross: this.context.crossDomain
      });
    case "http":
      return this.renderJson({
        id: this.context.session.id,
        cross: this.context.crossDomain
      });
    default:
      throw new Error(`protocol ${protocol} not defined`);
    }
  }
};
