/*
 *
 *  TWIG
 *
 */
const twig = require("twig");
let version = null;
try {
  version = require(path.resolve(path.dirname(require.resolve("twig")), "package.json")).version;
} catch (e) {}

const twigOptions = {
  "twig options": {
    async: true,
    allowAsync: true,
    cache: true
  },
  views: null
};

class Twig extends nodefony.Template {
  constructor (container, options) {
    super(container, twig, options);
    this.kernelSettings = this.container.getParameters("kernel");
    this.cache = this.kernelSettings.environment !== "dev";
    twig.cache(this.cache);
    this.rootDir = this.kernel.rootDir;
    this.name = "Twig";
    container.set("Twig", this);
    this.version = version || twig.VERSION;
    this.nodefonyExtend();
    this.on("onBoot", () => {
      this.router = this.get("router");
      this.translation = this.get("translation");
    });
  }

  nodefonyExtend () {
    // router
    this.extendFunction("url", this.url.bind(this));
    this.extendFunction("path", this.url.bind(this));
    // control
    this.extendFunction("controller", Twig.controller);
    this.extendFunction("render", Twig.render);
    // translation
    this.extendFunction("trans", Twig.translate);
    this.extendFunction("translate", Twig.translate);
    this.extendFilter("trans", Twig.translate);
    this.extendFilter("translate", Twig.translate);
    this.extendFunction("getLangs", this.getLangs.bind(this));
    this.extendFunction("getLocale", Twig.getLocale);
    this.extendFunction("trans_default_domain", Twig.trans_default_domain);
    this.extendFunction("getTransDefaultDomain", Twig.getTransDefaultDomain);
    // Context
    this.extendFunction("absolute_url", Twig.absolute_url);
    this.extendFunction("is_granted", Twig.is_granted);
    this.extendFunction("getFlashBag", Twig.getFlashBag);
    this.extendFunction("getUser", Twig.getUser);
    this.extendFunction("CDN", Twig.CDN);
  }

  static getFlashBag (...args) {
    return this.context.nodefony.getContext().getFlashBag(...args);
  }

  static getUser (...args) {
    return this.context.nodefony.getContext().getUser(...args);
  }

  static CDN (...args) {
    const context = this.context.nodefony.getContext();
    const cdn = context.kernelHttp.getCDN(...args);
    const res = `${context.request.url.protocol}//`;
    if (cdn) {
      return `${res}${cdn}`;
    }
    return "";
    // return `${res}${context.request.url.host}`;
  }

  static absolute_url (...args) {
    return this.context.nodefony.getContext().generateAbsoluteUrl(...args);
  }

  static is_granted (...args) {
    return this.context.nodefony.getContext().is_granted(...args);
  }

  static getLocale () {
    return this.context.nodefony.getContext().translation.getLocale();
  }

  static trans_default_domain (domain) {
    return this.context.nodefony.getContext().translation.trans_default_domain(domain);
  }

  static getTransDefaultDomain () {
    return this.context.nodefony.getContext().translation.getTransDefaultDomain();
  }

  static translate (value, domain, local) {
    return this.context.nodefony.getContext().translation.trans(value, domain, local);
  }

  getLangs () {
    return this.translation.getLangs();
  }

  url (name, variables, host) {
    try {
      return this.router.generatePath(name, variables, host);
    } catch (e) {
      this.log(e, "WARNING");
      return null;
    }
  }

  static controller () {
    const pattern = Array.prototype.shift.call(arguments);
    const data = Array.prototype.slice.call(arguments);
    return new nodefony.subRequest(this.context.nodefony.getContext(), pattern, data);
  }

  static render (subRequest) {
    return subRequest.handle();
  }

  renderFile (file, option = {}, callback = null) {
    option.settings = nodefony.extend(true, {}, twigOptions, {
      views: this.rootDir,
      "twig options": {
        cache: this.cache
      }
    });
    if (!callback) {
      return new Promise((resolve, reject) => {
        try {
          if (!(file instanceof nodefony.fileClass)) {
            file = new nodefony.fileClass(file);
          }
          return this.engine.renderFile(file.path, option, (error, result) => {
            if (error || result === undefined) {
              if (!error) {
                error = new Error(`ERROR PARSING TEMPLATE :${file.path}`);
                return reject(error);
              }
              return reject(error);
            }
            return resolve(result);
          });
        } catch (e) {
          return reject(e);
        }
      });
    }
    try {
      if (!(file instanceof nodefony.fileClass)) {
        file = new nodefony.fileClass(file);
      }
      return this.engine.renderFile(file.path, option, callback);
    } catch (e) {
      callback(e, null);
    }
  }

  async render (view, param) {
    try {
      const template = await this.compile(view)
        .catch((e) => {
          this.log(e, "ERROR");
          throw e;
        });
      if (template) {
        return template.render(param);
      }
      return null;
    } catch (e) {
      throw e;
    }
  }

  compile (file, callback) {
    return new Promise((resolve, reject) => {
      this.engine.twig({
        path: file.path,
        async: true,
        allowAsync: true,
        base: this.rootDir,
        // precompiled:false,
        name: file.name,
        load: (template) => {
          if (callback) {
            callback(null, template);
          }
          return resolve(template);
        },
        error: (error) => {
          if (callback) {
            callback(error, null);
          }
          return reject(error);
        }
      });
    });
  }

  extendFunction () {
    return twig.extendFunction.apply(twig, arguments);
  }

  extendFilter () {
    return twig.extendFilter.apply(twig, arguments);
  }
}

Twig.prototype.extention = "twig";
nodefony.templates.twig = Twig;
module.exports = Twig;
