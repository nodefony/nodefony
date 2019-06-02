const serveStatic = require('serve-static');

const defaultStatic = {
  cacheControl: true,
  maxAge: 96 * 60 * 60
};

module.exports = class serverStatics extends nodefony.Service {

  constructor(container, options) {
    super("SERVER STATICS", container, container.get("notificationsCenter"));
    if (this.kernel.type !== "SERVER") {
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
    this.kernel.on("onPostReady", () => {
      for (let ele in this.servers) {
        this.logger("Server Static RootDir  ==> " + ele, "INFO");
      }
    });
  }

  initStaticFiles() {
    for (let staticRoot in this.settings) {
      if (staticRoot === "defaultOptions") {
        continue;
      }
      let Path = this.settings[staticRoot].path;
      Path = this.kernel.checkPath(Path);
      let setHeaders = null ;
      if (this.settings[staticRoot].options.setHeaders){
        if ( typeof this.settings[staticRoot].options.setHeaders === "function"){
          setHeaders = this.settings[staticRoot].options.setHeaders ;
          delete this.settings[staticRoot].options.setHeaders ;
        }
      }
      this.settings[staticRoot].options.setHeaders = (res, path)=>{
        this.logger(`Serve Static ${path}`,"DEBUG");
        this.fire("onServeStatic", res, path, staticRoot, this);
      };
      if (setHeaders){
        this.on("onServeStatic", setHeaders);
      }
      this.addDirectory(Path, this.settings[staticRoot].options);
    }
  }

  addDirectory(Path, options) {
    if (!Path) {
      throw new Error("Static file path not Defined ");
    }
    let opt = nodefony.extend({}, this.global, options);
    if (typeof opt.maxAge === "string") {
      opt.maxAge = parseInt(eval(opt.maxAge), 10);
    }
    let server = this.serveStatic(Path, opt);
    this.servers[Path] = server;
    return server;
  }

  handle(request, response, next) {
    let pathname = url.parse(request.url).pathname;
    let type = this.mime.lookup(pathname);
    response.setHeader("Content-Type", type);
    let tab = [];
    for (let server in this.servers) {
      let myPromise = new Promise((resolve, reject) => {
        this.servers[server](request, response, (err) => {
          if (err) {
            return reject(err);
          }
          return resolve();
        });
      });
      tab.push(myPromise);
    }
    return Promise.all(tab).then((ele) => {
      if (next) {
        return next(ele);
      }
      return ele;
    }).catch((err) => {
      if (next) {
        return next(err);
      }
      throw err;
    });
  }
};
