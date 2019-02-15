/**
 *  The class is a **`slide` CONTROLLER** .
 *  @class default
 *  @constructor
 *  @param {class} container
 *  @param {class} context
 *
 */
module.exports = class socketController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);

  }

  revealAction(eventName, message) {
    switch (eventName) {
      case "connect":
        this.logger('connect');
        break;
      case 'new-subscriber':
        this.context.socket.broadcast.emit('new-subscriber', message);
        break;
      case 'statechanged':
        delete message.state.overview;
        this.context.socket.broadcast.emit('statechanged', message);
        break;
      case 'statechanged-speaker':
        delete message.state.overview;
        this.context.socket.broadcast.emit('statechanged-speaker', message);
        break;
      case "disconnect":
        this.logger('disconnect');
        break;
    }


    /*if (!message) {
      this.context.socket.on('new-subscriber', (data) => {
        //console.log('new-subscriber', data)
        this.context.socket.broadcast.emit('new-subscriber', data);
      });
      this.context.socket.on('statechanged', (data) => {
        //console.log('statechanged', data)
        delete data.state.overview;
        this.context.socket.broadcast.emit('statechanged', data);
      });
      this.context.socket.on('statechanged-speaker', (data) => {
        //console.log('statechanged-speaker', data)
        delete data.state.overview;
        this.context.socket.broadcast.emit('statechanged-speaker', data);
      });
    }*/

  }

};