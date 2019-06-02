/*
 *  ENTRY POINT FRAMEWORK APP KERNEL
 */
"use strict;";
module.exports = class appKernel extends nodefony.kernel {
  constructor(environment, cli, settings) {
    // kernel constructor
    try {
      super(environment, cli, settings);

      {% if addons.workbox %}this.on("onServeStatic", (res, path, name) => {
				if (name === "web" && path.match(/.*service-worker.js$/)){
					res.setHeader('Service-Worker-Allowed', '/');
				}
			});
      {% endif %}
    } catch (e) {
      throw e;
    }
  }
};
