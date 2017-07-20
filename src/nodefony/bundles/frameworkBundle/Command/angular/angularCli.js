
const regBundle = /^(.*)[Bb]undle$/;

const intervativeQuestion = [{

}];


let angularCli = class angularCli extends nodefony.Service {

    constructor(name, Path, cli, interactive){
        super("Angular Cli" , cli.container, cli.notificationsCenter);
        this.bundleName = this.setBundleName( name ) ;
        this.bundlePath = this.setBundlePath(Path) ;
        this.interactive =  interactive ;
        this.cli = cli ;
        this.inquirer = this.cli.inquirer;
        this.ng = this.getNgPath()
        this.tmp = this.setTmpDir( path.resolve( "/", "tmp") ) ;
        this.setEnv();
        this.cwd = path.resolve( this.bundlePath, name);
        this.npm = this.getNpmPath();
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
            realName = res[1] ;
        }else{
            throw new Error("Bad bundle name :" + name);
        }
        return realName ;
    }

    setBundlePath (Path){
        return path.resolve( this.kernel.rootDir ,  path.resolve(Path)  );
    }

    setTmpDir (Path){
        return Path ;
    }

    setEnv(){
        process.env.NODE_ENV = "development";
    }

    generateNgProject (name, Path){
        this.logger("GENERATE Angular Bundle : " + this.bundleName +" LOCATION : " +  this.bundlePath);
        let project = null ;
        if ( this.interactive ){
            project = this.generateInteractive();
        }else{
            project = new Promise ( (resolve, reject) => {
                resolve ({})
            });
        }
        return project
        .then( this.generateNgNew() )
        .then( this.npmInstall( path.resolve( this.tmp, this.bundleName+"Bundle") ) )
        //.then( this.generateNgModule() )
        //.then( this.ejectNg() )
        .then( () => {
          resolve( {
            name:name,
            path:Path
          });
        });
    }

    generateInteractive(){
        this.logger("Interactive Mode");
        return new Promise ( (resolve, reject) => {
            return resolve();
        });
    }

    moveToRealPath (){
      return shell.mv(path.resolve ( this.tmp ,this.bundleName+"Bundle"), this.path+"/");
    }

    generateNgNew( argv ){
        return new Promise ( (resolve, reject) => {
            this.logger("ng new");
            try{
                let args = argv || ['new', '-v', '-sg', this.bundleName+"Bundle"] ;
                this.logger ("install angular cli : ng "+ args.join(" ") );
                this.cli.spawn(this.ng, args, {
                    cwd:this.tmp,
                }, ( code ) => {
                    if ( code === 1 ){
                        return reject( new Error ("install angular cli  ng new error : " +code) );
                    }
                    this.moveToRealPath();
                    return resolve();
                });
            }catch(e){
                this.logger("ng new ","ERROR");
                return reject(e);
            }
        });
    }
    generateNgModule(){
        this.logger("ng module");
        return new Promise ( (resolve, reject) => {
            return resolve();

        });
    }

    ejectNg(){
        this.logger("ng eject");
        return new Promise ( (resolve, reject) => {
            return resolve();

        });
    }

    npmInstall (cwd){
        return new Promise ( (resolve, reject) => {
            this.logger("npm install");
            try {
              this.cli.spawn("npm", ["install"], {
                  cwd:cwd
              } , (code) => {
                  if ( code === 1 ){
                      return reject (  new Error ("nmp install error : " +code) );
                  }
                  return resolve(true);
              });
            }catch(e){
              this.logger("npm install ","ERROR");
              return reject(e);
            }
        });
    }
};

module.exports = angularCli ;
