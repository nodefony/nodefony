module.exports = nodefony.register("http2Request", () => {
  const Request = class http2Request extends nodefony.Request {
    constructor (request, context) {
      super(request, context);
    }

    getHost () {
      return this.headers[":authority"];
    }

    getUserAgent () {
      return this.headers["user-agent"];
    }

    getMethod () {
      return this.headers[":method"];
    }

    getFullUrl () {
      // proxy mode
      const myurl = `://${this.host}${this.headers[":path"]}`;
      if (this.headers && this.headers["x-forwarded-for"]) {
        return `${this.headers["x-forwarded-proto"]}${myurl}`;
      }
      if (this.headers[":scheme"] === "https") {
        return `https${myurl}`;
      }
      return `http${myurl}`;
    }
  };
  return Request;
});
