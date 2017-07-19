
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
        this.generateNgProject();
        this.cwd = path.resolve( this.bundlePath, name)

    }

    getNgPath (){
        return path.resolve ( process.cwd(), "node_modules", ".bin", "ng" ) ;
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

    generateNgProject (){
        this.logger("GENERATE Angular Bundle : " + this.bundleName +" LOCATION : " +  this.bundlePath);
        let project = null ;
        if ( this.interactive ){
            project = this.generateInteractive();
        }else{
            project = new Promise ( (resolve, reject) => {
                return {}
            });
        }
        return project
        .then( this.generateNgNew(this.tmp) )
        .then( this.npmInstall(this.tmp+"/"+this.bundleName+"Bundle") )
        .then( this.generateNgModule() )
        .then( this.ejectNg() )
        .catch((e) => {
            this.logger(e, "ERROR");
            throw e ;
        });
    }

    generateInteractive(){
        this.logger("Interactive Mode");
        return new Promise ( (resolve, reject) => {
            return resolve();
        });
    }

    generateNgNew( cwd, argv ){
        return new Promise ( (resolve, reject) => {
            this.logger("ng new");
            try{
                let args =  ['new', '-v', '-sg', this.bundleName+"Bundle"] ;
                console.log(cwd)
                this.logger ("install angular cli : ng "+ args.join(" ") );
                this.cli.spawn(this.ng, args, {
                    cwd:cwd,
                }, ( code ) => {
                    console.log("pass")
                    if ( code === 1 ){
                        return reject( new Error ("install angular cli  ng new error : " +code) );
                    }
                    return resolve();
                });
            }catch(e){
                return reject (e);
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
        console.log(cwd)
        return new Promise ( (resolve, reject) => {
            this.logger("npm install");
            this.cli.spawn("npm", ["install"], {
                cwd:cwd
            } , (code) => {
                if ( code === 1 ){
                    return reject (  new Error ("nmp install error : " +code) );
                }
                return resolve(true);
            });
        });
    }
};

module.exports = angularCli ;
