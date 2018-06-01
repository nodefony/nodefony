module.exports = class unitTestBundle extends nodefony.Bundle {

  constructor(name, kernel, container) {

    super(name, kernel, container);
    /*
     *	If you want kernel wait unitTestBundle event <<onReady>>
     *
     *      this.waitBundleReady = true ;
     */
  }
};