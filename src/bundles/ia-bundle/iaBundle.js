/**
 *	The class is a **`ia` BUNDLE** .
 *	@module nodefony-core
 *	@main nodefony-core
 *	@class iaBundle
 *	@constructor
 *	@param {string} name
 *	@param {class} kernel
 *	@param {class} container
 *
 */
 
 class iaBundle  extends nodefony.Bundle {

  constructor (name, kernel, container){
    // Mother Class constructor
    super( name, kernel, container );

  // Load core bundle library
  //this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );

 /*
  *	If you want kernel wait ia event <<onReady>>
  *
  *      this.waitBundleReady = true ;
  */
  }
}

module.exports = iaBundle ;
