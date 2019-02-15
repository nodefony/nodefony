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
          type = "WEBSOCKET";
          this.io = io(service.server, this.setOptions(this.settings.http));
          this.logger(`Create Socket.io server `);
          this.io.on('connect', (socket) => {
            this.handleSocket(socket, type);
          });
          return this.setNameSpace(this.io, this.settings.http.namespaces, type);
          //return this.handle(this.io, type);
        }
        break;
      case "HTTPS":
        if (this.settings.https) {
          type = "WEBSOCKET SECURE";
          this.iosecure = io(service.server, this.setOptions(this.settings.https));
          this.iosecure.on('connect', (socket) => {
            this.handleSocket(socket, type);
          });
          //this.logger(`Create Socket.io Secure Server `);
          return this.setNameSpace(this.iosecure, this.settings.https.namespaces, type);
          //return this.handle(this.iosecure, type);
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
    this.createDynamicRoute(this.namespaces[name], config, server);
    return this.handle(this.namespaces[name], type);


  }

  handle(ns, type) {
    this.logger(`Add socket.io namespace ${ns.name}`);
    try {
      return ns.on('connect', (socket) => {
        this.logger(`CONNECTION Namespace : ${socket.nsp.name} id :  ${socket.id}`, "INFO");
        let context = this.createSocketContext(socket, type);
        return this.kernelHttp.handleFrontController(context)
          .then(() => {
            context.fire("connect", socket);
          });
      });
    } catch (e) {
      throw e;
    }
  }

  createDynamicRoute(ns, config, server) {
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

  handleSocket(socket, type) {
    let context = null;
    try {
      context = this.createSocketContext(socket, type);
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
      this.logger(e, "ERROR");
      if (context) {
        context.fire("onError", context.container, e);
        return Promise.resolve(context);
      } else {
        return Promise.reject(e);
      }
    }
    return this.kernelHttp.handleFrontController(context)
      .then((controller) => {
        if (context.secure) {
          if (context.security || context.isControlledAccess) {
            return this.firewall.handleSecurity(context);
          }
          return context.fire("connect", socket);
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
                  this.logger(e, "ERROR");
                  context.fire("onError", context.container, e);
                  return context;
                }
                context.fire("connect", socket);
              }).catch((error) => {
                this.logger(error, "ERROR");
                context.fire("onError", context.container, error);
                return context;
              });
          } else {
            context.fire("connect", socket);
          }
        } catch (e) {
          this.logger(e, "ERROR");
          context.fire("onError", context.container, e);
        }
        return context;
      }).catch(e => {
        this.logger(e, "ERROR");
        context.fire("onError", context.container, e);
        return context;
      });
  }

  createSocketContext(socket, type) {
    let container = this.kernel.container.enterScope("request");
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
    return context;
  }

};