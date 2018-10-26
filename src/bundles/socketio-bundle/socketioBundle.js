  /**
   *	The class is a **`socketio` BUNDLE** .
   *	@module nodefony-core
   *	@main nodefony-core
   *	@class socketio-bundle
   *	@constructor
   *	@param {string} name
   *	@param {class} kernel
   *	@param {class} container
   *
   */
  module.exports = class socketioBundle extends nodefony.Bundle {

    constructor(name, kernel, container) {

      // Mother Class constructor
      super(name, kernel, container);

      // Load core bundle library
      this.autoLoader.loadDirectory(path.resolve(this.path, "src"));

      /*
       *	If you want kernel wait socketio event <<onReady>>
       *
       *      this.waitBundleReady = true ;
       */

    }
  };