 class sequelizeBundle extends nodefony.Bundle {
  constructor(name, kernel, container) {
    super(name, kernel, container);
    // load bundle library
    this.autoLoader.loadDirectory(this.path + "/src");
    /*
     *	If you want kernel wait sequelizeBundle event <<onReady>>
     *
     *      this.waitBundleReady = true ;
     */
    this.waitBundleReady = true;
  }

  boot(){
    return new Promise((resolve, reject)=>{
      try{
        let orm = this.get("sequelize");
        this.logger(`Waiting.... orm connections`,"DEBUG");
        orm.prependOnceListener("onOrmReady", async () => {
          this.fire("onReady", this, orm);
          resolve(await super.boot());
        });
      }catch(e){
        return reject(e);
      }
    });
  }
}

module.exports = sequelizeBundle ;
