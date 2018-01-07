const http = require("http");
let http2 = null;
let HTTP2_HEADER_PATH = null;
let HTTP2_HEADER_LINK = null;
let HTTP2_HEADER_STATUS = null;
let HTTP2_HEADER_CONTENT_TYPE = null;
try {
  http2 = require("http2");
  HTTP2_HEADER_PATH = http2.constants.HTTP2_HEADER_PATH;
  HTTP2_HEADER_LINK = http2.constants.HTTP2_HEADER_LINK;
  HTTP2_HEADER_STATUS = http2.constants.HTTP2_HEADER_STATUS;
  HTTP2_HEADER_CONTENT_TYPE = http2.constants.HTTP2_HEADER_CONTENT_TYPE;
} catch (e) {}

module.exports = nodefony.register("Response2", () => {

  const Response2 = class Response2 extends nodefony.Response {

    constructor(response, container) {
      super(response, container);
      this.stream = null;
      if (response) {
        this.stream = response.stream;
        this.streamId = this.stream.id;
      }
      //this.userAgent = this.context.getUserAgent();
      //this.isSafari = this.userAgent ? this.userAgent.includes('Safari') : false;
    }

    setHeader(name, value) {
      if (this.stream) {
        if (name) {
          let obj = {};
          obj[name] = value;
          //this.stream.additionalHeaders(obj);
          nodefony.extend(this.headers, obj);
          return obj;
        }
      } else {
        return super.setHeader(name, value);
      }
    }

    writeHead(statusCode, headers) {
      if (this.stream) {
        if (statusCode) {
          this.setStatusCode(statusCode);
        }
        if (!this.stream.headersSent) {
          try {
            if (this.context.method === "HEAD") {
              this.setHeader('content-length', this.getLength());
            }
            this.headers[HTTP2_HEADER_STATUS] = this.statusCode;
            //console.log(headers || this.headers)
            return this.stream.respond(
              headers || this.headers, {
                endStream: false,
              }
            );
          } catch (e) {
            throw e;
          }
        } else {
          throw new Error("Headers already sent !!");
        }
      } else {
        return super.writeHead(statusCode, headers);
      }
    }

    write(data, encoding) {
      if (this.stream) {
        try {
          if (data) {
            return this.stream.write(this.setBody(data), (encoding || this.encoding));
          }
          return this.stream.write(this.body, (encoding || this.encoding));
        } catch (e) {
          throw e;
        }
      } else {
        return super.write(data, encoding);
      }
    }

    end(data, encoding) {
      if (this.stream) {
        this.ended = true;
        return this.stream.end(data, encoding);
      } else {
        return super.end(data, encoding);
      }
    }

    getStatusMessage() {
      return this.statusMessage || http.STATUS_CODES[this.statusCode];
    }

    push(ele, headers, options) {
      return new Promise((resolve, reject) => {
        try {
          if (this.stream && this.stream.pushAllowed) {
            let file = new nodefony.fileClass(ele);
            let myheaders = nodefony.extend({
              'content-length': file.stats.size,
              'last-modified': file.stats.mtime.toUTCString(),
              'Content-Type': file.mimeType
            }, headers);
            let myOptions = nodefony.extend({
              onError: (err) => {
                this.logger(err, "ERROR");
              }
              /*,
              statCheck: (stat, headers) => {
              this.logger(stat, "INFO");
              this.logger(headers, "INFO");
              }*/
            }, options);
            return this.stream.pushStream({
              [HTTP2_HEADER_PATH]: myheaders.path
            }, {
              exclusive: true,
              parent: this.streamId
            }, (pushStream) => {
              try {
                this.logger(">>Pushing : " + file.path, "DEBUG", "HTTP2 Pushing");
                pushStream.respondWithFile(file.path, myheaders, myOptions);
                resolve(pushStream);
              } catch (e) {
                reject(e);
              }
            });
          } else {
            let warn = new Error("HTTP/2 client has disabled push streams !! ");
            this.logger(warn.message, "DEBUG");
            return reject(warn);
          }
        } catch (e) {
          return reject(e);
        }
      });
    }
  };


  return Response2;
});