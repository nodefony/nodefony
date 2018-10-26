/*
 *
 *	ROUTING BUNDLE socketio-bundle
 *
 * ===============================================================================
 *
 *  Copyright © 2018/2018    admin | admin@nodefony.com
 *
 * ===============================================================================
 *
 *        GENERATE BY nodefony-core BUILDER
 *
 *        nodefony-core ROUTING  socketio-bundle
 */

module.exports = {
  socketio: {
    pattern: "/socket.io",
    defaults: {
      controller: "socketio-bundle:default:index"
    }
  }
};