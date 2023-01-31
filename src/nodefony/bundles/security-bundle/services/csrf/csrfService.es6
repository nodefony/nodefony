const Tokens = require("csrf");

const defaultOptions = {
  name: "csrf-token",
  ignoreMethods: ["GET", "HEAD", "OPTIONS"],
  cookie: false,
  session: true,
  secret: ""
};

const Csrf = class Csrf {
  constructor (name, options, context, service) {
    this.name = name || defaultOptions.name;
    this.settings = nodefony.extend({}, defaultOptions, options);
    this.service = service;
    this.engine = new Tokens();
    this.context = context;
    this.cookie = null;
    this.hearder = null;
    if (this.settings.cookie) {
      this.cookie = this.getCookie();
    }
    if (this.settings.session) {
      this.session = this.getSession();
    }
    if (this.settings.hearder) {
      this.hearder = this.getHeader();
    }
  }

  log () {
    this.service.log.apply(this.service, arguments);
  }

  getCookie () {
    if (this.context.cookies[this.name]) {
      return this.context.cookies[this.name];
    }
    return this.setCookie();
  }

  getRequestCookie () {
    const cookie = nodefony.cookies.getRequestcookies(this.context);
    if (cookie && cookie[this.name]) {
      return cookie[this.name];
    }
    return null;
  }

  setCookie () {
    if (this.settings.cookie) {
      const token = this.setSecret(this.settings.secret);
      if (this.settings.cookie.signed) {
        this.settings.cookie.secret = this.settings.secret;
      }
      const cookie = new nodefony.cookies.cookie(
        this.name,
        token,
        this.settings.cookie
      );
      this.context.response.addCookie(cookie);
      return cookie;
    }
    return null;
  }

  getHeader () {
    if (this.context.query && this.context.query.csrf) {
      return this.context.query.csrf;
    }
    const {headers} = this.context.request;
    if (headers) {
      switch (true) {
      case Boolean(headers[this.name]):
        return headers[this.name];
      case Boolean(headers["csrf-token"]):
        return headers["csrf-token"];
      case Boolean(headers["xsrf-token"]):
        return headers["xsrf-token"];
      case Boolean(headers["x-csrf-token"]):
        return headers["x-csrf-token"];
      case Boolean(headers["x-xsrf-token"]):
        return headers["x-xsrf-token"];
      default:
        return this.setHeader();
      }
    }
    return this.setHeader();
  }

  setHeader () {
    const token = this.setSecret(this.settings.secret);
    this.context.response.setHeader(this.name, token);
    return token;
  }

  getSession () {
    this.context.once("onSessionStart", (session) => {
      if (session) {
        const token = session.getMetaBag(this.name);
        if (token) {
          this.session = token;
          return token;
        }
        return this.setSession(session);
      }
    });
  }

  setSession (session) {
    const token = this.setSecret(this.settings.secret);
    this.session = token;
    session.setMetaBag(this.name, token);
    return token;
  }

  setSecret (secret) {
    if (secret) {
      return this.engine.create(secret);
    }
    throw new Error("No csrf secret in config");
  }

  validate () {
    try {
      if (this.settings.ignoreMethods.indexOf(this.context.method) >= 0) {
        return null;
      }
      if (this.settings.cookie) {
        let token = this.getRequestCookie();
        if (!token) {
          throw new nodefony.csrfError(`No crsf token ${this.name}`, 401);
        }
        if (this.settings.cookie.signed) {
          token = this.context.cookies[this.name].unsign(token, this.settings.secret);
          if (!token) {
            throw new nodefony.csrfError(`bad signed cookie ${this.name}`, 401);
          }
        }
        return this.verify(token);
      }
      if (this.session) {
        const token = this.session;
        return this.verify(token);
      }
      if (this.header) {
        const token = this.header;
        return this.verify(token);
      }
      throw new nodefony.csrfError("No csrf method defined", 500);
    } catch (e) {
      throw e;
    }
  }

  verify (token) {
    try {
      const res = this.engine.verify(this.settings.secret, token);
      if (!res) {
        throw new nodefony.csrfError(`BAD CSRF Token ${this.name}`, 401);
      }
      this.log(`VALID CSRF Token : ${this.name}`, "DEBUG");
      return token;
    } catch (e) {
      throw e;
    }
  }
};

module.exports = class csrf extends nodefony.Service {
  constructor (container, httpKernel) {
    super("csrf", container);
    this.httpKernel = httpKernel;
  }

  handle (context) {
    return new Promise((resolve, reject) => {
      try {
        if (context.csrf) {
          const token = context.csrf.validate(context);
          return resolve(token);
        }
        return resolve(null);
      } catch (e) {
        return reject(e);
      }
    });
  }

  createCsrfToken (name, options, context) {
    return new Csrf(name, options, context, this);
  }
};
