/**
 *	The class is a **`test` BUNDLE** .
 *	@module nodefony
 *	@main nodefony
 *	@class testBundle
 *	@constructor
 *	@param {class} kernel
 *	@param {class} container
 *
 */
module.exports = class testBundle extends nodefony.Bundle {

  constructor(name, kernel, container) {

    // Mother Class constructor
    super(name, kernel, container);

    // Load core bundle library
    this.autoLoader.loadDirectory(this.path + "/core");


    /*
     *	If you want kernel wait testBundle event <<onReady>>
     *
     *      this.waitBundleReady = true ;
     */

  }
};
