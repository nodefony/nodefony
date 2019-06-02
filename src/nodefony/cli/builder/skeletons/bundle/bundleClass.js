/**
 *	The class is a **`{{name}}` BUNDLE** .
 *	@module {{module}}
 *	@main {{module}}
 *	@class {{bundleName}}
 *	@constructor
 *	@param {string} name
 *	@param {class} kernel
 *	@param {class} container
 *
 */
module.exports = class {{name}}Bundle  extends nodefony.Bundle {

constructor (name, kernel, container){

  // Mother Class constructor
  super( name, kernel, container );

{% if addons.workbox %}
  this.kernel.on("onServeStatic", (res, path, name) => {
    if (name === "web" && path.match(/.*service-worker.js$/)){
      res.setHeader('Service-Worker-Allowed', {% if bundleName == "app" %}`/`{%else%}`/{{shortName}}`{%endif%});
    }
{% endif %}
  });

  // Load core bundle library
  //this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );

 /*
  *	If you want kernel wait {{name}} event <<onReady>>
  *
  *      this.waitBundleReady = true ;
  */

  }
};
