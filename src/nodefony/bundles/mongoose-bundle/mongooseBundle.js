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

    this.kernel.once("onBoot", async () => {
      let orm = this.get("mongoose");
      orm.once("onOrmReady", () => {
        this.fire("onReady", this, orm);
      });
    });

  }
};