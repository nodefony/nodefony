const lib = require("./lib.js");

module.exports = nodefony.registerController("default", function () {

  /**
   *    @Route("/test")
   */

  const defaultController = class defaultController extends nodefony.controller {

    constructor(container, context) {
      super(container, context);
    }

    /**
     *   @Route ("/zguegue", name="")
     *   @Method ({"GET"})
     */
    annotationAction(id) {
      return this.render("testBundle::index.html.twig");
    }

    /**
     *    @Route ("/sboob/{id}", name="annotation2", defaults={"id" = 5},requirements={"id" = "\d+"})
     *    @Method ({"GET", "POST"})
     */
    annotation2Action(id) {
      return this.render("testBundle::index.html.twig", {
        id: id
      });
    }

    indexAction() {
      // markdown read and parse readme.md
      try {
        var path = this.get("kernel").rootDir + "/src/bundles//testBundle/readme.md";
        var file = new nodefony.fileClass(path);
        var res = this.htmlMdParser(file.content(file.encoding), {
          linkify: true,
          typographer: true
        });
        return this.render("testBundle::index.html.twig", {
          readme: res
        });
      } catch (e) {
        return this.forward("frameworkBundle:default:system", {
          view: "testBundle::index.html.twig",
          bundle: this.getParameters("bundles.test")
        });
      }
    }

    /**
     *
     */
    watcherAction() {
      return this.renderJson(lib.toJson());
    }

    /**
     *
     *    render JSON
     */
    jsonAction() {
      return this.renderJson({
        foo: "bar",
        bar: "foo"
      });
    }

    restAction() {
      let error = new Error("API");
      error.pdu = JSON.stringify(new nodefony.PDU(error.message, "ERROR", "MONGODB", "USERNOTFOUND"));
      throw error;
    }

    /**
     *
     *    DEMO WEBSOCKET
     */
    websoketAction(message) {
      var context = this.getContext();

      switch (this.getMethod()) {
      case "WEBSOCKET":
        if (message) {
          // MESSAGES CLIENT
          this.logger(message.utf8Data, "INFO");
        } else {
          // PREPARE  PUSH MESSAGES SERVER
          // SEND MESSAGES TO CLIENTS
          var i = 0;
          var id = setInterval(() => {
            var mess = "I am a  message " + i + "\n";
            this.logger("SEND TO CLIENT :" + mess, "INFO");
            //context.send(mess);
            this.renderResponse(mess);
            i++;
          }, 1000);

          setTimeout(() => {
            clearInterval(id);
            // close reason , descripton
            context.close(1000, "NODEFONY CONTROLLER CLOSE SOCKET");
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

  return defaultController;
});
