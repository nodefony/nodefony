/**
 *	The class is a **`vault` BUNDLE** .
 *	@module d-lake-si
 *	@main d-lake-si
 *	@class vaultBundle
 *	@constructor
 *	@param {string} name
 *	@param {class} kernel
 *	@param {class} container
 *
 */
module.exports = class vaultBundle extends nodefony.Bundle {

  constructor(name, kernel, container) {
    // Mother Class constructor
    super(name, kernel, container);

    // Load core bundle library
    //this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );

    /*
     *	If you want kernel wait vault event <<onReady>>
     *
     *      this.waitBundleReady = true ;
     */
  }
}
