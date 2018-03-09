/*
 *
 * CLASS RESOLVER
 *
 *
 */
module.exports = nodefony.register("Resolver", function () {

  const regAction = /^(.+)Action$/;
  const isPromise = function (obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
  };

  const Resolver = class Resolver extends nodefony.Service {

    constructor(context, router) {
      super("RESOLVER", context.container, context.notificationsCenter);
      this.router = router;
      this.resolve = false;
      this.defaultAction = null;
      this.defaultView = null;
      this.variables = [];
      this.context = context; //this.get("context") ;
      this.defaultLang = null;
      this.bypassFirewall = false;
      this.acceptedProtocol = null;
      this.exception = null;
      this.action = null;
      this.controller = null;
      this.request = null;
      this.route = null;
      this.bundle = null;
    }

    clean() {
      this.context = null;
      delete this.context;
      this.action = null;
      delete this.action;
      this.controller = null;
      delete this.controller;
      this.variables = null;
      delete this.variables;
      this.request = null;
      delete this.request;
      this.route = null;
      delete this.route;
      this.bundle = null;
      delete this.bundle;
      super.clean();
    }

    match(route, context) {
      try {
        let match = route.match(context);
        if (match) {
          this.variables = match;
          this.request = context.request.request;
          this.route = route;
          this.parsePathernController(route.defaults.controller);
          this.bypassFirewall = route.bypassFirewall;
          this.defaultLang = route.defaultLang;
          if (route.requirements.protocol) {
            this.acceptedProtocol = route.requirements.protocol.toLowerCase();
          }
        }
        return match;
      } catch (e) {
        throw e;
      }
    }

    getRoute() {
      return this.route;
    }

    getAction(name) {
      let obj = Object.getOwnPropertyNames(this.controller.prototype);
      for (let i = 0; i < obj.length; i++) { //  func in obj ){
        if (typeof this.controller.prototype[obj[i]] === "function") {
          let res = regAction.exec(obj[i]);
          if (res) {
            if (res[1] === name) {
              return this.controller.prototype[obj[i]];
            }
          } else {

          }
        }
      }
      return null;
    }

    parsePathernController(name) {
      if (name && typeof name === "string") {
        let tab = name.split(":");
        this.bundle = this.kernel.getBundle(this.kernel.getBundleName(tab[0]));
        if (this.bundle) {
          if (this.bundle.name !== "framework") {
            this.set("bundle", this.bundle);
          }
          this.controller = this.getController(tab[1]);
          if (this.controller) {
            this.action = this.getAction(tab[2]);
            if (!this.action) {
              throw new Error("Resolver " + name + " :In CONTROLLER: " + tab[1] + " ACTION  :" + tab[2] + " not exist");
            }
            this.actionName = tab[2];
          } else {
            throw new Error("Resolver " + name + " : controller not exist :" + tab[1]);
          }
          this.defaultView = this.getDefaultView(tab[1], tab[2]);
          this.resolve = true;
        } else {
          throw new Error("Resolver " + name + " :bundle not exist :" + tab[0]);
        }
      } else {
        throw new Error("Resolver Pattern Controller " + name + " not valid");
      }
    }

    getDefaultView(controller, action) {
      //FIXME .html ???
      let res = this.bundle.name + "Bundle" + ":" + controller + ":" + action + ".html." + this.get("templating").extention;
      return res;
    }

    getController(name) {
      return this.bundle.controllers[name];
    }

    setVariables(data) {
      switch (nodefony.typeOf(data)) {
      case "array":
      case "arguments":
        if (data.length) {
          for (let i = 0; i < data.length; i++) {
            this.variables.push(data[i]);
          }
        }
        break;
      default:
        this.variables.push(data);
      }
    }

    callController(data) {
      if (this.context.isRedirect || this.context.sended) {
        return;
      }
      try {
        let controller = this.get("controller");
        if (!controller) {
          controller = this.newController(this.container, this.context);
        }
        if (data) {
          this.setVariables(data);
        }
        this.container.set("action", this.actionName);
        return this.returnController(this.action.apply(controller, this.variables));
      } catch (e) {
        throw e;
      }
    }

    newController(container, context) {
      let controller = new this.controller(container || this.container, context || this.context);
      container.set("controller", controller);
      return controller;
    }

    returnController(result) {
      switch (true) {
      case result instanceof String:
        this.context.response.setBody(result);
        return this.context.send();
      case result instanceof nodefony.subRequest:
        switch (true) {
        case result.result instanceof Promise:
        case result.result instanceof BlueBird:
        case isPromise(result.result):
          this.returnController(result.result);
          return this.context.send();
        default:
          return this.returnController(result.result);
          //throw new Error("nodefony Twig Template Render can't resolve Async Call in Action controler ");
        }
        break;
      case result instanceof nodefony.Response:
      case result instanceof nodefony.wsResponse:
        return this.context.send();
      case result instanceof Promise:
      case result instanceof BlueBird:
      case isPromise(result):
        if (this.context.promise) {
          return this.context.promise.then(result);
        }
        this.context.promise = result;
        return this.context.promise.then((myResult) => {
          return this.returnController(myResult);
          /*switch (true) {
          case myResult instanceof nodefony.Context:
          case myResult instanceof nodefony.Response:
          case myResult instanceof nodefony.wsResponse:
          case myResult instanceof Promise:
          case myResult instanceof BlueBird:
          case myResult instanceof nodefony.subRequest:
          case isPromise(myResult):
            return this.returnController(myResult);
          default:
            return this.context.send(myResult);
          }*/
        }).catch((e) => {
          throw e;
        });
      case result instanceof nodefony.Context:
        return result;
      case nodefony.typeOf(result) === "object":
        if (this.defaultView) {
          return this.returnController(this.get("controller").render(this.defaultView, result));
        } else {
          throw new Error("default view not exist");
        }
        break;
      default:
        this.context.waitAsync = true;
        //this.logger("WAIT ASYNC RESPONSE FOR ROUTE : "+this.route.name ,"DEBUG")
        // CASE async controller wait fire onResponse by other entity
      }
      //return result;
    }
  };
  return Resolver;
});