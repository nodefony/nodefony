module.exports = nodefony.register("Request2", function () {

  const Request = class Request2 extends nodefony.Request {

    constructor(request, context) {
      super(request, context);
    }

    getHost() {
      return this.headers[":authority"];
    }

    getUserAgent() {
      return this.headers['user-agent'];
    }

    getMethod() {
      return this.headers[":method"];
    }

    getFullUrl() {
      // proxy mode
      if (this.headers && this.headers['x-forwarded-for']) {
        return this.headers['x-forwarded-proto'] + "://" + this.host + this.headers[":path"];
      }
      if (this.headers[":scheme"] === "https") {
        return 'https://' + this.host + this.headers[":path"];
      } else {
        return 'http://' + this.host + this.headers[":path"];
      }
    }
  };
  return Request;
});