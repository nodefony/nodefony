/**
 *  The class is a **`keycloak` BUNDLE** .
 *  @module nodefony-starter
 *  @main nodefony-starter
 *  @class keycloakBundle
 *  @constructor
 *  @param {string} name
 *  @param {class} kernel
 *  @param {class} container
 *
 */

class keycloakBundle extends nodefony.Bundle {
  constructor (name, kernel, container) {
    // Mother Class constructor
    super(name, kernel, container);
    // Load core bundle library
    this.autoLoader.loadDirectory(path.resolve(this.path, "src"));
    // this.autoLoader.loadDirectory( path.resolve( this.path, "src" ) );
  }
}

module.exports = keycloakBundle;
