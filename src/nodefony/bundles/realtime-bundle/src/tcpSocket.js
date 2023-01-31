const net = require("net");

const defaultOptions = {
  allowHalfOpen: true,
  // highWaterMark:16384*2
  highWaterMark: 1024 * 64
  // readable: true,
  // writable: true
};

class TcpSocket extends net.Socket {
  constructor (options = null) {
    if (!options) {
      options = defaultOptions;
    } else {
      options = nodefony.extend(true, {}, defaultOptions, options);
    }
    super(options);
    this.idConnection = null;
    this.id = nodefony.generateId();
  }

  setConnection (id) {
    this.idConnection = id;
  }

  toJson () {
    return {
      id: this.id,
      type: "TcpSocket",
      address: this.address()
    };
  }

  connect (port, domain) {
    return new Promise((resolve, reject) => {
      try {
        super.connect(port, domain, () => resolve(this));
      } catch (e) {
        return reject(e);
      }
    });
  }

  send (message) {
    return new Promise((resolve, reject) => {
      try {
        return super.write(message, () => resolve());
      } catch (e) {
        return reject(e);
      }
    });
  }

  close () {
    return new Promise((resolve, reject) => {
      try {
        super.end(() => resolve(this));
      } catch (e) {
        return reject(e);
      }
    });
  }
}
module.exports = TcpSocket;
