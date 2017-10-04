nodefony.register.call(nodefony.io, "cors", function () {

  /*
   *	 http://www.w3.org/TR/cors/
   */

  const headersCorsDefaults = {
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "ETag, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date",
    "Access-Control-Expose-Headers": "WWW-Authenticate, X-Json, X-Requested-With",
    "Access-Control-Max-Age": 10,
    "Access-Control-Allow-Credentials": true
  };

  var cors = class cors {

    constructor(settings) {
      this.allowMatch = null;
      this.header = {};
      for (let ele in settings) {
        let str = null;
        switch (ele) {
        case "Allow-Origin":
        case "allow-origin":
          if (settings[ele] === "*") {
            this.allowMatch = new RegExp(".*");
          } else {
            switch (nodefony.typeOf(settings[ele])) {
            case "object":
              str = "";
              let i = 0;
              for (var name in settings[ele]) {
                if (i === 0) {
                  str = settings[ele][name];
                } else {
                  str += "|" + settings[ele][name];
                }
                i++;
              }
              if (str) {
                this.allowMatch = new RegExp(str);
              }
              break;
            case "array":
              str = "";
              for (let i = 0; i < settings[ele].length; i++) {
                if (i === 0) {
                  str = settings[ele][i];
                } else {
                  str += "|" + settings[ele][i];
                }
              }
              if (str) {
                this.allowMatch = new RegExp(str);
              }
              break;
            case "string":
              this.allowMatch = new RegExp(settings[ele]);
              break;
            }
          }
          break;
        case "Access-Control":
        case "access-control":
          nodefony.extend(this.header, headersCorsDefaults, settings[ele]);
          break;
        }
      }
    }

    match(request, response) {
      var URL = url.parse(request.headers.referer || request.headers.origin ||  request.url.href);
      var origin = URL.protocol + "//" + URL.host;
      if (this.allowMatch) {
        var res = this.allowMatch.exec(origin);
        if (!res) {
          return 401;
        }
      } else {
        return 401;
      }
      this.header["Access-Control-Allow-Origin"] = origin;
      response.setHeaders(this.header);
      if (request.method.toUpperCase() === "OPTIONS") {
        response.statusCode = 204;
        response.writeHead();
        response.flush();
        return 204;
      }
      return 200;
    }
  };

  return cors;

});
