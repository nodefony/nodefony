let http2 = null;
let HTTP2_HEADER_PATH = null;
try {
  http2 = require("http2");
  HTTP2_HEADER_PATH = http2.constants.HTTP2_HEADER_PATH;
} catch (e) {}

module.exports = nodefony.register("Response2", () => {

  const Response2 = class Response2 extends nodefony.Response {

    constructor(response, container) {
      super(response, container);
      this.stream = null;
      if (response && response.stream.pushAllowed) {
        this.stream = response.stream;
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
        try {
          if (data) {
            return this.response.write(this.setBody(data), (encoding || this.encoding));
          }
          return this.response.write(this.body, (encoding || this.encoding));
        } catch (e) {
          throw e;
        }
      }
    }

    end(data, encoding) {
      if (this.response) {
        this.ended = true;
        if (this.stream) {
          return this.stream.end(data, encoding);
        } else {
          return this.response.end(data, encoding);
        }
      }
      return null;
    }

    push(ele, headers, options) {
      if (this.stream) {
        return new Promise((resolve, reject) => {
          try {
            let file = new nodefony.fileClass(ele);
            let myheaders = nodefony.extend({
              'content-length': file.stats.size,
              'last-modified': file.stats.mtime.toUTCString(),
              'content-type': file.mimeType
            }, headers);
            let myOptions = nodefony.extend({
              onError: (err) => {
                console.log(err);
              }
            }, options);
            return this.stream.pushStream({
              [HTTP2_HEADER_PATH]: file.path
            }, (pushStream) => {
              try {
                this.logger(">>Pushing : " + file.path, "INFO", "HTTP2 Pushing");
                pushStream.respondWithFile(file.path, myheaders, myOptions);
                resolve(pushStream);
              } catch (e) {
                reject(e);
              }
            });
            /*return this.response.createPushResponse(myheaders, (error, Http2ServerResponse) => {
              console.log(file.content())
              Http2ServerResponse.write(file.content(), file.encoding);
              //pushStream.respondWithFile(file.path, myheaders, myOptions);
              return resolve(file);
            });*/
          } catch (e) {
            return reject(e);
          }
        });
      } else {
        throw new Error("HTTP2 response stream not allowed !! ");
      }
    }
  };


  return Response2;
});