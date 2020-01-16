const events = require('events');
const regListenOn = /^on(.*)$/;
const defaultNbListeners = 20;
const _ = require('lodash');

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

  async emitAsync(type, ...args) {
    const handler = _.get(this._events, type);
    if (_.isEmpty(handler) && !_.isFunction(handler)) {
      return false;
    }
    let tab = [];
    if (typeof handler === 'function') {
      tab.push(await Reflect.apply(handler, this, args));
    } else {
      for await (const func of handler) {
        tab.push(await Reflect.apply(func, this, args));
      }
    }
    return tab;
  }

  fireAsync() {
    return this.emitAsync.apply(this, arguments);
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
      if (context) {
        this.listen(context || this, res[0], localSettings[i]);
      }
      this.on(res[0], localSettings[i]);
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

nodefony.Events = Notification;
nodefony.notificationsCenter = {
  notification: Notification,
  create: function (settings, context, nbListener) {
    return new Notification(settings, context, nbListener);
  }
};
module.exports = nodefony.notificationsCenter;