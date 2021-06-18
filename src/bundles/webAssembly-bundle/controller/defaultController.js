const binding = require('../build/Release/webAssembly.node');

// npx --node-options=--experimental-wasi-unstable-preview1 --experimental-wasm-bigint nodefony dev
let WASI = null
try{
  const wasi = require('wasi');
  WASI = wasi.WASI;
}catch(e){}

/**
 *	@class defaultController
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/webAssembly")
 */
class defaultController extends nodefony.Controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

/**
 *    @Route ("",
 *      name="route-webAssembly-bundle-webAssembly")
 *    @webpack  webassembly in webpack with wasm-loader
 */
  indexAction() {
    return this.render("webAssembly-bundle::index.html.twig", {
			name: this.bundle.name,
			description: this.bundle.package.description,
      binding: binding.webAssembly()
    });

  }

  /**
   *    @Route ("/wasi",
   *      name="route-wasi-bundle-webAssembly")
   */
    async wasiAction() {
      const sandbox = path.resolve(__dirname, "..", "src", "webassembly");
      const wasmFile = path.resolve(sandbox, "add.wasm");

      const wasi = new WASI({
        args: process.argv,
        env: process.env,
        preopens: {
          '/sandbox': sandbox
        }
      });

      const wasm = await WebAssembly.compile(fs.readFileSync(wasmFile));
      const importObject = { wasi_snapshot_preview1: wasi.wasiImport };
      const instance = await WebAssembly.instantiate(wasm, importObject);

      console.log(instance)
      //wasi.start(instance);
      console.log(instance.exports.add(2, 3));

      return this.render("webAssembly-bundle::index.html.twig", {
  			name: this.bundle.name,
  			description: this.bundle.package.description,
        binding: instance.exports.add(2, 3)
      });

    }
}

module.exports = defaultController;
