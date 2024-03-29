const http = require("http");
const mime = require("mime");

const ansiRegex = function ({onlyFirst = false} = {}) {
  const pattern = [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
  ].join("|");
  return new RegExp(pattern, onlyFirst ? undefined : "g");
};

const stripAinsi = function (val) {
  return typeof val === "string" ? val.replace(ansiRegex(), "") : val;
};

// eslint-disable-next-line max-lines-per-function
module.exports = nodefony.register("Response", () => {
  const Response = class httpResponse {
    constructor (response, container) {
      // if (response instanceof http.ServerResponse || response instanceof http2.Http2ServerResponse) {
      this.response = response;
      // }
      this.context = container.get("context");
      this.container = container;
      // BODY
      this.body = "";
      this.encoding = this.setEncoding("utf8");
      // cookies
      this.cookies = {};
      // struct headers
      this.headers = {};
      this.statusCode = 200;
      this.statusMessage = null;
      this.ended = false;
      this.streamFile = null;
      // default http code
      // this.setStatusCode(200, null);
      // timeout default
      this.timeout = this.context.kernelHttp.responseTimeout[this.context.type];
      this.contentType = null;
    }

    clean () {
      this.response = null;
      delete this.response;
      this.cookies = null;
      delete this.cookies;
      this.headers = null;
      delete this.headers;
      this.body = null;
      delete this.body;
      // this.streamFile = null;
      // delete this.streamFile;
    }

    isHtml () {
      return mime.getExtension(this.getHeader("Content-Type")) === "html";
    }

    setTimeout (ms) {
      this.timeout = ms;
    }

    addCookie (cookie) {
      if (cookie instanceof nodefony.cookies.cookie) {
        return this.cookies[cookie.name] = cookie;
      }
      throw new Error("Response addCookies not valid cookies");
    }

    deleteCookie (cookie) {
      if (cookie instanceof nodefony.cookies.cookie) {
        if (this.cookies[cookie.name]) {
          delete this.cookies[cookie.name];
          return true;
        }
        return false;
      }
      throw new Error("Response delCookie not valid cookies");
    }

    deleteCookieByName (name) {
      if (this.cookies[name]) {
        delete this.cookies[name];
        return true;
      }
      return false;
    }

    setCookies () {
      for (const cook in this.cookies) {
        this.setCookie(this.cookies[cook]);
      }
    }

    setCookie (cookie) {
      const serialize = cookie.serialize();
      this.log(`ADD COOKIE ==> ${serialize}`, "DEBUG");
      return this.setHeader("Set-Cookie", serialize);
    }

    log (pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = `${this.context.type} RESPONSE `;
      }
      return this.context.log(pci, severity, msgid, msg);
    }

    // ADD INPLICIT HEADER
    setHeader (name, value) {
      if (this.response) {
        if (this.flushing) {
          const obj = {};
          obj[name] = value;
          return this.addTrailers(obj);
        }
        if (!this.response.headersSent) {
          return this.response.setHeader(name, value);
        }
      }
    }

    setHeaders (obj) {
      if (!this.response.headersSent) {
        if (obj instanceof Object) {
          for (const head in obj) {
            this.setHeader(head, obj[head]);
          }
        }
        return this.headers = this.response.getHeaders();
      }
      this.log("headers already sended ", "WARNING");
      return this.headers = this.response.getHeaders();
    }

    getHeader (name) {
      return this.response.getHeader(name);
    }

    getHeaders () {
      return this.response.getHeaders();
    }

    setContentType (type, encoding) {
      let myType = this.getMimeType(type);
      if (!myType) {
        this.log(`Content-Type not valid !!! : ${type}`, "WARNING");
        myType = "application/octet-stream";
      }
      this.contentType = myType;
      return this.setHeader("Content-Type", `${myType} ; charset=${encoding || this.encoding}`);
    }

    getMimeType (name) {
      return mime.getType(name);
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
      this.statusCode = status || this.statusCode;
      if (message) {
        this.statusMessage = stripAinsi(message);
      } else if (!this.statusMessage) {
        if (http.STATUS_CODES[this.statusCode]) {
          this.statusMessage = http.STATUS_CODES[this.statusCode];
        } else {
          this.statusMessage = http.STATUS_CODES[500];
        }
      }
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

    getStatusMessage (code) {
      if (code) {
        return http.STATUS_CODES[code] || this.statusMessage || this.response.statusMessage;
      }
      if (this.response) {
        return this.statusMessage || this.response.statusMessage || http.STATUS_CODES[this.statusCode];
      }
      return this.statusMessage || http.STATUS_CODES[this.statusCode];
    }

    setBody (ele, encoding = null) {
      // console.trace("setBody : ", ele.length)
      return this.body = Buffer.from(ele, encoding || this.encoding);
    }

    getLength (ele) {
      return Buffer.byteLength(ele || this.body);
    }

    writeHead (statusCode, headers) {
      if (statusCode) {
        this.setStatusCode(statusCode);
      }
      if (!this.response.headersSent) {
        // this.response.statusMessage = this.statusMessage;
        try {
          if (this.context.method === "HEAD" || this.context.contentLength) {
            this.setHeader("Content-Length", this.getLength());
          }
          if (this.statusCode) {
            if (parseInt(this.statusCode, 10) > 599) {
              this.statusCode = 500;
            }
          }
          return this.response.writeHead(
            this.statusCode,
            this.statusMessage,
            headers
          );
        } catch (e) {
          throw e;
        }
      } else {
        this.log("Headers already sent !!", "WARNING");
      }
    }

    flushHeaders () {
      try {
        return this.response.flushHeaders();
      } catch (e) {
        throw e;
      }
    }

    addTrailers (headers) {
      try {
        return this.response.addTrailers(headers);
      } catch (e) {
        throw e;
      }
    }

    flush (data, encoding) {
      this.flushing = true;
      this.setHeader("Transfer-Encoding", "chunked");
      return this.send(data, encoding, true);
    }

    send (data, encoding, flush = false) {
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
        return this.response.write(this.body, encoding || this.encoding);
      } catch (e) {
        throw e;
      }
    }

    write (data, encoding) {
      return this.send(data, encoding);
    }

    writeContinue () {
      return this.response.writeContinue();
    }

    end (data, encoding) {
      if (this.response) {
        this.ended = true;
        return Promise.resolve(this.response.end(data, encoding || this.encoding));
      }
      return Promise.resolve(null);
    }

    redirect (url, status, headers) {
      this.context.isRedirect = true;
      status = parseInt(status, 10);
      if (status === 302) {
        this.setStatusCode(status);
      } else {
        status = 301;
        this.setStatusCode(301);
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
      this.log(`REDIRECT ${status} : ${url} `, "DEBUG");
      return this;
    }
  };
  return Response;
});
