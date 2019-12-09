module.exports = class testController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.setContextJson();
  }

  /**
   *
   *	Routing
   *
   */
  myrouteAction(page, ele) {
    return this.renderJson({
      page: page,
      element: ele
    });
  }

  requirementMethodAction( /*page, ele*/ ) {
    return this.renderJson({
      method: this.context.method,
      query: this.query,
      queryPost: this.queryPost,
      queryGet: this.queryGet,
      resolver: this.context.resolver.exception
    });
  }

  wildcardAction(ele, ele2) {
    let pattern = this.context.originUrl.path;
    return this.renderJson({
      path: pattern,
      ele: ele,
      ele2: ele2
    });
  }

  /**
   *
   *	response  status
   *
   */
  responseStatusAction(statusRoute) {

    var response = this.getResponse();
    response.setStatusCode(statusRoute);
    var status = response.getStatus();
    //console.log(status)
    var generate = this.generateUrl("response-status", {
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
  responseMessageAction(statusRoute, messageRoute) {

    var response = this.getResponse();
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
    var status = response.getStatus();
    //console.log(generate)
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
  responseQueryAction(ele, ele2) {
    var generate = this.generateUrl("response-query", {
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