module.exports = function (nodefony) {

  'use strict';

  const regListenOn = /^on(.*)$/;

  /**
   *      Events
   *
   *      @class Notification
   *      @module library
   *      @param {Object} settings Object to pass to `settingToListen` method
   *      @param {Object} context  to apply `settingToListen`
   *
   *      @example
   *
   *
   */
  class Notification {

    constructor(settings, context) {
      this.events = {};
      this.garbageEvent = {};
      if (settings) {
        this.settingsToListen(settings, context);
      }
    }

    /**
     *
     *      @method listen
     *
     */
    listen(context, eventName, callback) {
      let event = arguments[1];
      let ContextClosure = this;
      if (!this.events[eventName]) {
        this.events[eventName] = [];
        this.garbageEvent[eventName] = [];
      }
      if (typeof callback === 'function') {
        this.garbageEvent[eventName].push(callback);
        this.events[eventName].push(function (args) {
          callback.apply(context, args);
        });
      }
      return function () {
        Array.prototype.unshift.call(arguments, event);
        return ContextClosure.fire.apply(ContextClosure, arguments);
      };
    }

    on(eventName, callback) {
      let event = arguments[1];
      let ContextClosure = this;
      if (!this.events[eventName]) {
        this.events[eventName] = [];
        this.garbageEvent[eventName] = [];
      }
      if (typeof callback === 'function') {
        this.garbageEvent[eventName].push(callback);
        this.events[eventName].push(function (args) {
          callback(args);
        });
      }
      return function () {
        Array.prototype.unshift.call(arguments, event);
        return ContextClosure.fire.apply(ContextClosure, arguments);
      };
    }

    /**
     *
     *      @method clearNotifications
     *
     */
    clearNotifications(eventName) {
      if (eventName) {
        if (this.events[eventName]) {
          while (this.events[eventName].length > 0) {
            this.events[eventName].pop();
            this.garbageEvent[eventName].pop();
          }
          delete this.events[eventName];
          delete this.garbageEvent[eventName];
        }
      } else {
        delete this.events;
        delete this.garbageEvent;
        this.events = {};
        this.garbageEvent = {};
      }
    }

    /**
     *
     *      @method fire
     *
     */
    fire(eventName) {
      let ret = true;
      if (this.events[eventName]) {
        let args = Array.prototype.slice.call(arguments, 1);
        for (let i = 0; i < this.events[eventName].length; i++) {
          try {
            ret = this.events[eventName][i](args);
            if (ret) {
              break;
            }
          } catch (e) {
            console.log(e);
            throw new Error(e);
          }
        }
      }
      return ret;
    }

    /**
     *
     *      @method settingsToListen
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

    unListen(eventName, callback) {
      if (this.events[eventName]) {
        if (callback) {
          for (let i = 0; i < this.garbageEvent[eventName].length; i++) {
            if (this.garbageEvent[eventName][i] === callback) {
              this.events[eventName].splice(i, 1);
              this.garbageEvent[eventName].splice(i, 1);
            }
          }
        } else {
          return this.clearNotifications(eventName);
        }
      } else {
        return this.clearNotifications();
      }
    }
  }

  nodefony.notificationsCenter = {
    notification: Notification,
    create: function (settings, context) {
      return new Notification(settings, context);
    }
  };

  return Notification;
};