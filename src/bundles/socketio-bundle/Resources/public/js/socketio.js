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
import "../css/socketio.css";
/*import {
  io
} from 'socket.io-client';*/
const io = require("socket.io-client");
/*
 *	Class
 *
 *	Namespace socketio client side
 *
 */
class Socketio {

  constructor() {
    this.chatSocket = io("/chat", {
      transports: ['websocket'],
      path: '/socket.io'
    });
    this.listen(this.chatSocket);
    this.eventSocket = io("/event", {
      transports: ['websocket'],
      path: '/socket.io'
    });
    this.listen(this.eventSocket);

    this.chatSocket.on('message', (data) => {
      console.log(data);
    });

  }

  listen(socket) {
    socket.on('connect', () => {
      console.log("connect");
    });

    socket.on('error', (err) => {
      console.log(err);
    });
    socket.on('disconnect', () => {
      console.log("disconnect");
    });

  }

}

export default new Socketio();