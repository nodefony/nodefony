!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.test=e():t.test=e()}(window,function(){return function(t){var e={};function n(i){if(e[i])return e[i].exports;var r=e[i]={i:i,l:!1,exports:{}};return t[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=t,n.c=e,n.d=function(t,e,i){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)n.d(i,r,function(e){return t[e]}.bind(null,r));return i},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="test-bundle/assets/",n(n.s=3)}([,function(t,e,n){},function(t,e,n){"use strict";var i,r,o,s=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}();n(1),t.exports=(i=i||webkitSpeechRecognition,r=r||webkitSpeechGrammarList,o=o||webkitSpeechRecognitionEvent,new(function(){function t(){var e=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),$(document).ready(function(){e.speakToText(),e.textToSpeak($("#version").html().replace(/^\s*|\s*$/g,""))})}return s(t,[{key:"speakToText",value:function(){this.recognizing=null,this.recognition=new i,this.recognition.continuous=!0,this.recognition.interim=!0,this.button=$("#button").get(0),$("#button").on("click",this.toggleStartStop.bind(this)),this.final_span=$("#final_span").get(0),this.interim_span=$("#interim_span").get(0),this.reset(),this.recognition.onend=this.reset.bind(this),this.recognition.onresult=this.onresult.bind(this)}},{key:"textToSpeak",value:function(t){this.SpeechSynthesisUtterance=new SpeechSynthesisUtterance,this.SpeechSynthesisUtterance.text=t,this.SpeechSynthesisUtterance.lang="fr-FR",this.SpeechSynthesisUtterance.rate=1.2,this.speechSynthesis=speechSynthesis,this.speechSynthesis.speak(this.SpeechSynthesisUtterance)}},{key:"onresult",value:function(t){for(var e="",n="",i=0;i<t.results.length;++i)t.results[i].final?e+=t.results[i][0].transcript:n+=t.results[i][0].transcript;this.final_span.innerHTML=e,this.interim_span.innerHTML=n}},{key:"reset",value:function(){this.recognizing=!1,this.button.innerHTML="Click to Speak"}},{key:"toggleStartStop",value:function(){this.recognizing?(this.recognition.stop(),this.reset()):(this.recognition.start(),this.recognizing=!0,this.button.innerHTML="Click to Stop",this.final_span.innerHTML="",this.interim_span.innerHTML="")}}]),t}()))},function(t,e,n){t.exports=n(2)}])});