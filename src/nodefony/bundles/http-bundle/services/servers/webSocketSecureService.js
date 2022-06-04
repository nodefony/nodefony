// https://github.com/Worlize/WebSocket-Node/wiki/Documentation
const WebSocketServer = require('websocket');

module.exports = class websocketServerSecure extends nodefony.Service {

  constructor(httpKernel, options) {

    super("WEBSOCKET SECURE", httpKernel.container, httpKernel.notificationsCenter, options);

    this.httpKernel = httpKernel;
    this.port = this.httpKernel.kernel.httpsPort;
    this.domain = this.httpKernel.kernel.settings.system.domain;
    this.ready = false;
    this.type = "WEBSOCKET SECURE";
  }

  createServer(http /*, settings*/ ) {

    this.bundle.on("onServersReady", (type) => {
      if (type === "HTTPS") {
        try {
          let addr = http.address();
          this.port = addr.port;
          this.domain = addr.address;
          this.settings = this.getParameters("bundles.http").websocketSecure || {};
          let conf = nodefony.extend(true, {}, this.settings);
          conf.httpServer = http;
          this.websocketServer = new WebSocketServer.server(conf);

          this.websocketServer.on('request', (request) => {
            return this.httpKernel.onWebsocketRequest(request, this.type);
          });

          this.prependOnceListener("onTerminate", () => {
            return new Promise((resolve, reject) => {
              if (this.websocketServer && this.ready) {
                this.websocketServer.broadcast(JSON.stringify({
                  nodefony: {
                    state:'shutDown'
                  }
                }));
                setTimeout(() => {
                  try {
                    if( this.websocketServer.config.httpServer ){
                      this.websocketServer.shutDown();
                    }
                    this.log(" SHUTDOWN WEBSOCKET SECURE Server is listening on DOMAIN : " + this.domain + "    PORT : " + this.port, "INFO");
                    return resolve(true)
                  } catch (e) {
                    return reject(e)
                  }
                }, 500)
                return
              }
              return resolve(true)
            })
          });

          if (this.websocketServer) {
            this.ready = true;
          }
          this.bundle.fire("onServersReady", this.type, this);
          this.log("Listening on DOMAIN : wss://" + this.domain + ":" + this.port, "INFO");
          return this.websocketServer;
        } catch (e) {
          this.log(e, "ERROR");
          throw e;
        }
      }
    });
  }

  removePendingRequests(url) {
    if (url && this.websocketServer) {
      this.websocketServer.pendingRequests.forEach((request, index) => {
        if (request.httpRequest.url === url) {
          try {
            request.emit('requestResolved', request);
            request.emit('requestRejected', request);
            this.websocketServer.pendingRequests.splice(index, 1);
          } catch (e) {}
        }
      });
    }
  }
};
