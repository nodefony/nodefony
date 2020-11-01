const dgram = require('dgram');

const defaultOptions = {
  type: 'udp4',
  reuseAddr: true
}

class UdpSocket {
  constructor(options = defaultOptions) {
    this.socket = this.create(options);
  }

  create(options = defaultOptions) {
    return new dgram.createSocket(options);
  }

  bind(port, domain) {
    return new Promise(() => {

    });
  }
}


module.exports = UdpSocket
