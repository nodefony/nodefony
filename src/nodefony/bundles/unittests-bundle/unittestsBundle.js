module.exports = class unittestsBundle extends nodefony.Bundle {

  constructor(name, kernel, container) {

    super(name, kernel, container);
    /*
     *	If you want kernel wait unitTestBundle event <<onReady>>
     *
     *      this.waitBundleReady = true ;
     */
  }
};