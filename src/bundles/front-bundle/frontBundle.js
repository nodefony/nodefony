/**
 *	The class is a **`front` BUNDLE** .
 *	@module paty
 *	@main paty
 *	@class frontBundle
 *	@constructor
 *	@param {string} name
 *	@param {class} kernel
 *	@param {class} container
 *
 */
module.exports = class frontBundle extends nodefony.Bundle {
  constructor (name, kernel, container) {
    // Mother Class constructor
    super(name, kernel, container)

    // Load core bundle library
    // this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );

    /*
  *	If you want kernel wait front event <<onReady>>
  *
  *      this.waitBundleReady = true ;
  */
  }
}
