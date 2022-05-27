const net = require('net');
const dgram = require('dgram');
const TcpSocket = require(path.resolve(__dirname, "..", "src", "tcpSocket.js"));
const UdpSocket = require(path.resolve(__dirname, "..", "src", "udpSocket.js"));
const UnixSocket = require(path.resolve(__dirname, "..", "src", "unixSocket.js"));
const Connections = require(path.resolve(__dirname, "..", "src", "connections.js"));

class realTime extends nodefony.Service {

  constructor(container) {
    super("NODEFONY-SOCKET", container);
    this.version = "1.0";
    this.connections = new Connections();
    this.services = {};
    this.protocol = new nodefony.io.protocol.bayeux();
    this.on("onError", this.onError.bind(this));
    if(this.kernel.ready){
      this.initialize()
    }else{
      this.kernel.once("onReady", () => {
        this.initialize()
      });
    }
  }

  initialize(){
    this.settings = this.container.getParameters("bundles.realtime");
    for (let services in this.settings.services) {
      this.registerService(services, this.settings.services[services]);
    }
  }

  handleConnection(message, context) {
    switch (context.type) {
    case "HTTP":
    case "HTTPS":
    case "HTTP2":
      let data = this.protocol.onMessage(message, context);
      let url = nodefony.extend({}, context.request.url);
      if (context.scheme === "https") {
        url.protocol = "wss:";
        data.ext.url = url;
      } else {
        url.protocol = "ws:";
        data.ext.url = url;
      }
      return data
    case "WEBSOCKET":
    case "WEBSOCKET SECURE":
      this.onMessage(message, context);
    }
    return null;
  }

  registerService(name, definition) {
    this.services[name] = definition;
    return this.services[name];
  }

  getServices() {
    return this.services;
  }

  createSocket(type, options, port, domain) {
    type = type.toUpperCase();
    switch (type) {
    case "TCP":
      return this.socketTcp(options);
    case "UDP":
      return this.socketUdp(options);
    case "UNIX":
      return this.socketUnix(options);
    }
  }

  socketTcp(...args) {
    try {
      return new TcpSocket(...args);
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  socketUdp(...args) {
    try {
      return new UdpSocket(...args);
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  socketUnix(...args) {
    try {
      return new UnixSocket(...args);
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  async onMessage(message, context) {
    switch (nodefony.typeOf(message)) {
    case "string":
      try {
        this.protocol.parser(message, (err, mess) => {
          if (err) {
            message.error = this.protocol.errorResponse(500, message.clientId + "," + message.channel, "bad Request  " + err);
            return this.send(context, this.protocol.send(message));
          }
          return this.onMessage(mess, context);
        });
      } catch (e) {
        this.log(e, "ERROR");
        message.error = this.protocol.errorResponse(500, message.clientId + "," + message.channel, "bad Request  " + e.message);
        return this.send(context, this.protocol.send(message));
      }
      break;
    case "object":
      try {
        this.log("message", "DEBUG");
        this.log(message, "DEBUG");
        switch (message.channel) {
        case "/meta/connect":
          {
            let connection = this.connections.setConnection(context);
            this.log("connect realtime : " + connection.id, "INFO");
            message.clientId = connection.id;
            context.once("onClose", ( /*code, info*/ ) => {
              let res = this.connections.removeConnection(connection.id)
              if (res) {
                this.log("Close realtime connection : " + connection.id, "INFO");
                return;
              }
              this.log("Close realtime connection not found : " + connection.id, "WARNING");
            });
            //this.logger("connect response", this.onConnect(message, connection))
            return this.send(context, this.onConnect(message, connection));
          }
          /*case "/meta/handshake":
            {
              const connection = this.connections.getConnection(context);
              this.log("handshake connection  : " + connection.id, "INFO");
              return this.send(context, this.onHandshake(message, connection));
            }*/
        case "/meta/disconnect":
          return this.onDisconnect(message, context);
          //return this.send( context, this.onDisconnect(message, context) );
        case "/meta/subscribe":
          return this.onSubscribe(this.protocol.subscribeResponse(message), message.data, context);
        case "/meta/unsubscribe":
          return this.onUnSubscribe(this.protocol.unsubscribeResponse(message), message.data, context);
        default:
          // /some/channel
          return this.send(context, await this.onPublish(message));
        }
      } catch (e) {
        this.log(e, "ERROR");
        message.error = this.protocol.errorResponse(500, message.clientId + "," + message.channel, "bad Request  " + message);
        return this.send(context, this.protocol.send(message));
      }
      break;
    case "array":
      let tab = [];
      for (let i = 0; i < message.length; i++) {
        tab.push(this.onMessage(message[i]), context);
      }
      return tab;
    default:
      throw new Error("BAYEUX message bad format ");
    }
  }

  /*onHandshake(message, connection) { //Id, ipClient) {
    let advice = this.settings.system.reconnect.handshake;
    let response = this.protocol.handshakeResponse(message, advice, {
      address: connection.remote
    });
    response.clientId = connection.id;
    response.successful = true;
    return this.protocol.send(response);
  }*/

  onUnSubscribe(message, data /*, context, error*/ ) {
    try {
      let name = message.subscription.split("/")[2];
      let serv = this.services[name];
      switch (serv.type) {
      case "tcp":
        let client = this.connections.getSocket(message.clientId);
        if (client) {
          client.end(data);
          //this.send(context, this.protocol.send( message )  );
        }
        break;
      default:
      }
    } catch (e) {
      this.log("UNSUBCRIBE  : " + e, "ERROR");
    }
  }

  onConnect(message, connection) {
    let advice = this.settings.system.reconnect.connect;
    let response = this.protocol.connectResponse(message, advice, {
      address: connection.remote
    });
    response.data = this.getServices();
    return this.protocol.send(response);
  }

  onDisconnect(message, context) {
    let response = this.protocol.disconnectResponse(message);
    this.send(context, this.protocol.send(response));
    context.close();
  }

  onPublish(message) {
    let socket = this.connections.getSocket(message.clientId);
    let error = null;
    if (socket) {
      if (message.data) {
        try {
          return socket.send(message.data)
            .then(() => {
              return this.protocol.publishResponse(message.subscription, message.id);
            })
            .catch(e => {
              this.log(e, "ERROR");
            })
        } catch (e) {
          return this.protocol.publishResponse(message.subscription, message.id, false);
        }
      } else {
        error = this.protocol.errorResponse(500, message.subscription + "," + message.id, "no message ");
        return this.protocol.publishResponse(message.subscription, message.id, error);
      }
    } else {
      error = this.protocol.errorResponse(404, message.subscription + "," + message.id, "Unknown Channel");
      this.log(message, "ERROR");
      return this.protocol.publishResponse(message.subscription, message.id, error);
    }
  }

  onError(error, connection) {
    return this.send(connection, this.protocol.close(error));
  }

  onSubscribe(message, data, context) {
    let name = message.subscription.split("/")[2];
    let serv = this.services[name];
    if (!serv) {
      message.error = this.protocol.errorResponse(404, message.subscription, "Unknown Channel");
      return this.send(context, this.protocol.send(message));
    }
    let socket = null;
    switch (serv.type) {
    case "TCP":
    case "tcp":
      {
        let options = nodefony.extend(true, {}, serv.options || {});
        try {
          socket = this.createSocket(serv.type, options);
          let id = null;
          this.log(`Try to connect tcp socket ${serv.domain}:${serv.port}`, "INFO");
          this.log(options, "DEBUG");
          socket.connect(serv.port, serv.domain)
            .then((ret) => {
              try {
                id = this.connections.setSocket(message.clientId, socket);
                message.successful = true;
                message.clientId = id;
                message.ext = {
                  socket: socket.toJson()
                };
                this.log(`CONNECT SOCKET TCP : ${name} ${serv.domain} ${serv.port} => clientId : ${id}`, "INFO");
                return message;
              } catch (e) {
                throw e;
              }
            })
            .then((message) => {
              try {
                if (data) {
                  socket.send(data);
                }
                return this.send(context, this.protocol.send(message));
              } catch (e) {
                throw e;
              }
            })
            .catch((e) => {
              this.log(e, 'ERROR');
              message.error = this.protocol.errorResponse(500, message.subscription, e.message);
              this.send(context, this.protocol.send(message));
              if (id) {
                this.connections.removeSocket(socket);
              }
              throw e;
            })

          socket.on("data", (buffer) => {
            this.send(context,
              this.protocol.publishMessage(message.subscription, buffer.toString(), message.clientId));
          });

          socket.on("end", () => {
            message.channel = "/meta/unsubscribe";
            //message.data = error ;
            message.subscription = "/service/" + name;
            message.successful = true;
            this.onUnSubscribe(message, null, context);
            return this.send(context, this.protocol.send(message));
          });

          socket.on("error", (error) => {
            let res = null;
            switch (error.code) {
            case "ECONNREFUSED":
              res = this.protocol.subscribeResponse(message);
              res.error = this.protocol.errorResponse(403, message.clientId + "," + message.channel, error.errno);
              res.successful = false;
              this.send(context, this.protocol.send(res));
              break;
            case "ETIMEDOUT":
              res = this.protocol.subscribeResponse(message);
              res.error = this.protocol.errorResponse(408, message.clientId + "," + message.channel, error.errno);
              res.successful = false;
              this.send(context, this.protocol.send(res));
              break;
            }
            this.log("ERROR SERVER DOMAIN : " + serv.domain + " SERVER PORT : " + serv.port + " SERVICE : " + name + " " + error, "ERROR");
            throw error;
          });

          socket.on("close", (error) => {
            if (error) {
              this.log(error, "ERROR");
              socket.destroy();
              socket = null;
              throw error;
            } else {
              let connection = this.connections.getConnection(context);
              if (connection) {
                this.connections.removeSocket(socket)
                  .then(() => {
                    this.log(`Close Socket id : ${socket.id}`);
                  });
                let size = null;
                if (connection && connection.mustClose) {
                  size = Object.keys(connection.clients).length;
                }
                this.log("UNSUBCRIBE SERVICE : " + name + " ID = " + socket.id, "INFO");
                if (connection && connection.mustClose) {
                  //console.log("SIZE clients struck :" + size)
                  if (size === 1) {
                    if (connection.disconnect) {
                      //console.log(connection.disconnect)
                      this.send(context, connection.disconnect);
                    }
                    this.connections.removeConnection(connection.id);
                    this.log("REMOVE ID connection : " + connection.id, "INFO");
                  }
                }
              }
            }
            socket.destroy();
            socket = null;
          });
        } catch (e) {
          this.log(e, "ERROR");
          message.error = this.protocol.errorResponse(500, message.subscription, "Create TCP Socket error");
          return this.send(context, this.protocol.send(message));
          throw e;
        }
        break;
      }
    case "UDP":
    case "udp":
      {
        let options = nodefony.extend(true, {}, serv.options || {});
        try {
          socket = this.createSocket(serv.type, options);
          let id = null;
          this.log(`Try to connect udp socket  ${serv.domain}:${serv.port}`, "INFO");
          this.log(options, "DEBUG");
          socket.connect(serv.port, serv.domain)
            .then((ret) => {
              try {
                id = this.connections.setSocket(message.clientId, socket);
                message.successful = true;
                message.clientId = id;
                message.ext = {
                  socket: socket.toJson()
                };
                this.log(`CONNECT SOCKET UDP : ${message.ext.socket.address.address} ${message.ext.socket.address.port} => clientId : ${id}`, "INFO");
                return message;
              } catch (e) {
                throw e
              }
            })
            .then((message) => {
              if (data) {
                socket.send(data)
                  .then((ele) => {
                    this.log("SEND MESSAGE : " + data, "DEBUG");
                    return ele;
                  })
                  .catch(error => {
                    this.log(error, "ERROR");
                    return;
                  });
              }
              return this.send(context, this.protocol.send(message));
            })
            .catch((e) => {
              this.log(e, 'ERROR');
              message.error = this.protocol.errorResponse(500, message.subscription, e.message);
              this.send(context, this.protocol.send(message));
              if (id) {
                this.connections.removeSocket(socket);
              }
              throw e;
            })
          /*socket.bind({
              address: this.kernel.domain,
              exclusive: true
            }).then((res) => {
              try{
                id = this.connections.setSocket(message.clientId, socket);
                message.successful = true;
                message.clientId = id;
                message.ext = {
                  socket: socket.toJson()
                };
                this.log(`LISTENING SOCKET UDP : ${message.ext.socket.address.address} ${message.ext.socket.address.port} => clientId : ${id}`, "INFO");
                return message;
              }catch(e){
                throw e
              }
            })
            .then((message) => {
              if (data) {
                socket.send(data)
                  .then((ele) => {
                    this.log("SEND MESSAGE : " + data, "DEBUG");
                    return ele;
                  })
                  .catch(error => {
                    this.log(error, "ERROR");
                    return;
                  });
              }
              return this.send(context, this.protocol.send(message));
            })
            .catch(() => {
              this.log(e, 'ERROR');
              message.error = this.protocol.errorResponse(500, message.subscription, e.message);
              this.send(context, this.protocol.send(message));
              if (id) {
                this.connections.removeSocket(socket);
              }
              throw e;
            });*/

          socket.on('message', (buffer, rinfo) => {
            this.send(context,
              this.protocol.publishMessage(message.subscription, buffer.toString(), message.clientId));
          });

          socket.on("close", (error) => {
            if (error) {
              this.log(error, "ERROR");
              socket = null;
              throw error;
            } else {
              let connection = this.connections.getConnection(context);
              if (connection) {
                this.connections.removeSocket(socket)
                  .then(() => {
                    this.log(`Close Socket id : ${socket.id}`);
                  });
                let size = null;
                if (connection && connection.mustClose) {
                  size = Object.keys(connection.clients).length;
                }
                this.log("UNSUBCRIBE SERVICE : " + name + " ID = " + socket.id, "INFO");
                if (connection && connection.mustClose) {
                  //console.log("SIZE clients struck :" + size)
                  if (size === 1) {
                    if (connection.disconnect) {
                      //console.log(connection.disconnect)
                      this.send(context, connection.disconnect);
                    }
                    this.connections.removeConnection(connection.id);
                    this.log("REMOVE ID connection : " + connection.id, "INFO");
                  }
                }
              }
            }
            socket = null;
          });

          socket.on("error", (error) => {
            let res = null;
            switch (error.code) {
            case "ECONNREFUSED":
              res = this.protocol.subscribeResponse(message);
              res.error = this.protocol.errorResponse(403, message.clientId + "," + message.channel, error.errno);
              res.successful = false;
              this.send(context, this.protocol.send(res));
              break;
            case "ETIMEDOUT":
              res = this.protocol.subscribeResponse(message);
              res.error = this.protocol.errorResponse(408, message.clientId + "," + message.channel, error.errno);
              res.successful = false;
              this.send(context, this.protocol.send(res));
              break;
            }
            this.log("ERROR SERVER DOMAIN : " + serv.domain + " SERVER PORT : " + serv.port + " SERVICE : " + name + " " + error, "ERROR");
            throw error;
          });

        } catch (e) {
          this.log(e, "ERROR");
          message.error = this.protocol.errorResponse(500, message.subscription, "Create UDP Socket error");
          return this.send(context, this.protocol.send(message));
          throw e;
        }
        break;
      }
    case "socket":
      {
        break;
      }
    case "spawn":
      {
        break;
      }
    default:
      message.error = this.protocol.errorResponse(500, message.clientId + "," + message.channel, "bad connection Type " + serv.type);
      return this.send(context, this.protocol.send(message));
    }
    return socket;
  }

  send(connection, message) {
    this.log("SEND", "DEBUG");
    this.log(message, "DEBUG");
    try {
      switch (connection.type) {
      case "HTTP":
      case "HTTPS":
      case "HTTP2":
        connection.response.body = message;
        connection.response.setHeader("Content-Type", "application/json");
        return connection.response;
        //break;
      case "WEBSOCKET":
      case "WEBSOCKET SECURE":
        connection.send(message);
        break;
      }
      return connection.response;
    } catch (e) {
      this.log(e, "ERROR");
    }
  }
}
module.exports = realTime;
