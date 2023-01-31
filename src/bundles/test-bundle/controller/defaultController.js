const lib = require("./lib.js");


/**
 */
module.exports = class defaultController extends nodefony.controller {
  constructor (container, context) {
    super(container, context);
    // start session for all actions
    this.startSession();

    /* let i = 0;
    //flush(this.context, i);
    let interval = setInterval(() => {
      //flush(this.context, i++);
    }, 1);
    this.context.on("onRequestEnd", () => {
      clearInterval(interval);
      console.log("pass onrequestEnd");
    });*/

    /* let cookie = new nodefony.cookies.cookie("test", JSON.stringify({
      "foo": "bar"
    }), {
      signed: true,
      secure: true,
      path: "/test"
    });*/
    // this.response.addCookie(cookie);
    // console.log(this.context.cookies.test.unsign());
  }

  indexAction () {
    try {
      return this.render("testBundle::index.html.twig", {
        lib: lib.toJson(),
        admin: this.isGranted("ROLE_ADMIN")
      });
    } catch (e) {
      throw e;
    }
  }

  index2Action () {
    try {
      throw new Error("pass error");
    } catch (e) {
      return this.render("testBundle::index.html.twig", {
        lib: lib.toJson(),
        admin: this.isGranted("ROLE_ADMIN"),
        error: e
      });
    }
  }

  myPromise () {
    return new Promise((resolve, reject) => {
      try {
        let iterator = 0;
        const interval = setInterval(() => {
          try {
            if (iterator === 10) {
              clearInterval(interval);
              return resolve();
            }
            this.context.flush(`flush : ${iterator++}`);
          } catch (e) {
            throw e;
          }
        }, 1000);
        // if (true) {
        // throw new Error("pass error");
        // }
      } catch (e) {
        return reject(e);
      }
    });
  }

  /* indexAction() {
    return this.myPromise()
      .then(ele => {
        return this.render("testBundle::index.html.twig", {
          lib: lib.toJson(),
          admin: this.isGranted("ROLE_ADMIN"),
          result: ele
        });
      })
      .catch(e => {
        return this.render("testBundle::index.html.twig", {
          lib: lib.toJson(),
          admin: this.isGranted("ROLE_ADMIN"),
          error: e
        });
      });
  }*/

  /**
   *
   *	@method loginAction
   *  @Route ("/api/login", name="api-login")
   */
  loginApiAction () {
    try {
      return this.render("testBundle:api:login.html.twig");
    } catch (e) {
      throw e;
    }
  }

  /**
   *
   *	@method indexAction
   *  @Route ("/api/token", name="api-token")
   */
  tokenApiAction () {
    try {
      return this.renderJson({});
    } catch (e) {
      throw e;
    }
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/test/session/attributes",
   *      name="test-session-attributes")
   *
   */
  sessionAction () {
    const ele = this.context.session.get("ele");
    if (ele) {
      return this.renderJson({
        ele,
        param: this.context.session.getParameters("ele"),
        params: this.context.session.getParameters(),
        conxtext: this.context.session.getParameters("context")
      });
    }
    this.context.session.set("ele", this.kernel.domain);
    this.context.session.setParameters("ele.foo.bar", this.kernel.domain);
    this.context.session.setParameters("ele.ola", this.kernel.domain);
    return this.renderJson({
      type: "create",
      ele: this.context.session.get("ele"),
      param: this.context.session.getParameters("ele"),
      params: this.context.session.getParameters(),
      conxtext: this.context.session.getParameters("context")
    });
  }

  /**
   *
   */
  watcherAction () {
    return this.renderJson(lib.toJson());
  }

  /**
   *
   *    render JSON
   */
  jsonAction () {
    return this.renderJson({
      foo: "bar",
      bar: "foo"
    });
  }

  restAction () {
    const error = new Error("API");
    error.pdu = JSON.stringify(new nodefony.PDU(error.message, "ERROR", "MONGODB", "USERNOTFOUND"));
    throw error;
  }

  /**
   *
   *    DEMO WEBSOCKET
   */
  websoketAction (message) {
    switch (this.getMethod()) {
    case "WEBSOCKET":
      if (message) {
        // MESSAGES CLIENT
        this.log(message.utf8Data, "INFO");
      } else {
        // PREPARE  PUSH MESSAGES SERVER
        // SEND MESSAGES TO CLIENTS
        let i = 0;
        let id = setInterval(() => {
          const mess = `I am a  message ${i}\n`;
          this.log(`SEND TO CLIENT :${mess}`, "INFO");
          this.context.send(mess);
          // this.renderResponse(mess);
          i++;
        }, 1000);
        setTimeout(() => {
          clearInterval(id);
          // close reason , descripton
          this.context.close(1000, "NODEFONY CONTROLLER CLOSE SOCKET");
          id = null;
        }, 10000);
        this.context.listen(this, "onClose", () => {
          if (id) {
            clearInterval(id);
          }
        });
      }
      break;
    default:
      throw new Error("REALTIME METHOD NOT ALLOWED");
    }
  }
};
