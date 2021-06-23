import wasm from "../../src/webassembly/add.wasm";


class WorkerAssembly {

  constructor(){
    this.add = null;
    self.onmessage = this.onMessage.bind(this);
    this.createInstance();
  }

  createInstance() {
    return wasm()
      .then((result) => {
        this.add = result.instance.exports.add;
        //self.postMessage(result.instance.exports.add);
      }).catch(e => {
        console.error(e);
      })
  }

  onMessage( message){
    console.log( message.data.question)

    const myMap = new Map();
    myMap.set("add ", this.add(51, 2021));

    self.postMessage({
      answer: ["worker answer", this.add(51, 2000)],
      map: myMap
    });
  }
}

const Worker = new  WorkerAssembly();
