const shortId = require('shortid');

module.exports = nodefony.register.call(nodefony.io.protocol, "bayeux", function () {

  const defaultSettings = {
    timestamp: true
  };

  class Bayeux extends nodefony.io.protocol.reader {
    constructor(rootName, settings) {

      super(null, {
        extention: "json"
      });

      this.settings = nodefony.extend({}, defaultSettings, settings);

      this.supportedConnectionTypes = [];

      this.response = {
        version: "1.0",
      };

    }

    generateClientId() {
      return shortId.generate();
    }

    generateTimestamp() {
      return new Date().toUTCString();
    }

    handshakeResponse(message, advice, ext) {
      let reconnect = null;
      if (advice) {
        reconnect = "retry";
      } else {
        reconnect = "none";
      }
      let ele = nodefony.extend({}, this.response, {
        channel: "/meta/handshake",
        //clientId:this.generateClientId(),
        supportedConnectionTypes: ["websocket"],
        //successful:true,
        authSuccessful: true,
        advice: {
          reconnect: reconnect
        },
        ext: ext || {}
      });
      if (this.settings.timestamp) {
        ele.timestamp = this.generateTimestamp();
      }
      return ele;
    }

    connectResponse(message, advice, ext) {
      let reconnect = null;
      if (advice) {
        reconnect = "retry";
      } else {
        reconnect = "none";
      }
      let ele = nodefony.extend({}, this.response, {
        channel: "/meta/connect",
        successful: true,
        error: "",
        clientId: message.clientId,
        timestamp: new Date(),
        advice: {
          reconnect: reconnect
        },
        ext: ext || {}
      });
      return ele;
    }

    disconnectResponse(message) {
      let ele = nodefony.extend({}, this.response, {
        channel: "/meta/disconnect",
        clientId: message.clientId,
        successful: true
      });
      return ele;
    }

    subscribeResponse(message) {
      let ele = nodefony.extend({}, this.response, {
        channel: "/meta/subscribe",
        clientId: message.clientId,
        subscription: message.subscription,
        error: ""
      });
      return ele;
    }

    unsubscribeResponse(message) {
      var ele = nodefony.extend({}, this.response, {
        channel: "/meta/unsubscribe",
        clientId: message.clientId,
        subscription: message.subscription,
        successful: true,
        error: ""
      });
      return ele;
    }

    publishResponse(channel, id, error) {
      return this.send(nodefony.extend({}, this.response, {
        channel: channel,
        successful: error ? false : true,
        error: error,
        id: id
      }));
    }

    publishMessage(channel, data, clientId) {
      return this.send(nodefony.extend({}, this.response, {
        channel: channel,
        data: data,
        clientId: clientId
      }));
    }

    errorResponse(code, channel, message) {
      return {
        error: code + ":" + channel + ":" + message
      };
    }

    onMessage(message) {
      switch (nodefony.typeOf(message)) {
      case "string":
        var ret = null;
        this.parser(message, (err, mess) => {
          if (err) {
            //console.log(err)
            throw err;
          }
          ret = this.onMessage(mess);
        });
        return ret;
      case "object":
        switch (message.channel) {
        case "/meta/handshake":
          return this.send(this.handshakeResponse(message));
        case "/meta/connect":
          return this.send(this.connectResponse(message));
        case "/meta/disconnect":
          return this.send(this.disconnectResponse(message));
        case "/meta/subscribe":
          return this.send(this.subscribeResponse(message));
        case "/meta/unsubscribe":
          return this.send(this.unsubscribeResponse(message));
        default:
          return this.send(this.publishResponse(message));
          // /some/channel
        }
        break;
      case "array":
        var tab = [];
        for (var i = 0; i < message.length; i++) {
          tab.push(this.onMessage(message[i]));
        }
        return this.send(tab);
      default:
        throw new Error("BAYEUX message bad format ");
      }
    }

    send(message) {
      return this.builderResponse(message);
    }
  }
  return Bayeux;
});