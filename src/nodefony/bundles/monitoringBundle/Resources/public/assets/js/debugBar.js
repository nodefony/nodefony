!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.debugBar=t():e.debugBar=t()}(window,function(){return function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:o})},n.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}({0:function(e,t,n){"use strict";var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},r=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}();function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}n(23),e.exports=function(){var e,t=null;Function.prototype.bind||(e=Array.prototype.unshift?function(e,t){Array.prototype.unshift.apply(e,t)}:function(e,t){for(var n=t.length;n>0;n--)Array.prototype.splice.call(e,0,0,t[n-1])},t=function(){var t=this,n=Array.prototype.shift.call(arguments),o=arguments;return function(){return e(arguments,o),t.apply(n,arguments)}},Function.prototype.bind=t);var n,s,a=document.addEventListener?function(e,t,n){return this.addEventListener(e,t,n||!1),t}:function(e,t){return this.attachEvent("on"+e,t),t},l=(n=/^\s+/,s=/\s+$/,String.prototype.trim?function(e){return null===e?"":String.prototype.trim.call(e)}:function(e){return null===e?"":e.toString().replace(n,"").replace(s,"")}),u=function(){function e(t){i(this,e),this.data="local"===t?window.localStorage:window.sessionStorage}return r(e,[{key:"get",value:function(e){var t=this.data.getItem(e);return""===t||null===t||void 0===t?null:t&&"object"===(void 0===t?"undefined":o(t))?JSON.parse(t.value):JSON.parse(t)}},{key:"set",value:function(e,t){return this.data.setItem(e,JSON.stringify(t))}},{key:"unset",value:function(e){return this.data.removeItem(e)}},{key:"clear",value:function(){return this.data.clear()}},{key:"each",value:function(){}}]),e}(),c=function(){this.debugbar=document.getElementById("nodefony-container"),this.smallContainer=document.getElementById("nodefony-small"),this.nodefonyClose=document.getElementById("nodefonyClose"),!1===this.storage.get("nodefony_debug")&&(this.removeClass(this.smallContainer,"hidden"),this.addClass(this.debugbar,"hidden")),this.listen(this.nodefonyClose,"click",function(){this.removeClass(this.smallContainer,"hidden"),this.addClass(this.debugbar,"hidden"),this.storage.set("nodefony_debug",!1)}.bind(this)),this.listen(this.smallContainer,"click",function(){this.removeClass(this.debugbar,"hidden"),this.addClass(this.smallContainer,"hidden"),this.storage.set("nodefony_debug",!0)}.bind(this))},d=new(function(){function e(){i(this,e),this.storage=new u("local"),window.addEventListener?window.addEventListener("load",c.bind(this),!1):window.attachEvent("onload",c.bind(this))}return r(e,[{key:"listen",value:function(e,t,n,o){if(e)return a.call(e,t,n,o)}},{key:"removeClass",value:function(e,t){if(t&&"string"==typeof t||void 0===t){var n=(t||"").split(/\s+/);if(1===e.nodeType&&e.className)if(t){for(var o=(" "+e.className+" ").replace(/[\n\t]/g," "),r=0,i=n.length;r<i;r++)o=o.replace(" "+n[r]+" "," ");e.className=l(o)}else e.className=""}}},{key:"addClass",value:function(e,t){var n=(t||"").split(/\s+/);if(1===e.nodeType)if(e.className){for(var o=" "+e.className+" ",r=e.className,i=0,s=n.length;i<s;i++)o.indexOf(" "+n[i]+" ")<0&&(r+=" "+n[i]);e.className=l(r)}else e.className=t}},{key:"monitoringWorkbox",value:function(e){var t=this,n=null;switch(!0){case!!e.installing:n=e.installing;break;case!!e.waiting:n=e.waiting;break;case!!e.active:n=e.active}n&&(this.eleWorkbox=document.getElementById("workbox"),this.separatorWorkbox=document.getElementById("separator-workbox"),this.versionWorker=document.getElementById("workbox-version"),this.stateWorker=document.getElementById("workbox-state"),this.eleWorkbox&&this.separatorWorkbox&&(this.removeClass(this.eleWorkbox,"hidden"),this.removeClass(this.separatorWorkbox,"hidden")),this.stateWorker&&(this.stateWorker.innerHTML=n.state),this.versionWorker&&(this.versionWorker.innerHTML=""),n.addEventListener("statechange",function(e){t.stateWorker&&(t.stateWorker.innerHTML=e.target.state)}))}}]),e}());return window.nodefony=d,d}()},23:function(e,t){}})});