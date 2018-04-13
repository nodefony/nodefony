const serveStatic = require('serve-static');

const defaultStatic = {
  cacheControl: true,
  maxAge: 96 * 60 * 60
};

module.exports = class serverStatics extends nodefony.Service {

  constructor(container, options) {
    super("SERVER STATICS", container, container.get("notificationsCenter"));
    this.type = this.kernel.type;
    if (this.type !== "SERVER") {
      return;
    }

    this.environment = this.kernel.environment;
    this.once("onBoot", () => {
      this.settings = this.getParameters("bundles.http").statics;
      this.global = nodefony.extend({}, defaultStatic, this.settings.defaultOptions, options);
      this.initStaticFiles();
    });
    this.serveStatic = serveStatic;
    this.mime = this.serveStatic.mime;
    this.servers = {};
  }

  initStaticFiles() {
    for (let staticRoot in this.settings) {
      if (staticRoot === "defaultOptions") {
        continue;
      }
      let path = this.settings[staticRoot].path;
      path = this.kernel.checkPath(path);
      this.addDirectory(path, this.settings[staticRoot].options);
    }
  }

  addDirectory(path, options) {
    if (!path) {
      throw new Error("Static file path not Defined ");
    }
    this.kernel.on("onPostReady", () => {
      this.logger("Listen Server static rootDir  ==> " + path, "INFO");
    });
    let opt = nodefony.extend({}, this.global, options);
    if (opt.maxAge && typeof opt.maxAge === "string") {
      opt.maxAge = eval(opt.maxAge);
    }
    let server = this.serveStatic(path, opt);
    this.servers[path] = server;
    return server;
  }

  handle(request, response, next) {
    let pathname = url.parse(request.url).pathname;
    let type = this.mime.lookup(pathname);
    response.setHeader("Content-Type", type);
    for (let server in this.servers) {
      this.servers[server](request, response, next);
    }
    return response;
  }
};