module.exports = nodefony.registerBundle("unitTest", function () {

  const unitTest = class unitTest extends nodefony.Bundle {

    constructor(name, kernel, container) {

      super(name, kernel, container);
      // load bundle library
      //this.autoLoader.loadDirectory(this.path+"/core");
      /*
       *	If you want kernel wait unitTestBundle event <<onReady>>
       *
       *      this.waitBundleReady = true ;
       */
    }
  };
  return unitTest;
});
