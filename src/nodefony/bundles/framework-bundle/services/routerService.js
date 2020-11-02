const Querystring = require('querystring');

const pluginReader = function () {
  const importXmlConfig = function (xml, prefix, callback, parser) {
    if (parser) {
      xml = this.render(xml, parser.data, parser.options);
    }
    let routes = [];
    this.xmlParser.parseString(xml, (err, node) => {
      if (err) {
        this.log("ROUTER xmlParser.parseString : " + err, 'WARNING');
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

  const normalizeXmlJson = function (routes, callback) {
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

  const getObjectRoutesXML = function (file, bundle, parser, callback) {
    importXmlConfig.call(this, file, '', callback, parser);
  };

  const getObjectRoutesJSON = function (file, bundle, parser, callback) {
    if (parser) {
      file = this.render(file, parser.data, parser.options);
    }
    if (callback) {
      callback(JSON.parse(file));
    }
  };

  const getObjectRoutesYml = function (file, bundle, parser, callback) {
    if (parser) {
      file = this.render(file, parser.data, parser.options);
    }
    if (callback) {
      callback(yaml.load(file));
    }
  };

  const annotations = function (file, bundle, parser, callback) {
    try {
      return this.readFile(file)
        .then((fileContent) => {
          return this.annotations.parseController(fileContent, bundle, file, parser)
            .then((obj) => {
              if (obj && Object.keys(obj).length) {
                callback(obj);
              }
            })
            .catch((e) => {
              this.log(file, "ERROR");
              this.log(e, "ERROR");
            });
        })
        .catch((e) => {
          this.log(file, "ERROR");
          this.log(e, "ERROR");
        });
    } catch (e) {
      throw e;
    }
  };

  return {
    xml: getObjectRoutesXML,
    json: getObjectRoutesJSON,
    yml: getObjectRoutesYml,
    annotations: annotations
  };
}();


const generateQueryString = function (obj, name) {
  if (obj._keys) {
    delete obj._keys;
  }
  let size = (Object.keys(obj).length);
  if (!size) {
    return "";
  }
  let str = "?";
  if (nodefony.typeOf(obj) !== "object" || obj === null) {
    this.log("BAD arguments queryString in route varaibles :" + name, "WARNING");
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

module.exports = class router extends nodefony.Service {

  constructor(container) {
    super("ROUTER", container, container.get("notificationsCenter"));
    this.routes = [];
    this.reader = function (context) {
      var func = context.container.get("reader").loadPlugin("routing", pluginReader);
      return function (file, bundle, parser) {
        return func(file, bundle, parser, context.nodeReader.bind(context, file, bundle));
      };
    }(this);
  }

  generatePath(name, variables, host) {
    try {
      if (!name) {
        throw new Error(`url generatePath no path : ${name} `);
      }
      let route = this.getRoute(name.replace(/\s/g, ""));
      let queryString = variables ? variables.queryString : null;
      if (!route) {
        throw new Error("No route to host " + name);
      }
      let mypath = route.path.replace(/(.*)\*$/, "\$1");
      if (route.variables.length) {
        for (let i = 0; i < route.variables.length; i++) {
          let ele = route.variables[i];
          if (variables && variables[ele]) {
            mypath = mypath.replace("{" + ele + "}", variables[ele]);
          } else {
            if (route.defaults[ele] !== undefined) {
              mypath = mypath.replace("{" + ele + "}", route.defaults[ele]);
            } else {
              let txt = "";
              for (let i = 0; i < route.variables.length; i++) {
                txt += "{" + route.variables[i] + "} ";
              }
              throw new Error("router generate path route " + name + " must have variable " + txt);
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
    } catch (e) {
      throw e;
    }
  }

  getRoute(name) {
    if (this.routes[name]) {
      return this.routes[name];
    }
    this.log("Route name: " + name + " not exist");
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
        this.log("ROUTE HAS SAME NAME : " + name + " path : " + myroute.path + " controller : " + myroute.defaults.controller, "WARNING");
      }
    }
    if (index === null) {
      index = this.routes.push(myroute);
      myroute.index = index;
      this.routes[name] = this.routes[index - 1];
      this.log("ADD ROUTE : " + name + " path :" + myroute.path + " controller " + myroute.defaults.controller, "DEBUG");
    } else {
      if (!same) {
        myroute.index = index;
        //console.log("new Index " + myroute.index )
        delete this.routes[index - 1];
        this.routes[index - 1] = myroute;
        delete this.routes[name];
        this.routes[name] = this.routes[index - 1];
        this.log("REPLACE ROUTE : " + name + " path : " + myroute.path + " controller " + myroute.defaults.controller, "WARNING");
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
          this.log(`Match route : ${this.routes[i].name}`, "DEBUG");
          resolver.exception = null;
          return resolver;
        }
      } catch (e) {
        this.log(`Match route exception : ${this.routes[i].name} ${e}`, "DEBUG");
        resolver.exception = e;
        continue;
      }
    }
    if (resolver.exception) {
      throw resolver;
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

  /*log(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = this.nale;
    }
    return super.log(pci, severity, msgid, msg);
  }*/

  removeRoutes(filePath) {
    for (let i = 0; i < this.routes.length; i++) {
      //console.log( this.routes[i].name +" : "+this.routes[i].filePath)
      if (this.routes[i].filePath === filePath) {
        this.log("DELETE ROUTE : " + this.routes[i].name);
        let index = this.routes[i].index;
        let name = this.routes[i].name;
        delete this.routes[index - 1];
        delete this.routes[name];
      }
    }
  }

  nodeReader(filePath, bundle, obj) {
    for (let route in obj) {
      try {
        let newRoute = new nodefony.Route(route);
        newRoute.filePath = filePath;
        newRoute.bundle = bundle;
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
          case "firewall":
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
          case "prefix":
            newRoute.setPrefix(arg);
            break;
          default:
            this.log(" Tag : " + ele + " not exist in routings definition Route : " + route + " File : " + newRoute.filePath, "WARNING");
          }
        }
        newRoute.compile();
        this.setRoute(route, newRoute);
      } catch (e) {
        this.log(e, "ERROR");
        continue;
      }
    }
  }
};
