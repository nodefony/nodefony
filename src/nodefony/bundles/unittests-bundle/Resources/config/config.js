module.exports = {
  locale: "en_en",

  /**
   *    WATCHERS
   *
   *  watchers Listen to changes, deletion, renaming of files and directories
   *  of different components
   *
   *  For watch all components
   *      watch:  true
   *  or
   *      watch:{
   *        controller: true
   *        config: true        // only  routing and services
   *        views: true
   *        translations: true
   *        webpack: true
   *      }
   *
   */
  watch: false,

  mocha: {
    nodefony: {
      console: {
        ui: "bdd",
        reporter: "list", // spec | list
        timeout: 20000
      }
    }
  }

};
