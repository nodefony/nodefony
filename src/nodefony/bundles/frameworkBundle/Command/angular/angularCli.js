
const regBundle = /^(.*)[Bb]undle$/;

const intervativeQuestion = function (cli) {
    return [{
        type: 'input',
        name: 'name',
        message: 'Enter Bundle Name',
        validate:  (value) => {
            try {
                cli.cli.blankLine();
                cli.setBundleName(value);
                return true ;
            }catch(e){
                return e.message ;
            }
        }
    },{
        type: 'input',
        name: 'path',
        message: 'Enter Bundle Path',
        validate:  (value) => {
            try {
                cli.cli.blankLine();
                cli.setBundlePath(value);
                return true ;
            }catch(e){
                return e.message ;
            }
        }
    }];
}


let angularCli = class angularCli extends nodefony.Service {

    constructor( cli ){
        super("Angular Cli" , cli.container, cli.notificationsCenter);
        this.cli = cli ;
        this.inquirer = this.cli.inquirer;
        this.ng = this.getNgPath()
        this.tmp = this.setTmpDir( path.resolve( "/", "tmp") ) ;
        this.npm = this.getNpmPath();
        this.setEnv();
        this.bundleName = null ;
        this.bundlePath = null ;
    }

    getNgPath (){
        return path.resolve ( process.cwd(), "node_modules", ".bin", "ng" ) ;
    }
    getNpmPath (){
        return path.resolve ( process.cwd(), "node_modules", ".bin", "npm" ) ;
    }

    setBundleName (name){
        let realName = null ;
        let res = regBundle.exec(name);
        if ( res ){
            this.bundleName = res[1] ;
        }else{
            throw new Error("Bad bundle name :" + name);
        }
        return this.bundleName ;
    }

    setBundlePath (Path){
        this.bundlePath =  path.resolve( this.kernel.rootDir ,  path.resolve(Path)  );
        return this.bundlePath ;
    }

    setTmpDir (Path){
        return Path ;
    }

    setEnv(){
        process.env.NODE_ENV = "development";
    }

    generateProject (name, Path, interactive){
        let project = null ;
        this.interactive =  interactive ;
        if ( this.interactive ){
            project = this.generateInteractive();
        }else{
            this.bundleName = this.setBundleName( name ) ;
            this.bundlePath = this.setBundlePath( Path ) ;
            this.cwd = path.resolve( this.bundlePath, name);
            this.logger("GENERATE Angular Bundle : " + this.bundleName +" LOCATION : " +  this.bundlePath);
            project = new Promise ( (resolve, reject) => {
                return resolve ( [] );
            });
        }
        return project
        .then( (ele) => {
            return this.generateNgNew(ele);
        })
        .then( (dir) => {
            return this.npmInstall(dir);
        })
        .then( (dir) => {
            return this.npmInstall(dir, "@ngtools/webpack");
        })
        .then( (dir) => {
            return this.generateNgModule(dir);
        } )
        .then( (dir) => {
            return this.ejectNg(dir);
        } )
        .then( (dir) => {
            return this.npmInstall(dir);
        })
        .then( (dir) => {
          return  {
            name:name,
            path:Path
          };
        });
    }

    generateInteractive(){
        this.logger("Interactive Mode");
        return  this.inquirer.prompt( intervativeQuestion(this) );
    }

    moveToRealPath (){
      return shell.mv(path.resolve( this.tmp ,this.bundleName+"Bundle"), this.bundlePath );
    }

    cleanTmp (){
        try {
            let tmpDir = path.resolve( this.tmp, this.bundleName+"bundle" ) ;
            this.cli.existsSync( tmpDir );
            try {
                shell.rm('-rf', tmpDir);
            }catch(e){
                this.logger(e,"ERROR");
                throw e ;
            }
        }catch(e){
            return ;
        }
    }

    generateNgNew( argv ){
        return new Promise ( (resolve, reject) => {
            let args = ['new', '-v', '-sg', this.bundleName+"Bundle"] ;
            this.logger ("install angular cli : ng "+ args.join(" ") );
            let cmd = null ;
            try{
                cmd = this.cli.spawn(this.ng, args, {
                    cwd:this.tmp,
                }, ( code ) => {
                    if ( code === 1 ){
                        this.cleanTmp();
                        return reject( new Error ("install angular cli  ng new error : " +code) );
                    }
                    return resolve( path.resolve( this.tmp, this.bundleName+"Bundle" ) );
                });
            }catch(e){
                this.logger("ng new ","ERROR");
                this.cleanTmp();
                return reject(e);
            }
        });
    }

    generateNgModule( dir ){
        return new Promise ( (resolve, reject) => {
            let args = ['generate', 'module', '--spec', '--routing', '-m', 'app', this.bundleName ];
            this.logger (" Generate Angular module : ng " + args.join(" ") + " in " + dir );
            let cmd = null ;
            try {
                cmd = this.cli.spawn(this.ng, args, {
                    cwd: dir
                }, ( code ) => {
                    if (code === 1 ){
                        this.cleanTmp();
                        return reject( new Error ("ng generate module error code : " +code) );
                    }
                    return resolve(dir);
                });
            }catch(e){
                this.cleanTmp();
                this.logger("ng generate module ","ERROR");
                return reject(e);
            }
        });
    }

    ejectNg(dir){
        return new Promise ( (resolve, reject) => {
            let args = ["eject", "--environment", "dev", "-dev"] ;
            this.logger (" eject  webpack config angular : ng " + args.join(" "));
            let cmd = null ;
            try{
                cmd = this.cli.spawn(this.ng, args, {
                    cwd: dir
                } ,(code) => {
                    if ( code === 1 ){
                        this.cleanTmp();
                        return reject( new Error ("ng eject error : " +code) ) ;
                    }
                    try {
                        this.moveToRealPath();
                    }catch(e){
                        this.cleanTmp();
                        return reject( e ) ;
                    }
                    return resolve( path.resolve( this.bundlePath , this.bundleName+"Bundle" ));
                });
            }catch(e){
                this.cleanTmp();
                this.logger("ng eject ","ERROR");
                return reject(e);
            }
        });
    }

    npmInstall (cwd , argv){
        return new Promise ( (resolve, reject) => {
            let tab = ["install"] ;
            if ( argv ){
                tab = tab.concat(argv) ;
            }
            let cmd = null ;
            try {
              this.logger("npm install in " + cwd );
              cmd = this.cli.spawn("npm", tab, {
                  cwd:cwd
              } , (code) => {
                  if ( code === 1 ){
                      this.cleanTmp();
                      return reject (  new Error ("nmp install error : " +code) );
                  }
                  return resolve(cwd);
              });
            }catch(e){
              this.cleanTmp();
              this.logger("npm install ","ERROR");
              return reject(e);
            }
        });
    }
};

module.exports = angularCli ;
