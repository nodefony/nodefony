

	/**
	 *	The class is a **`workbox` BUNDLE** .
	 *	@module nodefony
	 *	@main nodefony
	 *	@class workboxBundle
	 *	@constructor
	 *	@param {string} name
	 *	@param {class} kernel
	 *	@param {class} container
	 *
	 */
	module.exports = class workboxBundle  extends nodefony.Bundle {

		constructor (name, kernel, container){

			// Mother Class constructor
			super( name, kernel, container );

			this.kernel.on("onServeStatic", (res, path, name) => {
				if (name === "web" && path.match(/.*service-worker.js$/)){
					res.setHeader('Service-Worker-Allowed', '/workbox');
				}
			});
			// Load core bundle library
			//this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );

		 /*
		 	*	If you want kernel wait workboxBundle event <<onReady>>
		 	*
		 	*      this.waitBundleReady = true ;
		 	*/

		}
	};
