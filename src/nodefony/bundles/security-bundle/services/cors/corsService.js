const readConfig = function readConfig(settings) {
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
          for (let name in settings[ele]) {
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
      for (let header in settings[ele]) {
        if (nodefony.typeOf(settings[ele][header]) === "array") {
          settings[ele][header] = settings[ele][header].toString();
        }
      }
      nodefony.extend(true, this.headers, settings[ele]);
      break;
    }
  }
};

const Cors = class Cors {
  constructor(settings) {
    this.allowMatch = null;
    this.headers = {};
    readConfig.call(this, settings);
  }
  match(context, redirect) {
    let origin;
    if (redirect) {
      origin = redirect + "://" + context.originUrl.host;
    } else {
      origin = context.originUrl.protocol + "//" + context.originUrl.host;
    }
    if (this.allowMatch) {
      let res = this.allowMatch.exec(origin);
      if (!res) {
        return 401;
      }
      context.response.setHeaders(nodefony.extend({
        "Access-Control-Allow-Origin": origin
      }, this.headers));
      if (context.request.method.toUpperCase() === "OPTIONS") {
        context.response.statusCode = 204;
        context.response.writeHead();
        context.response.flush();
        return 204;
      }
      return 200;
    } else {
      return 401;
    }
  }
};

module.exports = class cors extends nodefony.Service {
  constructor(container, httpKernel) {
    super("CORS", container);
    this.allowMatch = null;
    this.headers = {};
    this.httpKernel = httpKernel;
    this.kernel.listen(this, "onPreBoot", () => {
      this.settings = this.kernel.getBundle("security").settings.cors;
      readConfig.call(this, this.settings);
    });
  }

  createCors(settings) {
    if (!settings) {
      return new Cors(this.settings);
    }
    return new Cors(settings);
  }

  isCrossDomain(context) {
    // request origin
    let URL = context.originUrl;
    let hostnameOrigin = URL.hostname;
    let portOrigin = parseInt(URL.port, 10);

    // request server
    let requestProto = context.scheme;
    let requestPort = parseInt(context.port, 10);
    let protocolOrigin = null;

    if (context.session) {
      let redirect = context.session.getFlashBag("redirect");
      if (redirect) {
        return false;
      }
    }
    //console.log( "prototcol ::::" + URL.protocol )
    if (!portOrigin) {
      if (URL.protocol === "http:") {
        URL.port = 80;
        portOrigin = 80;
      }
      if (URL.protocol === "https:") {
        URL.port = 443;
        portOrigin = 443;
      }
    }
    //console.log( "portOrigin ::::" + portOrigin )
    if (context.proxy) {
      requestProto = context.proxy.proxyProto;
      requestPort = parseInt(context.proxy.proxyPort, 10);
    }

    //console.log( "requestProto : " + requestProto)
    switch (requestProto) {
    case "http":
    case "https":
      protocolOrigin = URL.protocol;
      break;
    case "ws":
    case "wss":
      if (URL.protocol === "http:" || URL.protocol === "ws:") {
        protocolOrigin = "ws:";
      }
      if (URL.protocol === "https:" || URL.protocol === "wss:") {
        protocolOrigin = "wss:";
      }
      break;
    }

    //console.log("check domain Request:" + this.httpKernel.regAlias.test(hostnameOrigin) + " Origin : " + hostnameOrigin)
    //check domain
    if (!this.httpKernel.regAlias.test(hostnameOrigin)) {
      return true;
    }

    //console.log("check protocol Request:" + requestProto + " Origin : " + protocolOrigin)
    // check protocol
    if (requestProto + ":" !== protocolOrigin) {
      return true;
    }

    //console.log("check port Request:" + requestPort + " Origin : " + portOrigin)
    // check port
    if (requestPort !== portOrigin) {
      return true;
    }
    return false;
  }
};