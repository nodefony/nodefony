const WebSocketServer = require("websocket");
const http = require("http");
/* eslint-disable max-lines-per-function */
nodefony.register("wsResponse", () => {
  const {CLOSE_DESCRIPTIONS} = WebSocketServer.connection;

  const Response = class Response {
    constructor (connection, container) {
      this.container = container;
      if (connection) {
        this.setConnection(connection);
      } else {
        this.statusMessage = "closed";
        this.config = null;
        this.webSocketVersion = null;
      }
      this.body = "";
      this.statusCode = 1000;
      // cookies
      this.cookies = {};
      this.encoding = this.setEncoding("utf8");
      // struct headers
      this.headers = {};
      this.cookiesToSet = [];
      this.type = "utf8";
    }

    setConnection (connection) {
      this.connection = connection;
      this.statusMessage = this.connection.state;
      this.config = this.connection.config;
      this.webSocketVersion = this.connection.webSocketVersion;
      return connection;
    }

    log (pci, severity, msgid, msg) {
      const syslog = this.container.get("syslog");
      if (!msgid) {
        msgid = "WEBSOCKET RESPONSE";
      }
      return syslog.log(pci, severity, msgid, msg);
    }

    setBody (ele) {
      switch (nodefony.typeOf(ele)) {
      case "object":
      case "array":
        this.body = JSON.stringify(ele);
        break;
      default:
        this.body = ele.toString();
      }
      return this.body;
    }

    getLength (ele) {
      return Buffer.byteLength(ele);
    }

    send (data, type) {
      if (data) {
        switch (type) {
        case "utf8":
          this.connection.sendUTF(data.utf8Data);
          break;
        case "binary":
          this.connection.sendBytes(data.binaryData);
          break;
        default:
          this.connection.send(data);
        }
      } else if (this.body) {
        if (!type) {
          type = this.encoding;
        }
        return this.send(this.body);
      }
      this.body = "";
    }

    broadcast (data, type) {
      if (data) {
        switch (type) {
        case "utf8":
          this.connection.broadcastUTF(data.utf8Data);
          break;
        case "binary":
          this.connection.broadcastBytes(data.binaryData);
          break;
        default:
          this.connection.broadcast(data);
        }
      } else if (this.body) {
        if (!type) {
          type = this.encoding;
        }
        return this.broadcast(this.body);
      }
      this.body = "";
    }

    close (reasonCode, description) {
      if (this.connection.state === "open") {
        try {
          return this.connection.close(reasonCode || this.statusCode, description || "closed");
        } catch (e) {
          throw e;
        }
      }
      throw new Error("Connection already closed");
    }

    drop (reasonCode, description) {
      if (this.connection.state === "open") {
        try {
          return this.connection.close(reasonCode || this.statusCode, description || this.statusMessage);
        } catch (e) {
          throw e;
        }
      }
      throw new Error("Connection already closed");
    }

    clean () {
      delete this.connection;
      delete this.body;
    }

    setEncoding (encoding) {
      return this.encoding = encoding;
    }

    setStatusCode (status, message) {
      if (status && typeof status !== "number") {
        status = parseInt(status, 10);
        if (isNaN(status)) {
          status = 500;
        }
      }
      if (!status) {
        status = 500;
      }
      this.statusCode = status;
      if (!message) {
        if (CLOSE_DESCRIPTIONS[this.statusCode]) {
          message = CLOSE_DESCRIPTIONS[this.statusCode];
        } else {
          message = http.STATUS_CODES[this.statusCode];
        }
      }
      this.statusMessage = message || null;
      return {
        code: this.statusCode,
        message: this.statusMessage
      };
    }

    getStatus () {
      return {
        code: this.getStatusCode(),
        message: this.getStatusMessage()
      };
    }

    getStatusCode () {
      return this.statusCode;
    }

    getStatusMessage () {
      return this.statusMessage;
    }

    addCookie (cookie) {
      if (cookie instanceof nodefony.cookies.cookie) {
        this.cookies[cookie.name] = cookie;
      } else {
        throw new Error("Response addCookies not valid cookies");
      }
    }

    setCookies () {
      for (const cook in this.cookies) {
        this.setCookie(this.cookies[cook]);
      }
    }

    setCookie (cookie) {
      const serialize = cookie.serializeWebSocket();
      this.log(`ADD COOKIE ==> ${serialize}`, "DEBUG");
      this.cookiesToSet.push(serialize);
      // this.setHeader('Set-Cookie', cookie.serialize());
    }

    // ADD INPLICIT HEADER
    setHeader (/* name, value*/) {
      // this.response.setHeader(name, value);
      return true;
    }

    setHeaders (/* obj*/) {
      // nodefony.extend(this.headers, obj);
      return true;
    }
  };
  return Response;
});
