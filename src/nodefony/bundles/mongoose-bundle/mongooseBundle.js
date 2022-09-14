module.exports = class mongooseBundle extends nodefony.Bundle {

  constructor(name, kernel, container) {

    // Mother Class constructor
    super(name, kernel, container);

    // Load core bundle library
    this.autoLoader.loadDirectory(path.resolve(this.path, "src"));

    /*
     *	If you want kernel wait mongoBundle event <<onReady>>
     *
     *      this.waitBundleReady = true ;
     */
    this.waitBundleReady = true;
  }

  /*boot(){
    return new Promise((resolve, reject)=>{
      try{
        let orm = this.get("mongoose");
        this.logger(`Waiting.... orm connections`,"DEBUG");
        orm.prependOnceListener("onOrmReady", async () => {
          this.fire("onReady", this, orm);
          resolve(await super.boot());
        });
      }catch(e){
        return reject(e);
      }
    });
  }*/

};
