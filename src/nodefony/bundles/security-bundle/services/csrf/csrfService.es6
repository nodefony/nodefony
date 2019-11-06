const Tokens = require('csrf');

let defaultOptions = {
  name: "csrf-token",
  ignoreMethods: ["GET", "HEAD", "OPTIONS"],
  cookie: false,
  session: true,
  secret: ""
};

const Csrf = class Csrf {

  constructor(name, options, context, service) {
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

  logger() {
    this.service.logger.apply(this.service, arguments);
  }

  getCookie() {
    if (this.context.cookies[this.name]) {
      return this.context.cookies[this.name];
    } else {
      return this.setCookie();
    }
  }

  setCookie() {
    if (this.settings.cookie) {
      let token = this.setSecret(this.settings.secret);
      if (this.settings.cookie.signed) {
        this.settings.cookie.secret = this.settings.secret;
      }
      let cookie = new nodefony.cookies.cookie(
        this.name,
        token,
        this.settings.cookie);
      this.context.response.addCookie(cookie);
      return cookie;
    }
    return null;
  }

  getHeader() {
    if (this.context.query && this.context.query.csrf) {
      return this.context.query.csrf;
    }
    let headers = this.context.request.headers;
    if (headers) {
      switch (true) {
      case (!!headers[this.name]):
        return headers[this.name];
      case (!!headers['csrf-token']):
        return headers['csrf-token'];
      case (!!headers['xsrf-token']):
        return headers['xsrf-token'];
      case (!!headers['x-csrf-token']):
        return headers['x-csrf-token'];
      case (!!headers['x-xsrf-token']):
        return headers['x-xsrf-token'];
      default:
        return this.setHeader();
      }
    }
    return this.setHeader();
  }

  setHeader() {
    let token = this.setSecret(this.settings.secret);
    this.context.response.setHeader(this.name, token);
    return token;
  }

  getSession() {
    this.context.once("onSessionStart", (session) => {
      if (session) {
        let token = session.getMetaBag(this.name);
        if (token) {
          this.session = token;
          return token;
        } else {
          return this.setSession(session);
        }
      }
    });
  }

  setSession(session) {
    let token = this.setSecret(this.settings.secret);
    this.session = token;
    session.setMetaBag(this.name, token);
    return token;
  }

  setSecret(secret) {
    if (secret) {
      return this.engine.create(secret);
    }
    throw new Error("No csrf secret in config");
  }

  validate() {
    try {
      if (this.settings.ignoreMethods.indexOf(this.context.method) >= 0) {
        return null;
      }
      if (this.cookie) {
        let token = this.cookie.value;
        if (this.settings.cookie.signed) {
          token = this.cookie.unsign(token, this.settings.secret);
          if (!token) {
            throw new Error(`bad signed cookie : ${this.name}`);
          }
        }
        return this.verify(token);
      }
      if (this.session) {
        let token = this.session;
        return this.verify(token);
      }
      if (this.header) {
        let token = this.header;
        return this.verify(token);
      }
      return this;
    } catch (e) {
      throw e;
    }
  }

  verify(token) {
    try {
      let res = this.engine.verify(this.settings.secret, token);
      if (!res) {
        throw new Error(`BAD CSRF Token : ${this.name}`);
      }
      this.logger(`VALID CSRF Token : ${this.name}`);
      return this;
    } catch (e) {
      throw e;
    }
  }
};

module.exports = class csrf extends nodefony.Service {

  constructor(container, httpKernel) {
    super("csrf", container);
    this.httpKernel = httpKernel;
  }

  handle(context) {
    return new Promise((resolve, reject) => {
      try {
        if (context.csrf) {
          return resolve(context.csrf.validate(context));
        }
        return resolve(null);
      } catch (e) {
        return reject(e);
      }
    });
  }

  createCsrfToken(name, options, context) {
    return new Csrf(name, options, context, this);
  }

};
