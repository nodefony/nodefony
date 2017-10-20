const Querystring = require('querystring');
const BlueBird = require("bluebird");

module.exports = nodefony.registerService("router", function () {

  const isPromise = function (obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
  };
  /*
   *
   *
   *  ROUTER
   *
   *
   */
  const pluginReader = function () {

    let importXmlConfig = function (xml, prefix, callback, parser) {
      if (parser) {
        xml = this.render(xml, parser.data, parser.options);
      }
      let routes = [];
      this.xmlParser.parseString(xml, (err, node) => {
        if (err) {
          this.logger("ROUTER xmlParser.parseString : " + err, 'WARNING');
        }
        if (!node) {
          return node;
        }
        for (let key in node) {
          switch (key) {
          case 'route':
            if (prefix) {
              for (let skey in node[key]) {
                node[key][skey].id = prefix.replace('/', '_') + '_' + node[key][skey].id;
                if (node[key][skey].id.charAt(0) === '_') {
                  node[key][skey].id = node[key][skey].id.slice(1);
                }
                node[key][skey].pattern = prefix + node[key][skey].pattern;
              }
            }
            routes = routes.concat(node[key]);
            break;
          case 'import':
            /*
             * TODO PROBLEME DE LOAD DE FICHIER: path + getReaderFunc
             */
            for (let skey in node[key]) {
              routes = routes.concat(importXmlConfig.call(this, '/' + node[key][skey].resource, (node[key][skey].prefix ? node[key][skey].prefix : '')));
            }
            break;
          }
        }
      });
      if (callback) {
        normalizeXmlJson.call(this, this.xmlToJson.call(this, routes), callback);
      } else {
        return routes;
      }
    };

    let normalizeXmlJson = function (routes, callback) {
      for (let route in routes) {
        for (let param in routes[route]) {
          if (['pattern', 'host'].indexOf(param) >= 0) {
            routes[route][param] = routes[route][param][0];
          } else {
            if (routes[route][param] instanceof Array) {
              let args = {};
              for (let elm = 0; elm < routes[route][param].length; elm++) {
                //console.log(routes[route][param][elm])
                //console.log(route)
                for (let sparam in routes[route][param][elm]) {
                  //console.log(sparam)
                  args[sparam] = routes[route][param][elm][sparam];
                }
              }
              routes[route][param + 's'] = args;
              delete routes[route][param];
            }
          }
        }
      }
      if (callback) {
        callback(routes);
      }
    };

    let getObjectRoutesXML = function (file, callback, parser) {
      importXmlConfig.call(this, file, '', callback, parser);
    };

    let getObjectRoutesJSON = function (file, callback, parser) {
      if (parser) {
        file = this.render(file, parser.data, parser.options);
      }
      if (callback) {
        callback(JSON.parse(file));
      }
    };

    let getObjectRoutesYml = function (file, callback, parser) {
      if (parser) {
        file = this.render(file, parser.data, parser.options);
      }
      if (callback) {
        callback(yaml.load(file));
      }
    };

    return {
      xml: getObjectRoutesXML,
      json: getObjectRoutesJSON,
      yml: getObjectRoutesYml,
      annotation: null
    };
  }();

  /*
   *
   * CLASS RESOLVER
   *
   *
   */
  const regAction = /^(.+)Action$/;
  nodefony.Resolver = class Resolver extends nodefony.Service {

    constructor(context, router) {
      super("resolver", context.container, context.notificationsCenter);
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

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = "SERVICE RESOLVER";
      }
      return this.syslog.logger(pci, severity, msgid, msg);
    }

    callController(data) {
      if (this.context.isRedirect || this.context.sended) {
        return;
      }
      try {
        let controller = new this.controller(this.container, this.context);
        this.set("controller", controller);
        if (data) {
          this.variables.push(data);
        }
        return this.returnController(this.action.apply(controller, this.variables));
      } catch (e) {
        throw e;
      }
    }

    returnController(result) {
      switch (true) {
      case result instanceof nodefony.Response:
      case result instanceof nodefony.wsResponse:
        return this.fire("onResponse", result, this.context);
      case result instanceof Promise:
      case result instanceof BlueBird:
      case isPromise(result):
        if (this.context.promise) {
          return this.context.promise.then(result);
        }
        this.context.promise = result;
        return this.context.promise.then((myResult) => {
          switch (true) {
          case myResult instanceof nodefony.Response:
          case myResult instanceof nodefony.wsResponse:
          case myResult instanceof Promise:
          case myResult instanceof BlueBird:
            break;
          default:
            if (myResult) {
              this.context.response.body = myResult;
            }
          }
          try {
            return this.fire("onResponse", this.context.response, this.context);
          } catch (e) {
            if (this.context.response.response.headersSent || this.context.timeoutExpired) {
              return;
            }
            return this.fire("onError", this.context.container, e);
          }
        }).catch((e) => {
          if (this.context.response.response.headersSent || this.context.timeoutExpired) {
            return;
          }
          this.context.promise = null;
          return this.fire("onError", this.context.container, e);
        });
      case nodefony.typeOf(result) === "object":
        if (this.defaultView) {
          return this.returnController(this.get("controller").render(this.defaultView, result));
        } else {
          throw {
            status: 500,
            message: "default view not exist"
          };
        }
        break;
      default:
        this.context.waitAsync = true;
        //this.logger("WAIT ASYNC RESPONSE FOR ROUTE : "+this.route.name ,"DEBUG")
        // CASE async controller wait fire onResponse by other entity
      }
      return result;
    }
  };

  const generateQueryString = function (obj, name) {
    if (obj._keys) {
      delete obj._keys;
    }
    let size = (Object.keys(obj).length);
    if (!size) {
      return "";
    }
    let str = "?";
    if (nodefony.typeOf(obj) !== "object" ||  obj === null) {
      this.logger("BAD arguments queryString in route varaibles :" + name, "WARNING");
      return "";
    }
    let iter = 0;
    for (let ele in obj) {
      iter++;
      str += Querystring.escape(ele) + "=" + Querystring.escape(obj[ele]);
      if (size > iter) {
        str += "&";
      }
    }
    return str;
  };

  const Router = class Router extends nodefony.Service {

    constructor(container) {
      super("router", container, container.get("notificationsCenter"));
      this.routes = [];
      this.reader = function (context) {
        var func = context.container.get("reader").loadPlugin("routing", pluginReader);
        return function (result) {
          return func(result, context.nodeReader.bind(context, result));
        };
      }(this);
      this.engineTemplate = this.get("templating");
      this.engineTemplate.extendFunction("path", (name, variables, host) => {
        try {
          return this.generatePath(name, variables, host);
        } catch (e) {
          this.logger(e, "ERROR");
          throw {
            status: 500,
            error: e.error
          };
        }
      });
      this.engineTemplate.extendFunction("url", (name, variables, host) => {
        try {
          return this.generatePath(name, variables, host);
        } catch (e) {
          this.logger(e, "ERROR");
          throw {
            status: 500,
            error: e.error
          };
        }
      });
    }

    generatePath(name, variables, host) {
      let route = this.getRoute(name.replace(/\s/g, ""));
      let queryString = variables ? variables.queryString : null;
      if (!route) {
        throw {
          error: "no route to host  " + name
        };
      }
      let mypath = route.path.replace(/(.*)\*$/, "\$1");
      if (route.variables.length) {
        for (let i = 0; i < route.variables.length; i++) {
          let ele = route.variables[i];
          if (variables[ele]) {
            mypath = mypath.replace("{" + ele + "}", variables[ele]);
          } else {
            if (route.defaults[ele]) {
              mypath = mypath.replace("{" + ele + "}", route.defaults[ele]);
            } else {
              let txt = "";
              for (let i = 0; i < route.variables.length; i++) {
                txt += "{" + route.variables[i] + "} ";
              }
              throw {
                error: "router generate path route " + name + " must have variable " + txt
              };
            }
          }
        }
      }
      if (queryString) {
        mypath += generateQueryString.call(this, variables.queryString, name);
      }
      if (host) {
        return host + mypath;
      }
      return mypath;
    }

    getRoute(name) {
      if (this.routes[name]) {
        return this.routes[name];
      }
      this.logger("Route name: " + name + " not exist");
      return null;
    }

    setRoute(name, route) {
      let myroute = null;
      if (route instanceof nodefony.Route) {
        myroute = route;
      } else {
        myroute = this.createRoute(route);
      }
      let hash = myroute.generateId();
      let index = null;
      let same = false;
      if (this.routes[name]) {
        index = this.routes[name].index;
        if (this.routes[name].hash === hash) {
          same = true;
        } else {
          if (this.routes[name].filePath !== myroute.filePath) {
            same = true;
          }
          //console.log("index old route : " + index )
          this.logger("ROUTE HAS SAME NAME : " + name + " path : " + myroute.path + " controller : " + myroute.defaults.controller, "WARNING");
        }
      }
      if (index === null) {
        index = this.routes.push(myroute);
        myroute.index = index;
        this.routes[name] = this.routes[index - 1];
        this.logger("ADD ROUTE : " + name + " path :" + myroute.path + " controller " + myroute.defaults.controller, "DEBUG");
      } else {
        if (!same) {
          myroute.index = index;
          //console.log("new Index " + myroute.index )
          delete this.routes[index - 1];
          this.routes[index - 1] = myroute;
          delete this.routes[name];
          this.routes[name] = this.routes[index - 1];
          this.logger("REPLACE ROUTE : " + name + " path : " + myroute.path + " controller " + myroute.defaults.controller, "WARNING");
        } else {
          myroute.index = index;
        }
      }
    }

    getRoutes(name) {
      if (name) {
        return this.routes[name];
      }
      return this.routes;
    }

    resolve(context) {
      let resolver = new nodefony.Resolver(context, this);
      for (let i = 0; i < this.routes.length; i++) {
        try {
          if (resolver.match(this.routes[i], context)) {
            return resolver;
          }
        } catch (e) {
          //if (e && e.type && ( e.type === "domain" || e.type === "method" || e.type === "protocol" ) ){
          resolver.exception = e;
          continue;
          //}
          //throw e ;
        }
      }
      if (resolver.exception) {
        throw resolver.exception;
      }
      return resolver;
    }

    resolveName(context, name) {
      try {
        let resolver = new nodefony.Resolver(context, this);
        resolver.parsePathernController(name);
        return resolver;
      } catch (e) {
        throw e;
      }
    }

    createRoute(obj) {
      return new nodefony.Route(obj);
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = "SERVICE ROUTER";
      }
      return super.logger(pci, severity, msgid, msg);
    }

    removeRoutes(filePath) {
      for (let i = 0; i < this.routes.length; i++) {
        //console.log( this.routes[i].name +" : "+this.routes[i].filePath)
        if (this.routes[i].filePath === filePath) {
          this.logger("DELETE ROUTE : " + this.routes[i].name);
          let index = this.routes[i].index;
          let name = this.routes[i].name;
          delete this.routes[index - 1];
          delete this.routes[name];
        }
      }
    }

    nodeReader(filePath, obj) {
      for (let route in obj) {
        let newRoute = new nodefony.Route(route);
        newRoute.filePath = filePath;
        for (let ele in obj[route]) {
          let arg = obj[route][ele];
          switch (ele) {
          case "pattern":
            newRoute.setPattern(arg);
            break;
          case "host":
            newRoute.setHostname(arg);
            break;
          case "firewalls":
            newRoute.setFirewallConfigRoute(arg);
            break;
          case "defaults":
            for (let ob in arg) {
              newRoute.addDefault(ob, arg[ob]);
            }
            break;
          case "requirements":
            for (let ob in arg) {
              newRoute.addRequirement(ob, arg[ob]);
            }
            break;
          case "options":
            for (let ob in arg) {
              newRoute.addOptions(ob, arg[ob]);
            }
            break;
          default:
            this.logger(" Tag : " + ele + " not exist in routings definition");
          }
        }
        newRoute.compile();
        this.setRoute(route, newRoute);
      }
    }
  };
  return Router;
});
