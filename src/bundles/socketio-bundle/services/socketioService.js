const io = require("socket.io");

module.exports = class socketio extends nodefony.Service {

  constructor(container, httpsServer) {
    super("Socket.io", container);
    this.httpsServer = httpsServer;
    this.httpBundle = this.httpsServer.bundle;
    this.settings = this.bundle.settings["socket.io"];
    this.path = null;
    if (!this.kernel.ready) {
      this.io = null;
      this.iosecure = null;
      this.namespaces = {};
      this.httpBundle.on("onServersReady", (type, service) => {
        this.init(type, service);
      });
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

  setNameSpace(io, ns) {
    try {
      if (ns) {
        switch (nodefony.typeOf(ns)) {
        case "string":
          this.namespaces[ns] = io.of(ns);
          this.logger(`Add socket.io namespace ${ns}`);
          this.handle(this.namespaces[ns]);
          break;
        case "array":
          for (let i = 0; i < ns.length; i++) {
            this.namespaces[ns[i]] = io.of(ns[i]);
            this.handle(this.namespaces[ns[i]]);
            this.logger(`Add socket.io namespace ${ns[i]}`);
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

  getNameSpace(ns) {
    return this.namespaces[ns] || null;
  }

  init(type, service) {
    switch (type) {
    case "HTTP":
      if (this.settings.http) {
        this.io = io(service.server, this.setOptions(this.settings.http));
        this.logger(`Create Socket.io server`);
        this.setNameSpace(this.io, this.settings.http.namespace);
        this.handle(this.io, type);
      }
      break;
    case "HTTPS":
      if (this.settings.https) {
        this.iosecure = io(service.server, this.setOptions(this.settings.https));
        this.logger(`Create Socket.io Secure Server`);
        this.setNameSpace(this.iosecure, this.settings.https.namespace);
        this.handle(this.iosecure, type);
      }
      break;
    default:
      return;
    }
  }

  handle(io, type) {
    try {
      io.on('connection', (client) => {
        this.logger(` CONNECTION  ${client.id}`, "INFO");
        this.handleSocket(client, type);
        //console.log(client)
        client.on('event', (data) => {
          this.logger(data, "DEBUG");
        });
        client.on('disconnect', (err) => {
          this.logger(err, "ERROR");
        });
      });
    } catch (e) {
      throw e;
    }
  }

  handleSocket(client, type) {
    let container = this.kernel.container.enterScope("request");
    let context = this.createSocketContext(container, client, type);
    console.log(context)

  }

  createSocketContext(container, request, type) {
    let context = new nodefony.context.socket(container, request, type);
    context.listen(this, "onError", this.onError);
    context.once('onFinish', (context) => {
      this.container.leaveScope(container);
      context.clean();
      context = null;
      request = null;
      container = null;
      type = null;
    });
    context.once('onConnect', (context) => {
      if (context.security || context.isControlledAccess) {
        return this.firewall.handleSecurity(context);
      }
      return context.handle();
    });
    return context;
  }




};