
const vm = require("vm");
const path = require("path");
const Module = require("module");
const fs = require('fs');

module.exports = function(){

  // Create Context copy library in context  see load runInThisContext
  const context = vm.createContext(this);
  context.nodefony = require("./core");
  context.require = require;
  context.module = module ;
  context.exports = exports ;
  context.__dirname = __dirname ;
  context.__filename = __filename ;

  context.path = require("path");
  context.fs = require("fs");
  context.yaml = require("js-yaml");
  context.util = require('util');
  context.cluster = require('cluster');
  context.url = require("url");
  context.xmlParser = require('xml2js').Parser;
  context.dns = require('dns');
  context.async = require('async');
  context.https = require('https');
  context.http = require('http');
  context.nodedomain = require('domain');
  context.WebSocketServer = require('websocket');
  context.Promise = require('promise');
  context.clc = require('cli-color');
  context.shell = require("shelljs");
  context.twig = require("twig");
  context.crypto = require("crypto");
  context.BlueBird = require("bluebird");

  /**
  *  Nodefony autoloader
  *
  * @class autoload
  * @constructor
  * @module NODEFONY
  *
  */
  const regJs = /.*\.js$/;

  const autoload = class autoload {

    constructor() {
      this.versions = this.getVersion();
      this.timeout = 20000 ;
      this.displayError = true ;
      this.syslog = null ;
      this.lineOffset = 10 ;
      this.columnOffset = 10 ;
      this.dirname = path.resolve(  __dirname, ".." );
      try {
        this.load( path.resolve( this.dirname, "core", "container.js") );
        this.load( path.resolve( this.dirname, "core", "notificationsCenter.js") );
        this.load( path.resolve( this.dirname, "core", "syslog.js") );
        this.load( path.resolve( this.dirname, "core", "service.js") );
        this.load( path.resolve( this.dirname, "core", "fileClass.js") );
        this.load( path.resolve( this.dirname, "core", "finder.js") );
        this.load( path.resolve( this.dirname, "core", "reader.js") );
        this.load( path.resolve( this.dirname, "core", "log.js") );
        this.load( path.resolve( this.dirname, "core", "protocol.js") );
        this.load( path.resolve( this.dirname, "core", "watcher.js") );
        this.load( path.resolve( this.dirname, "core", "cli.js") );
        this.loadDirectory( path.resolve( this.dirname, "core", "protocols"), /^tests$/ );
        this.loadDirectory( path.resolve( this.dirname, "kernel"), /^tests$/ );
        this.loadAppKernel();
      }catch(e){
        throw e ;
      }
      this.syslog = null;
      this.setEnv();
    }

    getVersion (){
      return process.versions ;
    }

    isElectron (){
      return this.versions.electron || null ;
    }

    loadAppKernel (){
      let appKernelPath = path.resolve( this.dirname, "..", "..","..", "..", "app", "appKernel.js");
      try {
        let stat = fs.statSync(appKernelPath);
        if (! stat){
          appKernelPath = path.resolve( this.dirname, "..", "..", "app", "appKernel.js");
        }
      }catch(e){
        appKernelPath = path.resolve( this.dirname, "..", "..", "app", "appKernel.js");
      }
      try {
        this.load( appKernelPath );
      }catch(e){
        throw e ;
      }
    }

    createContext (sandbox){
      return  vm.createContext(sandbox);
    }

    setEnv (environment){
      this.environment = environment;
      switch( this.environment ){
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
    load (file, force){
      let filename = null ;
      try {
        filename = Module._resolveFilename(file, module, false);
        let cachedModule = Module._cache[filename];
        if (cachedModule && ! force ) {
          return cachedModule.exports;
        }
        let myModule = new Module(filename, module ) ;
        Module._cache[filename] = myModule;
        myModule.load(filename);
        //this.logger("Autoload file : "+filename, "DEBUG")
        return myModule.exports ;
      }catch(e){
        if ( Module._cache[filename] ){
          delete Module._cache[filename];
        }
        throw e ;
      }
    }

    /**
    * @method logger
    *
    * @param {void} payload payload for log. protocole controle information
    * @param {Number || String} severity severity syslog like.
    * @param {String} msgid informations for message. example(Name of function for debug)
    * @param {String} msg  message to add in log. example (I18N)
    */
    logger (pci, severity, msgid,  msg){
      if (this.syslog){
        if (! msgid){ msgid = "AUTOLOADER  ";}
        return this.syslog.logger(pci, severity , msgid,  msg);
      }
      console.log(pci);
    }

    /**
    * @method loadDirectory
    *
    * @param {String} path Path to directory to autoload
    *
    */
    loadDirectory (path, exclude){
      let finder = null ;
      let settings = {
        path:path,
        onFinish:(error, res) => {
          if (error){ throw error;}
          res.forEach( this.autoloadEach.bind(this));
        }
      };
      if ( exclude ){
        settings.exclude = exclude ;
      }
      if ( nodefony.finder ){
        try {
          finder = new nodefony.finder(settings);
        }catch(e){
          this.logger(e);
          if ( finder ){
            return finder.result ;
          }
          throw e ;
        }
        return finder.result ;
      }
      throw new Error("AUTOLOADER finder not found  Load nodefony finder ");
    }

    autoloadEach (ele){
      if ( regJs.exec(ele.path) ){
        this.load.call(this, ele.path);
        //this.logger("AUTOLOAD : "+ele.name, "DEBUG");
      }
    }

    setKernel (kernel){
      context.kernel = kernel;
      this.syslog = kernel.syslog ;
    }
  };

  nodefony.autoloader = new autoload();
  return nodefony ;
}();
