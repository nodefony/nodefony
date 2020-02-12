/**
 *    @Route ("/test/unit")
 */
module.exports = class sessionController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.sessionService = this.get("sessions");
    let route = this.getRoute();
    let type = this.context.resolver.variables.type;
    if ((route.name === "test-session") && (type !== "start" && type !== "none")) {
      this.startSession();
    }
  }

  /**
   *    @Route ("/session/{type}",
   *      name="test-session",
   *      defaults={"type" = "callback"})
   *    @Method ({"GET", "POST", "WEBSOCKET"})
   *
   */
  async sessionAction(type, message) {
    if (message) {
      return this.context.send(message.utf8Data);
    }
    let oldId = null;
    switch (type) {
    case "start":
      return this.sessionService.start(this.context).then((session) => {
        return this.renderJson({
          id: session.id,
          status: session.status,
          contextSession: session.contextSession,
          strategy: session.strategy,
          name: session.name
        });
      }).catch((e) => {
        throw e;
      });
    case "invalidate":
      oldId = this.context.session.id;
      await this.context.session.invalidate();
      return this.renderJson({
        id: this.context.session.id,
        oldId: oldId,
        status: this.context.session.status,
        contextSession: this.context.session.contextSession,
        strategy: this.context.session.strategy,
        name: this.context.session.name
      });

    case "migrate":
      oldId = this.context.session.id;
      await this.context.session.migrate();
      return this.renderJson({
        id: this.context.session.id,
        oldId: oldId,
        status: this.context.session.status,
        contextSession: this.context.session.contextSession,
        strategy: this.context.session.strategy,
        name: this.context.session.name
      });
    default:
      if (this.context.session) {
        oldId = this.context.session.id;
      }
      return this.renderJson({
        id: oldId
      });
    }
  }

  /**
   *    @Route ("/session/get/attributes",
   *      name="test-session-attr",
   *      defaults={})
   *    @Method ({"GET", "POST", "WEBSOCKET"})
   *
   */
  attributesAction() {
    let kernelMeta = this.session.getMetaBag("kernel");
    if (!kernelMeta) {
      this.session.setMetaBag("kernel.domain", this.kernel.domain);
    }
    return this.renderJson(kernelMeta);
  }

};
