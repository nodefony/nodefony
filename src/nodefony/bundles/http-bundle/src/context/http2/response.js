// const http = require("http");
// const semver = require('semver');

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

// const version9 = semver.gt(process.versions.node, "9.3.0");

module.exports = nodefony.register("http2Response", () => {
  const Response2 = class http2Response extends nodefony.Response {
    constructor (response, container) {
      super(response, container);
      this.stream = null;
      if (response) {
        this.stream = response.stream;
        this.streamId = this.stream.id;
      }
      if (this.stream && this.stream.pushAllowed) {
        this.context.pushAllowed = true;
      }
      // this.userAgent = this.context.getUserAgent();
      // this.isSafari = this.userAgent ? this.userAgent.includes('Safari') : false;
    }

    writeHead (statusCode, headers) {
      if (this.stream) {
        if (statusCode) {
          this.setStatusCode(statusCode);
        }
        if (!this.stream.headersSent) {
          try {
            if (this.context.method === "HEAD" || this.context.contentLength) {
              this.setHeader("Content-Length", this.getLength());
            }
            this.headers = nodefony.extend(this.getHeaders(), headers);
            if (this.statusCode) {
              if (parseInt(this.statusCode, 10) > 599) {
                this.statusCode = 500;
              }
            }
            this.headers[HTTP2_HEADER_STATUS] = this.statusCode;
            return this.stream.respond(this.headers, {
              endStream: false
            });
          } catch (e) {
            throw e;
          }
        } else {
          // throw new Error("Headers already sent !!");
          this.log("Headers already sent !!", "WARNING");
        }
      } else {
        return super.writeHead(statusCode, headers);
      }
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
        if (this.stream) {
          if (data) {
            this.setBody(data);
          }
          if (!flush) {
            this.context.displayDebugBar();
          }
          return this.stream.write(this.body, encoding || this.encoding);
        }
        return super.send(data, encoding);
      } catch (e) {
        throw e;
      }
    }

    end (data, encoding) {
      if (this.stream) {
        this.ended = true;
        return Promise.resolve(this.stream.end(data, encoding || this.encoding));
      }
      return super.end(data, encoding);
    }

    getStatusMessage () {
      // return this.statusMessage || http.STATUS_CODES[this.statusCode];
      return null;
    }

    getStatus () {
      return {
        code: this.getStatusCode(),
        message: null
      };
    }

    push (ele, headers, options) {
      return new Promise((resolve, reject) => {
        try {
          if (this.stream && this.stream.pushAllowed) {
            const file = new nodefony.fileClass(ele);
            const myheaders = nodefony.extend({
              "content-length": file.stats.size,
              "last-modified": file.stats.mtime.toUTCString(),
              "Content-Type": file.mimeType || "application/octet-stream"
            }, headers);
            return this.stream.pushStream({
              [HTTP2_HEADER_PATH]: myheaders.path
            }, {
              exclusive: true,
              parent: this.streamId
            }, (err, pushStream /* , headers*/) => {
              if (err) {
                return reject(err);
              }
              pushStream.on("error", (err) => {
                this.log(err, "ERROR", "HTTP2 push stream");
                switch (err.code) {
                case "ENOENT":
                  pushStream.respond({
                    ":status": 404
                  });
                  break;
                case "ERR_HTTP2_STREAM_ERROR":
                  return;
                default:
                  pushStream.respond({
                    ":status": 500
                  });
                }
                return reject(err);
              });
              pushStream.on("close", () => {
                this.log("Push Stream Closed", "DEBUG", "HTTP2 push stream");
              });
              const myOptions = nodefony.extend({
                onError: (err) => {
                  this.log(err, "ERROR", "HTTP2 push stream");
                  if (err.code === "ENOENT") {
                    pushStream.respond({
                      ":status": 404
                    });
                  } else {
                    pushStream.respond({
                      ":status": 500
                    });
                  }
                  // pushStream.end();
                  return reject(err);
                }
              }, options);
              try {
                this.log(`>> Pushing : ${file.path}`, "DEBUG", "HTTP2 Pushing");
                pushStream.respondWithFile(file.path, myheaders, myOptions);
                return resolve(pushStream);
              } catch (e) {
                return reject(e);
              }
            });
          }
          const warn = new Error("HTTP/2 client has disabled push streams !! ");
          this.log(warn.message, "DEBUG");
          return reject(warn);
        } catch (e) {
          return reject(e);
        }
      });
    }
  };
  return Response2;
});
