  /**
   *	The class is a **`default` CONTROLLER** .
   *	@module NODEFONY
   *	@main NODEFONY
   *	@class defaultController
   *	@constructor
   *	@param {class} container
   *	@param {class} context
   *
   */
  module.exports = class defaultController extends nodefony.controller {

    constructor(container, context) {
      super(container, context);
    }

    indexAction(module) {
      if (module) {
        this.getResponse().setHeader('Content-Type', "application/xml");
        if (module === "app") {
          let bundles = function () {
            let obj = {};
            for (let bundle in this.kernel.bundles) {
              obj[bundle] = {
                name: this.kernel.bundles[bundle].name,
                version: this.kernel.bundles[bundle].settings.version,
                config: this.container.getParameters("bundles." + bundle)
              };
            }
            return obj;
          }.call(this);

          return this.render('monitoringBundle::' + module + '.xml.twig', {
            bundles: bundles,
            user: this.context.user
          });
        }
        return this.render('monitoringBundle::' + module + '.xml.twig');
      } else {
        return this.render('monitoringBundle::index.html.twig', {
          environment: this.kernel.environment,
          debug: this.kernel.debug
        });
      }
    }

    /**
     *
     *
     *
     *
     **/
    realTimeAction(message) {
      let realtime = this.get("realTime");
      let context = this.getContext();
      switch (this.getRequest().method) {
      case "GET":
        return this.getResponse("PING");
      case "POST":
        return realtime.handleConnection(this.getParameters("query").request, context);
      case "WEBSOCKET":
        if (message) {
          realtime.handleConnection(message.utf8Data, context);
        }
        break;
      default:
        throw new Error("REALTIME METHOD NOT ALLOWED");
      }
    }

    testLoadAction(message) {
      let context = this.getContext();
      let serverLoad = this.get("serverLoad");
      switch (this.getRequest().method) {
      case "WEBSOCKET":
        if (message) {
          serverLoad.handleConnection(JSON.parse(message.utf8Data), context);
        }
        break;
      default:
        throw new Error("REALTIME METHOD NOT ALLOWED");
      }
    }
  };
