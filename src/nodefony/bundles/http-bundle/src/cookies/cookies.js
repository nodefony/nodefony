const cookieLib = require('cookie');
const MS = require('ms');

nodefony.register("cookies", function() {

  const encode = encodeURIComponent;
  const decode = decodeURIComponent;

  const cookieDefaultSettings = {
    maxAge: 0, //24*60*60,
    path: "/",
    domain: null,
    secure: false,
    httpOnly: true,
    signed: false,
    secret: "!nodefony.secret!"
  };

  const parse = function(strToParse) {
    return cookieLib.parse(strToParse);
  };

  const cookiesParser = function(context) {
    let cookies = null;
    let co = null;
    switch (context.type) {
      case "HTTP":
      case "HTTPS":
      case "HTTP2":
        if (context.request.request && context.request.request.headers.cookie) {
          cookies = context.request.request.headers.cookie;
        }
        if (cookies) {
          let obj = parse(cookies);
          for (let cookie in obj) {
            co = new Cookie(cookie, obj[cookie]);
            context.addCookie(co);
          }
          context.request.request.cookies = context.cookies;
        }
        break;
      case "WEBSOCKET":
      case "WEBSOCKET SECURE":
        if (context.request.cookies) {
          cookies = context.request.cookies;
        }
        if (cookies) {
          for (let i = 0; i < cookies.length; i++) {
            co = new Cookie(cookies[i].name, cookies[i].value);
            context.addCookie(co);
          }
        }
        break;
    }
  };

  const Cookie = class Cookie {
    constructor(name, value, settings) {
      if (typeof name === "object") {
        this.settings = name.settings;
        this.name = name.name;
        this.signed = name.signed;
        this.value = name.value;
        this.originalMaxAge = name.originalMaxAge;
        this.expires = name.expires;
        this.path = name.path;
        this.domain = name.domain;
        this.httpOnly = name.httpOnly;
        this.secure = name.secure;
        this.maxAge = name.maxAge;
      } else {
        this.settings = nodefony.extend({}, cookieDefaultSettings, settings);
        if (!name) {
          throw new Error("cookie must have name");
        }
        this.name = name;
        this.signed = this.settings.signed;
        this.value = this.setValue(value);
        this.originalMaxAge = this.setOriginalMaxAge(this.settings.maxAge);
        this.expires = this.setExpires(this.settings.expires);
        this.path = this.setPath(this.settings.path);
        this.domain = this.setDomain();
        this.httpOnly = this.setHttpOnly(this.settings.httpOnly);
        this.secure = this.setSecure(this.settings.secure);
      }
    }

    clearCookie() {
      this.setExpires(1);
      this.path = "/";
    }

    setValue(value) {
      if (value) {
        value = decode(value);
      }
      if (this.signed) {
        this.value = this.sign(value, this.settings.secret);
      } else {
        this.value = value;
      }
      return this.value;
    }

    setSecure(val) {
      return val;
    }

    setDomain() {
      return this.settings.domain;
    }

    setHttpOnly(val) {
      return val;
    }

    setPath(val) {
      return val;
    }

    setExpires(date) {
      if (date) {
        try {
          if (date instanceof Date) {
            this.expires = date;
          } else {
            this.expires = new Date(date);
          }
        } catch (e) {
          this.expires = null;
        }
      } else {
        let maxage = this.getMaxAge();
        if (maxage === 0) {
          this.expires = null;
        } else {
          let res = new Date().getTime() + (maxage * 1000);
          this.expires = new Date(res);
        }
        return this.expires;
      }
      this.getMaxAge();
      return this.expires;
    }

    setOriginalMaxAge(ms) {
      let res = null;
      switch (typeof ms) {
        case "number":
          return ms;
        case "string":
          try {
            res = MS(ms) / 1000;
          } catch (e) {
            res = ms;
          }
          return parseInt(res, 10);
        default:
          throw new Error("cookie class error maxage bad type " + typeof ms);
      }
    }

    getMaxAge() {
      if (this.expires && this.expires instanceof Date) {
        let ms = (this.expires.getTime() - new Date().getTime());
        let s = (ms / 1000);
        if (s > 0) {
          this.maxAge = s; // en seconde
        } else {
          throw new Error("Espires / Max-Age : " + s + " Error Espires");
        }
      } else {
        this.maxAge = this.originalMaxAge;
      }
      return this.maxAge;
    }

    toString() {
      return this.name + "=" + encode(this.value);
    }

    sign(val, secret) {
      if ('string' !== typeof val) {
        throw new TypeError('cookie required');
      }
      if ('string' !== typeof secret) {
        throw new TypeError('secret required');
      }
      return val + '.' + crypto
        .createHmac('sha256', secret)
        .update(val)
        .digest('base64')
        .replace(/\=+$/, '');
    }

    unsign(val, secret) {
      if (val && 'string' !== typeof val) {
        throw new Error('unsign cookie value bad type !! ');
      }
      if (secret && 'string' !== typeof secret) {
        throw new Error('unsign cookie secret bad type');
      }
      if (!val) {
        val = this.value;
      }
      if (!secret) {
        secret = this.settings.secret;
      }
      let str = val.slice(0, val.lastIndexOf('.'));
      return this.sign(str, secret) === val ? str : false;
    }

    serialize() {
      let tab = [];
      tab.push(this.toString());
      if (this.maxAge) {
        tab.push('Max-Age=' + this.maxAge);
      }
      if (this.domain) {
        tab.push('Domain=' + this.domain);
      }
      if (this.path) {
        tab.push('Path=' + this.path);
      }
      if (this.expires) {
        tab.push('Expires=' + this.expires.toUTCString());
      }
      if (this.httpOnly) {
        tab.push('HttpOnly');
      }
      if (this.secure) {
        tab.push('Secure');
      }
      return tab.join('; ');
    }
  };

  return {
    cookie: Cookie,
    cookiesParser: cookiesParser,
    parser: parse
  };
});