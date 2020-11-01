const net = require('net');
const dgram = require('dgram');

const TcpSocket = require(path.resolve(__dirname, "..", "src", "tcpSocket.js"));
const UdpSocket = require(path.resolve(__dirname, "..", "src", "udpSocket.js"));
const UnixSocket = require(path.resolve(__dirname, "..", "src", "unixSocket.js"));
const Connections = require(path.resolve(__dirname, "..", "src", "connections.js"));


const settingsSyslog = {
  moduleName: "REALTIME",
  defaultSeverity: "INFO"
};

const cleanConnection = function (cliendID, disconnect, context) {
  let connectionID = null;
  try {
    if (this.connections.connections[cliendID]) {
      connectionID = this.connections.connections[cliendID].id;
      if (!connectionID) {
        return;
      }
    } else {
      return;
    }
    if (disconnect) {
      this.connections.connections[connectionID].disconnect = disconnect;
      this.connections.connections[connectionID].context = context;
    }
    let pass = false;
    for (let cli in this.connections.connections[connectionID].clients) {
      pass = true;
      if (this.connections.connections[connectionID].clients[cli].end) {
        this.connections.connections[connectionID].clients[cli].end();
      }
      if (this.connections.connections[connectionID].clients[cli].close) {
        this.connections.connections[connectionID].clients[cli].close();
      }
    }
    if (pass) {
      this.connections.connections[connectionID].mustClose = true;
    } else {
      this.connections.removeConnection(connectionID);
      this.log("REMOVE ID connection : " + connectionID, "INFO");
    }
  } catch (e) {
    this.log(e, "ERROR");
  }
};


class realTime extends nodefony.Service {

  constructor(container, kernel) {
    super("REALTIME", container, );
    this.version = "1.0";
    this.connections = new Connections();
    this.services = {};
    this.protocol = new nodefony.io.protocol.bayeux();
    this.on("onError", this.onError.bind(this));
    this.kernel.once("onReady", () => {
      this.settings = this.container.getParameters("bundles.realtime");
      for (let services in this.settings.services) {
        this.registerService(services, this.settings.services[services]);
      }
    });
  }

  createSocket(type, options) {
    type = type.toUpperCase();
    switch (type) {
    case "TCP":
      return this.socketTcp(options, this);
    case "UDP":
      return this.socketUdp(options, this);
    case "UNIX":
      return this.socketUnix(options, this);
    }
  }

  socketTcp(...args) {
    return new TcpSocket(...args)
  }

  socketUdp(...args) {
    return new UdpSocket(...args)
  }

  socketUnix(...args) {
    return new UnixSocket(...args)
  }

  registerService(name, definition) {
    this.services[name] = definition;
    return this.services[name];
  }

  getServices() {
    return this.services;
  }

  onHandshake(message, connectionId, ipClient) {
    let advice = this.settings.system.reconnect.handshake;
    let response = this.protocol.handshakeResponse(message, advice, {
      address: ipClient
    });
    response.clientId = connectionId;
    response.successful = true;
    return this.protocol.send(response);
  }

  onSubscribe(message, data, context) {
    let name = message.subscription.split("/")[2];
    let serv = this.services[name];
    if (!serv) {
      message.error = this.protocol.errorResponse(404, message.subscription, "Unknown Channel");
      return this.send(context, this.protocol.send(message));
    }
    let client = null;
    let socket = null;
    switch (serv.type) {
    case "TCP":
    case "tcp":
    /*  try {
        socket = this.createSocket(serv.type, {
          allowHalfOpen: true,
          highWaterMark: 1024 * 64
        });
        socket.connect(serv.port, serv.domain)
          .then((ret) => {
            let id = this.connections.setClient(message.clientId, socket);
            message.successful = true;
            message.clientId = id;
            this.log(`CONNECT SERVICE TCP : ${name} => clientId : ${id}`, "INFO");
            return id;
          })
          .then((id) => {
            try {
              if (data) {
                socket.write(data);
              }
              return id ;
            } catch (e) {
              if (id) {
                this.connections.removeClient(socket);
              }
              throw e;
            }
          })
          .catch((e) => {
            this.log(e, 'ERROR');
            message.error = this.protocol.errorResponse(500, message.subscription, e.message);
            return this.send(context, this.protocol.send(message));
            throw e;
          })
        socket.on("data", (buffer) => {
          this.send(context,
            this.protocol.publishMessage(message.subscription, buffer.toString(), message.clientId));
        });
      } catch (e) {
        message.error = this.protocol.errorResponse(500, message.subscription, "Create Socket error");
        return this.send(context, this.protocol.send(message));
        throw e;
      }*/

      client = new net.Socket({
        allowHalfOpen: true,
        //highWaterMark:16384*2
        highWaterMark: 1024 * 64,
        //readable: true,
        //writable: true
      });

      //console.log(client)
      client.connect(serv.port, serv.domain, () => {
        let id = null;
        try {
          if (data) {
            client.write(data);
          }
          id = this.connections.setClient(message.clientId, client);
          message.successful = true;
          //message.data = id;
          message.clientId = id;
          //console.log(client)
          this.log("SUBCRIBE SERVICE TCP : " + name + " ID = " + id, "INFO");
        } catch (e) {
          if (id) {
            this.connections.removeClient(client);
          }
          message.successful = false;
          message.error = e;
          this.log("SUBCRIBE SERVICE TCP: " + name + " ID = " + id + " " + e, "ERROR");
        }
        this.send(context, this.protocol.send(message));
      });

      client.on("data", (buffer) => {
        //console.log(buffer)
        //this.log(buffer.length, "INFO")
        //console.log("--------")
        //console.log(buffer.length)
        //console.log(buffer.toString())
        // ENCAPSULATION buffer in bayeux data
        //console.log(buffer.toString())
        this.send(context, this.protocol.publishMessage(message.subscription, buffer.toString(), message.clientId));
        //client.push("");
      });


      client.on("end", () => {
        message.channel = "/meta/unsubscribe";
        //message.data = error ;
        message.subscription = "/service/" + name;
        message.successful = true;
        this.onUnSubscribe(message, null, context);
        this.send(context, this.protocol.send(message));
      });

      client.on("error", (error) => {
        let res = null;
        switch (error.code) {
        case "ECONNREFUSED":
          //this.send( context ,this.protocol.errorResponse(403, message.clientId+","+message.channel,error.errno ) );
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
        //console.log(error);
        this.log("ERROR SERVER DOMAIN : " + serv.domain + " SERVER PORT : " + serv.port + " SERVICE : " + name + " " + error, "ERROR");
      });

      client.on("close", (error) => {
        if (error) {
          this.log("CANNOT CONNECT SERVICE : " + name, "ERROR");
          client.destroy();
          client = null;
          throw error;
        } else {
          let connection = this.connections.getConnection(client);
          let size = null;
          if (connection && connection.mustClose) {
            size = Object.keys(connection.clients).length;
          }
          let id = this.connections.removeClient(client);
          this.log("UNSUBCRIBE SERVICE : " + name + " ID = " + id, "INFO");
          if (connection && connection.mustClose) {
            //console.log("SIZE clients struck :" + size)
            if (size === 1) {
              if (connection.disconnect) {
                //console.log(connection.disconnect)
                this.send(connection.context, connection.disconnect);
              }
              this.connections.removeConnection(connection.id);
              this.log("REMOVE ID connection : " + connection.id, "INFO");
            }
          }
        }
        client.destroy();
        client = null;
      });


      break;
    case "socket":
      break;
    case "UDP":
    case "udp":
      client = dgram.createSocket({
        type: 'udp4',
        reuseAddr: true
      });

      client.write = function (message, callback) {
        this.send(message, 0, message.length, serv.port, serv.domain, callback);
      }.bind(client);

      client.bind({
        //port:8000,
        address: this.kernel.domain,
        exclusive: true
      });

      client.on("listening", () => {
        let address = client.address();

        let id = this.connections.setClient(message.clientId, client);
        message.successful = true;
        //message.data = id;
        message.clientId = id;
        //console.log(client)
        this.log("SUBCRIBE SERVICE " + name + " UDP LISTEN ON : " + address.address + ":" + address.port + " ID = " + id, "INFO");

        if (data) {
          client.write(data, (error) => {
            if (error) {
              this.log(error, "ERROR");
              return;
            }
            this.log("SEND MESSAGE : " + data, "DEBUG");
          });
        }
        this.send(context, this.protocol.send(message));
      });

      // Listen for messages from client
      client.on('message', (buffer /*, rinfo*/ ) => {
        this.log("MESSAGE UDP : " + buffer.toString(), "DEBUG");
        this.send(context, this.protocol.publishMessage(message.subscription, buffer.toString(), message.clientId));
      });

      client.on("close", (error) => {
        //console.log("close client");
        if (error) {
          this.log("CANNOT CONNECT SERVICE : " + name, "ERROR");
          //client.destroy();
          client = null;
          throw error;
        } else {
          this.log("CLOSE SOCKET UDP ", "DEBUG");
          let connection = this.connections.getConnection(client);
          let size = null;
          if (connection && connection.mustClose) {
            size = Object.keys(connection.clients).length;
          }
          let id = this.connections.removeClient(client);
          this.log("UNSUBCRIBE SERVICE : " + name + " ID = " + id, "INFO");
          if (connection && connection.mustClose) {
            //console.log("SIZE clients struck :" + size)
            if (size === 1) {
              if (connection.disconnect) {
                //console.log(connection.disconnect)
                this.send(connection.context, connection.disconnect);
              }
              this.connections.removeConnection(connection.id);
              this.log("REMOVE ID connection : " + connection.id, "INFO");
            }
          }
        }
        //client.destroy();
        client = null;
      });

      client.on("error", (error) => {
        let res = null;
        switch (error.code) {
        case "ECONNREFUSED":
          //this.send( context ,this.protocol.errorResponse(403, message.clientId+","+message.channel,error.errno ) );
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
        //console.log(error);
        this.log("ERROR SERVER DOMAIN : " + serv.domain + " SERVER PORT : " + serv.port + " SERVICE : " + name + " " + error, "ERROR");
      });

      break;
    case "spawn":
      //let spawn = require('child_process').spawn;
      break;
    default:
      message.error = this.protocol.errorResponse(500, message.clientId + "," + message.channel, "bad connection Type " + serv.type);
      return this.send(context, this.protocol.send(message));
    }
    return client;
  }

  onUnSubscribe(message, data /*, context, error*/ ) {
    try {
      let name = message.subscription.split("/")[2];
      let serv = this.services[name];
      switch (serv.type) {
      case "tcp":
        let client = this.connections.getClient(message.clientId);
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

  onConnect(message, ipClient) {
    let advice = this.settings.system.reconnect.connect;
    let response = this.protocol.connectResponse(message, advice, {
      address: ipClient
    });
    response.data = this.getServices();
    return this.protocol.send(response);
  }

  onDisconnect(message, context) {
    let response = this.protocol.disconnectResponse(message);
    cleanConnection.call(this, message.clientId, this.protocol.send(response), context);
    //return this.protocol.send(response);
    //return this.send( context, this.protocol.send(response) );
  }

  onPublish(message) {
    let client = this.connections.getClient(message.clientId);
    let error = null;
    if (client) {
      if (message.data) {
        try {
          client.write(message.data);
          return this.protocol.publishResponse(message.subscription, message.id);
        } catch (e) {
          return this.protocol.publishResponse(message.subscription, message.id, false);
        }
      } else {
        error = this.protocol.errorResponse(500, message.subscription + "," + message.id, "no message ");
        return this.protocol.publishResponse(message.subscription, message.id, error);
      }
    } else {
      error = this.protocol.errorResponse(404, message.subscription + "," + message.id, "Unknown Channel");
      return this.protocol.publishResponse(message.subscription, message.id, error);
    }
  }

  onError(error, connection) {
    return this.send(connection, this.protocol.close(error));
  }

  handleConnection(message, context) {
    switch (context.type) {
    case "WEBSOCKET":
    case "WEBSOCKET SECURE":
      this.onMessage(message, context);
    }
    return null;
  }

  onMessage(message, context) {
    switch (nodefony.typeOf(message)) {
    case "string":
      let ret = null;
      try {
        this.protocol.parser(message, (err, mess) => {
          if (err) {
            message.error = this.protocol.errorResponse(500, message.clientId + "," + message.channel, "bad Request  " + err);
            ret = this.send(context, this.protocol.send(message));
            //throw err ;
            return ret;
          }
          ret = this.onMessage(mess, context);
        });
      } catch (e) {
        message.error = this.protocol.errorResponse(500, message.clientId + "," + message.channel, "bad Request  " + e.message);
        return this.send(context, this.protocol.send(message));
      }
      return ret;
    case "object":
      try {
        let obj = null;
        let connectionId = null;
        let res = null;
        switch (message.channel) {
        case "/meta/handshake":
          let host = context.request.host || context.request.headers.host;
          obj = {
            remoteAddress: context.remoteAddress || context.request.remoteAddress,
            host: url.parse(host)
          };
          //console.log(remoteAddress + " : " + context.request.domain)
          connectionId = this.connections.setConnection(context, obj);
          res = this.onHandshake(message, connectionId, JSON.stringify(obj));
          this.log("CONNECT ID connection  : " + connectionId, "INFO");
          return this.send(context, res);
        case "/meta/connect":
          obj = {
            remoteAddress: context.remoteAddress,
            host: url.parse(context.request.origin)
          };
          connectionId = this.connections.setConnection(context, obj);
          cleanConnection.call(this, message.clientId);
          message.clientId = connectionId;
          //var remoteAddress = context.request.remoteAddress ;
          //var remoteAddress = context.request.domain ;
          //console.log(context.request)
          context.notificationsCenter.once("onClose", ( /*code, info*/ ) => {
            cleanConnection.call(this, message.clientId);
          });
          return this.send(context, this.onConnect(message, JSON.stringify(obj)));
        case "/meta/disconnect":
          return this.onDisconnect(message, context);
          //return this.send( context, this.onDisconnect(message, context) );
        case "/meta/subscribe":
          return this.onSubscribe(this.protocol.subscribeResponse(message), message.data, context);
        case "/meta/unsubscribe":
          return this.onUnSubscribe(this.protocol.unsubscribeResponse(message), message.data, context);
        default:
          // /some/channel
          return this.send(context, this.onPublish(message));
        }
      } catch (e) {
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

  send(connection, message) {
    //console.log("SEND :   "+ message)
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
