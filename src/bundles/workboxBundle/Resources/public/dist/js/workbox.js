!function(e,o){"object"==typeof exports&&"object"==typeof module?module.exports=o():"function"==typeof define&&define.amd?define([],o):"object"==typeof exports?exports.workbox=o():e.workbox=o()}(window,function(){return function(e){var o={};function r(t){if(o[t])return o[t].exports;var n=o[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,r),n.l=!0,n.exports}return r.m=e,r.c=o,r.d=function(e,o,t){r.o(e,o)||Object.defineProperty(e,o,{configurable:!1,enumerable:!0,get:t})},r.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},r.n=function(e){var o=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(o,"a",o),o},r.o=function(e,o){return Object.prototype.hasOwnProperty.call(e,o)},r.p="/workboxBundle/",r(r.s=1)}([function(e,o,r){r(3),e.exports=new class{constructor(){"serviceWorker"in navigator&&window.addEventListener("load",()=>{this.serviceWorker=navigator.serviceWorker.register("workboxBundle/dist/workers/service-worker.js").then(e=>(console.log("SW registered: ",e),e)).catch(e=>{console.log("SW registration failed: ",e)})})}}},function(e,o,r){e.exports=r(0)},,function(e,o){}])});