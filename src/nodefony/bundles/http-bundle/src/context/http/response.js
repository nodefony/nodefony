const http = require("http");
const mime = require('mime');
module.exports = nodefony.register("Response", function () {

  const Response = class httpResponse {

    constructor(response, container) {
      //if (response instanceof http.ServerResponse || response instanceof http2.Http2ServerResponse) {
      this.response = response;
      //}
      this.context = container.get('context');
      this.container = container;
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

    isHtml() {
      return (mime.getExtension(this.getHeader("Content-Type")) === "html");
    }

    setTimeout(ms) {
      this.timeout = ms;
    }

    addCookie(cookie) {
      if (cookie instanceof nodefony.cookies.cookie) {
        return this.cookies[cookie.name] = cookie;
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
      let serialize = cookie.serialize();
      this.logger("ADD COOKIE ==> " + serialize, "DEBUG");
      return this.setHeader('Set-Cookie', serialize);
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
        if (this.flushing) {
          let obj = {};
          obj[name] = value;
          return this.addTrailers(obj);
        }
        return this.response.setHeader(name, value);
      }
    }

    setHeaders(obj) {
      if (obj instanceof Object) {
        for (let head in obj) {
          this.setHeader(head, obj[head]);
        }
      }
      return this.headers = this.response.getHeaders();
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
        this.logger("Content-Type not valid !!! : " + type, "WARNING");
        myType = "application/octet-stream";
      }
      this.contentType = myType;
      return this.setHeader("Content-Type", myType + " ; charset=" + (encoding || this.encoding));
    }

    getMimeType(name) {
      return mime.getType(name);
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

    getStatusMessage(code) {
      if (code) {
        return http.STATUS_CODES[code] || this.statusMessage || this.response.statusMessage;
      }
      if (this.response) {
        return this.statusMessage || this.response.statusMessage || http.STATUS_CODES[this.statusCode];
      } else {
        return this.statusMessage || http.STATUS_CODES[this.statusCode];
      }
    }

    setBody(ele, encoding = null) {
      //console.trace("setBody : ", ele.length)
      return this.body = Buffer.from(ele, encoding || this.encoding);
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
          if (this.context.method === "HEAD" || this.context.contentLength) {
            this.setHeader('Content-Length', this.getLength());
          }
          //this.headers = nodefony.extend(this.headers, this.getHeaders(), headers);
          return this.response.writeHead(
            this.statusCode,
            this.statusMessage,
            headers
          );
        } catch (e) {
          throw e;
        }
      } else {
        this.logger("Headers already sent !!", "WARNING");
      }
    }

    flushHeaders() {
      try {
        return this.response.flushHeaders();
      } catch (e) {
        throw e;
      }
    }

    addTrailers(headers) {
      try {
        return this.response.addTrailers(headers);
      } catch (e) {
        throw e;
      }
    }

    flush(data, encoding) {
      this.flushing = true;
      this.setHeader("Transfer-Encoding", 'chunked');
      return this.send(data, encoding, true);
    }

    send(data, encoding, flush = false) {
      try {
        if (this.context.isRedirect) {
          if (!this.stream.headersSent) {
            this.writeHead();
            return this.end();
          }
          return this.end();
        }
        if (data) {
          this.setBody(data);
        }
        if (!flush) {
          this.context.displayDebugBar();
        }
        return this.response.write(this.body, (encoding || this.encoding));
      } catch (e) {
        throw e;
      }
    }

    write(data, encoding) {
      return this.send(data, encoding);
    }

    writeContinue() {
      return this.response.writeContinue();
    }

    end(data, encoding) {
      if (this.response) {
        this.ended = true;
        return Promise.resolve(this.response.end(data, (encoding || this.encoding)));
      }
      return Promise.resolve(null);
    }

    redirect(url, status, headers) {
      this.context.isRedirect = true;
      status = parseInt(status, 10);
      if (status === 301) {
        this.setStatusCode(status);
      } else {
        status = 302;
        this.setStatusCode(302);
      }
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
      this.setHeader("Location", url);
      this.logger(`REDIRECT ${status} : ${url} `, "DEBUG");
      return this;
    }
  };
  return Response;
});
