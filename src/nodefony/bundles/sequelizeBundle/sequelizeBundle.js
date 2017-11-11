module.exports = class sequelizeBundle extends nodefony.Bundle {
  constructor(name, kernel, container) {
    super(name, kernel, container);
    // load bundle library
    this.autoLoader.loadDirectory(this.path + "/core");
    /*
     *	If you want kernel wait sequelizeBundle event <<onReady>>
     *
     *      this.waitBundleReady = true ;
     */
    this.waitBundleReady = true;

    let service = this.get("sequelize");
    service.listen(this, "onOrmReady", () => {
      this.fire("onReady", this, service);
    });
  }
};
