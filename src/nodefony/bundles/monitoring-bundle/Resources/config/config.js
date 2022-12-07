/**
 *
 *
 *	nodefony-core CONFIG BUNDLE  documentation-bundle
 *
 * ===============================================================================
 *
 *  Copyright © 2018/2022        Camensuli Christophe | ccamensuli@gmail.com
 *
 * ===============================================================================
 *
 *        GENERATE BY nodefony-core BUILDER
 */
const path = require("path")
const serveStatic = require('serve-static');

const setCustomCacheControl = (res, Path) => {
  if (serveStatic.mime.lookup(Path) === 'text/html') {
    // Custom Cache-Control for HTML files
    res.setHeader('Cache-Control', 'public, max-age=0')
    res.setHeader('content-type', 'text/html; charset=UTF-8')
    //res.setHeader('Content-Security-Policy',`frame-src ${kernel.domain}`)
  }
}

module.exports = {
  type: "vue",
  locale: "en_en",
  /**
   *    WATCHERS
   *
   *  watchers Listen to changes, deletion, renaming of files and directories
   *  of different components
   *
   *  For watch all components
   *      watch:                    true
   *  or
   *      watch:{
   *        controller:             true,
   *        config:                 true,        // only routing and services
   *        views:                  true,
   *        translations:           true,
   *        webpack:                true
   *      }
   *
   */
  watch: true,
  /**
   * DEV SERVER
   */
  devServer: {
    hot: true
  },

  /**
   *
   *	Insert here the bundle-specific configurations
   *
   *	You can also override config of another bundle
   *	with the name of the bundle
   *
   */
  debugBar: true,
  forceDebugBarProd: false,
  profiler: {
    active: true,
    storage: 'orm'
  },
  
  swagger: require(path.resolve(__dirname, "..", "swagger", "config.js")),
  graphigl: require(path.resolve(__dirname, "..", "graphiql", "config.js")),

  /* override realtime bundle */
  "http-bundle": {
    statics: {
      vuepress: {
        path: path.resolve(__dirname, "..", "..", "vuepress", "public"),
        options: {
          index: ['index.html'],
          maxAge: 0,
          setHeaders: setCustomCacheControl
        }
      }
    }
  },

  "realtime-bundle": {
    services: {
      monitoring: {
        type: "tcp",
        port: 1318,
        domain: "localhost"
      }
    }
  }
};
