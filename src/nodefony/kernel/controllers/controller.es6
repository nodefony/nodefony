const myRequest = require('request');

module.exports = nodefony.register("controller", function() {

  class Controller extends nodefony.Service {
    constructor(container, context) {
      super(null, container, container.get("notificationsCenter"));
      this.context = context;
      this.http = myRequest;
      this.httpKernel = this.get("httpKernel");
      this.mailer = this.get("mailer");
      this.router = this.get("router");
      this.serviceTemplating = this.get('templating');
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

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = `Controller : ${this.bundle.name}Bundle:${this.name}`;
      }
      return super.logger(pci, severity, msgid, msg);
    }

    clean() {
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

    getLocale() {
      return this.context.locale;
    }

    getRequest() {
      return this.request;
    }

    getResponse(content) {
      if (content) {
        this.response.setBody(content);
      }
      return this.response;
    }

    getContext() {
      return this.context;
    }

    getMethod() {
      return this.context.getMethod();
    }

    startSession(sessionContext) {
      let sessionService = this.get("sessions");
      if (!this.context.requestEnded) {
        return this.sessionAutoStart = sessionService.setAutoStart(sessionContext);
      } else {
        return sessionService.start(this.context, sessionContext);
      }
    }

    getSession() {
      return this.context.session || null;
    }

    getFlashBag(key) {
      let session = this.getSession();
      if (session) {
        return session.getFlashBag(key);
      } else {
        this.logger("getFlashBag session not started !", "ERROR");
        return null;
      }
    }

    setFlashBag(key, value) {
      let session = this.getSession();
      if (session) {
        return session.setFlashBag(key, value);
      } else {
        return null;
      }
    }

    addFlash(key, value) {
      return this.setFlashBag(key, value);
    }

    setContextJson(encoding) {
      if (!encoding) {
        encoding = "charset=utf-8";
      } else {
        encoding = "charset=" + encoding;
      }
      this.context.isJson = true;
      if (this.context.method !== "websoket") {
        if (this.context.response) {
          this.context.response.setHeader("Content-Type", "application/json; " + encoding);
        }
      }
    }

    setJsonContext() {
      return this.setContextJson.apply(this, arguments);
    }

    setCsrfToken(name, options) {
      return this.context.setCsrfToken(name, options);
    }

    setContentType(mime, encoding) {
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

    getORM() {
      return this.getOrm();
    }

    getOrm() {
      return this.get(this.kernel.settings.orm);
    }

    getConnection(name) {
      if (name) {
        return this.getOrm().getConnection(name);
      }
      throw new Error("getConnection must have name");
    }

    getEntity(name) {
      return this.getOrm().getEntity(name);
    }

    getNodefonyEntity(name) {
      return this.getOrm().getNodefonyEntity(name);
    }

    getEntityTransaction(name){
      if ( this.getOrm().name === "sequelize"){
        let db = this.getNodefonyEntity(name).db ;
        return db.transaction.bind(db) ;
      }
      return null;
    }

    sendMail() {
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
     *  this.logger(e, "ERROR");
     * });
     * this.push(path.resolve(this.bundle.publicPath, "assets", "js", "app.js"), {
     *  path: "/app/assets/js/app.js"
     * }).catch((e) => {
     *  this.logger(e, "ERROR");
     * });
     **/
    push(asset, headers, options) {
      if (this.context.type === "HTTP2" && this.context.pushAllowed) {
        let assetPublic = null;
        if (!headers) {
          headers = {};
          assetPublic = asset.replace(this.bundle.publicPath, "/" + this.bundle.bundleName);
          headers.path = assetPublic;
        } else {
          if (!headers.path) {
            assetPublic = asset.replace(this.bundle.publicPath, "/" + this.bundle.bundleName);
            headers.path = assetPublic;
          }
        }
        try {
          return this.response.push(asset, headers, options)
            .catch((error) => {
              this.logger(`HTTP2 push error  : ${asset}`, "ERROR");
              this.logger(error, "ERROR");
              return error;
            });
        } catch (e) {
          return new Promise((resolve, reject) => {
            return reject(e);
          });
        }
      } else {
        return new Promise((resolve /*, reject*/ ) => {
          if (this.context.type !== "HTTP2") {
            //let error = `HTTP2 push : ${asset} method must be called with HTTP2 request !!!!`;
            //this.logger(error, "WARNING");
            return resolve();
            //return reject();
          }
          let error = `HTTP2 Server push : ${asset} not pushAllowed `;
          this.logger(error, "WARNING");
          return resolve();
          //return reject(new Error("HTTP2 Server push not pushAllowed"));
        });
      }
    }

    renderResponse(data, status, headers) {
      return new Promise((resolve, reject) => {
        try {
          return resolve(this.renderResponseSync(data, status, headers));
        } catch (e) {
          return reject(e);
        }
      });
    }

    renderResponseAsync(data, status, headers) {
      return this.renderResponse(data, status, headers)
        .then((result) => {
          return this.context.send(result);
        })
        .catch((e) => {
          this.logger(e, "ERROR");
          this.createException(e);
          return e;
        });
    }

    renderResponseSync(data, status, headers) {
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
        this.logger(e, "ERROR");
        throw e;
      }
    }

    renderJson(obj, status, headers) {
      if (nodefony.isPromise(obj)) {
        return obj.then(result => {
          return this.renderJsonSync(result, status, headers);
        }).catch(error => {
          return this.createException(error);
        });
      }
      return new Promise((resolve, reject) => {
        try {
          return resolve(this.renderJsonSync(obj, status, headers));
        } catch (e) {
          return reject(e);
        }
      });
    }

    renderJsonAsync(obj, status, headers) {
      return this.renderJson(obj, status, headers).then((result) => {
        return this.context.send(result);
      }).catch((e) => {
        this.logger(e, "ERROR");
        this.createException(e);
        return e;
      });
    }

    renderJsonSync(obj, status, headers) {
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
        this.logger(e, "ERROR");
        throw e;
      }

    }

    render(view, param) {
      if (!this.response) {
        throw new Error("WARNING ASYNC !!  RESPONSE ALREADY SENT BY EXPCEPTION FRAMEWORK");
      }
      try {
        return this.renderView(view, param);
      } catch (e) {
        throw e;
      }
    }

    renderSync(view, param) {
      if (!this.response) {
        throw new Error("WARNING ASYNC !!  RESPONSE ALREADY SENT BY EXPCEPTION FRAMEWORK", "WARNING");
      }
      try {
        return this.renderViewSync(view, param);
      } catch (e) {
        throw e;
      }
    }

    renderAsync(view, param) {
      return this.render(view, param).then((result) => {
        return this.context.send(result);
      }).catch((e) => {
        this.logger(e, "ERROR");
        this.createException(e);
        return e;
      });
    }

    renderView(view, param) {
      return new Promise((resolve, reject) => {
        try {
          return resolve(this.renderViewSync(view, param));
        } catch (e) {
          return reject(e);
        }
      });
    }

    renderViewSync(view, param) {
      let res = null;
      let templ = null;
      let extendParam = this.httpKernel.extendTemplate(param, this.context);
      try {
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

    renderRawView(Path, param) {
      let extendParam = this.httpKernel.extendTemplate(param, this.context);
      try {
        this.serviceTemplating.renderFile(Path, extendParam, (error, result) => {
          if (error || result === undefined) {
            if (!error) {
              error = new Error("ERROR PARSING TEMPLATE :" + Path.path);
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

    renderHtmlFile(Path) {
      return new Promise((resolve, reject) => {
        try {
          let file = this.getFile(Path);
          return resolve(file.readAsync());
        } catch (e) {
          return reject(e);
        }
      });
    }

    renderTwigFile(Path, param) {
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

    renderXmlFile(Path, mime, encoding) {
      return new Promise((resolve, reject) => {
        try {
          let file = this.getFile(Path);
          this.setContentType(mime || "application/xml", encoding);
          return resolve(file.readAsync());
        } catch (e) {
          return reject(e);
        }
      });
    }

    getFile(file) {
      try {
        let File = null;
        if (file instanceof nodefony.fileClass) {
          File = file;
        } else {
          if (typeof file === "string") {
            File = new nodefony.fileClass(file);
          } else {
            throw new Error("File argument bad type for getFile :" + typeof file);
          }
        }
        if (File.type !== "File") {
          throw new Error("getFile bad type for  :" + file);
        }
        return File;
      } catch (e) {
        throw e;
      }
    }

    streamFile(file, headers, options) {
      try {
        this.response.streamFile = fs.createReadStream(this.getFile(file).path, options);
      } catch (e) {
        this.logger(e, "ERROR");
        throw e;
      }
      this.response.streamFile.on("open", () => {
        //console.log("open")
        try {
          this.response.response.writeHead(this.response.statusCode, headers);
          this.response.streamFile.pipe(this.response.response, {
            // auto end response
            end: false
          });
        } catch (e) {
          this.logger(e, "ERROR");
          throw e;
        }
      });
      this.response.streamFile.on("end", () => {
        //console.log("end")
        if (this.response.streamFile) {
          try {
            if (this.response.streamFile) {
              this.response.streamFile.unpipe(this.response.response);
              if (this.response.streamFile.fd) {
                fs.close(this.response.streamFile.fd);
              }
            }
          } catch (e) {
            this.logger(e, "ERROR");
            throw e;
          }
        }
        if (!this.response.ended) {
          this.response.end();
        }
      });
      this.response.streamFile.on("close", () => {
        //console.log("close")
        if (this.response.streamFile) {
          this.response.streamFile.unpipe(this.response.response);
          if (this.response.streamFile.fd) {
            fs.close(this.response.streamFile.fd);
          }
        }
        if (!this.response.ended) {
          this.response.end();
        }
      });
      this.response.streamFile.on("error", (error) => {
        this.logger(error, "ERROR");
        if (!this.response.ended) {
          this.response.end();
        }
        throw error;
      });
      this.response.response.on('close', () => {
        if (this.response.streamFile) {
          this.response.streamFile.unpipe(this.response.response);
          if (this.response.streamFile.fd) {
            fs.close(this.response.streamFile.fd);
          }
        }
        if (!this.response.ended) {
          this.response.end();
        }
      });
      return this.response.streamFile;
    }

    renderFileDownload(file, options, headers) {
      //console.log("renderFileDownload :" + file.path)
      let File = this.getFile(file);
      let length = File.stats.size;
      let head = nodefony.extend({
        'Content-Disposition': 'attachment; filename="' + File.name + '"',
        'Content-Length': length,
        "Expires": "0",
        'Content-Description': 'File Transfer',
        'Content-Type': File.mimeType || "application/octet-stream",
      }, headers || {});
      try {
        this.streamFile(File, head, options);
      } catch (e) {
        throw e;
      }
    }

    renderMediaStream(file, options, headers) {
      let File = this.getFile(file);
      if (!options) {
        options = {};
      }
      this.response.setEncoding("binary");
      let range = this.request.headers.range;
      let length = File.stats.size;
      let head = null;
      let value = null;
      if (range) {
        //console.log("HEADER = " + range);
        let parts = range.replace(/bytes=/, "").split("-");
        //console.log(parts)
        let partialstart = parts[0];
        let partialend = parts[1];
        let start = parseInt(partialstart, 10);
        let end = partialend ? parseInt(partialend, 10) : length - 1;
        let chunksize = (end - start) + 1;
        //console.log("start :" + start) ;
        //console.log("end :" + end) ;
        value = nodefony.extend(options, {
          start: start,
          end: end
        });
        //console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
        head = nodefony.extend({
          'Content-Range': 'bytes ' + start + '-' + end + '/' + length,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': File.mimeType || "application/octet-stream"
        }, headers);
        this.response.setStatusCode(206);
      } else {
        head = nodefony.extend({
          'Content-Type': File.mimeType || "application/octet-stream",
          'Content-Length': length,
          'Content-Disposition': ' inline; filename="' + File.name + '"'
        }, headers);
      }
      // streamFile
      try {
        this.streamFile(File, head, options);
      } catch (e) {
        throw e;
      }
    }

    createNotFoundException(message) {
      throw new nodefony.httpError(message, 404, this.container);
    }

    createUnauthorizedException(message) {
      throw new nodefony.securityError(message, 401, null, this.context);
    }

    createException(message) {
      throw new nodefony.httpError(message, 500, this.container);
    }

    createAccessDeniedException(message, code) {
      throw new nodefony.authorizationError(message, code, this.context);
    }

    isGranted(role) {
      try {
        return this.context.is_granted(role);
      } catch (e) {
        throw new nodefony.httpError(e, 500, this.container);
      }
    }

    is_granted(role) {
      return this.isGranted(role);
    }

    translate() {
      return this.context.translation.trans.apply(this.context.translation, arguments);
    }

    redirect(url, status, headers) {
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

    redirectToRoute(route, variables, status, headers) {
      if (!route) {
        throw new Error("Redirect error no route !!!");
      }
      try {
        return this.context.redirect(this.generateUrl(route, variables), status, headers);
      } catch (e) {
        throw e;
      }
    }

    redirectHttps(status) {
      return this.context.redirectHttps(status || 301);
    }

    forward(name, param) {
      //let pattern = Array.prototype.shift.call(arguments);
      //let data = Array.prototype.slice.call(arguments);
      //let subRequest = new nodefony.subRequest(this, pattern);
      //return subRequest.handle(data);
      let resolver = this.router.resolveName(this.context, name);
      return resolver.callController(param, true);
    }

    getUser() {
      return this.context.getUser();
    }

    getToken() {
      return this.context.getToken();
    }

    isAjax() {
      return this.getRequest().isAjax();
    }

    hideDebugBar() {
      this.context.showDebugBar = false;
    }

    getRoute() {
      return this.context.resolver.getRoute();
    }

    generateUrl(name, variables, absolute) {
      try {
        if (absolute) {
          return this.context.generateAbsoluteUrl(name, variables);
        }
        return this.httpKernel.generateUrl(name, variables, null);
      } catch (e) {
        throw e;
      }
    }

    generateAbsoluteUrl(name, variables) {
      try {
        return this.context.generateAbsoluteUrl(name, variables);
      } catch (e) {
        throw e;
      }
    }

    htmlMdParser(content, options) {
      let markdown = require('markdown-it')(nodefony.extend({
        html: true
      }, options));
      try {
        return markdown.render(content);
      } catch (e) {
        throw e;
      }
    }
  }
  return Controller;
});
