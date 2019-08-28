/**
 *	The class is a **`blackdashboard` BUNDLE** .
 *	@module nodefony-core
 *	@main nodefony-core
 *	@class blackdashboardBundle
 *	@constructor
 *	@param {string} name
 *	@param {class} kernel
 *	@param {class} container
 *
 */
module.exports = class blackdashboardvueBundle  extends nodefony.Bundle {

  constructor (name, kernel, container){
    // Mother Class constructor
    super( name, kernel, container );

  // Load core bundle library
  //this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );

 /*
  *	If you want kernel wait blackdashboard event <<onReady>>
  *
  *      this.waitBundleReady = true ;
  */
  }
};
