const dgram = require('dgram');

const defaultOptions = {
  type: 'udp4',
  reuseAddr: true
}

class UdpSocket extends dgram.Socket {
  constructor(options = null ) {
    if (!options) {
      options = defaultOptions;
    }else{
      options = nodefony.extend(true, {}, defaultOptions, options)
    }
    super(options);
    this.idConnection = null;
    this.id = nodefony.generateId();
  }

  setConnection(id){
    this.idConnection = id;
  }

  toJson(){
    return {
      id : this.id,
      type: "UdpSocket",
      address:this.address()
    }
  }

  /*bind(options) {
    return new Promise((resolve, reject) => {
      try{
        super.bind(options, () =>{
          return resolve(this);
        })
      }catch(e){
        return reject(e);
      }
    });
  }*/

  connect(port, domain) {
    return new Promise((resolve, reject) => {
      try{
        super.connect(port, domain, () => {
          return resolve(this);
        });
      }catch(e){
        return reject(e);
      }
    });
  }

  send(message) {
    return new Promise((resolve, reject)=>{
      try{
        return super.send(message, (error, size)=>{
          if (error){
            return reject(error);
          }
          //return super.send(message, 0, message.length, this.port, this.domain, ()=>{
          return resolve(size);
        });
      }catch(e){
        return reject(e)
      }
    });
  }

  close(){
    return new Promise((resolve, reject)=>{
      try{
        super.close(() =>{
          return resolve(this)
        })
      }catch(e){
        return reject(e);
      }
    })
  }

  destroy(){

  }
}
module.exports = UdpSocket;
