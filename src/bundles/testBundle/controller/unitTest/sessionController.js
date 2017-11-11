//var querystring = require('querystring');
//var blueBird = require("bluebird");

module.exports = class sessionController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.sessionService = this.get("sessions");
  }

  /**
   *
   *	sessionAction
   *
   */
  sessionAction(type, message) {
    if (message) {
      return this.renderResponse(message.utf8Data);
    }
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
      return this.sessionService.start(this.context).then((session) => {
        var oldId = session.id;
        session.invalidate();
        return this.renderJson({
          id: session.id,
          oldId: oldId,
          status: session.status,
          contextSession: session.contextSession,
          strategy: session.strategy,
          name: session.name
        });
      }).catch((e) => {
        throw e;
      });
    case "migrate":
      return this.sessionService.start(this.context).then((session) => {
        var oldId = session.id;
        session.migrate();
        return this.renderJson({
          id: session.id,
          oldId: oldId,
          status: session.status,
          contextSession: session.contextSession,
          strategy: session.strategy,
          name: session.name
        });
      }).catch((e) => {
        throw e;
      });
    default:
      let id = null;
      if (this.context.session) {
        id = this.context.session.id;
      }
      return this.renderJson({
        id: id
      });
    }
  }
};
