const events = require('events');

module.exports = nodefony.register("notificationsCenter", function () {

  const regListenOn = /^on(.*)$/;
  const defaultNbListeners = 20;

  class Notification extends events.EventEmitter {

    constructor(settings, context, nbListener) {
      super();
      this.setMaxListeners(nbListener || defaultNbListeners);
      if (settings) {
        this.settingsToListen(settings, context);
      }
    }
    /**
     *
     *  @method listen
     *
     */
    listen(context, eventName, callback) {
      let event = arguments[1];
      let ContextClosure = this;
      if (typeof (callback) === 'function' || callback instanceof Function) {
        this.addListener(eventName, callback.bind(context));
      }
      return function () {
        Array.prototype.unshift.call(arguments, event);
        return ContextClosure.fire.apply(ContextClosure, arguments);
      };
    }
    /**
     *
     *  @method fire
     *
     */
    fire() {
      try {
        return this.emit.apply(this, arguments);
      } catch (e) {
        throw e;
      }
    }
    /**
     *
     *  @method settingsToListen
     *
     */
    settingsToListen(localSettings, context) {
      for (let i in localSettings) {
        let res = regListenOn.exec(i);
        if (!res) {
          continue;
        }
        this.listen(context || this, res[0], localSettings[i]);
      }
    }
    /**
     *
     *  @method unListen
     *
     */
    unListen() {
      return this.removeListener.apply(this, arguments);
    }
  }
  return {
    notification: Notification,
    create: function (settings, context, nbListener) {
      return new Notification(settings, context, nbListener);
    }
  };
});