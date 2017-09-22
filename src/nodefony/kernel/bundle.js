
const semver = require('semver');

module.exports = nodefony.register("Bundle", function(){

    const regBundle = /^(.*)[Bb]undle$/;
    const regFixtures = /^(.+)Fixtures.js$/;
    const regController = /^(.+)Controller.js$/;
    const regService = /^(.+)Service.js$/;
    const regCommand = /^(.+)Command.js$/;
    const regEntity = /^(.+)Entity.js$/;
    const regI18nFile =/^(.*)\.(.._..)\.(.*)$/;
    const regConfigFile = /^routing\..*$/;

    const checkIngnoreFile = function(string, basename){
        let file = null;
        try{
            file = new nodefony.fileClass(string);
        }catch(e){
            if ( basename.match(/^\./) ){
                return true ;
            }
            return false ;
        }
        if ( basename.match(/^\./) ){
            return true ;
        }
        if ( file.type === "Directory" ){
            return "Directory" ;
        }
        return false;
    };


    const recObj = class recObj {
            constructor(container){
                this.container = container || {};
                this.checked = {};
            }
            isChecked(ele){
                if (ele in this.checked){
                    return true ;
                }
                return false;
            }
            setChecked(ele){
                this.checked[ele] = true ;
            }
            set(ele, val){
                return this.container[ele] = val ;
            }
            get(ele){
                return this.container[ele] ;
            }
            length(){
                return Object.keys(this.container).length ;
            }
    };
    const recursiveFindRequire = function(files, reg, Path, obj){
        if ( ! obj ){
            obj = new recObj();
        }
        files.forEach((ele) => {
            //this.logger('Search Require in  :' + ele.name );
            if ( ele.type === "Directory" ){
                return ;
            }
            let parse = null;
            if (typeof Path === "string"){
                parse = path.parse(Path);
            }else{
                parse = Path;
            }
            ele.matchName(reg);
            let regRequire = new RegExp("require\\(\\s*[\"'][./]*/"+parse.base+"[\"']\\s*\\)");
            if (ele.match){
                // case controller
                if( ele.content().match( new RegExp(regRequire) ) ){
                    if (  obj.get( ele.match[1] ) ){
                        return;
                    }
                    obj.set( ele.match[1] , {
                        name:ele.match[1],
                        path:ele.path,
                    });
                }
                return;
            }else{
                //simple file
                let newParse = path.parse(ele.path) ;
                if ( parse.base !== newParse.base ){
                    obj.setChecked( ele.path) ;
                    return ;
                }
                if (  ! obj.isChecked(ele.path) ){
                    this.loadFile( ele.path , true);
                    this.logger("loadFile :" + ele.name);
                    if( ele.content().match( new RegExp(regRequire) ) ){
                        obj.setChecked( ele.path) ;
                        return recursiveFindRequire.call(this, files, reg, newParse, obj );
                    }
                    return;
                }
                return;
            }
        });
        return obj;
    };

    const defaultWatcher = function ( reg /*, settings*/){
        return {
            ignoreInitial: true,
            ignored: [
                (string)  => {
                    let basename = path.basename(string) ;
                    let file = checkIngnoreFile( string , basename);
                    if ( file === true  ){
                        return true ;
                    }
                    if ( file === "Directory" ){
                        return false ;
                    }
                    if ( basename.match(reg) ){
                        return false ;
                    }
                    return true ;
                }
            ],
            cwd:this.path
        } ;
    };

    /*
    *  BUNDLE CLASS
    */
    const Bundle = class Bundle extends nodefony.Service {

        constructor (name , kernel , container){
            super( name, container );
            this.logger("\x1b[36m REGISTER BUNDLE : "+this.name+"   \x1b[0m","DEBUG",this.kernel.cli.clc.magenta("KERNEL") );
            this.bundleName = path.basename(this.path);
            this.publicPath = path.resolve( this.path, "Resources", "public");
            this.environment = this.kernel.environment;
            this.waitBundleReady = false ;
            this.locale = this.kernel.settings.system.locale ;
            this.setParameters("bundles."+this.name, this.getParameters("bundles."+this.name) || {} );
            try {
                this.finder = new nodefony.finder( {
                    path:this.path,
                    exclude:/^tests$|^public$|^node_modules$/,
                });
            }catch(e){
                this.logger(e, "ERROR");
            }
            this.sockjs =  this.get("sockjs") ;
            this.translation = this.get("translation");
            this.reader = this.kernel.reader;
            // webpack
            this.webPackConfig = null ;
            this.webpackWatch = false ;
            // controllers
            this.controllersPath = path.resolve( this.path, "controller") ;
            this.findControllerFiles();
            this.controllers = {};
            this.watcherController = null ;
            this.regController = regController;
            // views
            this.serviceTemplate = this.get("templating") ;
            this.regTemplateExt = new RegExp("^(.+)\."+this.serviceTemplate.extention+"$");
            this.viewsPath = path.resolve( this.path, "Resources", "views") ;
            this.viewFiles = this.findViewFiles(this.finder.result);
            this.views = {};
            this.views["."] = {};
            this.watcherView = null ;
            // config
            this.regConfigFile = regConfigFile ;
            this.configPath = path.resolve( this.path, "Resources", "config");
            // others
            this.entities = {};
            this.fixtures = {};
            try {
                this.resourcesFiles = this.finder.result.findByNode("Resources") ;
            }catch(e){
                console.trace(e);
                this.logger("Bundle " + this.name +" Resources directory not found", "WARNING");
            }
            // I18n
            this.i18nPath = path.resolve( this.path, "Resources", "translations");
            this.i18nFiles = this.findI18nFiles( this.resourcesFiles);
            this.watcherI18n = null;
            this.regI18nFile = regI18nFile;
            // Register Service
            this.registerServices();
            // read config files
            this.kernel.readConfig.call(this, null, this.resourcesFiles.findByNode("config") ,(result) => {
                this.parseConfig(result);
            });
            // WEBPACK SERVICE
            this.webpackService = this.get("webpack");
            this.webpackCompiler = null ;
            this.kernel.on("onBoot", () =>{
                // WATCHERS
                if ( this.kernel.environment === "dev" && this.settings.watch && this.kernel.type !== "CONSOLE" ){
                    this.initWatchers();
                }
                // WEBPACK
                if( this.kernel.type !== "CONSOLE" || ( process.argv[2] && process.argv[2] === "webpack:dump" ) ){
                    try {
                        this.findWebPackConfig();
                    }catch(e){
                        this.logger(e, "ERROR");
                        throw e;
                    }
                }
            });
            this.fire( "onRegister", this);
        }

        initWatchers(){
            if ( ! this.settings.watch ){
                return ;
            }
            let controllers = false ;
            let views = false ;
            let i18n = false ;
            let config = false ;
            try {
                switch ( typeof this.settings.watch   ){
                    case "object":
                    controllers = this.settings.watch.controllers || false ;
                    views = this.settings.watch.views || false ;
                    i18n = this.settings.watch.translations || false ;
                    config = this.settings.watch.config || false ;
                    this.webpackWatch = this.settings.watch.webpack || false ;
                    break;
                    case "boolean":
                    controllers = this.settings.watch || false ;
                    views = this.settings.watch  || false ;
                    i18n = this.settings.watch  || false ;
                    config = this.settings.watch || false ;
                    this.webpackWatch = this.settings.watch || false ;
                    break;
                    default:
                    this.logger("BAD CONFIG WATCHER  " ,"WARNING");
                    return ;
                }
                // controllers
                if ( controllers ){
                    let regJs = new RegExp(".*\.js$|.*\.es6$|.*\.es7$");
                    this.watcherController = new nodefony.kernelWatcher(this.controllersPath, defaultWatcher.call(this, regJs), this);
                    this.watcherController.setSockjsServer( this.sockjs );
                    this.watcherController.listenWatcherController();
                    this.kernel.on("onTerminate", () => {
                        this.logger("Watching Ended : " + this.watcherController.path, "INFO");
                        this.watcherController.close();
                    });
                }
                // views
                if ( views ){
                    this.watcherView = new nodefony.kernelWatcher( this.viewsPath, defaultWatcher.call(this, this.regTemplateExt), this);
                    this.watcherView.listenWatcherView();
                    this.watcherView.setSockjsServer( this.sockjs );
                    this.kernel.on("onTerminate", () => {
                        this.logger("Watching Ended : " + this.watcherView.path, "INFO");
                        this.watcherView.close();
                    });
                }
                // I18n
                if ( i18n ){
                    this.watcherI18n = new nodefony.kernelWatcher( this.i18nPath, defaultWatcher.call(this, regI18nFile), this);
                    this.watcherI18n.listenWatcherI18n();
                    this.watcherI18n.setSockjsServer( this.sockjs );
                    this.kernel.on("onTerminate", () => {
                        this.logger("Watching Ended : " + this.watcherI18n.path, "INFO");
                        this.watcherI18n.close();
                    });
                }
                // config
                if ( config ){
                    this.watcherConfig = new nodefony.kernelWatcher( this.configPath, defaultWatcher.call(this, regConfigFile), this);
                    this.watcherConfig.listenWatcherConfig();
                    this.kernel.on("onTerminate", () => {
                        this.logger("Watching Ended : " + this.watcherConfig.path, "INFO");
                        this.watcherConfig.close();
                    });
                }
                //entities

            }catch(e){
                throw e ;
            }
        }

        parseConfig (result){
            if (result){
                let config = null ;
                for (let ele in result){
                    let ext = null ;
                    switch (true){
                        case regBundle.test(ele) :
                        let name = regBundle.exec(ele);
                        config = this.getParameters("bundles."+name[1]);
                        if ( config ){
                            ext = nodefony.extend(true, {}, config , result[ele]);
                            this.logger("\x1b[32m OVERRIDING\x1b[0m  CONFIG bundle  : "+name[1]  ,"WARNING");
                        }else{
                            ext = result[ele] ;
                            this.logger("\x1b[32m OVERRIDING\x1b[0m  CONFIG bundle  : "+name[1] + " BUT BUNDLE "+ name[1] +" NOT YET REGISTERED "  ,"WARNING");
                        }
                        if ( this.kernel.bundles[name[1]] ){
                            this.kernel.bundles[name[1]].settings = ext ;
                            this.setParameters("bundles."+name[1], this.kernel.bundles[name[1]].settings);
                        }else{
                            this.setParameters("bundles."+name[1], ext || {});
                        }
                        break;
                        case /^version$/.test(ele) :
                        try {
                            let res = semver.valid(result[ele]);
                            if ( ! res ){
                                this.logger("Bad Bundle Semantic Versioning  : "+ result[ele] +" Check  http://semver.org " , "WARNING");
                            }
                        }catch(e){
                            this.logger(e , "ERROR");
                        }
                        break;
                        case /^locale$/.test(ele) :
                        if ( result[ele] ){
                            this.locale = result[ele] ;
                        }
                        break;
                        // deprecated
                        case /^webpack$/.test(ele) :
                        try {
                            this.webPackConfig = result[ele] || null ;
                            if ( this.webPackConfig ){
                                this.kernel.listen(this, "onPostRegister", () => {
                                    if (  this.webpackService ){
                                        this.webpackCompiler = this.webpackService.loadConfig( this.webPackConfig ,this.path);
                                    }
                                });
                            }
                        }catch(e){
                            throw  e ;
                        }
                        break;
                    }
                }
                config = this.getParameters("bundles."+this.name);
                if ( config && Object.keys(config).length ){
                    this.logger("\x1b[32m BUNDLE IS ALREADY OVERRIDING BY AN OTHERONE  INVERT\x1b[0m  CONFIG  "+ util.inspect(config)  ,"WARNING");
                    this.settings = nodefony.extend(true, {}, result, config );
                    this.setParameters("bundles."+this.name, this.settings);
                }else{
                    this.settings = result ;
                    this.setParameters("bundles."+this.name, this.settings);
                }
                if (! this.settings.version){
                    this.settings.version = this.kernel.version;
                }
            }
        }

        logger (pci, severity, msgid,  msg){
            if (! msgid) { msgid = "BUNDLE "+this.name.toUpperCase(); }
            return this.syslog.logger(pci, severity, msgid,  msg);
        }

        loadFile (Path, force){
            try {
                return  this.autoLoader.load(Path, force);
            }catch(e){
                this.logger(e, "ERROR");
                throw e ;
            }
        }

        boot (){
            this.fire("onBoot",this);
            try {
                // Register Controller
                this.registerControllers(this.controllerFiles);
                // Register Views
                this.registerViews();
                // Register internationalisation
                if ( this.translation ){
                    this.locale = this.translation.defaultLocal;
                }
                this.registerI18n(this.locale);
                // Register Entity
                this.registerEntities();
                // Register Fixtures
                if ( this.kernel.type === "CONSOLE" ){
                    this.registerFixtures();
                }
            }catch(e){
                throw e ;
            }
            if ( this.waitBundleReady === false ){
                this.fire("onReady",this);
            }
        }

        getName (){
            return this.name;
        }

        getController (name){
            return this.controllers[name];
        }

        compileWebpack (){
            if ( this.webpackCompiler ){
                try {
                    return this.webpackService.runCompiler( this.webpackCompiler, this.name, this.name, this.webpackCompile.name);
                }catch(e){
                    throw e ;
                }
            }
            if ( this.webpackCompilerFile ){
                try {
                    return this.webpackService.runCompiler( this.webpackCompilerFile, this.name+"_"+this.webpackCompilerFile.name, this.name, this.webpackCompilerFile.name);
                }catch(e){
                    throw e ;
                }
            }
        }

        registerServices (){
            // find  controler files
            let services = this.finder.result.findByNode("services");
            services.forEach((ele) => {
                let res = regService.exec( ele.name );
                if ( res ){
                    //let name = res[1] ;
                    let Class = this.loadFile( ele.path );
                    if (typeof Class === "function" ){
                        Class.prototype.bundle = this ;
                        this.logger("Register Service : "+res[0] , "DEBUG");
                    }else{
                        this.logger("Bundle Register Service : "+ ele.path +"  error Service bad format " +typeof Class, "ERROR");
                    }
                }
            });
        }

        findWebPackConfig (){
            let res = null ;
            switch(this.settings.type){
                case "angular":
                try {
                    res = this.finder.result.getFile("webpack.config.js", true) ;
                    if ( ! res ){
                        throw new Error("Angular bundle no webpack config file : webpack.config.js ");
                    }
                    this.webpackCompilerFile = this.webpackService.loadConfigFile( res, this);
                }catch(e){
                    throw e;
                }
                break;
                case "react":
                let file =null ;
                try {
                    switch (process.env.NODE_ENV){
                        case "development" :
                        file = path.resolve(this.path, "config", "webpack.config.dev.js");
                        break;
                        case "production" :
                        file = path.resolve(this.path, "config", "webpack.config.prod.js");
                        break;
                    }
                    res = new nodefony.fileClass( file );
                    process.env.PUBLIC_URL = path.resolve("/", this.bundleName, "dist");
                    this.webpackCompilerFile = this.webpackService.loadConfigFile( res, this);
                }catch(e){
                    throw e ;
                }
                break;
                default:
                try {
                    res = this.finder.result.getFile("webpack."+this.kernel.environment+".config.js", true) ;
                    if ( ! res ){
                        return ;
                    }
                    this.webpackCompilerFile = this.webpackService.loadConfigFile( res, this);
                }catch(e){
                    throw e ;
                }
            }
        }

        findControllerFiles ( result ){
            if ( ! result ){
                try {
                    this.controllerFiles = new nodefony.finder( {
                        path:this.controllersPath
                    }).result;
                }catch(e){
                    this.logger("Bundle " + this.name +" controller directory not found", "WARNING");
                }
            }else{
                // find  views files
                this.controllerFiles = result.findByNode("controller") ;
            }
            return this.controllerFiles ;
        }

        registerControllers ( result ){
            if ( result ){
                this.controllerFiles = result ;
            }
            if ( this.controllerFiles ){
                this.controllerFiles.forEach((ele) => {
                    let res = this.regController.exec( ele.name );
                    if ( res ){
                        let name = res[1] ;
                        let Class = this.loadFile( ele.path, false);
                        if (typeof Class === "function" ){
                            Class.prototype.name = name;
                            Class.prototype.bundle = this;
                            this.controllers[name] = Class ;
                            this.logger("Register Controller : '"+name+"'" , "DEBUG");
                        }else{
                            this.logger("Bundle "+this.name+" Register Controller : "+name +"  error Controller closure bad format","ERROR");
                            console.trace("Bundle "+this.name+" Register Controller : "+name +"  error Controller closure bad format");
                        }
                    }
                });
            }
        }

        reloadWatcherControleur ( name, Path){
            try {
              if (name === null ){
                let res = recursiveFindRequire.call(this, this.controllerFiles, regController, Path);
                //console.log(res);
                //console.log( res.length() ) ;
                console.log(res.checked);
                if( res.length() ){
                    for (let control in res.container){
                        this.reloadController ( res.container[control].name, res.container[control].path);
                    }
                    for (let file in res.checked){
                        this.loadFile( file, true);
                    }
                }
              }else{
                this.reloadController(name, Path);
              }
            }catch(e){
                throw e ;
            }
        }

        reloadController(name, Path){
            if ( this.controllers[name] ){
                delete this.controllers[name] ;
                this.controllers[name] = null ;
            }
            let Class = this.loadFile( Path, true);
            this.logger("Reload Controller : " + name);
            if (typeof Class === "function" ){
                Class.prototype.name = name;
                Class.prototype.bundle = this;
                this.controllers[name] = Class ;
            }else{
                throw new Error("Reload Controller : "+name +"  error Controller closure bad format ");
            }
            return Class ;
        }

        reloadControllers ( nameC ){
            if ( ! nameC ) { return ; }
            let controller = this.finder.result.findByNode("controller");
            try {
                controller.forEach((ele) => {
                    let res = this.regController.exec( ele.name );
                    if ( res &&  res[1] === nameC ){
                        let name = res[1] ;
                        this.reloadWatcherControleur( name , ele.path );
                        throw "BREAK" ;
                    }
                });
            }catch(e){
                if ( e === "BREAK" ) { return ; }
                throw e ;
            }
        }

        findViewFiles(result){
            let views = null ;
            if ( ! result ){
                try {
                    views = new nodefony.finder( {
                        path:this.viewsPath,
                    }).result;
                }catch(e){
                    this.logger("Bundle " + this.name +" views directory not found", "WARNING");
                }
            }else{
                // find  views files
                views = result.findByNode("views") ;
            }
            return views ;
        }

        compileTemplate (file, basename, name){
            this.serviceTemplate.compile( file, (error, template) => {
                if (error){
                    this.logger(error, "ERROR");
                    return ;
                }
                this.views[basename][name].template = template ;
            });
        }

        setView(file){
            let basename = path.basename(file.dirName);
            let res = null ;
            let name = null ;
            if (basename !== "views"){
                if ( ! this.views[basename] ){
                    this.views[basename] = {};
                }
                res = this.regTemplateExt.exec( file.name );
                if (res){
                    name = res[1];
                    if ( this.views[basename][name] ){
                        delete this.views[basename][name] ;
                    }
                    return this.views[basename][name] = {
                        name:name,
                        basename:basename,
                        file:file,
                        template:null
                    };
                }
            }else{
                basename = ".";
                res = this.regTemplateExt.exec( file.name );
                if (res){
                    name = res[1];
                    if ( this.views[basename][name] ){
                        delete this.views[basename][name] ;
                    }
                    return this.views[basename][name]= {
                        name:name,
                        basename:basename,
                        file:file,
                        template:null
                    };
                }
            }
            return null ;
        }

        recompileTemplate (file){
            try {
                let ele = this.setView(file) ;
                if ( ele && this.kernel.type !== "CONSOLE" ){
                    this.compileTemplate(ele.file, ele.basename, ele.name);
                }
                return ele ;
            }catch(e){
                throw e ;
            }
        }

        registerViews (result){
            let views = null ;
            if ( result ){
                views = this.findViewFiles(result);
            }else{
                views = this.viewFiles ;
            }
            return views.getFiles().forEach((file) => {
                try {
                    let ele = this.recompileTemplate(file) ;
                    if ( ele ){
                        if ( ele.basename === "."){
                            this.logger("Register Template   : '"+this.name+"Bundle:"+""+":"+ele.name + "'", "DEBUG");
                        }else{
                            this.logger("Register Template   : '"+this.name+"Bundle:"+ele.basename+":"+ele.name + "'", "DEBUG");
                        }
                    }
                }catch(e){
                    throw e ;
                }
            });
        }

        getView (viewDirectory, viewName){
            if ( this.views[viewDirectory] ){
                let res = this.regTemplateExt.exec( viewName );
                if (res){
                    let name = res[1];
                    if ( this.views[viewDirectory][name] ){
                        return this.views[viewDirectory][name].file;
                    }
                    throw new Error("Bundle "+ this.name+" directory : "+viewDirectory +" GET view file Name : "+ viewName +" Not Found");
                }else{
                    throw new Error("Bundle "+ this.name+" directory : "+viewDirectory +" GET view file Name : "+ viewName +" Not Found");
                }
            }else{
                throw new Error("Bundle "+ this.name+" GET view directory : "+viewDirectory +" Not Found");
            }
        }

        getTemplate (viewDirectory, viewName){
            if ( this.views[viewDirectory] ){
                let res = this.regTemplateExt.exec( viewName );
                if (res){
                    let name = res[1];
                    if ( this.views[viewDirectory][name] ){
                        return this.views[viewDirectory][name].template;
                    }
                    throw new Error("Bundle "+ this.name+" directory : "+viewDirectory +" GET view file Name : "+ viewName +" Not Found");
                }else{
                    throw new Error("Bundle "+ this.name+" directory : "+viewDirectory +" GET view file Name : "+ viewName +" Not Found");
                }
            }else{
                throw new Error("Bundle "+ this.name+" GET view directory : "+viewDirectory +" Not Found");
            }
        }

        findI18nFiles( result ){
            let i18n = null ;
            if ( ! result ){
                try {
                    i18n = new nodefony.finder( {
                        path:this.i18nPath
                    }).result;
                }catch(e){
                    this.logger("Bundle " + this.name +" I18n directory not found", "WARNING");
                }

            }else{
                // find  i18n files
                i18n = result.findByNode("translations");
            }
            return i18n ;
        }

        getfilesByLocal(locale){
            let reg = new RegExp("^(.*)\.("+locale+")\.(.*)$");
            return this.i18nFiles.match(reg);
        }

        registerI18n (locale, result){
            if (! this.translation ) {
                this.translation = this.get("translation");
                if ( this.translation ){
                    this.locale = this.translation.defaultLocal;
                }else{
                    return ;
                }
            }
            if (result){
                this.i18nFiles = this.findI18nFiles(result) ;
            }
            if (! this.i18nFiles.length() ) { return ; }
            let files = null ;
            if (locale){
                files =this.getfilesByLocal(locale);
            }else{
                files = this.getfilesByLocal( this.translation.defaultLocale );
                if ( ! files.length() ){
                    let bundleLocal = this.getParameters("bundles."+this.name+".locale") ;
                    files = this.getfilesByLocal( bundleLocal || this.translation.defaultLocale );
                    if ( bundleLocal  && ! files.length() ){
                        this.logger( Error("Error Translation file locale: "+bundleLocal+" don't exist"), "WARNING" );
                    }
                }
            }
            files.getFiles().forEach( (file) => {
                let domain = file.match[1] ;
                let Locale = file.match[2] ;
                this.translation.reader(file.path, Locale, domain);
            });
        }

        /*
        *
        *  COMMAND
        *
        */

        registerCommand (store){
            // find i18n files
            this.commandFiles = this.finder.result.findByNode("Command") ;
            let command = null ;
            this.commandFiles.getFiles().forEach( (file) => {
                let res = regCommand.exec( file.name );
                if (res){
                    try{
                        command = this.loadFile( file.path);
                    }catch(e){
                        throw new Error( e + "   FILE COMMAND : "+ file.path);
                    }
                    if (! command ){
                        throw new Error("Command : "+file+" BAD FORMAT");
                    }
                    let name = command.name || res[1] ;
                    if (! name ) { throw new Error("Command : "+name+"BAD FORMAT NANE "); }

                    if ( ! store[this.name] ){
                        store[this.name] = {};
                    }
                    if (command.cli){
                        if ( command.commands ){
                            command.cli.prototype.commands = command.commands ;
                            store[this.name][name] = command.cli ;
                        }else{
                            throw new Error("Command : "+name+"BAD FORMAT commands ");
                        }
                    }else{
                        throw new Error("Command : "+name+" CLI NOT FIND");
                    }
                }
            });
        }

        getPublicDirectory (){
            let res =  null ;
            try {
                res = new nodefony.finder( {
                    path: path.resolve( this.path, "Resources", "public"),
                    exclude: /^docs$|^tests|^node_modules|^assets$/
                });
            }catch(e){
                throw e ;
                //this.logger(e,"ERROR");
            }
            return res.result;
        }

        registerEntities (){
            this.entityFiles = this.finder.result.findByNode("Entity") ;
            if (this.entityFiles.length()){
                this.entityFiles.getFiles().forEach( (file) => {
                    let res = regEntity.exec( file.name );
                    if ( res ){
                        let name = res[1] ;
                        let Class = this.loadFile( file.path);
                        if (typeof Class.entity === "function" ){
                            Class.entity.prototype.bundle = this;
                            this.entities[name] = Class;
                            this.logger("LOAD ENTITY : "+file.name ,"DEBUG");
                        }else{
                            this.logger("Register ENTITY : "+name +"  error ENTITY bad format");
                        }
                    }
                });
            }
        }

        getEntity (name){
            if ( this.entities[name] ){
                return this.entities[name];
            }
            return null ;
        }

        getEntities (){
            if ( this.entities ){
                return this.entities;
            }
            return null;
        }

        registerFixtures (){
            this.fixtureFiles = this.finder.result.findByNode("Fixtures") ;
            if (this.fixtureFiles.length()){
                this.fixtureFiles.getFiles().forEach( (file) => {
                    let res = regFixtures.exec( file.name );
                    if ( res ){
                        let name = res[1];
                        let Class = this.loadFile( file.path);
                        if (typeof Class.fixture === "function" ){
                            Class.fixture.prototype.bundle = this;
                            this.fixtures[name] = Class;
                            this.logger("LOAD FIXTURE : "+file.name ,"DEBUG");
                        }else{
                            this.logger("Register FIXTURE : "+name +"  error FIXTURE bad format");
                        }
                    }
                });
            }
        }

        getFixture (name){
            if ( this.fixtures[name] ){
                return this.fixtures[name];
            }
            return null ;
        }

        getFixtures (){
            if ( this.fixtures ){
                return this.fixtures;
            }
            return null ;
        }
    };

    return Bundle;
});
