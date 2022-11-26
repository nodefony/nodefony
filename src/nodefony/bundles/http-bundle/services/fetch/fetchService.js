let Fetch = null
let FetchLibrary = null
const fetchImport = async () => {
  return Fetch = await import('node-fetch')
    .then((esmFS) => {
      FetchLibrary = esmFS
      return esmFS.default
    })
    .catch((e) => {
      throw e
    })
}

module.exports = class fetch extends nodefony.Service {

  constructor(container){
    super("fetch", container)
    this.library = null
    this.fetch = null
    if (this.kernel.ready) {
        this.initialize();
    } else {
      this.kernel.on("onReady", async () => {
        return await this.initialize();
      });
    }
  }

  async initialize(){
    // here lib esm not ready
    await fetchImport()
      .then(()=>{
        // lib esm ready
        this.fetch = Fetch
        this.library = FetchLibrary
      })
      .catch((e) => {
        this.log(e, "WARNING")
      });
  }
}
