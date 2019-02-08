const io = require("socket.io");

module.exports = class Socketio extends nodefony.Service {

  constructor(container) {
    super("Socket.io", container);
    this.httpBundle = this.kernel.getBundle("http");
    this.settings = this.bundle.settings["socket.io"];
    this.kernelHttp = this.get("httpKernel");
    this.path = null;
    if (!this.kernel.ready) {
      this.io = null;
      this.iosecure = null;
      this.namespaces = {};
      this.httpBundle.on("onServersReady", (type, service) => {
        this[type] = service;
        return this.init(type, service);
      });
      this.kernel.once("onBoot", () => {
        this.firewall = this.get("security");
        this.sessionService = this.get("sessions");
        this.router = this.get("router");
      });
    }
  }

  init(type, service) {
    switch (type) {
      case "HTTP":
        if (this.settings.http) {
          this.io = io(service.server, this.setOptions(this.settings.http));
          this.logger(`Create Socket.io server `);
          this.setNameSpace(this.io, this.settings.http.namespace, type);
          return this.handle(this.io, type);
        }
        break;
      case "HTTPS":
        if (this.settings.https) {
          this.iosecure = io(service.server, this.setOptions(this.settings.https));
          this.logger(`Create Socket.io Secure Server `);
          this.setNameSpace(this.iosecure, this.settings.https.namespace, type);
          return this.handle(this.iosecure, type);
        }
        break;
      default:
        return;
    }
  }

  checkPath(url) {
    if (!this.path) {
      return url.match("socket.io");
    }
    return url.match(this.path);
  }

  setAdapter() {
    return null;
  }

  setParser() {
    return null;
  }

  setOptions(opt) {
    let obj = {};
    try {
      if (opt) {
        if (opt.path) {
          obj.path = opt.path;
        }
        if (opt.adapter) {
          let adpater = this.setAdapter();
          if (adpater) {
            obj.adapter = adpater;
          }
        }
        if (opt.serveClient) {
          obj.serveClient = opt.serveClient;
        }
        if (opt.parser) {
          let parser = this.setParser();
          if (parser) {
            obj.parser = parser;
          }
        }
      }
    } catch (e) {
      throw e;
    }
    return obj;
  }

  setNameSpace(server, ns, type) {
    try {
      if (ns) {
        switch (nodefony.typeOf(ns)) {
          case "object":
            for (let myns in ns) {
              this.createNameSpace(myns, ns[myns], server, type);
            }
            break;
          default:
            throw new Error("Socket.io bad config namespaces");
        }
      }
    } catch (e) {
      throw e;
    }
  }

  createNameSpace(name, config, server, type) {
    this.namespaces[name] = server.of(config.pattern);
    this.createDynamicRoute(this.namespaces[name], config, server, type);
    this.handle(this.namespaces[name], type);
    this.logger(`Add socket.io namespace ${name}`);
  }

  createDynamicRoute(ns, config, server, type) {
    let conf = nodefony.extend({}, {
      prefix: server._path
    }, config);
    let name = `socket-io-ns-${ns.name.replace("/","")}`;
    let route = new nodefony.Route(name, conf);
    this.router.setRoute(route.name, route);
  }

  getNameSpace(ns) {
    return this.namespaces[ns] || null;
  }

  handle(ns, type) {
    try {
      return ns.on('connect', (socket) => {
        this.logger(` CONNECTION  ${socket.id}`, "INFO");
        //console.log("connect : ", socket.nsp.name);
        //console.log(socket.nsp)
        return this.handleSocket(socket, type);
      });
    } catch (e) {
      throw e;
    }
  }

  handleSocket(socket, type) {
    let container = this.kernel.container.enterScope("request");
    let context = null;
    try {
      context = this.createSocketContext(container, socket, type);
      this.logger("FROM : " + context.remoteAddress +
        " ORIGIN : " + context.originUrl.host +
        " URL : " + context.url, "INFO", type);

      if (this.kernel.domainCheck) {
        // DOMAIN VALID
        if (this.kernelHttp.checkValidDomain(context) !== 200) {
          return Promise.resolve(context);
        }
      }
    } catch (e) {
      console.log(e)
      if (context) {
        context.fire("onError", container, e);
        return Promise.resolve(context);
      } else {
        return Promise.reject(e);
      }
    }
    return this.kernelHttp.handleFrontController(context)
      .then((controller) => {
        if (context.secure) {
          return context.fire("connect");
        }
        try {
          if (context.sessionAutoStart || context.hasSession()) {
            return this.sessionService.start(context, context.sessionAutoStart)
              .then((session) => {
                if (!(session instanceof nodefony.Session)) {
                  throw new Error("SESSION START session storage ERROR");
                }
                controller.session = session;
                try {
                  if (this.firewall) {
                    this.firewall.getSessionToken(context, session);
                  }
                } catch (e) {
                  context.fire("onError", container, e);
                  return context;
                }
                context.fire("connect");
              }).catch((error) => {
                context.fire("onError", container, error);
                return context;
              });
          } else {
            context.fire("connect");
          }
        } catch (e) {
          context.fire("onError", container, e);
        }
        return context;
      }).catch(e => {
        console.log(e)
        context.fire("onError", container, e);
        return context;
      });
  }

  createSocketContext(container, socket, type) {
    let context = new nodefony.context.socket(container, socket, type);
    context.listen(this, "onError", this.onError);
    context.once('onFinish', (context) => {
      this.kernel.container.leaveScope(container);
      context.clean();
      context = null;
      socket = null;
      container = null;
      type = null;
    });
    context.once('onConnect', (context, socket) => {
      if (context.security || context.isControlledAccess) {
        return this.firewall.handleSecurity(context);
      }
      return context.handle(socket);
    });
    return context;
  }

};