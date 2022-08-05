/**
 *
 *
 *	d-lake-si CONFIG BUNDLE  vault-bundle
 *
 * ===============================================================================
 *
 *  Copyright © 2022/2022        admin | admin@nodefony.com
 *
 * ===============================================================================
 *
 *        GENERATE BY d-lake-si BUILDER
 */

module.exports = {
  type: "sandbox",
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
    hot: false
  },

  /**
   *
   *	Insert here the bundle-specific configurations
   *
   *	You can also override config of another bundle
   *	with the name of the bundle
   *
   *	example : create an other database connector
   */
  vault: {
    connect:{
      apiVersion: 'v1', // default
      endpoint: 'http://localhost:8200', // default
      token: 'hvs.RkIXePX5oRXhzNAQ1JO5uqgn',
    },
    config: {
      mount:{
        path: "nodefony",
      },
      auths:{
        approle:{
          mountPoint: 'nodefony-auth',
          roleName: 'nodefony-role',
        }
      },
      policy: {
        name: 'nodefony-policy',
        rules: '{ "path": { "nodefony/data/*": { "policy": "write" } } }',
      },
      secrets: [{
        path: "nodefony/data/databases/connector/nodefony",
        data: {
          username: "root",
          password: "nodefony"
        }
    }]
    }
  }
}
