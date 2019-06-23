const vm = require("vm");
const path = require("path");
const Module = require("module");
const fs = require('fs');
const Nodefony = require(path.resolve(__dirname, "nodefony.es6"));

module.exports = function() {

  // Create Context copy library in context  see load runInThisContext
  const context = vm.createContext(this);

  //context.require = require;
  //context.module = module;
  //context.exports = exports;
  //context.__dirname = __dirname;
  //context.__filename = __filename;
  context.path = require("path");
  context.fs = require("fs");
  context.yaml = require("js-yaml");
  context.util = require('util');
  context.cluster = require('cluster');
  context.url = require("url");
  context.xmlParser = require('xml2js').Parser;
  context.dns = require('dns');
  //context.async = require('async');
  //context.nodedomain = require('domain');
  context.Promise = require('promise');
  context.inquirer = require('inquirer');
  context.clc = require('cli-color');
  context.shell = require("shelljs");
  context.twig = require("twig");
  context.crypto = require("crypto");
  context.BlueBird = require("bluebird");
  context.pm2 = require('pm2');
  //context.Rx = require("rxjs");
  const nodefony = new Nodefony(context);


  /**
   *  Nodefony autoloader
   *
   * @class autoload
   * @constructor
   * @module NODEFONY
   *
   */
  const regJs = /.*\.js$|.*\.es6$/;

  class Autoload {

    constructor() {
      this.versions = this.getVersion();
      this.timeout = 20000;
      this.displayError = true;
      this.syslog = null;
      this.lineOffset = 10;
      this.columnOffset = 10;
      this.dirname = path.resolve(__dirname);

      try {
        require(path.resolve(__dirname, "error.es6"));
        //this.load(path.resolve(__dirname, "error.es6"));
        require(path.resolve(__dirname, "container.es6"));
        require(path.resolve(__dirname, "notificationsCenter.es6"));
        require(path.resolve(__dirname, "syslog.es6"));
        require(path.resolve(__dirname, "service.es6"));
        require(path.resolve(__dirname, "fileClass.es6"));
        require(path.resolve(__dirname, "finder.es6"));
        require(path.resolve(__dirname, "protocol.es6"));
        require(path.resolve(__dirname, "watcher.es6"));
        require(path.resolve(__dirname, "cli.es6"));
        //builders
        require(path.resolve(__dirname, "builder.es6"));
        require(path.resolve(__dirname, "cli", "builder", "bundles", "bundle.js"));
        require(path.resolve(__dirname, "cli", "builder", "project", "project.js"));
        require(path.resolve(__dirname, "cli", "builder", "sandbox", "sandBoxBuilder.js"));
        require(path.resolve(__dirname, "cli", "builder", "react", "reactBuilder.js"));
        require(path.resolve(__dirname, "cli", "builder", "vue", "vueBuilder.js"));
        this.loadDirectory(path.resolve(__dirname, "kernel"), /^tests$|^tasks$/);
        this.loadDirectory(path.resolve(__dirname, "protocols"), /^tests$/);
        context.nodefony.cliStart = require(path.resolve(__dirname, "cli", "start.js"));
        context.nodefony.appKernel = this.loadAppKernel();
      } catch (e) {
        throw e;
      }
      this.syslog = null;
      this.setEnv();
    }

    getVersion() {
      return process.versions;
    }

    fileExist(file) {
      try {
        fs.statSync(file);
      } catch (e) {
        throw e;
      }
    }

    isElectron() {
      return this.versions.electron || null;
    }

    loadAppKernel() {
      try {
        return require(path.resolve("app", "appKernel.js"));
      } catch (e) {
        return null;
      }
    }

    createContext(sandbox) {
      return vm.createContext(sandbox);
    }

    setEnv(environment) {
      this.environment = environment;
      switch (this.environment) {
        case "production":
        case "prod":
        case "PROD":
          this.environment = "prod";
          this.dataCache = true;
          break;
        case "development":
        case "dev":
        case "DEV":
          this.environment = "dev";
          this.dataCache = false;
          break;
        default:
          this.environment = "prod";
          this.dataCache = true;
      }
    }

    /**
     * @method load
     *
     * @param {String} file Path to load
     *
     */
    load(file, force) {
      let filename = null;
      try {
        filename = Module._resolveFilename(file, module, false);
        let cachedModule = Module._cache[filename];
        if (cachedModule && !force) {
          return cachedModule.exports;
        }
        if (cachedModule && force) {
          delete Module._cache[filename];
        }
        let myModule = new Module(filename, module);
        Module._cache[filename] = myModule;
        myModule.load(filename);
        return myModule.exports;
      } catch (e) {
        if (Module._cache[filename]) {
          delete Module._cache[filename];
        }
        throw e;
      }
    }

    /**
     * @method logger
     *
     * @param {void} payload payload for log. protocole controle information
     * @param {Number | String} severity severity syslog like.
     * @param {String} msgid informations for message. example(Name of function for debug)
     * @param {String} msg  message to add in log. example (I18N)
     */
    logger(pci, severity, msgid, msg) {
      if (this.syslog) {
        if (!msgid) {
          msgid = "AUTOLOADER  ";
        }
        return this.syslog.logger(pci, severity, msgid, msg);
      }
      //console.log(pci);
    }

    /**
     * @method loadDirectory
     *
     * @param {String} path Path to directory to autoload
     *
     */
    loadDirectory(path, exclude) {
      let finder = null;
      let settings = {
        path: path,
        onFinish: (error, res) => {
          if (error) {
            throw error;
          }
          res.forEach(this.autoloadEach.bind(this));
        }
      };
      if (exclude) {
        settings.exclude = exclude;
      }
      if (nodefony.finder) {
        try {
          finder = new nodefony.finder(settings);
        } catch (e) {
          this.logger(e);
          if (finder) {
            return finder.result;
          }
          throw e;
        }
        return finder.result;
      }
      throw new Error("AUTOLOADER finder not found  Load nodefony finder ");
    }

    autoloadEach(ele) {
      if (regJs.exec(ele.path)) {
        this.logger(ele.path, "DEBUG");
        this.load.call(this, ele.path);
        //this.logger("AUTOLOAD : "+ele.name, "DEBUG");
      }
    }

    setKernel(kernel) {
      context.kernel = kernel;
      this.syslog = kernel.syslog;
    }

  }

  nodefony.autoloader = new Autoload();
  return nodefony;
}();
