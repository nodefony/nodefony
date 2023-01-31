module.exports = class testController extends nodefony.controller {
  constructor (container, context) {
    super(container, context);
    this.setContextJson();
  }

  /**
   *
   *	Routing
   *
   */
  myrouteAction (page, ele) {
    return this.renderJson({
      page,
      element: ele
    });
  }

  requirementMethodAction (/* page, ele*/) {
    return this.renderJson({
      method: this.context.method,
      query: this.query,
      queryPost: this.queryPost,
      queryGet: this.queryGet,
      resolver: this.context.resolver.exception
    });
  }

  wildcardAction (ele, ele2) {
    const pattern = this.context.originUrl.path;
    return this.renderJson({
      path: pattern,
      ele,
      ele2
    });
  }

  /**
   *
   *	response  status
   *
   */
  responseStatusAction (statusRoute) {
    const response = this.getResponse();
    response.setStatusCode(statusRoute);
    const status = response.getStatus();
    // console.log(status)
    const generate = this.generateUrl("response-status", {
      st: statusRoute
    });
    return this.renderJson({
      code: status.code,
      message: status.message,
      generateUrl: generate
    });
  }

  /**
   *
   *	response  message
   *
   */
  responseMessageAction (statusRoute, messageRoute) {
    const response = this.getResponse();
    let generate = null;
    if (messageRoute === "null") {
      response.setStatusCode(statusRoute);
      generate = this.generateUrl("response-message", {
        st: statusRoute
      });
    } else {
      response.setStatusCode(statusRoute, messageRoute);
      generate = this.generateUrl("response-message", {
        st: statusRoute,
        message: messageRoute
      });
    }
    const status = response.getStatus();
    // console.log(generate)
    return this.renderJson({
      code: status.code,
      message: status.message,
      generateUrl: generate
    });
  }

  /**
   *
   *	response  query
   *
   */
  responseQueryAction (ele, ele2) {
    const generate = this.generateUrl("response-query", {
      myVariable: ele,
      myVariable2: ele2,
      queryString: this.query
    });
    return this.renderJson({
      generateUrl: generate,
      query: this.query
    });
  }
};
