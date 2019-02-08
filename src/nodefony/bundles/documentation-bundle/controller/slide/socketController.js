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

  revealAction(message) {
    this.context.socket.on('new-subscriber', (data) => {
      console.log('new-subscriber', data)
      this.context.socket.broadcast.emit('new-subscriber', data);
    });
    this.context.socket.on('statechanged', (data) => {
      console.log('statechanged', data)
      delete data.state.overview;
      this.context.socket.broadcast.emit('statechanged', data);
    });
    this.context.socket.on('statechanged-speaker', (data) => {
      console.log('statechanged-speaker', data)
      delete data.state.overview;
      this.context.socket.broadcast.emit('statechanged-speaker', data);
    });

  }

};