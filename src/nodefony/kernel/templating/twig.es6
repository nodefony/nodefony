/*
 *
 *  TWIG WRAPPER
 *
 */
const twig = require("twig");

module.exports = nodefony.registerTemplate("twig", function () {

  const twigOptions = {
    'twig options': {
      async: false,
      cache: true
    },
    views: null
  };

  class Twig extends nodefony.templates {

    constructor(container, options) {
      super(container, twig, options);
      this.kernelSettings = this.container.getParameters("kernel");
      this.cache = (this.kernelSettings.environment === "dev") ? false : true;
      twig.cache(this.cache);
      this.rootDir = this.kernel.rootDir;
      container.set("Twig", this);
      this.version = twig.VERSION;
      this.name = "Twig";
    }

    renderFile(file, option = {}, callback = null) {
      option.settings = nodefony.extend(true, {}, twigOptions, {
        views: this.rootDir,
        'twig options': {
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
                  error = new Error("ERROR PARSING TEMPLATE :" + file.path);
                  return reject(error);
                }
                return reject(error);
              }
              return resolve(result);
            });
          } catch (e) {
            callback(e, null);
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

    async render(view, param) {
      try {
        let template = await this.compile(view)
        .catch(e=>{
          this.logger(e,"ERROR");
          throw e;
        });
        if (template){
          return template.render(param);
        }
        return null ;
      } catch (e) {
        throw e;
      }
    }

    compile(file, callback) {
      return new Promise((resolve, reject) => {
        this.engine.twig({
          path: file.path,
          async: true,
          base: this.rootDir,
          //precompiled:false,
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

    extendFunction() {
      return twig.extendFunction.apply(twig, arguments);
    }

    extendFilter() {
      return twig.extendFilter.apply(twig, arguments);
    }
  }

  Twig.prototype.extention = "twig";

  return Twig;
});
