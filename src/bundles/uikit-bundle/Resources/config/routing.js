/*
 *
 *	ROUTING BUNDLE uikit-bundle
 *
 * ===============================================================================
 *
 *  Copyright © 2018/2018    admin | admin@nodefony.com
 *
 * ===============================================================================
 *
 *        GENERATE BY nodefony-core BUILDER
 *
 *        nodefony-core ROUTING  uikit-bundle
 */

module.exports = {
  uikit: {
    pattern: "/uikit",
    defaults: {
      controller: "uikit-bundle:default:index"
    }
  },
  "uikit-documentation": {
    pattern: "/uikit/documentation",
    defaults: {
      controller: "uikit-bundle:default:doc"
    }
  }
};