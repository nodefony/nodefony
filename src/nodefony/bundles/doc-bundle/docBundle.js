/**
 *	The class is a **`doc` BUNDLE** .
 *	@module nodefony-core
 *	@main nodefony-core
 *	@class docBundle
 *	@constructor
 *	@param {string} name
 *	@param {class} kernel
 *	@param {class} container
 *
 */

class docBundle extends nodefony.Bundle {

  constructor(name, kernel, container) {
    // Mother Class constructor
    super(name, kernel, container);

    // Load core bundle library
    //this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );

    /*
     *	If you want kernel wait doc event <<onReady>>
     *
     *      this.waitBundleReady = true ;
     */
  }
}

module.exports = docBundle;
