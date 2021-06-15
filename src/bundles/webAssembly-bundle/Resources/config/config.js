/**
*
*
*	nodefony-dev CONFIG BUNDLE  webAssembly-bundle
*
* ===============================================================================
*
*  Copyright © 2018/2021        Camensuli Christophe | ccamensuli@gmail.com
*
* ===============================================================================
*
*        GENERATE BY nodefony-dev BUILDER
*/

module.exports = {
  type        : "sandbox",
  locale      : "en_en",

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
    hot: false
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
