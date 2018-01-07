module.exports = nodefony.register("controller", function () {

  const Controller = class Controller extends nodefony.Service {
    constructor(container, context) {
      super(null, container, container.get("notificationsCenter"));
      this.context = context;
      this.httpKernel = this.get("httpKernel");
      this.router = this.get("router");
      this.serviceTemplating = this.get('templating');
      this.method = this.getMethod();
      this.response = this.context.response;
      this.request = this.context.request;
      this.response = this.context.response;
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
        msgid = "BUNDLE : " + this.bundle.name.toUpperCase() + " Controller : " + this.name;
      }
      return super.logger(pci, severity, msgid, msg);
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
        this.sessionAutoStart = sessionService.setAutoStart(sessionContext);
      } else {
        return sessionService.start(this.context, sessionContext);
      }
    }

    getSession() {
      return this.context.session ||  null;
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

    setContextJson() {
      this.context.isJson = true;
      this.context.response.setHeader("Content-Type", "application/json; charset=utf-8");
    }

    getORM() {
      let defaultOrm = this.kernel.settings.orm;
      return this.get(defaultOrm);
    }

    push(asset, headers, options) {
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
        return this.response.push(asset, headers, options);
      } catch (e) {
        throw e;
      }
    }

    renderResponse(data, status, headers) {
      if (!this.response) {
        this.logger("WARNING ASYNC !!  RESPONSE ALREADY SENT BY EXPCEPTION FRAMEWORK", "WARNING");
        return;
      }
      this.fire("onView", data, this.context);
      //this.response.setBody(data);
      if (headers && typeof headers === "object") {
        this.response.setHeaders(headers);
      }
      if (status) {
        this.response.setStatusCode(status);
      }
      this.fire("onResponse", this.response, this.context);
      return this.response;
    }

    renderJson(obj, status, headers) {
      return new Promise((resolve, reject) => {
        try {
          resolve(this.renderJsonSync(obj, status, headers));
        } catch (e) {
          reject(e);
        }
      });
    }

    renderJsonAsync(obj, status, headers) {
      return this.renderJson(obj, status, headers).then((result) => {
        this.fire("onResponse", this.response, this.context);
        return result;
      }).catch((e) => {
        if (this.response.response.headersSent || this.context.timeoutExpired) {
          return;
        }
        this.context.promise = null;
        this.fire("onError", this.context.container, e);
      });
    }

    renderJsonSync(obj, status, headers) {
      let data = null;
      try {
        data = JSON.stringify(obj);
      } catch (e) {
        this.logger(e, "ERROR");
        throw e;
      }
      if (!this.response) {
        this.logger("WARNING ASYNC !!  RESPONSE ALREADY SENT BY EXPCEPTION FRAMEWORK", "WARNING");
        return;
      }
      //this.response.setBody(data);
      this.fire("onView", data, this.context);
      this.response.setHeaders(nodefony.extend({}, {
        'Content-Type': "text/json ; charset=" + this.response.encoding
      }, headers));
      if (status) {
        this.response.setStatusCode(status);
      }
      return this.response;
    }

    render(view, param) {
      if (!this.response) {
        this.logger("WARNING ASYNC !!  RESPONSE ALREADY SENT BY EXPCEPTION FRAMEWORK", "ERROR");
        return;
      }
      try {
        return this.renderViewAsync(view, param);
      } catch (e) {
        this.fire("onError", this.context.container, e);
      }
    }

    renderSync(view, param) {
      if (!this.response) {
        this.logger("WARNING ASYNC !!  RESPONSE ALREADY SENT BY EXPCEPTION FRAMEWORK", "WARNING");
        return;
      }
      try {
        this.renderView(view, param);
      } catch (e) {
        this.fire("onError", this.context.container, e);
        return;
      }
      return this.response;
    }

    renderAsync(view, param) {
      return this.render(view, param).then((result) => {
        this.fire("onResponse", this.response, this.context);
        return result;
      }).catch((e) => {
        if (this.response.response.headersSent || this.context.timeoutExpired) {
          return;
        }
        this.context.promise = null;
        this.fire("onError", this.context.container, e);
      });
    }

    renderViewAsync(view, param) {
      return new Promise((resolve, reject) => {
        let extendParam = null;
        try {
          extendParam = this.httpKernel.extendTwig(param, this.context);
          let templ = null;
          let res = null;
          try {
            templ = this.httpKernel.getTemplate(view);
          } catch (e) {
            extendParam = null;
            return reject(e);
          }
          try {
            res = templ.render(extendParam);
            try {
              this.fire("onView", res, this.context, templ.path, param);
              extendParam = null;
              return resolve(res);
            } catch (e) {
              extendParam = null;
              return reject(e);
            }
          } catch (e) {
            extendParam = null;
            return reject(e);
          }
        } catch (e) {
          extendParam = null;
          throw e;
        }
      });
    }

    renderView(view, param) {
      let res = null;
      let templ = null;
      let extendParam = this.httpKernel.extendTwig(param, this.context);
      try {
        templ = this.httpKernel.getTemplate(view);
      } catch (e) {
        extendParam = null;
        throw e;
      }
      try {
        res = templ.render(extendParam);
        try {
          this.fire("onView", res, this.context, null, param);
        } catch (e) {
          extendParam = null;
          throw e;
        }
      } catch (e) {
        extendParam = null;
        throw e;
      }
      extendParam = null;
      return res;
    }

    renderRawView(path, param) {
      let res = null;
      let extendParam = this.httpKernel.extendTwig(param, this.context);
      try {
        this.serviceTemplating.renderFile(path, extendParam, (error, result) => {
          if (error || result === undefined) {
            if (!error) {
              error = new Error("ERROR PARSING TEMPLATE :" + path.path);
            }
            extendParam = null;
            throw error;
          } else {
            try {
              this.fire("onView", result, this.context, path, param);
              res = result;
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
      extendParam = null;
      return res;
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
      if (message instanceof Error) {
        message.code = 404;
        this.fire("onError", this.container, message);
        return;
      }
      let error = new Error(message);
      error.code = 404;
      this.fire("onError", this.container, error);
    }

    createUnauthorizedException(message) {
      if (message instanceof Error) {
        message.code = 401;
        this.fire("onError", this.container, message);
        return;
      }
      let error = new Error(message);
      error.code = 401;
      this.fire("onError", this.container, error);
    }

    createException(message) {
      if (message instanceof Error) {
        message.code = 500;
        this.fire("onError", this.container, message);
        return;
      }
      let error = new Error(message);
      error.code = 500;
      this.fire("onError", this.container, error);
    }

    redirect(url, status, headers) {
      if (!url) {
        throw new Error("Redirect error no url !!!");
      }
      this.context.isRedirect = true;
      try {
        this.context.redirect(url, status, headers);
      } catch (e) {
        throw e;
      }
    }

    redirectHttps(status) {
      return this.context.redirectHttps(status || 301);
    }

    forward(name, param) {
      let resolver = this.router.resolveName(this.context, name);
      return resolver.callController(param);
    }

    getUser() {
      return this.context.getUser();
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
  };
  return Controller;
});