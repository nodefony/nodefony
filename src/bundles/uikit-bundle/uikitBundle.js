  /**
   *	The class is a **`uikit` BUNDLE** .
   *	@module nodefony-core
   *	@main nodefony-core
   *	@class uikit-bundle
   *	@constructor
   *	@param {string} name
   *	@param {class} kernel
   *	@param {class} container
   *
   */
  module.exports = class uikitBundle  extends nodefony.Bundle {

  constructor (name, kernel, container){

  // Mother Class constructor
  super( name, kernel, container );

  // Load core bundle library
  //this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );

   /*
   	*	If you want kernel wait uikit event <<onReady>>
   	*
   	*      this.waitBundleReady = true ;
   	*/

  }
  };
