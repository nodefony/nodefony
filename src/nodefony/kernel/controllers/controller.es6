const myRequest = require("request");
const {
  graphql
} = require("graphql");

class Controller extends nodefony.Service {
  constructor (container, context) {
    super(null, container, container.get("notificationsCenter"));
    this.setContext(context);
    this.graphql = graphql;
    this.http = myRequest;
    this.httpKernel = this.get("httpKernel");
    this.mailer = this.get("mailer");
    this.router = this.get("router");
    this.serviceTemplating = this.get("templating");
  }

  setContext (context) {
    this.context = context;
    this.method = this.getMethod();
    this.response = this.context.response;
    this.request = this.context.request;
    this.queryGet = this.request.queryGet;
    this.query = this.request.query;
    this.queryFile = this.request.queryFile;
    this.queryPost = this.request.queryPost;
    this.sessionAutoStart = null;
    this.once("onRequestEnd", () => {
      this.query = this.request.query;
      this.queryFile = this.request.queryFile;
      this.queryPost = this.request.queryPost;
    });
  }

  getContext () {
    return this.context;
  }

  setContextJson (encoding) {
    return this.context.setContextJson(encoding);
  }

  setJsonContext (encoding) {
    return this.context.setContextJson(encoding);
  }

  setContextHtml (encoding) {
    return this.context.setContextHtml(encoding);
  }

  setHtmlContext (encoding) {
    return this.context.setContextHtml(encoding);
  }

  log (pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = `CONTROLLER : ${this.bundle.name}Bundle:${this.name}`;
    }
    return super.log(pci, severity, msgid, msg);
  }

  clean () {
    delete this.session;
    delete this.context;
    delete this.response;
    delete this.request;
    delete this.queryGet;
    delete this.query;
    delete this.queryFile;
    delete this.http;
    delete this.router;
    delete this.httpKernel;
    delete this.serviceTemplating;
    super.clean();
  }

  getLocale () {
    return this.context.locale;
  }

  getRequest () {
    return this.request;
  }

  getResponse (content) {
    if (content) {
      this.response.setBody(content);
    }
    return this.response;
  }

  getMethod () {
    return this.context.getMethod();
  }

  startSession (sessionContext) {
    const sessionService = this.get("sessions");
    // is subRequest
    if (this.context.parent) {
      return this.getSession();
    }
    if (!this.context.requestEnded || this.context.security) {
      return this.sessionAutoStart = sessionService.setAutoStart(sessionContext);
    }
    return sessionService.start(this.context, sessionContext);
  }

  getSession () {
    return this.context.session || null;
  }

  getFlashBag (key) {
    const session = this.getSession();
    if (session) {
      return session.getFlashBag(key);
    }
    this.log("getFlashBag session not started !", "ERROR");
    return null;
  }

  setFlashBag (key, value) {
    const session = this.getSession();
    if (session) {
      return session.setFlashBag(key, value);
    }
    return null;
  }

  addFlash (key, value) {
    return this.setFlashBag(key, value);
  }

  setCsrfToken (name, options) {
    return this.context.setCsrfToken(name, options);
  }

  setContentType (mime, encoding) {
    if (this.context.method !== "websoket") {
      let type = null;
      if (encoding) {
        type = `${mime}; ${encoding}`;
      } else {
        type = `${mime}`;
      }
      return this.context.response.setHeader("Content-Type", type);
    }
  }

  getORM () {
    return this.getOrm();
  }

  getOrm () {
    return this.get(this.kernel.settings.orm);
  }

  getConnection (name) {
    if (name) {
      return this.getOrm().getConnection(name);
    }
    throw new Error("getConnection must have name");
  }

  getEntity (name) {
    return this.getOrm().getEntity(name);
  }

  getNodefonyEntity (name) {
    return this.getOrm().getNodefonyEntity(name);
  }

  getTransaction (name) {
    const orm = this.getOrm();
    if (!orm) {
      throw new Error("Orm not found");
    }
    try {
      return orm.getTransaction(name);
    } catch (e) {
      throw e;
    }
  }

  async startTransaction (name) {
    const orm = this.getOrm();
    if (!orm) {
      throw new Error("Orm not found");
    }
    try {
      return await orm.startTransaction(name);
    } catch (e) {
      throw e;
    }
  }

  sendMail () {
    if (!this.mailer) {
      throw new Error("mail-bundle not registred !");
    }
    switch (arguments.length) {
    case 1:
      Array.prototype.push.call(arguments, null);
      Array.prototype.push.call(arguments, this.context);
      break;
    case 2:
      Array.prototype.push.call(arguments, this.context);
      break;
    }
    return this.mailer.sendMail.apply(this.mailer, arguments);
  }

  /**
   * Example server push http2 if serverPush client is allowed
   *
   * this.push(path.resolve(this.bundle.publicPath, "assets", "css", "app.css"), {
   *  path: "/app/assets/css/app.css"
   * }).catch((e) => {
   *  this.log(e, "ERROR");
   * });
   * this.push(path.resolve(this.bundle.publicPath, "assets", "js", "app.js"), {
   *  path: "/app/assets/js/app.js"
   * }).catch((e) => {
   *  this.log(e, "ERROR");
   * });
   **/
  push (asset, headers, options) {
    if (this.context.type === "HTTP2" && this.context.pushAllowed) {
      let assetPublic = null;
      if (!headers) {
        headers = {};
        assetPublic = asset.replace(this.bundle.publicPath, `/${this.bundle.bundleName}`);
        headers.path = assetPublic;
      } else if (!headers.path) {
        assetPublic = asset.replace(this.bundle.publicPath, `/${this.bundle.bundleName}`);
        headers.path = assetPublic;
      }
      try {
        return this.response.push(asset, headers, options)
          .catch((error) => {
            this.log(`HTTP2 push error  : ${asset}`, "ERROR");
            this.log(error, "ERROR");
            return error;
          });
      } catch (e) {
        return new Promise((resolve, reject) => reject(e));
      }
    } else {
      return new Promise((resolve /* , reject*/) => {
        if (this.context.type !== "HTTP2") {
          // let error = `HTTP2 push : ${asset} method must be called with HTTP2 request !!!!`;
          // this.log(error, "WARNING");
          return resolve();
          // return reject();
        }
        const error = `HTTP2 Server push : ${asset} not pushAllowed `;
        this.log(error, "WARNING");
        return resolve();
        // return reject(new Error("HTTP2 Server push not pushAllowed"));
      });
    }
  }

  renderResponse (data, status, headers) {
    return new Promise((resolve, reject) => {
      try {
        return resolve(this.renderResponseSync(data, status, headers));
      } catch (e) {
        return reject(e);
      }
    });
  }

  renderResponseAsync (data, status, headers) {
    return this.renderResponse(data, status, headers)
      .then((result) => this.context.send(result))
      .catch((e) => {
        this.log(e, "ERROR");
        this.createException(e);
        return e;
      });
  }

  renderResponseSync (data, status, headers) {
    try {
      this.response.setBody(data);
      if (headers) {
        this.response.setHeaders(headers);
      }
      if (status) {
        this.response.setStatusCode(status);
      }
      return data;
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }


  renderJson (obj, status, headers) {
    if (nodefony.isPromise(obj)) {
      return obj.then((result) => this.renderJsonSync(result, status, headers)).catch((error) => this.createException(error));
    }
    return new Promise((resolve, reject) => {
      try {
        return resolve(this.renderJsonSync(obj, status, headers));
      } catch (e) {
        return reject(e);
      }
    });
  }

  renderJsonAsync (obj, status, headers) {
    return this.renderJson(obj, status, headers)
      .then((result) => this.context.send(result))
      .catch((e) => {
        this.log(e, "ERROR");
        this.createException(e);
        return e;
      });
  }

  renderJsonSync (obj, status, headers) {
    let data = null;
    try {
      data = JSON.stringify(obj);
      if (!this.response) {
        throw new Error("WARNING ASYNC !!  RESPONSE ALREADY SENT BY EXPCEPTION FRAMEWORK");
      }
      this.response.setBody(data);
      this.setContextJson();
      if (headers) {
        this.response.setHeaders(headers);
      }
      if (status) {
        this.response.setStatusCode(status);
      }
      return data;
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  async render (view, param) {
    if (!this.response) {
      throw new Error("WARNING ASYNC !!  RESPONSE ALREADY SENT BY EXPCEPTION FRAMEWORK");
    }
    try {
      return await this.renderView(view, param);
    } catch (e) {
      throw e;
    }
  }

  renderSync (view, param) {
    if (!this.response) {
      throw new Error("WARNING ASYNC !!  RESPONSE ALREADY SENT BY EXPCEPTION FRAMEWORK", "WARNING");
    }
    try {
      return this.renderViewSync(view, param);
    } catch (e) {
      throw e;
    }
  }

  renderAsync (view, param) {
    return this.render(view, param)
      .then((result) => this.context.send(result))
      .catch((e) => {
        this.log(e, "ERROR");
        this.createException(e);
        return e;
      });
  }

  renderView (view, param) {
    return new Promise((resolve, reject) => {
      try {
        return resolve(this.renderViewSync(view, param));
      } catch (e) {
        return reject(e);
      }
    });
  }

  renderViewSync (view, param) {
    let res = null;
    let templ = null;
    let extendParam = null;
    try {
      extendParam = this.httpKernel.extendTemplate(param, this.context);
      templ = this.httpKernel.getTemplate(view);
    } catch (e) {
      extendParam = null;
      throw e;
    }
    try {
      res = templ.render(extendParam);
      this.fire("onView", res, this.context, null, param);
      this.response.setBody(res);
      return res;
    } catch (e) {
      extendParam = null;
      throw e;
    }
  }

  renderRawView (Path, param) {
    let extendParam = this.httpKernel.extendTemplate(param, this.context);
    try {
      this.serviceTemplating.renderFile(Path, extendParam, (error, result) => {
        if (error || result === undefined) {
          if (!error) {
            error = new Error(`ERROR PARSING TEMPLATE :${Path.path}`);
          }
          extendParam = null;
          throw error;
        } else {
          try {
            this.response.setBody(result);
            extendParam = null;
            return result;
          } catch (e) {
            extendParam = null;
            throw e;
          }
        }
      });
    } catch (e) {
      extendParam = null;
      throw e;
    }
    return this.response.body;
  }

  renderHtmlFile (Path) {
    return new Promise((resolve, reject) => {
      try {
        const file = this.getFile(Path);
        return resolve(file.readAsync());
      } catch (e) {
        return reject(e);
      }
    });
  }

  renderTwigFile (Path, param) {
    return new Promise((resolve, reject) => {
      let extendParam = null;
      try {
        if (!(Path instanceof nodefony.fileClass)) {
          Path = new nodefony.fileClass(Path);
        }
        extendParam = this.httpKernel.extendTemplate(param, this.context);
        return resolve(this.serviceTemplating.renderFile(Path, extendParam));
      } catch (e) {
        extendParam = null;
        return reject(e);
      }
    });
  }

  renderXmlFile (Path, mime, encoding) {
    return new Promise((resolve, reject) => {
      try {
        const file = this.getFile(Path);
        this.setContentType(mime || "application/xml", encoding);
        return resolve(file.readAsync());
      } catch (e) {
        return reject(e);
      }
    });
  }

  getFile (file) {
    try {
      let File = null;
      if (file instanceof nodefony.fileClass) {
        File = file;
      } else if (typeof file === "string") {
        // eslint-disable-next-line new-cap
        File = new nodefony.fileClass(file);
      } else {
        throw new Error(`File argument bad type for getFile :${typeof file}`);
      }
      if (File.type !== "File") {
        throw new Error(`getFile bad type for  :${file}`);
      }
      return File;
    } catch (e) {
      throw e;
    }
  }

  streamFile (file, headers, options = {}) {
    options.autoClose = false;
    try {
      const streamFile = fs.createReadStream(this.getFile(file).path, options);
      streamFile.on("open", () => {
        // console.log("open")
        try {
          this.response.response.writeHead(this.response.statusCode, headers);
          streamFile.pipe(this.response.response, {
            // auto end response
            end: false
          });
        } catch (e) {
          this.log(e, "ERROR");
          throw e;
        }
      });
      streamFile.on("end", () => {
        // console.log("end")
        try {
          if (streamFile) {
            streamFile.unpipe(this.response.response);
            // console.trace(streamFile)
            if (streamFile.fd) {
              fs.close(streamFile.fd);
            }
          }
        } catch (e) {
          this.log(e, "ERROR");
          throw e;
        }
        if (!this.response.ended) {
          this.response.end();
        }
      });
      streamFile.on("close", () => {
        // console.log("close")
        if (streamFile) {
          streamFile.unpipe(this.response.response);
          if (streamFile.fd) {
            fs.close(streamFile.fd);
          }
        }
        if (!this.response.ended) {
          this.response.end();
        }
      });
      streamFile.on("error", (error) => {
        this.log(error, "ERROR");
        if (!this.response.ended) {
          this.response.end();
        }
        throw error;
      });
      streamFile.on("close", () => {
        if (streamFile) {
          streamFile.unpipe(this.response.response);
          if (streamFile.fd) {
            fs.close(streamFile.fd);
          }
        }
        if (!this.response.ended) {
          this.response.end();
        }
      });
      return streamFile;
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  renderFileDownload (file, options, headers) {
    // console.log("renderFileDownload :" + file.path)
    const File = this.getFile(file);
    const length = File.stats.size;
    const head = nodefony.extend({
      "Content-Disposition": `attachment; filename="${File.name}"`,
      "Content-Length": length,
      "Expires": "0",
      "Content-Description": "File Transfer",
      "Content-Type": File.mimeType || "application/octet-stream"
    }, headers || {});
    try {
      this.streamFile(File, head, options);
    } catch (e) {
      throw e;
    }
  }

  renderMediaStream (file, options, headers) {
    const File = this.getFile(file);
    if (!options) {
      options = {};
    }
    this.response.setEncoding("binary");
    const {range} = this.request.headers;
    const length = File.stats.size;
    let head = null;
    let value = null;
    if (range) {
      // console.log("HEADER = " + range);
      const parts = range.replace(/bytes=/, "").split("-");
      // console.log(parts)
      const partialstart = parts[0];
      const partialend = parts[1];
      const start = parseInt(partialstart, 10);
      const end = partialend ? parseInt(partialend, 10) : length - 1;
      const chunksize = end - start + 1;
      // console.log("start :" + start) ;
      // console.log("end :" + end) ;
      value = nodefony.extend(options, {
        start,
        end
      });
      // console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
      head = nodefony.extend({
        "Content-Range": `bytes ${start}-${end}/${length}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": File.mimeType || "application/octet-stream"
      }, headers);
      this.response.setStatusCode(206);
    } else {
      head = nodefony.extend({
        "Content-Type": File.mimeType || "application/octet-stream",
        "Content-Length": length,
        "Content-Disposition": ` inline; filename="${File.name}"`
      }, headers);
    }
    // streamFile
    try {
      this.streamFile(File, head, options);
    } catch (e) {
      throw e;
    }
  }

  createNotFoundException (message) {
    throw new nodefony.httpError(message, 404, this.container);
  }

  createUnauthorizedException (message) {
    throw new nodefony.securityError(message, 401, null, this.context);
  }

  createException (message, code = 500) {
    throw new nodefony.httpError(message, code, this.container);
  }

  renderException (message, code = 500) {
    throw new nodefony.httpError(message, code, this.container);
  }

  createAccessDeniedException (message, code = 403) {
    throw new nodefony.authorizationError(message, code, this.context);
  }

  createSecurityException (message, code = 401) {
    throw new nodefony.securityError(message, code, this.context.security, this.context);
  }


  isGranted (role) {
    try {
      return this.context.is_granted(role);
    } catch (e) {
      throw new nodefony.httpError(e, 500, this.container);
    }
  }

  is_granted (role) {
    return this.isGranted(role);
  }

  translate () {
    return this.context.translation.trans.apply(this.context.translation, arguments);
  }

  redirect (url, status, headers) {
    if (!this.context.redirect) {
      throw new Error("subRequest can't redirect request");
    }
    if (!url) {
      throw new Error("Redirect error no url !!!");
    }
    try {
      this.context.redirect(url, status, headers);
    } catch (e) {
      throw e;
    }
  }

  redirectToRoute (route, variables, status, headers) {
    if (!route) {
      throw new Error("Redirect error no route !!!");
    }
    try {
      return this.context.redirect(this.generateUrl(route, variables), status, headers);
    } catch (e) {
      throw e;
    }
  }

  redirectHttps (status) {
    return this.context.redirectHttps(status || 301);
  }

  forward (name, param) {
    // let pattern = Array.prototype.shift.call(arguments);
    // let data = Array.prototype.slice.call(arguments);
    // let subRequest = new nodefony.subRequest(this, pattern);
    // return subRequest.handle(data);
    const resolver = this.router.resolveName(this.context, name);
    return resolver.callController(param, true);
  }

  getUser () {
    return this.context.getUser();
  }

  getToken () {
    return this.context.getToken();
  }

  isAjax () {
    return this.getRequest().isAjax();
  }

  hideDebugBar () {
    this.context.showDebugBar = false;
  }

  getRoute () {
    return this.context.resolver.getRoute();
  }

  logout () {
    if (this.context.security) {
      this.log(`Logout Controller : ${this.name}`, "DEBUG");
      return this.context.security.logout(this.context)
        .then(() => true)
        .catch((e) => {
          throw e;
        });
    }
    return new Promise((resolve, reject) => {
      if (this.context.session) {
        this.context.session.invalidate()
          .then(() => {
            resolve(true);
          })
          .catch((e) => {
            this.log(e, "ERROR");
            reject(e);
          });
        return;
      }
      resolve(true);
    });
  }

  generateUrl (name, variables, absolute) {
    try {
      if (absolute) {
        return this.context.generateAbsoluteUrl(name, variables);
      }
      return this.httpKernel.generateUrl(name, variables, null);
    } catch (e) {
      throw e;
    }
  }

  generateAbsoluteUrl (name, variables) {
    try {
      return this.context.generateAbsoluteUrl(name, variables);
    } catch (e) {
      throw e;
    }
  }

  htmlMdParser (content, options) {
    const markdown = require("markdown-it")(nodefony.extend({
      html: true
    }, options));
    try {
      return markdown.render(content);
    } catch (e) {
      throw e;
    }
  }
}

nodefony.Controller = Controller;
nodefony.controller = Controller;
module.exports = Controller;
