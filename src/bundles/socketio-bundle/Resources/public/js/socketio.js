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
      //transports: ['websocket'],
      path: '/socket.io',
      forceNew: true
    });
    this.listen(this.chatSocket);

    this.eventSocket = io("/events", {
      //transports: ['websocket'],
      path: '/socket.io',
      forceNew: true
    });
    this.listen(this.eventSocket);
    this.eventSocket.on('myevent', (data) => {
      console.log(data);
    });
    this.eventSocket.emit("ready", this.eventSocket.nsp, (data) => {
      console.log(data)
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

    setTimeout(() => {
      socket.emit("ready", socket.nsp);
    }, 500);



  }

}

export default new Socketio();