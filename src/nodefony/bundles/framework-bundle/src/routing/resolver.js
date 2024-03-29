/*
 *
 * CLASS RESOLVER
 *
 *
 */
const regAction = /^(.+)[Aa]ction$/;

class Resolver extends nodefony.Service {
  constructor (context, router) {
    super("RESOLVER", context.container, context.notificationsCenter);
    this.router = router;
    this.resolve = false;
    this.defaultAction = null;
    this.defaultView = null;
    this.variables = [];
    this.context = context; // this.get("context") ;
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

  clean () {
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

  match (route, context) {
    try {
      const match = route.match(context);
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
      this.request = context.request.request;
      this.route = route;
      this.parsePathernController(route.defaults.controller);
      this.bypassFirewall = route.bypassFirewall;
      this.defaultLang = route.defaultLang;
      if (route.requirements.protocol) {
        this.acceptedProtocol = route.requirements.protocol.toLowerCase();
      }
      throw e;
    }
  }

  getRoute () {
    return this.route;
  }

  getAction (name) {
    const obj = Object.getOwnPropertyNames(this.controller.prototype);
    for (let i = 0; i < obj.length; i++) { //  func in obj ){
      if (typeof this.controller.prototype[obj[i]] === "function") {
        const res = regAction.exec(obj[i]);
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

  parsePathernController (name) {
    if (name && typeof name === "string") {
      const tab = name.split(":");
      let myName = null;
      try {
        myName = this.kernel.getBundleName(tab[0]);
      } catch (e) {
        myName = tab[0];
      }
      this.bundle = this.kernel.getBundle(myName);

      if (this.bundle) {
        if (this.bundle.name !== "framework") {
          this.set("bundle", this.bundle);
        }
        this.controller = this.getController(tab[1]);
        if (this.controller) {
          this.action = this.getAction(tab[2]);
          if (!this.action) {
            throw new Error(`Resolver Pattern Controller : ${name} :In CONTROLLER: ${tab[1]} ACTION  :${tab[2]} not exist`);
          }
          this.actionName = tab[2];
        } else {
          throw new Error(`Resolver Pattern Controller : ${name} : controller not exist :${tab[1]}`);
        }
        this.defaultView = this.getDefaultView(tab[1], tab[2]);
        this.resolve = true;
      } else {
        throw new Error(`Resolver Pattern Controller : ${name} bundle not exist :${tab[0]}`);
      }
    } else {
      throw new Error(`Resolver Pattern Controller : ${name} not valid`);
    }
  }

  getDefaultView (controller, action) {
    // FIXME .html ???
    const res = `${this.bundle.name}:${controller}:${action}.html.${this.get("templating").extention}`;
    return res;
  }

  getController (name) {
    return this.bundle.controllers[name];
  }

  setVariables (data) {
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

  newController (container, context) {
    const controller = new this.controller(container || this.container, context || this.context);
    container.set("controller", controller);
    return controller;
  }

  callController (data, reload) {
    try {
      let controller = this.get("controller");
      if (!controller || reload) {
        controller = this.newController(this.container, this.context);
      }
      this.container.set("action", this.actionName);
      if (this.kernel.debug && this.route) {
        this.log(`
${clc.green("bundle")} : ${this.bundle.name}
${clc.blue("controller")} : ${this.controller.name}
${clc.yellow("action")} : ${this.actionName}
${clc.red("route")} : ${clc.cyan(this.route.toString())}
${clc.red("query")} : ${controller.query ? JSON.stringify(controller.query, null, " ") : null}`, "DEBUG", `ROUTE ${this.route.name}`);
      }
      if (nodefony.isError(data)) {
        if (data.code) {
          controller.response.setStatusCode(data.code);
        }
        if (this.context.listenerCount("onError")) {
          return this.returnController(data);
        }
      }
      if (data) {
        this.setVariables(data);
      }
      return this.returnController(this.action.apply(controller, this.variables));
    } catch (e) {
      throw e;
    }
  }

  returnController (result) {
    if (!this.context) {
      return;
    }
    const type = nodefony.typeOf(result);
    switch (true) {
    case result instanceof Promise:
    case result instanceof BlueBird:
    case nodefony.isPromise(result):
      this.context.promise = result;
      return this.context.promise
        .then((myResult) => this.returnController(myResult)).catch((e) => this.returnController(e));
    case type === "Error":
      if (this.context.listenerCount("onError")) {
        return this.context.fireAsync("onError", result, this.route, this.variables)
          .then((res) => {
            this.context.removeAllListeners("onError");
            return this.returnController(res[0]);
          })
          .catch((e) => {
            this.context.removeAllListeners("onError");
            return this.context.kernelHttp.onError(this.container, e);
          });
      }
      return this.context.kernelHttp.onError(this.container, result);

      break;
    case type === "string":
    case result instanceof String:
      this.context.send(result);
      return result;
    case result instanceof nodefony.subRequest:
      switch (true) {
      case result.result instanceof Promise:
      case result.result instanceof BlueBird:
      case nodefony.isPromise(result.result):
        this.returnController(result.result);
        return this.context.send();
      default:
        return this.returnController(result.result);
      }
      break;
    case result instanceof nodefony.Response:
    case result instanceof nodefony.wsResponse:
      return this.context.send();
    case result instanceof nodefony.Context:
      return result;
    case type === "object":
      if (this.defaultView) {
        try {
          return this.returnController(this.get("controller").renderSync(this.defaultView, result));
        } catch (e) {
          this.log(e, "WARNING");
          return result;
        }
      } else {
        throw new Error("default view not exist");
      }
      break;
    default:
      if (this.context.isRedirect) {
        return this.context.send();
      }
      this.context.waitAsync = true;
      // this.logger("WAIT ASYNC RESPONSE FOR ROUTE : " + this.route.name, "DEBUG")
      // CASE async controller wait fire onResponse by other entity
    }
  }
}

nodefony.Resolver = Resolver;
module.exports = Resolver;
