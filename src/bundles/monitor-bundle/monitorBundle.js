/**
 *	The class is a **`monitor` BUNDLE** .
 *	@module nodefony-starter
 *	@main nodefony-starter
 *	@class monitorBundle
 *	@constructor
 *	@param {string} name
 *	@param {class} kernel
 *	@param {class} container
 *
 */
module.exports = class monitorBundle  extends nodefony.Bundle {

  constructor (name, kernel, container){
    // Mother Class constructor
    super( name, kernel, container );

  // Load core bundle library
  //this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );

 /*
  *	If you want kernel wait monitor event <<onReady>>
  *
  *      this.waitBundleReady = true ;
  */
  }
};
