// https://github.com/Worlize/WebSocket-Node/wiki/Documentation

module.exports = class websocket2Server extends nodefony.Service {

  constructor(httpKernel, options) {

    super("SERVER WEBSOCKET2", httpKernel.container, httpKernel.notificationsCenter, options);

    this.httpKernel = httpKernel;
    this.port = this.httpKernel.kernel.http2Port;
    this.domain = this.httpKernel.kernel.settings.system.domain;
    this.ready = false;
    this.type = "WEBSOCKET2";
  }

  createServer(http2 /*, settings*/ ) {

    this.bundle.listen(this, "onServersReady", function (type) {
      if (type === "HTTP2") {
        try {
          this.settings = this.getParameters("bundles.http").websocketSecure || {};
          let conf = nodefony.extend(true, {}, this.settings);
          conf.httpServer = http2;
          this.websocketServer = new WebSocketServer.server(conf);

          this.websocketServer.on('request', (request) => {
            return this.httpKernel.onWebsocketRequest(request, this.type);
          });

          this.listen(this, "onTerminate", () => {
            if (this.websocketServer && this.ready) {
              this.websocketServer.shutDown();
              this.logger(" SHUTDOWN WEBSOCKET2 Server is listening on DOMAIN : " + this.domain + "    PORT : " + this.port, "INFO");
            }
          });

          if (this.websocketServer) {
            this.ready = true;
            this.logger(" Server  is listening on DOMAIN : wss://" + this.domain + ":" + this.port, "INFO");
          }
          this.bundle.fire("onServersReady", this.type, this);
          return this.websocketServer;
        } catch (e) {
          this.logger(e);
          throw e;
        }
      }
    });
  }
};
