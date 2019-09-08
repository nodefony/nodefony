/**
 *
 *
 *	nodefony-core CONFIG BUNDLE  blackdashboard-bundle
 *
 * ===============================================================================
 *
 *  Copyright © 2018/2019        Camensuli Christophe | ccamensuli@gmail.com
 *
 * ===============================================================================
 *
 *        GENERATE BY nodefony-core BUILDER
 */

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
   *        controllers:             true,
   *        config:                 true,        // only routing and services
   *        views:                  true,
   *        translations:           true,
   *        webpack:                true
   *      }
   *
   */
  watch: {
    controllers: true,
    views: false,
    webpack: false
  },

  /**
   * DEV SERVER
   */
  devServer: {
    hot: true
  }

  /**
   *
   *	Insert here the bundle-specific configurations
   *
   *	You can also override config of another bundle
   *	with the name of the bundle
   *
   *	example : create an other database connector
   */

};
