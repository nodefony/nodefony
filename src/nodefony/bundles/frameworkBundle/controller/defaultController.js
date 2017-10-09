/*
 *
 *
 *
 *     	CONTROLLER default
 *
 *
 *
 *
 **/

module.exports = nodefony.registerController("framework", function () {


  const frameworkController = class frameworkController extends nodefony.controller {

    constructor(container, context) {
      super(container, context);
    }

    indexAction() {
      if (this.context.isJson) {
        return this.render('frameworkBundle::index.json.twig', {
          title: "WEB nodefony FRAMEWORK"
        });
      }
      return this.render('frameworkBundle::index.html.twig', {
        title: "WEB nodefony FRAMEWORK"
      });
    }

    ["404Action"](error) {
      this.getResponse().setStatusCode(404);
      if (this.context.isJson) {
        return this.render('frameworkBundle::404.json.twig', {
          error: error
        });
      }
      return this.render('frameworkBundle::404.html.twig', {
        error: error
      });
    }

    ["401Action"](error) {
      this.getResponse().setStatusCode(401);
      if (this.context.isJson) {
        return this.render('frameworkBundle::401.json.twig', {
          error: error
        });
      }
      //this.context.response.setHeaders({"Content-Type": "text/html; charset=utf-8"});
      return this.render('frameworkBundle::401.html.twig', {
        error: error
      });
    }

    ["403Action"](error) {
      this.getResponse().setStatusCode(403);
      if (this.context.isJson) {
        return this.render('frameworkBundle::403.json.twig', {
          error: error
        });
      }
      return this.render('frameworkBundle::403.html.twig', {
        error: error
      });
    }

    ["500Action"](error) {
      this.getResponse().setStatusCode(500);
      if (this.context.isJson) {
        return this.render('frameworkBundle::exception.json.twig', {
          error: error
        });
      }
      return this.render('frameworkBundle::exception.html.twig', {
        error: error
      });
    }

    exceptionsAction(error) {
      if (this.context.isJson) {
        return this.render('frameworkBundle::exception.json.twig', {
          error: error
        });
      }
      return this.render('frameworkBundle::exception.html.twig', {
        error: error
      });
    }

    timeoutAction(error) {
      if (this.context.isJson) {
        return this.render('frameworkBundle::timeout.json.twig', {
          error: error
        });
      }
      //this.context.response.setHeaders({"Content-Type": "text/html; charset=utf-8"});
      return this.render('frameworkBundle::timeout.html.twig', {
        error: error
      });
    }


    systemAction(options) {
      let services = {};
      for (let service in nodefony.services) {
        let ele = this.container.getParameters("services." + service);
        services[service] = {};
        services[service].name = service;
        if (ele) {
          let inject = "";
          let i = 0;
          for (let inj in ele.injections) {
            let esc = i === 0 ? "" : " , ";
            inject += esc + inj;
            i++;
          }
          services[service].run = "CONFIG";
          services[service].scope = ele.scope === "container" ? "Default container" : ele.scope;
          services[service].calls = ele.calls;
          services[service].injections = inject;
          services[service].properties = ele.properties;
          services[service].orderInjections = ele.orderArguments ? true : false;
        } else {
          services[service].run = "KERNEL";
          services[service].scope = "KERNEL container";

        }
      }
      let obj = {
        routes: this.router.routes,
        kernel: this.getParameters("kernel"),
        services: services
      };
      if (options) {
        nodefony.extend(obj, options);
        if (options.view) {
          if (options.renderView) {
            return this.renderView(options.view, obj);
          } else {
            return this.render(options.view, obj);
          }
        }
        if (options.renderView) {
          return this.renderView('frameworkBundle::system.html.twig', obj);
        }
      } else {
        return this.render('frameworkBundle::system.html.twig', obj);
      }
    }

    readmeAction() {
      var kernel = this.container.get("kernel");
      var path = kernel.rootDir + '/README.md';
      var file = new nodefony.fileClass(path);
      var res = this.htmlMdParser(file.content(), {
        linkify: true,
        typographer: true
      });
      return this.render('frameworkBundle::md.html.twig', {
        html: res
      });
    }
  };
  return frameworkController;
});
