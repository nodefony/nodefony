const cookieLib = require("cookie");
const MS = require("ms");

// eslint-disable-next-line max-lines-per-function
nodefony.register("cookies", () => {
  const encode = encodeURIComponent;
  const decode = decodeURIComponent;

  const cookieDefaultSettings = {
    maxAge: 0, // 24*60*60,
    path: "/",
    domain: null,
    secure: false,
    sameSite: null, // "Lax" || "Strict"
    httpOnly: true,
    signed: false,
    secret: "!nodefony.secret!"
  };

  const parse = function parse (strToParse) {
    return cookieLib.parse(strToParse);
  };


  const getRequestcookies = function getRequestcookies (context) {
    let cookies = null;
    switch (context.type) {
    case "HTTP":
    case "HTTPS":
    case "HTTP2":
      if (context.request.request && context.request.request.headers.cookie) {
        cookies = context.request.request.headers.cookie;
      }
      break;
    case "WEBSOCKET":
    case "WEBSOCKET SECURE":
      if (context.request.cookies) {
        // eslint-disable-next-line prefer-destructuring
        cookies = context.request.cookies;
      }
      break;
    default:
      throw new Error("getRequestcookies Bad Type");
    }
    return parse(cookies);
  };

  const cookiesParser = function cookiesParser (context) {
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
        const obj = parse(cookies);
        for (const cookie in obj) {
          co = new Cookie(cookie, obj[cookie]);
          context.addCookie(co);
        }
        context.request.request.cookies = context.cookies;
      }
      break;
    case "WEBSOCKET":
    case "WEBSOCKET SECURE":
      if (context.request.cookies) {
        // eslint-disable-next-line prefer-destructuring
        cookies = context.request.cookies;
      }
      if (cookies) {
        for (let i = 0; i < cookies.length; i++) {
          co = new Cookie(cookies[i].name, cookies[i].value);
          context.addCookie(co);
        }
      }
      break;
    default:
      throw new Error("cookiesParser Bad Type");
    }
  };

  const Cookie = class Cookie {
    constructor (name, value, settings) {
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
        this.sameSite = name.sameSite;
        this.priority = name.priority;
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
        this.sameSite = this.setSameSite(this.settings.sameSite);
        this.priority = this.setPriority(this.settings.priority);
      }
    }

    clearCookie () {
      this.setExpires(1);
      this.path = "/";
    }

    setValue (value) {
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

    setSecure (val) {
      return val;
    }

    setDomain () {
      return this.settings.domain;
    }

    setHttpOnly (val) {
      return val;
    }

    setPath (val) {
      return val;
    }

    setSameSite (val) {
      return val;
    }

    setExpires (date) {
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
        const maxage = this.getMaxAge();
        if (maxage === 0) {
          this.expires = null;
        } else {
          const res = (new Date().getTime() + maxage) * 1000;
          this.expires = new Date(res);
        }
        return this.expires;
      }
      this.getMaxAge();
      return this.expires;
    }

    setOriginalMaxAge (ms) {
      let res = null;
      switch (typeof ms) {
      case "number":
        return ms;
      case "string":
        try {
          // eslint-disable-next-line new-cap
          res = MS(ms) / 1000;
        } catch (e) {
          res = ms;
        }
        return parseInt(res, 10);
      default:
        throw new Error(`cookie class error maxage bad type ${typeof ms}`);
      }
    }

    setPriority (val) {
      return val;
    }

    getMaxAge () {
      if (this.expires && this.expires instanceof Date) {
        const ms = this.expires.getTime() - new Date().getTime();
        const s = ms / 1000;
        if (s > 0) {
          this.maxAge = s; // en seconde
        } else {
          this.maxAge = null;
          // throw new Error(`Espires / Max-Age : ${s} Error Espires`);
        }
      } else {
        this.maxAge = this.originalMaxAge;
      }
      return this.maxAge;
    }

    toString () {
      return `${this.name}=${encode(this.value)}`;
    }

    sign (val, secret) {
      if (typeof val !== "string") {
        throw new TypeError("cookie required");
      }
      if (typeof secret !== "string") {
        throw new TypeError("secret required");
      }
      return crypto
        .createHmac("sha256", `${val}.${secret}`)
        .update(val)
        .digest("base64")
        .replace(/[=]+$/u, "");
    }

    unsign (val, secret) {
      if (val && typeof val !== "string") {
        throw new Error("unsign cookie value bad type !! ");
      }
      if (secret && typeof secret !== "string") {
        throw new Error("unsign cookie secret bad type");
      }
      if (!val) {
        val = this.value;
      }
      if (!secret) {
        // eslint-disable-next-line prefer-destructuring
        secret = this.settings.secret;
      }
      return this.sign(val, secret) === val ? val : false;
    }

    serialize () {
      const tab = [];
      tab.push(this.toString());
      if (this.maxAge) {
        tab.push(`Max-Age=${this.maxAge}`);
      }
      if (this.domain) {
        tab.push(`Domain=${this.domain}`);
      }
      if (this.path) {
        tab.push(`Path=${this.path}`);
      }
      if (this.sameSite) {
        tab.push(`SameSite=${this.sameSite}`);
      }
      if (this.expires) {
        tab.push(`Expires=${this.expires.toUTCString()}`);
      }
      if (this.httpOnly) {
        tab.push("HttpOnly");
      }
      if (this.secure) {
        tab.push("Secure");
      }
      if (this.priority) {
        tab.push(`Priority=${this.priority}`);
      }
      return tab.join("; ");
    }

    serializeWebSocket () {
      const obj = {};
      obj.name = this.name;
      obj.value = this.value;
      if (this.maxAge) {
        obj.maxage = this.maxAge;
      }
      if (this.domain) {
        obj.domain = this.domain;
      }
      if (this.path) {
        obj.path = this.path;
      }
      if (this.sameSite) {
        obj.samesite = this.sameSite;
      }
      if (this.expires) {
        obj.expires = this.expires;// .toUTCString();
      }
      if (this.httpOnly) {
        obj.httponly = true;
      }
      if (this.secure) {
        obj.secure = true;
      }
      if (this.priority) {
        obj.priority = this.priority;
      }
      return obj;
    }
  };

  return {
    cookie: Cookie,
    cookiesParser,
    parser: parse,
    getRequestcookies
  };
});
