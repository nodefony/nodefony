  /**
   *	The class is a **`argon` BUNDLE** .
   *	@module myproject
   *	@main myproject
   *	@class argon-bundle
   *	@constructor
   *	@param {string} name
   *	@param {class} kernel
   *	@param {class} container
   *
   */
  module.exports = class argonBundle  extends nodefony.Bundle {

  constructor (name, kernel, container){

  // Mother Class constructor
  super( name, kernel, container );

  // Load core bundle library
  //this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );

   /*
   	*	If you want kernel wait argon event <<onReady>>
   	*
   	*      this.waitBundleReady = true ;
   	*/

  }
  };
