  /**
   *	The class is a **`redis` BUNDLE** .
   *	@module nodefony-core
   *	@main nodefony-core
   *	@class redis-bundle
   *	@constructor
   *	@param {string} name
   *	@param {class} kernel
   *	@param {class} container
   *
   */
  module.exports = class redisBundle extends nodefony.Bundle {

    constructor(name, kernel, container) {

      // Mother Class constructor
      super(name, kernel, container);

      // Load core bundle library
      //this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );

      /*
       *	If you want kernel wait redis event <<onReady>>
       *
       *      this.waitBundleReady = true ;
       */

    }
  };