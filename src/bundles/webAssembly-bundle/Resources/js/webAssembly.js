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
    this.add = null;
    this.createInstance();
    this.createWorker();
  }

  createInstance() {
    return wasm()
      .then((result) => {
        console.log("The Answer to the Webassembly in main ?");
        console.log(result.instance.exports.add(16, 2000));
        this.add = result.instance.exports.add;
      }).catch(e => {
        console.error(e);
      })
  }

  createWorker(){
    const worker = new Worker(new URL('./worker.js', import.meta.url));
    worker.postMessage({
      question:
        'The Answer to the Webassembly worker ?',
    });
    worker.onmessage = ({ data: { answer, map} }) => {
      console.log(answer);
      console.log(map);
    };
    return worker;
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
