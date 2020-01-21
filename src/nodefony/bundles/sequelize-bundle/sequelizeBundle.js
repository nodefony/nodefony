module.exports = class sequelizeBundle extends nodefony.Bundle {
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

    this.on("onBoot", async ()=>{
      let service = this.get("sequelize");
      service.on("onOrmReady", () => {
        this.fire("onReady", this, service);
      });
    });

  }
};
