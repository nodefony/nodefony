import "./debugBar.css";

const listen = function() {
  if (document.addEventListener) {
    return function(event, handler, capture) {
      this.addEventListener(event, handler, capture || false);
      return handler;
    };
  }
  return function(event, handler /*, capture*/ ) {
    this.attachEvent('on' + event, handler);
    return handler;
  };
}();

const trim = function() {
  // inspired  by jquery
  // Used for trimming whitespace
  var trimLeft = /^\s+/;
  var trimRight = /\s+$/;

  if (String.prototype.trim) {
    return function(text) {
      return text === null ?
        "" :
        String.prototype.trim.call(text);
    };
  }
  return function(text) {
    return text === null ?
      "" :
      text.toString().replace(trimLeft, "").replace(trimRight, "");
  };
}();

// HTML5 Storage
const browserStorage = class browserStorage {
  constructor(type) {
    if (type === "local") {
      this.data = window.localStorage;
    } else {
      this.data = window.sessionStorage;
    }
  }

  get(key) {
    var ele = this.data.getItem(key);
    if (ele === "" || ele === null || ele === undefined) {
      return null;
    }
    if (ele && typeof ele === "object") {
      return JSON.parse(ele.value);
    }
    return JSON.parse(ele);
  }

  set(key, value) {
    return this.data.setItem(key, JSON.stringify(value));
  }

  unset(key) {
    return this.data.removeItem(key);
  }

  clear() {
    return this.data.clear();
  }

  each() {
    //TODO
  }
};

// EVENTS LOAD
const load = function() {
  this.debugbar = document.getElementById("nodefony-container");
  this.smallContainer = document.getElementById("nodefony-small");
  this.nodefonyClose = document.getElementById("nodefonyClose");

  let state = this.storage.get("nodefony_debug");
  if (state === false) {
    this.removeClass(this.smallContainer, "hidden");
    this.addClass(this.debugbar, "hidden");
  }

  this.listen(this.nodefonyClose, "click", ( /*event*/ ) =>{
    //var ev = new coreEvent(event);
    this.removeClass(this.smallContainer, "hidden");
    this.addClass(this.debugbar, "hidden");
    this.storage.set("nodefony_debug", false);
    //ev.stopPropagation();
  });

  this.listen(this.smallContainer, "click", ( /*event*/ ) =>{
    //var ev = new coreEvent(event);
    this.removeClass(this.debugbar, "hidden");
    this.addClass(this.smallContainer, "hidden");
    this.storage.set("nodefony_debug", true);
    //ev.stopPropagation();
  });
};


class Nodefony {

  constructor() {
    this.storage = new browserStorage("local");
    if (window.addEventListener) {
      window.addEventListener("load", load.bind(this), false);
    } else {
      window.attachEvent("onload", load.bind(this));
    }
  }

  listen(element, event, handler, capture) {
    if (element) {
      return listen.call(element, event, handler, capture);
    }
  }

  removeClass(element, value) {
    if ((value && typeof value === "string") || value === undefined) {
      let classNames = (value || "").split(/\s+/);
      if (element.nodeType === 1 && element.className) {
        if (value) {
          let className = (" " + element.className + " ").replace(/[\n\t]/g, " ");
          for (let c = 0, cl = classNames.length; c < cl; c++) {
            className = className.replace(" " + classNames[c] + " ", " ");
          }
          element.className = trim(className);
        } else {
          element.className = "";
        }
      }
    }
  }

  addClass(element, value) {
    let classNames = (value || "").split(/\s+/);
    if (element.nodeType === 1) {
      if (!element.className) {
        element.className = value;
      } else {
        let className = " " + element.className + " ",
          setClass = element.className;
        for (let c = 0, cl = classNames.length; c < cl; c++) {
          if (className.indexOf(" " + classNames[c] + " ") < 0) {
            setClass += " " + classNames[c];
          }
        }
        element.className = trim(setClass);
      }
    }
  }

  monitoringWorkbox(registration) {
    let serviceWorker = null;
    switch (true) {
      case !!registration.installing:
        serviceWorker = registration.installing;
        break;
      case !!registration.waiting:
        serviceWorker = registration.waiting;
        break;
      case !!registration.active:
        serviceWorker = registration.active;
        break;
    }
    if (serviceWorker) {
      this.eleWorkbox = document.getElementById("workbox");
      this.separatorWorkbox = document.getElementById("separator-workbox");
      this.versionWorker = document.getElementById("workbox-version");
      this.stateWorker = document.getElementById("workbox-state");

      if (this.eleWorkbox && this.separatorWorkbox) {
        this.removeClass(this.eleWorkbox, 'hidden');
        this.removeClass(this.separatorWorkbox, 'hidden');
      }
      if (this.stateWorker) {
        this.stateWorker.innerHTML = serviceWorker.state;
      }
      if (this.versionWorker) {
        this.versionWorker.innerHTML = "";
      }
      serviceWorker.addEventListener('statechange', (e) => {
        if (this.stateWorker) {
          this.stateWorker.innerHTML = e.target.state;
        }
      });
    }
  }
}

export default new Nodefony();
