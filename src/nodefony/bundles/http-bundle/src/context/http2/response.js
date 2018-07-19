//const http = require("http");
//const semver = require('semver');

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

//const version9 = semver.gt(process.versions.node, "9.3.0");

module.exports = nodefony.register("http2Response", () => {

  const Response2 = class http2Response extends nodefony.Response {

    constructor(response, container) {
      super(response, container);
      this.stream = null;
      if (response) {
        this.stream = response.stream;
        this.streamId = this.stream.id;
      }
      if (this.stream && this.stream.pushAllowed) {
        this.context.pushAllowed = true;
      }
      //this.userAgent = this.context.getUserAgent();
      //this.isSafari = this.userAgent ? this.userAgent.includes('Safari') : false;
    }

    writeHead(statusCode, headers) {
      if (this.stream) {
        if (statusCode) {
          this.setStatusCode(statusCode);
        }
        if (!this.stream.headersSent) {
          try {
            if (this.context.method === "HEAD") {
              this.setHeader('Content-Length', this.getLength());
            }
            this.headers = nodefony.extend(this.getHeaders(), headers);
            this.headers[HTTP2_HEADER_STATUS] = this.statusCode;
            return this.stream.respond(
              this.headers, {
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

    send(data, encoding) {
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
          this.context.displayDebugBar();
          return this.stream.write(this.body, (encoding || this.encoding));
        } else {
          return super.send(data, encoding);
        }
      } catch (e) {
        throw e;
      }
    }

    write(data, encoding) {
      return this.send(data, encoding);
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
      //return this.statusMessage || http.STATUS_CODES[this.statusCode];
      return null;
    }

    getStatus() {
      return {
        code: this.getStatusCode(),
        message: null
      };
    }

    push(ele, headers, options) {
      return new Promise((resolve, reject) => {
        try {
          if (this.stream && this.stream.pushAllowed) {
            let file = new nodefony.fileClass(ele);
            let myheaders = nodefony.extend({
              'content-length': file.stats.size,
              'last-modified': file.stats.mtime.toUTCString(),
              'Content-Type': file.mimeType || "application/octet-stream"
            }, headers);
            return this.stream.pushStream({
              [HTTP2_HEADER_PATH]: myheaders.path
            }, {
              exclusive: true,
              parent: this.streamId
            }, (err, pushStream /*, headers*/ ) => {
              /*if (version9) {
                if (err) {
                  return reject(err);
                }
              } else {
                pushStream = err;
              }*/
              if (err) {
                return reject(err);
              }
              let myOptions = nodefony.extend({
                onError: (err) => {
                  this.logger(err, "ERROR");
                  if (err.code === 'ENOENT') {
                    pushStream.respond({
                      ':status': 404
                    });
                  } else {
                    pushStream.respond({
                      ':status': 500
                    });
                  }
                  //pushStream.end();
                  return reject(pushStream);
                }
              }, options);
              try {
                this.logger(">> Pushing : " + file.path, "DEBUG", "HTTP2 Pushing");
                pushStream.respondWithFile(file.path, myheaders, myOptions);
                return resolve(pushStream);
              } catch (e) {
                return reject(e);
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