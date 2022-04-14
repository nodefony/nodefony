module.exports = class websocketController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.context.createCookie("sboob", "dkkkkkkkkk")
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
    return this.renderJson({
      crossDomain: this.context.isCrossDomain(),
      protocol: this.context.acceptedProtocol,
      origin: this.context.originUrl
    });
  }

  /**
   *    @Method ({"WEBSOCKET"})
   *    @Route ("/testws/query",
   *      name="route-wss-query")
   */
  wsSecureAction(message){
    const api = new nodefony.api.Json({
      name: "Test-Api",
      version: this.bundle.version,
      description: "Test Api Description",
    }, this.context);
    let user = this.getUser()
    let session = this.session
    //console.log(user, this.context.getCookies())
    if (!message){
      return api.render({
        handshake:"OK",
        user,
        idSession:session.id
      })
    }
    return api.render({
      message,
      user,
      idSession:session.id
    })
  }

  /**
   *    @Route ("/testws/cookie",
   *      name="route-wss-cookie")
   *    @Method ({"WEBSOCKET"})
   */
  wsSecureCookiesAction(message){
    const api = new nodefony.api.Json({
      name: "Test-Api",
      version: this.bundle.version,
      description: "Test Api Description",
    }, this.context);
    let user = this.getUser()
    let session = this.session
    console.log(user)
    if (!message){
      return api.render({
        handshake:"OK",
        user,
        idSession:session.id
      })
    }
    return api.render({
      message,
      user,
      idSession:session.id
    })
  }

  /**
   *    @Route ("/test/firewall/api/testws/cookie",
   *      name="route-wss-firewall-cookie")
   *    @Method ({"WEBSOCKET"})
   */
   /*
    var sock = new WebSocket("wss://localhost:5152/test/firewall/api/testws/cookie")
    sock.onmessage= function(msg){console.log(JSON.parse(msg.data))}
    sock.onerror= function(error){console.log(error.data)}
    sock.onclose= function(error){console.log(error.code, error.reason)}
  */
  wsSecureFirewallCookiesAction(message){
    const api = new nodefony.api.Json({
      name: "Test-Api",
      version: this.bundle.version,
      description: "Test Api Description",
    }, this.context);
    let user = this.getUser()
    let session = this.session
    console.log(user)
    if (!message){
      return api.render({
        handshake:"OK",
        user,
        idSession:session.id
      })
    }
    return api.render({
      message,
      user,
      idSession:session.id
    })
  }




};
