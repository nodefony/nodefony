!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.debugBar=e():t.debugBar=e()}(window,function(){return function(t){var e={};function n(o){if(e[o])return e[o].exports;var r=e[o]={i:o,l:!1,exports:{}};return t[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=t,n.c=e,n.d=function(t,e,o){n.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:o})},n.r=function(t){Object.defineProperty(t,"__esModule",{value:!0})},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}({0:function(t,e,n){"use strict";var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};n(23),t.exports=function(){var t;if(!Function.prototype.bind){var e=(t=Array.prototype.unshift?function(t,e){Array.prototype.unshift.apply(t,e)}:function(t,e){for(var n=e.length;n>0;n--)Array.prototype.splice.call(t,0,0,e[n-1])},function(){var e=this,n=Array.prototype.shift.call(arguments),o=arguments;return function(){return t(arguments,o),e.apply(n,arguments)}});Function.prototype.bind=e}var n,r,i=document.addEventListener?function(t,e,n){return this.addEventListener(t,e,n||!1),e}:function(t,e,n){return this.attachEvent("on"+t,e),e},a=(n=/^\s+/,r=/\s+$/,String.prototype.trim?function(t){return null==t?"":String.prototype.trim.call(t)}:function(t){return null==t?"":t.toString().replace(n,"").replace(r,"")}),s=function(t,e){var n=(e||"").split(/\s+/);if(1===t.nodeType)if(t.className){for(var o=" "+t.className+" ",r=t.className,i=0,s=n.length;i<s;i++)o.indexOf(" "+n[i]+" ")<0&&(r+=" "+n[i]);t.className=a(r)}else t.className=e},u=function(t,e){if(e&&"string"==typeof e||void 0===e){var n=(e||"").split(/\s+/);if(1===t.nodeType&&t.className)if(e){for(var o=(" "+t.className+" ").replace(/[\n\t]/g," "),r=0,i=n.length;r<i;r++)o=o.replace(" "+n[r]+" "," ");t.className=a(o)}else t.className=""}},l=function(t){this.data="local"===t?window.localStorage:window.sessionStorage};l.prototype.get=function(t){var e=this.data.getItem(t);return""===e||null===e||void 0===e?null:e&&"object"===(void 0===e?"undefined":o(e))?JSON.parse(e.value):JSON.parse(e)},l.prototype.set=function(t,e){return this.data.setItem(t,JSON.stringify(e))},l.prototype.unset=function(t){return this.data.removeItem(t)},l.prototype.clear=function(){return this.data.clear()},l.prototype.each=function(){};var c=function(){this.debugbar=document.getElementById("nodefony-container"),this.smallContainer=document.getElementById("nodefony-small"),this.nodefonyClose=document.getElementById("nodefonyClose");var t=new l("local");!1===t.get("nodefony_debug")&&(u(this.smallContainer,"hidden"),s(this.debugbar,"hidden")),this.listen(this.nodefonyClose,"click",function(e){u(this.smallContainer,"hidden"),s(this.debugbar,"hidden"),t.set("nodefony_debug",!1)}.bind(this)),this.listen(this.smallContainer,"click",function(e){u(this.debugbar,"hidden"),s(this.smallContainer,"hidden"),t.set("nodefony_debug",!0)}.bind(this))},d=new function(){this.listen=function(t,e,n,o){if(t)return i.call(t,e,n,o)},window.addEventListener?window.addEventListener("load",c.bind(this),!1):window.attachEvent("onload",c.bind(this))};return window.nodefony=d,d}()},23:function(t,e){}})});