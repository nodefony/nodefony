const http = require("http");
const mime = require('mime');
module.exports = nodefony.register("Response", function () {

  const Response = class Response {

    constructor(response, container) {
      //if (response instanceof http.ServerResponse || response instanceof http2.Http2ServerResponse) {
      this.response = response;
      //}
      this.context = container.get('context');
      this.container = container;
      this.container.get("notificationsCenter").listen(this, "onView", this.setBody);
      //BODY
      this.body = "";
      this.encoding = this.setEncoding('utf8');
      //cookies
      this.cookies = {};
      // struct headers
      this.headers = {};
      this.statusCode = 200;
      this.statusMessage = null;
      this.ended = false;
      this.streamFile = null;
      // default http code
      //this.setStatusCode(200, null);
      //timeout default
      this.timeout = this.context.kernelHttp.responseTimeout[this.context.type];
      this.contentType = null;
    }

    clean() {
      this.response = null;
      delete this.response;
      this.cookies = null;
      delete this.cookies;
      this.headers = null;
      delete this.headers;
      this.body = null;
      delete this.body;
      //this.streamFile = null;
      //delete this.streamFile;
    }

    setTimeout(ms) {
      this.timeout = ms;
    }



    addCookie(cookie) {
      if (cookie instanceof nodefony.cookies.cookie) {
        this.cookies[cookie.name] = cookie;
      } else {
        throw new Error("Response addCookies not valid cookies");
      }
    }

    setCookies() {
      for (let cook in this.cookies) {
        this.setCookie(this.cookies[cook]);
      }
    }

    setCookie(cookie) {
      //this.response.on('header', function(){
      this.logger("ADD COOKIE ==> " + cookie.serialize(), "DEBUG");
      return this.setHeader('Set-Cookie', cookie.serialize());
      //}.bind(this))
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = this.context.type + " RESPONSE ";
      }
      return this.context.logger(pci, severity, msgid, msg);
    }

    //ADD INPLICIT HEADER
    setHeader(name, value) {
      if (this.response) {
        return this.response.setHeader(name, value);
      }
    }

    setHeaders(obj) {
      if (obj) {
        return nodefony.extend(this.headers, obj);
      }
      return this.headers;
    }

    getHeader(name) {
      return this.response.getHeader(name);
    }

    getHeaders() {
      return this.response.getHeaders();
    }

    setContentType(type, encoding) {
      let myType = this.getMimeType(type);
      if (!myType) {
        this.logger("Content-Type not valid !!! " + type, "WARNING");
        myType = "application/octet-stream";
      }
      this.contentType = myType;
      return this.setHeader("Content-Type", myType + " ; charset=" + (encoding ||  this.encoding));
    }

    getMimeType(name) {
      return mime.getType(name);
    }

    addTrailers(obj) {
      return this.response.addTrailers(obj);
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
      this.statusCode = status || this.statusCode;
      if (message) {
        this.statusMessage = message;
      } else {
        if (!this.statusMessage) {
          if (http.STATUS_CODES[this.statusCode]) {
            this.statusMessage = http.STATUS_CODES[this.statusCode];
          } else {
            this.statusMessage = http.STATUS_CODES[500];
          }
        }
      }
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
      if (this.response) {
        return this.statusMessage || this.response.statusMessage || http.STATUS_CODES[this.statusCode];
      } else {
        return this.statusMessage || http.STATUS_CODES[this.statusCode];
      }
    }

    setBody(ele) {
      return this.body = Buffer.from(ele, this.encoding);
    }

    getLength(ele) {
      return Buffer.byteLength(ele || this.body);
    }

    writeHead(statusCode, headers) {
      if (statusCode) {
        this.setStatusCode(statusCode);
      }
      if (!this.response.headersSent) {
        //this.response.statusMessage = this.statusMessage;
        try {
          if (this.context.method === "HEAD") {
            this.setHeader('Content-Length', this.getLength());
          }
          return this.response.writeHead(
            this.statusCode,
            this.statusMessage,
            headers || this.headers
          );
        } catch (e) {
          throw e;
        }
      } else {
        throw new Error("Headers already sent !!");
      }
    }

    flushHeaders() {
      try {
        return this.response.flushHeaders();
      } catch (e) {
        throw e;
      }
    }

    flush(data, encoding) {
      if (!this.response.headersSent) {
        this.setHeader('Transfer-Encoding', 'chunked');
        this.headers['Transfer-Encoding'] = 'chunked';
        this.flushHeaders();
      }
      return this.write(data, encoding);
    }

    write(data, encoding) {
      try {
        if (data) {
          return this.response.write(this.setBody(data), (encoding || this.encoding));
        }
        return this.response.write(this.body, (encoding || this.encoding));
      } catch (e) {
        throw e;
      }
    }

    writeContinue() {
      return this.response.writeContinue();
    }

    end(data, encoding) {
      if (this.response) {
        this.ended = true;
        return this.response.end(data, encoding);
      }
      return null;
    }

    redirect(url, status, headers) {
      if (headers) {
        switch (nodefony.typeOf(headers)) {
        case "object":
          this.setHeaders(headers);
          break;
        case "boolean":
          this.setHeaders({
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Expires": "Thu, 01 Jan 1970 00:00:00 GMT"
          });
          break;
        }
      }
      status = parseInt(status, 10);
      if (status === 301) {
        this.setStatusCode(status);
      } else {
        this.setStatusCode(302);
      }
      this.setHeader("Location", url);
      return this;
    }
  };
  return Response;
});