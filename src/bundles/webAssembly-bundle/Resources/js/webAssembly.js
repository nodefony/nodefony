/*
 *
 *	ENTRY POINT
 *  WEBPACK bundle webAssembly-bundle
 *  client side
 */
import "../css/webAssembly.css";


//import WebAssembly from "webassemblyjs";
//console.log(WebAssembly)

import wasm from "../../src/webassembly/add.wasm";

/*
 *	Class Bundle App
 */
class Webassembly {

  constructor() {
    //WebAssembly.instantiate(wasm)
    this.createInstance();
  }

  createInstance() {
    return wasm()
      .then((result) => {
        console.log(result);
        console.log(result.instance.exports.add(16, 2000));
        this.add = result.instance.exports.add;
      }).catch(e => {
        console.error(e);
      })
  }

}

/*
 * HMR
 */
if (module.hot) {
  module.hot.accept((err) => {
    if (err) {
      console.error('Cannot apply HMR update.', err);
    }
  });
}
export default new Webassembly();
