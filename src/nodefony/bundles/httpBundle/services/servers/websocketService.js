// https://github.com/Worlize/WebSocket-Node/wiki/Documentation
const WebSocketServer = require('websocket');

module.exports = class websocketServer extends nodefony.Service {

  constructor(httpKernel, options) {

    super("SERVER WEBSOCKET", httpKernel.container, httpKernel.notificationsCenter, options);

    this.httpKernel = httpKernel;
    this.port = this.httpKernel.kernel.httpPort;
    this.domain = this.httpKernel.kernel.settings.system.domain;
    this.ready = false;
    this.type = "WEBSOCKET";
  }

  createServer(http) {

    this.bundle.listen(this, "onServersReady", function (type) {
      if (type === "HTTP") {
        try {
          this.settings = this.getParameters("bundles.http").websocket || {};
          let conf = nodefony.extend(true, {}, this.settings);
          conf.httpServer = http;
          this.websocketServer = new WebSocketServer.server(conf);
          this.websocketServer.on('request', (request) => {
            return this.httpKernel.onWebsocketRequest(request, this.type);
          });

          this.kernel.listen(this, "onTerminate", () => {
            if (this.websocketServer && this.ready) {
              this.websocketServer.shutDown();
              this.logger(" SHUTDOWN WEBSOCKET Server is listening on DOMAIN : " + this.domain + "    PORT : " + this.port, "INFO");
            }
          });

          if (this.websocketServer) {
            this.ready = true;
            this.logger("Listening on DOMAIN : ws://" + this.domain + ":" + this.port, "INFO");
          }
          this.bundle.fire("onServersReady", this.type, this);
          return this.websocketServer;
        } catch (e) {
          this.logger(e, "ERROR");
          throw e;
        }
      }
    });
  }
};