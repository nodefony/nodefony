/**
 *	The class is a **`webAssembly` BUNDLE** .
 *	@module nodefony-dev
 *	@main nodefony-dev
 *	@class webAssemblyBundle
 *	@constructor
 *	@param {string} name
 *	@param {class} kernel
 *	@param {class} container
 *
 */
 
 class webAssemblyBundle  extends nodefony.Bundle {

  constructor (name, kernel, container){
    // Mother Class constructor
    super( name, kernel, container );

  // Load core bundle library
  //this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );

 /*
  *	If you want kernel wait webAssembly event <<onReady>>
  *
  *      this.waitBundleReady = true ;
  */
  }
}

module.exports = webAssemblyBundle ;
