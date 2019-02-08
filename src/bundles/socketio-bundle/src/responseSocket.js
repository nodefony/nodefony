nodefony.register("socketResponse", function() {


  class Response {

    constructor(socket, container) {
      this.container = container;
      if (socket) {
        this.setConnection(socket);
      } else {
        this.statusMessage = "closed";
        this.config = null;
        this.webSocketVersion = null;
      }
      this.body = "";
      this.statusCode = 1000;
      //cookies
      this.cookies = {};
      this.encoding = this.setEncoding('utf8');
      // struct headers
      this.headers = {};
      this.type = "utf8";
    }

    setConnection(socket) {
      this.socket = socket;
      this.statusMessage = this.socket.state;
      this.config = this.socket.config;
      this.webSocketVersion = this.socket.webSocketVersion;
      return socket;
    }

    logger(pci, severity, msgid, msg) {
      let syslog = this.container.get("syslog");
      if (!msgid) {
        msgid = "SOCKET RESPONSE";
      }
      return syslog.logger(pci, severity, msgid, msg);
    }

    setBody(ele) {
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

    getLength(ele) {
      return Buffer.byteLength(ele);
    }

    send(data, type) {
      if (data) {
        return this.socket.emit(data);
      } else {
        if (this.body) {
          if (!type) {
            type = this.encoding;
          }
          return this.send(this.body);
        }
      }
      this.body = "";
    }

    clean() {
      delete this.socket;
      delete this.body;
    }

    close(description) {
      //console.log(arguments)
      if (this.socket.connected) {
        try {
          return this.socket.close(() => {

          });
        } catch (e) {
          throw e;
        }
      }
    }

    drop(reasonCode, description) {

    }

    addCookie(cookie) {
      if (cookie instanceof nodefony.cookies.cookie) {
        this.cookies[cookie.name] = cookie;
      } else {
        throw new Error("Response addCookies not valid cookies");
      }
    }

    setEncoding(encoding) {
      return this.encoding = encoding;
    }

    setStatusCode(status, message) {
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
        message = http.STATUS_CODES[this.statusCode];
      }
      this.statusMessage = message || null;
      return {
        code: this.statusCode,
        message: this.statusMessage
      };
    }

    getStatus() {
      return {
        code: this.getStatusCode(),
        message: this.getStatusMessage()
      };
    }
    getStatusCode() {
      return this.statusCode;
    }

    getStatusMessage() {
      return this.statusMessage;
    }

    setCookies() {
      for (var cook in this.cookies) {
        this.setCookie(this.cookies[cook]);
      }
    }

    setCookie(cookie) {
      this.logger("ADD COOKIE ==> " + cookie.serialize(), "DEBUG");
      this.setHeader('Set-Cookie', cookie.serialize());
    }

    //ADD INPLICIT HEADER
    setHeader( /*name, value*/ ) {
      //this.response.setHeader(name, value);
      return true;
    }

    setHeaders( /*obj*/ ) {
      //nodefony.extend(this.headers, obj);
      return true;
    }


  }

  return Response;

});