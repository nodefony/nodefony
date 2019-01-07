/*
 *
 *	EJS WRAPPER
 *
 *
 */
const ejs = require("ejs");

module.exports = nodefony.registerTemplate("ejs", function() {

  const ejsOptions = {

  };


  const Ejs = class Ejs extends nodefony.templates {

    constructor(container, options) {
      super(container, ejs, options);
      this.kernelSettings = this.container.getParameters("kernel");
      this.cache = (this.kernelSettings.environment === "dev") ? false : true;
      this.rootDir = this.kernel.rootDir;
      this.set("ejs", this);
      this.version = ejs.VERSION;
      this.name = "ejs";
    }


    renderFile() {
      return this.engine.renderFile.apply(this.engine, arguments);
    }

    render(view, param) {
      const Render = this.compile(view);
      try {
        return Render(param);
      } catch (e) {
        console.log(e);
        //this.logger(e);
      }
    }

    compile(file, callback) {
      return this.engine.compile(file.path, this.settings);
    }

    extendFunction() {

    }

    extendFilter() {

    }

  };

  Ejs.prototype.extention = "ejs";

  return Ejs;

});