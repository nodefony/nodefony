  /**
   *	The class is a **`mail` BUNDLE** .
   *	@module nodefony-core
   *	@main nodefony-core
   *	@class mail-bundle
   *	@constructor
   *	@param {string} name
   *	@param {class} kernel
   *	@param {class} container
   *
   */
  module.exports = class mailBundle  extends nodefony.Bundle {

  constructor (name, kernel, container){

  // Mother Class constructor
  super( name, kernel, container );

  // Load core bundle library
  //this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );

   /*
   	*	If you want kernel wait mail event <<onReady>>
   	*
   	*      this.waitBundleReady = true ;
   	*/

  }
  };
