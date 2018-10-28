/*
 *
 *	ENTRY POINT WEBPACK BUNLDE
 *
 *
 *  Add your assets here with require  to an integration in webpack  bundle
 *
 *  require('jquery');
 *  require('../css/mycss.css')
 *
 */
require("../css/socketio.css");
const io = require('socket.io-client');

module.exports = function () {

  /*
   *	Class
   *
   *	Namespace socketio client side
   *
   */
  const socketio = class socketio {

    constructor() {
      this.chatSocket = io("/chat", {
        transports: ['websocket'],
        path: '/socket.io'
      });
      this.listen(this.chatSocket);
      this.envetSocket = io("/event", {
        transports: ['websocket'],
        path: '/socket.io'
      });
      this.listen(this.envetSocket);

    }

    listen(socket) {
      socket.on('connect', () => {
        console.log("connect");
      });
      socket.on('event', (data) => {
        console.log(data);
      });
      socket.on('error', (err) => {
        console.log(err);
      });
      socket.on('disconnect', () => {
        console.log("disconnect");
      });

    }

  };

  return new socketio();
}();