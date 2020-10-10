var monitoring;monitoring =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../node_modules/@nodefony/stage/dist/stage.min.js":
/*!************************************************************!*\
  !*** ../../node_modules/@nodefony/stage/dist/stage.min.js ***!
  \************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 2:65-79 */
/***/ ((module) => {

/*! For license information please see stage.min.js.LICENSE */
!function(e,t){ true?module.exports=t():0}(window,(function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=7)}([function(e,t,n){(function(t){e.exports=t.$=n(9)}).call(this,n(3))},function(e,t,n){"use strict";var r={generateIdentifier:function(){return Math.random().toString(36).substr(2,10)}};r.localCName=r.generateIdentifier(),r.splitLines=function(e){return e.trim().split("\n").map((function(e){return e.trim()}))},r.splitSections=function(e){return e.split("\nm=").map((function(e,t){return(t>0?"m="+e:e).trim()+"\r\n"}))},r.getDescription=function(e){var t=r.splitSections(e);return t&&t[0]},r.getMediaSections=function(e){var t=r.splitSections(e);return t.shift(),t},r.matchPrefix=function(e,t){return r.splitLines(e).filter((function(e){return 0===e.indexOf(t)}))},r.parseCandidate=function(e){for(var t,n={foundation:(t=0===e.indexOf("a=candidate:")?e.substring(12).split(" "):e.substring(10).split(" "))[0],component:parseInt(t[1],10),protocol:t[2].toLowerCase(),priority:parseInt(t[3],10),ip:t[4],address:t[4],port:parseInt(t[5],10),type:t[7]},r=8;r<t.length;r+=2)switch(t[r]){case"raddr":n.relatedAddress=t[r+1];break;case"rport":n.relatedPort=parseInt(t[r+1],10);break;case"tcptype":n.tcpType=t[r+1];break;case"ufrag":n.ufrag=t[r+1],n.usernameFragment=t[r+1];break;default:n[t[r]]=t[r+1]}return n},r.writeCandidate=function(e){var t=[];t.push(e.foundation),t.push(e.component),t.push(e.protocol.toUpperCase()),t.push(e.priority),t.push(e.address||e.ip),t.push(e.port);var n=e.type;return t.push("typ"),t.push(n),"host"!==n&&e.relatedAddress&&e.relatedPort&&(t.push("raddr"),t.push(e.relatedAddress),t.push("rport"),t.push(e.relatedPort)),e.tcpType&&"tcp"===e.protocol.toLowerCase()&&(t.push("tcptype"),t.push(e.tcpType)),(e.usernameFragment||e.ufrag)&&(t.push("ufrag"),t.push(e.usernameFragment||e.ufrag)),"candidate:"+t.join(" ")},r.parseIceOptions=function(e){return e.substr(14).split(" ")},r.parseRtpMap=function(e){var t=e.substr(9).split(" "),n={payloadType:parseInt(t.shift(),10)};return t=t[0].split("/"),n.name=t[0],n.clockRate=parseInt(t[1],10),n.channels=3===t.length?parseInt(t[2],10):1,n.numChannels=n.channels,n},r.writeRtpMap=function(e){var t=e.payloadType;void 0!==e.preferredPayloadType&&(t=e.preferredPayloadType);var n=e.channels||e.numChannels||1;return"a=rtpmap:"+t+" "+e.name+"/"+e.clockRate+(1!==n?"/"+n:"")+"\r\n"},r.parseExtmap=function(e){var t=e.substr(9).split(" ");return{id:parseInt(t[0],10),direction:t[0].indexOf("/")>0?t[0].split("/")[1]:"sendrecv",uri:t[1]}},r.writeExtmap=function(e){return"a=extmap:"+(e.id||e.preferredId)+(e.direction&&"sendrecv"!==e.direction?"/"+e.direction:"")+" "+e.uri+"\r\n"},r.parseFmtp=function(e){for(var t,n={},r=e.substr(e.indexOf(" ")+1).split(";"),i=0;i<r.length;i++)n[(t=r[i].trim().split("="))[0].trim()]=t[1];return n},r.writeFmtp=function(e){var t="",n=e.payloadType;if(void 0!==e.preferredPayloadType&&(n=e.preferredPayloadType),e.parameters&&Object.keys(e.parameters).length){var r=[];Object.keys(e.parameters).forEach((function(t){e.parameters[t]?r.push(t+"="+e.parameters[t]):r.push(t)})),t+="a=fmtp:"+n+" "+r.join(";")+"\r\n"}return t},r.parseRtcpFb=function(e){var t=e.substr(e.indexOf(" ")+1).split(" ");return{type:t.shift(),parameter:t.join(" ")}},r.writeRtcpFb=function(e){var t="",n=e.payloadType;return void 0!==e.preferredPayloadType&&(n=e.preferredPayloadType),e.rtcpFeedback&&e.rtcpFeedback.length&&e.rtcpFeedback.forEach((function(e){t+="a=rtcp-fb:"+n+" "+e.type+(e.parameter&&e.parameter.length?" "+e.parameter:"")+"\r\n"})),t},r.parseSsrcMedia=function(e){var t=e.indexOf(" "),n={ssrc:parseInt(e.substr(7,t-7),10)},r=e.indexOf(":",t);return r>-1?(n.attribute=e.substr(t+1,r-t-1),n.value=e.substr(r+1)):n.attribute=e.substr(t+1),n},r.parseSsrcGroup=function(e){var t=e.substr(13).split(" ");return{semantics:t.shift(),ssrcs:t.map((function(e){return parseInt(e,10)}))}},r.getMid=function(e){var t=r.matchPrefix(e,"a=mid:")[0];if(t)return t.substr(6)},r.parseFingerprint=function(e){var t=e.substr(14).split(" ");return{algorithm:t[0].toLowerCase(),value:t[1]}},r.getDtlsParameters=function(e,t){return{role:"auto",fingerprints:r.matchPrefix(e+t,"a=fingerprint:").map(r.parseFingerprint)}},r.writeDtlsParameters=function(e,t){var n="a=setup:"+t+"\r\n";return e.fingerprints.forEach((function(e){n+="a=fingerprint:"+e.algorithm+" "+e.value+"\r\n"})),n},r.parseCryptoLine=function(e){var t=e.substr(9).split(" ");return{tag:parseInt(t[0],10),cryptoSuite:t[1],keyParams:t[2],sessionParams:t.slice(3)}},r.writeCryptoLine=function(e){return"a=crypto:"+e.tag+" "+e.cryptoSuite+" "+("object"==typeof e.keyParams?r.writeCryptoKeyParams(e.keyParams):e.keyParams)+(e.sessionParams?" "+e.sessionParams.join(" "):"")+"\r\n"},r.parseCryptoKeyParams=function(e){if(0!==e.indexOf("inline:"))return null;var t=e.substr(7).split("|");return{keyMethod:"inline",keySalt:t[0],lifeTime:t[1],mkiValue:t[2]?t[2].split(":")[0]:void 0,mkiLength:t[2]?t[2].split(":")[1]:void 0}},r.writeCryptoKeyParams=function(e){return e.keyMethod+":"+e.keySalt+(e.lifeTime?"|"+e.lifeTime:"")+(e.mkiValue&&e.mkiLength?"|"+e.mkiValue+":"+e.mkiLength:"")},r.getCryptoParameters=function(e,t){return r.matchPrefix(e+t,"a=crypto:").map(r.parseCryptoLine)},r.getIceParameters=function(e,t){var n=r.matchPrefix(e+t,"a=ice-ufrag:")[0],i=r.matchPrefix(e+t,"a=ice-pwd:")[0];return n&&i?{usernameFragment:n.substr(12),password:i.substr(10)}:null},r.writeIceParameters=function(e){return"a=ice-ufrag:"+e.usernameFragment+"\r\na=ice-pwd:"+e.password+"\r\n"},r.parseRtpParameters=function(e){for(var t={codecs:[],headerExtensions:[],fecMechanisms:[],rtcp:[]},n=r.splitLines(e)[0].split(" "),i=3;i<n.length;i++){var o=n[i],s=r.matchPrefix(e,"a=rtpmap:"+o+" ")[0];if(s){var a=r.parseRtpMap(s),c=r.matchPrefix(e,"a=fmtp:"+o+" ");switch(a.parameters=c.length?r.parseFmtp(c[0]):{},a.rtcpFeedback=r.matchPrefix(e,"a=rtcp-fb:"+o+" ").map(r.parseRtcpFb),t.codecs.push(a),a.name.toUpperCase()){case"RED":case"ULPFEC":t.fecMechanisms.push(a.name.toUpperCase())}}}return r.matchPrefix(e,"a=extmap:").forEach((function(e){t.headerExtensions.push(r.parseExtmap(e))})),t},r.writeRtpDescription=function(e,t){var n="";n+="m="+e+" ",n+=t.codecs.length>0?"9":"0",n+=" UDP/TLS/RTP/SAVPF ",n+=t.codecs.map((function(e){return void 0!==e.preferredPayloadType?e.preferredPayloadType:e.payloadType})).join(" ")+"\r\n",n+="c=IN IP4 0.0.0.0\r\n",n+="a=rtcp:9 IN IP4 0.0.0.0\r\n",t.codecs.forEach((function(e){n+=r.writeRtpMap(e),n+=r.writeFmtp(e),n+=r.writeRtcpFb(e)}));var i=0;return t.codecs.forEach((function(e){e.maxptime>i&&(i=e.maxptime)})),i>0&&(n+="a=maxptime:"+i+"\r\n"),n+="a=rtcp-mux\r\n",t.headerExtensions&&t.headerExtensions.forEach((function(e){n+=r.writeExtmap(e)})),n},r.parseRtpEncodingParameters=function(e){var t,n=[],i=r.parseRtpParameters(e),o=-1!==i.fecMechanisms.indexOf("RED"),s=-1!==i.fecMechanisms.indexOf("ULPFEC"),a=r.matchPrefix(e,"a=ssrc:").map((function(e){return r.parseSsrcMedia(e)})).filter((function(e){return"cname"===e.attribute})),c=a.length>0&&a[0].ssrc,u=r.matchPrefix(e,"a=ssrc-group:FID").map((function(e){return e.substr(17).split(" ").map((function(e){return parseInt(e,10)}))}));u.length>0&&u[0].length>1&&u[0][0]===c&&(t=u[0][1]),i.codecs.forEach((function(e){if("RTX"===e.name.toUpperCase()&&e.parameters.apt){var r={ssrc:c,codecPayloadType:parseInt(e.parameters.apt,10)};c&&t&&(r.rtx={ssrc:t}),n.push(r),o&&((r=JSON.parse(JSON.stringify(r))).fec={ssrc:c,mechanism:s?"red+ulpfec":"red"},n.push(r))}})),0===n.length&&c&&n.push({ssrc:c});var l=r.matchPrefix(e,"b=");return l.length&&(l=0===l[0].indexOf("b=TIAS:")?parseInt(l[0].substr(7),10):0===l[0].indexOf("b=AS:")?1e3*parseInt(l[0].substr(5),10)*.95-16e3:void 0,n.forEach((function(e){e.maxBitrate=l}))),n},r.parseRtcpParameters=function(e){var t={},n=r.matchPrefix(e,"a=ssrc:").map((function(e){return r.parseSsrcMedia(e)})).filter((function(e){return"cname"===e.attribute}))[0];n&&(t.cname=n.value,t.ssrc=n.ssrc);var i=r.matchPrefix(e,"a=rtcp-rsize");t.reducedSize=i.length>0,t.compound=0===i.length;var o=r.matchPrefix(e,"a=rtcp-mux");return t.mux=o.length>0,t},r.parseMsid=function(e){var t,n=r.matchPrefix(e,"a=msid:");if(1===n.length)return{stream:(t=n[0].substr(7).split(" "))[0],track:t[1]};var i=r.matchPrefix(e,"a=ssrc:").map((function(e){return r.parseSsrcMedia(e)})).filter((function(e){return"msid"===e.attribute}));return i.length>0?{stream:(t=i[0].value.split(" "))[0],track:t[1]}:void 0},r.parseSctpDescription=function(e){var t,n=r.parseMLine(e),i=r.matchPrefix(e,"a=max-message-size:");i.length>0&&(t=parseInt(i[0].substr(19),10)),isNaN(t)&&(t=65536);var o=r.matchPrefix(e,"a=sctp-port:");if(o.length>0)return{port:parseInt(o[0].substr(12),10),protocol:n.fmt,maxMessageSize:t};if(r.matchPrefix(e,"a=sctpmap:").length>0){var s=r.matchPrefix(e,"a=sctpmap:")[0].substr(10).split(" ");return{port:parseInt(s[0],10),protocol:s[1],maxMessageSize:t}}},r.writeSctpDescription=function(e,t){var n=[];return n="DTLS/SCTP"!==e.protocol?["m="+e.kind+" 9 "+e.protocol+" "+t.protocol+"\r\n","c=IN IP4 0.0.0.0\r\n","a=sctp-port:"+t.port+"\r\n"]:["m="+e.kind+" 9 "+e.protocol+" "+t.port+"\r\n","c=IN IP4 0.0.0.0\r\n","a=sctpmap:"+t.port+" "+t.protocol+" 65535\r\n"],void 0!==t.maxMessageSize&&n.push("a=max-message-size:"+t.maxMessageSize+"\r\n"),n.join("")},r.generateSessionId=function(){return Math.random().toString().substr(2,21)},r.writeSessionBoilerplate=function(e,t,n){var i=void 0!==t?t:2;return"v=0\r\no="+(n||"thisisadapterortc")+" "+(e||r.generateSessionId())+" "+i+" IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n"},r.writeMediaSection=function(e,t,n,i){var o=r.writeRtpDescription(e.kind,t);if(o+=r.writeIceParameters(e.iceGatherer.getLocalParameters()),o+=r.writeDtlsParameters(e.dtlsTransport.getLocalParameters(),"offer"===n?"actpass":"active"),o+="a=mid:"+e.mid+"\r\n",e.direction?o+="a="+e.direction+"\r\n":e.rtpSender&&e.rtpReceiver?o+="a=sendrecv\r\n":e.rtpSender?o+="a=sendonly\r\n":e.rtpReceiver?o+="a=recvonly\r\n":o+="a=inactive\r\n",e.rtpSender){var s="msid:"+i.id+" "+e.rtpSender.track.id+"\r\n";o+="a="+s,o+="a=ssrc:"+e.sendEncodingParameters[0].ssrc+" "+s,e.sendEncodingParameters[0].rtx&&(o+="a=ssrc:"+e.sendEncodingParameters[0].rtx.ssrc+" "+s,o+="a=ssrc-group:FID "+e.sendEncodingParameters[0].ssrc+" "+e.sendEncodingParameters[0].rtx.ssrc+"\r\n")}return o+="a=ssrc:"+e.sendEncodingParameters[0].ssrc+" cname:"+r.localCName+"\r\n",e.rtpSender&&e.sendEncodingParameters[0].rtx&&(o+="a=ssrc:"+e.sendEncodingParameters[0].rtx.ssrc+" cname:"+r.localCName+"\r\n"),o},r.getDirection=function(e,t){for(var n=r.splitLines(e),i=0;i<n.length;i++)switch(n[i]){case"a=sendrecv":case"a=sendonly":case"a=recvonly":case"a=inactive":return n[i].substr(2)}return t?r.getDirection(t):"sendrecv"},r.getKind=function(e){return r.splitLines(e)[0].split(" ")[0].substr(2)},r.isRejected=function(e){return"0"===e.split(" ",2)[1]},r.parseMLine=function(e){var t=r.splitLines(e)[0].substr(2).split(" ");return{kind:t[0],port:parseInt(t[1],10),protocol:t[2],fmt:t.slice(3).join(" ")}},r.parseOLine=function(e){var t=r.matchPrefix(e,"o=")[0].substr(2).split(" ");return{username:t[0],sessionId:t[1],sessionVersion:parseInt(t[2],10),netType:t[3],addressType:t[4],address:t[5]}},r.isValidSDP=function(e){if("string"!=typeof e||0===e.length)return!1;for(var t=r.splitLines(e),n=0;n<t.length;n++)if(t[n].length<2||"="!==t[n].charAt(1))return!1;return!0},e.exports=r},function(e,t,n){"use strict";var r,i,o,s=n(17),a="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";function c(){o=!1}function u(e){if(e){if(e!==r){if(e.length!==a.length)throw new Error("Custom alphabet for shortid must be "+a.length+" unique characters. You submitted "+e.length+" characters: "+e);var t=e.split("").filter((function(e,t,n){return t!==n.lastIndexOf(e)}));if(t.length)throw new Error("Custom alphabet for shortid must be "+a.length+" unique characters. These characters were not unique: "+t.join(", "));r=e,c()}}else r!==a&&(r=a,c())}function l(){return o||(o=function(){r||u(a);for(var e,t=r.split(""),n=[],i=s.nextValue();t.length>0;)i=s.nextValue(),e=Math.floor(i*t.length),n.push(t.splice(e,1)[0]);return n.join("")}())}e.exports={get:function(){return r||a},characters:function(e){return u(e),r},seed:function(e){s.seed(e),i!==e&&(c(),i=e)},lookup:function(e){return l()[e]},shuffled:l}},function(e,t){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(e){"object"==typeof window&&(n=window)}e.exports=n},function(e,t,n){(function(t){var r;r=function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=2)}([function(e,t,n){"use strict";e.exports=function(){var e=/%%|%(\d+\$)?([\-+'#0 ]*)(\*\d+\$|\*|\d+)?(?:\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g,t=arguments,n=0,r=t[n++],i=function(e,t,n,r){n||(n=" ");var i=e.length>=t?"":new Array(1+t-e.length>>>0).join(n);return r?e+i:i+e},o=function(e,t,n,r,o,s){var a=r-e.length;return a>0&&(e=n||!o?i(e,r,s,n):[e.slice(0,t.length),i("",a,"0",!0),e.slice(t.length)].join("")),e},s=function(e,t,n,r,s,a,c){var u=e>>>0;return e=(n=n&&u&&{2:"0b",8:"0",16:"0x"}[t]||"")+i(u.toString(t),a||0,"0",!1),o(e,n,r,s,c)},a=function(e,t,n,r,i,s){return null!=r&&(e=e.slice(0,r)),o(e,"",t,n,i,s)},c=function(e,r,c,u,l,p){var h,f,d,g,m;if("%%"===e)return"%";var y,v=!1,b="",w=!1,x=!1,k=" ",T=c.length;for(y=0;y<T;y++)switch(c.charAt(y)){case" ":b=" ";break;case"+":b="+";break;case"-":v=!0;break;case"'":k=c.charAt(y+1);break;case"0":w=!0,k="0";break;case"#":x=!0}if((u=u?"*"===u?+t[n++]:"*"===u.charAt(0)?+t[u.slice(1,-1)]:+u:0)<0&&(u=-u,v=!0),!isFinite(u))throw new Error("sprintf: (minimum-)width must be finite");switch(l=l?"*"===l?+t[n++]:"*"===l.charAt(0)?+t[l.slice(1,-1)]:+l:"fFeE".indexOf(p)>-1?6:"d"===p?0:void 0,m=r?t[r.slice(0,-1)]:t[n++],p){case"s":return a(m+"",v,u,l,w,k);case"c":return a(String.fromCharCode(+m),v,u,l,w);case"b":return s(m,2,x,v,u,l,w);case"o":return s(m,8,x,v,u,l,w);case"x":return s(m,16,x,v,u,l,w);case"X":return s(m,16,x,v,u,l,w).toUpperCase();case"u":return s(m,10,x,v,u,l,w);case"i":case"d":return h=+m||0,m=(f=(h=Math.round(h-h%1))<0?"-":b)+i(String(Math.abs(h)),l,"0",!1),o(m,f,v,u,w);case"e":case"E":case"f":case"F":case"g":case"G":return f=(h=+m)<0?"-":b,d=["toExponential","toFixed","toPrecision"]["efg".indexOf(p.toLowerCase())],g=["toString","toUpperCase"]["eEfFgG".indexOf(p)%2],m=f+Math.abs(h)[d](l),o(m,f,v,u,w)[g]();default:return e}};return r.replace(e,c)}},function(e,t){e.exports=n(47)},function(e,t,n){e.exports=n(3)()},function(e,t,n){e.exports=function e(){const t={VERSION:"1.14.0"};return n(4)(t),n(5)(t),n(6)(t),n(8)(t),n(9)(t),n(10)(t),n(19)(t),n(20)(t),n(22)(t),n(23)(t),n(24)(t),n(25)(t),n(26)(t),n(27)(t),n(28)(t),t.exports.factory=e,t.exports}},function(e,t){e.exports=function(e){"use strict";function t(t,n){if(t.template.options.rethrow)throw"string"==typeof n&&(n=new e.Error(n)),"TwigException"!==n.type||n.file||(n.file=t.template.id),n;if(e.log.error("Error parsing twig template "+t.template.id+": "),n.stack?e.log.error(n.stack):e.log.error(n.toString()),e.debug)return n.toString()}return e.trace=!1,e.debug=!1,e.cache=!0,e.noop=function(){},e.merge=function(e,t,n){return Object.keys(t).forEach(r=>{(!n||r in e)&&(e[r]=t[r])}),e},e.Error=function(e,t){this.message=e,this.name="TwigException",this.type="TwigException",this.file=t},e.Error.prototype.toString=function(){return this.name+": "+this.message},e.log={trace(...t){e.trace&&console&&console.log(Array.prototype.slice.call(t))},debug(...t){e.debug&&console&&console.log(Array.prototype.slice.call(t))}},"undefined"==typeof console?e.log.error=function(){}:void 0!==console.error?e.log.error=function(...e){console.error(...e)}:void 0!==console.log&&(e.log.error=function(...e){console.log(...e)}),e.token={},e.token.type={output:"output",logic:"logic",comment:"comment",raw:"raw",outputWhitespacePre:"output_whitespace_pre",outputWhitespacePost:"output_whitespace_post",outputWhitespaceBoth:"output_whitespace_both",logicWhitespacePre:"logic_whitespace_pre",logicWhitespacePost:"logic_whitespace_post",logicWhitespaceBoth:"logic_whitespace_both"},e.token.definitions=[{type:e.token.type.raw,open:"{% raw %}",close:"{% endraw %}"},{type:e.token.type.raw,open:"{% verbatim %}",close:"{% endverbatim %}"},{type:e.token.type.outputWhitespacePre,open:"{{-",close:"}}"},{type:e.token.type.outputWhitespacePost,open:"{{",close:"-}}"},{type:e.token.type.outputWhitespaceBoth,open:"{{-",close:"-}}"},{type:e.token.type.logicWhitespacePre,open:"{%-",close:"%}"},{type:e.token.type.logicWhitespacePost,open:"{%",close:"-%}"},{type:e.token.type.logicWhitespaceBoth,open:"{%-",close:"-%}"},{type:e.token.type.output,open:"{{",close:"}}"},{type:e.token.type.logic,open:"{%",close:"%}"},{type:e.token.type.comment,open:"{#",close:"#}"}],e.token.strings=['"',"'"],e.token.findStart=function(t){const n={position:null,def:null};let r=null;const i=e.token.definitions.length;let o,s,a,c;for(o=0;o<i;o++)s=e.token.definitions[o],a=t.indexOf(s.open),c=t.indexOf(s.close),e.log.trace("Twig.token.findStart: ","Searching for ",s.open," found at ",a),a>=0&&s.open.length!==s.close.length&&c<0||(a>=0&&(null===n.position||a<n.position)?(n.position=a,n.def=s,r=c):a>=0&&null!==n.position&&a===n.position&&(s.open.length>n.def.open.length?(n.position=a,n.def=s,r=c):s.open.length===n.def.open.length&&(s.close.length,n.def.close.length,c>=0&&c<r&&(n.position=a,n.def=s,r=c))));return n},e.token.findEnd=function(t,n,r){let i,o,s=null,a=!1,c=0,u=null,l=null,p=null,h=null,f=null,d=null;for(;!a;){if(u=null,l=null,p=t.indexOf(n.close,c),!(p>=0))throw new e.Error("Unable to find closing bracket '"+n.close+"' opened near template position "+r);if(s=p,a=!0,n.type===e.token.type.comment)break;if(n.type===e.token.type.raw)break;for(o=e.token.strings.length,i=0;i<o;i+=1)f=t.indexOf(e.token.strings[i],c),f>0&&f<p&&(null===u||f<u)&&(u=f,l=e.token.strings[i]);if(null!==u)for(h=u+1,s=null,a=!1;;){if(d=t.indexOf(l,h),d<0)throw e.Error("Unclosed string in template");if("\\"!==t.substr(d-1,1)){c=d+1;break}h=d+1}}return s},e.tokenize=function(t){const n=[];let r=0,i=null,o=null;for(;t.length>0;)if(i=e.token.findStart(t),e.log.trace("Twig.tokenize: ","Found token: ",i),null===i.position)n.push({type:e.token.type.raw,value:t}),t="";else{if(i.position>0&&n.push({type:e.token.type.raw,value:t.substring(0,i.position)}),t=t.substr(i.position+i.def.open.length),r+=i.position+i.def.open.length,o=e.token.findEnd(t,i.def,r),e.log.trace("Twig.tokenize: ","Token ends at ",o),n.push({type:i.def.type,value:t.substring(0,o).trim()}),"\n"===t.substr(o+i.def.close.length,1))switch(i.def.type){case"logic_whitespace_pre":case"logic_whitespace_post":case"logic_whitespace_both":case"logic":o+=1}t=t.substr(o+i.def.close.length),r+=o+i.def.close.length}return n},e.compile=function(t){const n=this;try{const r=[],i=[];let o=[],s=null,a=null,c=null,u=null,l=null,p=null,h=null,f=null,d=null,g=null,m=null,y=null;const v=function(t){e.expression.compile.call(n,t),i.length>0?o.push(t):r.push(t)},b=function(t){if(a=e.logic.compile.call(n,t),g=a.type,m=e.logic.handler[g].open,y=e.logic.handler[g].next,e.log.trace("Twig.compile: ","Compiled logic token to ",a," next is: ",y," open is : ",m),void 0!==m&&!m){if(u=i.pop(),h=e.logic.handler[u.type],h.next.indexOf(g)<0)throw new Error(g+" not expected after a "+u.type);u.output=u.output||[],u.output=u.output.concat(o),o=[],d={type:e.token.type.logic,token:u},i.length>0?o.push(d):r.push(d)}void 0!==y&&y.length>0?(e.log.trace("Twig.compile: ","Pushing ",a," to logic stack."),i.length>0&&(u=i.pop(),u.output=u.output||[],u.output=u.output.concat(o),i.push(u),o=[]),i.push(a)):void 0!==m&&m&&(d={type:e.token.type.logic,token:a},i.length>0?o.push(d):r.push(d))};for(;t.length>0;){switch(s=t.shift(),l=r[r.length-1],p=o[o.length-1],f=t[0],e.log.trace("Compiling token ",s),s.type){case e.token.type.raw:i.length>0?o.push(s):r.push(s);break;case e.token.type.logic:b.call(n,s);break;case e.token.type.comment:break;case e.token.type.output:v.call(n,s);break;case e.token.type.logicWhitespacePre:case e.token.type.logicWhitespacePost:case e.token.type.logicWhitespaceBoth:case e.token.type.outputWhitespacePre:case e.token.type.outputWhitespacePost:case e.token.type.outputWhitespaceBoth:switch(s.type!==e.token.type.outputWhitespacePost&&s.type!==e.token.type.logicWhitespacePost&&(l&&l.type===e.token.type.raw&&(r.pop(),null===l.value.match(/^\s*$/)&&(l.value=l.value.trim(),r.push(l))),p&&p.type===e.token.type.raw&&(o.pop(),null===p.value.match(/^\s*$/)&&(p.value=p.value.trim(),o.push(p)))),s.type){case e.token.type.outputWhitespacePre:case e.token.type.outputWhitespacePost:case e.token.type.outputWhitespaceBoth:v.call(n,s);break;case e.token.type.logicWhitespacePre:case e.token.type.logicWhitespacePost:case e.token.type.logicWhitespaceBoth:b.call(n,s)}s.type!==e.token.type.outputWhitespacePre&&s.type!==e.token.type.logicWhitespacePre&&f&&f.type===e.token.type.raw&&(t.shift(),null===f.value.match(/^\s*$/)&&(f.value=f.value.trim(),t.unshift(f)))}e.log.trace("Twig.compile: "," Output: ",r," Logic Stack: ",i," Pending Output: ",o)}if(i.length>0)throw c=i.pop(),new Error("Unable to find an end tag for "+c.type+", expecting one of "+c.next);return r}catch(t){if(n.options.rethrow)throw"TwigException"!==t.type||t.file||(t.file=n.id),t;e.log.error("Error compiling twig template "+n.id+": "),t.stack?e.log.error(t.stack):e.log.error(t.toString())}},e.prepare=function(t){e.log.debug("Twig.prepare: ","Tokenizing ",t);const n=e.tokenize.call(this,t);e.log.debug("Twig.prepare: ","Compiling ",n);const r=e.compile.call(this,n);return e.log.debug("Twig.prepare: ","Compiled ",r),r},e.output=function(t){const{autoescape:n}=this.options;if(!n)return t.join("");const r="string"==typeof n?n:"html",i=t.map(t=>(!t||!0===t.twigMarkup||t.twigMarkup===r||"html"===r&&"html_attr"===t.twigMarkup||(t=e.filters.escape(t,[r])),t));return 0===i.length?"":new e.Markup(i.join(""),!0)},e.Templates={loaders:{},parsers:{},registry:{}},e.validateId=function(t){if("prototype"===t)throw new e.Error(t+" is not a valid twig identifier");if(e.cache&&Object.hasOwnProperty.call(e.Templates.registry,t))throw new e.Error("There is already a template with the ID "+t);return!0},e.Templates.registerLoader=function(t,n,r){if("function"!=typeof n)throw new e.Error("Unable to add loader for "+t+": Invalid function reference given.");r&&(n=n.bind(r)),this.loaders[t]=n},e.Templates.unRegisterLoader=function(e){this.isRegisteredLoader(e)&&delete this.loaders[e]},e.Templates.isRegisteredLoader=function(e){return Object.hasOwnProperty.call(this.loaders,e)},e.Templates.registerParser=function(t,n,r){if("function"!=typeof n)throw new e.Error("Unable to add parser for "+t+": Invalid function regerence given.");r&&(n=n.bind(r)),this.parsers[t]=n},e.Templates.unRegisterParser=function(e){this.isRegisteredParser(e)&&delete this.parsers[e]},e.Templates.isRegisteredParser=function(e){return Object.hasOwnProperty.call(this.parsers,e)},e.Templates.save=function(t){if(void 0===t.id)throw new e.Error("Unable to save template with no id");e.Templates.registry[t.id]=t},e.Templates.load=function(t){return Object.hasOwnProperty.call(e.Templates.registry,t)?e.Templates.registry[t]:null},e.Templates.loadRemote=function(t,n,r,i){const o=void 0===n.id?t:n.id,s=e.Templates.registry[o];return e.cache&&void 0!==s?("function"==typeof r&&r(s),s):(n.parser=n.parser||"twig",n.id=o,void 0===n.async&&(n.async=!0),(this.loaders[n.method]||this.loaders.fs).call(this,t,n,r,i))},e.Block=function(e,t){this.template=e,this.token=t},e.Block.prototype.render=function(t,n){const r=t.template;let i;return t.template=this.template,i=this.token.expression?e.expression.parseAsync.call(t,this.token.output,n):t.parseAsync(this.token.output,n),i.then(r=>e.expression.parseAsync.call(t,{type:e.expression.type.string,value:r},n)).then(e=>(t.template=r,e))},e.ParseState=function(e,t){this.renderedBlocks={},this.overrideBlocks=void 0===t?{}:t,this.context={},this.macros={},this.nestingStack=[],this.template=e},e.ParseState.prototype.getBlock=function(e,t){let n;return!0!==t&&(n=this.overrideBlocks[e]),void 0===n&&(n=this.template.getBlock(e,t)),void 0===n&&null!==this.template.parentTemplate&&(n=this.template.parentTemplate.getBlock(e)),n},e.ParseState.prototype.getBlocks=function(e){let t={};return!1!==e&&null!==this.template.parentTemplate&&this.template.parentTemplate!==this.template&&(t=this.template.parentTemplate.getBlocks()),t={...t,...this.template.getBlocks(),...this.overrideBlocks},t},e.ParseState.prototype.getNestingStackToken=function(e){let t;return this.nestingStack.forEach(n=>{void 0===t&&n.type===e&&(t=n)}),t},e.ParseState.prototype.parse=function(n,r,i){const o=this;let s=[],a=null,c=!0,u=null,l=!0;function p(e){s.push(e)}function h(e){void 0!==e.chain&&(l=e.chain),void 0!==e.context&&(o.context=e.context),void 0!==e.output&&s.push(e.output)}if(r&&(o.context=r),u=e.async.forEach(n,t=>{switch(e.log.debug("Twig.ParseState.parse: ","Parsing token: ",t),t.type){case e.token.type.raw:s.push(e.filters.raw(t.value));break;case e.token.type.logic:return e.logic.parseAsync.call(o,t.token,o.context,l).then(h);case e.token.type.comment:break;case e.token.type.outputWhitespacePre:case e.token.type.outputWhitespacePost:case e.token.type.outputWhitespaceBoth:case e.token.type.output:return e.log.debug("Twig.ParseState.parse: ","Output token: ",t.stack),e.expression.parseAsync.call(o,t.stack,o.context).then(p)}}).then(()=>(s=e.output.call(o.template,s),c=!1,s)).catch(e=>{i&&t(o,e),a=e}),i)return u;if(null!==a)return t(o,a);if(c)throw new e.Error("You are using Twig.js in sync mode in combination with async extensions.");return s},e.Template=function(t){const{data:n,id:r,base:i,path:o,url:s,name:a,method:c,options:u}=t;this.base=i,this.blocks={defined:{},imported:{}},this.id=r,this.method=c,this.name=a,this.options=u,this.parentTemplate=null,this.path=o,this.url=s,function(e,t){const n=Object.prototype.toString.call(t).slice(8,-1);return null!=t&&n===e}("String",n)?this.tokens=e.prepare.call(this,n):this.tokens=n,void 0!==r&&e.Templates.save(this)},e.Template.prototype.getBlock=function(e,t){let n;return!0!==t&&(n=this.blocks.defined[e]),void 0===n&&(n=this.blocks.imported[e]),n},e.Template.prototype.getBlocks=function(){let e={};return e={...e,...this.blocks.imported,...this.blocks.defined},e},e.Template.prototype.render=function(t,n,r){const i=this;return n=n||{},e.async.potentiallyAsync(i,r,()=>{const r=new e.ParseState(i,n.blocks);return r.parseAsync(i.tokens,t).then(t=>{let o,s;return null!==i.parentTemplate?(i.options.allowInlineIncludes&&(o=e.Templates.load(i.parentTemplate),o&&(o.options=i.options)),o||(s=e.path.parsePath(i,i.parentTemplate),o=e.Templates.loadRemote(s,{method:i.getLoaderMethod(),base:i.base,async:!1,id:s,options:i.options})),i.parentTemplate=o,i.parentTemplate.renderAsync(r.context,{blocks:r.getBlocks(!1),isInclude:!0})):!0===n.isInclude?t:t.valueOf()})})},e.Template.prototype.importFile=function(t){let n,r=null;if(!this.url&&this.options.allowInlineIncludes){if(t=this.path?e.path.parsePath(this,t):t,n=e.Templates.load(t),!n&&(n=e.Templates.loadRemote(r,{id:t,method:this.getLoaderMethod(),async:!1,path:t,options:this.options}),!n))throw new e.Error("Unable to find the template "+t);return n.options=this.options,n}return r=e.path.parsePath(this,t),n=e.Templates.loadRemote(r,{method:this.getLoaderMethod(),base:this.base,async:!1,options:this.options,id:r}),n},e.Template.prototype.getLoaderMethod=function(){return this.path?"fs":this.url?"ajax":this.method||"fs"},e.Template.prototype.compile=function(t){return e.compiler.compile(this,t)},e.Markup=function(e,t){if("string"!=typeof e||0===e.length)return e;const n=new String(e);return n.twigMarkup=void 0===t||t,n},e}},function(e,t){e.exports=function(e){return e.compiler={module:{}},e.compiler.compile=function(t,n){const r=JSON.stringify(t.tokens),{id:i}=t;let o=null;if(n.module){if(void 0===e.compiler.module[n.module])throw new e.Error("Unable to find module type "+n.module);o=e.compiler.module[n.module](i,r,n.twig)}else o=e.compiler.wrap(i,r);return o},e.compiler.module={amd:(t,n,r)=>'define(["'+r+'"], function (Twig) {\n\tvar twig, templates;\ntwig = Twig.twig;\ntemplates = '+e.compiler.wrap(t,n)+"\n\treturn templates;\n});",node:(t,n)=>'var twig = require("twig").twig;\nexports.template = '+e.compiler.wrap(t,n),cjs2:(t,n,r)=>'module.declare([{ twig: "'+r+'" }], function (require, exports, module) {\n\tvar twig = require("twig").twig;\n\texports.template = '+e.compiler.wrap(t,n)+"\n});"},e.compiler.wrap=function(e,t){return'twig({id:"'+e.replace('"','\\"')+'", data:'+t+", precompiled: true});\n"},e}},function(e,t,n){e.exports=function(e){"use strict";function t(t,n,r){return n?e.expression.parseAsync.call(t,n,r):e.Promise.resolve(!1)}for(e.expression={},n(7)(e),e.expression.reservedWords=["true","false","null","TRUE","FALSE","NULL","_context","and","b-and","or","b-or","b-xor","in","not in","if","matches","starts","ends","with"],e.expression.type={comma:"Twig.expression.type.comma",operator:{unary:"Twig.expression.type.operator.unary",binary:"Twig.expression.type.operator.binary"},string:"Twig.expression.type.string",bool:"Twig.expression.type.bool",slice:"Twig.expression.type.slice",array:{start:"Twig.expression.type.array.start",end:"Twig.expression.type.array.end"},object:{start:"Twig.expression.type.object.start",end:"Twig.expression.type.object.end"},parameter:{start:"Twig.expression.type.parameter.start",end:"Twig.expression.type.parameter.end"},subexpression:{start:"Twig.expression.type.subexpression.start",end:"Twig.expression.type.subexpression.end"},key:{period:"Twig.expression.type.key.period",brackets:"Twig.expression.type.key.brackets"},filter:"Twig.expression.type.filter",_function:"Twig.expression.type._function",variable:"Twig.expression.type.variable",number:"Twig.expression.type.number",_null:"Twig.expression.type.null",context:"Twig.expression.type.context",test:"Twig.expression.type.test"},e.expression.set={operations:[e.expression.type.filter,e.expression.type.operator.unary,e.expression.type.operator.binary,e.expression.type.array.end,e.expression.type.object.end,e.expression.type.parameter.end,e.expression.type.subexpression.end,e.expression.type.comma,e.expression.type.test],expressions:[e.expression.type._function,e.expression.type.bool,e.expression.type.string,e.expression.type.variable,e.expression.type.number,e.expression.type._null,e.expression.type.context,e.expression.type.parameter.start,e.expression.type.array.start,e.expression.type.object.start,e.expression.type.subexpression.start,e.expression.type.operator.unary]},e.expression.set.operationsExtended=e.expression.set.operations.concat([e.expression.type.key.period,e.expression.type.key.brackets,e.expression.type.slice]),e.expression.fn={compile:{push(e,t,n){n.push(e)},pushBoth(e,t,n){n.push(e),t.push(e)}},parse:{push(e,t){t.push(e)},pushValue(e,t){t.push(e.value)}}},e.expression.definitions=[{type:e.expression.type.test,regex:/^is\s+(not)?\s*([a-zA-Z_]\w*(\s?as)?)/,next:e.expression.set.operations.concat([e.expression.type.parameter.start]),compile(e,t,n){e.filter=e.match[2],e.modifier=e.match[1],delete e.match,delete e.value,n.push(e)},parse(n,r,i){const o=r.pop();return t(this,n.params,i).then(t=>{const i=e.test(n.filter,o,t);"not"===n.modifier?r.push(!i):r.push(i)})}},{type:e.expression.type.comma,regex:/^,/,next:e.expression.set.expressions.concat([e.expression.type.array.end,e.expression.type.object.end]),compile(t,n,r){let i,o=n.length-1;for(delete t.match,delete t.value;o>=0;o--){if(i=n.pop(),i.type===e.expression.type.object.start||i.type===e.expression.type.parameter.start||i.type===e.expression.type.array.start){n.push(i);break}r.push(i)}r.push(t)}},{type:e.expression.type.number,regex:/^-?\d+(\.\d+)?/,next:e.expression.set.operations,compile(e,t,n){e.value=Number(e.value),n.push(e)},parse:e.expression.fn.parse.pushValue},{type:e.expression.type.operator.binary,regex:/(^\?\?|^\?:|^(b-and)|^(b-or)|^(b-xor)|^[+\-~%?]|^[:](?!\d\])|^[!=]==?|^[!<>]=?|^\*\*?|^\/\/?|^(and)[(|\s+]|^(or)[(|\s+]|^(in)[(|\s+]|^(not in)[(|\s+]|^(matches)|^(starts with)|^(ends with)|^\.\.)/,next:e.expression.set.expressions,transform(e,t){switch(e[0]){case"and(":case"or(":case"in(":case"not in(":return t[t.length-1].value=e[2],e[0];default:return""}},compile(t,n,r){delete t.match,t.value=t.value.trim();const{value:i}=t,o=e.expression.operator.lookup(i,t);for(e.log.trace("Twig.expression.compile: ","Operator: ",o," from ",i);n.length>0&&(n[n.length-1].type===e.expression.type.operator.unary||n[n.length-1].type===e.expression.type.operator.binary)&&(o.associativity===e.expression.operator.leftToRight&&o.precidence>=n[n.length-1].precidence||o.associativity===e.expression.operator.rightToLeft&&o.precidence>n[n.length-1].precidence);){const e=n.pop();r.push(e)}if(":"===i)if(n[n.length-1]&&"?"===n[n.length-1].value);else{const n=r.pop();if(n.type===e.expression.type.string||n.type===e.expression.type.variable)t.key=n.value;else if(n.type===e.expression.type.number)t.key=n.value.toString();else{if(!n.expression||n.type!==e.expression.type.parameter.end&&n.type!==e.expression.type.subexpression.end)throw new e.Error("Unexpected value before ':' of "+n.type+" = "+n.value);t.params=n.params}r.push(t)}else n.push(o)},parse(t,n,r){const i=this;if(t.key)n.push(t);else{if(t.params)return e.expression.parseAsync.call(i,t.params,r).then(e=>{t.key=e,n.push(t),r.loop||delete t.params});e.expression.operator.parse(t.value,n)}}},{type:e.expression.type.operator.unary,regex:/(^not\s+)/,next:e.expression.set.expressions,compile(t,n,r){delete t.match,t.value=t.value.trim();const{value:i}=t,o=e.expression.operator.lookup(i,t);for(e.log.trace("Twig.expression.compile: ","Operator: ",o," from ",i);n.length>0&&(n[n.length-1].type===e.expression.type.operator.unary||n[n.length-1].type===e.expression.type.operator.binary)&&(o.associativity===e.expression.operator.leftToRight&&o.precidence>=n[n.length-1].precidence||o.associativity===e.expression.operator.rightToLeft&&o.precidence>n[n.length-1].precidence);){const e=n.pop();r.push(e)}n.push(o)},parse(t,n){e.expression.operator.parse(t.value,n)}},{type:e.expression.type.string,regex:/^(["'])(?:(?=(\\?))\2[\s\S])*?\1/,next:e.expression.set.operationsExtended,compile(t,n,r){let{value:i}=t;delete t.match,i='"'===i.substring(0,1)?i.replace('\\"','"'):i.replace("\\'","'"),t.value=i.substring(1,i.length-1).replace(/\\n/g,"\n").replace(/\\r/g,"\r"),e.log.trace("Twig.expression.compile: ","String value: ",t.value),r.push(t)},parse:e.expression.fn.parse.pushValue},{type:e.expression.type.subexpression.start,regex:/^\(/,next:e.expression.set.expressions.concat([e.expression.type.subexpression.end]),compile(e,t,n){e.value="(",n.push(e),t.push(e)},parse:e.expression.fn.parse.push},{type:e.expression.type.subexpression.end,regex:/^\)/,next:e.expression.set.operationsExtended,validate(t,n){let r=n.length-1,i=!1,o=!1,s=0;for(;!i&&r>=0;){const t=n[r];i=t.type===e.expression.type.subexpression.start,i&&o&&(o=!1,i=!1),t.type===e.expression.type.parameter.start?s++:t.type===e.expression.type.parameter.end?s--:t.type===e.expression.type.subexpression.end&&(o=!0),r--}return i&&0===s},compile(t,n,r){let i;const o=t;for(i=n.pop();n.length>0&&i.type!==e.expression.type.subexpression.start;)r.push(i),i=n.pop();const s=[];for(;t.type!==e.expression.type.subexpression.start;)s.unshift(t),t=r.pop();s.unshift(t),i=n[n.length-1],void 0===i||i.type!==e.expression.type._function&&i.type!==e.expression.type.filter&&i.type!==e.expression.type.test&&i.type!==e.expression.type.key.brackets?(o.expression=!0,s.pop(),s.shift(),o.params=s,r.push(o)):(o.expression=!1,i.params=s)},parse(t,n,r){const i=this;if(t.expression)return e.expression.parseAsync.call(i,t.params,r).then(e=>{n.push(e)});throw new e.Error("Unexpected subexpression end when token is not marked as an expression")}},{type:e.expression.type.parameter.start,regex:/^\(/,next:e.expression.set.expressions.concat([e.expression.type.parameter.end]),validate(t,n){const r=n[n.length-1];return r&&e.expression.reservedWords.indexOf(r.value.trim())<0},compile:e.expression.fn.compile.pushBoth,parse:e.expression.fn.parse.push},{type:e.expression.type.parameter.end,regex:/^\)/,next:e.expression.set.operationsExtended,compile(t,n,r){let i;const o=t;for(i=n.pop();n.length>0&&i.type!==e.expression.type.parameter.start;)r.push(i),i=n.pop();const s=[];for(;t.type!==e.expression.type.parameter.start;)s.unshift(t),t=r.pop();s.unshift(t),void 0===(t=r[r.length-1])||t.type!==e.expression.type._function&&t.type!==e.expression.type.filter&&t.type!==e.expression.type.test&&t.type!==e.expression.type.key.brackets?(o.expression=!0,s.pop(),s.shift(),o.params=s,r.push(o)):(o.expression=!1,t.params=s)},parse(t,n,r){const i=[];let o=!1,s=null;const a=this;if(t.expression)return e.expression.parseAsync.call(a,t.params,r).then(e=>{n.push(e)});for(;n.length>0;){if(s=n.pop(),s&&s.type&&s.type===e.expression.type.parameter.start){o=!0;break}i.unshift(s)}if(!o)throw new e.Error("Expected end of parameter set.");n.push(i)}},{type:e.expression.type.slice,regex:/^\[(\d*:\d*)\]/,next:e.expression.set.operationsExtended,compile(e,t,n){const r=e.match[1].split(":"),i=r[0]?parseInt(r[0],10):void 0,o=r[1]?parseInt(r[1],10):void 0;e.value="slice",e.params=[i,o],o||(e.params=[i]),n.push(e)},parse(t,n){const r=n.pop(),{params:i}=t;n.push(e.filter.call(this,t.value,r,i))}},{type:e.expression.type.array.start,regex:/^\[/,next:e.expression.set.expressions.concat([e.expression.type.array.end]),compile:e.expression.fn.compile.pushBoth,parse:e.expression.fn.parse.push},{type:e.expression.type.array.end,regex:/^\]/,next:e.expression.set.operationsExtended,compile(t,n,r){let i,o=n.length-1;for(;o>=0&&(i=n.pop(),i.type!==e.expression.type.array.start);o--)r.push(i);r.push(t)},parse(t,n){const r=[];let i=!1,o=null;for(;n.length>0;){if(o=n.pop(),o.type&&o.type===e.expression.type.array.start){i=!0;break}r.unshift(o)}if(!i)throw new e.Error("Expected end of array.");n.push(r)}},{type:e.expression.type.object.start,regex:/^\{/,next:e.expression.set.expressions.concat([e.expression.type.object.end]),compile:e.expression.fn.compile.pushBoth,parse:e.expression.fn.parse.push},{type:e.expression.type.object.end,regex:/^\}/,next:e.expression.set.operationsExtended,compile(t,n,r){let i,o=n.length-1;for(;o>=0&&(i=n.pop(),!i||i.type!==e.expression.type.object.start);o--)r.push(i);r.push(t)},parse(t,n){const r={};let i=!1,o=null,s=!1,a=null;for(;n.length>0;){if(o=n.pop(),o&&o.type&&o.type===e.expression.type.object.start){i=!0;break}if(o&&o.type&&(o.type===e.expression.type.operator.binary||o.type===e.expression.type.operator.unary)&&o.key){if(!s)throw new e.Error("Missing value for key '"+o.key+"' in object definition.");r[o.key]=a,void 0===r._keys&&(r._keys=[]),r._keys.unshift(o.key),a=null,s=!1}else s=!0,a=o}if(!i)throw new e.Error("Unexpected end of object.");n.push(r)}},{type:e.expression.type.filter,regex:/^\|\s?([a-zA-Z_][a-zA-Z0-9_-]*)/,next:e.expression.set.operationsExtended.concat([e.expression.type.parameter.start]),compile(e,t,n){e.value=e.match[1],n.push(e)},parse(n,r,i){const o=r.pop(),s=this;return t(s,n.params,i).then(t=>e.filter.call(s,n.value,o,t)).then(e=>{r.push(e)})}},{type:e.expression.type._function,regex:/^([a-zA-Z_]\w*)\s*\(/,next:e.expression.type.parameter.start,validate:t=>t[1]&&e.expression.reservedWords.indexOf(t[1])<0,transform:()=>"(",compile(e,t,n){const r=e.match[1];e.fn=r,delete e.match,delete e.value,n.push(e)},parse(n,r,i){const o=this,{fn:s}=n;let a;return t(o,n.params,i).then(t=>{if(e.functions[s])a=e.functions[s].apply(o,t);else{if("function"!=typeof i[s])throw new e.Error(s+" function does not exist and is not defined in the context");a=i[s](...t)}return a}).then(e=>{r.push(e)})}},{type:e.expression.type.variable,regex:/^[a-zA-Z_]\w*/,next:e.expression.set.operationsExtended.concat([e.expression.type.parameter.start]),compile:e.expression.fn.compile.push,validate:t=>e.expression.reservedWords.indexOf(t[0])<0,parse(t,n,r){const i=this;return e.expression.resolveAsync.call(i,r[t.value],r).then(r=>{if(i.template.options.strictVariables&&void 0===r)throw new e.Error('Variable "'+t.value+'" does not exist.');n.push(r)})}},{type:e.expression.type.key.period,regex:/^\.(\w+)/,next:e.expression.set.operationsExtended.concat([e.expression.type.parameter.start]),compile(e,t,n){e.key=e.match[1],delete e.match,delete e.value,n.push(e)},parse(n,r,i,o){const s=this,{key:a}=n,c=r.pop();let u;if(c&&!Object.prototype.hasOwnProperty.call(c,a)&&s.template.options.strictVariables)throw Object.keys(c).length>0?new e.Error('Key "'+a+'" for object with keys "'+Object.keys(c).join(", ")+'" does not exist.'):new e.Error('Key "'+a+'" does not exist as the object is empty.');return t(s,n.params,i).then(t=>{if(null==c)u=void 0;else{const e=function(e){return e.substr(0,1).toUpperCase()+e.substr(1)};u="object"==typeof c&&a in c?c[a]:c["get"+e(a)]?c["get"+e(a)]:c["is"+e(a)]?c["is"+e(a)]:void 0}return e.expression.resolveAsync.call(s,u,i,t,o,c)}).then(e=>{r.push(e)})}},{type:e.expression.type.key.brackets,regex:/^\[([^\]:]*)\]/,next:e.expression.set.operationsExtended.concat([e.expression.type.parameter.start]),compile(t,n,r){const i=t.match[1];delete t.value,delete t.match,t.stack=e.expression.compile({value:i}).stack,r.push(t)},parse(n,r,i,o){const s=this;let a,c,u=null;return t(s,n.params,i).then(t=>(u=t,e.expression.parseAsync.call(s,n.stack,i))).then(t=>{if(a=r.pop(),a&&!Object.prototype.hasOwnProperty.call(a,t)&&s.template.options.strictVariables){const n=Object.keys(a);throw n.length>0?new e.Error('Key "'+t+'" for array with keys "'+n.join(", ")+'" does not exist.'):new e.Error('Key "'+t+'" does not exist as the array is empty.')}return null==a?null:(c="object"==typeof a&&t in a?a[t]:null,e.expression.resolveAsync.call(s,c,a,u,o))}).then(e=>{r.push(e)})}},{type:e.expression.type._null,regex:/^(null|NULL|none|NONE)/,next:e.expression.set.operations,compile(e,t,n){delete e.match,e.value=null,n.push(e)},parse:e.expression.fn.parse.pushValue},{type:e.expression.type.context,regex:/^_context/,next:e.expression.set.operationsExtended.concat([e.expression.type.parameter.start]),compile:e.expression.fn.compile.push,parse(e,t,n){t.push(n)}},{type:e.expression.type.bool,regex:/^(true|TRUE|false|FALSE)/,next:e.expression.set.operations,compile(e,t,n){e.value="true"===e.match[0].toLowerCase(),delete e.match,n.push(e)},parse:e.expression.fn.parse.pushValue}],e.expression.resolveAsync=function(t,n,r,i,o){const s=this;if("function"!=typeof t)return e.Promise.resolve(t);let a=e.Promise.resolve(r);if(i&&i.type===e.expression.type.parameter.end){const t=!0;a=a.then(()=>i.params&&e.expression.parseAsync.call(s,i.params,n,t)).then(e=>(i.cleanup=!0,e))}return a.then(e=>t.apply(o||n,e||[]))},e.expression.resolve=function(t,n,r,i,o){return e.async.potentiallyAsync(this,!1,(function(){return e.expression.resolveAsync.call(this,t,n,r,i,o)}))},e.expression.handler={},e.expression.extendType=function(t){e.expression.type[t]="Twig.expression.type."+t},e.expression.extend=function(t){if(!t.type)throw new e.Error("Unable to extend logic definition. No type provided for "+t);e.expression.handler[t.type]=t};e.expression.definitions.length>0;)e.expression.extend(e.expression.definitions.shift());return e.expression.tokenize=function(t){const n=[];let r,i,o,s,a,c=0,u=null,l=[];const p=function(...t){let i=arguments.length-2;const o=new Array(i);for(;i-- >0;)o[i]=t[i];if(e.log.trace("Twig.expression.tokenize","Matched a ",r," regular expression of ",o),u&&u.indexOf(r)<0)return l.push(r+" cannot follow a "+n[n.length-1].type+" at template:"+c+" near '"+o[0].substring(0,20)+"...'"),o[0];const p=e.expression.handler[r];return p.validate&&!p.validate(o,n)?o[0]:(l=[],n.push({type:r,value:o[0],match:o}),a=!0,u=s,c+=o[0].length,p.transform?p.transform(o,n):"")};for(e.log.debug("Twig.expression.tokenize","Tokenizing expression ",t);t.length>0;){for(r in t=t.trim(),e.expression.handler)if(Object.hasOwnProperty.call(e.expression.handler,r)){if(s=e.expression.handler[r].next,i=e.expression.handler[r].regex,e.log.trace("Checking type ",r," on ",t),a=!1,Array.isArray(i))for(o=i.length;o-- >0;)t=t.replace(i[o],p);else t=t.replace(i,p);if(a)break}if(!a)throw l.length>0?new e.Error(l.join(" OR ")):new e.Error("Unable to parse '"+t+"' at template position"+c)}return e.log.trace("Twig.expression.tokenize","Tokenized to ",n),n},e.expression.compile=function(t){const n=t.value,r=e.expression.tokenize(n);let i=null;const o=[],s=[];let a=null;for(e.log.trace("Twig.expression.compile: ","Compiling ",n);r.length>0;)i=r.shift(),a=e.expression.handler[i.type],e.log.trace("Twig.expression.compile: ","Compiling ",i),a.compile(i,s,o),e.log.trace("Twig.expression.compile: ","Stack is",s),e.log.trace("Twig.expression.compile: ","Output is",o);for(;s.length>0;)o.push(s.pop());return e.log.trace("Twig.expression.compile: ","Final output is",o),t.stack=o,delete t.value,t},e.expression.parse=function(t,n,r,i){const o=this;Array.isArray(t)||(t=[t]);const s=[],a=[],c=e.expression.type.operator.binary;return e.async.potentiallyAsync(o,i,()=>e.async.forEach(t,(r,i)=>{let u,l=null,p=null;if(!r.cleanup)return t.length>i+1&&(p=t[i+1]),l=e.expression.handler[r.type],l.parse&&(u=l.parse.call(o,r,s,n,p)),r.type===c&&n.loop&&a.push(r),u}).then(()=>{let e=a.length,t=null;for(;e-- >0;)t=a[e],t.params&&t.key&&delete t.key;if(r){const e=s.splice(0);s.push(e)}return s.pop()}))},e}},function(e,t){e.exports=function(e){"use strict";e.expression.operator={leftToRight:"leftToRight",rightToLeft:"rightToLeft"};const t=function(e,t){if(null==t)return null;if(void 0!==t.indexOf)return(e===t||""!==e)&&t.indexOf(e)>-1;let n;for(n in t)if(Object.hasOwnProperty.call(t,n)&&t[n]===e)return!0;return!1};return e.expression.operator.lookup=function(t,n){switch(t){case"..":n.precidence=20,n.associativity=e.expression.operator.leftToRight;break;case",":n.precidence=18,n.associativity=e.expression.operator.leftToRight;break;case"?:":case"?":case":":n.precidence=16,n.associativity=e.expression.operator.rightToLeft;break;case"??":n.precidence=15,n.associativity=e.expression.operator.rightToLeft;break;case"or":n.precidence=14,n.associativity=e.expression.operator.leftToRight;break;case"and":n.precidence=13,n.associativity=e.expression.operator.leftToRight;break;case"b-or":n.precidence=12,n.associativity=e.expression.operator.leftToRight;break;case"b-xor":n.precidence=11,n.associativity=e.expression.operator.leftToRight;break;case"b-and":n.precidence=10,n.associativity=e.expression.operator.leftToRight;break;case"==":case"!=":n.precidence=9,n.associativity=e.expression.operator.leftToRight;break;case"<":case"<=":case">":case">=":case"not in":case"in":n.precidence=8,n.associativity=e.expression.operator.leftToRight;break;case"~":case"+":case"-":n.precidence=6,n.associativity=e.expression.operator.leftToRight;break;case"//":case"**":case"*":case"/":case"%":n.precidence=5,n.associativity=e.expression.operator.leftToRight;break;case"not":n.precidence=3,n.associativity=e.expression.operator.rightToLeft;break;case"matches":case"starts with":case"ends with":n.precidence=8,n.associativity=e.expression.operator.leftToRight;break;default:throw new e.Error("Failed to lookup operator: "+t+" is an unknown operator.")}return n.operator=t,n},e.expression.operator.parse=function(n,r){let i,o,s;if(e.log.trace("Twig.expression.operator.parse: ","Handling ",n),"?"===n&&(s=r.pop()),o=r.pop(),"not"!==n&&(i=r.pop()),"in"!==n&&"not in"!==n&&"??"!==n&&(i&&Array.isArray(i)&&(i=i.length),o&&Array.isArray(o)&&(o=o.length)),"matches"===n&&o&&"string"==typeof o){const e=o.match(/^\/(.*)\/([gims]?)$/),t=e[1],n=e[2];o=new RegExp(t,n)}switch(n){case":":break;case"??":void 0===i&&(i=o,o=s,s=void 0),null!=i?r.push(i):r.push(o);break;case"?:":e.lib.boolval(i)?r.push(i):r.push(o);break;case"?":void 0===i&&(i=o,o=s,s=void 0),e.lib.boolval(i)?r.push(o):r.push(s);break;case"+":o=parseFloat(o),i=parseFloat(i),r.push(i+o);break;case"-":o=parseFloat(o),i=parseFloat(i),r.push(i-o);break;case"*":o=parseFloat(o),i=parseFloat(i),r.push(i*o);break;case"/":o=parseFloat(o),i=parseFloat(i),r.push(i/o);break;case"//":o=parseFloat(o),i=parseFloat(i),r.push(Math.floor(i/o));break;case"%":o=parseFloat(o),i=parseFloat(i),r.push(i%o);break;case"~":r.push((null!=i?i.toString():"")+(null!=o?o.toString():""));break;case"not":case"!":r.push(!e.lib.boolval(o));break;case"<":r.push(i<o);break;case"<=":r.push(i<=o);break;case">":r.push(i>o);break;case">=":r.push(i>=o);break;case"===":r.push(i===o);break;case"==":r.push(i==o);break;case"!==":r.push(i!==o);break;case"!=":r.push(i!=o);break;case"or":r.push(e.lib.boolval(i)||e.lib.boolval(o));break;case"b-or":r.push(i|o);break;case"b-xor":r.push(i^o);break;case"and":r.push(e.lib.boolval(i)&&e.lib.boolval(o));break;case"b-and":r.push(i&o);break;case"**":r.push(i**o);break;case"not in":r.push(!t(i,o));break;case"in":r.push(t(i,o));break;case"matches":r.push(o.test(i));break;case"starts with":r.push("string"==typeof i&&0===i.indexOf(o));break;case"ends with":r.push("string"==typeof i&&-1!==i.indexOf(o,i.length-o.length));break;case"..":r.push(e.functions.range(i,o));break;default:throw new e.Error("Failed to parse operator: "+n+" is an unknown operator.")}},e}},function(e,t){e.exports=function(e){function t(e,t){const n=Object.prototype.toString.call(t).slice(8,-1);return null!=t&&n===e}return e.filters={upper:e=>"string"!=typeof e?e:e.toUpperCase(),lower:e=>"string"!=typeof e?e:e.toLowerCase(),capitalize:e=>"string"!=typeof e?e:e.substr(0,1).toUpperCase()+e.toLowerCase().substr(1),title:e=>"string"!=typeof e?e:e.toLowerCase().replace(/(^|\s)([a-z])/g,(e,t,n)=>t+n.toUpperCase()),length:t=>e.lib.is("Array",t)||"string"==typeof t?t.length:e.lib.is("Object",t)?void 0===t._keys?Object.keys(t).length:t._keys.length:0,reverse(e){if(t("Array",e))return e.reverse();if(t("String",e))return e.split("").reverse().join("");if(t("Object",e)){const t=e._keys||Object.keys(e).reverse();return e._keys=t,e}},sort(e){if(t("Array",e))return e.sort();if(t("Object",e)){delete e._keys;const t=Object.keys(e).sort((t,n)=>{let r,i;return e[t]>e[n]==!(e[t]<=e[n])?e[t]>e[n]?1:e[t]<e[n]?-1:0:isNaN(r=parseFloat(e[t]))||isNaN(i=parseFloat(e[n]))?"string"==typeof e[t]?e[t]>e[n].toString()?1:e[t]<e[n].toString()?-1:0:"string"==typeof e[n]?e[t].toString()>e[n]?1:e[t].toString()<e[n]?-1:0:null:r>i?1:r<i?-1:0});return e._keys=t,e}},keys(e){if(null==e)return;const t=e._keys||Object.keys(e),n=[];return t.forEach(t=>{"_keys"!==t&&Object.hasOwnProperty.call(e,t)&&n.push(t)}),n},url_encode(t){if(null==t)return;if(e.lib.is("Object",t)){const n=function(t,r){const i=[];return(t._keys||Object.keys(t)).forEach(o=>{if(!Object.prototype.hasOwnProperty.call(t,o))return;const s=r?r+"["+o+"]":o,a=t[o];i.push(e.lib.is("Object",a)||Array.isArray(a)?n(a,s):encodeURIComponent(s)+"="+encodeURIComponent(a))}),i.join("&amp;")};return n(t)}let n=encodeURIComponent(t);return n=n.replace("'","%27"),n},join(e,n){if(null==e)return;let r="",i=[],o=null;return n&&n[0]&&(r=n[0]),t("Array",e)?i=e:(o=e._keys||Object.keys(e),o.forEach(t=>{"_keys"!==t&&Object.hasOwnProperty.call(e,t)&&i.push(e[t])})),i.join(r)},default(t,n){if(void 0!==n&&n.length>1)throw new e.Error("default filter expects one argument");return null==t||""===t?void 0===n?"":n[0]:t},json_encode(n){if(null==n)return"null";if("object"==typeof n&&t("Array",n)){const t=[];return n.forEach(n=>{t.push(e.filters.json_encode(n))}),"["+t.join(",")+"]"}if("object"==typeof n&&t("Date",n))return'"'+n.toISOString()+'"';if("object"==typeof n){const t=n._keys||Object.keys(n),r=[];return t.forEach(t=>{r.push(JSON.stringify(t)+":"+e.filters.json_encode(n[t]))}),"{"+r.join(",")+"}"}return JSON.stringify(n)},merge(n,r){let i=[],o=0,s=[];if(t("Array",n)?r.forEach(e=>{t("Array",e)||(i={})}):i={},t("Array",i)||(i._keys=[]),t("Array",n)?n.forEach(e=>{i._keys&&i._keys.push(o),i[o]=e,o++}):(s=n._keys||Object.keys(n),s.forEach(e=>{i[e]=n[e],i._keys.push(e);const t=parseInt(e,10);!isNaN(t)&&t>=o&&(o=t+1)})),r.forEach(e=>{t("Array",e)?e.forEach(e=>{i._keys&&i._keys.push(o),i[o]=e,o++}):(s=e._keys||Object.keys(e),s.forEach(t=>{i[t]||i._keys.push(t),i[t]=e[t];const n=parseInt(t,10);!isNaN(n)&&n>=o&&(o=n+1)}))}),0===r.length)throw new e.Error("Filter merge expects at least one parameter");return i},date(t,n){const r=e.functions.date(t),i=n&&Boolean(n.length)?n[0]:"F j, Y H:i";return e.lib.date(i.replace(/\\\\/g,"\\"),r)},date_modify(t,n){if(null==t)return;if(void 0===n||1!==n.length)throw new e.Error("date_modify filter expects 1 argument");const r=n[0];let i;return e.lib.is("Date",t)&&(i=e.lib.strtotime(r,t.getTime()/1e3)),e.lib.is("String",t)&&(i=e.lib.strtotime(r,e.lib.strtotime(t))),e.lib.is("Number",t)&&(i=e.lib.strtotime(r,t)),new Date(1e3*i)},replace(t,n){if(null==t)return;const r=n[0];let i;for(i in r)Object.hasOwnProperty.call(r,i)&&"_keys"!==i&&(t=e.lib.replaceAll(t,i,r[i]));return t},format(t,n){if(null!=t)return e.lib.vsprintf(t,n)},striptags(t,n){if(null!=t)return e.lib.stripTags(t,n)},escape(t,n){if(null==t)return;let r="html";if(n&&Boolean(n.length)&&!0!==n[0]&&(r=n[0]),"html"===r){const n=t.toString().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");return new e.Markup(n,"html")}if("js"===r){const n=t.toString();let r="";for(let t=0;t<n.length;t++)if(n[t].match(/^[a-zA-Z0-9,._]$/))r+=n[t];else{const i=n.charCodeAt(t);r+=i<128?"\\x"+i.toString(16).toUpperCase():e.lib.sprintf("\\u%04s",i.toString(16).toUpperCase())}return new e.Markup(r,"js")}if("css"===r){const n=t.toString();let r="";for(let e=0;e<n.length;e++)n[e].match(/^[a-zA-Z0-9]$/)?r+=n[e]:r+="\\"+n.charCodeAt(e).toString(16).toUpperCase()+" ";return new e.Markup(r,"css")}if("url"===r){const n=e.filters.url_encode(t);return new e.Markup(n,"url")}if("html_attr"===r){const n=t.toString();let r="";for(let t=0;t<n.length;t++)if(n[t].match(/^[a-zA-Z0-9,.\-_]$/))r+=n[t];else if(n[t].match(/^[&<>"]$/))r+=n[t].replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");else{const i=n.charCodeAt(t);r+=i<=31&&9!==i&&10!==i&&13!==i?"&#xFFFD;":i<128?e.lib.sprintf("&#x%02s;",i.toString(16).toUpperCase()):e.lib.sprintf("&#x%04s;",i.toString(16).toUpperCase())}return new e.Markup(r,"html_attr")}throw new e.Error("escape strategy unsupported")},e:(t,n)=>e.filters.escape(t,n),nl2br(t){if(null==t)return;const n="<br />BACKSLASH_n_replace";return t=e.filters.escape(t).replace(/\r\n/g,n).replace(/\r/g,n).replace(/\n/g,n),t=e.lib.replaceAll(t,"BACKSLASH_n_replace","\n"),new e.Markup(t)},number_format(e,t){let n=e;const r=t&&t[0]?t[0]:void 0,i=t&&void 0!==t[1]?t[1]:".",o=t&&void 0!==t[2]?t[2]:",";n=String(n).replace(/[^0-9+\-Ee.]/g,"");const s=isFinite(Number(n))?Number(n):0,a=isFinite(Number(r))?Math.abs(r):0;let c="";return c=(a?function(e,t){const n=10**t;return String(Math.round(e*n)/n)}(s,a):String(Math.round(s))).split("."),c[0].length>3&&(c[0]=c[0].replace(/\B(?=(?:\d{3})+(?!\d))/g,o)),(c[1]||"").length<a&&(c[1]=c[1]||"",c[1]+=new Array(a-c[1].length+1).join("0")),c.join(i)},trim(e,t){if(null==e)return;let n,r=String(e);n=t&&t[0]?String(t[0]):" \n\r\t\f\v            ​\u2028\u2029　";for(let e=0;e<r.length;e++)if(-1===n.indexOf(r.charAt(e))){r=r.substring(e);break}for(let e=r.length-1;e>=0;e--)if(-1===n.indexOf(r.charAt(e))){r=r.substring(0,e+1);break}return-1===n.indexOf(r.charAt(0))?r:""},truncate(e,t){let n=30,r=!1,i="...";if(e=String(e),t&&(t[0]&&(n=t[0]),t[1]&&(r=t[1]),t[2]&&(i=t[2])),e.length>n){if(r&&(n=e.indexOf(" ",n),-1===n))return e;e=e.substr(0,n)+i}return e},slice(t,n){if(null==t)return;if(void 0===n||0===n.length)throw new e.Error("slice filter expects at least 1 argument");const r=n[0]||0,i=n.length>1?n[1]:t.length,o=r>=0?r:Math.max(t.length+r,0);if(e.lib.is("Array",t)){const e=[];for(let n=o;n<o+i&&n<t.length;n++)e.push(t[n]);return e}if(e.lib.is("String",t))return t.substr(o,i);throw new e.Error("slice filter expects value to be an array or string")},abs(e){if(null!=e)return Math.abs(e)},first(e){if(t("Array",e))return e[0];if(t("Object",e)){if("_keys"in e)return e[e._keys[0]]}else if("string"==typeof e)return e.substr(0,1)},split(t,n){if(null!=t){if(void 0===n||0===n.length||n.length>2)throw new e.Error("split filter expects 1 or 2 argument");if(e.lib.is("String",t)){const e=n[0],r=n[1],i=t.split(e);if(void 0===r)return i;if(r<0)return t.split(e,i.length+r);const o=[];if(""===e)for(;i.length>0;){let e="";for(let t=0;t<r&&i.length>0;t++)e+=i.shift();o.push(e)}else{for(let e=0;e<r-1&&i.length>0;e++)o.push(i.shift());i.length>0&&o.push(i.join(e))}return o}throw new e.Error("split filter expects value to be a string")}},last(t){if(e.lib.is("Object",t)){let e;return e=void 0===t._keys?Object.keys(t):t._keys,t[e[e.length-1]]}return t[t.length-1]},raw:t=>new e.Markup(t),batch(t,n){let r=n.shift();const i=n.shift();let o,s;if(!e.lib.is("Array",t))throw new e.Error("batch filter expects items to be an array");if(!e.lib.is("Number",r))throw new e.Error("batch filter expects size to be a number");r=Math.ceil(r);const a=e.lib.chunkArray(t,r);if(i&&t.length%r!=0){for(o=a.pop(),s=r-o.length;s--;)o.push(i);a.push(o)}return a},round(t,n){const r=(n=n||[]).length>0?n[0]:0,i=n.length>1?n[1]:"common";if(t=parseFloat(t),r&&!e.lib.is("Number",r))throw new e.Error("round filter expects precision to be a number");if("common"===i)return e.lib.round(t,r);if(!e.lib.is("Function",Math[i]))throw new e.Error("round filter expects method to be 'floor', 'ceil', or 'common'");return Math[i](t*10**r)/10**r},spaceless:e=>e.replace(/>\s+</g,"><").trim()},e.filter=function(t,n,r){if(!e.filters[t])throw new e.Error("Unable to find filter "+t);return e.filters[t].call(this,n,r)},e.filter.extend=function(t,n){e.filters[t]=n},e}},function(e,t,n){e.exports=function(t){return t.functions={range(e,t,n){const r=[];let i,o;const s=n||1;let a=!1;if(isNaN(e)||isNaN(t)?isNaN(e)&&isNaN(t)?(a=!0,i=e.charCodeAt(0),o=t.charCodeAt(0)):(i=isNaN(e)?0:e,o=isNaN(t)?0:t):(i=parseInt(e,10),o=parseInt(t,10)),i>o)for(;i>=o;)r.push(a?String.fromCharCode(i):i),i-=s;else for(;i<=o;)r.push(a?String.fromCharCode(i):i),i+=s;return r},cycle:(e,t)=>e[t%e.length],dump(...e){const t=[...e],n=this;let r=0,i="";const o=function(e){let t="";for(;e>0;)e--,t+="  ";return t},s=function(e){i+=o(r),"object"==typeof e?a(e):"function"==typeof e?i+="function()\n":"string"==typeof e?i+="string("+e.length+') "'+e+'"\n':"number"==typeof e?i+="number("+e+")\n":"boolean"==typeof e&&(i+="bool("+e+")\n")},a=function(e){let t;if(null===e)i+="NULL\n";else if(void 0===e)i+="undefined\n";else if("object"==typeof e){for(t in i+=o(r)+typeof e,r++,i+="("+function(e){let t,n=0;for(t in e)Object.hasOwnProperty.call(e,t)&&n++;return n}(e)+") {\n",e)Object.hasOwnProperty.call(e,t)&&(i+=o(r)+"["+t+"]=> \n",s(e[t]));r--,i+=o(r)+"}\n"}else s(e)};return 0===t.length&&t.push(n.context),t.forEach(e=>{a(e)}),i},date(e){let n;if(null==e||""===e)n=new Date;else if(t.lib.is("Date",e))n=e;else if(t.lib.is("String",e))n=e.match(/^\d+$/)?new Date(1e3*e):new Date(1e3*t.lib.strtotime(e));else{if(!t.lib.is("Number",e))throw new t.Error("Unable to parse date "+e);n=new Date(1e3*e)}return n},block(e){const t=this,n=t.getBlock(e);if(void 0!==n)return n.render(t,t.context)},parent(){return this.getBlock(this.getNestingStackToken(t.logic.type.block).blockName,!0).render(this,this.context)},attribute:(e,n,r)=>t.lib.is("Object",e)&&Object.hasOwnProperty.call(e,n)?"function"==typeof e[n]?e[n].apply(void 0,r):e[n]:e[n]||void 0,max:(e,...n)=>t.lib.is("Object",e)?(delete e._keys,t.lib.max(e)):t.lib.max.apply(null,[e,...n]),min:(e,...n)=>t.lib.is("Object",e)?(delete e._keys,t.lib.min(e)):t.lib.min.apply(null,[e,...n]),template_from_string(e){return void 0===e&&(e=""),t.Templates.parsers.twig({options:this.template.options,data:e})},random(e){function n(e){const t=Math.floor(2147483648*Math.random()),n=Math.min.call(null,0,e),r=Math.max.call(null,0,e);return n+Math.floor((r-n+1)*t/2147483648)}if(t.lib.is("Number",e))return n(e);if(t.lib.is("String",e))return e.charAt(n(e.length-1));if(t.lib.is("Array",e))return e[n(e.length-1)];if(t.lib.is("Object",e)){const t=Object.keys(e);return e[t[n(t.length-1)]]}return n(2147483647)},source(n,r){let i,o,s=!1;o=void 0!==e.exports&&"undefined"==typeof window?"fs":"ajax";const a={id:n,path:n,method:o,parser:"source",async:!1,fetchTemplateSource:!0};void 0===r&&(r=!1);try{i=t.Templates.loadRemote(n,a),null==i?i="":s=!0}catch(e){t.log.debug("Twig.functions.source: ","Problem loading template  ",e)}return s||r?i:'Template "{name}" is not defined.'.replace("{name}",n)}},t._function=function(e,n,r){if(!t.functions[e])throw new t.Error("Unable to find function "+e);return t.functions[e](n,r)},t._function.extend=function(e,n){t.functions[e]=n},t}},function(e,t,n){e.exports=function(e){return e.lib={},e.lib.sprintf=n(0),e.lib.vsprintf=n(11),e.lib.round=n(12),e.lib.max=n(13),e.lib.min=n(14),e.lib.stripTags=n(15),e.lib.strtotime=n(16),e.lib.date=n(17),e.lib.boolval=n(18),e.lib.is=function(e,t){if(null==t)return!1;switch(e){case"Array":return Array.isArray(t);case"Date":return t instanceof Date;case"String":return"string"==typeof t||t instanceof String;case"Number":return"number"==typeof t||t instanceof Number;case"Function":return"function"==typeof t;case"Object":return t instanceof Object;default:return!1}},e.lib.replaceAll=function(e,t,n){const r=t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return e.replace(new RegExp(r,"g"),n)},e.lib.chunkArray=function(e,t){const n=[];let r=0;const i=e.length;if(t<1||!Array.isArray(e))return[];for(;r<i;)n.push(e.slice(r,r+=t));return n},e}},function(e,t,n){"use strict";e.exports=function(e,t){return n(0).apply(this,[e].concat(t))}},function(e,t,n){"use strict";e.exports=function(e,t,n){var r,i,o,s;if(t|=0,o=(e*=r=Math.pow(10,t))%1==.5*(s=e>0|-(e<0)),i=Math.floor(e),o)switch(n){case"PHP_ROUND_HALF_DOWN":e=i+(s<0);break;case"PHP_ROUND_HALF_EVEN":e=i+i%2*s;break;case"PHP_ROUND_HALF_ODD":e=i+!(i%2);break;default:e=i+(s>0)}return(o?e:Math.round(e))/r}},function(e,t,n){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e};e.exports=function(){var e,t,n=0,i=0,o=arguments,s=o.length,a=function(e){if("[object Array]"===Object.prototype.toString.call(e))return e;var t=[];for(var n in e)e.hasOwnProperty(n)&&t.push(e[n]);return t},c=function e(t,n){var i=0,o=0,s=0,c=0,u=0;if(t===n)return 0;if("object"===(void 0===t?"undefined":r(t))){if("object"===(void 0===n?"undefined":r(n))){if(t=a(t),n=a(n),u=t.length,(c=n.length)>u)return 1;if(c<u)return-1;for(i=0,o=u;i<o;++i){if(1===(s=e(t[i],n[i])))return 1;if(-1===s)return-1}return 0}return-1}return"object"===(void 0===n?"undefined":r(n))?1:isNaN(n)&&!isNaN(t)?0===t?0:t<0?1:-1:isNaN(t)&&!isNaN(n)?0===n?0:n>0?1:-1:n===t?0:n>t?1:-1};if(0===s)throw new Error("At least one value should be passed to max()");if(1===s){if("object"!==r(o[0]))throw new Error("Wrong parameter count for max()");if(0===(e=a(o[0])).length)throw new Error("Array must contain at least one element for max()")}else e=o;for(t=e[0],n=1,i=e.length;n<i;++n)1===c(t,e[n])&&(t=e[n]);return t}},function(e,t,n){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e};e.exports=function(){var e,t,n=0,i=0,o=arguments,s=o.length,a=function(e){if("[object Array]"===Object.prototype.toString.call(e))return e;var t=[];for(var n in e)e.hasOwnProperty(n)&&t.push(e[n]);return t},c=function e(t,n){var i=0,o=0,s=0,c=0,u=0;if(t===n)return 0;if("object"===(void 0===t?"undefined":r(t))){if("object"===(void 0===n?"undefined":r(n))){if(t=a(t),n=a(n),u=t.length,(c=n.length)>u)return 1;if(c<u)return-1;for(i=0,o=u;i<o;++i){if(1===(s=e(t[i],n[i])))return 1;if(-1===s)return-1}return 0}return-1}return"object"===(void 0===n?"undefined":r(n))?1:isNaN(n)&&!isNaN(t)?0===t?0:t<0?1:-1:isNaN(t)&&!isNaN(n)?0===n?0:n>0?1:-1:n===t?0:n>t?1:-1};if(0===s)throw new Error("At least one value should be passed to min()");if(1===s){if("object"!==r(o[0]))throw new Error("Wrong parameter count for min()");if(0===(e=a(o[0])).length)throw new Error("Array must contain at least one element for min()")}else e=o;for(t=e[0],n=1,i=e.length;n<i;++n)-1===c(t,e[n])&&(t=e[n]);return t}},function(e,t,n){"use strict";e.exports=function(e,t){return t=(((t||"")+"").toLowerCase().match(/<[a-z][a-z0-9]*>/g)||[]).join(""),e.replace(/<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi,"").replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,(function(e,n){return t.indexOf("<"+n.toLowerCase()+">")>-1?e:""}))}},function(e,t,n){"use strict";e.exports=function(e,t){var n,r,i,o,s,a,c,u,l;if(!e)return!1;e=e.replace(/^\s+|\s+$/g,"").replace(/\s{2,}/g," ").replace(/[\t\r\n]/g,"").toLowerCase();var p=new RegExp(["^(\\d{1,4})","([\\-\\.\\/:])","(\\d{1,2})","([\\-\\.\\/:])","(\\d{1,4})","(?:\\s(\\d{1,2}):(\\d{2})?:?(\\d{2})?)?","(?:\\s([A-Z]+)?)?$"].join(""));if((r=e.match(p))&&r[2]===r[4])if(r[1]>1901)switch(r[2]){case"-":return!(r[3]>12||r[5]>31)&&new Date(r[1],parseInt(r[3],10)-1,r[5],r[6]||0,r[7]||0,r[8]||0,r[9]||0)/1e3;case".":return!1;case"/":return!(r[3]>12||r[5]>31)&&new Date(r[1],parseInt(r[3],10)-1,r[5],r[6]||0,r[7]||0,r[8]||0,r[9]||0)/1e3}else if(r[5]>1901)switch(r[2]){case"-":case".":return!(r[3]>12||r[1]>31)&&new Date(r[5],parseInt(r[3],10)-1,r[1],r[6]||0,r[7]||0,r[8]||0,r[9]||0)/1e3;case"/":return!(r[1]>12||r[3]>31)&&new Date(r[5],parseInt(r[1],10)-1,r[3],r[6]||0,r[7]||0,r[8]||0,r[9]||0)/1e3}else switch(r[2]){case"-":return!(r[3]>12||r[5]>31||r[1]<70&&r[1]>38)&&(o=r[1]>=0&&r[1]<=38?+r[1]+2e3:r[1],new Date(o,parseInt(r[3],10)-1,r[5],r[6]||0,r[7]||0,r[8]||0,r[9]||0)/1e3);case".":return r[5]>=70?!(r[3]>12||r[1]>31)&&new Date(r[5],parseInt(r[3],10)-1,r[1],r[6]||0,r[7]||0,r[8]||0,r[9]||0)/1e3:r[5]<60&&!r[6]&&!(r[1]>23||r[3]>59)&&(i=new Date,new Date(i.getFullYear(),i.getMonth(),i.getDate(),r[1]||0,r[3]||0,r[5]||0,r[9]||0)/1e3);case"/":return!(r[1]>12||r[3]>31||r[5]<70&&r[5]>38)&&(o=r[5]>=0&&r[5]<=38?+r[5]+2e3:r[5],new Date(o,parseInt(r[1],10)-1,r[3],r[6]||0,r[7]||0,r[8]||0,r[9]||0)/1e3);case":":return!(r[1]>23||r[3]>59||r[5]>59)&&(i=new Date,new Date(i.getFullYear(),i.getMonth(),i.getDate(),r[1]||0,r[3]||0,r[5]||0)/1e3)}if("now"===e)return null===t||isNaN(t)?(new Date).getTime()/1e3|0:0|t;if(!isNaN(n=Date.parse(e)))return n/1e3|0;if(p=new RegExp(["^([0-9]{4}-[0-9]{2}-[0-9]{2})","[ t]","([0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]+)?)","([\\+-][0-9]{2}(:[0-9]{2})?|z)"].join("")),(r=e.match(p))&&("z"===r[4]?r[4]="Z":r[4].match(/^([\+-][0-9]{2})$/)&&(r[4]=r[4]+":00"),!isNaN(n=Date.parse(r[1]+"T"+r[2]+r[4]))))return n/1e3|0;function h(e){var t=e.split(" "),n=t[0],r=t[1].substring(0,3),i=/\d+/.test(n),o=("last"===n?-1:1)*("ago"===t[2]?-1:1);if(i&&(o*=parseInt(n,10)),c.hasOwnProperty(r)&&!t[1].match(/^mon(day|\.)?$/i))return s["set"+c[r]](s["get"+c[r]]()+o);if("wee"===r)return s.setDate(s.getDate()+7*o);if("next"===n||"last"===n)!function(e,t,n){var r,i=a[t];void 0!==i&&(0==(r=i-s.getDay())?r=7*n:r>0&&"last"===e?r-=7:r<0&&"next"===e&&(r+=7),s.setDate(s.getDate()+r))}(n,r,o);else if(!i)return!1;return!0}if(s=t?new Date(1e3*t):new Date,a={sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6},c={yea:"FullYear",mon:"Month",day:"Date",hou:"Hours",min:"Minutes",sec:"Seconds"},"(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?)",!(r=e.match(new RegExp("([+-]?\\d+\\s(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?)|(last|next)\\s(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?))(\\sago)?","gi"))))return!1;for(l=0,u=r.length;l<u;l++)if(!h(r[l]))return!1;return s.getTime()/1e3}},function(e,t,n){"use strict";e.exports=function(e,t){var n,r,i=["Sun","Mon","Tues","Wednes","Thurs","Fri","Satur","January","February","March","April","May","June","July","August","September","October","November","December"],o=/\\?(.?)/gi,s=function(e,t){return r[e]?r[e]():t},a=function(e,t){for(e=String(e);e.length<t;)e="0"+e;return e};return r={d:function(){return a(r.j(),2)},D:function(){return r.l().slice(0,3)},j:function(){return n.getDate()},l:function(){return i[r.w()]+"day"},N:function(){return r.w()||7},S:function(){var e=r.j(),t=e%10;return t<=3&&1===parseInt(e%100/10,10)&&(t=0),["st","nd","rd"][t-1]||"th"},w:function(){return n.getDay()},z:function(){var e=new Date(r.Y(),r.n()-1,r.j()),t=new Date(r.Y(),0,1);return Math.round((e-t)/864e5)},W:function(){var e=new Date(r.Y(),r.n()-1,r.j()-r.N()+3),t=new Date(e.getFullYear(),0,4);return a(1+Math.round((e-t)/864e5/7),2)},F:function(){return i[6+r.n()]},m:function(){return a(r.n(),2)},M:function(){return r.F().slice(0,3)},n:function(){return n.getMonth()+1},t:function(){return new Date(r.Y(),r.n(),0).getDate()},L:function(){var e=r.Y();return e%4==0&e%100!=0|e%400==0},o:function(){var e=r.n(),t=r.W();return r.Y()+(12===e&&t<9?1:1===e&&t>9?-1:0)},Y:function(){return n.getFullYear()},y:function(){return r.Y().toString().slice(-2)},a:function(){return n.getHours()>11?"pm":"am"},A:function(){return r.a().toUpperCase()},B:function(){var e=3600*n.getUTCHours(),t=60*n.getUTCMinutes(),r=n.getUTCSeconds();return a(Math.floor((e+t+r+3600)/86.4)%1e3,3)},g:function(){return r.G()%12||12},G:function(){return n.getHours()},h:function(){return a(r.g(),2)},H:function(){return a(r.G(),2)},i:function(){return a(n.getMinutes(),2)},s:function(){return a(n.getSeconds(),2)},u:function(){return a(1e3*n.getMilliseconds(),6)},e:function(){throw new Error("Not supported (see source code of date() for timezone on how to add support)")},I:function(){return new Date(r.Y(),0)-Date.UTC(r.Y(),0)!=new Date(r.Y(),6)-Date.UTC(r.Y(),6)?1:0},O:function(){var e=n.getTimezoneOffset(),t=Math.abs(e);return(e>0?"-":"+")+a(100*Math.floor(t/60)+t%60,4)},P:function(){var e=r.O();return e.substr(0,3)+":"+e.substr(3,2)},T:function(){return"UTC"},Z:function(){return 60*-n.getTimezoneOffset()},c:function(){return"Y-m-d\\TH:i:sP".replace(o,s)},r:function(){return"D, d M Y H:i:s O".replace(o,s)},U:function(){return n/1e3|0}},function(e,t){return n=void 0===t?new Date:t instanceof Date?new Date(t):new Date(1e3*t),e.replace(o,s)}(e,t)}},function(e,t,n){"use strict";e.exports=function(e){return!1!==e&&0!==e&&0!==e&&""!==e&&"0"!==e&&(!Array.isArray(e)||0!==e.length)&&null!=e}},function(e,t){e.exports=function(e){"use strict";e.Templates.registerLoader("ajax",(function(t,n,r,i){let o;const{precompiled:s}=n,a=this.parsers[n.parser]||this.parser.twig;if("undefined"==typeof XMLHttpRequest)throw new e.Error('Unsupported platform: Unable to do ajax requests because there is no "XMLHTTPRequest" implementation');const c=new XMLHttpRequest;return c.onreadystatechange=function(){let u=null;4===c.readyState&&(200===c.status||window.cordova&&0===c.status?(e.log.debug("Got template ",c.responseText),u=!0===s?JSON.parse(c.responseText):c.responseText,n.url=t,n.data=u,o=a.call(this,n),"function"==typeof r&&r(o)):"function"==typeof i&&i(c))},c.open("GET",t,Boolean(n.async)),c.send(),!!n.async||o}))}},function(e,t,n){e.exports=function(e){"use strict";let t,r;try{t=n(21),r=n(1)}catch(e){}e.Templates.registerLoader("fs",(function(n,i,o,s){let a,c=null;const{precompiled:u}=i,l=this.parsers[i.parser]||this.parser.twig;if(!t||!r)throw new e.Error('Unsupported platform: Unable to load from file because there is no "fs" or "path" implementation');const p=function(e,t){e?"function"==typeof s&&s(e):(!0===u&&(t=JSON.parse(t)),i.data=t,i.path=i.path||n,a=l.call(this,i),"function"==typeof o&&o(a))};if(i.path=i.path||n,i.async)return t.stat(i.path,(n,r)=>{!n&&r.isFile()?t.readFile(i.path,"utf8",p):"function"==typeof s&&s(new e.Error("Unable to find template file "+i.path))}),!0;try{if(!t.statSync(i.path).isFile())throw new e.Error("Unable to find template file "+i.path)}catch(t){throw new e.Error("Unable to find template file "+i.path)}return c=t.readFileSync(i.path,"utf8"),p(void 0,c),a}))}},function(e,t){e.exports=n(49)},function(e,t){e.exports=function(e){"use strict";for(e.logic={},e.logic.type={if_:"Twig.logic.type.if",endif:"Twig.logic.type.endif",for_:"Twig.logic.type.for",endfor:"Twig.logic.type.endfor",else_:"Twig.logic.type.else",elseif:"Twig.logic.type.elseif",set:"Twig.logic.type.set",setcapture:"Twig.logic.type.setcapture",endset:"Twig.logic.type.endset",filter:"Twig.logic.type.filter",endfilter:"Twig.logic.type.endfilter",apply:"Twig.logic.type.apply",endapply:"Twig.logic.type.endapply",shortblock:"Twig.logic.type.shortblock",block:"Twig.logic.type.block",endblock:"Twig.logic.type.endblock",extends_:"Twig.logic.type.extends",use:"Twig.logic.type.use",include:"Twig.logic.type.include",spaceless:"Twig.logic.type.spaceless",endspaceless:"Twig.logic.type.endspaceless",macro:"Twig.logic.type.macro",endmacro:"Twig.logic.type.endmacro",import_:"Twig.logic.type.import",from:"Twig.logic.type.from",embed:"Twig.logic.type.embed",endembed:"Twig.logic.type.endembed",with:"Twig.logic.type.with",endwith:"Twig.logic.type.endwith",deprecated:"Twig.logic.type.deprecated"},e.logic.definitions=[{type:e.logic.type.if_,regex:/^if\s?([\s\S]+)$/,next:[e.logic.type.else_,e.logic.type.elseif,e.logic.type.endif],open:!0,compile(t){const n=t.match[1];return t.stack=e.expression.compile.call(this,{type:e.expression.type.expression,value:n}).stack,delete t.match,t},parse(t,n,r){const i=this;return e.expression.parseAsync.call(i,t.stack,n).then(o=>(r=!0,e.lib.boolval(o)?(r=!1,i.parseAsync(t.output,n)):"")).then(e=>({chain:r,output:e}))}},{type:e.logic.type.elseif,regex:/^elseif\s?([^\s].*)$/,next:[e.logic.type.else_,e.logic.type.elseif,e.logic.type.endif],open:!1,compile(t){const n=t.match[1];return t.stack=e.expression.compile.call(this,{type:e.expression.type.expression,value:n}).stack,delete t.match,t},parse(t,n,r){const i=this;return e.expression.parseAsync.call(i,t.stack,n).then(o=>r&&e.lib.boolval(o)?(r=!1,i.parseAsync(t.output,n)):"").then(e=>({chain:r,output:e}))}},{type:e.logic.type.else_,regex:/^else$/,next:[e.logic.type.endif,e.logic.type.endfor],open:!1,parse(t,n,r){let i=e.Promise.resolve("");return r&&(i=this.parseAsync(t.output,n)),i.then(e=>({chain:r,output:e}))}},{type:e.logic.type.endif,regex:/^endif$/,next:[],open:!1},{type:e.logic.type.for_,regex:/^for\s+([a-zA-Z0-9_,\s]+)\s+in\s+([\S\s]+?)(?:\s+if\s+([^\s].*))?$/,next:[e.logic.type.else_,e.logic.type.endfor],open:!0,compile(t){const n=t.match[1],r=t.match[2],i=t.match[3];let o=null;if(t.keyVar=null,t.valueVar=null,n.indexOf(",")>=0){if(o=n.split(","),2!==o.length)throw new e.Error("Invalid expression in for loop: "+n);t.keyVar=o[0].trim(),t.valueVar=o[1].trim()}else t.valueVar=n.trim();return t.expression=e.expression.compile.call(this,{type:e.expression.type.expression,value:r}).stack,i&&(t.conditional=e.expression.compile.call(this,{type:e.expression.type.expression,value:i}).stack),delete t.match,t},parse(t,n,r){const i=[];let o,s,a=0;const c=this,{conditional:u}=t,l=function(r,s){const l={...n};return l[t.valueVar]=s,t.keyVar&&(l[t.keyVar]=r),l.loop=function(e,t){const r=void 0!==u;return{index:e+1,index0:e,revindex:r?void 0:t-e,revindex0:r?void 0:t-e-1,first:0===e,last:r?void 0:e===t-1,length:r?void 0:t,parent:n}}(a,o),(void 0===u?e.Promise.resolve(!0):e.expression.parseAsync.call(c,u,l)).then(e=>{if(e)return c.parseAsync(t.output,l).then(e=>{i.push(e),a+=1})}).then(()=>{delete l.loop,delete l[t.valueVar],delete l[t.keyVar],e.merge(n,l,!0)})};return e.expression.parseAsync.call(c,t.expression,n).then(t=>Array.isArray(t)?(o=t.length,e.async.forEach(t,e=>l(a,e))):e.lib.is("Object",t)?(s=void 0===t._keys?Object.keys(t):t._keys,o=s.length,e.async.forEach(s,e=>{if("_keys"!==e)return l(e,t[e])})):void 0).then(()=>({chain:0===i.length,context:n,output:e.output.call(c.template,i)}))}},{type:e.logic.type.endfor,regex:/^endfor$/,next:[],open:!1},{type:e.logic.type.set,regex:/^set\s+([a-zA-Z0-9_,\s]+)\s*=\s*([\s\S]+)$/,next:[],open:!0,compile(t){const n=t.match[1].trim(),r=t.match[2],i=e.expression.compile.call(this,{type:e.expression.type.expression,value:r}).stack;return t.key=n,t.expression=i,delete t.match,t},parse(t,n,r){const{key:i}=t;return e.expression.parseAsync.call(this,t.expression,n).then(e=>(e===n&&(e={...e}),n[i]=e,{chain:r,context:n}))}},{type:e.logic.type.setcapture,regex:/^set\s+([a-zA-Z0-9_,\s]+)$/,next:[e.logic.type.endset],open:!0,compile(e){const t=e.match[1].trim();return e.key=t,delete e.match,e},parse(e,t,n){const r=this,{key:i}=e;return r.parseAsync(e.output,t).then(e=>(r.context[i]=e,t[i]=e,{chain:n,context:t}))}},{type:e.logic.type.endset,regex:/^endset$/,next:[],open:!1},{type:e.logic.type.filter,regex:/^filter\s+(.+)$/,next:[e.logic.type.endfilter],open:!0,compile(t){const n="|"+t.match[1].trim();return t.stack=e.expression.compile.call(this,{type:e.expression.type.expression,value:n}).stack,delete t.match,t},parse(t,n,r){const i=this;return i.parseAsync(t.output,n).then(r=>{const o=[{type:e.expression.type.string,value:r}].concat(t.stack);return e.expression.parseAsync.call(i,o,n)}).then(e=>({chain:r,output:e}))}},{type:e.logic.type.endfilter,regex:/^endfilter$/,next:[],open:!1},{type:e.logic.type.apply,regex:/^apply\s+(.+)$/,next:[e.logic.type.endapply],open:!0,compile(t){const n="|"+t.match[1].trim();return t.stack=e.expression.compile.call(this,{type:e.expression.type.expression,value:n}).stack,delete t.match,t},parse(t,n,r){const i=this;return i.parseAsync(t.output,n).then(r=>{const o=[{type:e.expression.type.string,value:r}].concat(t.stack);return e.expression.parseAsync.call(i,o,n)}).then(e=>({chain:r,output:e}))}},{type:e.logic.type.endapply,regex:/^endapply$/,next:[],open:!1},{type:e.logic.type.block,regex:/^block\s+(\w+)$/,next:[e.logic.type.endblock],open:!0,compile:e=>(e.blockName=e.match[1].trim(),delete e.match,e),parse(t,n,r){const i=this;let o=e.Promise.resolve();return i.template.blocks.defined[t.blockName]=new e.Block(i.template,t),(null===i.template.parentTemplate||i.template.parentTemplate instanceof e.Template)&&(o=i.getBlock(t.blockName).render(i,n)),o.then(e=>({chain:r,output:e}))}},{type:e.logic.type.shortblock,regex:/^block\s+(\w+)\s+(.+)$/,next:[],open:!0,compile(t){return t.expression=t.match[2].trim(),t.output=e.expression.compile({type:e.expression.type.expression,value:t.expression}).stack,e.logic.handler[e.logic.type.block].compile.apply(this,[t])},parse(...t){return e.logic.handler[e.logic.type.block].parse.apply(this,t)}},{type:e.logic.type.endblock,regex:/^endblock(?:\s+(\w+))?$/,next:[],open:!1},{type:e.logic.type.extends_,regex:/^extends\s+(.+)$/,next:[],open:!0,compile(t){const n=t.match[1].trim();return delete t.match,t.stack=e.expression.compile.call(this,{type:e.expression.type.expression,value:n}).stack,t},parse(t,n,r){const i=this;return e.expression.parseAsync.call(i,t.stack,n).then(e=>(i.template.parentTemplate=e,{chain:r,output:""}))}},{type:e.logic.type.use,regex:/^use\s+(.+)$/,next:[],open:!0,compile(t){const n=t.match[1].trim();return delete t.match,t.stack=e.expression.compile.call(this,{type:e.expression.type.expression,value:n}).stack,t},parse(t,n,r){const i=this;return e.expression.parseAsync.call(i,t.stack,n).then(t=>{const n=i.template.importFile(t),r=new e.ParseState(n);return r.parseAsync(n.tokens).then(()=>{i.template.blocks.imported={...i.template.blocks.imported,...r.getBlocks()}})}).then(()=>({chain:r,output:""}))}},{type:e.logic.type.include,regex:/^include\s+(.+?)(?:\s|$)(ignore missing(?:\s|$))?(?:with\s+([\S\s]+?))?(?:\s|$)(only)?$/,next:[],open:!0,compile(t){const{match:n}=t,r=n[1].trim(),i=void 0!==n[2],o=n[3],s=void 0!==n[4]&&n[4].length;return delete t.match,t.only=s,t.ignoreMissing=i,t.stack=e.expression.compile.call(this,{type:e.expression.type.expression,value:r}).stack,void 0!==o&&(t.withStack=e.expression.compile.call(this,{type:e.expression.type.expression,value:o.trim()}).stack),t},parse(t,n,r){let i=t.only?{}:{...n};const{ignoreMissing:o}=t,s=this;let a=null;const c={chain:r,output:""};return a=void 0===t.withStack?e.Promise.resolve():e.expression.parseAsync.call(s,t.withStack,n).then(e=>{i={...i,...e}}),a.then(()=>e.expression.parseAsync.call(s,t.stack,n)).then(t=>{if(t instanceof e.Template)return t.renderAsync(i,{isInclude:!0});try{return s.template.importFile(t).renderAsync(i,{isInclude:!0})}catch(e){if(o)return"";throw e}}).then(e=>(""!==e&&(c.output=e),c))}},{type:e.logic.type.spaceless,regex:/^spaceless$/,next:[e.logic.type.endspaceless],open:!0,parse(t,n,r){return this.parseAsync(t.output,n).then(t=>{let n=t.replace(/>\s+</g,"><").trim();return n=new e.Markup(n),{chain:r,output:n}})}},{type:e.logic.type.endspaceless,regex:/^endspaceless$/,next:[],open:!1},{type:e.logic.type.macro,regex:/^macro\s+(\w+)\s*\(\s*((?:\w+(?:\s*=\s*([\s\S]+))?(?:,\s*)?)*)\s*\)$/,next:[e.logic.type.endmacro],open:!0,compile(t){const n=t.match[1],r=t.match[2].split(/\s*,\s*/),i=r.map(e=>e.split(/\s*=\s*/)[0]),o=i.length;if(o>1){const t={};for(let n=0;n<o;n++){const r=i[n];if(t[r])throw new e.Error("Duplicate arguments for parameter: "+r);t[r]=1}}return t.macroName=n,t.parameters=i,t.defaults=r.reduce((function(t,n){const r=n.split(/\s*=\s*/),i=r[0],o=r[1];return t[i]=o?e.expression.compile.call(this,{type:e.expression.type.expression,value:o}).stack:void 0,t}),{}),delete t.match,t},parse(t,n,r){const i=this;return i.macros[t.macroName]=function(...r){const o={_self:i.macros};return e.async.forEach(t.parameters,(function(i,s){return void 0!==r[s]?(o[i]=r[s],!0):void 0!==t.defaults[i]?e.expression.parseAsync.call(this,t.defaults[i],n).then(t=>(o[i]=t,e.Promise.resolve())):(o[i]=void 0,!0)})).then(()=>i.parseAsync(t.output,o))},{chain:r,output:""}}},{type:e.logic.type.endmacro,regex:/^endmacro$/,next:[],open:!1},{type:e.logic.type.import_,regex:/^import\s+(.+)\s+as\s+(\w+)$/,next:[],open:!0,compile(t){const n=t.match[1].trim(),r=t.match[2].trim();return delete t.match,t.expression=n,t.contextName=r,t.stack=e.expression.compile.call(this,{type:e.expression.type.expression,value:n}).stack,t},parse(t,n,r){const i=this,o={chain:r,output:""};return"_self"===t.expression?(n[t.contextName]=i.macros,o):e.expression.parseAsync.call(i,t.stack,n).then(e=>i.template.importFile(e||t.expression)).then(r=>{const i=new e.ParseState(r);return i.parseAsync(r.tokens).then(()=>(n[t.contextName]=i.macros,o))})}},{type:e.logic.type.from,regex:/^from\s+(.+)\s+import\s+([a-zA-Z0-9_, ]+)$/,next:[],open:!0,compile(t){const n=t.match[1].trim(),r=t.match[2].trim().split(/\s*,\s*/),i={};for(let e=0;e<r.length;e++){const t=r[e],n=t.match(/^(\w+)\s+as\s+(\w+)$/);n?i[n[1].trim()]=n[2].trim():t.match(/^(\w+)$/)&&(i[t]=t)}return delete t.match,t.expression=n,t.macroNames=i,t.stack=e.expression.compile.call(this,{type:e.expression.type.expression,value:n}).stack,t},parse(t,n,r){const i=this;let o;return o="_self"===t.expression?e.Promise.resolve(i.macros):e.expression.parseAsync.call(i,t.stack,n).then(e=>i.template.importFile(e||t.expression)).then(t=>{const n=new e.ParseState(t);return n.parseAsync(t.tokens).then(()=>n.macros)}),o.then(e=>{for(const r in t.macroNames)void 0!==e[r]&&(n[t.macroNames[r]]=e[r]);return{chain:r,output:""}})}},{type:e.logic.type.embed,regex:/^embed\s+(.+?)(?:\s+(ignore missing))?(?:\s+with\s+([\S\s]+?))?(?:\s+(only))?$/,next:[e.logic.type.endembed],open:!0,compile(t){const{match:n}=t,r=n[1].trim(),i=void 0!==n[2],o=n[3],s=void 0!==n[4]&&n[4].length;return delete t.match,t.only=s,t.ignoreMissing=i,t.stack=e.expression.compile.call(this,{type:e.expression.type.expression,value:r}).stack,void 0!==o&&(t.withStack=e.expression.compile.call(this,{type:e.expression.type.expression,value:o.trim()}).stack),t},parse(t,n,r){let i={},o=e.Promise.resolve(),s=this;return t.only||(i={...n}),void 0!==t.withStack&&(o=e.expression.parseAsync.call(s,t.withStack,n).then(e=>{i={...i,...e}})),o.then(()=>e.expression.parseAsync.call(s,t.stack,i)).then(n=>{const r=new e.Template({data:t.output,id:s.template.id,base:s.template.base,path:s.template.path,url:s.template.url,name:s.template.name,method:s.template.method,options:s.template.options});try{r.importFile(n)}catch(e){if(t.ignoreMissing)return"";throw s=null,e}return r.parentTemplate=n,r.renderAsync(i,{isInclude:!0})}).then(e=>({chain:r,output:e}))}},{type:e.logic.type.endembed,regex:/^endembed$/,next:[],open:!1},{type:e.logic.type.with,regex:/^(?:with\s+([\S\s]+?))(?:\s|$)(only)?$/,next:[e.logic.type.endwith],open:!0,compile(t){const{match:n}=t,r=n[1],i=void 0!==n[2]&&n[2].length;return delete t.match,t.only=i,void 0!==r&&(t.withStack=e.expression.compile.call(this,{type:e.expression.type.expression,value:r.trim()}).stack),t},parse(t,n,r){let i,o={};const s=this;let a=e.Promise.resolve();return t.only||(o={...n}),void 0!==t.withStack&&(a=e.expression.parseAsync.call(s,t.withStack,n).then(e=>{for(i in e)Object.hasOwnProperty.call(e,i)&&(o[i]=e[i])})),a.then(()=>s.parseAsync(t.output,o)).then(e=>({chain:r,output:e}))}},{type:e.logic.type.endwith,regex:/^endwith$/,next:[],open:!1},{type:e.logic.type.deprecated,regex:/^deprecated\s+(.+)$/,next:[],open:!0,compile:e=>(console.warn("Deprecation notice: "+e.match[1]),e),parse:()=>({})}],e.logic.handler={},e.logic.extendType=function(t,n){n=n||"Twig.logic.type"+t,e.logic.type[t]=n},e.logic.extend=function(t){if(!t.type)throw new e.Error("Unable to extend logic definition. No type provided for "+t);e.logic.extendType(t.type),e.logic.handler[t.type]=t};e.logic.definitions.length>0;)e.logic.extend(e.logic.definitions.shift());return e.logic.compile=function(t){const n=t.value.trim();let r=e.logic.tokenize.call(this,n);const i=e.logic.handler[r.type];return i.compile&&(r=i.compile.call(this,r),e.log.trace("Twig.logic.compile: ","Compiled logic token to ",r)),r},e.logic.tokenize=function(t){let n=null,r=null,i=null,o=null,s=null,a=null,c=null;for(n in t=t.trim(),e.logic.handler)if(Object.hasOwnProperty.call(e.logic.handler,n))for(r=e.logic.handler[n].type,i=e.logic.handler[n].regex,o=i,Array.isArray(i)||(o=[i]),s=o.length,a=0;a<s;a++)if(c=o[a].exec(t),null!==c)return e.log.trace("Twig.logic.tokenize: ","Matched a ",r," regular expression of ",c),{type:r,match:c};throw new e.Error("Unable to parse '"+t.trim()+"'")},e.logic.parse=function(t,n,r,i){return e.async.potentiallyAsync(this,i,(function(){e.log.debug("Twig.logic.parse: ","Parsing logic token ",t);const i=e.logic.handler[t.type];let o;const s=this;return i.parse?(s.nestingStack.unshift(t),o=i.parse.call(s,t,n||{},r),e.isPromise(o)?o=o.then(e=>(s.nestingStack.shift(),e)):s.nestingStack.shift(),o):""}))},e}},function(e,t){e.exports=function(e){"use strict";e.Templates.registerParser("source",e=>e.data||"")}},function(e,t){e.exports=function(e){"use strict";e.Templates.registerParser("twig",t=>new e.Template(t))}},function(e,t,n){e.exports=function(e){"use strict";return e.path={},e.path.parsePath=function(t,n){let r=null;const{namespaces:i}=t.options;let o=n||"";if(i&&"object"==typeof i)for(r in i){if(-1===o.indexOf(r))continue;const e=new RegExp("^"+r+"::"),t=new RegExp("^@"+r+"/"),n=i[r].replace(/([^/])$/,"$1/");if(e.test(o))return o=o.replace(e,n),o;if(t.test(o))return o=o.replace(t,n),o}return e.path.relativePath(t,o)},e.path.relativePath=function(t,r){let i,o,s="/";const a=[];let c,u=r||"";if(t.url)i=void 0===t.base?t.url:t.base.replace(/([^/])$/,"$1/");else if(t.path){const e=n(1),r=e.sep||s,o=new RegExp("^\\.{1,2}"+r.replace("\\","\\\\"));u=u.replace(/\//g,r),void 0!==t.base&&null===u.match(o)?(u=u.replace(t.base,""),i=t.base+r):i=e.normalize(t.path),i=i.replace(r+r,r),s=r}else{if(!t.name&&!t.id||!t.method||"fs"===t.method||"ajax"===t.method)throw new e.Error("Cannot extend an inline template.");i=t.base||t.name||t.id}for(o=i.split(s),o.pop(),o=o.concat(u.split(s));o.length>0;)c=o.shift(),"."===c||(".."===c&&a.length>0&&".."!==a[a.length-1]?a.pop():a.push(c));return a.join(s)},e}},function(e,t){e.exports=function(e){"use strict";return e.tests={empty(e){if(null==e)return!0;if("number"==typeof e)return!1;if(e.length>0)return!1;for(const t in e)if(Object.hasOwnProperty.call(e,t))return!1;return!0},odd:e=>e%2==1,even:e=>e%2==0,divisibleby:(e,t)=>e%t[0]==0,defined:e=>void 0!==e,none:e=>null===e,null(e){return this.none(e)},"same as":(e,t)=>e===t[0],sameas:(t,n)=>(console.warn("`sameas` is deprecated use `same as`"),e.tests["same as"](t,n)),iterable:t=>t&&(e.lib.is("Array",t)||e.lib.is("Object",t))},e.test=function(t,n,r){if(!e.tests[t])throw e.Error("Test "+t+" is not defined.");return e.tests[t](n,r)},e.test.extend=function(t,n){e.tests[t]=n},e}},function(e,t){e.exports=function(e){"use strict";return e.ParseState.prototype.parseAsync=function(e,t){return this.parse(e,t,!0)},e.expression.parseAsync=function(t,n,r){return e.expression.parse.call(this,t,n,r,!0)},e.logic.parseAsync=function(t,n,r){return e.logic.parse.call(this,t,n,r,!0)},e.Template.prototype.renderAsync=function(e,t){return this.render(e,t,!0)},e.async={},e.isPromise=function(e){return e&&e.then&&"function"==typeof e.then},e.async.potentiallyAsync=function(t,n,r){return n?e.Promise.resolve(r.call(t)):function(t,n,r){let i=r.call(t),o=null,s=!0;if(!e.isPromise(i))return i;if(i.then(e=>{i=e,s=!1}).catch(e=>{o=e}),null!==o)throw o;if(s)throw new e.Error("You are using Twig.js in sync mode in combination with async extensions.");return i}(t,0,r)},e.Thenable=function(e,t,n){this.then=e,this._value=n?t:null,this._state=n||0},e.Thenable.prototype.catch=function(e){return 1===this._state?this:this.then(null,e)},e.Thenable.resolvedThen=function(t){try{return e.Promise.resolve(t(this._value))}catch(t){return e.Promise.reject(t)}},e.Thenable.rejectedThen=function(t,n){if(!n||"function"!=typeof n)return this;const r=this._value;let i;try{i=n(r)}catch(t){i=e.Promise.reject(t)}return e.Promise.resolve(i)},e.Promise=function(t){let n=0,r=null,i=function(e,t){n=e,r=t};return function(e,t,n){try{e(t,n)}catch(e){n(e)}}(t,(function(e){i(1,e)}),(function(e){i(2,e)})),1===n?e.Promise.resolve(r):2===n?e.Promise.reject(r):(i=new e.FullPromise,i.promise)},e.FullPromise=function(){let t=null;function n(e){e(s._value)}function r(e,t){t(s._value)}let i=function(e,n){t=function(e,t,n){const r=[t,n,-2];return e?-2===e[2]?e=[e,r]:e.push(r):e=r,e}(t,e,n)};function o(e,o){s._state||(s._value=o,s._state=e,i=1===e?n:r,t&&(-2===t[2]&&(i(t[0],t[1]),t=null),t.forEach(e=>{i(e[0],e[1])}),t=null))}const s=new e.Thenable((t,n)=>{const r="function"==typeof t;if(1===s._state&&!r)return e.Promise.resolve(s._value);if(1===s._state)try{return e.Promise.resolve(t(s._value))}catch(t){return e.Promise.reject(t)}const o="function"==typeof n;return new e.Promise((e,s)=>{i(r?n=>{try{e(t(n))}catch(e){s(e)}}:e,o?t=>{try{e(n(t))}catch(e){s(e)}}:s)})});return o.promise=s,o},e.Promise.defaultResolved=new e.Thenable(e.Thenable.resolvedThen,void 0,1),e.Promise.emptyStringResolved=new e.Thenable(e.Thenable.resolvedThen,"",1),e.Promise.resolve=function(t){return 0===arguments.length||void 0===t?e.Promise.defaultResolved:e.isPromise(t)?t:""===t?e.Promise.emptyStringResolved:new e.Thenable(e.Thenable.resolvedThen,t,1)},e.Promise.reject=function(t){return new e.Thenable(e.Thenable.rejectedThen,t,2)},e.Promise.all=function(t){const n=new Array(t.length);return e.async.forEach(t,(t,r)=>{if(e.isPromise(t)){if(1!==t._state)return t.then(e=>{n[r]=e});n[r]=t._value}else n[r]=t}).then(()=>n)},e.async.forEach=function(t,n){const r=t.length;let i=0;return function o(){let s=null;do{if(i===r)return e.Promise.resolve();s=n(t[i],i),i++}while(!s||!e.isPromise(s)||1===s._state);return s.then(o)}()},e}},function(e,t){e.exports=function(e){"use strict";return e.exports={VERSION:e.VERSION},e.exports.twig=function(t){const{id:n}=t,r={strictVariables:t.strict_variables||!1,autoescape:null!==t.autoescape&&t.autoescape||!1,allowInlineIncludes:t.allowInlineIncludes||!1,rethrow:t.rethrow||!1,namespaces:t.namespaces};if(e.cache&&n&&e.validateId(n),void 0!==t.debug&&(e.debug=t.debug),void 0!==t.trace&&(e.trace=t.trace),void 0!==t.data)return e.Templates.parsers.twig({data:t.data,path:Object.hasOwnProperty.call(t,"path")?t.path:void 0,module:t.module,id:n,options:r});if(void 0!==t.ref){if(void 0!==t.id)throw new e.Error("Both ref and id cannot be set on a twig.js template.");return e.Templates.load(t.ref)}if(void 0!==t.method){if(!e.Templates.isRegisteredLoader(t.method))throw new e.Error('Loader for "'+t.method+'" is not defined.');return e.Templates.loadRemote(t.name||t.href||t.path||n||void 0,{id:n,method:t.method,parser:t.parser||"twig",base:t.base,module:t.module,precompiled:t.precompiled,async:t.async,options:r},t.load,t.error)}return void 0!==t.href?e.Templates.loadRemote(t.href,{id:n,method:"ajax",parser:t.parser||"twig",base:t.base,module:t.module,precompiled:t.precompiled,async:t.async,options:r},t.load,t.error):void 0!==t.path?e.Templates.loadRemote(t.path,{id:n,method:"fs",parser:t.parser||"twig",base:t.base,module:t.module,precompiled:t.precompiled,async:t.async,options:r},t.load,t.error):void 0},e.exports.extendFilter=function(t,n){e.filter.extend(t,n)},e.exports.extendFunction=function(t,n){e._function.extend(t,n)},e.exports.extendTest=function(t,n){e.test.extend(t,n)},e.exports.extendTag=function(t){e.logic.extend(t)},e.exports.extend=function(t){t(e)},e.exports.compile=function(t,n){const r=n.filename,i=n.filename,o=new e.Template({data:t,path:i,id:r,options:n.settings["twig options"]});return function(e){return o.render(e)}},e.exports.renderFile=function(t,n,r){"function"==typeof n&&(r=n,n={});const i=(n=n||{}).settings||{},o=i["twig options"],s={path:t,base:i.views,load(e){o&&o.allowAsync?e.renderAsync(n).then(e=>r(null,e),r):r(null,String(e.render(n)))}};if(o)for(const e in o)Object.hasOwnProperty.call(o,e)&&(s[e]=o[e]);e.exports.twig(s)},e.exports.__express=e.exports.renderFile,e.exports.cache=function(t){e.cache=t},e.exports.path=e.path,e.exports.filters=e.filters,e.exports.tests=e.tests,e.exports.Promise=e.Promise,e}}])},e.exports=r()}).call(this,n(3))},function(e,t,n){"use strict";e.exports=n(16)},function(e,t,n){"use strict";var r=n(40);function i(e,t,n,i,o){var s=r.writeRtpDescription(e.kind,t);if(s+=r.writeIceParameters(e.iceGatherer.getLocalParameters()),s+=r.writeDtlsParameters(e.dtlsTransport.getLocalParameters(),"offer"===n?"actpass":o||"active"),s+="a=mid:"+e.mid+"\r\n",e.rtpSender&&e.rtpReceiver?s+="a=sendrecv\r\n":e.rtpSender?s+="a=sendonly\r\n":e.rtpReceiver?s+="a=recvonly\r\n":s+="a=inactive\r\n",e.rtpSender){var a=e.rtpSender._initialTrackId||e.rtpSender.track.id;e.rtpSender._initialTrackId=a;var c="msid:"+(i?i.id:"-")+" "+a+"\r\n";s+="a="+c,s+="a=ssrc:"+e.sendEncodingParameters[0].ssrc+" "+c,e.sendEncodingParameters[0].rtx&&(s+="a=ssrc:"+e.sendEncodingParameters[0].rtx.ssrc+" "+c,s+="a=ssrc-group:FID "+e.sendEncodingParameters[0].ssrc+" "+e.sendEncodingParameters[0].rtx.ssrc+"\r\n")}return s+="a=ssrc:"+e.sendEncodingParameters[0].ssrc+" cname:"+r.localCName+"\r\n",e.rtpSender&&e.sendEncodingParameters[0].rtx&&(s+="a=ssrc:"+e.sendEncodingParameters[0].rtx.ssrc+" cname:"+r.localCName+"\r\n"),s}function o(e,t){var n={codecs:[],headerExtensions:[],fecMechanisms:[]},r=function(e,t){e=parseInt(e,10);for(var n=0;n<t.length;n++)if(t[n].payloadType===e||t[n].preferredPayloadType===e)return t[n]},i=function(e,t,n,i){var o=r(e.parameters.apt,n),s=r(t.parameters.apt,i);return o&&s&&o.name.toLowerCase()===s.name.toLowerCase()};return e.codecs.forEach((function(r){for(var o=0;o<t.codecs.length;o++){var s=t.codecs[o];if(r.name.toLowerCase()===s.name.toLowerCase()&&r.clockRate===s.clockRate){if("rtx"===r.name.toLowerCase()&&r.parameters&&s.parameters.apt&&!i(r,s,e.codecs,t.codecs))continue;(s=JSON.parse(JSON.stringify(s))).numChannels=Math.min(r.numChannels,s.numChannels),n.codecs.push(s),s.rtcpFeedback=s.rtcpFeedback.filter((function(e){for(var t=0;t<r.rtcpFeedback.length;t++)if(r.rtcpFeedback[t].type===e.type&&r.rtcpFeedback[t].parameter===e.parameter)return!0;return!1}));break}}})),e.headerExtensions.forEach((function(e){for(var r=0;r<t.headerExtensions.length;r++){var i=t.headerExtensions[r];if(e.uri===i.uri){n.headerExtensions.push(i);break}}})),n}function s(e,t,n){return-1!=={offer:{setLocalDescription:["stable","have-local-offer"],setRemoteDescription:["stable","have-remote-offer"]},answer:{setLocalDescription:["have-remote-offer","have-local-pranswer"],setRemoteDescription:["have-local-offer","have-remote-pranswer"]}}[t][e].indexOf(n)}function a(e,t){var n=e.getRemoteCandidates().find((function(e){return t.foundation===e.foundation&&t.ip===e.ip&&t.port===e.port&&t.priority===e.priority&&t.protocol===e.protocol&&t.type===e.type}));return n||e.addRemoteCandidate(t),!n}function c(e,t){var n=new Error(t);return n.name=e,n.code={NotSupportedError:9,InvalidStateError:11,InvalidAccessError:15,TypeError:void 0,OperationError:void 0}[e],n}e.exports=function(e,t){function n(t,n){n.addTrack(t),n.dispatchEvent(new e.MediaStreamTrackEvent("addtrack",{track:t}))}function u(t,n,r,i){var o=new Event("track");o.track=n,o.receiver=r,o.transceiver={receiver:r},o.streams=i,e.setTimeout((function(){t._dispatchEvent("track",o)}))}var l=function(n){var i=this,o=document.createDocumentFragment();if(["addEventListener","removeEventListener","dispatchEvent"].forEach((function(e){i[e]=o[e].bind(o)})),this.canTrickleIceCandidates=null,this.needNegotiation=!1,this.localStreams=[],this.remoteStreams=[],this._localDescription=null,this._remoteDescription=null,this.signalingState="stable",this.iceConnectionState="new",this.connectionState="new",this.iceGatheringState="new",n=JSON.parse(JSON.stringify(n||{})),this.usingBundle="max-bundle"===n.bundlePolicy,"negotiate"===n.rtcpMuxPolicy)throw c("NotSupportedError","rtcpMuxPolicy 'negotiate' is not supported");switch(n.rtcpMuxPolicy||(n.rtcpMuxPolicy="require"),n.iceTransportPolicy){case"all":case"relay":break;default:n.iceTransportPolicy="all"}switch(n.bundlePolicy){case"balanced":case"max-compat":case"max-bundle":break;default:n.bundlePolicy="balanced"}if(n.iceServers=function(e,t){var n=!1;return(e=JSON.parse(JSON.stringify(e))).filter((function(e){if(e&&(e.urls||e.url)){var r=e.urls||e.url;e.url&&!e.urls&&console.warn("RTCIceServer.url is deprecated! Use urls instead.");var i="string"==typeof r;return i&&(r=[r]),r=r.filter((function(e){return 0===e.indexOf("turn:")&&-1!==e.indexOf("transport=udp")&&-1===e.indexOf("turn:[")&&!n?(n=!0,!0):0===e.indexOf("stun:")&&t>=14393&&-1===e.indexOf("?transport=udp")})),delete e.url,e.urls=i?r[0]:r,!!r.length}}))}(n.iceServers||[],t),this._iceGatherers=[],n.iceCandidatePoolSize)for(var s=n.iceCandidatePoolSize;s>0;s--)this._iceGatherers.push(new e.RTCIceGatherer({iceServers:n.iceServers,gatherPolicy:n.iceTransportPolicy}));else n.iceCandidatePoolSize=0;this._config=n,this.transceivers=[],this._sdpSessionId=r.generateSessionId(),this._sdpSessionVersion=0,this._dtlsRole=void 0,this._isClosed=!1};Object.defineProperty(l.prototype,"localDescription",{configurable:!0,get:function(){return this._localDescription}}),Object.defineProperty(l.prototype,"remoteDescription",{configurable:!0,get:function(){return this._remoteDescription}}),l.prototype.onicecandidate=null,l.prototype.onaddstream=null,l.prototype.ontrack=null,l.prototype.onremovestream=null,l.prototype.onsignalingstatechange=null,l.prototype.oniceconnectionstatechange=null,l.prototype.onconnectionstatechange=null,l.prototype.onicegatheringstatechange=null,l.prototype.onnegotiationneeded=null,l.prototype.ondatachannel=null,l.prototype._dispatchEvent=function(e,t){this._isClosed||(this.dispatchEvent(t),"function"==typeof this["on"+e]&&this["on"+e](t))},l.prototype._emitGatheringStateChange=function(){var e=new Event("icegatheringstatechange");this._dispatchEvent("icegatheringstatechange",e)},l.prototype.getConfiguration=function(){return this._config},l.prototype.getLocalStreams=function(){return this.localStreams},l.prototype.getRemoteStreams=function(){return this.remoteStreams},l.prototype._createTransceiver=function(e,t){var n=this.transceivers.length>0,r={track:null,iceGatherer:null,iceTransport:null,dtlsTransport:null,localCapabilities:null,remoteCapabilities:null,rtpSender:null,rtpReceiver:null,kind:e,mid:null,sendEncodingParameters:null,recvEncodingParameters:null,stream:null,associatedRemoteMediaStreams:[],wantReceive:!0};if(this.usingBundle&&n)r.iceTransport=this.transceivers[0].iceTransport,r.dtlsTransport=this.transceivers[0].dtlsTransport;else{var i=this._createIceAndDtlsTransports();r.iceTransport=i.iceTransport,r.dtlsTransport=i.dtlsTransport}return t||this.transceivers.push(r),r},l.prototype.addTrack=function(t,n){if(this._isClosed)throw c("InvalidStateError","Attempted to call addTrack on a closed peerconnection.");var r;if(this.transceivers.find((function(e){return e.track===t})))throw c("InvalidAccessError","Track already exists.");for(var i=0;i<this.transceivers.length;i++)this.transceivers[i].track||this.transceivers[i].kind!==t.kind||(r=this.transceivers[i]);return r||(r=this._createTransceiver(t.kind)),this._maybeFireNegotiationNeeded(),-1===this.localStreams.indexOf(n)&&this.localStreams.push(n),r.track=t,r.stream=n,r.rtpSender=new e.RTCRtpSender(t,r.dtlsTransport),r.rtpSender},l.prototype.addStream=function(e){var n=this;if(t>=15025)e.getTracks().forEach((function(t){n.addTrack(t,e)}));else{var r=e.clone();e.getTracks().forEach((function(e,t){var n=r.getTracks()[t];e.addEventListener("enabled",(function(e){n.enabled=e.enabled}))})),r.getTracks().forEach((function(e){n.addTrack(e,r)}))}},l.prototype.removeTrack=function(t){if(this._isClosed)throw c("InvalidStateError","Attempted to call removeTrack on a closed peerconnection.");if(!(t instanceof e.RTCRtpSender))throw new TypeError("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.");var n=this.transceivers.find((function(e){return e.rtpSender===t}));if(!n)throw c("InvalidAccessError","Sender was not created by this connection.");var r=n.stream;n.rtpSender.stop(),n.rtpSender=null,n.track=null,n.stream=null,-1===this.transceivers.map((function(e){return e.stream})).indexOf(r)&&this.localStreams.indexOf(r)>-1&&this.localStreams.splice(this.localStreams.indexOf(r),1),this._maybeFireNegotiationNeeded()},l.prototype.removeStream=function(e){var t=this;e.getTracks().forEach((function(e){var n=t.getSenders().find((function(t){return t.track===e}));n&&t.removeTrack(n)}))},l.prototype.getSenders=function(){return this.transceivers.filter((function(e){return!!e.rtpSender})).map((function(e){return e.rtpSender}))},l.prototype.getReceivers=function(){return this.transceivers.filter((function(e){return!!e.rtpReceiver})).map((function(e){return e.rtpReceiver}))},l.prototype._createIceGatherer=function(t,n){var r=this;if(n&&t>0)return this.transceivers[0].iceGatherer;if(this._iceGatherers.length)return this._iceGatherers.shift();var i=new e.RTCIceGatherer({iceServers:this._config.iceServers,gatherPolicy:this._config.iceTransportPolicy});return Object.defineProperty(i,"state",{value:"new",writable:!0}),this.transceivers[t].bufferedCandidateEvents=[],this.transceivers[t].bufferCandidates=function(e){var n=!e.candidate||0===Object.keys(e.candidate).length;i.state=n?"completed":"gathering",null!==r.transceivers[t].bufferedCandidateEvents&&r.transceivers[t].bufferedCandidateEvents.push(e)},i.addEventListener("localcandidate",this.transceivers[t].bufferCandidates),i},l.prototype._gather=function(t,n){var i=this,o=this.transceivers[n].iceGatherer;if(!o.onlocalcandidate){var s=this.transceivers[n].bufferedCandidateEvents;this.transceivers[n].bufferedCandidateEvents=null,o.removeEventListener("localcandidate",this.transceivers[n].bufferCandidates),o.onlocalcandidate=function(e){if(!(i.usingBundle&&n>0)){var s=new Event("icecandidate");s.candidate={sdpMid:t,sdpMLineIndex:n};var a=e.candidate,c=!a||0===Object.keys(a).length;if(c)"new"!==o.state&&"gathering"!==o.state||(o.state="completed");else{"new"===o.state&&(o.state="gathering"),a.component=1,a.ufrag=o.getLocalParameters().usernameFragment;var u=r.writeCandidate(a);s.candidate=Object.assign(s.candidate,r.parseCandidate(u)),s.candidate.candidate=u,s.candidate.toJSON=function(){return{candidate:s.candidate.candidate,sdpMid:s.candidate.sdpMid,sdpMLineIndex:s.candidate.sdpMLineIndex,usernameFragment:s.candidate.usernameFragment}}}var l=r.getMediaSections(i._localDescription.sdp);l[s.candidate.sdpMLineIndex]+=c?"a=end-of-candidates\r\n":"a="+s.candidate.candidate+"\r\n",i._localDescription.sdp=r.getDescription(i._localDescription.sdp)+l.join("");var p=i.transceivers.every((function(e){return e.iceGatherer&&"completed"===e.iceGatherer.state}));"gathering"!==i.iceGatheringState&&(i.iceGatheringState="gathering",i._emitGatheringStateChange()),c||i._dispatchEvent("icecandidate",s),p&&(i._dispatchEvent("icecandidate",new Event("icecandidate")),i.iceGatheringState="complete",i._emitGatheringStateChange())}},e.setTimeout((function(){s.forEach((function(e){o.onlocalcandidate(e)}))}),0)}},l.prototype._createIceAndDtlsTransports=function(){var t=this,n=new e.RTCIceTransport(null);n.onicestatechange=function(){t._updateIceConnectionState(),t._updateConnectionState()};var r=new e.RTCDtlsTransport(n);return r.ondtlsstatechange=function(){t._updateConnectionState()},r.onerror=function(){Object.defineProperty(r,"state",{value:"failed",writable:!0}),t._updateConnectionState()},{iceTransport:n,dtlsTransport:r}},l.prototype._disposeIceAndDtlsTransports=function(e){var t=this.transceivers[e].iceGatherer;t&&(delete t.onlocalcandidate,delete this.transceivers[e].iceGatherer);var n=this.transceivers[e].iceTransport;n&&(delete n.onicestatechange,delete this.transceivers[e].iceTransport);var r=this.transceivers[e].dtlsTransport;r&&(delete r.ondtlsstatechange,delete r.onerror,delete this.transceivers[e].dtlsTransport)},l.prototype._transceive=function(e,n,i){var s=o(e.localCapabilities,e.remoteCapabilities);n&&e.rtpSender&&(s.encodings=e.sendEncodingParameters,s.rtcp={cname:r.localCName,compound:e.rtcpParameters.compound},e.recvEncodingParameters.length&&(s.rtcp.ssrc=e.recvEncodingParameters[0].ssrc),e.rtpSender.send(s)),i&&e.rtpReceiver&&s.codecs.length>0&&("video"===e.kind&&e.recvEncodingParameters&&t<15019&&e.recvEncodingParameters.forEach((function(e){delete e.rtx})),e.recvEncodingParameters.length?s.encodings=e.recvEncodingParameters:s.encodings=[{}],s.rtcp={compound:e.rtcpParameters.compound},e.rtcpParameters.cname&&(s.rtcp.cname=e.rtcpParameters.cname),e.sendEncodingParameters.length&&(s.rtcp.ssrc=e.sendEncodingParameters[0].ssrc),e.rtpReceiver.receive(s))},l.prototype.setLocalDescription=function(e){var t,n,i=this;if(-1===["offer","answer"].indexOf(e.type))return Promise.reject(c("TypeError",'Unsupported type "'+e.type+'"'));if(!s("setLocalDescription",e.type,i.signalingState)||i._isClosed)return Promise.reject(c("InvalidStateError","Can not set local "+e.type+" in state "+i.signalingState));if("offer"===e.type)t=r.splitSections(e.sdp),n=t.shift(),t.forEach((function(e,t){var n=r.parseRtpParameters(e);i.transceivers[t].localCapabilities=n})),i.transceivers.forEach((function(e,t){i._gather(e.mid,t)}));else if("answer"===e.type){t=r.splitSections(i._remoteDescription.sdp),n=t.shift();var a=r.matchPrefix(n,"a=ice-lite").length>0;t.forEach((function(e,t){var s=i.transceivers[t],c=s.iceGatherer,u=s.iceTransport,l=s.dtlsTransport,p=s.localCapabilities,h=s.remoteCapabilities;if(!(r.isRejected(e)&&0===r.matchPrefix(e,"a=bundle-only").length)&&!s.rejected){var f=r.getIceParameters(e,n),d=r.getDtlsParameters(e,n);a&&(d.role="server"),i.usingBundle&&0!==t||(i._gather(s.mid,t),"new"===u.state&&u.start(c,f,a?"controlling":"controlled"),"new"===l.state&&l.start(d));var g=o(p,h);i._transceive(s,g.codecs.length>0,!1)}}))}return i._localDescription={type:e.type,sdp:e.sdp},"offer"===e.type?i._updateSignalingState("have-local-offer"):i._updateSignalingState("stable"),Promise.resolve()},l.prototype.setRemoteDescription=function(i){var l=this;if(-1===["offer","answer"].indexOf(i.type))return Promise.reject(c("TypeError",'Unsupported type "'+i.type+'"'));if(!s("setRemoteDescription",i.type,l.signalingState)||l._isClosed)return Promise.reject(c("InvalidStateError","Can not set remote "+i.type+" in state "+l.signalingState));var p={};l.remoteStreams.forEach((function(e){p[e.id]=e}));var h=[],f=r.splitSections(i.sdp),d=f.shift(),g=r.matchPrefix(d,"a=ice-lite").length>0,m=r.matchPrefix(d,"a=group:BUNDLE ").length>0;l.usingBundle=m;var y=r.matchPrefix(d,"a=ice-options:")[0];return l.canTrickleIceCandidates=!!y&&y.substr(14).split(" ").indexOf("trickle")>=0,f.forEach((function(s,c){var u=r.splitLines(s),f=r.getKind(s),y=r.isRejected(s)&&0===r.matchPrefix(s,"a=bundle-only").length,v=u[0].substr(2).split(" ")[2],b=r.getDirection(s,d),w=r.parseMsid(s),x=r.getMid(s)||r.generateIdentifier();if(y||"application"===f&&("DTLS/SCTP"===v||"UDP/DTLS/SCTP"===v))l.transceivers[c]={mid:x,kind:f,protocol:v,rejected:!0};else{var k,T,C,S,E,R,P,O,A;!y&&l.transceivers[c]&&l.transceivers[c].rejected&&(l.transceivers[c]=l._createTransceiver(f,!0));var D,N,_=r.parseRtpParameters(s);y||(D=r.getIceParameters(s,d),(N=r.getDtlsParameters(s,d)).role="client"),P=r.parseRtpEncodingParameters(s);var I=r.parseRtcpParameters(s),j=r.matchPrefix(s,"a=end-of-candidates",d).length>0,L=r.matchPrefix(s,"a=candidate:").map((function(e){return r.parseCandidate(e)})).filter((function(e){return 1===e.component}));if(("offer"===i.type||"answer"===i.type)&&!y&&m&&c>0&&l.transceivers[c]&&(l._disposeIceAndDtlsTransports(c),l.transceivers[c].iceGatherer=l.transceivers[0].iceGatherer,l.transceivers[c].iceTransport=l.transceivers[0].iceTransport,l.transceivers[c].dtlsTransport=l.transceivers[0].dtlsTransport,l.transceivers[c].rtpSender&&l.transceivers[c].rtpSender.setTransport(l.transceivers[0].dtlsTransport),l.transceivers[c].rtpReceiver&&l.transceivers[c].rtpReceiver.setTransport(l.transceivers[0].dtlsTransport)),"offer"!==i.type||y){if("answer"===i.type&&!y){T=(k=l.transceivers[c]).iceGatherer,C=k.iceTransport,S=k.dtlsTransport,E=k.rtpReceiver,R=k.sendEncodingParameters,O=k.localCapabilities,l.transceivers[c].recvEncodingParameters=P,l.transceivers[c].remoteCapabilities=_,l.transceivers[c].rtcpParameters=I,L.length&&"new"===C.state&&(!g&&!j||m&&0!==c?L.forEach((function(e){a(k.iceTransport,e)})):C.setRemoteCandidates(L)),m&&0!==c||("new"===C.state&&C.start(T,D,"controlling"),"new"===S.state&&S.start(N)),!o(k.localCapabilities,k.remoteCapabilities).codecs.filter((function(e){return"rtx"===e.name.toLowerCase()})).length&&k.sendEncodingParameters[0].rtx&&delete k.sendEncodingParameters[0].rtx,l._transceive(k,"sendrecv"===b||"recvonly"===b,"sendrecv"===b||"sendonly"===b),!E||"sendrecv"!==b&&"sendonly"!==b?delete k.rtpReceiver:(A=E.track,w?(p[w.stream]||(p[w.stream]=new e.MediaStream),n(A,p[w.stream]),h.push([A,E,p[w.stream]])):(p.default||(p.default=new e.MediaStream),n(A,p.default),h.push([A,E,p.default])))}}else{(k=l.transceivers[c]||l._createTransceiver(f)).mid=x,k.iceGatherer||(k.iceGatherer=l._createIceGatherer(c,m)),L.length&&"new"===k.iceTransport.state&&(!j||m&&0!==c?L.forEach((function(e){a(k.iceTransport,e)})):k.iceTransport.setRemoteCandidates(L)),O=e.RTCRtpReceiver.getCapabilities(f),t<15019&&(O.codecs=O.codecs.filter((function(e){return"rtx"!==e.name}))),R=k.sendEncodingParameters||[{ssrc:1001*(2*c+2)}];var M,U=!1;if("sendrecv"===b||"sendonly"===b){if(U=!k.rtpReceiver,E=k.rtpReceiver||new e.RTCRtpReceiver(k.dtlsTransport,f),U)A=E.track,w&&"-"===w.stream||(w?(p[w.stream]||(p[w.stream]=new e.MediaStream,Object.defineProperty(p[w.stream],"id",{get:function(){return w.stream}})),Object.defineProperty(A,"id",{get:function(){return w.track}}),M=p[w.stream]):(p.default||(p.default=new e.MediaStream),M=p.default)),M&&(n(A,M),k.associatedRemoteMediaStreams.push(M)),h.push([A,E,M])}else k.rtpReceiver&&k.rtpReceiver.track&&(k.associatedRemoteMediaStreams.forEach((function(t){var n=t.getTracks().find((function(e){return e.id===k.rtpReceiver.track.id}));n&&function(t,n){n.removeTrack(t),n.dispatchEvent(new e.MediaStreamTrackEvent("removetrack",{track:t}))}(n,t)})),k.associatedRemoteMediaStreams=[]);k.localCapabilities=O,k.remoteCapabilities=_,k.rtpReceiver=E,k.rtcpParameters=I,k.sendEncodingParameters=R,k.recvEncodingParameters=P,l._transceive(l.transceivers[c],!1,U)}}})),void 0===l._dtlsRole&&(l._dtlsRole="offer"===i.type?"active":"passive"),l._remoteDescription={type:i.type,sdp:i.sdp},"offer"===i.type?l._updateSignalingState("have-remote-offer"):l._updateSignalingState("stable"),Object.keys(p).forEach((function(t){var n=p[t];if(n.getTracks().length){if(-1===l.remoteStreams.indexOf(n)){l.remoteStreams.push(n);var r=new Event("addstream");r.stream=n,e.setTimeout((function(){l._dispatchEvent("addstream",r)}))}h.forEach((function(e){var t=e[0],r=e[1];n.id===e[2].id&&u(l,t,r,[n])}))}})),h.forEach((function(e){e[2]||u(l,e[0],e[1],[])})),e.setTimeout((function(){l&&l.transceivers&&l.transceivers.forEach((function(e){e.iceTransport&&"new"===e.iceTransport.state&&e.iceTransport.getRemoteCandidates().length>0&&(console.warn("Timeout for addRemoteCandidate. Consider sending an end-of-candidates notification"),e.iceTransport.addRemoteCandidate({}))}))}),4e3),Promise.resolve()},l.prototype.close=function(){this.transceivers.forEach((function(e){e.iceTransport&&e.iceTransport.stop(),e.dtlsTransport&&e.dtlsTransport.stop(),e.rtpSender&&e.rtpSender.stop(),e.rtpReceiver&&e.rtpReceiver.stop()})),this._isClosed=!0,this._updateSignalingState("closed")},l.prototype._updateSignalingState=function(e){this.signalingState=e;var t=new Event("signalingstatechange");this._dispatchEvent("signalingstatechange",t)},l.prototype._maybeFireNegotiationNeeded=function(){var t=this;"stable"===this.signalingState&&!0!==this.needNegotiation&&(this.needNegotiation=!0,e.setTimeout((function(){if(t.needNegotiation){t.needNegotiation=!1;var e=new Event("negotiationneeded");t._dispatchEvent("negotiationneeded",e)}}),0))},l.prototype._updateIceConnectionState=function(){var e,t={new:0,closed:0,checking:0,connected:0,completed:0,disconnected:0,failed:0};if(this.transceivers.forEach((function(e){e.iceTransport&&!e.rejected&&t[e.iceTransport.state]++})),e="new",t.failed>0?e="failed":t.checking>0?e="checking":t.disconnected>0?e="disconnected":t.new>0?e="new":t.connected>0?e="connected":t.completed>0&&(e="completed"),e!==this.iceConnectionState){this.iceConnectionState=e;var n=new Event("iceconnectionstatechange");this._dispatchEvent("iceconnectionstatechange",n)}},l.prototype._updateConnectionState=function(){var e,t={new:0,closed:0,connecting:0,connected:0,completed:0,disconnected:0,failed:0};if(this.transceivers.forEach((function(e){e.iceTransport&&e.dtlsTransport&&!e.rejected&&(t[e.iceTransport.state]++,t[e.dtlsTransport.state]++)})),t.connected+=t.completed,e="new",t.failed>0?e="failed":t.connecting>0?e="connecting":t.disconnected>0?e="disconnected":t.new>0?e="new":t.connected>0&&(e="connected"),e!==this.connectionState){this.connectionState=e;var n=new Event("connectionstatechange");this._dispatchEvent("connectionstatechange",n)}},l.prototype.createOffer=function(){var n=this;if(n._isClosed)return Promise.reject(c("InvalidStateError","Can not call createOffer after close"));var o=n.transceivers.filter((function(e){return"audio"===e.kind})).length,s=n.transceivers.filter((function(e){return"video"===e.kind})).length,a=arguments[0];if(a){if(a.mandatory||a.optional)throw new TypeError("Legacy mandatory/optional constraints not supported.");void 0!==a.offerToReceiveAudio&&(o=!0===a.offerToReceiveAudio?1:!1===a.offerToReceiveAudio?0:a.offerToReceiveAudio),void 0!==a.offerToReceiveVideo&&(s=!0===a.offerToReceiveVideo?1:!1===a.offerToReceiveVideo?0:a.offerToReceiveVideo)}for(n.transceivers.forEach((function(e){"audio"===e.kind?--o<0&&(e.wantReceive=!1):"video"===e.kind&&--s<0&&(e.wantReceive=!1)}));o>0||s>0;)o>0&&(n._createTransceiver("audio"),o--),s>0&&(n._createTransceiver("video"),s--);var u=r.writeSessionBoilerplate(n._sdpSessionId,n._sdpSessionVersion++);n.transceivers.forEach((function(i,o){var s=i.track,a=i.kind,c=i.mid||r.generateIdentifier();i.mid=c,i.iceGatherer||(i.iceGatherer=n._createIceGatherer(o,n.usingBundle));var u=e.RTCRtpSender.getCapabilities(a);t<15019&&(u.codecs=u.codecs.filter((function(e){return"rtx"!==e.name}))),u.codecs.forEach((function(e){"H264"===e.name&&void 0===e.parameters["level-asymmetry-allowed"]&&(e.parameters["level-asymmetry-allowed"]="1"),i.remoteCapabilities&&i.remoteCapabilities.codecs&&i.remoteCapabilities.codecs.forEach((function(t){e.name.toLowerCase()===t.name.toLowerCase()&&e.clockRate===t.clockRate&&(e.preferredPayloadType=t.payloadType)}))})),u.headerExtensions.forEach((function(e){(i.remoteCapabilities&&i.remoteCapabilities.headerExtensions||[]).forEach((function(t){e.uri===t.uri&&(e.id=t.id)}))}));var l=i.sendEncodingParameters||[{ssrc:1001*(2*o+1)}];s&&t>=15019&&"video"===a&&!l[0].rtx&&(l[0].rtx={ssrc:l[0].ssrc+1}),i.wantReceive&&(i.rtpReceiver=new e.RTCRtpReceiver(i.dtlsTransport,a)),i.localCapabilities=u,i.sendEncodingParameters=l})),"max-compat"!==n._config.bundlePolicy&&(u+="a=group:BUNDLE "+n.transceivers.map((function(e){return e.mid})).join(" ")+"\r\n"),u+="a=ice-options:trickle\r\n",n.transceivers.forEach((function(e,t){u+=i(e,e.localCapabilities,"offer",e.stream,n._dtlsRole),u+="a=rtcp-rsize\r\n",!e.iceGatherer||"new"===n.iceGatheringState||0!==t&&n.usingBundle||(e.iceGatherer.getLocalCandidates().forEach((function(e){e.component=1,u+="a="+r.writeCandidate(e)+"\r\n"})),"completed"===e.iceGatherer.state&&(u+="a=end-of-candidates\r\n"))}));var l=new e.RTCSessionDescription({type:"offer",sdp:u});return Promise.resolve(l)},l.prototype.createAnswer=function(){var n=this;if(n._isClosed)return Promise.reject(c("InvalidStateError","Can not call createAnswer after close"));if("have-remote-offer"!==n.signalingState&&"have-local-pranswer"!==n.signalingState)return Promise.reject(c("InvalidStateError","Can not call createAnswer in signalingState "+n.signalingState));var s=r.writeSessionBoilerplate(n._sdpSessionId,n._sdpSessionVersion++);n.usingBundle&&(s+="a=group:BUNDLE "+n.transceivers.map((function(e){return e.mid})).join(" ")+"\r\n"),s+="a=ice-options:trickle\r\n";var a=r.getMediaSections(n._remoteDescription.sdp).length;n.transceivers.forEach((function(e,r){if(!(r+1>a)){if(e.rejected)return"application"===e.kind?"DTLS/SCTP"===e.protocol?s+="m=application 0 DTLS/SCTP 5000\r\n":s+="m=application 0 "+e.protocol+" webrtc-datachannel\r\n":"audio"===e.kind?s+="m=audio 0 UDP/TLS/RTP/SAVPF 0\r\na=rtpmap:0 PCMU/8000\r\n":"video"===e.kind&&(s+="m=video 0 UDP/TLS/RTP/SAVPF 120\r\na=rtpmap:120 VP8/90000\r\n"),void(s+="c=IN IP4 0.0.0.0\r\na=inactive\r\na=mid:"+e.mid+"\r\n");var c;if(e.stream)"audio"===e.kind?c=e.stream.getAudioTracks()[0]:"video"===e.kind&&(c=e.stream.getVideoTracks()[0]),c&&t>=15019&&"video"===e.kind&&!e.sendEncodingParameters[0].rtx&&(e.sendEncodingParameters[0].rtx={ssrc:e.sendEncodingParameters[0].ssrc+1});var u=o(e.localCapabilities,e.remoteCapabilities);!u.codecs.filter((function(e){return"rtx"===e.name.toLowerCase()})).length&&e.sendEncodingParameters[0].rtx&&delete e.sendEncodingParameters[0].rtx,s+=i(e,u,"answer",e.stream,n._dtlsRole),e.rtcpParameters&&e.rtcpParameters.reducedSize&&(s+="a=rtcp-rsize\r\n")}}));var u=new e.RTCSessionDescription({type:"answer",sdp:s});return Promise.resolve(u)},l.prototype.addIceCandidate=function(e){var t,n=this;return e&&void 0===e.sdpMLineIndex&&!e.sdpMid?Promise.reject(new TypeError("sdpMLineIndex or sdpMid required")):new Promise((function(i,o){if(!n._remoteDescription)return o(c("InvalidStateError","Can not add ICE candidate without a remote description"));if(e&&""!==e.candidate){var s=e.sdpMLineIndex;if(e.sdpMid)for(var u=0;u<n.transceivers.length;u++)if(n.transceivers[u].mid===e.sdpMid){s=u;break}var l=n.transceivers[s];if(!l)return o(c("OperationError","Can not add ICE candidate"));if(l.rejected)return i();var p=Object.keys(e.candidate).length>0?r.parseCandidate(e.candidate):{};if("tcp"===p.protocol&&(0===p.port||9===p.port))return i();if(p.component&&1!==p.component)return i();if((0===s||s>0&&l.iceTransport!==n.transceivers[0].iceTransport)&&!a(l.iceTransport,p))return o(c("OperationError","Can not add ICE candidate"));var h=e.candidate.trim();0===h.indexOf("a=")&&(h=h.substr(2)),(t=r.getMediaSections(n._remoteDescription.sdp))[s]+="a="+(p.type?h:"end-of-candidates")+"\r\n",n._remoteDescription.sdp=r.getDescription(n._remoteDescription.sdp)+t.join("")}else for(var f=0;f<n.transceivers.length&&(n.transceivers[f].rejected||(n.transceivers[f].iceTransport.addRemoteCandidate({}),(t=r.getMediaSections(n._remoteDescription.sdp))[f]+="a=end-of-candidates\r\n",n._remoteDescription.sdp=r.getDescription(n._remoteDescription.sdp)+t.join(""),!n.usingBundle));f++);i()}))},l.prototype.getStats=function(t){if(t&&t instanceof e.MediaStreamTrack){var n=null;if(this.transceivers.forEach((function(e){e.rtpSender&&e.rtpSender.track===t?n=e.rtpSender:e.rtpReceiver&&e.rtpReceiver.track===t&&(n=e.rtpReceiver)})),!n)throw c("InvalidAccessError","Invalid selector.");return n.getStats()}var r=[];return this.transceivers.forEach((function(e){["rtpSender","rtpReceiver","iceGatherer","iceTransport","dtlsTransport"].forEach((function(t){e[t]&&r.push(e[t].getStats())}))})),Promise.all(r).then((function(e){var t=new Map;return e.forEach((function(e){e.forEach((function(e){t.set(e.id,e)}))})),t}))};["RTCRtpSender","RTCRtpReceiver","RTCIceGatherer","RTCIceTransport","RTCDtlsTransport"].forEach((function(t){var n=e[t];if(n&&n.prototype&&n.prototype.getStats){var r=n.prototype.getStats;n.prototype.getStats=function(){return r.apply(this).then((function(e){var t=new Map;return Object.keys(e).forEach((function(n){var r;e[n].type={inboundrtp:"inbound-rtp",outboundrtp:"outbound-rtp",candidatepair:"candidate-pair",localcandidate:"local-candidate",remotecandidate:"remote-candidate"}[(r=e[n]).type]||r.type,t.set(n,e[n])})),t}))}}}));var p=["createOffer","createAnswer"];return p.forEach((function(e){var t=l.prototype[e];l.prototype[e]=function(){var e=arguments;return"function"==typeof e[0]||"function"==typeof e[1]?t.apply(this,[arguments[2]]).then((function(t){"function"==typeof e[0]&&e[0].apply(null,[t])}),(function(t){"function"==typeof e[1]&&e[1].apply(null,[t])})):t.apply(this,arguments)}})),(p=["setLocalDescription","setRemoteDescription","addIceCandidate"]).forEach((function(e){var t=l.prototype[e];l.prototype[e]=function(){var e=arguments;return"function"==typeof e[1]||"function"==typeof e[2]?t.apply(this,arguments).then((function(){"function"==typeof e[1]&&e[1].apply(null)}),(function(t){"function"==typeof e[2]&&e[2].apply(null,[t])})):t.apply(this,arguments)}})),["getStats"].forEach((function(e){var t=l.prototype[e];l.prototype[e]=function(){var e=arguments;return"function"==typeof e[1]?t.apply(this,arguments).then((function(){"function"==typeof e[1]&&e[1].apply(null)})):t.apply(this,arguments)}})),l}},function(e,t,n){var r=n(8)();n(12)(r),n(13)(r),n(14)(r),n(15)(r),n(24)(r),n(25)(r),n(26)(r),n(27)(r),n(28)(r),n(29)(r),n(30)(r),n(31)(r),n(32)(r),n(33)(r),n(34)(r),n(35)(r),n(36)(r),n(37)(r),n(38)(r),n(39)(r),n(57),n(41)(r),n(42)(r),n(43)(r),n(44)(r),n(45)(r),n(46)(r),n(50)(r),n(51)(r),n(52)(r),n(53)(r),n(54)(r),n(55)(r),n(56)(r),e.exports=r},function(e,t,n){(function(t){function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function i(e){return(i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}e.exports=function(){"use strict";var e=n(11).version,o=Array.prototype,s=o.indexOf?o.indexOf:(o.indexOf=function(e,t){for(var n=null===t?0:t<0?Math.max(0,this.length+t):t;n<this.length;n++)if(n in this&&this[n]===e)return n;return-1},o.indexOf),a=function(e){var t=i(e);if("object"===t){if(null===e)return"object";if(e instanceof Array||!(e instanceof Object)&&"[object Array]"===Object.prototype.toString.call(e)||"number"==typeof e.length&&void 0!==e.splice&&void 0!==e.propertyIsEnumerable&&!e.propertyIsEnumerable("splice"))return"array";if(!(e instanceof Object||"[object Function]"!==Object.prototype.toString.call(e)&&(void 0===e.call||void 0===e.propertyIsEnumerable||e.propertyIsEnumerable("call"))))return"function";if(1===e.nodeType)return"element";if(9===e.nodeType)return"document";if(e===window)return"window";if(e instanceof Date)return"date";if(e.callee)return"arguments";if(e instanceof SyntaxError)return"SyntaxError";if(e instanceof Error)return"Error"}else if("function"===t&&void 0===e.call)return"object";return t},c=navigator.userAgent.indexOf("MSIE")>-1?"MSIE":navigator.userAgent.indexOf("Firefox")>-1?"Firefox":navigator.userAgent.indexOf("Chrome")>-1?"Chrome":navigator.userAgent.indexOf("Safari")>-1?"Safari":navigator.userAgent.indexOf("Opera")>-1?"Opera":navigator.userAgent.indexOf("Iceweasel")>-1?"Firefox":"undefined",u=/MSIE (\d+\.\d+);/.test(navigator.userAgent)?parseInt(RegExp.$1,10):/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)?parseInt(RegExp.$1,10):/Chrome[\/\s](\d+\.\d+)/.test(navigator.userAgent)?parseInt(RegExp.$1,10):/Safari[\/\s](\d+\.\d+)/.test(navigator.userAgent)&&/Version[\/\s](\d+\.\d+)/.test(navigator.userAgent)?parseInt(RegExp.$1,10):/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent)&&/Version[\/\s](\d+\.\d+)/.test(navigator.userAgent)?parseInt(RegExp.$1,10):/Iceweasel[\/\s](\d+\.\d+)/.test(navigator.userAgent)?parseInt(RegExp.$1,10):"undefined",l=navigator.userAgent.toLowerCase();return new(function(){function n(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,n),this.version=e,this.typeOf=a,this.indexOf=s,this.extend=t.extend,this.crypto={},this.modules={},this.media={},this.structs={},this.controllers={},this.browser={navigator:c,version:u,Ie:/msie/.test(l)&&!/opera/.test(l),Gecko:navigator.userAgent.indexOf("Gecko")>-1&&-1===navigator.userAgent.indexOf("KHTML"),Webkit:/webkit/.test(l),Opera:"[object Opera]"===Object.prototype.toString.call(window.opera),platform:navigator.userAgent.match(/ip(?:ad|od|hone)/)?"ios":(navigator.userAgent.match(/(?:webos|android)/)||navigator.platform.toLowerCase().match(/mac|win|linux/)||["other"])[0]}}var i,o,p;return i=n,(o=[{key:"register",value:function(e,t){var n=null;return n="function"==typeof t?t(this,e):t,this[e]=n}},{key:"registerModule",value:function(e,t){return this.register.call(this.modules,e,t)}},{key:"registerController",value:function(e,t){return this.register.call(this.controllers,e,t)}},{key:"basename",value:function(e){return e.replace(/\\/g,"/").replace(/.*\//,"")}},{key:"dirname",value:function(e){return e.replace(/\\/g,"/").replace(/\/[^\/]*$/,"")}}])&&r(i.prototype,o),p&&r(i,p),n}())}}).call(this,n(0))},function(e,t,n){(function(t){e.exports=t.jQuery=n(10)}).call(this,n(3))},function(e,t,n){var r;!function(t,n){"use strict";"object"==typeof e.exports?e.exports=t.document?n(t,!0):function(e){if(!e.document)throw new Error("jQuery requires a window with a document");return n(e)}:n(t)}("undefined"!=typeof window?window:this,(function(n,i){"use strict";var o=[],s=n.document,a=Object.getPrototypeOf,c=o.slice,u=o.concat,l=o.push,p=o.indexOf,h={},f=h.toString,d=h.hasOwnProperty,g=d.toString,m=g.call(Object),y={},v=function(e){return"function"==typeof e&&"number"!=typeof e.nodeType},b=function(e){return null!=e&&e===e.window},w={type:!0,src:!0,nonce:!0,noModule:!0};function x(e,t,n){var r,i,o=(n=n||s).createElement("script");if(o.text=e,t)for(r in w)(i=t[r]||t.getAttribute&&t.getAttribute(r))&&o.setAttribute(r,i);n.head.appendChild(o).parentNode.removeChild(o)}function k(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?h[f.call(e)]||"object":typeof e}var T=function(e,t){return new T.fn.init(e,t)},C=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;function S(e){var t=!!e&&"length"in e&&e.length,n=k(e);return!v(e)&&!b(e)&&("array"===n||0===t||"number"==typeof t&&t>0&&t-1 in e)}T.fn=T.prototype={jquery:"3.4.1",constructor:T,length:0,toArray:function(){return c.call(this)},get:function(e){return null==e?c.call(this):e<0?this[e+this.length]:this[e]},pushStack:function(e){var t=T.merge(this.constructor(),e);return t.prevObject=this,t},each:function(e){return T.each(this,e)},map:function(e){return this.pushStack(T.map(this,(function(t,n){return e.call(t,n,t)})))},slice:function(){return this.pushStack(c.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(e){var t=this.length,n=+e+(e<0?t:0);return this.pushStack(n>=0&&n<t?[this[n]]:[])},end:function(){return this.prevObject||this.constructor()},push:l,sort:o.sort,splice:o.splice},T.extend=T.fn.extend=function(){var e,t,n,r,i,o,s=arguments[0]||{},a=1,c=arguments.length,u=!1;for("boolean"==typeof s&&(u=s,s=arguments[a]||{},a++),"object"==typeof s||v(s)||(s={}),a===c&&(s=this,a--);a<c;a++)if(null!=(e=arguments[a]))for(t in e)r=e[t],"__proto__"!==t&&s!==r&&(u&&r&&(T.isPlainObject(r)||(i=Array.isArray(r)))?(n=s[t],o=i&&!Array.isArray(n)?[]:i||T.isPlainObject(n)?n:{},i=!1,s[t]=T.extend(u,o,r)):void 0!==r&&(s[t]=r));return s},T.extend({expando:"jQuery"+("3.4.1"+Math.random()).replace(/\D/g,""),isReady:!0,error:function(e){throw new Error(e)},noop:function(){},isPlainObject:function(e){var t,n;return!(!e||"[object Object]"!==f.call(e))&&(!(t=a(e))||"function"==typeof(n=d.call(t,"constructor")&&t.constructor)&&g.call(n)===m)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},globalEval:function(e,t){x(e,{nonce:t&&t.nonce})},each:function(e,t){var n,r=0;if(S(e))for(n=e.length;r<n&&!1!==t.call(e[r],r,e[r]);r++);else for(r in e)if(!1===t.call(e[r],r,e[r]))break;return e},trim:function(e){return null==e?"":(e+"").replace(C,"")},makeArray:function(e,t){var n=t||[];return null!=e&&(S(Object(e))?T.merge(n,"string"==typeof e?[e]:e):l.call(n,e)),n},inArray:function(e,t,n){return null==t?-1:p.call(t,e,n)},merge:function(e,t){for(var n=+t.length,r=0,i=e.length;r<n;r++)e[i++]=t[r];return e.length=i,e},grep:function(e,t,n){for(var r=[],i=0,o=e.length,s=!n;i<o;i++)!t(e[i],i)!==s&&r.push(e[i]);return r},map:function(e,t,n){var r,i,o=0,s=[];if(S(e))for(r=e.length;o<r;o++)null!=(i=t(e[o],o,n))&&s.push(i);else for(o in e)null!=(i=t(e[o],o,n))&&s.push(i);return u.apply([],s)},guid:1,support:y}),"function"==typeof Symbol&&(T.fn[Symbol.iterator]=o[Symbol.iterator]),T.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),(function(e,t){h["[object "+t+"]"]=t.toLowerCase()}));var E=function(e){var t,n,r,i,o,s,a,c,u,l,p,h,f,d,g,m,y,v,b,w="sizzle"+1*new Date,x=e.document,k=0,T=0,C=ce(),S=ce(),E=ce(),R=ce(),P=function(e,t){return e===t&&(p=!0),0},O={}.hasOwnProperty,A=[],D=A.pop,N=A.push,_=A.push,I=A.slice,j=function(e,t){for(var n=0,r=e.length;n<r;n++)if(e[n]===t)return n;return-1},L="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",U="(?:\\\\.|[\\w-]|[^\0-\\xa0])+",B="\\["+M+"*("+U+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+U+"))|)"+M+"*\\]",F=":("+U+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+B+")*)|.*)\\)|)",q=new RegExp(M+"+","g"),G=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),W=new RegExp("^"+M+"*,"+M+"*"),H=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),V=new RegExp(M+"|>"),z=new RegExp(F),$=new RegExp("^"+U+"$"),J={ID:new RegExp("^#("+U+")"),CLASS:new RegExp("^\\.("+U+")"),TAG:new RegExp("^("+U+"|[*])"),ATTR:new RegExp("^"+B),PSEUDO:new RegExp("^"+F),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+L+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},Y=/HTML$/i,K=/^(?:input|select|textarea|button)$/i,Q=/^h\d$/i,X=/^[^{]+\{\s*\[native \w/,Z=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ee=/[+~]/,te=new RegExp("\\\\([\\da-f]{1,6}"+M+"?|("+M+")|.)","ig"),ne=function(e,t,n){var r="0x"+t-65536;return r!=r||n?t:r<0?String.fromCharCode(r+65536):String.fromCharCode(r>>10|55296,1023&r|56320)},re=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,ie=function(e,t){return t?"\0"===e?"�":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e},oe=function(){h()},se=we((function(e){return!0===e.disabled&&"fieldset"===e.nodeName.toLowerCase()}),{dir:"parentNode",next:"legend"});try{_.apply(A=I.call(x.childNodes),x.childNodes),A[x.childNodes.length].nodeType}catch(e){_={apply:A.length?function(e,t){N.apply(e,I.call(t))}:function(e,t){for(var n=e.length,r=0;e[n++]=t[r++];);e.length=n-1}}}function ae(e,t,r,i){var o,a,u,l,p,d,y,v=t&&t.ownerDocument,k=t?t.nodeType:9;if(r=r||[],"string"!=typeof e||!e||1!==k&&9!==k&&11!==k)return r;if(!i&&((t?t.ownerDocument||t:x)!==f&&h(t),t=t||f,g)){if(11!==k&&(p=Z.exec(e)))if(o=p[1]){if(9===k){if(!(u=t.getElementById(o)))return r;if(u.id===o)return r.push(u),r}else if(v&&(u=v.getElementById(o))&&b(t,u)&&u.id===o)return r.push(u),r}else{if(p[2])return _.apply(r,t.getElementsByTagName(e)),r;if((o=p[3])&&n.getElementsByClassName&&t.getElementsByClassName)return _.apply(r,t.getElementsByClassName(o)),r}if(n.qsa&&!R[e+" "]&&(!m||!m.test(e))&&(1!==k||"object"!==t.nodeName.toLowerCase())){if(y=e,v=t,1===k&&V.test(e)){for((l=t.getAttribute("id"))?l=l.replace(re,ie):t.setAttribute("id",l=w),a=(d=s(e)).length;a--;)d[a]="#"+l+" "+be(d[a]);y=d.join(","),v=ee.test(e)&&ye(t.parentNode)||t}try{return _.apply(r,v.querySelectorAll(y)),r}catch(t){R(e,!0)}finally{l===w&&t.removeAttribute("id")}}}return c(e.replace(G,"$1"),t,r,i)}function ce(){var e=[];return function t(n,i){return e.push(n+" ")>r.cacheLength&&delete t[e.shift()],t[n+" "]=i}}function ue(e){return e[w]=!0,e}function le(e){var t=f.createElement("fieldset");try{return!!e(t)}catch(e){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function pe(e,t){for(var n=e.split("|"),i=n.length;i--;)r.attrHandle[n[i]]=t}function he(e,t){var n=t&&e,r=n&&1===e.nodeType&&1===t.nodeType&&e.sourceIndex-t.sourceIndex;if(r)return r;if(n)for(;n=n.nextSibling;)if(n===t)return-1;return e?1:-1}function fe(e){return function(t){return"input"===t.nodeName.toLowerCase()&&t.type===e}}function de(e){return function(t){var n=t.nodeName.toLowerCase();return("input"===n||"button"===n)&&t.type===e}}function ge(e){return function(t){return"form"in t?t.parentNode&&!1===t.disabled?"label"in t?"label"in t.parentNode?t.parentNode.disabled===e:t.disabled===e:t.isDisabled===e||t.isDisabled!==!e&&se(t)===e:t.disabled===e:"label"in t&&t.disabled===e}}function me(e){return ue((function(t){return t=+t,ue((function(n,r){for(var i,o=e([],n.length,t),s=o.length;s--;)n[i=o[s]]&&(n[i]=!(r[i]=n[i]))}))}))}function ye(e){return e&&void 0!==e.getElementsByTagName&&e}for(t in n=ae.support={},o=ae.isXML=function(e){var t=e.namespaceURI,n=(e.ownerDocument||e).documentElement;return!Y.test(t||n&&n.nodeName||"HTML")},h=ae.setDocument=function(e){var t,i,s=e?e.ownerDocument||e:x;return s!==f&&9===s.nodeType&&s.documentElement?(d=(f=s).documentElement,g=!o(f),x!==f&&(i=f.defaultView)&&i.top!==i&&(i.addEventListener?i.addEventListener("unload",oe,!1):i.attachEvent&&i.attachEvent("onunload",oe)),n.attributes=le((function(e){return e.className="i",!e.getAttribute("className")})),n.getElementsByTagName=le((function(e){return e.appendChild(f.createComment("")),!e.getElementsByTagName("*").length})),n.getElementsByClassName=X.test(f.getElementsByClassName),n.getById=le((function(e){return d.appendChild(e).id=w,!f.getElementsByName||!f.getElementsByName(w).length})),n.getById?(r.filter.ID=function(e){var t=e.replace(te,ne);return function(e){return e.getAttribute("id")===t}},r.find.ID=function(e,t){if(void 0!==t.getElementById&&g){var n=t.getElementById(e);return n?[n]:[]}}):(r.filter.ID=function(e){var t=e.replace(te,ne);return function(e){var n=void 0!==e.getAttributeNode&&e.getAttributeNode("id");return n&&n.value===t}},r.find.ID=function(e,t){if(void 0!==t.getElementById&&g){var n,r,i,o=t.getElementById(e);if(o){if((n=o.getAttributeNode("id"))&&n.value===e)return[o];for(i=t.getElementsByName(e),r=0;o=i[r++];)if((n=o.getAttributeNode("id"))&&n.value===e)return[o]}return[]}}),r.find.TAG=n.getElementsByTagName?function(e,t){return void 0!==t.getElementsByTagName?t.getElementsByTagName(e):n.qsa?t.querySelectorAll(e):void 0}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){for(;n=o[i++];)1===n.nodeType&&r.push(n);return r}return o},r.find.CLASS=n.getElementsByClassName&&function(e,t){if(void 0!==t.getElementsByClassName&&g)return t.getElementsByClassName(e)},y=[],m=[],(n.qsa=X.test(f.querySelectorAll))&&(le((function(e){d.appendChild(e).innerHTML="<a id='"+w+"'></a><select id='"+w+"-\r\\' msallowcapture=''><option selected=''></option></select>",e.querySelectorAll("[msallowcapture^='']").length&&m.push("[*^$]="+M+"*(?:''|\"\")"),e.querySelectorAll("[selected]").length||m.push("\\["+M+"*(?:value|"+L+")"),e.querySelectorAll("[id~="+w+"-]").length||m.push("~="),e.querySelectorAll(":checked").length||m.push(":checked"),e.querySelectorAll("a#"+w+"+*").length||m.push(".#.+[+~]")})),le((function(e){e.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var t=f.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),e.querySelectorAll("[name=d]").length&&m.push("name"+M+"*[*^$|!~]?="),2!==e.querySelectorAll(":enabled").length&&m.push(":enabled",":disabled"),d.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&m.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),m.push(",.*:")}))),(n.matchesSelector=X.test(v=d.matches||d.webkitMatchesSelector||d.mozMatchesSelector||d.oMatchesSelector||d.msMatchesSelector))&&le((function(e){n.disconnectedMatch=v.call(e,"*"),v.call(e,"[s!='']:x"),y.push("!=",F)})),m=m.length&&new RegExp(m.join("|")),y=y.length&&new RegExp(y.join("|")),t=X.test(d.compareDocumentPosition),b=t||X.test(d.contains)?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)for(;t=t.parentNode;)if(t===e)return!0;return!1},P=t?function(e,t){if(e===t)return p=!0,0;var r=!e.compareDocumentPosition-!t.compareDocumentPosition;return r||(1&(r=(e.ownerDocument||e)===(t.ownerDocument||t)?e.compareDocumentPosition(t):1)||!n.sortDetached&&t.compareDocumentPosition(e)===r?e===f||e.ownerDocument===x&&b(x,e)?-1:t===f||t.ownerDocument===x&&b(x,t)?1:l?j(l,e)-j(l,t):0:4&r?-1:1)}:function(e,t){if(e===t)return p=!0,0;var n,r=0,i=e.parentNode,o=t.parentNode,s=[e],a=[t];if(!i||!o)return e===f?-1:t===f?1:i?-1:o?1:l?j(l,e)-j(l,t):0;if(i===o)return he(e,t);for(n=e;n=n.parentNode;)s.unshift(n);for(n=t;n=n.parentNode;)a.unshift(n);for(;s[r]===a[r];)r++;return r?he(s[r],a[r]):s[r]===x?-1:a[r]===x?1:0},f):f},ae.matches=function(e,t){return ae(e,null,null,t)},ae.matchesSelector=function(e,t){if((e.ownerDocument||e)!==f&&h(e),n.matchesSelector&&g&&!R[t+" "]&&(!y||!y.test(t))&&(!m||!m.test(t)))try{var r=v.call(e,t);if(r||n.disconnectedMatch||e.document&&11!==e.document.nodeType)return r}catch(e){R(t,!0)}return ae(t,f,null,[e]).length>0},ae.contains=function(e,t){return(e.ownerDocument||e)!==f&&h(e),b(e,t)},ae.attr=function(e,t){(e.ownerDocument||e)!==f&&h(e);var i=r.attrHandle[t.toLowerCase()],o=i&&O.call(r.attrHandle,t.toLowerCase())?i(e,t,!g):void 0;return void 0!==o?o:n.attributes||!g?e.getAttribute(t):(o=e.getAttributeNode(t))&&o.specified?o.value:null},ae.escape=function(e){return(e+"").replace(re,ie)},ae.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},ae.uniqueSort=function(e){var t,r=[],i=0,o=0;if(p=!n.detectDuplicates,l=!n.sortStable&&e.slice(0),e.sort(P),p){for(;t=e[o++];)t===e[o]&&(i=r.push(o));for(;i--;)e.splice(r[i],1)}return l=null,e},i=ae.getText=function(e){var t,n="",r=0,o=e.nodeType;if(o){if(1===o||9===o||11===o){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=i(e)}else if(3===o||4===o)return e.nodeValue}else for(;t=e[r++];)n+=i(t);return n},(r=ae.selectors={cacheLength:50,createPseudo:ue,match:J,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(te,ne),e[3]=(e[3]||e[4]||e[5]||"").replace(te,ne),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||ae.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&ae.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return J.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&z.test(n)&&(t=s(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(te,ne).toLowerCase();return"*"===e?function(){return!0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=C[e+" "];return t||(t=new RegExp("(^|"+M+")"+e+"("+M+"|$)"))&&C(e,(function(e){return t.test("string"==typeof e.className&&e.className||void 0!==e.getAttribute&&e.getAttribute("class")||"")}))},ATTR:function(e,t,n){return function(r){var i=ae.attr(r,e);return null==i?"!="===t:!t||(i+="","="===t?i===n:"!="===t?i!==n:"^="===t?n&&0===i.indexOf(n):"*="===t?n&&i.indexOf(n)>-1:"$="===t?n&&i.slice(-n.length)===n:"~="===t?(" "+i.replace(q," ")+" ").indexOf(n)>-1:"|="===t&&(i===n||i.slice(0,n.length+1)===n+"-"))}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),s="last"!==e.slice(-4),a="of-type"===t;return 1===r&&0===i?function(e){return!!e.parentNode}:function(t,n,c){var u,l,p,h,f,d,g=o!==s?"nextSibling":"previousSibling",m=t.parentNode,y=a&&t.nodeName.toLowerCase(),v=!c&&!a,b=!1;if(m){if(o){for(;g;){for(h=t;h=h[g];)if(a?h.nodeName.toLowerCase()===y:1===h.nodeType)return!1;d=g="only"===e&&!d&&"nextSibling"}return!0}if(d=[s?m.firstChild:m.lastChild],s&&v){for(b=(f=(u=(l=(p=(h=m)[w]||(h[w]={}))[h.uniqueID]||(p[h.uniqueID]={}))[e]||[])[0]===k&&u[1])&&u[2],h=f&&m.childNodes[f];h=++f&&h&&h[g]||(b=f=0)||d.pop();)if(1===h.nodeType&&++b&&h===t){l[e]=[k,f,b];break}}else if(v&&(b=f=(u=(l=(p=(h=t)[w]||(h[w]={}))[h.uniqueID]||(p[h.uniqueID]={}))[e]||[])[0]===k&&u[1]),!1===b)for(;(h=++f&&h&&h[g]||(b=f=0)||d.pop())&&((a?h.nodeName.toLowerCase()!==y:1!==h.nodeType)||!++b||(v&&((l=(p=h[w]||(h[w]={}))[h.uniqueID]||(p[h.uniqueID]={}))[e]=[k,b]),h!==t)););return(b-=i)===r||b%r==0&&b/r>=0}}},PSEUDO:function(e,t){var n,i=r.pseudos[e]||r.setFilters[e.toLowerCase()]||ae.error("unsupported pseudo: "+e);return i[w]?i(t):i.length>1?(n=[e,e,"",t],r.setFilters.hasOwnProperty(e.toLowerCase())?ue((function(e,n){for(var r,o=i(e,t),s=o.length;s--;)e[r=j(e,o[s])]=!(n[r]=o[s])})):function(e){return i(e,0,n)}):i}},pseudos:{not:ue((function(e){var t=[],n=[],r=a(e.replace(G,"$1"));return r[w]?ue((function(e,t,n,i){for(var o,s=r(e,null,i,[]),a=e.length;a--;)(o=s[a])&&(e[a]=!(t[a]=o))})):function(e,i,o){return t[0]=e,r(t,null,o,n),t[0]=null,!n.pop()}})),has:ue((function(e){return function(t){return ae(e,t).length>0}})),contains:ue((function(e){return e=e.replace(te,ne),function(t){return(t.textContent||i(t)).indexOf(e)>-1}})),lang:ue((function(e){return $.test(e||"")||ae.error("unsupported lang: "+e),e=e.replace(te,ne).toLowerCase(),function(t){var n;do{if(n=g?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return(n=n.toLowerCase())===e||0===n.indexOf(e+"-")}while((t=t.parentNode)&&1===t.nodeType);return!1}})),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===d},focus:function(e){return e===f.activeElement&&(!f.hasFocus||f.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:ge(!1),disabled:ge(!0),checked:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,!0===e.selected},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return!1;return!0},parent:function(e){return!r.pseudos.empty(e)},header:function(e){return Q.test(e.nodeName)},input:function(e){return K.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return"input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:me((function(){return[0]})),last:me((function(e,t){return[t-1]})),eq:me((function(e,t,n){return[n<0?n+t:n]})),even:me((function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e})),odd:me((function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e})),lt:me((function(e,t,n){for(var r=n<0?n+t:n>t?t:n;--r>=0;)e.push(r);return e})),gt:me((function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e}))}}).pseudos.nth=r.pseudos.eq,{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})r.pseudos[t]=fe(t);for(t in{submit:!0,reset:!0})r.pseudos[t]=de(t);function ve(){}function be(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function we(e,t,n){var r=t.dir,i=t.next,o=i||r,s=n&&"parentNode"===o,a=T++;return t.first?function(t,n,i){for(;t=t[r];)if(1===t.nodeType||s)return e(t,n,i);return!1}:function(t,n,c){var u,l,p,h=[k,a];if(c){for(;t=t[r];)if((1===t.nodeType||s)&&e(t,n,c))return!0}else for(;t=t[r];)if(1===t.nodeType||s)if(l=(p=t[w]||(t[w]={}))[t.uniqueID]||(p[t.uniqueID]={}),i&&i===t.nodeName.toLowerCase())t=t[r]||t;else{if((u=l[o])&&u[0]===k&&u[1]===a)return h[2]=u[2];if(l[o]=h,h[2]=e(t,n,c))return!0}return!1}}function xe(e){return e.length>1?function(t,n,r){for(var i=e.length;i--;)if(!e[i](t,n,r))return!1;return!0}:e[0]}function ke(e,t,n,r,i){for(var o,s=[],a=0,c=e.length,u=null!=t;a<c;a++)(o=e[a])&&(n&&!n(o,r,i)||(s.push(o),u&&t.push(a)));return s}function Te(e,t,n,r,i,o){return r&&!r[w]&&(r=Te(r)),i&&!i[w]&&(i=Te(i,o)),ue((function(o,s,a,c){var u,l,p,h=[],f=[],d=s.length,g=o||function(e,t,n){for(var r=0,i=t.length;r<i;r++)ae(e,t[r],n);return n}(t||"*",a.nodeType?[a]:a,[]),m=!e||!o&&t?g:ke(g,h,e,a,c),y=n?i||(o?e:d||r)?[]:s:m;if(n&&n(m,y,a,c),r)for(u=ke(y,f),r(u,[],a,c),l=u.length;l--;)(p=u[l])&&(y[f[l]]=!(m[f[l]]=p));if(o){if(i||e){if(i){for(u=[],l=y.length;l--;)(p=y[l])&&u.push(m[l]=p);i(null,y=[],u,c)}for(l=y.length;l--;)(p=y[l])&&(u=i?j(o,p):h[l])>-1&&(o[u]=!(s[u]=p))}}else y=ke(y===s?y.splice(d,y.length):y),i?i(null,s,y,c):_.apply(s,y)}))}function Ce(e){for(var t,n,i,o=e.length,s=r.relative[e[0].type],a=s||r.relative[" "],c=s?1:0,l=we((function(e){return e===t}),a,!0),p=we((function(e){return j(t,e)>-1}),a,!0),h=[function(e,n,r){var i=!s&&(r||n!==u)||((t=n).nodeType?l(e,n,r):p(e,n,r));return t=null,i}];c<o;c++)if(n=r.relative[e[c].type])h=[we(xe(h),n)];else{if((n=r.filter[e[c].type].apply(null,e[c].matches))[w]){for(i=++c;i<o&&!r.relative[e[i].type];i++);return Te(c>1&&xe(h),c>1&&be(e.slice(0,c-1).concat({value:" "===e[c-2].type?"*":""})).replace(G,"$1"),n,c<i&&Ce(e.slice(c,i)),i<o&&Ce(e=e.slice(i)),i<o&&be(e))}h.push(n)}return xe(h)}return ve.prototype=r.filters=r.pseudos,r.setFilters=new ve,s=ae.tokenize=function(e,t){var n,i,o,s,a,c,u,l=S[e+" "];if(l)return t?0:l.slice(0);for(a=e,c=[],u=r.preFilter;a;){for(s in n&&!(i=W.exec(a))||(i&&(a=a.slice(i[0].length)||a),c.push(o=[])),n=!1,(i=H.exec(a))&&(n=i.shift(),o.push({value:n,type:i[0].replace(G," ")}),a=a.slice(n.length)),r.filter)!(i=J[s].exec(a))||u[s]&&!(i=u[s](i))||(n=i.shift(),o.push({value:n,type:s,matches:i}),a=a.slice(n.length));if(!n)break}return t?a.length:a?ae.error(e):S(e,c).slice(0)},a=ae.compile=function(e,t){var n,i=[],o=[],a=E[e+" "];if(!a){for(t||(t=s(e)),n=t.length;n--;)(a=Ce(t[n]))[w]?i.push(a):o.push(a);(a=E(e,function(e,t){var n=t.length>0,i=e.length>0,o=function(o,s,a,c,l){var p,d,m,y=0,v="0",b=o&&[],w=[],x=u,T=o||i&&r.find.TAG("*",l),C=k+=null==x?1:Math.random()||.1,S=T.length;for(l&&(u=s===f||s||l);v!==S&&null!=(p=T[v]);v++){if(i&&p){for(d=0,s||p.ownerDocument===f||(h(p),a=!g);m=e[d++];)if(m(p,s||f,a)){c.push(p);break}l&&(k=C)}n&&((p=!m&&p)&&y--,o&&b.push(p))}if(y+=v,n&&v!==y){for(d=0;m=t[d++];)m(b,w,s,a);if(o){if(y>0)for(;v--;)b[v]||w[v]||(w[v]=D.call(c));w=ke(w)}_.apply(c,w),l&&!o&&w.length>0&&y+t.length>1&&ae.uniqueSort(c)}return l&&(k=C,u=x),b};return n?ue(o):o}(o,i))).selector=e}return a},c=ae.select=function(e,t,n,i){var o,c,u,l,p,h="function"==typeof e&&e,f=!i&&s(e=h.selector||e);if(n=n||[],1===f.length){if((c=f[0]=f[0].slice(0)).length>2&&"ID"===(u=c[0]).type&&9===t.nodeType&&g&&r.relative[c[1].type]){if(!(t=(r.find.ID(u.matches[0].replace(te,ne),t)||[])[0]))return n;h&&(t=t.parentNode),e=e.slice(c.shift().value.length)}for(o=J.needsContext.test(e)?0:c.length;o--&&(u=c[o],!r.relative[l=u.type]);)if((p=r.find[l])&&(i=p(u.matches[0].replace(te,ne),ee.test(c[0].type)&&ye(t.parentNode)||t))){if(c.splice(o,1),!(e=i.length&&be(c)))return _.apply(n,i),n;break}}return(h||a(e,f))(i,t,!g,n,!t||ee.test(e)&&ye(t.parentNode)||t),n},n.sortStable=w.split("").sort(P).join("")===w,n.detectDuplicates=!!p,h(),n.sortDetached=le((function(e){return 1&e.compareDocumentPosition(f.createElement("fieldset"))})),le((function(e){return e.innerHTML="<a href='#'></a>","#"===e.firstChild.getAttribute("href")}))||pe("type|href|height|width",(function(e,t,n){if(!n)return e.getAttribute(t,"type"===t.toLowerCase()?1:2)})),n.attributes&&le((function(e){return e.innerHTML="<input/>",e.firstChild.setAttribute("value",""),""===e.firstChild.getAttribute("value")}))||pe("value",(function(e,t,n){if(!n&&"input"===e.nodeName.toLowerCase())return e.defaultValue})),le((function(e){return null==e.getAttribute("disabled")}))||pe(L,(function(e,t,n){var r;if(!n)return!0===e[t]?t.toLowerCase():(r=e.getAttributeNode(t))&&r.specified?r.value:null})),ae}(n);T.find=E,T.expr=E.selectors,T.expr[":"]=T.expr.pseudos,T.uniqueSort=T.unique=E.uniqueSort,T.text=E.getText,T.isXMLDoc=E.isXML,T.contains=E.contains,T.escapeSelector=E.escape;var R=function(e,t,n){for(var r=[],i=void 0!==n;(e=e[t])&&9!==e.nodeType;)if(1===e.nodeType){if(i&&T(e).is(n))break;r.push(e)}return r},P=function(e,t){for(var n=[];e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n},O=T.expr.match.needsContext;function A(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()}var D=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;function N(e,t,n){return v(t)?T.grep(e,(function(e,r){return!!t.call(e,r,e)!==n})):t.nodeType?T.grep(e,(function(e){return e===t!==n})):"string"!=typeof t?T.grep(e,(function(e){return p.call(t,e)>-1!==n})):T.filter(t,e,n)}T.filter=function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),1===t.length&&1===r.nodeType?T.find.matchesSelector(r,e)?[r]:[]:T.find.matches(e,T.grep(t,(function(e){return 1===e.nodeType})))},T.fn.extend({find:function(e){var t,n,r=this.length,i=this;if("string"!=typeof e)return this.pushStack(T(e).filter((function(){for(t=0;t<r;t++)if(T.contains(i[t],this))return!0})));for(n=this.pushStack([]),t=0;t<r;t++)T.find(e,i[t],n);return r>1?T.uniqueSort(n):n},filter:function(e){return this.pushStack(N(this,e||[],!1))},not:function(e){return this.pushStack(N(this,e||[],!0))},is:function(e){return!!N(this,"string"==typeof e&&O.test(e)?T(e):e||[],!1).length}});var _,I=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;(T.fn.init=function(e,t,n){var r,i;if(!e)return this;if(n=n||_,"string"==typeof e){if(!(r="<"===e[0]&&">"===e[e.length-1]&&e.length>=3?[null,e,null]:I.exec(e))||!r[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(r[1]){if(t=t instanceof T?t[0]:t,T.merge(this,T.parseHTML(r[1],t&&t.nodeType?t.ownerDocument||t:s,!0)),D.test(r[1])&&T.isPlainObject(t))for(r in t)v(this[r])?this[r](t[r]):this.attr(r,t[r]);return this}return(i=s.getElementById(r[2]))&&(this[0]=i,this.length=1),this}return e.nodeType?(this[0]=e,this.length=1,this):v(e)?void 0!==n.ready?n.ready(e):e(T):T.makeArray(e,this)}).prototype=T.fn,_=T(s);var j=/^(?:parents|prev(?:Until|All))/,L={children:!0,contents:!0,next:!0,prev:!0};function M(e,t){for(;(e=e[t])&&1!==e.nodeType;);return e}T.fn.extend({has:function(e){var t=T(e,this),n=t.length;return this.filter((function(){for(var e=0;e<n;e++)if(T.contains(this,t[e]))return!0}))},closest:function(e,t){var n,r=0,i=this.length,o=[],s="string"!=typeof e&&T(e);if(!O.test(e))for(;r<i;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(n.nodeType<11&&(s?s.index(n)>-1:1===n.nodeType&&T.find.matchesSelector(n,e))){o.push(n);break}return this.pushStack(o.length>1?T.uniqueSort(o):o)},index:function(e){return e?"string"==typeof e?p.call(T(e),this[0]):p.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){return this.pushStack(T.uniqueSort(T.merge(this.get(),T(e,t))))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}}),T.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return R(e,"parentNode")},parentsUntil:function(e,t,n){return R(e,"parentNode",n)},next:function(e){return M(e,"nextSibling")},prev:function(e){return M(e,"previousSibling")},nextAll:function(e){return R(e,"nextSibling")},prevAll:function(e){return R(e,"previousSibling")},nextUntil:function(e,t,n){return R(e,"nextSibling",n)},prevUntil:function(e,t,n){return R(e,"previousSibling",n)},siblings:function(e){return P((e.parentNode||{}).firstChild,e)},children:function(e){return P(e.firstChild)},contents:function(e){return void 0!==e.contentDocument?e.contentDocument:(A(e,"template")&&(e=e.content||e),T.merge([],e.childNodes))}},(function(e,t){T.fn[e]=function(n,r){var i=T.map(this,t,n);return"Until"!==e.slice(-5)&&(r=n),r&&"string"==typeof r&&(i=T.filter(r,i)),this.length>1&&(L[e]||T.uniqueSort(i),j.test(e)&&i.reverse()),this.pushStack(i)}}));var U=/[^\x20\t\r\n\f]+/g;function B(e){return e}function F(e){throw e}function q(e,t,n,r){var i;try{e&&v(i=e.promise)?i.call(e).done(t).fail(n):e&&v(i=e.then)?i.call(e,t,n):t.apply(void 0,[e].slice(r))}catch(e){n.apply(void 0,[e])}}T.Callbacks=function(e){e="string"==typeof e?function(e){var t={};return T.each(e.match(U)||[],(function(e,n){t[n]=!0})),t}(e):T.extend({},e);var t,n,r,i,o=[],s=[],a=-1,c=function(){for(i=i||e.once,r=t=!0;s.length;a=-1)for(n=s.shift();++a<o.length;)!1===o[a].apply(n[0],n[1])&&e.stopOnFalse&&(a=o.length,n=!1);e.memory||(n=!1),t=!1,i&&(o=n?[]:"")},u={add:function(){return o&&(n&&!t&&(a=o.length-1,s.push(n)),function t(n){T.each(n,(function(n,r){v(r)?e.unique&&u.has(r)||o.push(r):r&&r.length&&"string"!==k(r)&&t(r)}))}(arguments),n&&!t&&c()),this},remove:function(){return T.each(arguments,(function(e,t){for(var n;(n=T.inArray(t,o,n))>-1;)o.splice(n,1),n<=a&&a--})),this},has:function(e){return e?T.inArray(e,o)>-1:o.length>0},empty:function(){return o&&(o=[]),this},disable:function(){return i=s=[],o=n="",this},disabled:function(){return!o},lock:function(){return i=s=[],n||t||(o=n=""),this},locked:function(){return!!i},fireWith:function(e,n){return i||(n=[e,(n=n||[]).slice?n.slice():n],s.push(n),t||c()),this},fire:function(){return u.fireWith(this,arguments),this},fired:function(){return!!r}};return u},T.extend({Deferred:function(e){var t=[["notify","progress",T.Callbacks("memory"),T.Callbacks("memory"),2],["resolve","done",T.Callbacks("once memory"),T.Callbacks("once memory"),0,"resolved"],["reject","fail",T.Callbacks("once memory"),T.Callbacks("once memory"),1,"rejected"]],r="pending",i={state:function(){return r},always:function(){return o.done(arguments).fail(arguments),this},catch:function(e){return i.then(null,e)},pipe:function(){var e=arguments;return T.Deferred((function(n){T.each(t,(function(t,r){var i=v(e[r[4]])&&e[r[4]];o[r[1]]((function(){var e=i&&i.apply(this,arguments);e&&v(e.promise)?e.promise().progress(n.notify).done(n.resolve).fail(n.reject):n[r[0]+"With"](this,i?[e]:arguments)}))})),e=null})).promise()},then:function(e,r,i){var o=0;function s(e,t,r,i){return function(){var a=this,c=arguments,u=function(){var n,u;if(!(e<o)){if((n=r.apply(a,c))===t.promise())throw new TypeError("Thenable self-resolution");u=n&&("object"==typeof n||"function"==typeof n)&&n.then,v(u)?i?u.call(n,s(o,t,B,i),s(o,t,F,i)):(o++,u.call(n,s(o,t,B,i),s(o,t,F,i),s(o,t,B,t.notifyWith))):(r!==B&&(a=void 0,c=[n]),(i||t.resolveWith)(a,c))}},l=i?u:function(){try{u()}catch(n){T.Deferred.exceptionHook&&T.Deferred.exceptionHook(n,l.stackTrace),e+1>=o&&(r!==F&&(a=void 0,c=[n]),t.rejectWith(a,c))}};e?l():(T.Deferred.getStackHook&&(l.stackTrace=T.Deferred.getStackHook()),n.setTimeout(l))}}return T.Deferred((function(n){t[0][3].add(s(0,n,v(i)?i:B,n.notifyWith)),t[1][3].add(s(0,n,v(e)?e:B)),t[2][3].add(s(0,n,v(r)?r:F))})).promise()},promise:function(e){return null!=e?T.extend(e,i):i}},o={};return T.each(t,(function(e,n){var s=n[2],a=n[5];i[n[1]]=s.add,a&&s.add((function(){r=a}),t[3-e][2].disable,t[3-e][3].disable,t[0][2].lock,t[0][3].lock),s.add(n[3].fire),o[n[0]]=function(){return o[n[0]+"With"](this===o?void 0:this,arguments),this},o[n[0]+"With"]=s.fireWith})),i.promise(o),e&&e.call(o,o),o},when:function(e){var t=arguments.length,n=t,r=Array(n),i=c.call(arguments),o=T.Deferred(),s=function(e){return function(n){r[e]=this,i[e]=arguments.length>1?c.call(arguments):n,--t||o.resolveWith(r,i)}};if(t<=1&&(q(e,o.done(s(n)).resolve,o.reject,!t),"pending"===o.state()||v(i[n]&&i[n].then)))return o.then();for(;n--;)q(i[n],s(n),o.reject);return o.promise()}});var G=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;T.Deferred.exceptionHook=function(e,t){n.console&&n.console.warn&&e&&G.test(e.name)&&n.console.warn("jQuery.Deferred exception: "+e.message,e.stack,t)},T.readyException=function(e){n.setTimeout((function(){throw e}))};var W=T.Deferred();function H(){s.removeEventListener("DOMContentLoaded",H),n.removeEventListener("load",H),T.ready()}T.fn.ready=function(e){return W.then(e).catch((function(e){T.readyException(e)})),this},T.extend({isReady:!1,readyWait:1,ready:function(e){(!0===e?--T.readyWait:T.isReady)||(T.isReady=!0,!0!==e&&--T.readyWait>0||W.resolveWith(s,[T]))}}),T.ready.then=W.then,"complete"===s.readyState||"loading"!==s.readyState&&!s.documentElement.doScroll?n.setTimeout(T.ready):(s.addEventListener("DOMContentLoaded",H),n.addEventListener("load",H));var V=function(e,t,n,r,i,o,s){var a=0,c=e.length,u=null==n;if("object"===k(n))for(a in i=!0,n)V(e,t,a,n[a],!0,o,s);else if(void 0!==r&&(i=!0,v(r)||(s=!0),u&&(s?(t.call(e,r),t=null):(u=t,t=function(e,t,n){return u.call(T(e),n)})),t))for(;a<c;a++)t(e[a],n,s?r:r.call(e[a],a,t(e[a],n)));return i?e:u?t.call(e):c?t(e[0],n):o},z=/^-ms-/,$=/-([a-z])/g;function J(e,t){return t.toUpperCase()}function Y(e){return e.replace(z,"ms-").replace($,J)}var K=function(e){return 1===e.nodeType||9===e.nodeType||!+e.nodeType};function Q(){this.expando=T.expando+Q.uid++}Q.uid=1,Q.prototype={cache:function(e){var t=e[this.expando];return t||(t={},K(e)&&(e.nodeType?e[this.expando]=t:Object.defineProperty(e,this.expando,{value:t,configurable:!0}))),t},set:function(e,t,n){var r,i=this.cache(e);if("string"==typeof t)i[Y(t)]=n;else for(r in t)i[Y(r)]=t[r];return i},get:function(e,t){return void 0===t?this.cache(e):e[this.expando]&&e[this.expando][Y(t)]},access:function(e,t,n){return void 0===t||t&&"string"==typeof t&&void 0===n?this.get(e,t):(this.set(e,t,n),void 0!==n?n:t)},remove:function(e,t){var n,r=e[this.expando];if(void 0!==r){if(void 0!==t){n=(t=Array.isArray(t)?t.map(Y):(t=Y(t))in r?[t]:t.match(U)||[]).length;for(;n--;)delete r[t[n]]}(void 0===t||T.isEmptyObject(r))&&(e.nodeType?e[this.expando]=void 0:delete e[this.expando])}},hasData:function(e){var t=e[this.expando];return void 0!==t&&!T.isEmptyObject(t)}};var X=new Q,Z=new Q,ee=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,te=/[A-Z]/g;function ne(e,t,n){var r;if(void 0===n&&1===e.nodeType)if(r="data-"+t.replace(te,"-$&").toLowerCase(),"string"==typeof(n=e.getAttribute(r))){try{n=function(e){return"true"===e||"false"!==e&&("null"===e?null:e===+e+""?+e:ee.test(e)?JSON.parse(e):e)}(n)}catch(e){}Z.set(e,t,n)}else n=void 0;return n}T.extend({hasData:function(e){return Z.hasData(e)||X.hasData(e)},data:function(e,t,n){return Z.access(e,t,n)},removeData:function(e,t){Z.remove(e,t)},_data:function(e,t,n){return X.access(e,t,n)},_removeData:function(e,t){X.remove(e,t)}}),T.fn.extend({data:function(e,t){var n,r,i,o=this[0],s=o&&o.attributes;if(void 0===e){if(this.length&&(i=Z.get(o),1===o.nodeType&&!X.get(o,"hasDataAttrs"))){for(n=s.length;n--;)s[n]&&0===(r=s[n].name).indexOf("data-")&&(r=Y(r.slice(5)),ne(o,r,i[r]));X.set(o,"hasDataAttrs",!0)}return i}return"object"==typeof e?this.each((function(){Z.set(this,e)})):V(this,(function(t){var n;if(o&&void 0===t)return void 0!==(n=Z.get(o,e))?n:void 0!==(n=ne(o,e))?n:void 0;this.each((function(){Z.set(this,e,t)}))}),null,t,arguments.length>1,null,!0)},removeData:function(e){return this.each((function(){Z.remove(this,e)}))}}),T.extend({queue:function(e,t,n){var r;if(e)return t=(t||"fx")+"queue",r=X.get(e,t),n&&(!r||Array.isArray(n)?r=X.access(e,t,T.makeArray(n)):r.push(n)),r||[]},dequeue:function(e,t){t=t||"fx";var n=T.queue(e,t),r=n.length,i=n.shift(),o=T._queueHooks(e,t);"inprogress"===i&&(i=n.shift(),r--),i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,(function(){T.dequeue(e,t)}),o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return X.get(e,n)||X.access(e,n,{empty:T.Callbacks("once memory").add((function(){X.remove(e,[t+"queue",n])}))})}}),T.fn.extend({queue:function(e,t){var n=2;return"string"!=typeof e&&(t=e,e="fx",n--),arguments.length<n?T.queue(this[0],e):void 0===t?this:this.each((function(){var n=T.queue(this,e,t);T._queueHooks(this,e),"fx"===e&&"inprogress"!==n[0]&&T.dequeue(this,e)}))},dequeue:function(e){return this.each((function(){T.dequeue(this,e)}))},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,r=1,i=T.Deferred(),o=this,s=this.length,a=function(){--r||i.resolveWith(o,[o])};for("string"!=typeof e&&(t=e,e=void 0),e=e||"fx";s--;)(n=X.get(o[s],e+"queueHooks"))&&n.empty&&(r++,n.empty.add(a));return a(),i.promise(t)}});var re=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,ie=new RegExp("^(?:([+-])=|)("+re+")([a-z%]*)$","i"),oe=["Top","Right","Bottom","Left"],se=s.documentElement,ae=function(e){return T.contains(e.ownerDocument,e)},ce={composed:!0};se.getRootNode&&(ae=function(e){return T.contains(e.ownerDocument,e)||e.getRootNode(ce)===e.ownerDocument});var ue=function(e,t){return"none"===(e=t||e).style.display||""===e.style.display&&ae(e)&&"none"===T.css(e,"display")},le=function(e,t,n,r){var i,o,s={};for(o in t)s[o]=e.style[o],e.style[o]=t[o];for(o in i=n.apply(e,r||[]),t)e.style[o]=s[o];return i};function pe(e,t,n,r){var i,o,s=20,a=r?function(){return r.cur()}:function(){return T.css(e,t,"")},c=a(),u=n&&n[3]||(T.cssNumber[t]?"":"px"),l=e.nodeType&&(T.cssNumber[t]||"px"!==u&&+c)&&ie.exec(T.css(e,t));if(l&&l[3]!==u){for(c/=2,u=u||l[3],l=+c||1;s--;)T.style(e,t,l+u),(1-o)*(1-(o=a()/c||.5))<=0&&(s=0),l/=o;l*=2,T.style(e,t,l+u),n=n||[]}return n&&(l=+l||+c||0,i=n[1]?l+(n[1]+1)*n[2]:+n[2],r&&(r.unit=u,r.start=l,r.end=i)),i}var he={};function fe(e){var t,n=e.ownerDocument,r=e.nodeName,i=he[r];return i||(t=n.body.appendChild(n.createElement(r)),i=T.css(t,"display"),t.parentNode.removeChild(t),"none"===i&&(i="block"),he[r]=i,i)}function de(e,t){for(var n,r,i=[],o=0,s=e.length;o<s;o++)(r=e[o]).style&&(n=r.style.display,t?("none"===n&&(i[o]=X.get(r,"display")||null,i[o]||(r.style.display="")),""===r.style.display&&ue(r)&&(i[o]=fe(r))):"none"!==n&&(i[o]="none",X.set(r,"display",n)));for(o=0;o<s;o++)null!=i[o]&&(e[o].style.display=i[o]);return e}T.fn.extend({show:function(){return de(this,!0)},hide:function(){return de(this)},toggle:function(e){return"boolean"==typeof e?e?this.show():this.hide():this.each((function(){ue(this)?T(this).show():T(this).hide()}))}});var ge=/^(?:checkbox|radio)$/i,me=/<([a-z][^\/\0>\x20\t\r\n\f]*)/i,ye=/^$|^module$|\/(?:java|ecma)script/i,ve={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};function be(e,t){var n;return n=void 0!==e.getElementsByTagName?e.getElementsByTagName(t||"*"):void 0!==e.querySelectorAll?e.querySelectorAll(t||"*"):[],void 0===t||t&&A(e,t)?T.merge([e],n):n}function we(e,t){for(var n=0,r=e.length;n<r;n++)X.set(e[n],"globalEval",!t||X.get(t[n],"globalEval"))}ve.optgroup=ve.option,ve.tbody=ve.tfoot=ve.colgroup=ve.caption=ve.thead,ve.th=ve.td;var xe,ke,Te=/<|&#?\w+;/;function Ce(e,t,n,r,i){for(var o,s,a,c,u,l,p=t.createDocumentFragment(),h=[],f=0,d=e.length;f<d;f++)if((o=e[f])||0===o)if("object"===k(o))T.merge(h,o.nodeType?[o]:o);else if(Te.test(o)){for(s=s||p.appendChild(t.createElement("div")),a=(me.exec(o)||["",""])[1].toLowerCase(),c=ve[a]||ve._default,s.innerHTML=c[1]+T.htmlPrefilter(o)+c[2],l=c[0];l--;)s=s.lastChild;T.merge(h,s.childNodes),(s=p.firstChild).textContent=""}else h.push(t.createTextNode(o));for(p.textContent="",f=0;o=h[f++];)if(r&&T.inArray(o,r)>-1)i&&i.push(o);else if(u=ae(o),s=be(p.appendChild(o),"script"),u&&we(s),n)for(l=0;o=s[l++];)ye.test(o.type||"")&&n.push(o);return p}xe=s.createDocumentFragment().appendChild(s.createElement("div")),(ke=s.createElement("input")).setAttribute("type","radio"),ke.setAttribute("checked","checked"),ke.setAttribute("name","t"),xe.appendChild(ke),y.checkClone=xe.cloneNode(!0).cloneNode(!0).lastChild.checked,xe.innerHTML="<textarea>x</textarea>",y.noCloneChecked=!!xe.cloneNode(!0).lastChild.defaultValue;var Se=/^key/,Ee=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,Re=/^([^.]*)(?:\.(.+)|)/;function Pe(){return!0}function Oe(){return!1}function Ae(e,t){return e===function(){try{return s.activeElement}catch(e){}}()==("focus"===t)}function De(e,t,n,r,i,o){var s,a;if("object"==typeof t){for(a in"string"!=typeof n&&(r=r||n,n=void 0),t)De(e,a,n,r,t[a],o);return e}if(null==r&&null==i?(i=n,r=n=void 0):null==i&&("string"==typeof n?(i=r,r=void 0):(i=r,r=n,n=void 0)),!1===i)i=Oe;else if(!i)return e;return 1===o&&(s=i,(i=function(e){return T().off(e),s.apply(this,arguments)}).guid=s.guid||(s.guid=T.guid++)),e.each((function(){T.event.add(this,t,i,r,n)}))}function Ne(e,t,n){n?(X.set(e,t,!1),T.event.add(e,t,{namespace:!1,handler:function(e){var r,i,o=X.get(this,t);if(1&e.isTrigger&&this[t]){if(o.length)(T.event.special[t]||{}).delegateType&&e.stopPropagation();else if(o=c.call(arguments),X.set(this,t,o),r=n(this,t),this[t](),o!==(i=X.get(this,t))||r?X.set(this,t,!1):i={},o!==i)return e.stopImmediatePropagation(),e.preventDefault(),i.value}else o.length&&(X.set(this,t,{value:T.event.trigger(T.extend(o[0],T.Event.prototype),o.slice(1),this)}),e.stopImmediatePropagation())}})):void 0===X.get(e,t)&&T.event.add(e,t,Pe)}T.event={global:{},add:function(e,t,n,r,i){var o,s,a,c,u,l,p,h,f,d,g,m=X.get(e);if(m)for(n.handler&&(n=(o=n).handler,i=o.selector),i&&T.find.matchesSelector(se,i),n.guid||(n.guid=T.guid++),(c=m.events)||(c=m.events={}),(s=m.handle)||(s=m.handle=function(t){return void 0!==T&&T.event.triggered!==t.type?T.event.dispatch.apply(e,arguments):void 0}),u=(t=(t||"").match(U)||[""]).length;u--;)f=g=(a=Re.exec(t[u])||[])[1],d=(a[2]||"").split(".").sort(),f&&(p=T.event.special[f]||{},f=(i?p.delegateType:p.bindType)||f,p=T.event.special[f]||{},l=T.extend({type:f,origType:g,data:r,handler:n,guid:n.guid,selector:i,needsContext:i&&T.expr.match.needsContext.test(i),namespace:d.join(".")},o),(h=c[f])||((h=c[f]=[]).delegateCount=0,p.setup&&!1!==p.setup.call(e,r,d,s)||e.addEventListener&&e.addEventListener(f,s)),p.add&&(p.add.call(e,l),l.handler.guid||(l.handler.guid=n.guid)),i?h.splice(h.delegateCount++,0,l):h.push(l),T.event.global[f]=!0)},remove:function(e,t,n,r,i){var o,s,a,c,u,l,p,h,f,d,g,m=X.hasData(e)&&X.get(e);if(m&&(c=m.events)){for(u=(t=(t||"").match(U)||[""]).length;u--;)if(f=g=(a=Re.exec(t[u])||[])[1],d=(a[2]||"").split(".").sort(),f){for(p=T.event.special[f]||{},h=c[f=(r?p.delegateType:p.bindType)||f]||[],a=a[2]&&new RegExp("(^|\\.)"+d.join("\\.(?:.*\\.|)")+"(\\.|$)"),s=o=h.length;o--;)l=h[o],!i&&g!==l.origType||n&&n.guid!==l.guid||a&&!a.test(l.namespace)||r&&r!==l.selector&&("**"!==r||!l.selector)||(h.splice(o,1),l.selector&&h.delegateCount--,p.remove&&p.remove.call(e,l));s&&!h.length&&(p.teardown&&!1!==p.teardown.call(e,d,m.handle)||T.removeEvent(e,f,m.handle),delete c[f])}else for(f in c)T.event.remove(e,f+t[u],n,r,!0);T.isEmptyObject(c)&&X.remove(e,"handle events")}},dispatch:function(e){var t,n,r,i,o,s,a=T.event.fix(e),c=new Array(arguments.length),u=(X.get(this,"events")||{})[a.type]||[],l=T.event.special[a.type]||{};for(c[0]=a,t=1;t<arguments.length;t++)c[t]=arguments[t];if(a.delegateTarget=this,!l.preDispatch||!1!==l.preDispatch.call(this,a)){for(s=T.event.handlers.call(this,a,u),t=0;(i=s[t++])&&!a.isPropagationStopped();)for(a.currentTarget=i.elem,n=0;(o=i.handlers[n++])&&!a.isImmediatePropagationStopped();)a.rnamespace&&!1!==o.namespace&&!a.rnamespace.test(o.namespace)||(a.handleObj=o,a.data=o.data,void 0!==(r=((T.event.special[o.origType]||{}).handle||o.handler).apply(i.elem,c))&&!1===(a.result=r)&&(a.preventDefault(),a.stopPropagation()));return l.postDispatch&&l.postDispatch.call(this,a),a.result}},handlers:function(e,t){var n,r,i,o,s,a=[],c=t.delegateCount,u=e.target;if(c&&u.nodeType&&!("click"===e.type&&e.button>=1))for(;u!==this;u=u.parentNode||this)if(1===u.nodeType&&("click"!==e.type||!0!==u.disabled)){for(o=[],s={},n=0;n<c;n++)void 0===s[i=(r=t[n]).selector+" "]&&(s[i]=r.needsContext?T(i,this).index(u)>-1:T.find(i,this,null,[u]).length),s[i]&&o.push(r);o.length&&a.push({elem:u,handlers:o})}return u=this,c<t.length&&a.push({elem:u,handlers:t.slice(c)}),a},addProp:function(e,t){Object.defineProperty(T.Event.prototype,e,{enumerable:!0,configurable:!0,get:v(t)?function(){if(this.originalEvent)return t(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[e]},set:function(t){Object.defineProperty(this,e,{enumerable:!0,configurable:!0,writable:!0,value:t})}})},fix:function(e){return e[T.expando]?e:new T.Event(e)},special:{load:{noBubble:!0},click:{setup:function(e){var t=this||e;return ge.test(t.type)&&t.click&&A(t,"input")&&Ne(t,"click",Pe),!1},trigger:function(e){var t=this||e;return ge.test(t.type)&&t.click&&A(t,"input")&&Ne(t,"click"),!0},_default:function(e){var t=e.target;return ge.test(t.type)&&t.click&&A(t,"input")&&X.get(t,"click")||A(t,"a")}},beforeunload:{postDispatch:function(e){void 0!==e.result&&e.originalEvent&&(e.originalEvent.returnValue=e.result)}}}},T.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n)},T.Event=function(e,t){if(!(this instanceof T.Event))return new T.Event(e,t);e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||void 0===e.defaultPrevented&&!1===e.returnValue?Pe:Oe,this.target=e.target&&3===e.target.nodeType?e.target.parentNode:e.target,this.currentTarget=e.currentTarget,this.relatedTarget=e.relatedTarget):this.type=e,t&&T.extend(this,t),this.timeStamp=e&&e.timeStamp||Date.now(),this[T.expando]=!0},T.Event.prototype={constructor:T.Event,isDefaultPrevented:Oe,isPropagationStopped:Oe,isImmediatePropagationStopped:Oe,isSimulated:!1,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=Pe,e&&!this.isSimulated&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=Pe,e&&!this.isSimulated&&e.stopPropagation()},stopImmediatePropagation:function(){var e=this.originalEvent;this.isImmediatePropagationStopped=Pe,e&&!this.isSimulated&&e.stopImmediatePropagation(),this.stopPropagation()}},T.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,char:!0,code:!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:function(e){var t=e.button;return null==e.which&&Se.test(e.type)?null!=e.charCode?e.charCode:e.keyCode:!e.which&&void 0!==t&&Ee.test(e.type)?1&t?1:2&t?3:4&t?2:0:e.which}},T.event.addProp),T.each({focus:"focusin",blur:"focusout"},(function(e,t){T.event.special[e]={setup:function(){return Ne(this,e,Ae),!1},trigger:function(){return Ne(this,e),!0},delegateType:t}})),T.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},(function(e,t){T.event.special[e]={delegateType:t,bindType:t,handle:function(e){var n,r=this,i=e.relatedTarget,o=e.handleObj;return i&&(i===r||T.contains(r,i))||(e.type=o.origType,n=o.handler.apply(this,arguments),e.type=t),n}}})),T.fn.extend({on:function(e,t,n,r){return De(this,e,t,n,r)},one:function(e,t,n,r){return De(this,e,t,n,r,1)},off:function(e,t,n){var r,i;if(e&&e.preventDefault&&e.handleObj)return r=e.handleObj,T(e.delegateTarget).off(r.namespace?r.origType+"."+r.namespace:r.origType,r.selector,r.handler),this;if("object"==typeof e){for(i in e)this.off(i,t,e[i]);return this}return!1!==t&&"function"!=typeof t||(n=t,t=void 0),!1===n&&(n=Oe),this.each((function(){T.event.remove(this,e,n,t)}))}});var _e=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,Ie=/<script|<style|<link/i,je=/checked\s*(?:[^=]|=\s*.checked.)/i,Le=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function Me(e,t){return A(e,"table")&&A(11!==t.nodeType?t:t.firstChild,"tr")&&T(e).children("tbody")[0]||e}function Ue(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function Be(e){return"true/"===(e.type||"").slice(0,5)?e.type=e.type.slice(5):e.removeAttribute("type"),e}function Fe(e,t){var n,r,i,o,s,a,c,u;if(1===t.nodeType){if(X.hasData(e)&&(o=X.access(e),s=X.set(t,o),u=o.events))for(i in delete s.handle,s.events={},u)for(n=0,r=u[i].length;n<r;n++)T.event.add(t,i,u[i][n]);Z.hasData(e)&&(a=Z.access(e),c=T.extend({},a),Z.set(t,c))}}function qe(e,t){var n=t.nodeName.toLowerCase();"input"===n&&ge.test(e.type)?t.checked=e.checked:"input"!==n&&"textarea"!==n||(t.defaultValue=e.defaultValue)}function Ge(e,t,n,r){t=u.apply([],t);var i,o,s,a,c,l,p=0,h=e.length,f=h-1,d=t[0],g=v(d);if(g||h>1&&"string"==typeof d&&!y.checkClone&&je.test(d))return e.each((function(i){var o=e.eq(i);g&&(t[0]=d.call(this,i,o.html())),Ge(o,t,n,r)}));if(h&&(o=(i=Ce(t,e[0].ownerDocument,!1,e,r)).firstChild,1===i.childNodes.length&&(i=o),o||r)){for(a=(s=T.map(be(i,"script"),Ue)).length;p<h;p++)c=i,p!==f&&(c=T.clone(c,!0,!0),a&&T.merge(s,be(c,"script"))),n.call(e[p],c,p);if(a)for(l=s[s.length-1].ownerDocument,T.map(s,Be),p=0;p<a;p++)c=s[p],ye.test(c.type||"")&&!X.access(c,"globalEval")&&T.contains(l,c)&&(c.src&&"module"!==(c.type||"").toLowerCase()?T._evalUrl&&!c.noModule&&T._evalUrl(c.src,{nonce:c.nonce||c.getAttribute("nonce")}):x(c.textContent.replace(Le,""),c,l))}return e}function We(e,t,n){for(var r,i=t?T.filter(t,e):e,o=0;null!=(r=i[o]);o++)n||1!==r.nodeType||T.cleanData(be(r)),r.parentNode&&(n&&ae(r)&&we(be(r,"script")),r.parentNode.removeChild(r));return e}T.extend({htmlPrefilter:function(e){return e.replace(_e,"<$1></$2>")},clone:function(e,t,n){var r,i,o,s,a=e.cloneNode(!0),c=ae(e);if(!(y.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||T.isXMLDoc(e)))for(s=be(a),r=0,i=(o=be(e)).length;r<i;r++)qe(o[r],s[r]);if(t)if(n)for(o=o||be(e),s=s||be(a),r=0,i=o.length;r<i;r++)Fe(o[r],s[r]);else Fe(e,a);return(s=be(a,"script")).length>0&&we(s,!c&&be(e,"script")),a},cleanData:function(e){for(var t,n,r,i=T.event.special,o=0;void 0!==(n=e[o]);o++)if(K(n)){if(t=n[X.expando]){if(t.events)for(r in t.events)i[r]?T.event.remove(n,r):T.removeEvent(n,r,t.handle);n[X.expando]=void 0}n[Z.expando]&&(n[Z.expando]=void 0)}}}),T.fn.extend({detach:function(e){return We(this,e,!0)},remove:function(e){return We(this,e)},text:function(e){return V(this,(function(e){return void 0===e?T.text(this):this.empty().each((function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=e)}))}),null,e,arguments.length)},append:function(){return Ge(this,arguments,(function(e){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||Me(this,e).appendChild(e)}))},prepend:function(){return Ge(this,arguments,(function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=Me(this,e);t.insertBefore(e,t.firstChild)}}))},before:function(){return Ge(this,arguments,(function(e){this.parentNode&&this.parentNode.insertBefore(e,this)}))},after:function(){return Ge(this,arguments,(function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)}))},empty:function(){for(var e,t=0;null!=(e=this[t]);t++)1===e.nodeType&&(T.cleanData(be(e,!1)),e.textContent="");return this},clone:function(e,t){return e=null!=e&&e,t=null==t?e:t,this.map((function(){return T.clone(this,e,t)}))},html:function(e){return V(this,(function(e){var t=this[0]||{},n=0,r=this.length;if(void 0===e&&1===t.nodeType)return t.innerHTML;if("string"==typeof e&&!Ie.test(e)&&!ve[(me.exec(e)||["",""])[1].toLowerCase()]){e=T.htmlPrefilter(e);try{for(;n<r;n++)1===(t=this[n]||{}).nodeType&&(T.cleanData(be(t,!1)),t.innerHTML=e);t=0}catch(e){}}t&&this.empty().append(e)}),null,e,arguments.length)},replaceWith:function(){var e=[];return Ge(this,arguments,(function(t){var n=this.parentNode;T.inArray(this,e)<0&&(T.cleanData(be(this)),n&&n.replaceChild(t,this))}),e)}}),T.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},(function(e,t){T.fn[e]=function(e){for(var n,r=[],i=T(e),o=i.length-1,s=0;s<=o;s++)n=s===o?this:this.clone(!0),T(i[s])[t](n),l.apply(r,n.get());return this.pushStack(r)}}));var He=new RegExp("^("+re+")(?!px)[a-z%]+$","i"),Ve=function(e){var t=e.ownerDocument.defaultView;return t&&t.opener||(t=n),t.getComputedStyle(e)},ze=new RegExp(oe.join("|"),"i");function $e(e,t,n){var r,i,o,s,a=e.style;return(n=n||Ve(e))&&(""!==(s=n.getPropertyValue(t)||n[t])||ae(e)||(s=T.style(e,t)),!y.pixelBoxStyles()&&He.test(s)&&ze.test(t)&&(r=a.width,i=a.minWidth,o=a.maxWidth,a.minWidth=a.maxWidth=a.width=s,s=n.width,a.width=r,a.minWidth=i,a.maxWidth=o)),void 0!==s?s+"":s}function Je(e,t){return{get:function(){if(!e())return(this.get=t).apply(this,arguments);delete this.get}}}!function(){function e(){if(l){u.style.cssText="position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0",l.style.cssText="position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%",se.appendChild(u).appendChild(l);var e=n.getComputedStyle(l);r="1%"!==e.top,c=12===t(e.marginLeft),l.style.right="60%",a=36===t(e.right),i=36===t(e.width),l.style.position="absolute",o=12===t(l.offsetWidth/3),se.removeChild(u),l=null}}function t(e){return Math.round(parseFloat(e))}var r,i,o,a,c,u=s.createElement("div"),l=s.createElement("div");l.style&&(l.style.backgroundClip="content-box",l.cloneNode(!0).style.backgroundClip="",y.clearCloneStyle="content-box"===l.style.backgroundClip,T.extend(y,{boxSizingReliable:function(){return e(),i},pixelBoxStyles:function(){return e(),a},pixelPosition:function(){return e(),r},reliableMarginLeft:function(){return e(),c},scrollboxSize:function(){return e(),o}}))}();var Ye=["Webkit","Moz","ms"],Ke=s.createElement("div").style,Qe={};function Xe(e){var t=T.cssProps[e]||Qe[e];return t||(e in Ke?e:Qe[e]=function(e){for(var t=e[0].toUpperCase()+e.slice(1),n=Ye.length;n--;)if((e=Ye[n]+t)in Ke)return e}(e)||e)}var Ze=/^(none|table(?!-c[ea]).+)/,et=/^--/,tt={position:"absolute",visibility:"hidden",display:"block"},nt={letterSpacing:"0",fontWeight:"400"};function rt(e,t,n){var r=ie.exec(t);return r?Math.max(0,r[2]-(n||0))+(r[3]||"px"):t}function it(e,t,n,r,i,o){var s="width"===t?1:0,a=0,c=0;if(n===(r?"border":"content"))return 0;for(;s<4;s+=2)"margin"===n&&(c+=T.css(e,n+oe[s],!0,i)),r?("content"===n&&(c-=T.css(e,"padding"+oe[s],!0,i)),"margin"!==n&&(c-=T.css(e,"border"+oe[s]+"Width",!0,i))):(c+=T.css(e,"padding"+oe[s],!0,i),"padding"!==n?c+=T.css(e,"border"+oe[s]+"Width",!0,i):a+=T.css(e,"border"+oe[s]+"Width",!0,i));return!r&&o>=0&&(c+=Math.max(0,Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-o-c-a-.5))||0),c}function ot(e,t,n){var r=Ve(e),i=(!y.boxSizingReliable()||n)&&"border-box"===T.css(e,"boxSizing",!1,r),o=i,s=$e(e,t,r),a="offset"+t[0].toUpperCase()+t.slice(1);if(He.test(s)){if(!n)return s;s="auto"}return(!y.boxSizingReliable()&&i||"auto"===s||!parseFloat(s)&&"inline"===T.css(e,"display",!1,r))&&e.getClientRects().length&&(i="border-box"===T.css(e,"boxSizing",!1,r),(o=a in e)&&(s=e[a])),(s=parseFloat(s)||0)+it(e,t,n||(i?"border":"content"),o,r,s)+"px"}function st(e,t,n,r,i){return new st.prototype.init(e,t,n,r,i)}T.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=$e(e,"opacity");return""===n?"1":n}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,gridArea:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnStart:!0,gridRow:!0,gridRowEnd:!0,gridRowStart:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{},style:function(e,t,n,r){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var i,o,s,a=Y(t),c=et.test(t),u=e.style;if(c||(t=Xe(a)),s=T.cssHooks[t]||T.cssHooks[a],void 0===n)return s&&"get"in s&&void 0!==(i=s.get(e,!1,r))?i:u[t];"string"===(o=typeof n)&&(i=ie.exec(n))&&i[1]&&(n=pe(e,t,i),o="number"),null!=n&&n==n&&("number"!==o||c||(n+=i&&i[3]||(T.cssNumber[a]?"":"px")),y.clearCloneStyle||""!==n||0!==t.indexOf("background")||(u[t]="inherit"),s&&"set"in s&&void 0===(n=s.set(e,n,r))||(c?u.setProperty(t,n):u[t]=n))}},css:function(e,t,n,r){var i,o,s,a=Y(t);return et.test(t)||(t=Xe(a)),(s=T.cssHooks[t]||T.cssHooks[a])&&"get"in s&&(i=s.get(e,!0,n)),void 0===i&&(i=$e(e,t,r)),"normal"===i&&t in nt&&(i=nt[t]),""===n||n?(o=parseFloat(i),!0===n||isFinite(o)?o||0:i):i}}),T.each(["height","width"],(function(e,t){T.cssHooks[t]={get:function(e,n,r){if(n)return!Ze.test(T.css(e,"display"))||e.getClientRects().length&&e.getBoundingClientRect().width?ot(e,t,r):le(e,tt,(function(){return ot(e,t,r)}))},set:function(e,n,r){var i,o=Ve(e),s=!y.scrollboxSize()&&"absolute"===o.position,a=(s||r)&&"border-box"===T.css(e,"boxSizing",!1,o),c=r?it(e,t,r,a,o):0;return a&&s&&(c-=Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-parseFloat(o[t])-it(e,t,"border",!1,o)-.5)),c&&(i=ie.exec(n))&&"px"!==(i[3]||"px")&&(e.style[t]=n,n=T.css(e,t)),rt(0,n,c)}}})),T.cssHooks.marginLeft=Je(y.reliableMarginLeft,(function(e,t){if(t)return(parseFloat($e(e,"marginLeft"))||e.getBoundingClientRect().left-le(e,{marginLeft:0},(function(){return e.getBoundingClientRect().left})))+"px"})),T.each({margin:"",padding:"",border:"Width"},(function(e,t){T.cssHooks[e+t]={expand:function(n){for(var r=0,i={},o="string"==typeof n?n.split(" "):[n];r<4;r++)i[e+oe[r]+t]=o[r]||o[r-2]||o[0];return i}},"margin"!==e&&(T.cssHooks[e+t].set=rt)})),T.fn.extend({css:function(e,t){return V(this,(function(e,t,n){var r,i,o={},s=0;if(Array.isArray(t)){for(r=Ve(e),i=t.length;s<i;s++)o[t[s]]=T.css(e,t[s],!1,r);return o}return void 0!==n?T.style(e,t,n):T.css(e,t)}),e,t,arguments.length>1)}}),T.Tween=st,st.prototype={constructor:st,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||T.easing._default,this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(T.cssNumber[n]?"":"px")},cur:function(){var e=st.propHooks[this.prop];return e&&e.get?e.get(this):st.propHooks._default.get(this)},run:function(e){var t,n=st.propHooks[this.prop];return this.options.duration?this.pos=t=T.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):st.propHooks._default.set(this),this}},st.prototype.init.prototype=st.prototype,st.propHooks={_default:{get:function(e){var t;return 1!==e.elem.nodeType||null!=e.elem[e.prop]&&null==e.elem.style[e.prop]?e.elem[e.prop]:(t=T.css(e.elem,e.prop,""))&&"auto"!==t?t:0},set:function(e){T.fx.step[e.prop]?T.fx.step[e.prop](e):1!==e.elem.nodeType||!T.cssHooks[e.prop]&&null==e.elem.style[Xe(e.prop)]?e.elem[e.prop]=e.now:T.style(e.elem,e.prop,e.now+e.unit)}}},st.propHooks.scrollTop=st.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},T.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2},_default:"swing"},T.fx=st.prototype.init,T.fx.step={};var at,ct,ut=/^(?:toggle|show|hide)$/,lt=/queueHooks$/;function pt(){ct&&(!1===s.hidden&&n.requestAnimationFrame?n.requestAnimationFrame(pt):n.setTimeout(pt,T.fx.interval),T.fx.tick())}function ht(){return n.setTimeout((function(){at=void 0})),at=Date.now()}function ft(e,t){var n,r=0,i={height:e};for(t=t?1:0;r<4;r+=2-t)i["margin"+(n=oe[r])]=i["padding"+n]=e;return t&&(i.opacity=i.width=e),i}function dt(e,t,n){for(var r,i=(gt.tweeners[t]||[]).concat(gt.tweeners["*"]),o=0,s=i.length;o<s;o++)if(r=i[o].call(n,t,e))return r}function gt(e,t,n){var r,i,o=0,s=gt.prefilters.length,a=T.Deferred().always((function(){delete c.elem})),c=function(){if(i)return!1;for(var t=at||ht(),n=Math.max(0,u.startTime+u.duration-t),r=1-(n/u.duration||0),o=0,s=u.tweens.length;o<s;o++)u.tweens[o].run(r);return a.notifyWith(e,[u,r,n]),r<1&&s?n:(s||a.notifyWith(e,[u,1,0]),a.resolveWith(e,[u]),!1)},u=a.promise({elem:e,props:T.extend({},t),opts:T.extend(!0,{specialEasing:{},easing:T.easing._default},n),originalProperties:t,originalOptions:n,startTime:at||ht(),duration:n.duration,tweens:[],createTween:function(t,n){var r=T.Tween(e,u.opts,t,n,u.opts.specialEasing[t]||u.opts.easing);return u.tweens.push(r),r},stop:function(t){var n=0,r=t?u.tweens.length:0;if(i)return this;for(i=!0;n<r;n++)u.tweens[n].run(1);return t?(a.notifyWith(e,[u,1,0]),a.resolveWith(e,[u,t])):a.rejectWith(e,[u,t]),this}}),l=u.props;for(!function(e,t){var n,r,i,o,s;for(n in e)if(i=t[r=Y(n)],o=e[n],Array.isArray(o)&&(i=o[1],o=e[n]=o[0]),n!==r&&(e[r]=o,delete e[n]),(s=T.cssHooks[r])&&"expand"in s)for(n in o=s.expand(o),delete e[r],o)n in e||(e[n]=o[n],t[n]=i);else t[r]=i}(l,u.opts.specialEasing);o<s;o++)if(r=gt.prefilters[o].call(u,e,l,u.opts))return v(r.stop)&&(T._queueHooks(u.elem,u.opts.queue).stop=r.stop.bind(r)),r;return T.map(l,dt,u),v(u.opts.start)&&u.opts.start.call(e,u),u.progress(u.opts.progress).done(u.opts.done,u.opts.complete).fail(u.opts.fail).always(u.opts.always),T.fx.timer(T.extend(c,{elem:e,anim:u,queue:u.opts.queue})),u}T.Animation=T.extend(gt,{tweeners:{"*":[function(e,t){var n=this.createTween(e,t);return pe(n.elem,e,ie.exec(t),n),n}]},tweener:function(e,t){v(e)?(t=e,e=["*"]):e=e.match(U);for(var n,r=0,i=e.length;r<i;r++)n=e[r],gt.tweeners[n]=gt.tweeners[n]||[],gt.tweeners[n].unshift(t)},prefilters:[function(e,t,n){var r,i,o,s,a,c,u,l,p="width"in t||"height"in t,h=this,f={},d=e.style,g=e.nodeType&&ue(e),m=X.get(e,"fxshow");for(r in n.queue||(null==(s=T._queueHooks(e,"fx")).unqueued&&(s.unqueued=0,a=s.empty.fire,s.empty.fire=function(){s.unqueued||a()}),s.unqueued++,h.always((function(){h.always((function(){s.unqueued--,T.queue(e,"fx").length||s.empty.fire()}))}))),t)if(i=t[r],ut.test(i)){if(delete t[r],o=o||"toggle"===i,i===(g?"hide":"show")){if("show"!==i||!m||void 0===m[r])continue;g=!0}f[r]=m&&m[r]||T.style(e,r)}if((c=!T.isEmptyObject(t))||!T.isEmptyObject(f))for(r in p&&1===e.nodeType&&(n.overflow=[d.overflow,d.overflowX,d.overflowY],null==(u=m&&m.display)&&(u=X.get(e,"display")),"none"===(l=T.css(e,"display"))&&(u?l=u:(de([e],!0),u=e.style.display||u,l=T.css(e,"display"),de([e]))),("inline"===l||"inline-block"===l&&null!=u)&&"none"===T.css(e,"float")&&(c||(h.done((function(){d.display=u})),null==u&&(l=d.display,u="none"===l?"":l)),d.display="inline-block")),n.overflow&&(d.overflow="hidden",h.always((function(){d.overflow=n.overflow[0],d.overflowX=n.overflow[1],d.overflowY=n.overflow[2]}))),c=!1,f)c||(m?"hidden"in m&&(g=m.hidden):m=X.access(e,"fxshow",{display:u}),o&&(m.hidden=!g),g&&de([e],!0),h.done((function(){for(r in g||de([e]),X.remove(e,"fxshow"),f)T.style(e,r,f[r])}))),c=dt(g?m[r]:0,r,h),r in m||(m[r]=c.start,g&&(c.end=c.start,c.start=0))}],prefilter:function(e,t){t?gt.prefilters.unshift(e):gt.prefilters.push(e)}}),T.speed=function(e,t,n){var r=e&&"object"==typeof e?T.extend({},e):{complete:n||!n&&t||v(e)&&e,duration:e,easing:n&&t||t&&!v(t)&&t};return T.fx.off?r.duration=0:"number"!=typeof r.duration&&(r.duration in T.fx.speeds?r.duration=T.fx.speeds[r.duration]:r.duration=T.fx.speeds._default),null!=r.queue&&!0!==r.queue||(r.queue="fx"),r.old=r.complete,r.complete=function(){v(r.old)&&r.old.call(this),r.queue&&T.dequeue(this,r.queue)},r},T.fn.extend({fadeTo:function(e,t,n,r){return this.filter(ue).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(e,t,n,r){var i=T.isEmptyObject(e),o=T.speed(t,n,r),s=function(){var t=gt(this,T.extend({},e),o);(i||X.get(this,"finish"))&&t.stop(!0)};return s.finish=s,i||!1===o.queue?this.each(s):this.queue(o.queue,s)},stop:function(e,t,n){var r=function(e){var t=e.stop;delete e.stop,t(n)};return"string"!=typeof e&&(n=t,t=e,e=void 0),t&&!1!==e&&this.queue(e||"fx",[]),this.each((function(){var t=!0,i=null!=e&&e+"queueHooks",o=T.timers,s=X.get(this);if(i)s[i]&&s[i].stop&&r(s[i]);else for(i in s)s[i]&&s[i].stop&&lt.test(i)&&r(s[i]);for(i=o.length;i--;)o[i].elem!==this||null!=e&&o[i].queue!==e||(o[i].anim.stop(n),t=!1,o.splice(i,1));!t&&n||T.dequeue(this,e)}))},finish:function(e){return!1!==e&&(e=e||"fx"),this.each((function(){var t,n=X.get(this),r=n[e+"queue"],i=n[e+"queueHooks"],o=T.timers,s=r?r.length:0;for(n.finish=!0,T.queue(this,e,[]),i&&i.stop&&i.stop.call(this,!0),t=o.length;t--;)o[t].elem===this&&o[t].queue===e&&(o[t].anim.stop(!0),o.splice(t,1));for(t=0;t<s;t++)r[t]&&r[t].finish&&r[t].finish.call(this);delete n.finish}))}}),T.each(["toggle","show","hide"],(function(e,t){var n=T.fn[t];T.fn[t]=function(e,r,i){return null==e||"boolean"==typeof e?n.apply(this,arguments):this.animate(ft(t,!0),e,r,i)}})),T.each({slideDown:ft("show"),slideUp:ft("hide"),slideToggle:ft("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},(function(e,t){T.fn[e]=function(e,n,r){return this.animate(t,e,n,r)}})),T.timers=[],T.fx.tick=function(){var e,t=0,n=T.timers;for(at=Date.now();t<n.length;t++)(e=n[t])()||n[t]!==e||n.splice(t--,1);n.length||T.fx.stop(),at=void 0},T.fx.timer=function(e){T.timers.push(e),T.fx.start()},T.fx.interval=13,T.fx.start=function(){ct||(ct=!0,pt())},T.fx.stop=function(){ct=null},T.fx.speeds={slow:600,fast:200,_default:400},T.fn.delay=function(e,t){return e=T.fx&&T.fx.speeds[e]||e,t=t||"fx",this.queue(t,(function(t,r){var i=n.setTimeout(t,e);r.stop=function(){n.clearTimeout(i)}}))},function(){var e=s.createElement("input"),t=s.createElement("select").appendChild(s.createElement("option"));e.type="checkbox",y.checkOn=""!==e.value,y.optSelected=t.selected,(e=s.createElement("input")).value="t",e.type="radio",y.radioValue="t"===e.value}();var mt,yt=T.expr.attrHandle;T.fn.extend({attr:function(e,t){return V(this,T.attr,e,t,arguments.length>1)},removeAttr:function(e){return this.each((function(){T.removeAttr(this,e)}))}}),T.extend({attr:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return void 0===e.getAttribute?T.prop(e,t,n):(1===o&&T.isXMLDoc(e)||(i=T.attrHooks[t.toLowerCase()]||(T.expr.match.bool.test(t)?mt:void 0)),void 0!==n?null===n?void T.removeAttr(e,t):i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:(e.setAttribute(t,n+""),n):i&&"get"in i&&null!==(r=i.get(e,t))?r:null==(r=T.find.attr(e,t))?void 0:r)},attrHooks:{type:{set:function(e,t){if(!y.radioValue&&"radio"===t&&A(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},removeAttr:function(e,t){var n,r=0,i=t&&t.match(U);if(i&&1===e.nodeType)for(;n=i[r++];)e.removeAttribute(n)}}),mt={set:function(e,t,n){return!1===t?T.removeAttr(e,n):e.setAttribute(n,n),n}},T.each(T.expr.match.bool.source.match(/\w+/g),(function(e,t){var n=yt[t]||T.find.attr;yt[t]=function(e,t,r){var i,o,s=t.toLowerCase();return r||(o=yt[s],yt[s]=i,i=null!=n(e,t,r)?s:null,yt[s]=o),i}}));var vt=/^(?:input|select|textarea|button)$/i,bt=/^(?:a|area)$/i;function wt(e){return(e.match(U)||[]).join(" ")}function xt(e){return e.getAttribute&&e.getAttribute("class")||""}function kt(e){return Array.isArray(e)?e:"string"==typeof e&&e.match(U)||[]}T.fn.extend({prop:function(e,t){return V(this,T.prop,e,t,arguments.length>1)},removeProp:function(e){return this.each((function(){delete this[T.propFix[e]||e]}))}}),T.extend({prop:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return 1===o&&T.isXMLDoc(e)||(t=T.propFix[t]||t,i=T.propHooks[t]),void 0!==n?i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:e[t]=n:i&&"get"in i&&null!==(r=i.get(e,t))?r:e[t]},propHooks:{tabIndex:{get:function(e){var t=T.find.attr(e,"tabindex");return t?parseInt(t,10):vt.test(e.nodeName)||bt.test(e.nodeName)&&e.href?0:-1}}},propFix:{for:"htmlFor",class:"className"}}),y.optSelected||(T.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null},set:function(e){var t=e.parentNode;t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex)}}),T.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],(function(){T.propFix[this.toLowerCase()]=this})),T.fn.extend({addClass:function(e){var t,n,r,i,o,s,a,c=0;if(v(e))return this.each((function(t){T(this).addClass(e.call(this,t,xt(this)))}));if((t=kt(e)).length)for(;n=this[c++];)if(i=xt(n),r=1===n.nodeType&&" "+wt(i)+" "){for(s=0;o=t[s++];)r.indexOf(" "+o+" ")<0&&(r+=o+" ");i!==(a=wt(r))&&n.setAttribute("class",a)}return this},removeClass:function(e){var t,n,r,i,o,s,a,c=0;if(v(e))return this.each((function(t){T(this).removeClass(e.call(this,t,xt(this)))}));if(!arguments.length)return this.attr("class","");if((t=kt(e)).length)for(;n=this[c++];)if(i=xt(n),r=1===n.nodeType&&" "+wt(i)+" "){for(s=0;o=t[s++];)for(;r.indexOf(" "+o+" ")>-1;)r=r.replace(" "+o+" "," ");i!==(a=wt(r))&&n.setAttribute("class",a)}return this},toggleClass:function(e,t){var n=typeof e,r="string"===n||Array.isArray(e);return"boolean"==typeof t&&r?t?this.addClass(e):this.removeClass(e):v(e)?this.each((function(n){T(this).toggleClass(e.call(this,n,xt(this),t),t)})):this.each((function(){var t,i,o,s;if(r)for(i=0,o=T(this),s=kt(e);t=s[i++];)o.hasClass(t)?o.removeClass(t):o.addClass(t);else void 0!==e&&"boolean"!==n||((t=xt(this))&&X.set(this,"__className__",t),this.setAttribute&&this.setAttribute("class",t||!1===e?"":X.get(this,"__className__")||""))}))},hasClass:function(e){var t,n,r=0;for(t=" "+e+" ";n=this[r++];)if(1===n.nodeType&&(" "+wt(xt(n))+" ").indexOf(t)>-1)return!0;return!1}});var Tt=/\r/g;T.fn.extend({val:function(e){var t,n,r,i=this[0];return arguments.length?(r=v(e),this.each((function(n){var i;1===this.nodeType&&(null==(i=r?e.call(this,n,T(this).val()):e)?i="":"number"==typeof i?i+="":Array.isArray(i)&&(i=T.map(i,(function(e){return null==e?"":e+""}))),(t=T.valHooks[this.type]||T.valHooks[this.nodeName.toLowerCase()])&&"set"in t&&void 0!==t.set(this,i,"value")||(this.value=i))}))):i?(t=T.valHooks[i.type]||T.valHooks[i.nodeName.toLowerCase()])&&"get"in t&&void 0!==(n=t.get(i,"value"))?n:"string"==typeof(n=i.value)?n.replace(Tt,""):null==n?"":n:void 0}}),T.extend({valHooks:{option:{get:function(e){var t=T.find.attr(e,"value");return null!=t?t:wt(T.text(e))}},select:{get:function(e){var t,n,r,i=e.options,o=e.selectedIndex,s="select-one"===e.type,a=s?null:[],c=s?o+1:i.length;for(r=o<0?c:s?o:0;r<c;r++)if(((n=i[r]).selected||r===o)&&!n.disabled&&(!n.parentNode.disabled||!A(n.parentNode,"optgroup"))){if(t=T(n).val(),s)return t;a.push(t)}return a},set:function(e,t){for(var n,r,i=e.options,o=T.makeArray(t),s=i.length;s--;)((r=i[s]).selected=T.inArray(T.valHooks.option.get(r),o)>-1)&&(n=!0);return n||(e.selectedIndex=-1),o}}}}),T.each(["radio","checkbox"],(function(){T.valHooks[this]={set:function(e,t){if(Array.isArray(t))return e.checked=T.inArray(T(e).val(),t)>-1}},y.checkOn||(T.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})})),y.focusin="onfocusin"in n;var Ct=/^(?:focusinfocus|focusoutblur)$/,St=function(e){e.stopPropagation()};T.extend(T.event,{trigger:function(e,t,r,i){var o,a,c,u,l,p,h,f,g=[r||s],m=d.call(e,"type")?e.type:e,y=d.call(e,"namespace")?e.namespace.split("."):[];if(a=f=c=r=r||s,3!==r.nodeType&&8!==r.nodeType&&!Ct.test(m+T.event.triggered)&&(m.indexOf(".")>-1&&(y=m.split("."),m=y.shift(),y.sort()),l=m.indexOf(":")<0&&"on"+m,(e=e[T.expando]?e:new T.Event(m,"object"==typeof e&&e)).isTrigger=i?2:3,e.namespace=y.join("."),e.rnamespace=e.namespace?new RegExp("(^|\\.)"+y.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,e.result=void 0,e.target||(e.target=r),t=null==t?[e]:T.makeArray(t,[e]),h=T.event.special[m]||{},i||!h.trigger||!1!==h.trigger.apply(r,t))){if(!i&&!h.noBubble&&!b(r)){for(u=h.delegateType||m,Ct.test(u+m)||(a=a.parentNode);a;a=a.parentNode)g.push(a),c=a;c===(r.ownerDocument||s)&&g.push(c.defaultView||c.parentWindow||n)}for(o=0;(a=g[o++])&&!e.isPropagationStopped();)f=a,e.type=o>1?u:h.bindType||m,(p=(X.get(a,"events")||{})[e.type]&&X.get(a,"handle"))&&p.apply(a,t),(p=l&&a[l])&&p.apply&&K(a)&&(e.result=p.apply(a,t),!1===e.result&&e.preventDefault());return e.type=m,i||e.isDefaultPrevented()||h._default&&!1!==h._default.apply(g.pop(),t)||!K(r)||l&&v(r[m])&&!b(r)&&((c=r[l])&&(r[l]=null),T.event.triggered=m,e.isPropagationStopped()&&f.addEventListener(m,St),r[m](),e.isPropagationStopped()&&f.removeEventListener(m,St),T.event.triggered=void 0,c&&(r[l]=c)),e.result}},simulate:function(e,t,n){var r=T.extend(new T.Event,n,{type:e,isSimulated:!0});T.event.trigger(r,null,t)}}),T.fn.extend({trigger:function(e,t){return this.each((function(){T.event.trigger(e,t,this)}))},triggerHandler:function(e,t){var n=this[0];if(n)return T.event.trigger(e,t,n,!0)}}),y.focusin||T.each({focus:"focusin",blur:"focusout"},(function(e,t){var n=function(e){T.event.simulate(t,e.target,T.event.fix(e))};T.event.special[t]={setup:function(){var r=this.ownerDocument||this,i=X.access(r,t);i||r.addEventListener(e,n,!0),X.access(r,t,(i||0)+1)},teardown:function(){var r=this.ownerDocument||this,i=X.access(r,t)-1;i?X.access(r,t,i):(r.removeEventListener(e,n,!0),X.remove(r,t))}}}));var Et=n.location,Rt=Date.now(),Pt=/\?/;T.parseXML=function(e){var t;if(!e||"string"!=typeof e)return null;try{t=(new n.DOMParser).parseFromString(e,"text/xml")}catch(e){t=void 0}return t&&!t.getElementsByTagName("parsererror").length||T.error("Invalid XML: "+e),t};var Ot=/\[\]$/,At=/\r?\n/g,Dt=/^(?:submit|button|image|reset|file)$/i,Nt=/^(?:input|select|textarea|keygen)/i;function _t(e,t,n,r){var i;if(Array.isArray(t))T.each(t,(function(t,i){n||Ot.test(e)?r(e,i):_t(e+"["+("object"==typeof i&&null!=i?t:"")+"]",i,n,r)}));else if(n||"object"!==k(t))r(e,t);else for(i in t)_t(e+"["+i+"]",t[i],n,r)}T.param=function(e,t){var n,r=[],i=function(e,t){var n=v(t)?t():t;r[r.length]=encodeURIComponent(e)+"="+encodeURIComponent(null==n?"":n)};if(null==e)return"";if(Array.isArray(e)||e.jquery&&!T.isPlainObject(e))T.each(e,(function(){i(this.name,this.value)}));else for(n in e)_t(n,e[n],t,i);return r.join("&")},T.fn.extend({serialize:function(){return T.param(this.serializeArray())},serializeArray:function(){return this.map((function(){var e=T.prop(this,"elements");return e?T.makeArray(e):this})).filter((function(){var e=this.type;return this.name&&!T(this).is(":disabled")&&Nt.test(this.nodeName)&&!Dt.test(e)&&(this.checked||!ge.test(e))})).map((function(e,t){var n=T(this).val();return null==n?null:Array.isArray(n)?T.map(n,(function(e){return{name:t.name,value:e.replace(At,"\r\n")}})):{name:t.name,value:n.replace(At,"\r\n")}})).get()}});var It=/%20/g,jt=/#.*$/,Lt=/([?&])_=[^&]*/,Mt=/^(.*?):[ \t]*([^\r\n]*)$/gm,Ut=/^(?:GET|HEAD)$/,Bt=/^\/\//,Ft={},qt={},Gt="*/".concat("*"),Wt=s.createElement("a");function Ht(e){return function(t,n){"string"!=typeof t&&(n=t,t="*");var r,i=0,o=t.toLowerCase().match(U)||[];if(v(n))for(;r=o[i++];)"+"===r[0]?(r=r.slice(1)||"*",(e[r]=e[r]||[]).unshift(n)):(e[r]=e[r]||[]).push(n)}}function Vt(e,t,n,r){var i={},o=e===qt;function s(a){var c;return i[a]=!0,T.each(e[a]||[],(function(e,a){var u=a(t,n,r);return"string"!=typeof u||o||i[u]?o?!(c=u):void 0:(t.dataTypes.unshift(u),s(u),!1)})),c}return s(t.dataTypes[0])||!i["*"]&&s("*")}function zt(e,t){var n,r,i=T.ajaxSettings.flatOptions||{};for(n in t)void 0!==t[n]&&((i[n]?e:r||(r={}))[n]=t[n]);return r&&T.extend(!0,e,r),e}Wt.href=Et.href,T.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Et.href,type:"GET",isLocal:/^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(Et.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":Gt,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":T.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?zt(zt(e,T.ajaxSettings),t):zt(T.ajaxSettings,e)},ajaxPrefilter:Ht(Ft),ajaxTransport:Ht(qt),ajax:function(e,t){"object"==typeof e&&(t=e,e=void 0),t=t||{};var r,i,o,a,c,u,l,p,h,f,d=T.ajaxSetup({},t),g=d.context||d,m=d.context&&(g.nodeType||g.jquery)?T(g):T.event,y=T.Deferred(),v=T.Callbacks("once memory"),b=d.statusCode||{},w={},x={},k="canceled",C={readyState:0,getResponseHeader:function(e){var t;if(l){if(!a)for(a={};t=Mt.exec(o);)a[t[1].toLowerCase()+" "]=(a[t[1].toLowerCase()+" "]||[]).concat(t[2]);t=a[e.toLowerCase()+" "]}return null==t?null:t.join(", ")},getAllResponseHeaders:function(){return l?o:null},setRequestHeader:function(e,t){return null==l&&(e=x[e.toLowerCase()]=x[e.toLowerCase()]||e,w[e]=t),this},overrideMimeType:function(e){return null==l&&(d.mimeType=e),this},statusCode:function(e){var t;if(e)if(l)C.always(e[C.status]);else for(t in e)b[t]=[b[t],e[t]];return this},abort:function(e){var t=e||k;return r&&r.abort(t),S(0,t),this}};if(y.promise(C),d.url=((e||d.url||Et.href)+"").replace(Bt,Et.protocol+"//"),d.type=t.method||t.type||d.method||d.type,d.dataTypes=(d.dataType||"*").toLowerCase().match(U)||[""],null==d.crossDomain){u=s.createElement("a");try{u.href=d.url,u.href=u.href,d.crossDomain=Wt.protocol+"//"+Wt.host!=u.protocol+"//"+u.host}catch(e){d.crossDomain=!0}}if(d.data&&d.processData&&"string"!=typeof d.data&&(d.data=T.param(d.data,d.traditional)),Vt(Ft,d,t,C),l)return C;for(h in(p=T.event&&d.global)&&0==T.active++&&T.event.trigger("ajaxStart"),d.type=d.type.toUpperCase(),d.hasContent=!Ut.test(d.type),i=d.url.replace(jt,""),d.hasContent?d.data&&d.processData&&0===(d.contentType||"").indexOf("application/x-www-form-urlencoded")&&(d.data=d.data.replace(It,"+")):(f=d.url.slice(i.length),d.data&&(d.processData||"string"==typeof d.data)&&(i+=(Pt.test(i)?"&":"?")+d.data,delete d.data),!1===d.cache&&(i=i.replace(Lt,"$1"),f=(Pt.test(i)?"&":"?")+"_="+Rt+++f),d.url=i+f),d.ifModified&&(T.lastModified[i]&&C.setRequestHeader("If-Modified-Since",T.lastModified[i]),T.etag[i]&&C.setRequestHeader("If-None-Match",T.etag[i])),(d.data&&d.hasContent&&!1!==d.contentType||t.contentType)&&C.setRequestHeader("Content-Type",d.contentType),C.setRequestHeader("Accept",d.dataTypes[0]&&d.accepts[d.dataTypes[0]]?d.accepts[d.dataTypes[0]]+("*"!==d.dataTypes[0]?", "+Gt+"; q=0.01":""):d.accepts["*"]),d.headers)C.setRequestHeader(h,d.headers[h]);if(d.beforeSend&&(!1===d.beforeSend.call(g,C,d)||l))return C.abort();if(k="abort",v.add(d.complete),C.done(d.success),C.fail(d.error),r=Vt(qt,d,t,C)){if(C.readyState=1,p&&m.trigger("ajaxSend",[C,d]),l)return C;d.async&&d.timeout>0&&(c=n.setTimeout((function(){C.abort("timeout")}),d.timeout));try{l=!1,r.send(w,S)}catch(e){if(l)throw e;S(-1,e)}}else S(-1,"No Transport");function S(e,t,s,a){var u,h,f,w,x,k=t;l||(l=!0,c&&n.clearTimeout(c),r=void 0,o=a||"",C.readyState=e>0?4:0,u=e>=200&&e<300||304===e,s&&(w=function(e,t,n){for(var r,i,o,s,a=e.contents,c=e.dataTypes;"*"===c[0];)c.shift(),void 0===r&&(r=e.mimeType||t.getResponseHeader("Content-Type"));if(r)for(i in a)if(a[i]&&a[i].test(r)){c.unshift(i);break}if(c[0]in n)o=c[0];else{for(i in n){if(!c[0]||e.converters[i+" "+c[0]]){o=i;break}s||(s=i)}o=o||s}if(o)return o!==c[0]&&c.unshift(o),n[o]}(d,C,s)),w=function(e,t,n,r){var i,o,s,a,c,u={},l=e.dataTypes.slice();if(l[1])for(s in e.converters)u[s.toLowerCase()]=e.converters[s];for(o=l.shift();o;)if(e.responseFields[o]&&(n[e.responseFields[o]]=t),!c&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),c=o,o=l.shift())if("*"===o)o=c;else if("*"!==c&&c!==o){if(!(s=u[c+" "+o]||u["* "+o]))for(i in u)if((a=i.split(" "))[1]===o&&(s=u[c+" "+a[0]]||u["* "+a[0]])){!0===s?s=u[i]:!0!==u[i]&&(o=a[0],l.unshift(a[1]));break}if(!0!==s)if(s&&e.throws)t=s(t);else try{t=s(t)}catch(e){return{state:"parsererror",error:s?e:"No conversion from "+c+" to "+o}}}return{state:"success",data:t}}(d,w,C,u),u?(d.ifModified&&((x=C.getResponseHeader("Last-Modified"))&&(T.lastModified[i]=x),(x=C.getResponseHeader("etag"))&&(T.etag[i]=x)),204===e||"HEAD"===d.type?k="nocontent":304===e?k="notmodified":(k=w.state,h=w.data,u=!(f=w.error))):(f=k,!e&&k||(k="error",e<0&&(e=0))),C.status=e,C.statusText=(t||k)+"",u?y.resolveWith(g,[h,k,C]):y.rejectWith(g,[C,k,f]),C.statusCode(b),b=void 0,p&&m.trigger(u?"ajaxSuccess":"ajaxError",[C,d,u?h:f]),v.fireWith(g,[C,k]),p&&(m.trigger("ajaxComplete",[C,d]),--T.active||T.event.trigger("ajaxStop")))}return C},getJSON:function(e,t,n){return T.get(e,t,n,"json")},getScript:function(e,t){return T.get(e,void 0,t,"script")}}),T.each(["get","post"],(function(e,t){T[t]=function(e,n,r,i){return v(n)&&(i=i||r,r=n,n=void 0),T.ajax(T.extend({url:e,type:t,dataType:i,data:n,success:r},T.isPlainObject(e)&&e))}})),T._evalUrl=function(e,t){return T.ajax({url:e,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,converters:{"text script":function(){}},dataFilter:function(e){T.globalEval(e,t)}})},T.fn.extend({wrapAll:function(e){var t;return this[0]&&(v(e)&&(e=e.call(this[0])),t=T(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map((function(){for(var e=this;e.firstElementChild;)e=e.firstElementChild;return e})).append(this)),this},wrapInner:function(e){return v(e)?this.each((function(t){T(this).wrapInner(e.call(this,t))})):this.each((function(){var t=T(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)}))},wrap:function(e){var t=v(e);return this.each((function(n){T(this).wrapAll(t?e.call(this,n):e)}))},unwrap:function(e){return this.parent(e).not("body").each((function(){T(this).replaceWith(this.childNodes)})),this}}),T.expr.pseudos.hidden=function(e){return!T.expr.pseudos.visible(e)},T.expr.pseudos.visible=function(e){return!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)},T.ajaxSettings.xhr=function(){try{return new n.XMLHttpRequest}catch(e){}};var $t={0:200,1223:204},Jt=T.ajaxSettings.xhr();y.cors=!!Jt&&"withCredentials"in Jt,y.ajax=Jt=!!Jt,T.ajaxTransport((function(e){var t,r;if(y.cors||Jt&&!e.crossDomain)return{send:function(i,o){var s,a=e.xhr();if(a.open(e.type,e.url,e.async,e.username,e.password),e.xhrFields)for(s in e.xhrFields)a[s]=e.xhrFields[s];for(s in e.mimeType&&a.overrideMimeType&&a.overrideMimeType(e.mimeType),e.crossDomain||i["X-Requested-With"]||(i["X-Requested-With"]="XMLHttpRequest"),i)a.setRequestHeader(s,i[s]);t=function(e){return function(){t&&(t=r=a.onload=a.onerror=a.onabort=a.ontimeout=a.onreadystatechange=null,"abort"===e?a.abort():"error"===e?"number"!=typeof a.status?o(0,"error"):o(a.status,a.statusText):o($t[a.status]||a.status,a.statusText,"text"!==(a.responseType||"text")||"string"!=typeof a.responseText?{binary:a.response}:{text:a.responseText},a.getAllResponseHeaders()))}},a.onload=t(),r=a.onerror=a.ontimeout=t("error"),void 0!==a.onabort?a.onabort=r:a.onreadystatechange=function(){4===a.readyState&&n.setTimeout((function(){t&&r()}))},t=t("abort");try{a.send(e.hasContent&&e.data||null)}catch(e){if(t)throw e}},abort:function(){t&&t()}}})),T.ajaxPrefilter((function(e){e.crossDomain&&(e.contents.script=!1)})),T.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(e){return T.globalEval(e),e}}}),T.ajaxPrefilter("script",(function(e){void 0===e.cache&&(e.cache=!1),e.crossDomain&&(e.type="GET")})),T.ajaxTransport("script",(function(e){var t,n;if(e.crossDomain||e.scriptAttrs)return{send:function(r,i){t=T("<script>").attr(e.scriptAttrs||{}).prop({charset:e.scriptCharset,src:e.url}).on("load error",n=function(e){t.remove(),n=null,e&&i("error"===e.type?404:200,e.type)}),s.head.appendChild(t[0])},abort:function(){n&&n()}}}));var Yt,Kt=[],Qt=/(=)\?(?=&|$)|\?\?/;T.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=Kt.pop()||T.expando+"_"+Rt++;return this[e]=!0,e}}),T.ajaxPrefilter("json jsonp",(function(e,t,r){var i,o,s,a=!1!==e.jsonp&&(Qt.test(e.url)?"url":"string"==typeof e.data&&0===(e.contentType||"").indexOf("application/x-www-form-urlencoded")&&Qt.test(e.data)&&"data");if(a||"jsonp"===e.dataTypes[0])return i=e.jsonpCallback=v(e.jsonpCallback)?e.jsonpCallback():e.jsonpCallback,a?e[a]=e[a].replace(Qt,"$1"+i):!1!==e.jsonp&&(e.url+=(Pt.test(e.url)?"&":"?")+e.jsonp+"="+i),e.converters["script json"]=function(){return s||T.error(i+" was not called"),s[0]},e.dataTypes[0]="json",o=n[i],n[i]=function(){s=arguments},r.always((function(){void 0===o?T(n).removeProp(i):n[i]=o,e[i]&&(e.jsonpCallback=t.jsonpCallback,Kt.push(i)),s&&v(o)&&o(s[0]),s=o=void 0})),"script"})),y.createHTMLDocument=((Yt=s.implementation.createHTMLDocument("").body).innerHTML="<form></form><form></form>",2===Yt.childNodes.length),T.parseHTML=function(e,t,n){return"string"!=typeof e?[]:("boolean"==typeof t&&(n=t,t=!1),t||(y.createHTMLDocument?((r=(t=s.implementation.createHTMLDocument("")).createElement("base")).href=s.location.href,t.head.appendChild(r)):t=s),o=!n&&[],(i=D.exec(e))?[t.createElement(i[1])]:(i=Ce([e],t,o),o&&o.length&&T(o).remove(),T.merge([],i.childNodes)));var r,i,o},T.fn.load=function(e,t,n){var r,i,o,s=this,a=e.indexOf(" ");return a>-1&&(r=wt(e.slice(a)),e=e.slice(0,a)),v(t)?(n=t,t=void 0):t&&"object"==typeof t&&(i="POST"),s.length>0&&T.ajax({url:e,type:i||"GET",dataType:"html",data:t}).done((function(e){o=arguments,s.html(r?T("<div>").append(T.parseHTML(e)).find(r):e)})).always(n&&function(e,t){s.each((function(){n.apply(this,o||[e.responseText,t,e])}))}),this},T.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],(function(e,t){T.fn[t]=function(e){return this.on(t,e)}})),T.expr.pseudos.animated=function(e){return T.grep(T.timers,(function(t){return e===t.elem})).length},T.offset={setOffset:function(e,t,n){var r,i,o,s,a,c,u=T.css(e,"position"),l=T(e),p={};"static"===u&&(e.style.position="relative"),a=l.offset(),o=T.css(e,"top"),c=T.css(e,"left"),("absolute"===u||"fixed"===u)&&(o+c).indexOf("auto")>-1?(s=(r=l.position()).top,i=r.left):(s=parseFloat(o)||0,i=parseFloat(c)||0),v(t)&&(t=t.call(e,n,T.extend({},a))),null!=t.top&&(p.top=t.top-a.top+s),null!=t.left&&(p.left=t.left-a.left+i),"using"in t?t.using.call(e,p):l.css(p)}},T.fn.extend({offset:function(e){if(arguments.length)return void 0===e?this:this.each((function(t){T.offset.setOffset(this,e,t)}));var t,n,r=this[0];return r?r.getClientRects().length?(t=r.getBoundingClientRect(),n=r.ownerDocument.defaultView,{top:t.top+n.pageYOffset,left:t.left+n.pageXOffset}):{top:0,left:0}:void 0},position:function(){if(this[0]){var e,t,n,r=this[0],i={top:0,left:0};if("fixed"===T.css(r,"position"))t=r.getBoundingClientRect();else{for(t=this.offset(),n=r.ownerDocument,e=r.offsetParent||n.documentElement;e&&(e===n.body||e===n.documentElement)&&"static"===T.css(e,"position");)e=e.parentNode;e&&e!==r&&1===e.nodeType&&((i=T(e).offset()).top+=T.css(e,"borderTopWidth",!0),i.left+=T.css(e,"borderLeftWidth",!0))}return{top:t.top-i.top-T.css(r,"marginTop",!0),left:t.left-i.left-T.css(r,"marginLeft",!0)}}},offsetParent:function(){return this.map((function(){for(var e=this.offsetParent;e&&"static"===T.css(e,"position");)e=e.offsetParent;return e||se}))}}),T.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},(function(e,t){var n="pageYOffset"===t;T.fn[e]=function(r){return V(this,(function(e,r,i){var o;if(b(e)?o=e:9===e.nodeType&&(o=e.defaultView),void 0===i)return o?o[t]:e[r];o?o.scrollTo(n?o.pageXOffset:i,n?i:o.pageYOffset):e[r]=i}),e,r,arguments.length)}})),T.each(["top","left"],(function(e,t){T.cssHooks[t]=Je(y.pixelPosition,(function(e,n){if(n)return n=$e(e,t),He.test(n)?T(e).position()[t]+"px":n}))})),T.each({Height:"height",Width:"width"},(function(e,t){T.each({padding:"inner"+e,content:t,"":"outer"+e},(function(n,r){T.fn[r]=function(i,o){var s=arguments.length&&(n||"boolean"!=typeof i),a=n||(!0===i||!0===o?"margin":"border");return V(this,(function(t,n,i){var o;return b(t)?0===r.indexOf("outer")?t["inner"+e]:t.document.documentElement["client"+e]:9===t.nodeType?(o=t.documentElement,Math.max(t.body["scroll"+e],o["scroll"+e],t.body["offset"+e],o["offset"+e],o["client"+e])):void 0===i?T.css(t,n,a):T.style(t,n,i,a)}),t,s?i:void 0,s)}}))})),T.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),(function(e,t){T.fn[t]=function(e,n){return arguments.length>0?this.on(t,null,e,n):this.trigger(t)}})),T.fn.extend({hover:function(e,t){return this.mouseenter(e).mouseleave(t||e)}}),T.fn.extend({bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)}}),T.proxy=function(e,t){var n,r,i;if("string"==typeof t&&(n=e[t],t=e,e=n),v(e))return r=c.call(arguments,2),(i=function(){return e.apply(t||this,r.concat(c.call(arguments)))}).guid=e.guid=e.guid||T.guid++,i},T.holdReady=function(e){e?T.readyWait++:T.ready(!0)},T.isArray=Array.isArray,T.parseJSON=JSON.parse,T.nodeName=A,T.isFunction=v,T.isWindow=b,T.camelCase=Y,T.type=k,T.now=Date.now,T.isNumeric=function(e){var t=T.type(e);return("number"===t||"string"===t)&&!isNaN(e-parseFloat(e))},void 0===(r=function(){return T}.apply(t,[]))||(e.exports=r);var Xt=n.jQuery,Zt=n.$;return T.noConflict=function(e){return n.$===T&&(n.$=Zt),e&&n.jQuery===T&&(n.jQuery=Xt),T},i||(n.jQuery=n.$=T),T}))},function(e){e.exports=JSON.parse('{"name":"@nodefony/stage","version":"0.2.4","description":"Nodefony Framework Client Side Nodefony web developpement","browser":"dist/stage.min.js","main":"src/core.js","private":false,"scripts":{"webpack":"webpack","stage":"stage","install-demo":"npm install --prefix ./demo/nodefony ;npm run build --prefix ./demo/nodefony","demo":"npm start --prefix ./demo/nodefony","start":"node ./bin/stage","build":"WEBPACK_ENV=prod webpack; WEBPACK_ENV=dev webpack --verbose","build-dev":"WEBPACK_ENV=dev webpack --verbose","build-prod":"WEBPACK_ENV=prod webpack --verbose","test":"mocha  --require @babel/register --recursive src/tests"},"bin":{"stage":"./bin/stage"},"keywords":["javascript","webpack","nodefony","webrtc","sip","opensip","kamailio","webaudio"],"repository":{"type":"git","url":"git@github.com:nodefony/nodefony-stage.git"},"bugs":{"url":"https://github.com/nodefony/nodefony-stage/issues"},"license":"CECILL-B","licenses":[{"type":"CECILL-B","url":"http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.html"}],"dependencies":{"ascii-table":"^0.0.9","asciify":"^1.3.5","jquery":"^3.3.1","shortid":"^2.2.15","twig":"^1.14.0","webrtc-adapter":"^7.4.0"},"devDependencies":{"@babel/cli":"^7.8.3","@babel/core":"^7.8.3","@babel/preset-env":"^7.8.3","@babel/register":"^7.8.3","babel-loader":"^8.0.6","chai":"^4.1.2","css-loader":"^3.4.2","exports-loader":"^0.7.0","expose-loader":"^0.7.5","file-loader":"^5.0.2","imports-loader":"^0.8.0","jshint":"^2.11.0","jshint-loader":"^0.8.4","json-loader":"^0.5.7","mocha":"^7.0.0","node-sass":"^4.13.0","nodefony":"^5.1.1","open":"^7.0.0","optimize-css-assets-webpack-plugin":"^5.0.1","raw-loader":"^4.0.0","sass-loader":"^8.0.2","should":"^13.2.3","sinon":"^8.0.4","sinon-chai":"^3.4.0","terser-webpack-plugin":"^2.3.2","to-string-loader":"^1.1.6","tokenizer":"^1.1.2","url-loader":"^3.0.0","webpack":"^4.41.5","webpack-cli":"^3.3.10","webpack-dev-server":"^3.10.1","webpack-merge":"^4.2.2"},"author":"cci <christophe.camensuli@gmail.com>","readmeFilename":"README.md","contributors":[{}]}')},function(e,t){function n(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.exports=function(e){"use strict";var t=/^on(.*)$/,r=function(){function e(t,n){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.events={},this.garbageEvent={},t&&this.settingsToListen(t,n)}var r,i,o;return r=e,(i=[{key:"listen",value:function(e,t,n){var r=arguments[1],i=this;return this.events[t]||(this.events[t]=[],this.garbageEvent[t]=[]),"function"==typeof n&&(this.garbageEvent[t].push(n),this.events[t].push((function(t){n.apply(e,t)}))),function(){return Array.prototype.unshift.call(arguments,r),i.fire.apply(i,arguments)}}},{key:"on",value:function(e,t){var n=arguments[1],r=this;return this.events[e]||(this.events[e]=[],this.garbageEvent[e]=[]),"function"==typeof t&&(this.garbageEvent[e].push(t),this.events[e].push((function(e){t(e)}))),function(){return Array.prototype.unshift.call(arguments,n),r.fire.apply(r,arguments)}}},{key:"clearNotifications",value:function(e){if(e){if(this.events[e]){for(;this.events[e].length>0;)this.events[e].pop(),this.garbageEvent[e].pop();delete this.events[e],delete this.garbageEvent[e]}}else delete this.events,delete this.garbageEvent,this.events={},this.garbageEvent={}}},{key:"fire",value:function(e){var t=!0;if(this.events[e])for(var n=Array.prototype.slice.call(arguments,1),r=0;r<this.events[e].length;r++)try{if(t=this.events[e][r](n))break}catch(e){throw console.log(e),new Error(e)}return t}},{key:"settingsToListen",value:function(e,n){for(var r in e){var i=t.exec(r);i&&this.listen(n||this,i[0],e[r])}}},{key:"unListen",value:function(e,t){if(!this.events[e])return this.clearNotifications();if(!t)return this.clearNotifications(e);for(var n=0;n<this.garbageEvent[e].length;n++)this.garbageEvent[e][n]===t&&(this.events[e].splice(n,1),this.garbageEvent[e].splice(n,1))}}])&&n(r.prototype,i),o&&n(r,o),e}();return e.notificationsCenter={notification:r,create:function(e,t){return new r(e,t)}},r}},function(e,t){function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function i(e,t){return(i=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function o(e,t,n){return(o="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var r=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=s(e)););return e}(e,t);if(r){var i=Object.getOwnPropertyDescriptor(r,t);return i.get?i.get.call(n):i.value}})(e,t,n||e)}function s(e){return(s=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function c(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function u(e,t,n){return t&&c(e.prototype,t),n&&c(e,n),e}e.exports=function(e){"use strict";var t={moduleName:"SYSLOG",maxStack:100,rateLimit:!1,burstLimit:3,defaultSeverity:"DEBUG",checkConditions:"&&",async:!1},c=["EMERGENCY","ALERT","CRITIC","ERROR","WARNING","NOTICE","INFO","DEBUG"];c.EMERGENCY=0,c.ALERT=1,c.CRITIC=2,c.ERROR=3,c.WARNING=4,c.NOTICE=5,c.INFO=6,c.DEBUG=7;var l=0,p=function(){function t(n,r,i,o,s,u){a(this,t),this.timeStamp=new Date(u).getTime()||(new Date).getTime(),this.uid=++l,this.severity=w(r),this.severityName=c[this.severity],this.typePayload=e.typeOf(n),this.payload=n,this.moduleName=i,this.msgid=o||"",this.msg=s||""}return u(t,[{key:"getDate",value:function(){return new Date(this.timeStamp).toTimeString()}},{key:"toString",value:function(){return"TimeStamp:"+this.getDate()+"  Log:"+this.payload+"  ModuleName:"+this.moduleName+"  SeverityName:"+this.severityName+"  MessageID:"+this.msgid+"  UID:"+this.uid+"  Message:"+this.msg}},{key:"parseJson",value:function(e){var t=null;try{for(var n in t=JSON.parse(e))n in this&&(this[n]=t[n])}catch(e){throw e}return t}}]),t}(),h={"<":function(e,t){return e<t},">":function(e,t){return e>t},"<=":function(e,t){return e<=t},">=":function(e,t){return e>=t},"==":function(e,t){return e===t},"!=":function(e,t){return e!==t},RegExp:function(e,t){return t.test(e)}},f={severity:function(e,t){if("=="!==t.operator)return h[t.operator](e.severity,t.data);for(var n in t.data)if(n===e.severityName)return!0;return!1},msgid:function(e,t){if("=="!==t.operator)return h[t.operator](e.msgid,t.data);for(var n in t.data)if(n===e.msgid)return!0;return!1},date:function(e,t){return h[t.operator](e.timeStamp,t.data)}},d={"&&":function(e,t){var n=null;for(var r in e)if(!(n=f[r](t,e[r])))break;return n},"||":function(e,t){var n=null;for(var r in e)if(n=f[r](t,e[r]))break;return n}},g=function(t){var n=!1;switch(e.typeOf(t)){case"string":n=t.split(/,| /);break;case"number":n=t;break;default:throw new Error("checkFormatSeverity bad format "+e.typeOf(t)+" : "+t)}return n},m=function(t){var n=!1;switch(e.typeOf(t)){case"date":n=t.getTime();break;case"string":n=new Date(t);break;default:throw new Error("checkFormatDate bad format "+e.typeOf(t)+" : "+t)}return n},y=function(t){var n=!1;switch(e.typeOf(t)){case"string":n=t.split(/,| /);break;case"number":n=t;break;case"object":t instanceof RegExp&&(n=t);break;default:throw new Error("checkFormatMsgId bad format "+e.typeOf(t)+" : "+t)}return n},v=function(e){var t=parseInt(e,10),n=null;return(n=isNaN(t)?e:c[t])in c&&n},b=function(t){var n=!0;if("object"!==e.typeOf(t))return!1;for(var r in t){if(!(r in f))return!1;var i=t[r];if(i.operator&&!(i.operator in h))throw new Error("Contitions bad operator : "+i.operator);if(!i.data)return!1;switch(r){case"severity":if(i.operator){if(!1===(n=g(i.data)))return!1;i.data=c[v(n[0])]}else{if(i.operator="==",!1===(n=g(i.data)))return!1;if(i.data={},"array"!==e.typeOf(n))return!1;for(var o=0;o<n.length;o++){var s=v(n[o]);if(!s)return!1;i.data[s]=c[s]}}break;case"msgid":if(i.operator||(i.operator="=="),!1===(n=y(i.data)))return!1;if("array"===e.typeOf(n)){i.data={};for(var a=0;a<n.length;a++)i.data[n[a]]="||"}else i.data=n;break;case"date":if(!(n=m(i.data)))return!1;i.data=n;break;default:return!1}}return t},w=function(e){if(!(e in c)){if(e)throw new Error("not stage syslog severity :"+e);return null}return"number"==typeof e?c[c[e]]:c[e]},x=function(e,t,n,r,i){var o=null;return o=t||c[this.settings.defaultSeverity],new p(e,o,n,r,i)},k=function(c){function l(i){var c,u,p;return a(this,l),u=this,(c=!(p=s(l).call(this,i))||"object"!==n(p)&&"function"!=typeof p?r(u):p).settings=e.extend({},t,i),c.ringStack=[],c.burstPrinted=0,c.missed=0,c.invalid=0,c.valid=0,c.start=0,c.fire=c.settings.async?o(s(l.prototype),"fireAsync",r(c)):o(s(l.prototype),"fire",r(c)),c}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&i(e,t)}(l,c),u(l,[{key:"pushStack",value:function(e){this.ringStack.length===this.settings.maxStack&&this.ringStack.shift();var t=this.ringStack.push(e);return this.valid++,t}},{key:"logger",value:function(e,t,n,r){var i=null;if(this.settings.rateLimit){var o=(new Date).getTime();if(this.start=this.start||o,o>this.start+this.settings.rateLimit&&(this.burstPrinted=0,this.missed=0,this.start=0),this.settings.burstLimit&&this.settings.burstLimit>this.burstPrinted){try{i=e instanceof p?e:x.call(this,e,t,this.settings.moduleName,n,r)}catch(e){return console.error(e),this.invalid++,"INVALID"}return this.pushStack(i),this.fire("onLog",i),this.burstPrinted++,"ACCEPTED"}return this.missed++,"DROPPED"}try{i=e instanceof p?e:x.call(this,e,t,this.settings.moduleName,n,r)}catch(e){return console.error(e),this.invalid++,"INVALID"}return this.pushStack(i),this.fire("onLog",i),"ACCEPTED"}},{key:"clearLogStack",value:function(){this.ringStack.length=0}},{key:"getLogStack",value:function(e,t,n){var r=null;return r=n?this.getLogs(n):this.ringStack,0===arguments.length?r[r.length-1]:t?e===t?r[r.length-e-1]:r.slice(e,t):r.slice(e)}},{key:"getLogs",value:function(e,t){var n=t||this.ringStack,r=null;e.checkConditions&&e.checkConditions in d?(r=d[e.checkConditions],delete e.checkConditions):r=d[this.settings.checkConditions];var i=[],o=null;try{o=b(e)}catch(e){throw new Error("registreNotification conditions format error: "+e)}if(o)for(var s=0;s<n.length;s++){r(o,n[s])&&i.push(n[s])}return i}},{key:"logToJson",value:function(e){var t=null;return t=e?this.getLogs(e):this.ringStack,JSON.stringify(t)}},{key:"loadStack",value:function(t,n,r){if(!t)throw new Error("syslog loadStack : not stack in arguments ");var i=null;switch(e.typeOf(t)){case"string":try{return i=JSON.parse(t),this.loadStack(i,n)}catch(e){throw e}break;case"array":case"object":try{for(var o=0;o<t.length;o++){var s=new p(t[o].payload,t[o].severity,t[o].moduleName||this.settings.moduleName,t[o].msgid,t[o].msg,t[o].timeStamp);this.pushStack(s),n&&(r&&"function"==typeof r&&r.call(this,s,t[o]),this.fire("onLog",s))}}catch(e){throw e}break;default:throw new Error("syslog loadStack : bad stack in arguments type")}return i||t}},{key:"listenWithConditions",value:function(e,t,n){var r=null;t.checkConditions&&t.checkConditions in d?(r=d[t.checkConditions],delete t.checkConditions):r=d[this.settings.checkConditions];var i=null;try{i=b(t)}catch(e){throw new Error("registreNotification conditions format error: "+e)}if(i){var a=function(t){var o=r(i,t);o&&n.apply(e||this,arguments)};return o(s(l.prototype),"listen",this).call(this,this,"onLog",a),a}}}]),l}(e.notificationsCenter.notification);return e.syslog=k,e.PDU=p,k}},function(e,t){function n(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.exports=function(e){"use strict";var t={moduleName:"SERVICE ",defaultSeverity:"INFO"},r={},i=function(){function i(n,o,s,a){if(function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,i),n&&(this.name=n),a=e.extend({},r,a),o instanceof e.Container)this.container=o;else{if(o)throw new Error("Service stage container not valid must be instance of stage.Container");this.container=new e.Container,this.container.set("container",this.container)}if(this.kernel=this.container.get("kernel"),this.syslog=this.container.get("syslog"),this.syslog?this.settingsSyslog=this.syslog.settings:(this.settingsSyslog=e.extend({},t,{moduleName:this.name},a.syslog||{}),this.syslog=new e.syslog(this.settingsSyslog),this.set("syslog",this.syslog)),s instanceof e.notificationsCenter.notification)this.notificationsCenter=s;else{if(s)throw new Error("Service stage notificationsCenter not valid must be instance of stage.notificationsCenter.notification");this.notificationsCenter=this.container.get("notificationsCenter"),this.notificationsCenter||(this.notificationsCenter=e.notificationsCenter.create(a,this),this.kernel?this.kernel.container!==this.container&&this.set("notificationsCenter",this.notificationsCenter):this.set("notificationsCenter",this.notificationsCenter))}}var o,s,a;return o=i,a=[{key:"logSeverity",value:function(e){switch(e){case"DEBUG":return console.debug;case"INFO":return console.info;case"WARNING":return console.warn;case"ERROR":case"CRITIC":case"ALERT":case"EMERGENCY":return console.error;default:return console.log}}}],(s=[{key:"initSyslog",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,n={severity:{operator:"<=",data:"7"}};return this.syslog.listenWithConditions(this,t||n,(function(t){var n=t.payload,r=new Date(t.timeStamp);e.Service.logSeverity(t.severityName)("".concat(r.toDateString()," ").concat(r.toLocaleTimeString()," ").concat(t.severityName," ").concat(t.msgid," : ").concat(n))}))}},{key:"getName",value:function(){return this.name}},{key:"clean",value:function(){this.settingsSyslog=null,delete this.settingsSyslog,this.syslog=null,delete this.syslog,this.removeAllListeners(),this.notificationsCenter=null,delete this.notificationsCenter,this.container=null,delete this.container,this.kernel=null,delete this.kernel}},{key:"logger",value:function(e,t,n,r){try{return n||(n="SERVICE "+this.name+" "),this.syslog.logger(e,t,n,r)}catch(t){console.log(e)}}},{key:"log",value:function(){return this.logger.apply(this,arguments)}},{key:"fire",value:function(){return this.notificationsCenter.fire.apply(this.notificationsCenter,arguments)}},{key:"listen",value:function(){return this.notificationsCenter.listen.apply(this.notificationsCenter,arguments)}},{key:"removeListener",value:function(){return this.notificationsCenter.unListen.apply(this.notificationsCenter,arguments)}},{key:"unListen",value:function(){return this.notificationsCenter.unListen.apply(this.notificationsCenter,arguments)}},{key:"removeAllListeners",value:function(){return this.notificationsCenter.clearNotifications.apply(this.notificationsCenter,arguments)}},{key:"get",value:function(e){return this.container?this.container.get(e):null}},{key:"set",value:function(e,t){return this.container?this.container.set(e,t):null}},{key:"getParameters",value:function(){return this.container.getParameters.apply(this.container,arguments)}},{key:"setParameters",value:function(){return this.container.setParameters.apply(this.container,arguments)}},{key:"has",value:function(){return this.container.has.apply(this.container,arguments)}}])&&n(o.prototype,s),a&&n(o,a),i}();return e.Service=i,i}},function(e,t,n){function r(e,t){return!t||"object"!==c(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function i(e,t,n){return(i="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var r=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=o(e)););return e}(e,t);if(r){var i=Object.getOwnPropertyDescriptor(r,t);return i.get?i.get.call(n):i.value}})(e,t,n||e)}function o(e){return(o=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&a(e,t)}function a(e,t){return(a=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function c(e){return(c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function u(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function l(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function p(e,t,n){return t&&l(e.prototype,t),n&&l(e,n),e}var h=n(5);e.exports=function(e){"use strict";var t=function(e){return null!=e},n=function(){return h.generate()},a=function n(r,i){var o=null;switch(e.typeOf(r)){case"string":return n.call(this,r.split("."),i);case"array":switch(r.length){case 1:if(this[o=Array.prototype.shift.call(r)]){if(!t(i))return this[o];this[o]=i}else this[o]=i;return i;default:return!this[o=Array.prototype.shift.call(r)]&&t(i)&&(this[o]={}),n.call(this[o],r,i)}break;default:return!1}},l=function(){function e(t,n){if(u(this,e),this.protoService=function(){},this.protoParameters=function(){},this.scope={},this.services=new this.protoService,t&&"object"===c(t))for(var r in t)this.set(r,t[r]);if(this.parameters=new this.protoParameters,n&&"object"===c(n))for(var i in n)this.set(i,n[i])}return p(e,[{key:"logger",value:function(e,t,n,r){return n||(n="CONTAINER SERVICES "),this.get("syslog").logger(e,t,n,r)}},{key:"set",value:function(e,t){return this.protoService.prototype[e]=t}},{key:"get",value:function(e){return e in this.services?this.services[e]:null}},{key:"has",value:function(e){return this.services[e]}},{key:"addScope",value:function(e){return this.scope[e]?this.scope[e]:this.scope[e]={}}},{key:"enterScope",value:function(e){var t=new f(e,this);return this.scope[e][t.id]=t,t}},{key:"enterScopeExtended",value:function(e){var t=new d(e,this);return this.scope[e][t.id]=t,t}},{key:"leaveScope",value:function(e){if(this.scope[e.name]){var t=this.scope[e.name][e.id];t&&(t.clean(),delete this.scope[e.name][e.id],t=null)}}},{key:"removeScope",value:function(e){if(this.scope[e]){for(var t in this.scope[e])this.leaveScope(this.scope[e][t]);delete this.scope[e]}}},{key:"setParameters",value:function(e,n){return"string"!=typeof e?(this.logger(new Error("setParameters : container parameter name must be a string")),!1):t(n)?a.call(this.protoParameters.prototype,e,n)===n?n:(this.logger(new Error("container parameter "+e+" parse error")),!1):(this.logger(new Error("setParameters : "+e+" container parameter value must be define")),!1)}},{key:"getParameters",value:function(e){return"string"!=typeof e?(this.logger(new Error("container parameter name must be a string")),!1):a.call(this.parameters,e,null)}}]),e}(),f=function(e){function t(e,i){var s;return u(this,t),(s=r(this,o(t).call(this))).name=e,s.parent=i,s.services=new i.protoService,s.parameters=new i.protoParameters,s.scope=i.scope,s.id=n(),s}return s(t,e),p(t,[{key:"set",value:function(e,n){return this.services[e]=n,i(o(t.prototype),"set",this).call(this,e,n)}},{key:"clean",value:function(){this.services=null,delete this.services,this.parameters=null,delete this.parameters}},{key:"setParameters",value:function(e,n){return a.call(this.parameters,e,n)===n?i(o(t.prototype),"setParameters",this).call(this,e,n):(this.logger(new Error("container parameter "+e+" parse error")),!1)}}]),t}(l),d=function(t){function c(t,i){var s;return u(this,c),(s=r(this,o(c).call(this))).name=t,s.parent=i,s.services=new i.protoService,s.parameters=new i.protoParameters,s.scope=i.scope,s.id=n(),s.protoService=function(){},s.protoService.prototype=e.extend({},s.parent.protoService.prototype),s.protoParameters=function(){},s.protoParameters.prototype=e.extend({},s.parent.protoParameters.prototype),s}return s(c,t),p(c,[{key:"clean",value:function(){this.services=null,delete this.services,this.parameters=null,delete this.parameters,this.protoService=null,this.protoParameters=null}},{key:"set",value:function(e,t){return this.services[e]=t,i(o(c.prototype),"set",this).call(this,e,t)}},{key:"setParameters",value:function(e,t){return a.call(this.parameters,e,t)===t?i(o(c.prototype),"setParameters",this).call(this,e,t):(this.logger(new Error("container parameter "+e+" parse error")),!1)}}]),c}(l);return e.Container=l,l}},function(e,t,n){"use strict";var r=n(2),i=n(18),o=n(22),s=n(23)||0;function a(){return i(s)}e.exports=a,e.exports.generate=a,e.exports.seed=function(t){return r.seed(t),e.exports},e.exports.worker=function(t){return s=t,e.exports},e.exports.characters=function(e){return void 0!==e&&r.characters(e),r.shuffled()},e.exports.isValid=o},function(e,t,n){"use strict";var r=1;e.exports={nextValue:function(){return(r=(9301*r+49297)%233280)/233280},seed:function(e){r=e}}},function(e,t,n){"use strict";var r,i,o=n(19);n(2);e.exports=function(e){var t="",n=Math.floor(.001*(Date.now()-1567752802062));return n===i?r++:(r=0,i=n),t+=o(7),t+=o(e),r>0&&(t+=o(r)),t+=o(n)}},function(e,t,n){"use strict";var r=n(2),i=n(20),o=n(21);e.exports=function(e){for(var t,n=0,s="";!t;)s+=o(i,r.get(),1),t=e<Math.pow(16,n+1),n++;return s}},function(e,t,n){"use strict";var r,i="object"==typeof window&&(window.crypto||window.msCrypto);r=i&&i.getRandomValues?function(e){return i.getRandomValues(new Uint8Array(e))}:function(e){for(var t=[],n=0;n<e;n++)t.push(Math.floor(256*Math.random()));return t},e.exports=r},function(e,t){e.exports=function(e,t,n){var r=(2<<Math.log(t.length-1)/Math.LN2)-1,i=Math.ceil(1.6*r*n/t.length);n=+n;for(var o="";;)for(var s=e(i),a=0;a<i;a++){var c=s[a]&r;if(t[c]&&(o+=t[c]).length===n)return o}}},function(e,t,n){"use strict";var r=n(2);e.exports=function(e){return!(!e||"string"!=typeof e||e.length<6)&&!new RegExp("[^"+r.get().replace(/[|\\{}()[\]^$+*?.-]/g,"\\$&")+"]").test(e)}},function(e,t,n){"use strict";e.exports=0},function(e,t){e.exports=function(e){var t=document.implementation.createDocument?function(e){try{var t=(new DOMParser).parseFromString(e,"application/xml")}catch(e){throw Error("xml function stringToDocumentXML : "+e)}return t}:function(e){var t=createDocument();return t.async="false",t.loadXML(e),t},n=function(t){var n=e.typeOf(t);if("document"===n)return t.documentElement||t.childNodes[0];if("element"===n){var r=t.ownerDocument;return r.documentElement||r.childNodes[0]}},r=null,i=function(e){if(!e)return null;r={};var t=o(e);if(r[e.nodeName]&&(t=[t]),11!=e.nodeType){var n={};n[e.nodeName]=t,t=n}return t},o=function e(t){if(!t)return null;switch(t.nodeType){case 7:return null;case 3:case 4:return t.nodeValue.match(/[^\x00-\x20]/)?t.nodeValue:null}var n=null,r={};if(t.attributes&&t.attributes.length){n={};for(var i=0;i<t.attributes.length;i++){if("string"==typeof(c=t.attributes[i].nodeName))(u=t.attributes[i].value||t.attributes[i].nodeValue)&&(void 0===r[c="@"+c]&&(r[c]=0),r[c]++,s(n,c,r[c],u))}}if(t.childNodes&&t.childNodes.length){var o=!0;n&&(o=!1);for(i=0;i<t.childNodes.length&&o;i++){var a=t.childNodes[i].nodeType;3!=a&&4!=a&&(o=!1)}if(o){n||(n="");for(i=0;i<t.childNodes.length;i++)n+=t.childNodes[i].nodeValue}else{n||(n={});for(i=0;i<t.childNodes.length;i++){var c,u;if("string"==typeof(c=t.childNodes[i].nodeName))(u=e(t.childNodes[i]))&&(void 0===r[c]&&(r[c]=0),r[c]++,s(n,c,r[c],u))}}}return n},s=function(e,t,n,i){t=a(t),r&&r[t]?(1==n&&(e[t]=[]),e[t][e[t].length]=i):1==n?e[t]=i:2==n?e[t]=[e[t],i]:e[t][e[t].length]=i},a=function(e){return e?e.replace(":",":"):e};return e.xml={parseXml:function(r){switch(e.typeOf(r)){case"string":var o=n(t(r));break;case"document":o=n(r);break;case"element":o=r;break;default:throw new Error("parseXml  bad type arguments")}return i(o)},stringToDocumentXML:t}}},function(e,t){function n(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.exports=function(e){"use strict";var t=e.browser.Ie?function(e){var t=0;for(var n in this.data){if(this.data.hasOwnProperty(n)){var r=this.data[n],i=[n,r];i.key=n,i.value=r,e(i,t)}t++}}:function(e){var t=0;for(var n in this.data){var r=this.data[n],i=[n,r];i.key=n,i.value=r,e(i,t),t++}},r=function(){function r(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,r),this.data="object"===e.typeOf(t)?e.extend(!0,{},t):{}}var i,o,s;return i=r,(o=[{key:"get",value:function(e){return null==e?this.data:e in this.data&&this.data[e]}},{key:"set",value:function(e,t){return(null!==e||void 0!==e)&&(this.data[e]=t)}},{key:"unset",value:function(e){return e in this.data&&(delete this.data[e],!0)}},{key:"hasKey",value:function(e){return e in this.data}},{key:"clear",value:function(){return this.data={},!0}},{key:"clone",value:function(){return e.extend(!0,{},this.data)}},{key:"inspect",value:function(){}},{key:"keys",value:function(){}},{key:"values",value:function(){}},{key:"each",value:function(){return t.apply(this,arguments)}},{key:"clone",value:function(){return new r(this.data)}},{key:"toObject",value:function(t){return e.extend(!0,{},this.data)}},{key:"merge",value:function(t){this.data=e.extend(!0,{},this.data,t)}},{key:"toJson",value:function(t){return t?e.json.stringify(this.get(t)):e.json.stringify(this.data)}},{key:"toQueryString",value:function(){}}])&&n(i.prototype,o),s&&n(i,s),r}(),i={struct:r,local:{createHash:function(e){return new r(e)}}};return e.structs.hash=i,i}},function(e,t){function n(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.exports=function(e){"use strict";var t={type:"FIFO",active:!0},r=0,i=1,o=2,s=function(){function s(n){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,s),this.settings=e.extend(!0,{},t,n),this.data=[],this.error=null,this.eventsQueue=e.createEventsManager()}var a,c,u;return a=s,(c=[{key:"listen",value:function(e,t,n){return this.eventsQueue.listen(e,t,n)}},{key:"enqueue",value:function(e){if(this.settings.active){var t=this.data.push(e);return this.eventsQueue.fireEvent("onQueued",this),t}return this.error=new Error("QUEUE is stoped"),this.eventsQueue.fireEvent("onError",this,this.error,o),null}},{key:"remove",value:function(t){return this.isEmpty()?(this.error=new Error("QUEUE is empty"),this.eventsQueue.fireEvent("onError",this,this.error,r),null):e.array.contain(this.data,t)?e.array.remove(this.data,t):(this.error=new Error(t+" Not found"),this.eventsQueue.fireEvent("onError",this,this.error,i),null)}},{key:"dequeue",value:function(){if(this.settings.active){if(this.isEmpty())return this.error=new Error("QUEUE is empty"),this.eventsQueue.fireEvent("onError",this,this.error,r),null;var t=this.data[0];return e.array.removeIndexOf(this.data,0),this.eventsQueue.fireEvent("onDeQueued",this),t}return this.error=new Error("QUEUE is stoped"),this.eventsQueue.fireEvent("onError",this,this.error,o),null}},{key:"peek",value:function(e){return this.isEmpty()?null:this.data[0]}},{key:"purge",value:function(){this.data.length=0}},{key:"isEmpty",value:function(){return 0===this.data.length}},{key:"count",value:function(){return this.data.length}},{key:"getQueue",value:function(){return this.data}},{key:"start",value:function(){this.settings.active=!0}},{key:"stop",value:function(){this.settings.active=!1}},{key:"run",value:function(t){if(!this.settings.active)return this.error=new Error("QUEUE is stoped"),this.eventsQueue.fireEvent("onError",this,this.error,o),null;this.eventsQueue.fireEvent("onRunStart",this),e.each(this.data,t),this.eventsQueue.fireEvent("onRunFinish",this)}}])&&n(a.prototype,c),u&&n(a,u),s}(),a={struct:s,local:{createQueue:function(e){return e||(e={}),function(e){var t=new s(e);return t.eventsQueue.settingsToListen(e),t.error?(t.eventsQueue.fireEvent("onError",t,t.error),t):t}(e)}}};return e.structs.queues=a,a}},function(e,t){e.exports=function(e){var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",n=function(e){e=e.replace(/\r\n/g,"\n");for(var t="",n=0;n<e.length;n++){var r=e.charCodeAt(n);r<128?t+=String.fromCharCode(r):r>127&&r<2048?(t+=String.fromCharCode(r>>6|192),t+=String.fromCharCode(63&r|128)):(t+=String.fromCharCode(r>>12|224),t+=String.fromCharCode(r>>6&63|128),t+=String.fromCharCode(63&r|128))}return t},r=function(e){for(var t="",n=0,r=0,i=0;n<e.length;)if((r=e.charCodeAt(n))<128)t+=String.fromCharCode(r),n++;else if(r>191&&r<224)i=e.charCodeAt(n+1),t+=String.fromCharCode((31&r)<<6|63&i),n+=2;else{i=e.charCodeAt(n+1);var o=e.charCodeAt(n+2);t+=String.fromCharCode((15&r)<<12|(63&i)<<6|63&o),n+=3}return t};return e.crypto.base64={decodeArrayBuffer:function(e){var n=e.length/4*3,r=new ArrayBuffer(n);return function(e,n){var r,i,o,s,a,c,u,l=t.indexOf(e.charAt(e.length-1)),p=t.indexOf(e.charAt(e.length-2)),h=e.length/4*3;64==l&&h--,64==p&&h--;var f=0,d=0;for(r=n?new Uint8Array(n):new Uint8Array(h),e=e.replace(/[^A-Za-z0-9\+\/\=]/g,""),f=0;f<h;f+=3)i=t.indexOf(e.charAt(d++))<<2|(a=t.indexOf(e.charAt(d++)))>>4,o=(15&a)<<4|(c=t.indexOf(e.charAt(d++)))>>2,s=(3&c)<<6|(u=t.indexOf(e.charAt(d++))),r[f]=i,64!=c&&(r[f+1]=o),64!=u&&(r[f+2]=s)}(e,r),r},encode:function(e){var r,i,o,s,a,c,u,l="",p=0;for(e=n(e);p<e.length;)s=(r=e.charCodeAt(p++))>>2,a=(3&r)<<4|(i=e.charCodeAt(p++))>>4,c=(15&i)<<2|(o=e.charCodeAt(p++))>>6,u=63&o,isNaN(i)?c=u=64:isNaN(o)&&(u=64),l=l+t.charAt(s)+t.charAt(a)+t.charAt(c)+t.charAt(u);return l},decode:function(e){var n,i,o,s,a,c,u="",l=0;for(e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");l<e.length;)n=t.indexOf(e.charAt(l++))<<2|(s=t.indexOf(e.charAt(l++)))>>4,i=(15&s)<<4|(a=t.indexOf(e.charAt(l++)))>>2,o=(3&a)<<6|(c=t.indexOf(e.charAt(l++))),u+=String.fromCharCode(n),64!=a&&(u+=String.fromCharCode(i)),64!=c&&(u+=String.fromCharCode(o));if(l!=e.length)throw new Error("BASE64_BROKEN : There were invalid base64 characters in the input text.\nValid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\nExpect errors in decoding.");return u=r(u)}},e.crypto.base64}},function(e,t){e.exports=function(e){var t=function(e){return c(u(a(e),8*e.length))},n=function(e,t){var n=a(e);n.length>16&&(n=u(n,8*e.length));for(var r=Array(16),i=Array(16),o=0;o<16;o++)r[o]=909522486^n[o],i[o]=1549556828^n[o];var s=u(r.concat(a(t)),512+8*t.length);return c(u(i.concat(s),640))},r=function(e){for(var t,n="0123456789abcdef",r="",i=0;i<e.length;i++)t=e.charCodeAt(i),r+=n.charAt(t>>>4&15)+n.charAt(15&t);return r},i=function(e){for(var t="",n=e.length,r=0;r<n;r+=3)for(var i=e.charCodeAt(r)<<16|(r+1<n?e.charCodeAt(r+1)<<8:0)|(r+2<n?e.charCodeAt(r+2):0),o=0;o<4;o++)8*r+6*o>8*e.length?t+="":t+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(i>>>6*(3-o)&63);return t},o=function(e,t){var n,r,i,o,s,a=t.length,c=Array(Math.ceil(e.length/2));for(n=0;n<c.length;n++)c[n]=e.charCodeAt(2*n)<<8|e.charCodeAt(2*n+1);var u=Math.ceil(8*e.length/(Math.log(t.length)/Math.log(2))),l=Array(u);for(r=0;r<u;r++){for(s=Array(),o=0,n=0;n<c.length;n++)o=(o<<16)+c[n],o-=(i=Math.floor(o/a))*a,(s.length>0||i>0)&&(s[s.length]=i);l[r]=o,c=s}var p="";for(n=l.length-1;n>=0;n--)p+=t.charAt(l[n]);return p},s=function(e){for(var t,n,r="",i=-1;++i<e.length;)t=e.charCodeAt(i),n=i+1<e.length?e.charCodeAt(i+1):0,55296<=t&&t<=56319&&56320<=n&&n<=57343&&(t=65536+((1023&t)<<10)+(1023&n),i++),t<=127?r+=String.fromCharCode(t):t<=2047?r+=String.fromCharCode(192|t>>>6&31,128|63&t):t<=65535?r+=String.fromCharCode(224|t>>>12&15,128|t>>>6&63,128|63&t):t<=2097151&&(r+=String.fromCharCode(240|t>>>18&7,128|t>>>12&63,128|t>>>6&63,128|63&t));return r},a=function(e){for(var t=Array(e.length>>2),n=0;n<t.length;n++)t[n]=0;for(n=0;n<8*e.length;n+=8)t[n>>5]|=(255&e.charCodeAt(n/8))<<n%32;return t},c=function(e){for(var t="",n=0;n<32*e.length;n+=8)t+=String.fromCharCode(e[n>>5]>>>n%32&255);return t},u=function(e,t){e[t>>5]|=128<<t%32,e[14+(t+64>>>9<<4)]=t;for(var n=1732584193,r=-271733879,i=-1732584194,o=271733878,s=0;s<e.length;s+=16){var a=n,c=r,u=i,l=o;n=p(n,r,i,o,e[s+0],7,-680876936),o=p(o,n,r,i,e[s+1],12,-389564586),i=p(i,o,n,r,e[s+2],17,606105819),r=p(r,i,o,n,e[s+3],22,-1044525330),n=p(n,r,i,o,e[s+4],7,-176418897),o=p(o,n,r,i,e[s+5],12,1200080426),i=p(i,o,n,r,e[s+6],17,-1473231341),r=p(r,i,o,n,e[s+7],22,-45705983),n=p(n,r,i,o,e[s+8],7,1770035416),o=p(o,n,r,i,e[s+9],12,-1958414417),i=p(i,o,n,r,e[s+10],17,-42063),r=p(r,i,o,n,e[s+11],22,-1990404162),n=p(n,r,i,o,e[s+12],7,1804603682),o=p(o,n,r,i,e[s+13],12,-40341101),i=p(i,o,n,r,e[s+14],17,-1502002290),r=p(r,i,o,n,e[s+15],22,1236535329),n=h(n,r,i,o,e[s+1],5,-165796510),o=h(o,n,r,i,e[s+6],9,-1069501632),i=h(i,o,n,r,e[s+11],14,643717713),r=h(r,i,o,n,e[s+0],20,-373897302),n=h(n,r,i,o,e[s+5],5,-701558691),o=h(o,n,r,i,e[s+10],9,38016083),i=h(i,o,n,r,e[s+15],14,-660478335),r=h(r,i,o,n,e[s+4],20,-405537848),n=h(n,r,i,o,e[s+9],5,568446438),o=h(o,n,r,i,e[s+14],9,-1019803690),i=h(i,o,n,r,e[s+3],14,-187363961),r=h(r,i,o,n,e[s+8],20,1163531501),n=h(n,r,i,o,e[s+13],5,-1444681467),o=h(o,n,r,i,e[s+2],9,-51403784),i=h(i,o,n,r,e[s+7],14,1735328473),r=h(r,i,o,n,e[s+12],20,-1926607734),n=f(n,r,i,o,e[s+5],4,-378558),o=f(o,n,r,i,e[s+8],11,-2022574463),i=f(i,o,n,r,e[s+11],16,1839030562),r=f(r,i,o,n,e[s+14],23,-35309556),n=f(n,r,i,o,e[s+1],4,-1530992060),o=f(o,n,r,i,e[s+4],11,1272893353),i=f(i,o,n,r,e[s+7],16,-155497632),r=f(r,i,o,n,e[s+10],23,-1094730640),n=f(n,r,i,o,e[s+13],4,681279174),o=f(o,n,r,i,e[s+0],11,-358537222),i=f(i,o,n,r,e[s+3],16,-722521979),r=f(r,i,o,n,e[s+6],23,76029189),n=f(n,r,i,o,e[s+9],4,-640364487),o=f(o,n,r,i,e[s+12],11,-421815835),i=f(i,o,n,r,e[s+15],16,530742520),r=f(r,i,o,n,e[s+2],23,-995338651),n=d(n,r,i,o,e[s+0],6,-198630844),o=d(o,n,r,i,e[s+7],10,1126891415),i=d(i,o,n,r,e[s+14],15,-1416354905),r=d(r,i,o,n,e[s+5],21,-57434055),n=d(n,r,i,o,e[s+12],6,1700485571),o=d(o,n,r,i,e[s+3],10,-1894986606),i=d(i,o,n,r,e[s+10],15,-1051523),r=d(r,i,o,n,e[s+1],21,-2054922799),n=d(n,r,i,o,e[s+8],6,1873313359),o=d(o,n,r,i,e[s+15],10,-30611744),i=d(i,o,n,r,e[s+6],15,-1560198380),r=d(r,i,o,n,e[s+13],21,1309151649),n=d(n,r,i,o,e[s+4],6,-145523070),o=d(o,n,r,i,e[s+11],10,-1120210379),i=d(i,o,n,r,e[s+2],15,718787259),r=d(r,i,o,n,e[s+9],21,-343485551),n=g(n,a),r=g(r,c),i=g(i,u),o=g(o,l)}return Array(n,r,i,o)},l=function(e,t,n,r,i,o){return g(m(g(g(t,e),g(r,o)),i),n)},p=function(e,t,n,r,i,o,s){return l(t&n|~t&r,e,t,i,o,s)},h=function(e,t,n,r,i,o,s){return l(t&r|n&~r,e,t,i,o,s)},f=function(e,t,n,r,i,o,s){return l(t^n^r,e,t,i,o,s)},d=function(e,t,n,r,i,o,s){return l(n^(t|~r),e,t,i,o,s)},g=function(e,t){var n=(65535&e)+(65535&t);return(e>>16)+(t>>16)+(n>>16)<<16|65535&n},m=function(e,t){return e<<t|e>>>32-t};return e.crypto.md5={hex_md5:function(e){return r(t(s(e)))},hex_md5_noUTF8:function(e){return r(t(e))},str_md5:function(e){return t(s(e))},b64_md5:function(e){return i(t(s(e)))},any_md5:function(e,n){return o(t(s(e)),n)},hex_hmac_md5:function(e,t){return r(n(s(e),s(t)))},str_hmac_md5:function(e,t){return n(s(e),s(t))},b64_hmac_md5:function(e,t){return i(n(s(e),s(t)))},any_hmac_md5:function(e,t,r){return o(n(s(e),s(t)),r)}},e.crypto.md5}},function(e,t,n){(function(t){function n(e,t){return!t||"object"!==o(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function r(e){return(r=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function i(e,t){return(i=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function o(e){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function s(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.exports=function(e){"use strict";var c=function(e){var t=window.location,n=h(e);return n.hostname===t.hostname&&n.port==t.port&&n.protocol===t.protocol},u=function(){function n(t,r,i){s(this,n),this.url="object"===o(t)?t:e.io.urlToOject(t),this.crossDomain=!e.io.isSameOrigin(t),this.notificationCenter=e.notificationsCenter.create(i);var a=r["WWW-Authenticate"].split(" "),c=Array.prototype.shift.call(a),u=r["WWW-Authenticate"].replace(c+" ","");this.method="POST";var l=r.body,p=this.getAuthenticationType(c);this.authentication=new p(this.url,this.method,u,l),this.ajax=!1,i.ajax&&(this.ajax=!0)}var r,i,c;return r=n,(i=[{key:"getAuthenticationType",value:function(t){if(t in e.io.authentication)return e.io.authentication[t];throw new Error("SSE client can't negociate : "+t)}},{key:"register",value:function(e,n){var r=this,i=this.authentication.getAuthorization(e,n);this.notificationCenter.fire("onRegister",this,i),this.ajax&&t.ajax({type:this.method,url:this.url.href,cache:!1,crossDomain:!this.crossDomain,error:function(e,t,n){r.notificationCenter.fire("onError",e,t,n)},beforeSend:function(e){e.setRequestHeader("Authorization",i)},success:function(e,t,n){r.notificationCenter.fire("onSuccess",e,t,n)}})}}])&&a(r.prototype,i),c&&a(r,c),n}(),l=function(e,t){return encodeURIComponent(e).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%3B/gi,";").replace(/%20/g,t?"%20":"+")},p=/^\?(.*)/,h=function(e){var t={},n=document.createElement("a");n.href=e;var r="protocol hostname host pathname port search hash href".split(" ");for(var i in r){var o=r[i];t[o]=n[o]}return t.toString=function(){return n.href},t.requestUri=t.pathname+t.search,t.basename=t.pathname.replace(/\\/g,"/").replace(/.*\//,""),t.dirname=t.pathname.replace(/\\/g,"/").replace(/\/[^\/]*$/,""),t},f=!!window.WebSocket,d=function(e){function t(e,i,o){var a;return s(this,t),a=n(this,r(t).call(this,i,o)),e?(a.url=h(e),a.crossDomain=!c(e),a.error=null):a.fire("onError",new Error("Transport URL not defined")),a}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&i(e,t)}(t,e),t}(e.notificationsCenter.notification);return e.io={nativeWebSocket:f,urlToOject:h,parseKeyValue:function(t){var n=p.exec(t);n&&(t=n[1]);var r={},i=(t||"").split("&");if(i.length)for(var o=0;o<i.length;o++)try{var s,a=i[o].replace(/\+/g,"%20").split("=");if(s=decodeURIComponent(a[0])){var c=decodeURIComponent(a[1]);if(Object.prototype.hasOwnProperty.call(r,s))switch(e.typeOf(r[s])){case"array":r[s].push(c);break;default:r[s]=[r[s],c]}else r[s]=c}}catch(e){}return r},toKeyValue:function(t){var n=[];for(var r in t)switch(e.typeOf(t[r])){case"array":for(var i=0;i<t[r].length;i++)n.push(l(r,!0)+(!0===t[r][i]?"":"="+l(t[r][i],!0)));break;case"string":case"boolean":n.push(l(r,!0)+(!0===t[r]?"":"="+l(t[r],!0)));break;default:continue}return n.length?n.join("&"):""},encodeUriSegment:function(e){return l(e,!0).replace(/%26/gi,"&").replace(/%3D/gi,"=").replace(/%2B/gi,"+")},encodeUriQuery:l,getHeaderJSON:function(e){var t=e.getResponseHeader("X-Json");if(t)try{return JSON.parse(t)}catch(e){return t}return null},isSameOrigin:c,isSecure:function(e){window.location;return"https:"===h(e).protocol},protocols:{},authentication:{authenticate:u,mechanisms:{}},transport:d,transports:{}},e.io}}).call(this,n(0))},function(e,t){function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.exports=function(e){var t={realm:!0,qop:!0,charset:!0,algorithm:!0,nonce:!0},i=/^([^=]+)=(.+)$/,o=e.crypto.md5.hex_md5_noUTF8,s=e.crypto.base64.encode,a=e.crypto.base64.decode,c=function(){function c(e,t,r,i){switch(function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,c),this.method=t,this.entity_body=i,this.url=e,this.uri=this.url.requestUri,this.protocol=this.url.protocol.replace(":",""),this.host=this.url.host,n(r)){case"object":this.parseChallenge(r);break;default:throw new Error("digetMD5 bad format header")}}var u,l,p;return u=c,(l=[{key:"parseChallenge",value:function(r){var o={};switch(n(r)){case"string":throw new Error("digetMD5 bad format challenge");case"object":for(var s in r)switch(s){case"challenge":if("string"==typeof r.challenge)try{this.challengeB64=a(r.challenge)}catch(e){this.challengeB64=r.challenge}break;default:o[s]=r[s]}break;default:throw new Error("digetMD5 bad format challenge")}var c=e.extend(function(e){for(var t=e.replace(/"/g,""),n=(t=t.replace(/Digest /g,"")).split(","),r={},o=0;o<n.length;o++){var s=i.exec(n[o]);s&&s[1]&&(r[s[1]]=s[2])}return r}(this.challengeB64),o);for(var u in c)u in t?this[u]=c[u]:console.warn("digestMd5 parser challenge header name dropped: "+u)}},{key:"generateAuthorization",value:function(e,t){var n='Digest username="'+e+'"';this.realm||(this.realm=e+"@"+this.url.host);var r,i,a,c,u,l,p={nonce:'"'+this.nonce+'"',realm:'"'+this.realm+'"',response:null};for(var h in this["digest-uri"]=this.protocol+"/"+this.host,p["digest-uri"]='"'+this["digest-uri"]+'"',this.qop&&(this.cnonce=s(Math.floor(1e8*Math.random()).toString()),p.cnonce='"'+this.cnonce+'"',p.qop=this.qop),this.opaque&&(p.opaque=this.opaque),this.nc="00000001",p.nc=this.nc,this.A1=function(e,t,n,r,i){return o(i?e+":"+t+":"+n+":"+r+":"+i:e+":"+t+":"+n)}(e,this.realm,t),this.A2=function(e,t,n,r){var i="";return r&&"auth"!==r?"auth-int"===r&&(i=n?e+":"+t+":"+o(n):e+":"+t+":d41d8cd98f00b204e9800998ecf8427e"):i=e+":"+t,o(i)}(this.method,this["digest-uri"],this.entity_body,this.qop),p.response=(r=this.A1,i=this.nonce,a=this.nc,c=this.cnonce,u=this.qop,l=this.A2,o("auth"===u||"auth-int"===u?r+":"+i+":"+a+":"+c+":"+u+":"+l:r+":"+i+":"+l)),p)n+=","+h+"="+p[h];return s(n)}}])&&r(u.prototype,l),p&&r(u,p),c}();return e.io.authentication.Digest=c,e.io.authentication.mechanisms.Digest=c,c}},function(e,t){function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.exports=function(e){var t=/^([^=]+)=(.+)$/,i=function(){function i(e,n,r,o){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,i),this.method=n,this.url=e,this.name="sasl",this.headers=function(e){for(var n=e.replace(/"/g,"").split(","),r={},i=0;i<n.length;i++){var o=t.exec(n[i]);o&&o[1]&&(r[o[1]]=o[2])}return r}(r),this.body=o,this.mechanisms=this.headers.mechanisms;var s=this.getBestMechanism(this.mechanisms);if(!s)throw new Error("SALS mechanism not found");delete this.headers.mechanisms,this.bestMechanism=s.name,this.mechanism=new s.Class(this.url,this.method,this.headers,this.body)}var o,s,a;return o=i,(s=[{key:"getBestMechanism",value:function(t){var r=null;switch(n(t)){case"object":for(var i=0;i<t.length;i++)if(t[i]in e.io.authentication.mechanisms){r=e.io.authentication.mechanisms[t[i]];var o=t[i];break}break;case"string":return this.getBestMechanism(t.split(" "));default:throw new Error("FORMAT SALS mechanism bad format")}return{name:o,Class:r}}},{key:"getAuthorization",value:function(e,t){return'SASL mechanism="'+this.bestMechanism+'",'+this.mechanism.generateAuthorization(e,t)}}])&&r(o.prototype,s),a&&r(o,a),i}();return e.io.authentication.SASL=i,i}},function(e,t){function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function i(e){return(i=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function o(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function s(e,t){return(s=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}e.exports=function(e){var t={type:"websocket"},a=function(a){function c(r,s){var a;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,c);var u,l,p=e.extend({},t,s);switch(u=this,(a=!(l=i(c).call(this,p))||"object"!==n(l)&&"function"!=typeof l?o(u):l).settings=p,a.settings.type){case"websocket":a.socket=e.io.transports.websocket;break;case"poll":case"longPoll":a.socket=e.io.transports.ajax}return a.listen(o(a),"onConnect"),a.listen(o(a),"onClose"),a.listen(o(a),"onError"),a.listen(o(a),"onMessage"),a.listen(o(a),"onTimeout"),a}var u,l,p;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&s(e,t)}(c,a),u=c,(l=[{key:"write",value:function(e){this.transport.send()}},{key:"close",value:function(e){this.transport.close()}},{key:"connect",value:function(e,t){this.transport=new this.socket(e,t),this.transport.onmessage=this.listen(this,"onMessage")}},{key:"destroy",value:function(e){this.transport=null,this.clearNotifications()}}])&&r(u.prototype,l),p&&r(u,p),c}(e.notificationsCenter.notification);return e.io.socket=a,a}},function(e,t){function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function i(e,t){return!t||"object"!==n(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function o(e){return(o=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function s(e,t){return(s=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}e.exports=function(e){var t=function(e){function t(e,n){var r;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),e?(r=i(this,o(t).call(this,e,n))).connect(e,n):(r=i(this,o(t).call(this))).socket=null,i(r)}var n,a,c;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&s(e,t)}(t,e),n=t,(a=[{key:"connect",value:function(e,t){try{this.socket=new WebSocket(e,t.protocol)}catch(e){throw this.fire("onError",e),e}return this.socket.onmessage=this.listen(this,"onMessage"),this.socket.onerror=this.listen(this,"onError"),this.socket.onopen=this.listen(this,"onConnect"),this.socket.onclose=this.listen(this,"onClose"),this.socket}},{key:"close",value:function(e,t){this.socket.close()}},{key:"send",value:function(e){this.socket.send(e)}},{key:"destroy",value:function(e){delete this.socket,this.socket=null}}])&&r(n.prototype,a),c&&r(n,c),t}(e.io.transport);return e.io.transports.websocket=t,t}},function(e,t,n){(function(t){function n(e,t){return!t||"object"!==o(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function r(e){return(r=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function i(e,t){return(i=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function o(e){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function s(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function c(e,t,n){return t&&a(e.prototype,t),n&&a(e,n),e}e.exports=function(e){var a={delay:1e3,async:!0,ajax:{cache:!0,dataType:"json",type:"GET",contentType:"application/x-www-form-urlencoded; charset=UTF-8"}},u=function(e){var n=(new Date).getTime();e.data=this.data.get();var r=t.ajax(e);r.tokenKey=n,this.transport[n]=r},l=function(){function e(t,n){s(this,e),this.reset(),t&&(this.contentType=t),n&&(this.method=n)}return c(e,[{key:"add",value:function(e,t){this[t?"permanent":"transient"]=e}},{key:"get",value:function(){var e=this.transient?this.transient:this.permanent;switch(this.transient="",this.contentType.split(";")[0].replace(/ /g,"")){case"application/json":case"text/json":"GET"!=this.method.toUpperCase()&&"object"==o(e)&&(e=JSON.stringify(e))}return e}},{key:"reset",value:function(){this.contentType="",this.method="GET",this.permanent="",this.transient=""}}]),e}(),p=function(e){function o(e,i){var c;return s(this,o),(c=n(this,r(o).call(this,e,i))).settings=t.extend(!0,{},a,i),c.data=new l(c.settings.ajax.contentType,c.settings.ajax.type),c.connectState=!1,c}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&i(e,t)}(o,e),c(o,[{key:"buildAjaxSettings",value:function(){return t.extend(!0,{},this.settings.ajax,{url:this.url.href,crossDomain:this.crossDomain,beforeSend:function(e){this.connectState||(this.fire.call(this,"onStart",this),this.connectState=!0)}.bind(this),success:function(e,t,n){this.fire("onMessage",e,this,n)}.bind(this),error:function(e,t,n){switch(t){case"abort":this.fire("onAbort",n,this,e);break;case"timeout":this.fire("onTimeout",n,this,e);break;default:this.fire("onError",n,this,e)}}.bind(this)})}},{key:"start",value:function(){var e=this.buildAjaxSettings();return this.transport={},e.complete=function(e,t){this.transport[e.tokenKey]&&delete this.transport[e.tokenKey]}.bind(this),u.call(this,e),this.idInterval=setInterval(u.bind(this,e),this.settings.delay),this}},{key:"setData",value:function(e,t){return this.data.add(e,t),this}},{key:"stop",value:function(){if(Object.keys(this.transport).length>0)for(var e in this.transport)this.transport[e].abort(),delete this.transport[e];return this.idInterval&&(clearInterval(this.idInterval),this.idInterval=null),this.connectState=!1,this.fire("onStop",this),this}},{key:"destroy",value:function(){return this.close(),this}}]),o}(e.io.transport);return e.io.transports.poll=p,p}}).call(this,n(0))},function(e,t,n){(function(t){function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function i(e,t){return!t||"object"!==n(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function o(e){return(o=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function s(e,t){return(s=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}e.exports=function(e){var n={delay:0,async:!1,ajax:{cache:!0,dataType:"json",type:"GET",contentType:"application/x-www-form-urlencoded; charset=UTF-8"}},a=function(e){e.data=this.data.get(),this.transport=t.ajax(e)},c=function(e){this.settings.delay?this.timer=setTimeout(a.bind(this,e),this.settings.delay):a.call(this,e)},u=function(t){function a(t,r){var s;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,a),(s=i(this,o(a).call(this,t,r))).settings=e.extend(!0,{},n,r),s}var u,l,p;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&s(e,t)}(a,t),u=a,(l=[{key:"start",value:function(){var e=this,t=this.buildAjaxSettings();return this.transport=null,t.complete=function(n,r){c.call(e,t)},c.call(this,t),this}},{key:"stop",value:function(){return this.transport.abort(),this.transport=null,this.timer&&clearTimeout(this.timer),this.connectState=!1,this.fire("onStop",this),this}}])&&r(u.prototype,l),p&&r(u,p),a}(e.io.transports.poll);return e.io.transports.longPoll=u,u}}).call(this,n(0))},function(e,t,n){(function(t){function n(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.exports=function(e){"use strict";var r=function(){var t=[];e.io.nativeWebSocket&&t.push("websocket"),e.io.poll&&t.push("poll"),e.io.longPoll&&t.push("long-polling"),e.io.jsonp&&t.push("callback-polling");return t}(),i=function(e){var t=this;if(e.successful)try{var n=this.getBestConnection(e.supportedConnectionTypes);this.socket=new n.Class(n.url),this.socket.onmessage=function(e){e.data&&t.onMessage(e.data)},this.socket.onopen=function(){t.socket.send(t.connect(e)),t.notificationCenter.fire("onHandshake",e,t.socket)},this.socket.onerror=this.notificationCenter.listen(this,"onError"),this.socket.onclose=function(e){delete t.socket,t.notificationCenter.fire("onClose",e)}}catch(e){throw new Error(e)}else l.call(this,e)},o=function(){this.reconnect=!0,this.notificationCenter.fire("reConnect",this)},s=function(e){if(e.successful){if(this.connected=!0,this.idconnection=e.clientId,e.advice)for(var t in e.advice)switch(t){case"reconnect":"retry"===e.advice[t]&&(this.reconnect||this.notificationCenter.listen(this,"onClose",o))}this.notificationCenter.fire("onConnect",e)}else this.connected=!1,l.call(this,e)},a=function(e){e.successful?this.socket&&(this.socket.close(),this.socket=null,this.notificationCenter.fire("onDisconnect",e)):l.call(this,e)},c=function(e){e.successful?this.notificationCenter.fire("onSubscribe",e):l.call(this,e)},u=function(e){e.successful?this.notificationCenter.fire("onUnsubscribe",e):l.call(this,e)},l=function t(n){if(n.error)try{switch(e.typeOf(n.error)){case"string":var r=n.error.split(":"),i=r[0],o=r[1],s=r[2];break;case"object":if(n.error)return t.call(this,n.error);break;case"Error":return n.error="500::"+n.error.message,t.call(this,n.error);default:throw new Error("Bad protocole error BAYEUX")}return this.notificationCenter.fire("onError",i,o,s)}catch(e){throw new Error("Bad protocole error BAYEUX"+e)}},p=function(){function p(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,p),this.name="bayeux",this.notificationCenter=e.notificationsCenter.create(this.settings,this),this.url=t,this.socket=null,this.connected=!1,this.request={version:"1.0"}}var h,f,d;return h=p,(f=[{key:"getBestConnection",value:function(e){return"https:"===this.url.protocol||"wss:"===this.url.protocol?this.url.protocol="wss:":this.url.protocol="ws:",this.socketType="WEBSOCKET",{Class:window.WebSocket,url:this.url.protocol+"//"+this.url.host+this.url.requestUri}}},{key:"build",value:function(e){var t=[];return t.push(e),t}},{key:"handshake",value:function(){var t=JSON.stringify(e.extend({},this.request,{channel:"/meta/handshake",minimumVersion:"1.0",supportedConnectionTypes:r}));return this.send(t)}},{key:"connect",value:function(e){return JSON.stringify({channel:"/meta/connect",clientId:e.clientId,connectionType:this.socketType})}},{key:"stopReConnect",value:function(e){this.notificationCenter.unListen("onClose",o)}},{key:"disconnect",value:function(){return JSON.stringify({channel:"/meta/disconnect",clientId:this.idconnection})}},{key:"subscribe",value:function(e,t){return JSON.stringify({channel:"/meta/subscribe",clientId:this.idconnection,subscription:"/service/"+e,data:t})}},{key:"unSubscribe",value:function(e,t,n){return JSON.stringify({channel:"/meta/unsubscribe",clientId:t,subscription:"/service/"+e,data:n})}},{key:"sendMessage",value:function(e,t,n){return JSON.stringify({channel:"/service/"+e,clientId:n,id:(new Date).getTime(),data:t})}},{key:"onMessage",value:function(e){try{"string"==typeof e&&(e=JSON.parse(e))}catch(t){return e.error=t,void l.call(this,e)}switch(e.channel){case"/meta/handshake":return i.call(this,e);case"/meta/connect":return s.call(this,e);case"/meta/disconnect":return a.call(this,e);case"/meta/subscribe":return c.call(this,e);case"/meta/unsubscribe":return u.call(this,e);default:this.notificationCenter.fire("onMessage",e)}}},{key:"send",value:function(e){var n=this;return this.socket?this.socket.send(e):t.ajax({method:"POST",cache:!1,url:this.url.href,dataType:"json",contentType:"application/json",data:e,success:function(e,t,r){n.onMessage(e)},error:function(e,t,r){n.notificationCenter.fire("onError",e,t,r)}})}}])&&n(h.prototype,f),d&&n(h,d),p}();return e.io.protocols.bayeux=p,p}}).call(this,n(0))},function(e,t){function n(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.exports=function(e){"use strict";var t=function(e,t){return e||null},r={cat:t,keywds:t,tool:t,ptime:t,maxptime:t,rtpmap:function(e,t){if(e){for(var n={payloadType:null,encodingName:null,clockRate:null,encodingParameters:null,raw:e},r=e.split(" "),i=0;i<r.length;i++)switch(i){case 0:n.payloadType=r[i];break;case 1:var o=r[i].split("/");n.encodingName=o[0],o[1]&&(n.clockRate=o[1]),o[2]&&(n.encodingParameters=o[2])}if(!(n.encodingName in t.rtpmap)){var s=t.rtpmap.push(n);t.rtpmap["rtpmap_"+n.payloadType]=t.rtpmap[s-1]}return n}return null},orient:t,type:t,charset:t,sdplang:t,lang:t,framerate:t,quality:t,fmtp:t,candidate:function(e,t){if(e){for(var n={foundation:null,componentId:null,transport:null,transportExt:null,priority:null,connectionAddress:null,port:null,candidateType:null,remoteAddr:null,remotePort:null,generation:null,networkId:null,raw:e},r=e.split(" "),i=0;i<r.length;i++)switch(i){case 0:n.foundation=r[i];break;case 1:n.componentId=r[i];break;case 2:n.transport=r[i];var o=r[i].split("/");n.transport=o[0],o[1]&&(n.transportExt=o[1]);break;case 3:n.priority=r[i];break;case 4:n.connectionAddress=r[i];break;case 5:n.port=r[i];break;default:switch(r[i]){case"typ":n.candidateType=r[i+1];break;case"raddr":n.remoteAddr=r[i+1];break;case"rport":n.remotePort=r[i+1];break;case"generation":n.generation=r[i+1];break;case"network-id":n.networkId=r[i+1]}}return t.candidates.push(n),e}return null}},i={recvonly:t,sendrecv:t,sendonly:t,inactive:t},o=function(){function e(t){if(function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),!t)throw new Error("SDP parser no data found !! ");this.raw=t,this.blocks=[],this.sessionBlock=null,this.audioBlock=null,this.videoBlock=null,this.detectBlocks(),this.parseBlocks()}var t,o,s;return t=e,(o=[{key:"detectBlocks",value:function(){for(var e=this.raw.split("\n"),t=e.length,n=0,r=null,i=0;i<t;i++){var o=e[i].split("="),s=o[0].replace(/ |\n|\r/g,""),a=o[1],c=null,u=null,l=null;switch(s){case"m":0===n?(c=e.slice(n,i)).length:(c=e.slice(n+1,i)).length;var p=this.parseMline(r);p?(u=p,l=p.media):(u=null,l="session"),this.blocks.push({type:l,direction:null,data:c,media:u,information:"",attributes:[],bandwidths:[],candidates:[],connection:null,encryption:null}),n=i,r=a}}var h=e.slice(n+1,t),f=(h.length,null),d=null,g=this.parseMline(r);g?(f=g,d=g.media):(f=null,d="session"),this.blocks.push({type:d,direction:null,data:h,media:f,information:"",attributes:[],bandwidths:[],candidates:[],connection:null,encryption:null})}},{key:"parseMline",value:function(e){var t=null;if(e){t={media:"",port:"",nbPort:0,proto:"",fmt:[],raw:e};for(var n=e.split(" "),r=0;r<n.length;r++)switch(r){case 0:t.media=n[r];break;case 1:var i=n[r].split("/");t.port=i[0],i[1]?t.nbPort=i[1]:t.nbPort=1;break;case 2:t.proto=n[r];break;default:t.fmt.push(n[r])}return t}return null}},{key:"parseAline",value:function(e,t){var n={};if(!e)return n;var o=e.split(":"),s=o[0].replace(/ |\n|\r/g,""),a=o[1];if(r[s])n[s]=r[s](a,t);else switch(s){case"setup":n[s]=a,t.setup=a;break;default:if(i[s]){var c=i[s](s,t);n[s]=c,t.direction=c}else n[s]=a}return n}},{key:"parseCline",value:function(e){if(e){for(var t={nettype:null,addrtype:null,address:null,raw:e},n=e.split(" "),r=0;r<n.length;r++)switch(r){case 0:t.nettype=n[r];break;case 1:t.addrtype=n[r];break;case 2:t.address=n[r]}return t}return null}},{key:"parseOline",value:function(e){var t=null;if(e){t={username:null,sessId:null,sessVersion:null,nettype:null,addrtype:null,unicastAddr:null,raw:e};for(var n=e.split(" "),r=0;r<n.length;r++)switch(r){case 0:t.username=n[r];break;case 1:t.sessId=n[r];break;case 2:t.sessVersion=n[r];break;case 3:t.nettype=n[r];break;case 4:t.addrtype=n[r];break;case 5:t.unicastAddr=n[r]}return t}return null}},{key:"parseTline",value:function(e){if(e){for(var t={start:null,stop:null,raw:e},n=e.split(" "),r=0;r<n.length;r++)switch(r){case 0:t.start=n[r];break;case 1:t.stop=n[r]}return t}return null}},{key:"parseRline",value:function(e){if(e){for(var t={interval:null,duration:null,offsets:null,raw:e},n=e.split(" "),r=0;r<n.length;r++)switch(r){case 0:t.interval=n[r];break;case 1:t.duration=n[r];break;case 2:t.offsets=n[r]}return t}return null}},{key:"blockMediaParser",value:function(e){e.rtpmap=[];for(var t=0;t<e.data.length;t++){var n=e.data[t].split("="),r=n[0].replace(/ |\n|\r/g,""),i=n[1];switch(r){case"a":e.attributes.push(this.parseAline(i,e));break;case"c":e.connection=this.parseCline(i);break;case"i":e.information=i;break;case"b":e.bandwidths.push(i);break;case"k":e.encryption=i}}return e}},{key:"blockSessionParser",value:function(e){e.protocol=null,e.originator=null,e.timeZone=null,e.sessionName=null,e.originator=null,e.protocol=null,e.uri=null,e.phoneNumber=null,e.email=null,e.timeDescription=null,e.timeRepeat=null;for(var t=0;t<e.data.length;t++){var n=e.data[t].split("="),r=n[0].replace(/ |\n|\r/g,""),i=n[1];switch(r){case"v":e.protocol=i;break;case"o":e.originator=this.parseOline(i);break;case"s":e.sessionName=i;break;case"u":e.uri=i;break;case"e":e.email=i;break;case"p":e.phoneNumber=i;break;case"z":e.timeZone=i;break;case"a":e.attributes.push(this.parseAline(i,e));break;case"c":e.connection=this.parseCline(i);break;case"i":e.information=i;break;case"b":e.bandwidths.push(i);break;case"k":e.encryption=i;break;case"t":e.timeDescription=this.parseTline(i);break;case"r":e.timeRepeat=this.parseRline(i)}}return e}},{key:"parseBlocks",value:function(){for(var e=0;e<this.blocks.length;e++)switch(this.blocks[e].type){case"session":this.sessionBlock=this.blockSessionParser(this.blocks[e]);break;case"audio":this.audioBlock=this.blockMediaParser(this.blocks[e]);break;case"video":this.videoBlock=this.blockMediaParser(this.blocks[e])}}}])&&n(t.prototype,o),s&&n(t,s),e}();return e.io.protocols.sdp=o,o}},function(e,t,n){(function(t){function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e,t){return!t||"object"!==n(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function i(e){return(i=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function o(e,t){return(o=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function s(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function c(e,t,n){return t&&a(e.prototype,t),n&&a(e,n),e}e.exports=function(e){"use strict";var n=function(e){return("0"+e.toString(16)).slice(-2)},a=function(e){return'"'+e+'"'},u=/^([^=]+)=(.+)$/,l=function(e){for(var t=e.replace(/"/g,""),n=(t=t.replace(/Digest /g,"")).split(","),r=[],i=0;i<n.length;i++){var o=u.exec(n[i]),s=o[1].replace(/ |\n|\r/g,"");o&&s&&(r[s]=o[2])}return r},p=e.crypto.md5.hex_md5_noUTF8,h=function(e,t,n,r,i){return p(i?e+":"+t+":"+n+":"+r+":"+i:e+":"+t+":"+n)},f=function(e,t,n,r){var i="";if(r&&"auth"!==r){if("auth-int"===r){if(n)i=e+":"+t+":"+p(n);else i=e+":"+t+":d41d8cd98f00b204e9800998ecf8427e"}}else i=e+":"+t;return p(i)},d=function(e,t,n,r,i,o){return p("auth"===i||"auth-int"===i?e+":"+t+":"+n+":"+r+":"+i+":"+o:e+":"+t+":"+o)},g=function(){function e(t,n,r){s(this,e),this.dialog=t,this.userName=n,this.password=r,this.uri="sip:"+this.dialog.sip.server,this.realm="nodefony.com",this.nonce=null,this.cnonce=null,this.nonceCount=null,this.qop=null,this.algorithm=null,this.entity_body=null,this.timeout=null,this.unregisterSended=!1}return c(e,[{key:"register",value:function(e,t){var n=e.authenticate;switch(n?this.dialog.authenticate=n:n=this.dialog.authenticate,this.realm=n.realm,this.nonce=n.nonce,this.cnonce=n.cnonce,this.qop=n.qop,this.algorithm=n.Digestalgorithm?n.Digestalgorithm:"md5",e.rawBody&&(this.entity_body=e.rawBody),this.algorithm.toLowerCase()){case"md5":this.response=this.digestMD5(e.method)}var r="";r=t&&"proxy"===t?"Proxy-Authorization: ":"Authorization: ";var i="Digest username="+a(this.userName)+", realm="+a(this.realm)+", nonce="+a(this.nonce)+", uri="+a(this.uri)+", algorithm="+this.algorithm+", response="+a(this.response);this.lineResponse=r+i;var o=this.dialog.createTransaction(e.transaction.to);this.dialog.tagTo=null;var s=o.createRequest(this.dialog.body,this.dialog.bodyType);return s.header.response=this.lineResponse,s.send(),this.dialog.sip.createDialogTimeout(this.dialog),o}},{key:"unregister",value:function(){this.dialog.expires=0,this.dialog.contact="*";var e=this.dialog.createTransaction(this.dialog.from);this.dialog.to=this.dialog.from,this.dialog.tagTo=null;var t=e.createRequest();return this.lineResponse&&(t.header.response=this.lineResponse),this.unregisterSended=!0,t.send(),e}},{key:"digestMD5",value:function(e){var t=h(this.userName,this.realm,this.password,this.nonce,this.cnonce),n=f(e,this.uri,this.entity_body,this.qop);return d(t,this.nonce,this.nonceCount,this.cnonce,this.qop,n)}}]),e}(),m={line:/\r\n|\r|\n/,headName:/: */,Allow:/, */,Via:/; */,CallId:/^(.*)@.*$/,algorithm:/= */,fromTo:/<sip:(.*)@(.*)>/,fromToG:/(.*)?<sip:(.*)@(.*)>/,contact:/.*<(sips?:.*)>(.*)?$/},y=function(e,t){try{var n=t.split(";");this.message[e+"Tag"]=null;var r=n.shift(),i=m.fromTo.exec(r);this.message[e+"Name"]=i.length>2?i[1].replace(/ |\n|\r/g,"").replace(/"/g,""):"",this.message[e]=i[1].replace(" ","")+"@"+i[2].replace(/ |\n|\r/g,"");var o=m.fromToG.exec(r);if(o&&o[1]){var s=o[1].replace(/"/g,"");this.message[e+"NameDisplay"]=s}for(var a=0;a<n.length;a++){var c=n[a].split("=");"tag"===c[0].replace(/ |\n|\r/g,"")?this.message[e+"Tag"]=c[1]:this.message[c[0]]=c[1]}return t}catch(e){throw e}},v=function(){function e(t,n){if(s(this,e),this.rawHeader={},this.message=t,this.method=null,this.firstLine=null,this.branch=null,this.Via=[],this.routes=[],this.recordRoutes=[],n&&"string"==typeof n)try{this.parse(n)}catch(e){throw e}}return c(e,[{key:"parse",value:function(e){var n=this,r=e.split(m.line),i=r.shift();this.firstLine=i.split(" "),t.each(r,(function(e,t){var r=m.headName.exec(t),i=r[0].length,o=r.input.substr(0,r.index),s=r.input.substr(r.index+i);n.rawHeader[o]=s;var a="set"+o;if("setVia"===a){var c=n.Via.push(s);n[o][c-1]=n[a](s,t)}else if(n[o]=s,n[a])try{n[o]=n[a](s)}catch(e){throw n.message.sip.logger("Parse : "+o,"ERROR"),e}})),this["Content-Type"]?this.message.contentType=this["Content-Type"]:this.message.contentType=null}},{key:"setFrom",value:function(e){return y.call(this,"from",e),e}},{key:"setTo",value:function(e){return y.call(this,"to",e),e}},{key:"setWWW-Authenticate",value:function(e){return this.message.authenticate=l(e),e}},{key:"setProxy-Authenticate",value:function(e){return this.message.authenticate=l(e),e}},{key:"setRecord-Route",value:function(e){return this.recordRoutes.push(e),e}},{key:"setRoute",value:function(e){return this.routes.push(e),e}},{key:"setDate",value:function(e){try{this.message.date=new Date(e)}catch(t){this.message.date=e}return e}},{key:"setCall-ID",value:function(e){return this.message.callId=e,e}},{key:"setCSeq",value:function(e){var t=e.split(" ");return this.message.cseq=parseInt(t[0],10),this.message.method=t[1],e}},{key:"setContact",value:function(e){var t=m.contact.exec(e);if(!t)throw new Error("Contact parse error : "+e);if(this.message.contact=t[1],t[2])for(var n=t[2].replace(/^;(.*)/,"$1").split(";"),r=0;r<n.length;r++){var i=n[r].split("=");if(i){var o=i[0].toLowerCase();"expires"===o&&(this["contact-"+o]=i[1])}}return e}},{key:"setAllow",value:function(e){return e?this.Allow.split(m.Allow):this.Allow}},{key:"setSupported",value:function(e){return e?this.Supported.split(m.Allow):this.Supported}},{key:"setVia",value:function(e,t){if(e){for(var n=e.split(m.Via),r={line:Array.prototype.shift.call(n),raw:t},i=0;i<n.length;i++){var o=n[i].split("=");o&&("branch"===o[0]&&(this.branch||(this.branch=o[1])),r[o[0]]=o[1])}return r}return e}}]),e}(),b=function(){function t(e,n){if(s(this,t),this.message=e,this.message.rawBody=n,this.size=this.message.contentLength,this.size!==n.length)throw new Error("BAD SIZE SIP BODY ");n&&this.parse(this.message.contentType,n)}return c(t,[{key:"parse",value:function(e,t){switch(e){case"application/sdp":this.sdpParser(t);break;case"application/dtmf-relay":this.dtmfParser(t);break;default:this.body=t}}},{key:"sdpParser",value:function(t){if(this.body=t||"",t)try{this.sdp=new e.io.protocols.sdp(t)}catch(e){throw e}else this.sdp=null}},{key:"dtmfParser",value:function(e){if(this.body=e||"",e){for(var t={},n=e.split("\n"),r=0;r<n.length;r++){var i=n[r].split("=");t[i[0].replace(/ |\n|\r/g,"")]=i[1]}this.dtmf=t}else this.dtmf=null}}]),t}(),w=function(){function t(e,n,r){s(this,t),this.transaction=e,this["request-port"]=this.transaction.dialog.sip.serverPort,this.type="request",this.requestLine={},this.buildRequestline(),this.header={},this.buildHeader(),this.buildBody(n||"",r)}return c(t,[{key:"buildRequestline",value:function(){this.requestLine.method=this.transaction.method.toUpperCase(),this.requestLine.version=this.transaction.dialog.sip.version}},{key:"getRequestline",value:function(e){switch(this.transaction.method){case"REGISTER":return this["request-uri"]="sip:"+this.transaction.dialog.sip.server,this.transaction.method+" "+this["request-uri"]+" "+this.requestLine.version+"\r\n";case"INVITE":case"BYE":case"NOTIFY":case"INFO":case"CANCEL":case"ACK":return this["request-uri"]=this.transaction.dialog["request-uri"],this.transaction.method+" "+this["request-uri"]+" "+this.requestLine.version+"\r\n"}}},{key:"buildHeader",value:function(){this.transaction.dialog.sip.rport,this.transaction.dialog.sip.publicAddress;this.header.via="Via: "+this.transaction.dialog.sip.via+";branch="+this.transaction.branch,this.header.cseq="CSeq: "+this.transaction.dialog.cseq+" "+this.transaction.method,this.header.from="From: "+this.transaction.dialog.from+";tag="+this.transaction.dialog.tagFrom;var e=this.transaction.dialog.tagTo?";tag="+this.transaction.dialog.tagTo:"";if(this.header.to="To: "+this.transaction.to+e,this.header.callId="Call-ID: "+this.transaction.dialog.callId,this.header.expires="Expires: "+this.transaction.dialog.expires,this.header.maxForward="Max-Forwards: "+this.transaction.dialog.maxForward,this.header.userAgent="User-Agent: "+this.transaction.dialog.sip.settings.userAgent,this.header.contact="Contact: "+this.transaction.dialog.contact,this.transaction.dialog.routes&&this.transaction.dialog.routes.length){this.header.routes=[];for(var t=this.transaction.dialog.routes.length-1;t>=0;t--)this.header.routes.push("Route: "+this.transaction.dialog.routes[t])}}},{key:"getHeader",value:function(){var t="";for(var n in this.header)switch(e.typeOf(this.header[n])){case"string":t+=this.header[n]+"\r\n";break;case"array":for(var r=0;r<this.header[n].length;r++)t+=this.header[n][r]+"\r\n"}return t}},{key:"buildBody",value:function(e,t){this.header.contentLength="Content-Length: "+e.length,t&&(this.header.contentType="Content-Type: "+t),this.body=e||""}},{key:"getBody",value:function(){return this.body}},{key:"getMessage",value:function(){return this.rawResponse=this.getRequestline()+this.getHeader()+"\r\n"+this.getBody()}},{key:"send",value:function(){return this.transaction.send(this.getMessage())}}]),t}(),x={200:"OK"},k=function(){function e(t,n,r,i,o){s(this,e),this.message=t,this.transaction=t.transaction,this.dialog=t.dialog,this.responseLine={},this.buildResponseLine(n,r),this.header=[],this.buildHeader(t),this.buildBody(i||"",o)}return c(e,[{key:"buildHeader",value:function(e){for(var t in e.rawHeader){var n=0;switch(t){case"Allow":case"Supported":var r="";for(n=0;n<e.header[t].length;n++)n<e.header[t].length-1?r+=e.header[t][n]+",":r+=e.header[t][n];this.header.push(t+": "+r);break;case"Via":if("487"==this.responseLine.code)for(n=0;n<this.dialog[t].length;n++)this.header.push(this.dialog[t][n].raw);else for(n=0;n<e.header[t].length;n++)this.header.push(e.header[t][n].raw);break;case"User-Agent":this.header.push("User-Agent: "+this.transaction.dialog.sip.settings.userAgent);break;case"Contact":this.header.push("Contact: "+this.dialog.contact);break;case"To":var i=m.fromToG.exec(e.header[t]);i&&!i[1]&&(e.header[t]='"'+this.dialog.sip.displayName+'"'+e.header[t]),e.header[t].match(/;tag=/)?this.header.push(t+": "+e.header[t]):this.header.push(t+": "+e.header[t]+(this.transaction.dialog.tagFrom?";tag="+this.transaction.dialog.tagFrom:""));break;case"Record-Route":for(n=this.message.dialog.routes.length-1;n>=0;n--)this.header.push(t+": "+this.message.header.recordRoutes[n]);break;case"CSeq":"487"==this.responseLine.code&&"CANCEL"===this.dialog.method?this.header.push(t+": "+e.header[t].replace("CANCEL","INVITE")):this.header.push(t+": "+e.header[t]);break;case"Content-Type":case"Organization":case"Server":case"Content-Length":break;default:this.header.push(t+": "+e.header[t])}}}},{key:"getHeader",value:function(){var e="";for(var t in this.header)e+=this.header[t]+"\r\n";return e}},{key:"buildBody",value:function(e,t){this.header.contentLength="Content-Length: "+e.length,t&&(this.header.contentType="Content-Type: "+t),this.body=e||""}},{key:"getBody",value:function(){return this.body}},{key:"buildResponseLine",value:function(e,t){this.responseLine.method=this.transaction.method.toUpperCase(),this.responseLine.version=this.transaction.dialog.sip.version,this.responseLine.code=e,this.responseLine.message=t||x[e]}},{key:"getResponseline",value:function(){return"ACK"===this.responseLine.method?this.responseLine.method+" sip:"+this.transaction.from+"@"+this.transaction.dialog.sip.server+" "+this.responseLine.version+"\r\n":this.responseLine.version+" "+this.responseLine.code+" "+this.responseLine.message+"\r\n"}},{key:"getMessage",value:function(){return this.rawResponse=this.getResponseline()+this.getHeader()+"\r\n"+this.getBody()}},{key:"send",value:function(){return this.transaction.send(this.getMessage())}}]),e}(),T=function(){function e(t,n){s(this,e),this.dialog=n,t instanceof R?this.hydrate(t):(this.to=t,this.from=n.from,this.method=n.method,this.branch=this.generateBranchId()),this.responses={},this.requests={},this.interval=null}return c(e,[{key:"hydrate",value:function(e){this.message=e,"REQUEST"===e.type&&(this.to=this.dialog.to,this.from=this.dialog.from,this.method=this.dialog.method,this.branch=this.message.header.branch),"RESPONSE"===e.type&&(this.to=this.dialog.to,this.from=this.dialog.from,this.method=this.dialog.method,this.branch=this.message.header.branch)}},{key:"generateBranchId",value:function(){var e=Math.floor(16777215e7*Math.random()).toString(16);return 12===e.length?"z9hG4bK"+e:this.generateBranchId()}},{key:"createRequest",value:function(e,t){return"ACK"!==this.method&&"CANCEL"!==this.method&&this.dialog.incCseq(),this.request=new w(this,e||"",t),this.message=null,this.request}},{key:"createResponse",value:function(e,t,n,r){if("INVITE"===this.method||"ACK"===this.method)switch(!0){case e<200:this.dialog.status=this.dialog.statusCode.EARLY;break;case e<300:this.dialog.status=this.dialog.statusCode.ESTABLISHED;break;default:this.dialog.status=this.dialog.statusCode.TERMINATED}return this.response=new k(this.message,e,t,n,r),this.response}},{key:"send",value:function(e){return this.dialog.sip.send(e)}},{key:"cancel",value:function(){this.method="CANCEL",this.dialog.routes=null,this.dialog.tagTo="";var e=this.createRequest();return e.send(),this.dialog.status=this.dialog.statusCode.CANCEL,e}},{key:"decline",value:function(){var e=this.createResponse(603,"Declined");return e.send(),e}},{key:"clear",value:function(){this.interval&&clearInterval(this.interval)}}]),e}(),C={INITIAL:0,EARLY:1,ESTABLISHED:2,TERMINATED:3,CANCEL:4},S=function(){function e(t,n){s(this,e),this.sip=n,this.transactions={},this.statusCode=C,this.status=this.statusCode.INITIAL,this.routes=null,this.from=this.sip.from,this.maxForward=this.sip.settings.maxForward,this.expires=this.sip.settings.expires,this.tagFrom=this.generateTag(),this.cseq=this.generateCseq(),this.unregisterSended=!1,t instanceof R?this.hydrate(t):(this.method=t,this.callId=this.generateCallId(),this.status=this.statusCode.INITIAL,this.to=null,this.tagTo=null),this.contact=this.sip.contact}return c(e,[{key:"hydrate",value:function(e){"REQUEST"===e.type&&(this.cseq=e.cseq,this.method=e.method,this.callId=e.callId,e.fromNameDisplay?this.to='"'+e.fromNameDisplay+'"<sip:'+e.from+">":this.to="<sip:"+e.from+">",this.toName=e.fromName,this.tagTo=e.fromTag||this.generateTag(),this.tagFrom=e.toTag||this.tagFrom,e.toNameDisplay?this.from='"'+e.toNameDisplay+'"<sip:'+e.to+">":this.from="<sip:"+e.to+">",this.fromName=e.toName,e.header.recordRoutes.length&&(this.routes=e.header.recordRoutes.reverse()),e.contact&&(this["request-uri"]=e.contact)),"RESPONSE"===e.type&&(this.cseq=e.cseq,this.callId||(this.callId=e.callId),this.to?e.toNameDisplay&&(this.to='"'+e.toNameDisplay+'"<sip:'+e.to+">"):e.toNameDisplay?this.to='"'+e.toNameDisplay+'"<sip:'+e.to+">":this.to="<sip:"+e.to+">",e.toTag&&(this.tagTo=e.toTag),e.fromTag&&(this.tagFrom=e.fromTag),e.contact&&(this["request-uri"]=e.contact),e.header.recordRoutes.length&&(this.routes=e.header.recordRoutes))}},{key:"generateCallId",value:function(){return t=new Uint8Array((e||40)/2),window.crypto.getRandomValues(t),[].map.call(t,n).join("")+"@nodefony";var e,t}},{key:"generateTag",value:function(){return"nodefony"+parseInt(1e9*Math.random(),10)}},{key:"generateCseq",value:function(){return 1}},{key:"incCseq",value:function(){return this.cseq=this.cseq+1,this.cseq}},{key:"getTransaction",value:function(e){return e in this.transactions?this.transactions[e]:null}},{key:"createTransaction",value:function(e){return this.currentTransaction=new T(e||this.to,this),this.sip.logger("SIP NEW TRANSACTION :"+this.currentTransaction.branch,"DEBUG"),this.transactions[this.currentTransaction.branch]=this.currentTransaction,this.currentTransaction}},{key:"register",value:function(){var e=this.createTransaction(this.from);return this.to=this.from,e.createRequest().send(),e}},{key:"unregister",value:function(){this.expires=0,this.contact="*";var e=this.createTransaction(this.from);return this.to=this.from,this.tagTo=null,e.createRequest().send(),this.unregisterSended=!0,e}},{key:"ack",value:function(){this["request-uri"]||(this["request-uri"]=this.sip["request-uri"]);var e=this.createTransaction();e.method="ACK";var t=e.createRequest();return t.send(),t}},{key:"invite",value:function(e,t,n){if(this.status===this.statusCode.CANCEL)return null;this.sip.logger("SIP INVITE DIALOG"),e&&(this.to="<sip:"+e+">"),this.method="INVITE",this["request-uri"]||(this["request-uri"]="sip:"+e),t.sdp?(this.bodyType="application/sdp",this.body=t.sdp):(this.bodyType=n,this.body=t);var r=this.createTransaction(this.to);return r.createRequest(this.body,this.bodyType).send(),r}},{key:"notify",value:function(e,t,n){return this.method="NOTIFY",e&&(this.to="<sip:"+e+">"),this["request-uri"]||(this["request-uri"]="sip:"+e),n&&(this.bodyType=n),t&&(this.body=t),this.createTransaction(this.to).createRequest(this.body,this.bodyType).send(),this}},{key:"info",value:function(e,t){return this.method="INFO",t&&(this.bodyType=t),e&&(this.body=e),this.createTransaction(this.to).createRequest(this.body,this.bodyType).send(),this}},{key:"bye",value:function(){return this.method="BYE",this.createTransaction().createRequest().send(),this}},{key:"clear",value:function(e){if(e){if(!this.transactions[e])throw new Error("TRANSACTION not found :"+e);this.transactions[e].clear(),delete this.transactions[e]}else for(var t in this.transactions)this.transactions[t].clear(),delete this.transactions[t]}}]),e}(),E=/\r\n\r\n/,R=function(){function e(t,n){if(s(this,e),this.sip=n,!t)throw new Error("BAD FORMAT MESSAGE SIP no message",500);if(this.rawMessage=t,this.header=null,this.body=null,this.statusLine=null,this.contentLength=0,this.code=null,this.statusLine="",this.split=t.split(E),this.split.length&&this.split.length<=2){try{this.parseHeader(),this.contentLength=parseInt(this.header["Content-Length"],10),this.parseBody(),this.statusLine=function(e){var t=e[0],n=e[1];"BYE"!==t||n||(n=200);for(var r="",i=2;i<e.length;i++)r+=e[i]+" ";return{method:t,code:n,message:r}}(this.header.firstLine),this.code=parseInt(this.statusLine.code,10),this.getType()}catch(e){throw e}this.rawHeader=this.header.rawHeader}this.getDialog(),this.getTransaction()}return c(e,[{key:"getType",value:function(){if(this.code){if("number"!=typeof this.code||isNaN(this.code))throw new Error("BAD FORMAT MESSAGE SIP message code   ");this.type="RESPONSE"}else{if(!this.method)throw this.type=null,new Error("BAD FORMAT MESSAGE SIP message type not defined  ");this.type="REQUEST"}}},{key:"parseBody",value:function(){try{this.split[1]?this.body=new b(this,this.split[1]):this.body=new b(this,"")}catch(e){throw this.sip.logger("SIP parseBody Message :"+this.split[1],"ERROR"),e}}},{key:"parseHeader",value:function(){if(!this.split[0])throw 500;try{this.header=new v(this,this.split[0])}catch(e){throw this.sip.logger("SIP parseHeader Message :"+this.split[0],"ERROR"),e}}},{key:"getContact",value:function(){return this.contact}},{key:"getHeader",value:function(){return this.header}},{key:"getBody",value:function(){return this.body}},{key:"getStatusLine",value:function(){return this.statusLine}},{key:"getCode",value:function(){return this.code}},{key:"getDialog",value:function(){if(this.header["Call-ID"])return this.dialog=this.sip.getDialog(this.header["Call-ID"]),this.dialog?(this.sip.logger("SIP HYDRATE DIALOG :"+this.dialog.callId,"DEBUG"),this.dialog.hydrate(this)):this.dialog=this.sip.createDialog(this),this.dialog;throw new Error("BAD FORMAT SIP MESSAGE no Call-ID",500)}},{key:"getTransaction",value:function(){if(this.header.branch)return this.dialog||this.getDialog(),this.dialog?(this.transaction=this.dialog.getTransaction(this.header.branch),this.transaction?(this.sip.logger("SIP HYDRATE TRANSACTION :"+this.transaction.branch,"DEBUG"),this.transaction.hydrate(this)):this.transaction=this.dialog.createTransaction(this)):this.transaction=null,this.transaction;throw this.sip.logger(this.rawMessage,"ERROR"),new Error("BAD FORMAT SIP MESSAGE no Branch",500)}}]),e}(),P=function e(t){var n=this;this.logger(t,"INFO","RECIEVE");var r=null;try{this.fragment?this.lastResponse+=t:this.lastResponse=t,r=new R(this.lastResponse,this),this.fragment=!1}catch(n){for(var i=0;i<n.length;i++)if(n[i])try{e.call(this,n[i]);continue}catch(e){return void(this.fragment=!0)}return this.logger(n,"ERROR"),this.logger("SIP DROP : "+t,"ERROR"),void this.notificationsCenter.fire("onDrop",t)}switch(this.fire("onMessage",r.rawMessage),r.method){case"REGISTER":switch(this.rport=r.header.Via[0].rport,r.dialog&&this.clearDialogTimeout(r.dialog),this.rport&&(this["request-uri"]="sip:"+this.userName+"@"+this.publicAddress+":"+this.rport+";transport="+this.transportType),r.code){case 401:case 407:if(200===this.registered)this.registerInterval&&clearInterval(this.registerInterval),this.registerInterval=null;else{if(401===this.registered||407===this.registered){this.registerInterval&&clearInterval(this.registerInterval),this.registerInterval=null,this.registered=null,this.notificationsCenter.fire("onError",this,r);break}this.registered=r.code}delete this.authenticateRegister,this.authenticateRegister=null,this.authenticateRegister=new g(r.dialog,this.userName,this.settings.password),this.authenticateRegister.register(r,407===r.code?"proxy":null);break;case 403:case 404:this.registerInterval&&clearInterval(this.registerInterval),this.registered=r.code,delete this.authenticateRegister,this.authenticateRegister=null,this.notificationsCenter.fire("onError",this,r);break;case 200:if(this.registerInterval&&clearInterval(this.registerInterval),this.authenticateRegister&&this.authenticateRegister.unregisterSended)return this.registered="404",this.notificationsCenter.fire("onUnRegister",this,r),void this.clear();if(r.dialog.unregisterSended)return this.registered="404",this.notificationsCenter.fire("onUnRegister",this,r),void this.clear();401!==this.registered&&null!==this.registered||this.notificationsCenter.fire("onRegister",this,r),this.registered=r.code;var o=r.header["contact-expires"]||this.settings.expires;o=900*parseInt(o,10),this.registerInterval=setInterval((function(){n.authenticateRegister.register(r),n.notificationsCenter.fire("onRenew",n,n.authenticateRegister,r)}),o);break;default:this.registered=r.code,delete this.authenticateRegister,this.authenticateRegister=null,this.notificationsCenter.fire("on"+r.code,this,r)}break;case"INVITE":switch(r.dialog&&this.clearDialogTimeout(r.dialog),r.type){case"REQUEST":if(r.dialog.status===r.dialog.statusCode.INITIAL)this.fire("onInitCall",r.dialog.toName,r.dialog,r.transaction),r.header.Via&&(r.dialog.Via=r.header.Via),this.notificationsCenter.fire("onInvite",r,r.dialog);else if(r.dialog.status===r.dialog.statusCode.ESTABLISHED)this.notificationsCenter.fire("onInvite",r,r.dialog);else r.transaction.createResponse(200,"OK").send();break;case"RESPONSE":switch(r.code>=200&&r.dialog.ack(r),r.code){case 407:case 401:delete this.authenticate,this.authenticate=null,this.authenticate=new g(r.dialog,this.userName,this.settings.password);var s=this.authenticate.register(r,407===r.code?"proxy":null);this.fire("onInitCall",r.dialog.toName,r.dialog,s);break;case 180:this.notificationsCenter.fire("onRinging",this,r),r.dialog.status=r.dialog.statusCode.EARLY;break;case 100:this.notificationsCenter.fire("onTrying",this,r),r.dialog.status=r.dialog.statusCode.EARLY;break;case 200:this.notificationsCenter.fire("onCall",r),r.dialog.status=r.dialog.statusCode.ESTABLISHED;break;case 486:case 603:this.notificationsCenter.fire("onDecline",r);break;case 403:this.authenticate=!1,this.notificationsCenter.fire("onError",this,r);break;case 487:case 404:case 477:case 480:case 484:case 488:this.notificationsCenter.fire("onError",this,r);break;case 408:this.notificationsCenter.fire("onTimeout",this,r);break;case 500:this.notificationsCenter.fire("onError",this,r);break;default:this.notificationsCenter.fire("on"+r.code,this,r)}}break;case"ACK":break;case"BYE":switch(r.code){case 200:this.notificationsCenter.fire("onBye",r);break;default:this.notificationsCenter.fire("onBye",r),"REQUEST"===r.type&&r.transaction.createResponse(200,"OK").send()}break;case"INFO":switch(r.type){case"REQUEST":this.notificationsCenter.fire("onInfo",r),r.transaction.createResponse(200,"OK").send();break;case"RESPONSE":this.notificationsCenter.fire("onDrop",r)}break;case"CANCEL":switch(r.type){case"REQUEST":this.notificationsCenter.fire("onCancel",r),r.transaction.createResponse(200,"OK").send(),r.dialog.status=r.dialog.statusCode.CANCEL,r.transaction.createResponse(487,"Request Terminated").send(),r.dialog.status=r.dialog.statusCode.TERMINATED;break;case"RESPONSE":this.notificationsCenter.fire("onDrop",r)}break;case"REFER":this.logger("SIP REFER NOT ALLOWED :"+r.method,"WARNING"),this.notificationsCenter.fire("onDrop",r);break;default:this.logger("SIP DROP :"+r.method+"  code:"+r.code,"WARNING"),this.notificationsCenter.fire("onDrop",r)}},O=function(){this.fire("onStart",this)},A=function(){this.stop()},D={expires:200,maxForward:70,version:"SIP/2.0",userAgent:"nodefony",portServer:"5060",userName:"userName",displayName:"",pwd:"password",transport:"TCP"},N=function(t){function n(t,o,a){var c;return s(this,n),(c=r(this,i(n).call(this,"SIP",null,null,a))).settings=e.extend({},D,a),c.dialogs={},c.version=c.settings.version,c.server=t,c.serverPort=c.settings.portServer,c.authenticate=!1,c.authenticateRegister=null,c.registerInterval=null,c.registerTimeout={},c.registered=null,c.diagRegister=null,c.transport=o,c.transport&&c.initTransport(),c.transportType=c.settings.transport.toLowerCase(),c.contact=null,c.via=null,c}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&o(e,t)}(n,t),c(n,[{key:"generateInvalid",value:function(){return parseInt(1e9*Math.random(),10)+".nodefony.invalid"}},{key:"generateVia",value:function(e){return this.rport?this.version+"/"+this.settings.transport+" "+e+";rport":this.version+"/"+this.settings.transport+" "+e}},{key:"generateContact",value:function(e,t,n,r){if(e&&(this.userName=e,r&&r.displayName?this.displayName=r.displayName:this.displayName=e,this.from='"'+this.displayName+'"<sip:'+this.userName+"@"+this.publicAddress+">",this["request-uri"]="sip:"+this.userName+"@"+this.publicAddress+";transport="+this.transportType,t&&(this.settings.password=t)),!this.contact||n){var i=null;switch(this.transportType){case"ws":case"wss":return i=this.generateInvalid(),this.via=this.generateVia(i),this.rport?'"'+this.displayName+'"<sip:'+this.userName+"@"+i+":"+this.rport+";transport="+this.transportType+">":'"'+this.displayName+'"<sip:'+this.userName+"@"+i+";transport="+this.transportType+">";case"tcp":case"udp":return i=this.generateInvalid(),this.via=this.generateVia(i),this.rport?'"'+this.displayName+'"<sip:'+this.userName+"@"+i+":"+this.rport+";transport="+this.transportType+">":'"'+this.displayName+'"<sip:'+this.userName+"@"+i+";transport="+this.transportType+">";default:throw new Error("SIP TRANSPORT TYPE NOT ALLOWED")}}return this.contact}},{key:"getDialog",value:function(e){return e in this.dialogs?this.dialogs[e]:null}},{key:"initTransport",value:function(e){switch(e&&(this.transport=e),this.transport.publicAddress?(this.publicAddress=this.transport.domain.hostname,this.publicAddress=this.server):this.publicAddress=this.server,this.settings.transport){case"TCP":case"UDP":this.transport.listen(this,"onSubscribe",(function(e,t){"SIP"!==e&&"OPENSIP"!==e||O.call(this,t)})),this.transport.listen(this,"onUnsubscribe",(function(e,t){"SIP"!==e&&"OPENSIP"!==e||A.call(this,t)})),this.transport.listen(this,"onMessage",(function(e,t){"SIP"!==e&&"OPENSIP"!==e||P.call(this,t)})),this.transport.listen(this,"onClose",(function(e){this.quit(e)}));break;case"WS":case"WSS":this.transport.listen(this,"onMessage",(function(e){P.call(this,e.data)})),this.transport.listen(this,"onError",(function(e){this.notificationsCenter.fire("onError",this.transport,e)})),this.transport.listen(this,"onConnect",(function(e){this.connect(e)})),this.transport.listen(this,"onClose",(function(e){this.quit(e)}));break;default:this.fire("onError",new Error("TRANSPORT LAYER NOT DEFINED"))}}},{key:"clear",value:function(){for(var e in this.registerInterval&&clearInterval(this.registerInterval),this.registerTimeout&&(this.clearDialogTimeout(),delete this.registerTimeout),this.dialogs)this.dialogs[e].clear();this.notificationsCenter.clearNotifications()}},{key:"quit",value:function(e){this.fire("onQuit",this,e),this.clear()}},{key:"connect",value:function(e){this.fire("onConnect",this,e)}},{key:"createDialog",value:function(e){var t=new S(e,this);return this.logger("SIP NEW DIALOG :"+t.callId,"DEBUG"),this.dialogs[t.callId]=t,t}},{key:"createDialogTimeout",value:function(e){var t=this;e&&(this.registerTimeout[e.callId]=setTimeout((function(){var n=new Error(" DIALOG ID : "+e.callId+" TIMEOUT : "+e.method+"  no response ");t.logger(n,"ERROR"),t.fire("onError",t,n)}),900*parseInt(this.settings.expires,10)))}},{key:"clearDialogTimeout",value:function(e){if(e){var t=e.callId;this.registerTimeout[t]&&(clearTimeout(this.registerTimeout[t]),delete this.registerTimeout[t])}else for(var n in this.registerTimeout)clearTimeout(this.registerTimeout[n]),delete this.registerTimeout[n]}},{key:"register",value:function(e,t,n){return this.logger("TRY TO REGISTER SIP : "+e+t,"DEBUG"),this.contact=this.generateContact(e,t,!1,n),this.diagRegister=this.createDialog("REGISTER"),this.diagRegister.register(),this.createDialogTimeout(this.diagRegister),this.diagRegister}},{key:"unregister",value:function(){return this.authenticateRegister&&200===this.registered?this.authenticateRegister.unregister():this.diagRegister&&200===this.registered?this.diagRegister.unregister():void 0}},{key:"invite",value:function(e,t){var n=this.createDialog("INVITE"),r=n.invite(e+"@"+this.publicAddress,t);return n.toName=e,this.fire("onInitCall",e,n,r),n}},{key:"notify",value:function(e,t,n){var r=this.createDialog("NOTIFY");return r.notify(e+"@"+this.publicAddress,t,n),r}},{key:"send",value:function(e){this.logger(e,"INFO","SEND"),this.fire("onSend",e),this.transport.send(e)}},{key:"bye",value:function(e){for(var t in this.dialogs)if(e){if(this.dialogs[t].callId===e&&"REGISTER"!==this.dialogs[t].method&&this.dialogs[t].status===this.dialogs[t].statusCode.ESTABLISHED){this.dialogs[t].bye();break}}else this.dialogs[t].bye()}}]),n}(e.Service);return e.io.protocols.sip=N,N}}).call(this,n(0))},function(e,t,n){(function(t){function n(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.exports=function(e){"use strict";var r={},i={moduleName:"REALTIME",defaultSeverity:"INFO"},o=function(e){this.protocol.send(e)},s=function(){function s(t,n){if(function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,s),!t)throw new Error("realtime url server is not defined");this.settings=e.extend({},r,n),this.notificationCenter=e.notificationsCenter.create(this.settings,this),this.syslog=new e.syslog(i),this.url=e.io.urlToOject(t),this.protocol=new e.io.protocols.bayeux(this.url),this.services=null,this.subscribedService={},this.nbSubscribed=0,this.connected=!1,this.publicAddress=null,this.domain=null,this.notificationCenter.listen(this,"onAuthorized",(function(){this.protocol.handshake(this.url.href)})),this.protocol.notificationCenter.listen(this,"onMessage",this.onMessage),this.protocol.notificationCenter.listen(this,"onHandshake",(function(e,t){if(e.ext&&e.ext.address){var n=JSON.parse(e.ext.address);this.publicAddress=n.remoteAddress,this.domain=n.host}this.notificationCenter.fire("onHandshake",e,t,this)})),this.protocol.notificationCenter.listen(this,"onConnect",(function(e){if(this.services=e.data,this.connected=!0,e.ext&&e.ext.address){var t=JSON.parse(e.ext.address);this.publicAddress=t.remoteAddress,this.domain=t.host}this.notificationCenter.fire("onConnect",e,this)})),this.protocol.notificationCenter.listen(this,"onDisconnect",(function(e){this.services=e.data,this.connected=!1,this.notificationCenter.fire("onDisconnect",e,this)})),this.protocol.notificationCenter.listen(this,"reConnect",(function(e){var t=this;setTimeout((function(){t.start()}),6e4)})),this.protocol.notificationCenter.listen(this,"onSubscribe",(function(e){var t=e.subscription.split("/")[2];this.subscribedService[t]=e,this.nbSubscribed++,this.notificationCenter.fire("onSubscribe",t,e,this)})),this.protocol.notificationCenter.listen(this,"onUnsubscribe",(function(e){var t=e.subscription.split("/")[2];delete this.subscribedService[t],this.nbSubscribed--,this.notificationCenter.fire("onUnSubscribe",t,e,this)})),this.protocol.notificationCenter.listen(this,"onError",(function(e,t,n){this.notificationCenter.fire("onError",e,t,n)})),this.protocol.notificationCenter.listen(this,"onClose",(function(e){for(var t in this.connected=!1,this.notificationCenter.fire("onClose",e),this.subscribedService)delete this.subscribedService[t]}))}var a,c,u;return a=s,(c=[{key:"listen",value:function(){return this.notificationCenter.listen.apply(this.notificationCenter,arguments)}},{key:"unListen",value:function(){return this.notificationCenter.unListen.apply(this.notificationCenter,arguments)}},{key:"start",value:function(){var n=this;if(this.connected)return this.notificationCenter.fire("onError",500,this,"connection already started"),!1;var r={401:function(t,r,i){t.getResponseHeader("WWW-Authenticate"),t.responseText;var o={"WWW-Authenticate":t.getResponseHeader("WWW-Authenticate"),body:t.responseText};n.authenticate=new e.io.authentication.authenticate(n.url,o,{ajax:!0,onSuccess:function(e,t,r){n.notificationCenter.fire("onAuthorized",e,t,r)},onError:function(t,r,i){var o=e.io.getHeaderJSON(t);o?n.notificationCenter.fire("onError",401,t,o):n.notificationCenter.fire("onError",401,t,i)}}),n.notificationCenter.fire("onUnauthorized",n.authenticate,n)},404:function(e,t,r){n.notificationCenter.fire("onError",404,e,r)},503:function(e,t,r){n.notificationCenter.fire("onError",503,e,r)}};return t.ajax({method:"GET",cache:!1,url:this.url.href,statusCode:r,success:function(e,t,r){n.notificationCenter.fire("onAuthorized",e,t,r)},error:function(e,t,i){e.status in r||n.notificationCenter.fire("onError",e.status,e,i)}})}},{key:"subscribe",value:function(e,t){return this.connected?e in this.services?e in this.subscribedService?(this.notificationCenter.fire("onError",500,this,"already subscribed"),!1):o.call(this,this.protocol.subscribe(e,t)):(this.notificationCenter.fire("onError",500,this,"service : "+e+" not exist"),!1):(this.notificationCenter.fire("onError",500,this,"Not connected"),!1)}},{key:"unSubscribe",value:function(e,t){if(!this.connected)return this.notificationCenter.fire("onError",500,this,"Not connected"),!1;if(e in this.services){if(e in this.subscribedService){var n=this.subscribedService[e].clientId;return o.call(this,this.protocol.unSubscribe(e,n,t))}return this.notificationCenter.fire("onError",500,this,"service : "+e+" not subcribed"),!1}return this.notificationCenter.fire("onError",404,this,"service : "+e+" not exist"),!1}},{key:"sendMessage",value:function(e,t){if(!this.connected)return this.notificationCenter.fire("onError",500,this,"Not connected"),!1;if(e in this.services){if(!(e in this.subscribedService))return this.notificationCenter.fire("onError",500,this,"service : "+e+" not subcribed"),!1;var n=this.subscribedService[e].clientId;try{var r=this.protocol.sendMessage(e,t,n);return o.call(this,r),JSON.parse(r).id}catch(e){this.fire("onError",500,e,e.message)}}else this.fire("onError",404,this,"service :"+e+" not exit");return!1}},{key:"stop",value:function(){if(this.connected){for(var e in this.protocol.stopReConnect(),this.subscribedService)delete this.subscribedService[e];return o.call(this,this.protocol.disconnect())}throw new Error("connection already stoped")}},{key:"onMessage",value:function(e){e.error?e.channel?this.notificationCenter.fire("onError",e.error):this.notificationCenter.fire("onError",e.id,e.successful):e.channel?this.notificationCenter.fire("onMessage",e.channel.split("/")[2],e.data):this.notificationCenter.fire("onMessage",e.id,e.successful)}}])&&n(a.prototype,c),u&&n(a,u),s}();return e.realtime=s,s}}).call(this,n(0))},function(e,t,n){"use strict";var r={generateIdentifier:function(){return Math.random().toString(36).substr(2,10)}};r.localCName=r.generateIdentifier(),r.splitLines=function(e){return e.trim().split("\n").map((function(e){return e.trim()}))},r.splitSections=function(e){return e.split("\nm=").map((function(e,t){return(t>0?"m="+e:e).trim()+"\r\n"}))},r.getDescription=function(e){var t=r.splitSections(e);return t&&t[0]},r.getMediaSections=function(e){var t=r.splitSections(e);return t.shift(),t},r.matchPrefix=function(e,t){return r.splitLines(e).filter((function(e){return 0===e.indexOf(t)}))},r.parseCandidate=function(e){for(var t,n={foundation:(t=0===e.indexOf("a=candidate:")?e.substring(12).split(" "):e.substring(10).split(" "))[0],component:parseInt(t[1],10),protocol:t[2].toLowerCase(),priority:parseInt(t[3],10),ip:t[4],address:t[4],port:parseInt(t[5],10),type:t[7]},r=8;r<t.length;r+=2)switch(t[r]){case"raddr":n.relatedAddress=t[r+1];break;case"rport":n.relatedPort=parseInt(t[r+1],10);break;case"tcptype":n.tcpType=t[r+1];break;case"ufrag":n.ufrag=t[r+1],n.usernameFragment=t[r+1];break;default:n[t[r]]=t[r+1]}return n},r.writeCandidate=function(e){var t=[];t.push(e.foundation),t.push(e.component),t.push(e.protocol.toUpperCase()),t.push(e.priority),t.push(e.address||e.ip),t.push(e.port);var n=e.type;return t.push("typ"),t.push(n),"host"!==n&&e.relatedAddress&&e.relatedPort&&(t.push("raddr"),t.push(e.relatedAddress),t.push("rport"),t.push(e.relatedPort)),e.tcpType&&"tcp"===e.protocol.toLowerCase()&&(t.push("tcptype"),t.push(e.tcpType)),(e.usernameFragment||e.ufrag)&&(t.push("ufrag"),t.push(e.usernameFragment||e.ufrag)),"candidate:"+t.join(" ")},r.parseIceOptions=function(e){return e.substr(14).split(" ")},r.parseRtpMap=function(e){var t=e.substr(9).split(" "),n={payloadType:parseInt(t.shift(),10)};return t=t[0].split("/"),n.name=t[0],n.clockRate=parseInt(t[1],10),n.channels=3===t.length?parseInt(t[2],10):1,n.numChannels=n.channels,n},r.writeRtpMap=function(e){var t=e.payloadType;void 0!==e.preferredPayloadType&&(t=e.preferredPayloadType);var n=e.channels||e.numChannels||1;return"a=rtpmap:"+t+" "+e.name+"/"+e.clockRate+(1!==n?"/"+n:"")+"\r\n"},r.parseExtmap=function(e){var t=e.substr(9).split(" ");return{id:parseInt(t[0],10),direction:t[0].indexOf("/")>0?t[0].split("/")[1]:"sendrecv",uri:t[1]}},r.writeExtmap=function(e){return"a=extmap:"+(e.id||e.preferredId)+(e.direction&&"sendrecv"!==e.direction?"/"+e.direction:"")+" "+e.uri+"\r\n"},r.parseFmtp=function(e){for(var t,n={},r=e.substr(e.indexOf(" ")+1).split(";"),i=0;i<r.length;i++)n[(t=r[i].trim().split("="))[0].trim()]=t[1];return n},r.writeFmtp=function(e){var t="",n=e.payloadType;if(void 0!==e.preferredPayloadType&&(n=e.preferredPayloadType),e.parameters&&Object.keys(e.parameters).length){var r=[];Object.keys(e.parameters).forEach((function(t){e.parameters[t]?r.push(t+"="+e.parameters[t]):r.push(t)})),t+="a=fmtp:"+n+" "+r.join(";")+"\r\n"}return t},r.parseRtcpFb=function(e){var t=e.substr(e.indexOf(" ")+1).split(" ");return{type:t.shift(),parameter:t.join(" ")}},r.writeRtcpFb=function(e){var t="",n=e.payloadType;return void 0!==e.preferredPayloadType&&(n=e.preferredPayloadType),e.rtcpFeedback&&e.rtcpFeedback.length&&e.rtcpFeedback.forEach((function(e){t+="a=rtcp-fb:"+n+" "+e.type+(e.parameter&&e.parameter.length?" "+e.parameter:"")+"\r\n"})),t},r.parseSsrcMedia=function(e){var t=e.indexOf(" "),n={ssrc:parseInt(e.substr(7,t-7),10)},r=e.indexOf(":",t);return r>-1?(n.attribute=e.substr(t+1,r-t-1),n.value=e.substr(r+1)):n.attribute=e.substr(t+1),n},r.parseSsrcGroup=function(e){var t=e.substr(13).split(" ");return{semantics:t.shift(),ssrcs:t.map((function(e){return parseInt(e,10)}))}},r.getMid=function(e){var t=r.matchPrefix(e,"a=mid:")[0];if(t)return t.substr(6)},r.parseFingerprint=function(e){var t=e.substr(14).split(" ");return{algorithm:t[0].toLowerCase(),value:t[1]}},r.getDtlsParameters=function(e,t){return{role:"auto",fingerprints:r.matchPrefix(e+t,"a=fingerprint:").map(r.parseFingerprint)}},r.writeDtlsParameters=function(e,t){var n="a=setup:"+t+"\r\n";return e.fingerprints.forEach((function(e){n+="a=fingerprint:"+e.algorithm+" "+e.value+"\r\n"})),n},r.getIceParameters=function(e,t){var n=r.splitLines(e);return{usernameFragment:(n=n.concat(r.splitLines(t))).filter((function(e){return 0===e.indexOf("a=ice-ufrag:")}))[0].substr(12),password:n.filter((function(e){return 0===e.indexOf("a=ice-pwd:")}))[0].substr(10)}},r.writeIceParameters=function(e){return"a=ice-ufrag:"+e.usernameFragment+"\r\na=ice-pwd:"+e.password+"\r\n"},r.parseRtpParameters=function(e){for(var t={codecs:[],headerExtensions:[],fecMechanisms:[],rtcp:[]},n=r.splitLines(e)[0].split(" "),i=3;i<n.length;i++){var o=n[i],s=r.matchPrefix(e,"a=rtpmap:"+o+" ")[0];if(s){var a=r.parseRtpMap(s),c=r.matchPrefix(e,"a=fmtp:"+o+" ");switch(a.parameters=c.length?r.parseFmtp(c[0]):{},a.rtcpFeedback=r.matchPrefix(e,"a=rtcp-fb:"+o+" ").map(r.parseRtcpFb),t.codecs.push(a),a.name.toUpperCase()){case"RED":case"ULPFEC":t.fecMechanisms.push(a.name.toUpperCase())}}}return r.matchPrefix(e,"a=extmap:").forEach((function(e){t.headerExtensions.push(r.parseExtmap(e))})),t},r.writeRtpDescription=function(e,t){var n="";n+="m="+e+" ",n+=t.codecs.length>0?"9":"0",n+=" UDP/TLS/RTP/SAVPF ",n+=t.codecs.map((function(e){return void 0!==e.preferredPayloadType?e.preferredPayloadType:e.payloadType})).join(" ")+"\r\n",n+="c=IN IP4 0.0.0.0\r\n",n+="a=rtcp:9 IN IP4 0.0.0.0\r\n",t.codecs.forEach((function(e){n+=r.writeRtpMap(e),n+=r.writeFmtp(e),n+=r.writeRtcpFb(e)}));var i=0;return t.codecs.forEach((function(e){e.maxptime>i&&(i=e.maxptime)})),i>0&&(n+="a=maxptime:"+i+"\r\n"),n+="a=rtcp-mux\r\n",t.headerExtensions&&t.headerExtensions.forEach((function(e){n+=r.writeExtmap(e)})),n},r.parseRtpEncodingParameters=function(e){var t,n=[],i=r.parseRtpParameters(e),o=-1!==i.fecMechanisms.indexOf("RED"),s=-1!==i.fecMechanisms.indexOf("ULPFEC"),a=r.matchPrefix(e,"a=ssrc:").map((function(e){return r.parseSsrcMedia(e)})).filter((function(e){return"cname"===e.attribute})),c=a.length>0&&a[0].ssrc,u=r.matchPrefix(e,"a=ssrc-group:FID").map((function(e){return e.substr(17).split(" ").map((function(e){return parseInt(e,10)}))}));u.length>0&&u[0].length>1&&u[0][0]===c&&(t=u[0][1]),i.codecs.forEach((function(e){if("RTX"===e.name.toUpperCase()&&e.parameters.apt){var r={ssrc:c,codecPayloadType:parseInt(e.parameters.apt,10)};c&&t&&(r.rtx={ssrc:t}),n.push(r),o&&((r=JSON.parse(JSON.stringify(r))).fec={ssrc:c,mechanism:s?"red+ulpfec":"red"},n.push(r))}})),0===n.length&&c&&n.push({ssrc:c});var l=r.matchPrefix(e,"b=");return l.length&&(l=0===l[0].indexOf("b=TIAS:")?parseInt(l[0].substr(7),10):0===l[0].indexOf("b=AS:")?1e3*parseInt(l[0].substr(5),10)*.95-16e3:void 0,n.forEach((function(e){e.maxBitrate=l}))),n},r.parseRtcpParameters=function(e){var t={},n=r.matchPrefix(e,"a=ssrc:").map((function(e){return r.parseSsrcMedia(e)})).filter((function(e){return"cname"===e.attribute}))[0];n&&(t.cname=n.value,t.ssrc=n.ssrc);var i=r.matchPrefix(e,"a=rtcp-rsize");t.reducedSize=i.length>0,t.compound=0===i.length;var o=r.matchPrefix(e,"a=rtcp-mux");return t.mux=o.length>0,t},r.parseMsid=function(e){var t,n=r.matchPrefix(e,"a=msid:");if(1===n.length)return{stream:(t=n[0].substr(7).split(" "))[0],track:t[1]};var i=r.matchPrefix(e,"a=ssrc:").map((function(e){return r.parseSsrcMedia(e)})).filter((function(e){return"msid"===e.attribute}));return i.length>0?{stream:(t=i[0].value.split(" "))[0],track:t[1]}:void 0},r.parseSctpDescription=function(e){var t,n=r.parseMLine(e),i=r.matchPrefix(e,"a=max-message-size:");i.length>0&&(t=parseInt(i[0].substr(19),10)),isNaN(t)&&(t=65536);var o=r.matchPrefix(e,"a=sctp-port:");if(o.length>0)return{port:parseInt(o[0].substr(12),10),protocol:n.fmt,maxMessageSize:t};if(r.matchPrefix(e,"a=sctpmap:").length>0){var s=r.matchPrefix(e,"a=sctpmap:")[0].substr(10).split(" ");return{port:parseInt(s[0],10),protocol:s[1],maxMessageSize:t}}},r.writeSctpDescription=function(e,t){var n=[];return n="DTLS/SCTP"!==e.protocol?["m="+e.kind+" 9 "+e.protocol+" "+t.protocol+"\r\n","c=IN IP4 0.0.0.0\r\n","a=sctp-port:"+t.port+"\r\n"]:["m="+e.kind+" 9 "+e.protocol+" "+t.port+"\r\n","c=IN IP4 0.0.0.0\r\n","a=sctpmap:"+t.port+" "+t.protocol+" 65535\r\n"],void 0!==t.maxMessageSize&&n.push("a=max-message-size:"+t.maxMessageSize+"\r\n"),n.join("")},r.generateSessionId=function(){return Math.random().toString().substr(2,21)},r.writeSessionBoilerplate=function(e,t,n){var i=void 0!==t?t:2;return"v=0\r\no="+(n||"thisisadapterortc")+" "+(e||r.generateSessionId())+" "+i+" IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n"},r.writeMediaSection=function(e,t,n,i){var o=r.writeRtpDescription(e.kind,t);if(o+=r.writeIceParameters(e.iceGatherer.getLocalParameters()),o+=r.writeDtlsParameters(e.dtlsTransport.getLocalParameters(),"offer"===n?"actpass":"active"),o+="a=mid:"+e.mid+"\r\n",e.direction?o+="a="+e.direction+"\r\n":e.rtpSender&&e.rtpReceiver?o+="a=sendrecv\r\n":e.rtpSender?o+="a=sendonly\r\n":e.rtpReceiver?o+="a=recvonly\r\n":o+="a=inactive\r\n",e.rtpSender){var s="msid:"+i.id+" "+e.rtpSender.track.id+"\r\n";o+="a="+s,o+="a=ssrc:"+e.sendEncodingParameters[0].ssrc+" "+s,e.sendEncodingParameters[0].rtx&&(o+="a=ssrc:"+e.sendEncodingParameters[0].rtx.ssrc+" "+s,o+="a=ssrc-group:FID "+e.sendEncodingParameters[0].ssrc+" "+e.sendEncodingParameters[0].rtx.ssrc+"\r\n")}return o+="a=ssrc:"+e.sendEncodingParameters[0].ssrc+" cname:"+r.localCName+"\r\n",e.rtpSender&&e.sendEncodingParameters[0].rtx&&(o+="a=ssrc:"+e.sendEncodingParameters[0].rtx.ssrc+" cname:"+r.localCName+"\r\n"),o},r.getDirection=function(e,t){for(var n=r.splitLines(e),i=0;i<n.length;i++)switch(n[i]){case"a=sendrecv":case"a=sendonly":case"a=recvonly":case"a=inactive":return n[i].substr(2)}return t?r.getDirection(t):"sendrecv"},r.getKind=function(e){return r.splitLines(e)[0].split(" ")[0].substr(2)},r.isRejected=function(e){return"0"===e.split(" ",2)[1]},r.parseMLine=function(e){var t=r.splitLines(e)[0].substr(2).split(" ");return{kind:t[0],port:parseInt(t[1],10),protocol:t[2],fmt:t.slice(3).join(" ")}},r.parseOLine=function(e){var t=r.matchPrefix(e,"o=")[0].substr(2).split(" ");return{username:t[0],sessionId:t[1],sessionVersion:parseInt(t[2],10),netType:t[3],addressType:t[4],address:t[5]}},r.isValidSDP=function(e){if("string"!=typeof e||0===e.length)return!1;for(var t=r.splitLines(e),n=0;n<t.length;n++)if(t[n].length<2||"="!==t[n].charAt(1))return!1;return!0},e.exports=r},function(e,t){function n(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.exports=function(e){"use strict";var t=null,r=(function(){try{if(e.browser.Webkit)return t=function(e){try{return URL.createObjectURL(e)}catch(t){return e}},webkitMediaStream,webkitMediaStream.prototype.getVideoTracks||(webkitMediaStream.prototype.getVideoTracks=function(){return this.videoTracks},webkitMediaStream.prototype.getAudioTracks=function(){return this.audioTracks}),!0;if(e.browser.Gecko)return t=function(e){try{return window.URL.createObjectURL(e)}catch(t){return e}},i,i&&!i.prototype.getVideoTracks&&(i.prototype.getVideoTracks=function(){return[]}),i&&!i.prototype.getAudioTracks&&(i.prototype.getAudioTracks=function(){return[]}),!0;if(e.browser.Opera)return t=function(e){return e},i.prototype.getVideoTracks||(i.prototype.getVideoTracks=function(){return[]}),i.prototype.getAudioTracks||(i.prototype.getAudioTracks=function(){return[]}),!0;console.error("Browser does not appear to be mediaStream-capable")}catch(e){console.error(e)}}(),{audio:!0,video:!0}),i=function(){function i(n,o){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,i),this.settings=e.extend({},r,o),this.notificationsCenter=e.notificationsCenter.create(this.settings,this),this.urlStream=null,this.stream=this.settings.stream?this.setStream(this.settings.stream):null,this.mediaElement=n||null,this.getMediaStream=t}var o,s,a;return o=i,(s=[{key:"getUserMedia",value:function(t,n,i){var o=this;return t&&(this.settings=e.extend({},r,t),this.notificationsCenter.settingsToListen(t)),navigator.getUserMedia({video:this.settings.video,audio:this.settings.audio},(function(e){o.setStream(e),n&&n(o),o.notificationsCenter.fire("onSucces",e,o)}),(function(e){i&&i(e),o.notificationsCenter.listen(o,"onError")}))}},{key:"setStream",value:function(e){return this.stream=e,this.urlStream=this.getMediaStream(e),this.videotracks=this.getVideoTracks(),this.audiotracks=this.getAudioTracks(),e}},{key:"stop",value:function(){this.stream&&this.stream.stop()}},{key:"attachMediaStream",value:function(e){this.mediaElement=e||this.mediaElement,this.mediaElement.srcObject=this.stream,this.mediaElement.play()}},{key:"reattachMediaStream",value:function(e){this.stream=e,this.attachMediaStream(this.mediaElement)}},{key:"getVideoTracks",value:function(){return this.stream.getVideoTracks()}},{key:"getAudioTracks",value:function(){return this.stream.getAudioTracks()}}])&&n(o.prototype,s),a&&n(o,a),i}();return e.extend(e.media,{mediaStream:i}),e.media}},function(e,t){function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function i(e,t,n){return t&&r(e.prototype,t),n&&r(e,n),e}e.exports=function(e){"use strict";var t=null,r=!!(t=window.AudioContext||window.webkitAudioContext),o={},s=function(){function t(r){n(this,t),this.audioBus={},this.nbBus=0,this.settings=e.extend({},o,r),this.eventsManager=new e.notificationsCenter.create(this.settings,this),this.createAudioBus("MASTER",{panner:!0,analyser:!0}),this.masterBus=this.audioBus.MASTER,this.tracks=this.masterBus.tracks,this.audioContext=this.masterBus.audioContext,this.muted=this.masterBus.muted,this.panner=this.masterBus.audioNodes.panner,this.analyserLeft=this.masterBus.audioNodes.analyserLeft,this.analyserRight=this.masterBus.audioNodes.analyserRight,this.gain=this.masterBus.audioNodes.gain,this.connect(this.audioContext.destination)}return i(t,[{key:"listen",value:function(){return this.eventsManager.listen.apply(this.eventsManager,arguments)}},{key:"unListen",value:function(){return this.eventsManager.unListen.apply(this.eventsManager,arguments)}},{key:"fire",value:function(){return this.eventsManager.fire.apply(this.eventsManager,arguments)}},{key:"createAudioBus",value:function(e,t){var n=null;try{n=new c(e,this,t)}catch(e){throw e}return this.audioBus[e]=n,this.nbBus++,n.listen(this,"onCreateTrack",(function(e,t){this.fire("onCreateTrack",e,t,this)})),n.listen(this,"onRemoveTrack",(function(e,t){this.fire("onRemoveTrack",e,t,this)})),n}},{key:"removeAudioBus",value:function(e){switch(!0){case e instanceof c:break;case"number"==typeof track:case"string"==typeof track:}throw new Error("remove bus : this bus doesn't exist in  mixer  ")}},{key:"connect",value:function(e){this.destination=e;var t=this.masterBus.connect(e);return this.fire("onConnect",e,this),t}},{key:"disconnect",value:function(){this.masterBus.disconnect(),this.destination=null,this.fire("onDisconnect",this)}},{key:"setGain",value:function(e){return this.masterBus.setGain(e),this}},{key:"getGain",value:function(){return this.masterBus.getGain()}},{key:"mute",value:function(){return this.masterBus.mute(),this.muted=this.masterBus.muted,this}},{key:"unmute",value:function(){return this.masterBus.unmute(),this.muted=this.masterBus.muted,this}},{key:"createTrack",value:function(e,t){return this.masterBus.createTrack(e,t)}},{key:"removeTrack",value:function(e){return this.masterBus.removeTrack(e)}},{key:"playTracks",value:function(e,t){for(var n=0;n<this.tracks.length;n++)this.tracks[n].play(e,t)}},{key:"createGain",value:function(){return this.audioContext.createGain()}},{key:"createPanner",value:function(){return this.audioContext.createPanner()}},{key:"createStereoPanner",value:function(){return this.audioContext.createStereoPanner()}},{key:"createFilter",value:function(){return this.audioContext.createBiquadFilter()}},{key:"createAnalyser",value:function(){return this.audioContext.createAnalyser()}},{key:"createChannelSplitter",value:function(e){return this.audioContext.createChannelSplitter(e)}},{key:"createChannelMerger",value:function(e){return this.audioContext.createChannelMerger(e)}},{key:"createOscillator",value:function(){return this.audioContext.createOscillator()}}]),t}(),a={panner:!1,analyser:!1},c=function(){function r(i,o,s){n(this,r),this.name=i,this.mixer=o,this.settings=e.extend({},a,s),this.eventsManager=e.notificationsCenter.create(this.settings,this),this.audioContext=new t,this.tracks=[],this.nbTracks=0,this.audioNodes={},this.in=null,this.out=null,this.destination=null,this.muted=!1,this.createNodes()}return i(r,[{key:"listen",value:function(){return this.eventsManager.listen.apply(this.eventsManager,arguments)}},{key:"unListen",value:function(){return this.eventsManager.unListen.apply(this.eventsManager,arguments)}},{key:"fire",value:function(){return this.eventsManager.fire.apply(this.eventsManager,arguments)}},{key:"createNodes",value:function(){this.audioNodes.mute=this.createGain(),this.in=this.audioNodes.mute,this.audioNodes.gain=this.createGain(),this.in.connect(this.audioNodes.gain),this.out=this.audioNodes.gain,this.settings.analyser&&(this.audioNodes.splitter=this.createChannelSplitter(2),this.out.connect(this.audioNodes.splitter),this.audioNodes.analyserLeft=this.createAnalyser(),this.audioNodes.analyserLeft.smoothingTimeConstant=.85,this.audioNodes.splitter.connect(this.audioNodes.analyserLeft,0,0),this.audioNodes.analyserRight=this.createAnalyser(),this.audioNodes.analyserRight.smoothingTimeConstant=.85,this.audioNodes.splitter.connect(this.audioNodes.analyserRight,1,0)),this.settings.panner&&(this.audioNodes.panner=this.createStereoPanner(),this.out.connect(this.audioNodes.panner),this.out=this.audioNodes.panner)}},{key:"connect",value:function(e){this.destination=e,this.out.connect(e),this.fire("onConnect",e,this)}},{key:"disconnect",value:function(){this.destination&&(this.out.disconnect(this.destination),this.destination=null,this.fire("onDisconnect",this))}},{key:"setGain",value:function(e){return this.audioNodes.gain.gain.setValueAtTime(e,this.audioContext.currentTime+1),this.fire("onSetGain",e),this}},{key:"getGain",value:function(){return this.audioNodes.gain.gain.value}},{key:"mute",value:function(){return this.audioNodes.mute.gain.setValueAtTime(0,this.audioContext.currentTime+1),this.muted=!0,this.fire("onMute",this),this}},{key:"unmute",value:function(){return this.audioNodes.mute.gain.setValueAtTime(1,this.audioContext.currentTime+1),this.muted=!1,this.fire("onUnMute",this),this}},{key:"createGain",value:function(){return this.audioContext.createGain()}},{key:"createPanner",value:function(){return this.audioContext.createPanner()}},{key:"createStereoPanner",value:function(){return this.audioContext.createStereoPanner()}},{key:"createFilter",value:function(){return this.audioContext.createBiquadFilter()}},{key:"createAnalyser",value:function(){return this.audioContext.createAnalyser()}},{key:"createChannelSplitter",value:function(e){return this.audioContext.createChannelSplitter(e)}},{key:"createChannelMerger",value:function(e){return this.audioContext.createChannelMerger(e)}},{key:"createOscillator",value:function(){return this.audioContext.createOscillator()}},{key:"createMediaStreamDestination",value:function(){var e=this.audioContext.createMediaStreamDestination();return this.disconnect(),this.connect(e),e}},{key:"createTrack",value:function(e,t){var n=new l(e,this,t);return this.tracks.push(n),this.nbTracks++,this.fire("onCreateTrack",n,this),n}},{key:"removeTrack",value:function(e){var t=null,n=null;switch(!0){case e instanceof l:for(var r=0;r<this.tracks.length;r++)if(this.tracks[r]===e){n=e.name,e.pause(),e.disconnect(),t=this.tracks.splice(r,1),this.nbTracks--,this.fire("onRemoveTrack",t[0],this),delete t[0];break}break;case"number"==typeof e:case"string"==typeof e:n=e;for(var i=0;i<this.tracks.length;i++)if(this.tracks[i].name===n){this.tracks[i].pause(),this.tracks[i].disconnect(),t=this.tracks.splice(i,1),this.nbTracks--,this.fire("onRemoveTrack",t[0],this),delete t[0];break}}if(!t)throw new Error("this track doesn't exist in  bus : "+this.name);return!0}}]),r}(),u={gain:!0,panner:!0,filter:!1,analyser:!1,connect:!0},l=function(){function t(r,i,o){var s=this;n(this,t),this.media=r,this.bus=i,this.settings=e.extend({},u,o),this.audioNodes={},this.audioBus={},this.transport=null,this.context=i.audioContext,this.source=null,this.buffer=null,this.out=null,this.in=null,this.name=this.settings.name,this.id=this.generateId(),this.sync=0,this.retry=0,this.ready=!1,this.muted=!1,this.currentTime=0,this.eventsManager=e.notificationsCenter.create(this.settings,this),this.createNodes(),this.settings.connect&&this.connect(this.bus.in),this.listen(this,"onReady",(function(){this.bus.mixer.fire("onReadyTrack",this.bus,this)}));var a=null;switch(e.typeOf(r)){case"object":switch(!0){case r instanceof e.media.mediaStream:this.mediaType="stream",this.buffer=r.stream,this.url=e.io.urlToOject(r.urlStream),this.ready=!0,this.fire("onReady",this);break;case r instanceof AudioNode:this.mediaType="audioNode",this.buffer=r,this.ready=!0,this.fire("onReady",this);break;default:throw a=new Error("media type not allowed "),this.fire("onError",a),a}break;case"element":this.mediaType="element",this.media.oncanplay=function(){s.connectSource(s.media),s.ready=!0,s.fire("onReady",s)};break;case"string":this.url=e.io.urlToOject(r),this.load(r);break;default:throw a=new Error("Track media type error"),this.fire("onError",a),a}}return i(t,[{key:"generateId",value:function(){return parseInt(1e9*Math.random(),10)}},{key:"setName",value:function(e){this.name=e}},{key:"listen",value:function(){return this.eventsManager.listen.apply(this.eventsManager,arguments)}},{key:"unListen",value:function(){return this.eventsManager.unListen.apply(this.eventsManager,arguments)}},{key:"fire",value:function(){return this.eventsManager.fire.apply(this.eventsManager,arguments)}},{key:"createNodes",value:function(){this.audioNodes.mute=this.bus.createGain(),this.in=this.audioNodes.mute,this.out=this.audioNodes.mute,this.settings.gain&&(this.audioNodes.gain=this.bus.createGain(),this.out.connect(this.audioNodes.gain),this.out=this.audioNodes.gain),this.settings.filter&&(this.audioNodes.filter=this.bus.createFilter(),this.out.connect(this.audioNodes.filter),this.out=this.audioNodes.filter),this.settings.panner&&(this.audioNodes.panner=this.bus.createStereoPanner(),this.out.connect(this.audioNodes.panner),this.out=this.audioNodes.panner),this.settings.analyser&&(this.audioNodes.analyser=this.bus.createAnalyser(),this.audioNodes.analyser.smoothingTimeConstant=.85,this.out.connect(this.audioNodes.analyser))}},{key:"setGain",value:function(e){return this.audioNodes.gain.gain.setValueAtTime(e,this.context.currentTime+1),this.fire("onSetGain",e),this}},{key:"getGain",value:function(){return this.audioNodes.gain.gain.value}},{key:"mute",value:function(){return this.audioNodes.mute.gain.setValueAtTime(0,this.context.currentTime+1),this.muted=!0,this.fire("onMute",this),this}},{key:"unmute",value:function(){return this.audioNodes.mute.gain.setValueAtTime(1,this.context.currentTime+1),this.muted=!1,this.fire("onUnMute",this),this}},{key:"pause",value:function(e){switch(this.mediaType){case"element":this.media.pause(),this.fire("onPause",this);break;default:this.source&&(this.source.node&&this.source.playbackState===this.source.node.PLAYING_STATE&&this.source.node.stop(e||0),this.disconnectSource(),this.fire("onPause",this))}return this}},{key:"play",value:function(e,t){switch(this.mediaType){case"element":this.media.play(),this.fire("onPlay",this);break;default:this.pause().connectSource(),t&&(this.source.loop=!0),this.source.noteOn&&this.source.noteOn(this.context.currentTime,e),this.source.start&&this.source.start(this.context.currentTime,e)}return this.fire("onPlay",this),this}},{key:"connectSource",value:function(){this.source=this.createSource(),this.source.connect(this.in)}},{key:"disconnectSource",value:function(){this.source.disconnect(this.in),this.source=null,this.fire("onDisconnectSource",this)}},{key:"connect",value:function(e){this.destination=e,this.out.connect(e),this.fire("onConnect",e,this)}},{key:"disconnect",value:function(){this.out.disconnect(this.destination),this.destination=null,this.fire("onDisconnect",this)}},{key:"createSource",value:function(e){var t=this,n=null;switch(this.mediaType){case"audioNode":n=e||this.buffer;break;case"video":case"audio":(n=this.context.createBufferSource()).buffer=e||this.buffer;break;case"decode":this.rawBuffer=e,this.urlStream=URL.createObjectURL(new Blob([this.rawBuffer])),this.context.decodeAudioData(e,(function(e){t.buffer=e,t.ready=!0,t.fire("onReady",t)}),(function(e){t.eventsManager.fire("onError",t,e)}));break;case"stream":n=this.context.createMediaStreamSource(e||this.buffer);break;case"element":n=this.context.createMediaElementSource(this.media)}return n}},{key:"syncStream",value:function(){var e=new Uint8Array(this.buffer);Uint8Array.prototype.indexOf=Array.prototype.indexOf;for(var t=this.sync,n=e;this.retry++,!(-1===(t=n.indexOf(255,t))||!0&n[t+1]);)t++;if(-1!==t){var r=this.buffer.slice(t);return delete this.buffer,this.buffer=null,this.buffer=r,this.sync=t,!0}return!1}},{key:"load",value:function(e){var t=this;this.transport=new XMLHttpRequest,this.transport.open("GET",e,!0),this.transport.responseType="arraybuffer",this.transport.onload=function(){switch(t.mediaType="decode",t.createSource(t.transport.response),t.contentType=t.transport.getResponseHeader("content-type").split(";")[0],t.contentType){case/audio\/.*/.test(t.contentType)?t.contentType:null:t.mediaType="audio";break;case/video\/.*/.test(t.contentType)?t.contentType:null:t.mediaType="video"}},this.transport.onerror=function(){console.error("BufferLoader: XHR error")},this.transport.send()}}]),t}();return e.extend(e.media,{webAudioApi:r,mediaMix:s,Track:l,audioBus:c}),e.media}},function(e,t,n){"use strict";function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function i(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function o(e,t){return!t||"object"!==r(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function s(e){return(s=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function a(e,t){return(a=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}e.exports=function(e){var t={audio:!0,video:!0,protocol:"SIP",sipPort:5060,sipTransport:"WSS",dtmf:"SIP-INFO",iceServers:[],optional:e.browser.Gecko?{DtlsSrtpKeyAgreement:"true"}:{DtlsSrtpKeyAgreement:"true",rtcpMuxPolicy:"negotiate"},asyncCandidates:!1},n=function(n){function r(n,i,a){var c;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,r),(c=o(this,s(r).call(this,"WEBRTC",null,null,a))).settings=e.extend(!0,{},t,a),c.settings.optional.iceServers=c.settings.iceServers,c.protocol=null,c.socketState="close",c.transactions={},c.transport=c.connect(i),c.transport&&c.transport.publicAddress&&(c.publicAddress=c.transport.publicAddress),c.server=n,c.init(),c}var c,u,l;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&a(e,t)}(r,n),c=r,(u=[{key:"init",value:function(){switch(delete this.protocol,this.protocol=null,this.listen(this,"onInvite",(function(e,t,n){this.transactions[e.callId]=e})),this.listen(this,"onOffer",(function(e,t){this.transactions[t.callId]=t})),this.listen(this,"onAccept",(function(e,t){t.doAnswer(t.dialog)})),this.listen(this,"onDeclineOffer",(function(e,t){t.dialog.currentTransaction.createResponse(603,"Declined").send(),this.closeTransaction(t)})),this.settings.protocol){case"SIP":this.protocol=new e.io.protocols.sip(this.server,this.transport,{portServer:this.settings.sipPort,transport:this.settings.sipTransport}),this.protocol.listen(this,"onRegister",(function(e,t){var n=this;switch(t.code){case 200:this.user.createMediaStream((function(e){n.user.stream=e,n.notificationsCenter.fire("onMediaSucces",n.user.mediaStream,n.user)}),(function(e){n.notificationsCenter.fire("onError",n,e)})),this.notificationsCenter.fire("onRegister",this.user,this);break;default:this.notificationsCenter.fire("onError",this.protocol,t)}})),this.protocol.listen(this,"onUnRegister",(function(e,t){this.fire("onUnRegister",e,t)})),this.protocol.listen(this,"onRinging",(function(e,t){var n=this.transactions[t.callId];n&&this.notificationsCenter.fire("onRinging",t.toName,n)})),this.protocol.listen(this,"onTrying",(function(e,t){var n=this.transactions[t.callId];n&&this.notificationsCenter.fire("onTrying",t.toName,n)})),this.protocol.listen(this,"onInfo",(function(e){var t=this.transactions[e.callId];"application/dtmf-relay"===e.contentType&&this.fire("onDtmf",e.body.dtmf,t)})),this.protocol.listen(this,"onCancel",(function(e){var t=this.transactions[e.callId];t&&(this.notificationsCenter.fire("onCancel",e.body.body,t),this.closeTransaction(t,e.fromName))})),this.protocol.listen(this,"onInvite",(function(e,t){var n=this,r=null,i=null;switch(e.header["Content-Type"]){case"application/sdp":if(e.rawBody){if(t.status===t.statusCode.INITIAL){(r=e.transaction.createResponse(100,"trying")).send();try{(i=this.createTransaction(e.fromName,t,{displayName:e.fromNameDisplay||""})).to.setDescription(e.rawBody)}catch(t){return void(r=e.transaction.createResponse(500,t.message||t)).send()}(r=e.transaction.createResponse(180,"Ringing")).send();try{i.setRemoteDescription("offer",i.to,i.to.description,i.dialog)}catch(t){(r=e.transaction.createResponse(500,t.message||t)).send()}return}t.status===t.statusCode.ESTABLISHED&&e.transaction.decline()}break;case"ice/candidate":if(e.rawBody){var o=this.transactions[e.callId];if(!o)return void e.transaction.createResponse(500,"no transaction ").send();r=JSON.parse(e.rawBody),e.transaction.createResponse(100,"trying").send();for(var s=function(e){c=new RTCIceCandidate(r[e]),o.RTCPeerConnection.addIceCandidate(c,(function(){n.logger("WEBRTC remote CANDIDATES   "+r[e].candidate,"DEBUG")}),(function(t){console.log(t),n.logger("WEBRTC Error CANDIDATES "+r[e].candidate,"ERROR")}))},a=0;a<r.length;a++){var c;s(a)}o.candidates.length?(e.transaction.createResponse(200,"OK",JSON.stringify(o.candidates),"ice/candidate").send(),o.candidates=[]):e.transaction.createResponse(200,"OK").send()}break;default:this.notificationsCenter.fire("onError",this.protocol,e)}})),this.protocol.listen(this,"onTimeout",(function(e,t){this.notificationsCenter.fire("onTimeout",t.method,408,t);var n=this.transactions[t.callId];n&&this.closeTransaction(n,n.to.name)})),this.protocol.listen(this,"onDecline",(function(e){if(e.callId in this.transactions){var t=this.transactions[e.callId];this.fire("onDecline",this,t),this.closeTransaction(t)}})),this.protocol.listen(this,"onError",(function(e,t){this.notificationsCenter.fire("onError",e,t);var n=this.transactions[t.callId];n&&this.closeTransaction(n,n.to.name)})),this.protocol.listen(this,"onQuit",(function(e){this.fire("onQuit",this),this.close()})),this.protocol.listen(this,"onInitCall",(function(e,t,n){if(t.callId in this.transactions){var r=this.transactions[t.callId];r.currentTransaction=n,this.notificationsCenter.fire("onInitCall",r)}})),this.protocol.listen(this,"onBye",(function(e){var t=null,n=null;e.callId in this.transactions&&(t=this.transactions[e.callId],n=e.fromName),t?(this.notificationsCenter.fire("onOnHook",t,e),this.closeTransaction(t,n)):e.fromName===this.user.name&&this.close()})),this.protocol.listen(this,"onCall",(function(e){var t=this,n=this.transactions[e.callId];if(e.toNameDisplay&&(n.to.displayName=e.toNameDisplay),e.dialog.status===e.dialog.statusCode.EARLY&&"application/sdp"===e.header["Content-Type"]&&(this.notificationsCenter.fire("onAnwer",e),n.to.setDescription(e.rawBody),n.setRemoteDescription("answer",n.to,e.rawBody,e.dialog)),"ice/candidate"===e.header["Content-Type"]&&n.candidates.length)for(var r=JSON.parse(e.rawBody),i=function(e){s=new RTCIceCandidate(r[e]),n.RTCPeerConnection.addIceCandidate(s,(function(){t.logger("WEBRTC ADD remote CANDIDATES :  "+r[e].candidate)}),(function(n){console.log(n),t.logger("WEBRTC Error CANDIDATES "+r[e].candidate,"ERROR")}))},o=0;o<r.length;o++){var s;i(o)}})),this.protocol.listen(this,"onMessage",(function(e){this.fire("onMessage",e)})),this.protocol.listen(this,"onSend",(function(e){this.fire("onSend",e)})),this.listen(this,"onError",(function(t,n){switch(!0){case t instanceof r:break;case t instanceof e.media.webrtcTransaction:t.currentTransaction&&t.currentTransaction.createResponse(500,n.message||n).send(),this.closeTransaction(t,t.to.name);break;case t instanceof Error:}}));break;default:throw new Error("WEBRTC Protocol not found ")}}},{key:"connect",value:function(e){if(e)return e.listen(this,"onConnect",(function(){this.socketState="open"})),e.listen(this,"onClose",(function(){this.socketState="close"})),e}},{key:"createTransaction",value:function(t,n,r){try{return new e.media.webrtcTransaction(this,this.user,t,n,r)}catch(e){throw this.fire("onError",this,e),e}}},{key:"unRegister",value:function(){this.protocol&&this.protocol.unregister(),this.close()}},{key:"register",value:function(t,n,r){this.user=new e.media.userMedia(t,r),this.protocol.register(t,n,r)}},{key:"createOffer",value:function(t){var n=new e.media.userMedia(t),r=this.createTransaction(n);return r.createOffer(),r}},{key:"acceptOffer",value:function(e){return this.fire("onAccept",this,e),e}},{key:"declineOffer",value:function(e){return this.fire("onDeclineOffer",this,e),e}},{key:"closeTransaction",value:function(e,t){e&&(e.close(),delete this.transactions[e.callId])}},{key:"close",value:function(){var e=this;this.fire("onClose",this),setTimeout((function(){e.clean()}),2e3)}},{key:"clean",value:function(){this.cleanTransactions(),this.protocol&&(this.protocol.clear(),this.protocol=null,delete this.protocol),this.notificationsCenter.clearNotifications()}},{key:"cleanTransactions",value:function(){for(var e in this.transactions){try{this.transactions[e].bye(),this.transactions[e].close()}catch(e){this.logger(e,"ERROR")}delete this.transactions[e]}}},{key:"quit",value:function(){this.protocol.bye()}}])&&i(c.prototype,u),l&&i(c,l),r}(e.Service);return e.media.webrtc=n,n}},function(e,t,n){"use strict";function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.exports=function(e){var t={constraintsOffer:{mandatory:{OfferToReceiveAudio:!0,OfferToReceiveVideo:!0}},displayName:""},n=function(){function n(r,i){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,n),this.name=r,this.settings=e.extend(!0,{},t,i),this.displayName=this.settings.displayName||r,this.audio=this.settings.constraintsOffer.mandatory.OfferToReceiveAudio,this.video=this.settings.constraintsOffer.mandatory.OfferToReceiveVideo,this.mediaStream=null,this.description=""}var i,o,s;return i=n,(o=[{key:"createMediaStream",value:function(t,n){return this.mediaStream=new e.media.mediaStream(null,{audio:this.audio,video:this.video,onSucces:t,onError:n}),this.mediaStream}},{key:"setDescription",value:function(e){this.description=e}}])&&r(i.prototype,o),s&&r(i,s),n}();return e.extend(e.media,{userMedia:n}),n}},function(e,t,n){"use strict";function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function i(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function o(e){return(o=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function s(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function a(e,t){return(a=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}e.exports=function(e){var t=function(e){for(var t=e.sdp.split("\r\n"),n="",r=0;r<t.length;r++){var i=t[r];e.type,r===t.length-1?n+=i:n+=i+"\r\n"}return e.sdp=n,e},n=function(n){function c(n,i,a,u,l){var p,h,f;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,c),h=this,(p=!(f=o(c).call(this,"WEBRTC TRANSACTION",n.container,e.notificationsCenter.create(l||{})))||"object"!==r(f)&&"function"!=typeof f?s(h):f).webrtc=n,p.dialog=u||null,p.error=null,p.dialog&&(p.callId=p.dialog.callId),p.protocol=n.protocol,p.from=i;try{a instanceof e.media.userMedia?p.to=a:p.to=new e.media.userMedia(a,l)}catch(e){throw e}if(p.asyncCandidates=p.webrtc.settings.asyncCandidates,p.logger("CREATE TRANSATION WEBRTC","DEBUG"),p.RTCPeerConnection=p.createPeerConnection(),p.RTCPeerConnection.addStream(p.from.stream),p.dtmfSender=null,p.webrtc.settings.dtmf)try{p.initDtmfSender(p.from.stream),p.webrtc.listen(s(p),"onKeyPress",p.sendDtmf)}catch(e){throw p.webrtc.logger(e,"ERROR"),e}return p.candidates=[],p.listen(s(p),"onIcecandidate",(function(e,n,r){var i=null;this.asyncCandidates&&this.candidates.length?(i=this.dialog.to.replace("<sip:","").replace(">",""),this.logger("CANDIDATE TO"+i,"DEBUG"),this.logger("CANDIDATE TO"+this.to.name,"DEBUG"),this.dialog.invite(i,JSON.stringify(this.candidates),"ice/candidate")):("offer"===r.localDescription.type&&(this.sessionDescription=t.call(this,r.localDescription),this.dialog?(i=this.dialog.to.replace("<sip:","").replace(">",""),this.logger("CANDIDATE TO"+i,"DEBUG"),this.logger("CANDIDATE TO"+this.to.name,"DEBUG"),this.dialog.invite(i,this.sessionDescription)):(this.dialog=this.webrtc.protocol.invite(this.to.name,this.sessionDescription),this.callId=this.dialog.callId,this.webrtc.fire("onInvite",this,this.to,this.sessionDescription))),"answer"===r.localDescription.type&&(this.sessionDescription=r.localDescription,this.sessionDescription&&!this.error&&this.fire("onCreateAnwser",this.to,this.sessionDescription,this,this.dialog)))})),p.listen(s(p),"onCreateAnwser",(function(e,t,n,r){this.dialog.currentTransaction.createResponse(200,"OK",this.sessionDescription.sdp,"application/sdp").send()})),p}var u,l,p;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&a(e,t)}(c,n),u=c,(l=[{key:"createPeerConnection",value:function(){var e=this;try{return this.logger(this.webrtc.settings.optional,"DEBUG"),this.RTCPeerConnection=new RTCPeerConnection(this.webrtc.settings.optional),this.RTCPeerConnection.onicecandidate=function(t){var n=e.iceGatheringState;t.target?e.iceGatheringState=t.target.iceGatheringState||e.RTCPeerConnection.iceGatheringState:e.iceGatheringState=e.RTCPeerConnection.iceGatheringState;var r=e.RTCPeerConnection.localDescription.type;"offer"===r&&"complete"===e.iceGatheringState&&"complete"!==n?e.fire("onIcecandidate",e,e.candidates,e.RTCPeerConnection):t&&null===t.candidate||(e.logger("WEBRTC : ADD CANDIDATE","DEBUG"),t.candidate&&e.candidates.push(t.candidate),"answer"===r&&(e.fire("onIcecandidate",e,e.candidates,e.RTCPeerConnection),e.RTCPeerConnection.onicecandidate=null))},this.RTCPeerConnection.onaddstream=function(t){e.setRemoteStream(t),e.logger("WEBRTC : ADD STREAM ","DEBUG")},this.RTCPeerConnection}catch(e){this.logger(e,"ERROR"),this.webrtc.fire("onError",this,e)}}},{key:"initDtmfSender",value:function(e){var t=this;switch(this.webrtc.settings.dtmf){case"SIP-INFO":var n=function(){};n.prototype.insertDTMF=function(e,n,r){var i="Signal="+e+"\nDuration="+n;t.dialog.info(i,"application/dtmf-relay")},this.dtmfSender=new n;break;case"RTP-EVENT":if(!this.RTCPeerConnection.createDTMFSender)throw new Error(" RTCPeerConnection method createDTMFSender() !!!! which is not support by this browser",500);if(null===e)throw new Error("No local stream to create DTMF Sender",500);var r=e.getAudioTracks()[0];this.dtmfSender=this.RTCPeerConnection.createDTMFSender(r),this.dtmfSender.ontonechange=function(e){t.webrtc.fire("dtmfOnToneChange",e,t)}}}},{key:"sendDtmf",value:function(e,t,n){if(this.dialog.status===this.dialog.statusCode.ESTABLISHED){if(this.dtmfSender)return this.logger("DTMF SEND "+t+"  duration :  500 gap :  50","DEBUG"),this.dtmfSender.insertDTMF(t,500,50);throw new Error(" DTMF SENDER not ready")}}},{key:"createOffer",value:function(){var e=this;return this.RTCPeerConnection.createOffer((function(n){try{e.sessionDescription=t.call(e,n),e.from.setDescription(e.RTCPeerConnection.setLocalDescription(e.sessionDescription,(function(){e.asyncCandidates&&(e.dialog=e.webrtc.protocol.invite(e.to.name,e.sessionDescription),e.callId=e.dialog.callId,e.webrtc.fire("onInvite",e,e.to,e.sessionDescription))}),(function(t){e.error=t,e.webrtc.fire("onError",e,t)})))}catch(e){throw e}}),(function(t){e.webrtc.fire("onError",e,t)}),this.from.settings.constraintsOffer)}},{key:"setRemoteStream",value:function(e){if(e){this.to.createMediaStream(null,null),this.to.mediaStream.setStream(e.stream);var t=this.RTCPeerConnection.remoteDescription.type;"video"!==e.type&&"addstream"!==e.type||this.webrtc.notificationsCenter.fire("onRemoteStream",t,e,this.to.mediaStream,this)}return this.to.createMediaStream}},{key:"setRemoteDescription",value:function(e,n,r,i){var o=this;this.currentTransaction=i.currentTransaction;var s=t.call(this,{type:e,sdp:r}),a=new RTCSessionDescription(s);return this.remoteDescription=this.RTCPeerConnection.setRemoteDescription(a,(function(){"offer"===o.RTCPeerConnection.remoteDescription.type?(o.webrtc.fire("onOffer",o.webrtc,o),o.webrtc.fire("onRemoteDescription",o.from,o,o.to)):o.webrtc.fire("onOffHook",o,i)}),(function(e){o.error=e,o.webrtc.fire("onError",o,e)})),this.remoteDescription}},{key:"doAnswer",value:function(e){var t=this;return this.RTCPeerConnection.createAnswer((function(n){t.from.setDescription(n),t.RTCPeerConnection.setLocalDescription(n,(function(){t.sessionDescription=n,t.asyncCandidates&&t.fire("onCreateAnwser",t.to,t.sessionDescription,t,e),t.webrtc.fire("onOffHook",t,e)}),(function(e){t.error=e,t.webrtc.fire("onError",t,e)}))}),(function(e){t.error=e,t.webrtc.fire("onError",t,e)}),this.from.settings.constraints)}},{key:"bye",value:function(){this.dialog&&this.dialog.bye()}},{key:"cancel",value:function(){this.currentTransaction&&this.currentTransaction.cancel(),this.webrtc.closeTransaction(this,this.to.name)}},{key:"decline",value:function(){this.currentTransaction&&this.currentTransaction.decline(),this.webrtc.closeTransaction(this,this.to.name)}},{key:"close",value:function(){return this.logger("WEBRTC CLOSE TRANSACTION  : "+this.callId,"DEBUG"),this.RTCPeerConnection?this.RTCPeerConnection.close():this.logger("WEBRTC  TRANSACTION ALREADY CLOSED : "+this.callId,"WARNING"),this.webrtc&&this.webrtc.unListen("onKeyPress",this.sendDtmf),this.clear(),this}},{key:"clear",value:function(){this.RTCPeerConnection&&(this.RTCPeerConnection=null,delete this.RTCPeerConnection),this.webrtc&&(this.webrtc=null,delete this.webrtc),this.currentTransaction&&(this.currentTransaction=null,delete this.currentTransaction),this.candidates&&(this.candidates=null,delete this.candidates),this.dialog&&(this.dialog=null,delete this.dialog),this.from&&(this.from=null,delete this.from),this.to&&(this.to=null,delete this.to),this.error&&(this.error=null,delete this.error)}}])&&i(u.prototype,l),p&&i(u,p),c}(e.Service);return e.extend(e.media,{webrtcTransaction:n}),n}},function(e,t,n){(function(t){function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function i(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function o(e){return(o=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function s(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function a(e,t){return(a=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var c=n(4);e.exports=function(e){"use strict";var n={moduleName:"KERNEL",defaultSeverity:"INFO"},u={debug:!1,router:!0,i18n:!0,location:{html5Mode:!1,hashPrefix:"/"}},l={dev:!0,development:!0,prod:!0,production:!0},p=function(e,n,r,i,o){var s=this,a=r.id,c=(r.method,r.async),u=r.precompiled,l=null;return void 0===c&&(c=!0),void 0===a&&(a=n),r.id=a,e.cache&&e.Templates.registry.hasOwnProperty(a)?(i&&i(e.Templates.registry[a]),e.Templates.registry[a]):(t.ajax({url:n,async:c,success:function(t,o,a){var c=s.getModuleName(n);if(!0===u&&(t=JSON.parse(t)),r.url=n,r.data=t,l=new e.Template(r),s.modules[c]){var p=s.modules[c],h=p.getTemplateName(n);p.registerTemplate(h,l,"template")}i&&i(l)},error:function(e,t,n){o(e,t,n)}}),!1!==c||l)},h=function(h){function f(i,a){var c,p,h;if(function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,f),p=this,(c=!(h=o(f).call(this,"KERNEL",null,null,{syslog:n}))||"object"!==r(h)&&"function"!=typeof h?s(p):h).container.set("kernel",s(c)),c.modules={},c.settings=e.extend(!0,{},u,a),i in l)switch(i){case"dev":case"development":c.environment="dev";break;case"prod":case"production":c.environment="prod"}else c.logger("Bad Variable environment :"+i,"WARNING"),c.environment="prod";return c.debug=c.settings.debug,c.booted=!1,c.isDomReady=!1,c.uiContainer=null,c.initializeLog(n),c.autoloader=new e.autoload(s(c),{transport:"script"}),c.container.set("autoloader",c.autoloader),c.initRouter(),c.initTwig(),c.initTranslation(),c.initRest(),t(document).ready(c.listen(s(c),"onDomReady",c.domReady)),t(window).resize(c.listen(s(c),"onResize")),t(window).on("unload",c.unLoad.bind(s(c))),t(window).on("load",c.onLoad.bind(s(c))),c.listen(s(c),"onBoot",c.boot),c.listen(s(c),"onReady",c.ready),c.notificationsCenter.settingsToListen(c.settings,s(c)),c}var d,g,m;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&a(e,t)}(f,h),d=f,(g=[{key:"initRouter",value:function(){this.settings.router&&(this.initLocation(),this.router=new e.router(this,this.container),this.container.set("router",this.router))}},{key:"initLocation",value:function(){this.locationService=new e.location(this,this.settings.location),this.container.set("location",this.locationService)}},{key:"initRest",value:function(){e.Rest&&(this.restService=new e.Rest(this.container),this.set("rest",this.restService))}},{key:"initTranslation",value:function(){if(this.settings.i18n){if(!e.i18n)return void this.logger("you must load transation i18n services js file !!!!!","ERROR");this.i18n=new e.i18n(this,this.container),this.container.set("i18n",this.i18n)}}},{key:"initTwig",value:function(){var e=this;return this.logger("INITIALIZE TWIG SERVICE","DEBUG"),"dev"===this.environment&&(c.cache=!1),this.templateEngine=c.twig,c.extend((function(t){t.log.error=function(t){e.logger(t,"ERROR")}})),c.extend((function(t){t.Templates.loadRemote=p.bind(e,t)})),c.extendFunction("controller",function(){var e=Array.prototype.shift.call(arguments),t=e.split(":"),n=this.getModule(t[0]);if(n){var r=n.getController(t[1]);if(r){var i=t[2];if(r[i])return r[i].apply(r,arguments)}}}.bind(this)),this.container.set("twig",this.templateEngine),this.templateEngine}},{key:"domReady",value:function(){if(this.booted){this.logger("domReady","DEBUG"),this.fire("onDomLoad",this);var e=this.uiContainer?t(this.uiContainer):t("body");try{for(var n in this.modules.app&&this.modules.app.initialize(e),this.modules)"app"!==n&&this.modules[n].initialize(e);this.fire("onReady",this),this.isDomReady=!0}catch(e){this.logger(e,"ERROR")}}}},{key:"onLoad",value:function(e){this.fire("onLoad",this,e)}},{key:"unLoad",value:function(e){this.fire("onUnLoad",this,e)}},{key:"getModule",value:function(e){return this.modules[e]}},{key:"initializeLog",value:function(e){var t;return"dev"===this.environment&&(this.syslog.listenWithConditions(this,{severity:{data:"CRITIC,ERROR"}},(function(e){e.payload.stack?console.error("SYSLOG "+e.severityName+" "+e.msgid+" "+new Date(e.timeStamp)+" "+e.msg+" : "+e.payload.stack):console.error("SYSLOG "+e.severityName+" "+e.msgid+" "+new Date(e.timeStamp)+" "+e.msg+" : "+e.payload)})),t=this.debug?"INFO,DEBUG":"INFO",this.syslog.listenWithConditions(this,{severity:{data:t}},(function(e){console.info("SYSLOG "+e.severityName+" "+e.msgid+" "+new Date(e.timeStamp)+" "+e.msg+" : "+e.payload)})),this.syslog.listenWithConditions(this,{severity:{data:"WARNING"}},(function(e){console.warn("SYSLOG "+e.severityName+" "+e.msgid+" "+new Date(e.timeStamp)+" "+e.msg+" : "+e.payload)}))),this.syslog}},{key:"boot",value:function(){this.booted=!0}},{key:"ready",value:function(){}},{key:"loadModule",value:function(n,r){var i=this,o=e.io.urlToOject(n).basename;return t.ajax(n,e.extend({cache:!1,method:"GET",dataType:"xml",success:function(t,n,r){try{var o=e.xml.parseXml(t),s=o.module["@id"],a=o.module["@type"],c=o.module["@src"];switch(a){case"application/javascript":c&&(s in i.modules?(i.modules[s].initialize(),i.modules[s].fire("onInitialize",s),i.fire("onInitializeModule",s)):i.autoloader.load(c,(function(e,t){if(e)throw i.fire("onError",e),e;i.registerModule(s,o),"app"===s&&i.fire("onBoot",i)})))}}catch(e){throw i.logger(e,"ERROR"),i.fire("onError",e),e}},error:function(e,t,n){i.fire("onGetConfigError",o),i.fire("onError",n)}},r))}},{key:"registerModule",value:function(t,n){var r=this;if(t in e.modules){var i=this,o=e.modules[t];this.container.addScope(t),o.prototype.name=t;try{this.isDomReady?this.modules[t]=new o(this,n,{onReady:function(){if(r.initialize)try{r.initialize(),r.fire("onInitialize",t),i.fire("onInitializeModule",t)}catch(e){throw r.logger("INITIALIZE MODULE : "+t+" "+e,"ERRROR"),e}}}):this.modules[t]=new o(this,n),this.container.set(t,this.modules[t])}catch(e){throw this.logger("INSTANCE MODULE : "+t+" "+e,"ERRROR"),e}}}},{key:"getModuleName",value:function(t){var n=e.dirname(t).split("/");return n[n.indexOf("Resources")-1]}}])&&i(d.prototype,g),m&&i(d,m),f}(e.Service);return e.kernel=h,h}}).call(this,n(0))},function(e,t,n){(function(e){function n(e,t){for(var n=0,r=e.length-1;r>=0;r--){var i=e[r];"."===i?e.splice(r,1):".."===i?(e.splice(r,1),n++):n&&(e.splice(r,1),n--)}if(t)for(;n--;n)e.unshift("..");return e}function r(e,t){if(e.filter)return e.filter(t);for(var n=[],r=0;r<e.length;r++)t(e[r],r,e)&&n.push(e[r]);return n}t.resolve=function(){for(var t="",i=!1,o=arguments.length-1;o>=-1&&!i;o--){var s=o>=0?arguments[o]:e.cwd();if("string"!=typeof s)throw new TypeError("Arguments to path.resolve must be strings");s&&(t=s+"/"+t,i="/"===s.charAt(0))}return(i?"/":"")+(t=n(r(t.split("/"),(function(e){return!!e})),!i).join("/"))||"."},t.normalize=function(e){var o=t.isAbsolute(e),s="/"===i(e,-1);return(e=n(r(e.split("/"),(function(e){return!!e})),!o).join("/"))||o||(e="."),e&&s&&(e+="/"),(o?"/":"")+e},t.isAbsolute=function(e){return"/"===e.charAt(0)},t.join=function(){var e=Array.prototype.slice.call(arguments,0);return t.normalize(r(e,(function(e,t){if("string"!=typeof e)throw new TypeError("Arguments to path.join must be strings");return e})).join("/"))},t.relative=function(e,n){function r(e){for(var t=0;t<e.length&&""===e[t];t++);for(var n=e.length-1;n>=0&&""===e[n];n--);return t>n?[]:e.slice(t,n-t+1)}e=t.resolve(e).substr(1),n=t.resolve(n).substr(1);for(var i=r(e.split("/")),o=r(n.split("/")),s=Math.min(i.length,o.length),a=s,c=0;c<s;c++)if(i[c]!==o[c]){a=c;break}var u=[];for(c=a;c<i.length;c++)u.push("..");return(u=u.concat(o.slice(a))).join("/")},t.sep="/",t.delimiter=":",t.dirname=function(e){if("string"!=typeof e&&(e+=""),0===e.length)return".";for(var t=e.charCodeAt(0),n=47===t,r=-1,i=!0,o=e.length-1;o>=1;--o)if(47===(t=e.charCodeAt(o))){if(!i){r=o;break}}else i=!1;return-1===r?n?"/":".":n&&1===r?"/":e.slice(0,r)},t.basename=function(e,t){var n=function(e){"string"!=typeof e&&(e+="");var t,n=0,r=-1,i=!0;for(t=e.length-1;t>=0;--t)if(47===e.charCodeAt(t)){if(!i){n=t+1;break}}else-1===r&&(i=!1,r=t+1);return-1===r?"":e.slice(n,r)}(e);return t&&n.substr(-1*t.length)===t&&(n=n.substr(0,n.length-t.length)),n},t.extname=function(e){"string"!=typeof e&&(e+="");for(var t=-1,n=0,r=-1,i=!0,o=0,s=e.length-1;s>=0;--s){var a=e.charCodeAt(s);if(47!==a)-1===r&&(i=!1,r=s+1),46===a?-1===t?t=s:1!==o&&(o=1):-1!==t&&(o=-1);else if(!i){n=s+1;break}}return-1===t||-1===r||0===o||1===o&&t===r-1&&t===n+1?"":e.slice(t,r)};var i= true?function(e,t,n){return e.substr(t,n)}:0}).call(this,n(48))},function(e,t){var n,r,i=e.exports={};function o(){throw new Error("setTimeout has not been defined")}function s(){throw new Error("clearTimeout has not been defined")}function a(e){if(n===setTimeout)return setTimeout(e,0);if((n===o||!n)&&setTimeout)return n=setTimeout,setTimeout(e,0);try{return n(e,0)}catch(t){try{return n.call(null,e,0)}catch(t){return n.call(this,e,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:o}catch(e){n=o}try{r="function"==typeof clearTimeout?clearTimeout:s}catch(e){r=s}}();var c,u=[],l=!1,p=-1;function h(){l&&c&&(l=!1,c.length?u=c.concat(u):p=-1,u.length&&f())}function f(){if(!l){var e=a(h);l=!0;for(var t=u.length;t;){for(c=u,u=[];++p<t;)c&&c[p].run();p=-1,t=u.length}c=null,l=!1,function(e){if(r===clearTimeout)return clearTimeout(e);if((r===s||!r)&&clearTimeout)return r=clearTimeout,clearTimeout(e);try{r(e)}catch(t){try{return r.call(null,e)}catch(t){return r.call(this,e)}}}(e)}}function d(e,t){this.fun=e,this.array=t}function g(){}i.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];u.push(new d(e,t)),1!==u.length||l||a(f)},d.prototype.run=function(){this.fun.apply(null,this.array)},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=g,i.addListener=g,i.once=g,i.off=g,i.removeListener=g,i.removeAllListeners=g,i.emit=g,i.prependListener=g,i.prependOnceListener=g,i.listeners=function(e){return[]},i.binding=function(e){throw new Error("process.binding is not supported")},i.cwd=function(){return"/"},i.chdir=function(e){throw new Error("process.chdir is not supported")},i.umask=function(){return 0}},function(e,t){},function(e,t){function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){return!t||"object"!==n(t)&&"function"!=typeof t?s(e):t}function o(e){return(o=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function s(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function a(e,t){return(a=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}e.exports=function(e){"use strict";var t=function(e){function t(e,n,a){var c;switch(r(this,t),arguments.length){case 0:e=null,n="prod",a={};break;case 1:n=e,a={};break;case 2:a=n,n=e,e=null}return c=i(this,o(t).call(this,n,a)),e?c.loadModule(e,{async:!1}):c.fire("onBoot",s(c)),c}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&a(e,t)}(t,e),t}(e.kernel);return e.appKernel=t,t}},function(e,t,n){(function(t,r){function i(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}var o=n(5);e.exports=function(e){"use strict";var n,s=(n={css:{mineType:"text/css",tag:"link",media:"screen",type:"stylesheet",position:"HEAD"},js:{mineType:"text/javascript",tag:"script",position:"BODY"}},function(e,r,i,o,s){var a=this;switch(r){case"js":return t.ajax({url:e,async:!1,dataType:"script",success:function(e,t,n){s(null,n)},error:function(t,n,r){a.logger(e+" :"+r,"ERROR"),s(r,t)}});case"css":var c=n[r],u=document.createElement(c.tag);u.setAttribute("type",c.mineType),u.setAttribute("id",i+"_"+r),"css"===r&&(u.setAttribute("media",c.media),u.href=e,u.rel=c.type,u.async=!1),"js"===r&&(u.src=e,u.async=!1),u.onload=function(){a.cache[i]=u,a.logger("LOAD FILE :"+e,"DEBUG"),s(null,u)},u.onerror=function(t){a.logger(e,"ERROR"),s(t,u)},function(e,t){switch(e){case"HEAD":document.getElementsByTagName("head")[0].appendChild(t);break;case"BODY":document.getElementsByTagName("body")[0].appendChild(t)}}(c.position,u);break;default:return this.logger(new Error("autoload  type transport error "),"ERROR"),null}return u}),a={transport:"script",prefix:null},c=/(.*)\.(js)$|(.*)\.(css)$/,u=function(){function e(t,n){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.settings=r.extend({},a,n),this.cache={},this.prefix=this.settings.prefix,this.syslog=t.syslog||null,this.transport=this.settings.transport,this.logger("INITIALIZE AUTOLOAD SERVICE","DEBUG")}var t,n,u;return t=e,(n=[{key:"load",value:function(e,t){var n=o.generate(),r=c.exec(e);return r?(s.call(this,e,r[2]||r[4],n,this.transport,t),n):(this.logger("autoload error type file  ","ERROR"),null)}},{key:"logger",value:function(e,t,n,r){if(this.syslog)return n||(n="AUTOLOADER  "),this.syslog.logger(e,t,n,r);console.log(e)}},{key:"unLoad",value:function(e,t){if(e in this.cache){var n=this.cache[e];return n.parentNode.removeChild(n),delete this.cache[e],t(e)}this.logger("Autoload unLoad no tag find :"+e,"ERROR")}}])&&i(t.prototype,n),u&&i(t,u),e}();return e.autoload=u,u}}).call(this,n(0),n(0))},function(module,exports,__nested_webpack_require_378488__){(function(jQuery,$){function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function _createClass(e,t,n){return t&&_defineProperties(e.prototype,t),n&&_defineProperties(e,n),e}function _possibleConstructorReturn(e,t){return!t||"object"!==_typeof(t)&&"function"!=typeof t?_assertThisInitialized(e):t}function _assertThisInitialized(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function _getPrototypeOf(e){return(_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&_setPrototypeOf(e,t)}function _setPrototypeOf(e,t){return(_setPrototypeOf=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}module.exports=function(stage){"use strict";var tabFxEvent=["stage-click","stage-dblclick","stage-focus","stage-blur","stage-mouseover","stage-mouseout","stage-mouseenter","stage-mouseleave","stage-change"],Controller=function(_stage$Service){function Controller(e,t,n){var r;return _classCallCheck(this,Controller),(r=_possibleConstructorReturn(this,_getPrototypeOf(Controller).call(this,e,t,t.get("notificationsCenter")))).module=n,r.i18n=r.kernel.i18n,r.router=r.kernel.router,r}return _inherits(Controller,_stage$Service),_createClass(Controller,[{key:"redirect",value:function(e){return this.router.redirect.apply(this.router,arguments)}},{key:"forward",value:function(e,t){return this.router.forward(e,t)}},{key:"generateUrl",value:function(e,t,n){if(!0===n){this.router.url().split("#");n=this.router.url[0]}return this.router.generateUrl.apply(this.router,arguments)}},{key:"evalInContext",value:function evalInContext(js,context){var func=function(context){var $controller=context;return function(js){return eval(js)}}(this);try{return func.call(context||this,jQuery.trim(js))}catch(e){this.logger("DOM PARSER TWIG ERROR "+e,"ERROR")}}},{key:"domParser",value:function(e){var t=this;e.find("["+tabFxEvent.join("],[")+"]").each((function(e,n){var r=n.attributes,i=$(n),o=i.closest("[stage-ctrl]"),s=null;if(o.length){var a=$(o).attr("stage-ctrl");try{s=t.router.resolvePattern(a).controller}catch(e){return void t.logger("DOM PARSER ERROR : "+e,"ERROR")}}else s=t;for(var c=0;c<r.length;c++){var u=r[c];if(tabFxEvent.indexOf(u.name)>-1)n=function(){var e=u.value;i.on(u.name.replace("stage-",""),(function(){s.evalInContext(e,this)}))}()}}))}},{key:"render",value:function(e,t,n){var r=$(e);try{switch(n){case"append":r.append(t);break;case"prepend":r.prepend(t);break;default:r.empty(),r.html(t)}return this.domParser(r)}catch(e){this.logger("DOM PARSER TWIG ERROR : "+e,"ERROR")}}},{key:"renderPartial",value:function(e,t){try{return this.module.getTemplatePattern(e).render(t)}catch(e){this.logger(e,"ERROR")}}}]),Controller}(stage.Service);return stage.Controller=Controller,Controller}}).call(this,__nested_webpack_require_378488__(0),__nested_webpack_require_378488__(0))},function(e,t,n){(function(t){function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e,t){return!t||"object"!==n(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function i(e){return(i=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&s(e,t)}function s(e,t){return(s=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function c(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function u(e,t,n){return t&&c(e.prototype,t),n&&c(e,n),e}e.exports=function(e){"use strict";var n=!(!window.history||!window.history.pushState),s=/^([^\?#]*)(\?([^#]*))?(#(.*))?$/,c={http:80,https:443},l=function(e){var t=this.kernel.locationService,n=this.url();if(n!==this.lastUrl||n!==this.location.href||this.lastUrl===t.initialUrl){if(!e){this.kernel.logger(" FORCE URL CHANGE BROWER EVENT NOT FIRE","WARNING");var r=t.url();return this.kernel.notificationsCenter.fire("onUrlChange",r,this.lastHash,n,null),this.lastUrlr=n,void(this.lastHash=r)}if(!t.parse(n))return this.kernel.notificationsCenter.fire("onUrlChange","",this.lastHash,n,null),this.lastUrl="",void(this.lastHash="");r=t.url();this.kernel.notificationsCenter.fire("onUrlChange",r,this.lastHash,n,null),this.lastUrl=n,this.lastHash=r}},p=function(e){return n&&e.html5Mode?function(e,t,n){}:function(e,t,n){if(e){this.kernel&&this.kernel.get("location")&&this.location!==window.location&&(this.location=window.location);var r=e===this.lastUrl&&e===this.location.href;return this.history!==window.history&&(this.history=window.history),this.kernel.logger(t?"REPLACE URL : "+e:"CHANGE URL : "+e,"WARNING"),r?(e===this.kernel.locationService.initialUrl&&l.call(this),e):t?(this.location.replace(e),e):this.location.href=e}return this.location.href.replace(/%27/g,"'")}},h=null,f=function(){function e(n,r){a(this,e),this.location=window.location,this.history=window.History,h=p.call(this,r),this.lastUrl=this.url(),this.kernel=n,t(window).bind("hashchange",l.bind(this))}return u(e,[{key:"url",value:function(e,t,n){return h.call(this,e,t,n)}}]),e}(),d=function(e,t){if(0===t.indexOf(e))return t.substr(e.length)},g=function(e){var t=e.indexOf("#");return-1==t?e:e.substr(0,t)},m=function(t){function n(e,t,o,s){var c;return a(this,n),(c=r(this,i(n).call(this,"LOCATION",o.container,o.notificationsCenter))).settings=s,c.browser=e,c.replace=!1,c.initialUrl=c.browser.url(),c.base=t,c.hashPrefix="#"+c.settings.hashPrefix,c.proto=c.stripFile(c.base),c.parseAbsoluteUrl(c.initialUrl),c.parse(c.initialUrl),c.logger("INITIALIZE LOCATION SERVICE","DEBUG"),c}return o(n,t),u(n,[{key:"absUrl",value:function(){return this._absUrl}},{key:"url",value:function(e){if(void 0===e)return this._url;var t=s.exec(e);t[1]&&this.path(decodeURIComponent(t[1])),(t[2]||t[1])&&this.search(t[3]||""),this.hash(t[5]||"")}},{key:"protocol",value:function(){return this._protocol}},{key:"host",value:function(){return this._host}},{key:"port",value:function(){return this._port}},{key:"path",value:function(e){if(void 0===e)return this._path;this._path=e;try{this.change()}catch(e){throw this.logger(e,"ERROR"),e}return this._path}},{key:"search",value:function(e){if(void 0===e)return this._search;this._search=e;try{this.change()}catch(e){throw this.logger(e,"ERROR"),e}return this._search}},{key:"hash",value:function(e){if(void 0===e)return this._hash;this._hash=e;try{this.change()}catch(e){throw this.logger(e,"ERROR"),e}return this._hash}},{key:"state",value:function(){}},{key:"replace",value:function(e){return e?this.replace=e:this.replace}},{key:"encodePath",value:function(t){for(var n=t.split("/"),r=n.length;r--;)n[r]=e.io.encodeUriSegment(n[r]);return n.join("/")}},{key:"stripFile",value:function(e){return e.substr(0,g(e).lastIndexOf("/")+1)}},{key:"parseRelativeUrl",value:function(t){var n="/"!==t.charAt(0);n&&(t="/"+t);var r=e.io.urlToOject(t);this._path=decodeURIComponent(n&&"/"===r.pathname.charAt(0)?r.pathname.substring(1):r.pathname),this._search=e.io.parseKeyValue(r.search),this._hash=decodeURIComponent(r.hash),void 0!==this._path&&"/"!=this._path.charAt(0)&&(this._path="/"+this._path)}},{key:"parseAbsoluteUrl",value:function(t){var n=e.io.urlToOject(t);this._protocol=n.protocol.replace(":",""),this._host=n.hostname,this._port=parseInt(n.port,10)||c[this._protocol]||null}}]),n}(e.Service),y=function(t){function n(e,t,o,s){return a(this,n),r(this,i(n).call(this,e,t,o,s))}return o(n,t),u(n,[{key:"parse",value:function(e){var t=d(this.base,e)||d(this.proto,e),n="#"==t.charAt(0)?d(this.hashPrefix,t):"";return"string"!=typeof n?(this.logger("Invalid url "+e+", missing hash prefix "+this.hashPrefix,"ERROR"),null):(this.parseRelativeUrl(n),this.change())}},{key:"change",value:function(){var t=e.io.toKeyValue(this._search),n=this._hash?"#"+this._hash:"";return this._url=this.encodePath(this._path)+(t?"?"+t:"")+n,this._absUrl=this.base+(this._url?"#"+this._url:""),this}}]),n}(m),v=function(e){function t(e,n,o,s){return a(this,t),r(this,i(t).call(this,e,n,o,s))}return o(t,e),u(t,[{key:"parse",value:function(e){return this.change()}},{key:"change",value:function(){return this}}]),t}(y),b=function(t){function n(e,t,o,s){return a(this,n),r(this,i(n).call(this,e,t,o,s))}return o(n,t),u(n,[{key:"parse",value:function(e){var t=d(this.proto,e);return t&&this.parseRelativeUrl(t),this._path||(this._path="/"),this.change()}},{key:"change",value:function(){var t=e.io.toKeyValue(this._search),n=this._hash?"#"+e.io.encodeUriSegment(this._hash):"";return this._url=this.encodePath(this._path)+(t?"?"+t:"")+n,this._absUrl=this.proto+this._url.substr(1),this}}]),n}(m),w={html5Mode:!0,hashPrefix:"/"},x=function(e,r){var i=t.extend(w,r),o=new f(e,i);e.set("browser",o);var s,a=o.url(),c=i.base||"",u=null,l=null;return i.html5Mode?(u=n?b:v,l=(s=a).substring(0,s.indexOf("/",s.indexOf("//")+2))+(c||"/")):(u=y,l=g(a)),new u(o,l,e,i)};return e.location=x,x}}).call(this,n(0))},function(e,t,n){(function(t){function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e){return(r=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function i(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function o(e,t){return(o=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function s(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function c(e,t,n){return t&&a(e.prototype,t),n&&a(e,n),e}e.exports=function(e){"use strict";var a=function(e,t,n,r,i){var o=t.indexOf("views");if(o<0){var s="URL TEMPLATE BAD PATH :"+t;throw this.logger(s,"ERROR"),new Error(s)}var a=t.slice(o+"views".length+1).split("/");if(a.pop(),a.length){i=e;for(var c=0;c<a.length;c++)i[a[c]]?c!==a.length-1?i=i[a[c]]:i[a[c]][n]=r:c!==a.length-1?(i[a[c]]={},i=i[a[c]]):(i[a[c]]={},i[a[c]][n]=r)}else e[n]=r},u=new RegExp("^(.*).(.._..).(.*)$"),l=/(.*)Module:(.*):(.*)$/,p=function(t){function a(t,o,c){var u,l,p;return s(this,a),l=this,(u=!(p=r(a).call(this,o))||"object"!==n(p)&&"function"!=typeof p?i(l):p).kernel=t,u.container=t.container,u.syslog=u.get("syslog"),u.logger("REGISTER MODULE "+u.name,"DEBUG"),u.autoloader=new e.autoload(i(u),{transport:"script"}),u.views={},u.controllers={},u.templates={},u.routes={},u.twig=u.get("twig"),u.setParameters("module."+u.name,u.config),u.set(u.name,i(u)),u.boot(c),u}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&o(e,t)}(a,t),c(a,[{key:"listen",value:function(){return this.notificationsCenter.listen.apply(this.notificationsCenter,arguments)}},{key:"fire",value:function(e){return this.logger(e+" : "+this.name,"DEBUG","EVENT MODULE"),this.notificationsCenter.fire.apply(this.notificationsCenter,arguments)}},{key:"logger",value:function(e,t,n,r){return n||(n="MODULE  "+this.name),this.syslog.logger(e,t,n,r)}},{key:"get",value:function(e){return this.container.get(e)}},{key:"set",value:function(e,t){return this.container.set(e,t)}},{key:"setParameters",value:function(e,t){return this.container.setParameters(e,t)}},{key:"getParameters",value:function(e){return this.container.getParameters(e)}},{key:"getController",value:function(e){return this.controllers[e]}},{key:"getTemplate",value:function(e){return this.templates[e]}},{key:"getTemplateName",value:function(t){var n=e.basename(t);return n.indexOf(".")<0?t:n.slice(0,n.indexOf("."))}},{key:"getTemplatePattern",value:function(e){var t=l.exec(e);if(!t){var n="IN PATTERN :"+e+" BAD FORMAT ";throw this.logger(n,"ERROR"),new Error(n)}var r=t[1],i=t[2],o=t[3],s=this.kernel.getModule(r);if(!s){n="IN PATTERN :"+e+" MODULE :"+r+" not defined";throw this.logger(n,"ERROR"),new Error(n)}var a=s.templates;if(""!==i)for(var c=i.split("/"),u=0;u<c.length;u++)if(c[u]){if(!(c[u]in a)){n="IN PATTERN :"+e+" pathName :"+i+" not defined";throw this.logger(n,"ERROR"),new Error(n)}a=a[c[u]]}if(""!==o){var p=this.getTemplateName(o);if(a[p])return a[p];n="IN PATTERN :"+e+" MODULE :"+r+"  template : "+o+" not defined";throw this.logger(n,"ERROR"),new Error(n)}if(a.index)return a.index;n="IN PATTERN :"+e+" MODULE :"+r+" default template not defined";throw this.logger(n,"ERROR"),new Error(n)}},{key:"getView",value:function(e){return this.views[e]}},{key:"boot",value:function(t){this.logger("BOOT "+this.name,"DEBUG"),this.container=this.kernel.container.enterScope(this.name),this.notificationsCenter=e.notificationsCenter.create(t,this),this.set("notificationsCenter",this.notificationsCenter),this.router=this.kernel.router;try{this.fire("onBoot",this),this.reader(),this.fire("onReady",this)}catch(e){throw this.logger("MODULE : "+this.name+"  "+e,"ERROR"),e}}}]),a}(function(){function n(e){s(this,n),this.rootName="module";var t=this.parser(e);this.name=t.module["@id"]}return c(n,[{key:"parser",value:function(t){switch(e.typeOf(t)){case"document":var n=e.xml.parseXml(t);break;case"object":n=t}if(!n[this.rootName])throw new Error("BAD MODULE CONFIG ");return this.config=n[this.rootName],n}},{key:"registerScript",value:function(e){var t=this;this.autoloader.load(e,(function(n,r){n?t.logger(n,"ERROR"):t.logger("LOAD SCRIPT : "+e,"DEBUG")}))}},{key:"registerStyle",value:function(e){var t=this;this.autoloader.load(e,(function(n,r){n?t.logger(n,"ERROR"):t.logger("LOAD STYLE : "+e,"DEBUG")}))}},{key:"cacheFont",value:function(e){var n=this;t.ajax({async:!1,cache:!0,url:e,beforeSend:function(e){e.overrideMimeType("application/octet-stream")},success:function(){n.logger("LOAD FONT : "+e,"DEBUG")},error:function(t){console.log(t),n.logger(e+" : "+message,"ERROR")}})}},{key:"registerTemplate",value:function(e,t,n){var r=this;switch(n){case"application/twig":this.twig({id:this.name+":"+e,href:t,async:!1,load:function(n){a.call(r,r.templates,t,e,n),r.logger("LOAD TEMPLATE : "+e+" ==>"+t,"DEBUG")},error:function(e,n,i){r.logger("TEMPLATE :"+t+" : "+i,"ERROR")}});break;case"text/html":break;case"application/xml":case"text/xml":break;case"template":a.call(this,this.templates,t.url,e,t);this.logger("LOAD IMPORT TEMPLATE : "+e+" ==>"+t.url,"DEBUG");break;default:this.registerTemplate(e,t,"application/twig")}}},{key:"registerView",value:function(t,n,r){var i=this;switch(r){case"text/javascript":case"application/javascript":this.autoloader.load(n,(function(r,o){if(r)i.logger(r,"ERROR");else{var s=e.views[t];i.views[t]=new s(i.container,i),i.logger("LOAD VIEW : "+n,"DEBUG")}}))}}},{key:"registerController",value:function(t,n){var r=this;this.autoloader.load(n,(function(i,o){if(i)throw r.logger(i,"ERROR"),i;try{var s=e.controllers[t];r.controllers[t]=new s(t,r.container,r),r.logger("LOAD CONTROLLER : "+t+" ==>"+n,"DEBUG")}catch(e){throw e}}))}},{key:"initialiseRest",value:function(e,t,n){var r=this.kernel.restService.addApi(e,t,n);this.kernel.set(e,r)}},{key:"registerTranslation",value:function(n,r){var i=this,o=this.get("i18n");o?t.ajax({url:n,async:!1,success:function(t,s,a){var c=e.basename(n);i.logger("LOAD TRANSLATION "+r+" : "+c+" URL = "+n,"DEBUG");var l=u.exec(c);if(l){var p=l[1],h=l[2];o.registerI18n(c,h,p,t)}else i.logger("SERVICE I18N  abort load Translation : "+n+" Bad File name format","WARNING")},dataType:r||"json",error:function(e,t,n){i.logger(n,"ERROR")}}):this.logger("SERVICE I18N not loaded abort load Translation : "+n,"WARNING")}},{key:"reader",value:function(){var t=this.config;for(var n in this.config)switch(n){case"content":break;case"controllers":var r=t[n].controller;if(r)for(var i="object"===e.typeOf(r)?[r]:r,o=0;o<i.length;o++){var s=i[o]["@name"],a=i[o]["@src"];this.registerController(s,a)}break;case"views":var c=t[n].view;if(c)for(i="object"===e.typeOf(c)?[c]:c,o=0;o<i.length;o++){s=i[o]["@name"],a=i[o]["@src"];var u=i[o]["@type"];this.registerView(s,a,u)}break;case"modules":var l=t[n].module;if(l)for(i="object"===e.typeOf(l)?[l]:l,o=0;o<i.length;o++){var p=i[o]["@href"];this.isDomReady?this.kernel.loadModule(p):this.kernel.listen(this,"onBoot",function(e){this.kernel.loadModule(e,{async:!1})}.bind(this,p))}break;case"templates":var h=t[n].template;if(h)for(i="object"===e.typeOf(h)?[h]:h,o=0;o<i.length;o++){s=i[o]["@name"],a=i[o]["@src"],u=i[o]["@type"];s||(s=this.getTemplateName(a)),this.registerTemplate(s,a,u)}break;case"styles":var f=t[n].style;if(f)for(i="object"===e.typeOf(f)?[f]:f,o=0;o<i.length;o++){a=i[o]["@src"];this.registerStyle(a)}break;case"scripts":var d=t[n].script;if(d)for(i="object"===e.typeOf(d)?[d]:d,o=0;o<i.length;o++){a=i[o]["@src"];this.registerScript(a)}break;case"fonts":var g=t[n].font;if(g)for(i="object"===e.typeOf(g)?[g]:g,o=0;o<i.length;o++){a=i[o]["@src"];this.cacheFont(a)}break;case"translations":var m=t[n].translation;if(m)for(i="object"===e.typeOf(m)?[m]:m,o=0;o<i.length;o++){a=i[o]["@src"],u=i[o]["@type"];this.registerTranslation(a,u)}break;case"icon":this.icon=t[n]["@src"];break;case"preference":break;case"author":var y=t[n];this.author=y["#text"],this.emailAuthor=y["@email"],this.authorLink=y["@href"];break;case"description":this.description=t[n];break;case"api":for(var v in t[n]){var b=t[n][v];for(i="object"===e.typeOf(b)?[b]:b,o=0;o<i.length;o++)"rest"===v?this.kernel.restService?this.initialiseRest(i[o]["@name"],i[o]["@url"]):this.logger("Api "+v+" SERVICE REST NOT FOUND","ERROR"):this.logger("Api "+v+" not exist for modules","ERROR")}break;case"routes":var w=t[n].route;switch(e.typeOf(w)){case"array":for(o=0;o<w.length;o++){var x=w[o]["@id"],k=w[o]["@path"],T={};switch(e.typeOf(w[o].default)){case"array":for(var C=0;C<w[o].default.length;C++)T[w[o].default[C]["@key"]]=w[o].default[C]["#text"];break;case"object":w[o].default["@key"]&&(T[w[o].default["@key"]]=w[o].default["#text"])}this.routes[x]=this.router.createRoute(x,k,T)}break;case"object":for(var S in w)switch(S){case"@id":x=w[S];break;case"@path":k=w[S];break;case"default":T={};switch(e.typeOf(w[S])){case"array":for(C=0;C<w[S].length;C++)T[w[S][C]["@key"]]=w[S][C]["#text"];break;case"object":T[w[S]["@key"]]=w[S]["#text"]}}this.routes[x]=this.router.createRoute(x,k,T)}}}}]),n}());return e.Module=p,p}}).call(this,n(0))},function(e,t,n){function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function i(e){return(i=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function o(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function s(e,t){return(s=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function c(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function u(e,t,n){return t&&c(e.prototype,t),n&&c(e,n),e}var l=n(4);e.exports=function(e){"use strict";var t=function(e){try{return decodeURIComponent(e)}catch(t){return e}},n=function(){function e(t,n,r){a(this,e),this.id=t,this.path=n,this.template=null,this.controller=null,this.defaults=r,this.variables=[],this.pattern=this.compile()}return u(e,[{key:"compile",value:function(){var e=this,t=this.path.replace(/(\/)?(\.)?\{([^}]+)\}(?:\(([^)]*)\))?(\?)?/g,(function(t,n,r,i,o,s,a){var c="/"===(e.path[t.length+a]||"/");return e.variables.push(i),(c?"(?:":"")+(n||"")+(c?"":"(?:")+(r||"")+"("+(o||"[^/]+")+"))"+(s||"")}));return t=t.replace(/([\/.])/g,"\\$1").replace(/\*/g,"(.+)"),this.pattern=new RegExp("^"+t+"[\\/]?$","i"),this.pattern}},{key:"match",value:function(e){var n=e.match(this.pattern);if(!n)return n;for(var r=[],i=n.slice(1),o=0;o<i.length;o++){var s=this.variables[o]||"wildcard",a=i[o]&&t(i[o]),c=r.push(a);r[s]=r[c-1]}return r&&r.wildcard&&(r["*"]=r.wildcard),r}}]),e}(),c=/^(.*)Module[\.js]{0,3}$/,p=function(){function e(t){a(this,e),this.container=t,this.resolve=!1,this.kernel=this.container.get("kernel"),this.defaultAction=null,this.defaultView=null,this.variables=new Array,this.router=this.container.get("router"),this.browser=this.container.get("browser")}return u(e,[{key:"match",value:function(e,t){var n=e.match(t);return n&&(this.variables=n,this.url=t,this.route=e,this.parsePathernController(e.defaults.controller)),n}},{key:"getModuleName",value:function(e){var t=c.exec(e);if(t)return t[1];throw"BAD MODULE PATTERN "}},{key:"getController",value:function(e){return this.module.controllers[e+"Controller"]}},{key:"getAction",value:function(e){var t=e+"Action";return t in this.controller?this.controller[t]:null}},{key:"getDefaultView",value:function(e,t){return this.module.name+"Module:"+e+":"+t+".html.twig"}},{key:"parsePathernController",value:function(e){if("string"!=typeof e)throw new Error("Resolver : pattern : "+e+" MUST be a string");this.route=this.router.getRouteByPattern(e);var t=e.split(":");try{this.module=this.kernel.getModule(this.getModuleName(t[0]))}catch(t){throw new Error("Resolver pattern error module :  "+e+" : "+t)}if(!this.module)throw new Error("Resolver : module not exist :"+t[0]);if(this.controller=this.getController(t[1]),!this.controller)throw new Error("Resolver :controller not exist :"+t[1]);if(t[2]){if(this.action=this.getAction(t[2]),!this.action)throw new Error("Resolver :In CONTROLLER: "+t[1]+" ACTION  :"+t[2]+" not exist")}else this.action=null;this.defaultView=this.getDefaultView(t[1],t[2]),this.resolve=!0}},{key:"callController",value:function(e){try{var t=this.action.apply(this.controller,e||[])}catch(e){throw this.controller.logger.call(this.controller,e,"ERROR"),e}return t}}]),e}(),h=(!window.history||window.history.pushState,/(.*)\?.*$/),f=function(e){function t(e,n){var s,c,u;return a(this,t),c=this,u=i(t).call(this,"ROUTER",n),(s=!u||"object"!==r(u)&&"function"!=typeof u?o(c):u).routes={},s.routePattern={},s.location=s.get("location"),s.browser=s.get("browser"),s.logger("INITIALIZE ROUTER SERVICE","DEBUG"),l.extendFunction("path",(function(e,t,n){try{if(n)return s.generateUrl.call(o(s),e,t,n);var r=s.generateUrl.call(o(s),e,t,n);return r?"#"+r:""}catch(e){throw s.logger(e.error),e.error}})),s.notificationsCenter.listen(o(s),"onUrlChange",(function(e,t,n,r){try{var i=s.resolve(e);if(!i.resolve)return void s.forward("appModule:app:404");var o=s.resolveRoute(t);o&&s.notificationsCenter.fire("onRouteChange",{id:i.route.id,route:i.route,args:i.variables},{id:o.route.id,route:o.route,args:o.variables})}catch(e){s.logger(e,"ERROR")}})),s}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&s(e,t)}(t,e),u(t,[{key:"createRoute",value:function(e,t,r){e in this.routes&&this.logger("CREATE ROUTE : "+e+"Already exist ","ERROR");var i=new n(e,t,r);return this.routes[e]=i,this.routePattern[this.routes[e].defaults.controller]={route:this.routes[e],path:t},this.logger("CREATE ROUTE : "+e,"DEBUG"),i}},{key:"getRoute",value:function(e){return this.routes[e]?this.routes[e]:null}},{key:"resolveRoute",value:function(e){var t=new p(this.container);for(var n in this.routes){var r=this.routes[n];try{if(t.match(r,e))return t}catch(e){continue}}return null}},{key:"resolve",value:function(e){var t=h.exec(e);t&&(e=t[1]);var n=new p(this.container),r=[];for(var i in this.routes){var o=this.routes[i];try{if(r=n.match(o,e)){this.notificationsCenter.fire("onBeforeAction",e,n);var s=n.callController(r);this.notificationsCenter.fire("onAfterAction",e,n,s);break}}catch(t){this.logger("RESOLVE URL : "+e+" "+t,"ERROR"),this.forward("appModule:app:500",[t])}}return n}},{key:"getRouteByPattern",value:function(e,t){return e in this.routePattern?this.routePattern[e].route:null}},{key:"resolvePattern",value:function(e){var t=new p(this.container);t.parsePathernController(e);return t}},{key:"forward",value:function(e,t){var n=this.resolvePattern(e);if(n.resolve)try{if(n.route)this.logger("FORWARD PATTERN : "+e+"  FIND ROUTE ==> REDIRECT ","DEBUG"),this.redirect(n.route.path);else{this.logger("FORWARD PATTERN : "+e+"  NO ROUTE FIND  ==> CALL CONTROLLER","DEBUG");n.callController(t)}}catch(t){this.logger("FORWARD "+e+" CALL CONTROLER  "+n.controller.name+" : "+t,"ERROR"),this.forward("appModule:app:500",[t])}else this.logger("Router Can't resolve : "+e,"ERROR");return!1}},{key:"redirect",value:function(e){this.location.url(e),this.logger("REDIRECT URL : "+e+" BROWSER  URL :"+this.location.absUrl(),"DEBUG"),this.browser.url(this.location.absUrl(),!0)}},{key:"generateUrl",value:function(e,t,n){var r=this.getRoute(e);if(!r)return this.logger("no route to host  :"+e,"WARNING"),null;var i=r.path;if(r.variables.length){if(!t){for(var o="",s=0;s<r.variables.length;s++)o+="{"+r.variables[s]+"} ";return this.logger("router generate path route '"+e+"' must have variable "+o,"ERROR"),null}for(var a in t)if("_keys"!==a){if(!(r.variables.indexOf(a)>=0))return this.logger("router generate path route '"+e+"' don't  have variable "+a,"WARNING"),null;i=i.replace("{"+a+"}",t[a])}}return n?n+"#"+i:i}}]),t}(e.Service);return e.router=f,f}},function(e,t,n){function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function i(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function o(e){return(o=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function s(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function a(e,t){return(a=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var c=n(4);e.exports=function(e){"use strict";var t={},n={fr_FR:"français",en_EN:"english"},u=/(..)-?.*/,l=function(l){function p(e,n){var i,a,c;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,p),a=this,c=o(p).call(this,"I18N",n,n.get("notificationsCenter")),(i=!c||"object"!==r(c)&&"function"!=typeof c?s(a):c).logger("INITIALIZE I18N SERVICE","DEBUG"),i.container.setParameters("translate",t),i.defaultDomain=i.trans_default_domain();var l=navigator.language||navigator.userLanguage,h=u.exec(l);return i.defaultLocale=h?h[1]+"_"+l.toUpperCase():"fr_FR",t[i.defaultLocale]={},i.listen(s(i),"onBoot",(function(){i.boot()})),i}var h,f,d;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&a(e,t)}(p,l),h=p,(f=[{key:"boot",value:function(){this.kernel.modules.app&&this.container.getParameters("module.app")&&(this.defaultLocale=this.container.getParameters("module.app").locale||this.defaultLocale),t[this.defaultLocale]||(t[this.defaultLocale]={}),this.logger("DEFAULT LOCALE APPLICATION ==> "+this.defaultLocale,"DEBUG"),c&&(c.extendFunction("getLangs",this.getLangs.bind(this)),c.extendFunction("trans_default_domain",this.trans_default_domain.bind(this)),c.extendFilter("trans",this.translation.bind(this)),c.extendFunction("trans",this.translation.bind(this)),c.extendFilter("getLangs",this.getLangs.bind(this)))}},{key:"getLangs",value:function(e,t){var r=[];for(var i in n)r.push({name:n[i],value:i});return r}},{key:"registerI18n",value:function(n,r,i,o){r&&(t[r]||(t[r]=e.extend(!0,{},t[this.defaultLocale]))),i?(t[r][i]||(t[r][i]=e.extend(!0,{},t[this.defaultLocale][i])),e.extend(!0,t[r][i],o)):e.extend(!0,t[r],o)}},{key:"trans_default_domain",value:function(e){return this.defaultDomain=e||"messages"}},{key:"translation",value:function(e,t){var n=t&&t[1]?t[1]:this.defaultDomain,r=this.container.getParameters("translate."+this.defaultLocale+"."+n+"."+e)||e;if(t&&t[0])for(var i in t[0])r=r.replace(i,t[0][i]);return r}}])&&i(h.prototype,f),d&&i(h,d),p}(e.Service);return e.i18n=l,l}},function(e,t,n){"use strict";n.r(t);var r={};n.r(r),n.d(r,"shimGetUserMedia",(function(){return x})),n.d(r,"shimGetDisplayMedia",(function(){return k})),n.d(r,"shimMediaStream",(function(){return T})),n.d(r,"shimOnTrack",(function(){return C})),n.d(r,"shimGetSendersWithDtmf",(function(){return S})),n.d(r,"shimGetStats",(function(){return E})),n.d(r,"shimSenderReceiverGetStats",(function(){return R})),n.d(r,"shimAddTrackRemoveTrackWithNative",(function(){return P})),n.d(r,"shimAddTrackRemoveTrack",(function(){return O})),n.d(r,"shimPeerConnection",(function(){return A})),n.d(r,"fixNegotiationNeeded",(function(){return D}));var i={};n.r(i),n.d(i,"shimGetUserMedia",(function(){return I})),n.d(i,"shimGetDisplayMedia",(function(){return j})),n.d(i,"shimPeerConnection",(function(){return L})),n.d(i,"shimReplaceTrack",(function(){return M}));var o={};n.r(o),n.d(o,"shimGetUserMedia",(function(){return U})),n.d(o,"shimGetDisplayMedia",(function(){return B})),n.d(o,"shimOnTrack",(function(){return F})),n.d(o,"shimPeerConnection",(function(){return q})),n.d(o,"shimSenderGetStats",(function(){return G})),n.d(o,"shimReceiverGetStats",(function(){return W})),n.d(o,"shimRemoveStream",(function(){return H})),n.d(o,"shimRTCDataChannel",(function(){return V})),n.d(o,"shimAddTransceiver",(function(){return z})),n.d(o,"shimCreateOffer",(function(){return $})),n.d(o,"shimCreateAnswer",(function(){return J}));var s={};n.r(s),n.d(s,"shimLocalStreamsAPI",(function(){return Y})),n.d(s,"shimRemoteStreamsAPI",(function(){return K})),n.d(s,"shimCallbacksAPI",(function(){return Q})),n.d(s,"shimGetUserMedia",(function(){return X})),n.d(s,"shimConstraints",(function(){return Z})),n.d(s,"shimRTCIceServerUrls",(function(){return ee})),n.d(s,"shimTrackEventTransceiver",(function(){return te})),n.d(s,"shimCreateOfferLegacy",(function(){return ne}));var a={};n.r(a),n.d(a,"shimRTCIceCandidate",(function(){return oe})),n.d(a,"shimMaxMessageSize",(function(){return se})),n.d(a,"shimSendThrowTypeError",(function(){return ae})),n.d(a,"shimConnectionState",(function(){return ce})),n.d(a,"removeAllowExtmapMixed",(function(){return ue}));let c=!0,u=!0;function l(e,t,n){const r=e.match(t);return r&&r.length>=n&&parseInt(r[n],10)}function p(e,t,n){if(!e.RTCPeerConnection)return;const r=e.RTCPeerConnection.prototype,i=r.addEventListener;r.addEventListener=function(e,r){if(e!==t)return i.apply(this,arguments);const o=e=>{const t=n(e);t&&r(t)};return this._eventMap=this._eventMap||{},this._eventMap[r]=o,i.apply(this,[e,o])};const o=r.removeEventListener;r.removeEventListener=function(e,n){if(e!==t||!this._eventMap||!this._eventMap[n])return o.apply(this,arguments);const r=this._eventMap[n];return delete this._eventMap[n],o.apply(this,[e,r])},Object.defineProperty(r,"on"+t,{get(){return this["_on"+t]},set(e){this["_on"+t]&&(this.removeEventListener(t,this["_on"+t]),delete this["_on"+t]),e&&this.addEventListener(t,this["_on"+t]=e)},enumerable:!0,configurable:!0})}function h(e){return"boolean"!=typeof e?new Error("Argument type: "+typeof e+". Please use a boolean."):(c=e,e?"adapter.js logging disabled":"adapter.js logging enabled")}function f(e){return"boolean"!=typeof e?new Error("Argument type: "+typeof e+". Please use a boolean."):(u=!e,"adapter.js deprecation warnings "+(e?"disabled":"enabled"))}function d(){if("object"==typeof window){if(c)return;"undefined"!=typeof console&&"function"==typeof console.log&&console.log.apply(console,arguments)}}function g(e,t){u&&console.warn(e+" is deprecated, please use "+t+" instead.")}function m(e){const{navigator:t}=e,n={browser:null,version:null};if(void 0===e||!e.navigator)return n.browser="Not a browser.",n;if(t.mozGetUserMedia)n.browser="firefox",n.version=l(t.userAgent,/Firefox\/(\d+)\./,1);else if(t.webkitGetUserMedia||!1===e.isSecureContext&&e.webkitRTCPeerConnection&&!e.RTCIceGatherer)n.browser="chrome",n.version=l(t.userAgent,/Chrom(e|ium)\/(\d+)\./,2);else if(t.mediaDevices&&t.userAgent.match(/Edge\/(\d+).(\d+)$/))n.browser="edge",n.version=l(t.userAgent,/Edge\/(\d+).(\d+)$/,2);else{if(!e.RTCPeerConnection||!t.userAgent.match(/AppleWebKit\/(\d+)\./))return n.browser="Not a supported browser.",n;n.browser="safari",n.version=l(t.userAgent,/AppleWebKit\/(\d+)\./,1),n.supportsUnifiedPlan=e.RTCRtpTransceiver&&"currentDirection"in e.RTCRtpTransceiver.prototype}return n}function y(e){return"[object Object]"===Object.prototype.toString.call(e)}function v(e){return y(e)?Object.keys(e).reduce((function(t,n){const r=y(e[n]),i=r?v(e[n]):e[n],o=r&&!Object.keys(i).length;return void 0===i||o?t:Object.assign(t,{[n]:i})}),{}):e}function b(e,t,n){const r=n?"outbound-rtp":"inbound-rtp",i=new Map;if(null===t)return i;const o=[];return e.forEach(e=>{"track"===e.type&&e.trackIdentifier===t.id&&o.push(e)}),o.forEach(t=>{e.forEach(n=>{n.type===r&&n.trackId===t.id&&function e(t,n,r){n&&!r.has(n.id)&&(r.set(n.id,n),Object.keys(n).forEach(i=>{i.endsWith("Id")?e(t,t.get(n[i]),r):i.endsWith("Ids")&&n[i].forEach(n=>{e(t,t.get(n),r)})}))}(e,n,i)})}),i}const w=d;function x(e){const t=e&&e.navigator;if(!t.mediaDevices)return;const n=m(e),r=function(e){if("object"!=typeof e||e.mandatory||e.optional)return e;const t={};return Object.keys(e).forEach(n=>{if("require"===n||"advanced"===n||"mediaSource"===n)return;const r="object"==typeof e[n]?e[n]:{ideal:e[n]};void 0!==r.exact&&"number"==typeof r.exact&&(r.min=r.max=r.exact);const i=function(e,t){return e?e+t.charAt(0).toUpperCase()+t.slice(1):"deviceId"===t?"sourceId":t};if(void 0!==r.ideal){t.optional=t.optional||[];let e={};"number"==typeof r.ideal?(e[i("min",n)]=r.ideal,t.optional.push(e),e={},e[i("max",n)]=r.ideal,t.optional.push(e)):(e[i("",n)]=r.ideal,t.optional.push(e))}void 0!==r.exact&&"number"!=typeof r.exact?(t.mandatory=t.mandatory||{},t.mandatory[i("",n)]=r.exact):["min","max"].forEach(e=>{void 0!==r[e]&&(t.mandatory=t.mandatory||{},t.mandatory[i(e,n)]=r[e])})}),e.advanced&&(t.optional=(t.optional||[]).concat(e.advanced)),t},i=function(e,i){if(n.version>=61)return i(e);if((e=JSON.parse(JSON.stringify(e)))&&"object"==typeof e.audio){const t=function(e,t,n){t in e&&!(n in e)&&(e[n]=e[t],delete e[t])};t((e=JSON.parse(JSON.stringify(e))).audio,"autoGainControl","googAutoGainControl"),t(e.audio,"noiseSuppression","googNoiseSuppression"),e.audio=r(e.audio)}if(e&&"object"==typeof e.video){let o=e.video.facingMode;o=o&&("object"==typeof o?o:{ideal:o});const s=n.version<66;if(o&&("user"===o.exact||"environment"===o.exact||"user"===o.ideal||"environment"===o.ideal)&&(!t.mediaDevices.getSupportedConstraints||!t.mediaDevices.getSupportedConstraints().facingMode||s)){let n;if(delete e.video.facingMode,"environment"===o.exact||"environment"===o.ideal?n=["back","rear"]:"user"!==o.exact&&"user"!==o.ideal||(n=["front"]),n)return t.mediaDevices.enumerateDevices().then(t=>{let s=(t=t.filter(e=>"videoinput"===e.kind)).find(e=>n.some(t=>e.label.toLowerCase().includes(t)));return!s&&t.length&&n.includes("back")&&(s=t[t.length-1]),s&&(e.video.deviceId=o.exact?{exact:s.deviceId}:{ideal:s.deviceId}),e.video=r(e.video),w("chrome: "+JSON.stringify(e)),i(e)})}e.video=r(e.video)}return w("chrome: "+JSON.stringify(e)),i(e)},o=function(e){return n.version>=64?e:{name:{PermissionDeniedError:"NotAllowedError",PermissionDismissedError:"NotAllowedError",InvalidStateError:"NotAllowedError",DevicesNotFoundError:"NotFoundError",ConstraintNotSatisfiedError:"OverconstrainedError",TrackStartError:"NotReadableError",MediaDeviceFailedDueToShutdown:"NotAllowedError",MediaDeviceKillSwitchOn:"NotAllowedError",TabCaptureError:"AbortError",ScreenCaptureError:"AbortError",DeviceCaptureError:"AbortError"}[e.name]||e.name,message:e.message,constraint:e.constraint||e.constraintName,toString(){return this.name+(this.message&&": ")+this.message}}};if(t.getUserMedia=function(e,n,r){i(e,e=>{t.webkitGetUserMedia(e,n,e=>{r&&r(o(e))})})}.bind(t),t.mediaDevices.getUserMedia){const e=t.mediaDevices.getUserMedia.bind(t.mediaDevices);t.mediaDevices.getUserMedia=function(t){return i(t,t=>e(t).then(e=>{if(t.audio&&!e.getAudioTracks().length||t.video&&!e.getVideoTracks().length)throw e.getTracks().forEach(e=>{e.stop()}),new DOMException("","NotFoundError");return e},e=>Promise.reject(o(e))))}}}function k(e,t){e.navigator.mediaDevices&&"getDisplayMedia"in e.navigator.mediaDevices||e.navigator.mediaDevices&&("function"==typeof t?e.navigator.mediaDevices.getDisplayMedia=function(n){return t(n).then(t=>{const r=n.video&&n.video.width,i=n.video&&n.video.height,o=n.video&&n.video.frameRate;return n.video={mandatory:{chromeMediaSource:"desktop",chromeMediaSourceId:t,maxFrameRate:o||3}},r&&(n.video.mandatory.maxWidth=r),i&&(n.video.mandatory.maxHeight=i),e.navigator.mediaDevices.getUserMedia(n)})}:console.error("shimGetDisplayMedia: getSourceId argument is not a function"))}function T(e){e.MediaStream=e.MediaStream||e.webkitMediaStream}function C(e){if("object"!=typeof e||!e.RTCPeerConnection||"ontrack"in e.RTCPeerConnection.prototype)p(e,"track",e=>(e.transceiver||Object.defineProperty(e,"transceiver",{value:{receiver:e.receiver}}),e));else{Object.defineProperty(e.RTCPeerConnection.prototype,"ontrack",{get(){return this._ontrack},set(e){this._ontrack&&this.removeEventListener("track",this._ontrack),this.addEventListener("track",this._ontrack=e)},enumerable:!0,configurable:!0});const t=e.RTCPeerConnection.prototype.setRemoteDescription;e.RTCPeerConnection.prototype.setRemoteDescription=function(){return this._ontrackpoly||(this._ontrackpoly=t=>{t.stream.addEventListener("addtrack",n=>{let r;r=e.RTCPeerConnection.prototype.getReceivers?this.getReceivers().find(e=>e.track&&e.track.id===n.track.id):{track:n.track};const i=new Event("track");i.track=n.track,i.receiver=r,i.transceiver={receiver:r},i.streams=[t.stream],this.dispatchEvent(i)}),t.stream.getTracks().forEach(n=>{let r;r=e.RTCPeerConnection.prototype.getReceivers?this.getReceivers().find(e=>e.track&&e.track.id===n.id):{track:n};const i=new Event("track");i.track=n,i.receiver=r,i.transceiver={receiver:r},i.streams=[t.stream],this.dispatchEvent(i)})},this.addEventListener("addstream",this._ontrackpoly)),t.apply(this,arguments)}}}function S(e){if("object"==typeof e&&e.RTCPeerConnection&&!("getSenders"in e.RTCPeerConnection.prototype)&&"createDTMFSender"in e.RTCPeerConnection.prototype){const t=function(e,t){return{track:t,get dtmf(){return void 0===this._dtmf&&("audio"===t.kind?this._dtmf=e.createDTMFSender(t):this._dtmf=null),this._dtmf},_pc:e}};if(!e.RTCPeerConnection.prototype.getSenders){e.RTCPeerConnection.prototype.getSenders=function(){return this._senders=this._senders||[],this._senders.slice()};const n=e.RTCPeerConnection.prototype.addTrack;e.RTCPeerConnection.prototype.addTrack=function(e,r){let i=n.apply(this,arguments);return i||(i=t(this,e),this._senders.push(i)),i};const r=e.RTCPeerConnection.prototype.removeTrack;e.RTCPeerConnection.prototype.removeTrack=function(e){r.apply(this,arguments);const t=this._senders.indexOf(e);-1!==t&&this._senders.splice(t,1)}}const n=e.RTCPeerConnection.prototype.addStream;e.RTCPeerConnection.prototype.addStream=function(e){this._senders=this._senders||[],n.apply(this,[e]),e.getTracks().forEach(e=>{this._senders.push(t(this,e))})};const r=e.RTCPeerConnection.prototype.removeStream;e.RTCPeerConnection.prototype.removeStream=function(e){this._senders=this._senders||[],r.apply(this,[e]),e.getTracks().forEach(e=>{const t=this._senders.find(t=>t.track===e);t&&this._senders.splice(this._senders.indexOf(t),1)})}}else if("object"==typeof e&&e.RTCPeerConnection&&"getSenders"in e.RTCPeerConnection.prototype&&"createDTMFSender"in e.RTCPeerConnection.prototype&&e.RTCRtpSender&&!("dtmf"in e.RTCRtpSender.prototype)){const t=e.RTCPeerConnection.prototype.getSenders;e.RTCPeerConnection.prototype.getSenders=function(){const e=t.apply(this,[]);return e.forEach(e=>e._pc=this),e},Object.defineProperty(e.RTCRtpSender.prototype,"dtmf",{get(){return void 0===this._dtmf&&("audio"===this.track.kind?this._dtmf=this._pc.createDTMFSender(this.track):this._dtmf=null),this._dtmf}})}}function E(e){if(!e.RTCPeerConnection)return;const t=e.RTCPeerConnection.prototype.getStats;e.RTCPeerConnection.prototype.getStats=function(){const[e,n,r]=arguments;if(arguments.length>0&&"function"==typeof e)return t.apply(this,arguments);if(0===t.length&&(0===arguments.length||"function"!=typeof e))return t.apply(this,[]);const i=function(e){const t={};return e.result().forEach(e=>{const n={id:e.id,timestamp:e.timestamp,type:{localcandidate:"local-candidate",remotecandidate:"remote-candidate"}[e.type]||e.type};e.names().forEach(t=>{n[t]=e.stat(t)}),t[n.id]=n}),t},o=function(e){return new Map(Object.keys(e).map(t=>[t,e[t]]))};if(arguments.length>=2){const r=function(e){n(o(i(e)))};return t.apply(this,[r,e])}return new Promise((e,n)=>{t.apply(this,[function(t){e(o(i(t)))},n])}).then(n,r)}}function R(e){if(!("object"==typeof e&&e.RTCPeerConnection&&e.RTCRtpSender&&e.RTCRtpReceiver))return;if(!("getStats"in e.RTCRtpSender.prototype)){const t=e.RTCPeerConnection.prototype.getSenders;t&&(e.RTCPeerConnection.prototype.getSenders=function(){const e=t.apply(this,[]);return e.forEach(e=>e._pc=this),e});const n=e.RTCPeerConnection.prototype.addTrack;n&&(e.RTCPeerConnection.prototype.addTrack=function(){const e=n.apply(this,arguments);return e._pc=this,e}),e.RTCRtpSender.prototype.getStats=function(){const e=this;return this._pc.getStats().then(t=>b(t,e.track,!0))}}if(!("getStats"in e.RTCRtpReceiver.prototype)){const t=e.RTCPeerConnection.prototype.getReceivers;t&&(e.RTCPeerConnection.prototype.getReceivers=function(){const e=t.apply(this,[]);return e.forEach(e=>e._pc=this),e}),p(e,"track",e=>(e.receiver._pc=e.srcElement,e)),e.RTCRtpReceiver.prototype.getStats=function(){const e=this;return this._pc.getStats().then(t=>b(t,e.track,!1))}}if(!("getStats"in e.RTCRtpSender.prototype&&"getStats"in e.RTCRtpReceiver.prototype))return;const t=e.RTCPeerConnection.prototype.getStats;e.RTCPeerConnection.prototype.getStats=function(){if(arguments.length>0&&arguments[0]instanceof e.MediaStreamTrack){const e=arguments[0];let t,n,r;return this.getSenders().forEach(n=>{n.track===e&&(t?r=!0:t=n)}),this.getReceivers().forEach(t=>(t.track===e&&(n?r=!0:n=t),t.track===e)),r||t&&n?Promise.reject(new DOMException("There are more than one sender or receiver for the track.","InvalidAccessError")):t?t.getStats():n?n.getStats():Promise.reject(new DOMException("There is no sender or receiver for the track.","InvalidAccessError"))}return t.apply(this,arguments)}}function P(e){e.RTCPeerConnection.prototype.getLocalStreams=function(){return this._shimmedLocalStreams=this._shimmedLocalStreams||{},Object.keys(this._shimmedLocalStreams).map(e=>this._shimmedLocalStreams[e][0])};const t=e.RTCPeerConnection.prototype.addTrack;e.RTCPeerConnection.prototype.addTrack=function(e,n){if(!n)return t.apply(this,arguments);this._shimmedLocalStreams=this._shimmedLocalStreams||{};const r=t.apply(this,arguments);return this._shimmedLocalStreams[n.id]?-1===this._shimmedLocalStreams[n.id].indexOf(r)&&this._shimmedLocalStreams[n.id].push(r):this._shimmedLocalStreams[n.id]=[n,r],r};const n=e.RTCPeerConnection.prototype.addStream;e.RTCPeerConnection.prototype.addStream=function(e){this._shimmedLocalStreams=this._shimmedLocalStreams||{},e.getTracks().forEach(e=>{if(this.getSenders().find(t=>t.track===e))throw new DOMException("Track already exists.","InvalidAccessError")});const t=this.getSenders();n.apply(this,arguments);const r=this.getSenders().filter(e=>-1===t.indexOf(e));this._shimmedLocalStreams[e.id]=[e].concat(r)};const r=e.RTCPeerConnection.prototype.removeStream;e.RTCPeerConnection.prototype.removeStream=function(e){return this._shimmedLocalStreams=this._shimmedLocalStreams||{},delete this._shimmedLocalStreams[e.id],r.apply(this,arguments)};const i=e.RTCPeerConnection.prototype.removeTrack;e.RTCPeerConnection.prototype.removeTrack=function(e){return this._shimmedLocalStreams=this._shimmedLocalStreams||{},e&&Object.keys(this._shimmedLocalStreams).forEach(t=>{const n=this._shimmedLocalStreams[t].indexOf(e);-1!==n&&this._shimmedLocalStreams[t].splice(n,1),1===this._shimmedLocalStreams[t].length&&delete this._shimmedLocalStreams[t]}),i.apply(this,arguments)}}function O(e){if(!e.RTCPeerConnection)return;const t=m(e);if(e.RTCPeerConnection.prototype.addTrack&&t.version>=65)return P(e);const n=e.RTCPeerConnection.prototype.getLocalStreams;e.RTCPeerConnection.prototype.getLocalStreams=function(){const e=n.apply(this);return this._reverseStreams=this._reverseStreams||{},e.map(e=>this._reverseStreams[e.id])};const r=e.RTCPeerConnection.prototype.addStream;e.RTCPeerConnection.prototype.addStream=function(t){if(this._streams=this._streams||{},this._reverseStreams=this._reverseStreams||{},t.getTracks().forEach(e=>{if(this.getSenders().find(t=>t.track===e))throw new DOMException("Track already exists.","InvalidAccessError")}),!this._reverseStreams[t.id]){const n=new e.MediaStream(t.getTracks());this._streams[t.id]=n,this._reverseStreams[n.id]=t,t=n}r.apply(this,[t])};const i=e.RTCPeerConnection.prototype.removeStream;function o(e,t){let n=t.sdp;return Object.keys(e._reverseStreams||[]).forEach(t=>{const r=e._reverseStreams[t],i=e._streams[r.id];n=n.replace(new RegExp(i.id,"g"),r.id)}),new RTCSessionDescription({type:t.type,sdp:n})}function s(e,t){let n=t.sdp;return Object.keys(e._reverseStreams||[]).forEach(t=>{const r=e._reverseStreams[t],i=e._streams[r.id];n=n.replace(new RegExp(r.id,"g"),i.id)}),new RTCSessionDescription({type:t.type,sdp:n})}e.RTCPeerConnection.prototype.removeStream=function(e){this._streams=this._streams||{},this._reverseStreams=this._reverseStreams||{},i.apply(this,[this._streams[e.id]||e]),delete this._reverseStreams[this._streams[e.id]?this._streams[e.id].id:e.id],delete this._streams[e.id]},e.RTCPeerConnection.prototype.addTrack=function(t,n){if("closed"===this.signalingState)throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.","InvalidStateError");const r=[].slice.call(arguments,1);if(1!==r.length||!r[0].getTracks().find(e=>e===t))throw new DOMException("The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.","NotSupportedError");const i=this.getSenders().find(e=>e.track===t);if(i)throw new DOMException("Track already exists.","InvalidAccessError");this._streams=this._streams||{},this._reverseStreams=this._reverseStreams||{};const o=this._streams[n.id];if(o)o.addTrack(t),Promise.resolve().then(()=>{this.dispatchEvent(new Event("negotiationneeded"))});else{const r=new e.MediaStream([t]);this._streams[n.id]=r,this._reverseStreams[r.id]=n,this.addStream(r)}return this.getSenders().find(e=>e.track===t)},["createOffer","createAnswer"].forEach((function(t){const n=e.RTCPeerConnection.prototype[t],r={[t](){const e=arguments;return arguments.length&&"function"==typeof arguments[0]?n.apply(this,[t=>{const n=o(this,t);e[0].apply(null,[n])},t=>{e[1]&&e[1].apply(null,t)},arguments[2]]):n.apply(this,arguments).then(e=>o(this,e))}};e.RTCPeerConnection.prototype[t]=r[t]}));const a=e.RTCPeerConnection.prototype.setLocalDescription;e.RTCPeerConnection.prototype.setLocalDescription=function(){return arguments.length&&arguments[0].type?(arguments[0]=s(this,arguments[0]),a.apply(this,arguments)):a.apply(this,arguments)};const c=Object.getOwnPropertyDescriptor(e.RTCPeerConnection.prototype,"localDescription");Object.defineProperty(e.RTCPeerConnection.prototype,"localDescription",{get(){const e=c.get.apply(this);return""===e.type?e:o(this,e)}}),e.RTCPeerConnection.prototype.removeTrack=function(e){if("closed"===this.signalingState)throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.","InvalidStateError");if(!e._pc)throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.","TypeError");if(!(e._pc===this))throw new DOMException("Sender was not created by this connection.","InvalidAccessError");let t;this._streams=this._streams||{},Object.keys(this._streams).forEach(n=>{this._streams[n].getTracks().find(t=>e.track===t)&&(t=this._streams[n])}),t&&(1===t.getTracks().length?this.removeStream(this._reverseStreams[t.id]):t.removeTrack(e.track),this.dispatchEvent(new Event("negotiationneeded")))}}function A(e){const t=m(e);if(!e.RTCPeerConnection&&e.webkitRTCPeerConnection&&(e.RTCPeerConnection=e.webkitRTCPeerConnection),!e.RTCPeerConnection)return;t.version<53&&["setLocalDescription","setRemoteDescription","addIceCandidate"].forEach((function(t){const n=e.RTCPeerConnection.prototype[t],r={[t](){return arguments[0]=new("addIceCandidate"===t?e.RTCIceCandidate:e.RTCSessionDescription)(arguments[0]),n.apply(this,arguments)}};e.RTCPeerConnection.prototype[t]=r[t]}));const n=e.RTCPeerConnection.prototype.addIceCandidate;e.RTCPeerConnection.prototype.addIceCandidate=function(){return arguments[0]?t.version<78&&arguments[0]&&""===arguments[0].candidate?Promise.resolve():n.apply(this,arguments):(arguments[1]&&arguments[1].apply(null),Promise.resolve())}}function D(e){p(e,"negotiationneeded",e=>{if("stable"===e.target.signalingState)return e})}var N=n(6),_=n.n(N);function I(e){const t=e&&e.navigator,n=t.mediaDevices.getUserMedia.bind(t.mediaDevices);t.mediaDevices.getUserMedia=function(e){return n(e).catch(e=>Promise.reject(function(e){return{name:{PermissionDeniedError:"NotAllowedError"}[e.name]||e.name,message:e.message,constraint:e.constraint,toString(){return this.name}}}(e)))}}function j(e){"getDisplayMedia"in e.navigator&&e.navigator.mediaDevices&&(e.navigator.mediaDevices&&"getDisplayMedia"in e.navigator.mediaDevices||(e.navigator.mediaDevices.getDisplayMedia=e.navigator.getDisplayMedia.bind(e.navigator)))}function L(e){const t=m(e);if(e.RTCIceGatherer&&(e.RTCIceCandidate||(e.RTCIceCandidate=function(e){return e}),e.RTCSessionDescription||(e.RTCSessionDescription=function(e){return e}),t.version<15025)){const t=Object.getOwnPropertyDescriptor(e.MediaStreamTrack.prototype,"enabled");Object.defineProperty(e.MediaStreamTrack.prototype,"enabled",{set(e){t.set.call(this,e);const n=new Event("enabled");n.enabled=e,this.dispatchEvent(n)}})}!e.RTCRtpSender||"dtmf"in e.RTCRtpSender.prototype||Object.defineProperty(e.RTCRtpSender.prototype,"dtmf",{get(){return void 0===this._dtmf&&("audio"===this.track.kind?this._dtmf=new e.RTCDtmfSender(this):"video"===this.track.kind&&(this._dtmf=null)),this._dtmf}}),e.RTCDtmfSender&&!e.RTCDTMFSender&&(e.RTCDTMFSender=e.RTCDtmfSender);const n=_()(e,t.version);e.RTCPeerConnection=function(e){return e&&e.iceServers&&(e.iceServers=function(e,t){let n=!1;return(e=JSON.parse(JSON.stringify(e))).filter(e=>{if(e&&(e.urls||e.url)){var t=e.urls||e.url;e.url&&!e.urls&&g("RTCIceServer.url","RTCIceServer.urls");const r="string"==typeof t;return r&&(t=[t]),t=t.filter(e=>{if(0===e.indexOf("stun:"))return!1;const t=e.startsWith("turn")&&!e.startsWith("turn:[")&&e.includes("transport=udp");return t&&!n?(n=!0,!0):t&&!n}),delete e.url,e.urls=r?t[0]:t,!!t.length}})}(e.iceServers,t.version),d("ICE servers after filtering:",e.iceServers)),new n(e)},e.RTCPeerConnection.prototype=n.prototype}function M(e){!e.RTCRtpSender||"replaceTrack"in e.RTCRtpSender.prototype||(e.RTCRtpSender.prototype.replaceTrack=e.RTCRtpSender.prototype.setTrack)}function U(e){const t=m(e),n=e&&e.navigator,r=e&&e.MediaStreamTrack;if(n.getUserMedia=function(e,t,r){g("navigator.getUserMedia","navigator.mediaDevices.getUserMedia"),n.mediaDevices.getUserMedia(e).then(t,r)},!(t.version>55&&"autoGainControl"in n.mediaDevices.getSupportedConstraints())){const e=function(e,t,n){t in e&&!(n in e)&&(e[n]=e[t],delete e[t])},t=n.mediaDevices.getUserMedia.bind(n.mediaDevices);if(n.mediaDevices.getUserMedia=function(n){return"object"==typeof n&&"object"==typeof n.audio&&(n=JSON.parse(JSON.stringify(n)),e(n.audio,"autoGainControl","mozAutoGainControl"),e(n.audio,"noiseSuppression","mozNoiseSuppression")),t(n)},r&&r.prototype.getSettings){const t=r.prototype.getSettings;r.prototype.getSettings=function(){const n=t.apply(this,arguments);return e(n,"mozAutoGainControl","autoGainControl"),e(n,"mozNoiseSuppression","noiseSuppression"),n}}if(r&&r.prototype.applyConstraints){const t=r.prototype.applyConstraints;r.prototype.applyConstraints=function(n){return"audio"===this.kind&&"object"==typeof n&&(n=JSON.parse(JSON.stringify(n)),e(n,"autoGainControl","mozAutoGainControl"),e(n,"noiseSuppression","mozNoiseSuppression")),t.apply(this,[n])}}}}function B(e,t){e.navigator.mediaDevices&&"getDisplayMedia"in e.navigator.mediaDevices||e.navigator.mediaDevices&&(e.navigator.mediaDevices.getDisplayMedia=function(n){if(!n||!n.video){const e=new DOMException("getDisplayMedia without video constraints is undefined");return e.name="NotFoundError",e.code=8,Promise.reject(e)}return!0===n.video?n.video={mediaSource:t}:n.video.mediaSource=t,e.navigator.mediaDevices.getUserMedia(n)})}function F(e){"object"==typeof e&&e.RTCTrackEvent&&"receiver"in e.RTCTrackEvent.prototype&&!("transceiver"in e.RTCTrackEvent.prototype)&&Object.defineProperty(e.RTCTrackEvent.prototype,"transceiver",{get(){return{receiver:this.receiver}}})}function q(e){const t=m(e);if("object"!=typeof e||!e.RTCPeerConnection&&!e.mozRTCPeerConnection)return;if(!e.RTCPeerConnection&&e.mozRTCPeerConnection&&(e.RTCPeerConnection=e.mozRTCPeerConnection),t.version<53&&["setLocalDescription","setRemoteDescription","addIceCandidate"].forEach((function(t){const n=e.RTCPeerConnection.prototype[t],r={[t](){return arguments[0]=new("addIceCandidate"===t?e.RTCIceCandidate:e.RTCSessionDescription)(arguments[0]),n.apply(this,arguments)}};e.RTCPeerConnection.prototype[t]=r[t]})),t.version<68){const t=e.RTCPeerConnection.prototype.addIceCandidate;e.RTCPeerConnection.prototype.addIceCandidate=function(){return arguments[0]?arguments[0]&&""===arguments[0].candidate?Promise.resolve():t.apply(this,arguments):(arguments[1]&&arguments[1].apply(null),Promise.resolve())}}const n={inboundrtp:"inbound-rtp",outboundrtp:"outbound-rtp",candidatepair:"candidate-pair",localcandidate:"local-candidate",remotecandidate:"remote-candidate"},r=e.RTCPeerConnection.prototype.getStats;e.RTCPeerConnection.prototype.getStats=function(){const[e,i,o]=arguments;return r.apply(this,[e||null]).then(e=>{if(t.version<53&&!i)try{e.forEach(e=>{e.type=n[e.type]||e.type})}catch(t){if("TypeError"!==t.name)throw t;e.forEach((t,r)=>{e.set(r,Object.assign({},t,{type:n[t.type]||t.type}))})}return e}).then(i,o)}}function G(e){if("object"!=typeof e||!e.RTCPeerConnection||!e.RTCRtpSender)return;if(e.RTCRtpSender&&"getStats"in e.RTCRtpSender.prototype)return;const t=e.RTCPeerConnection.prototype.getSenders;t&&(e.RTCPeerConnection.prototype.getSenders=function(){const e=t.apply(this,[]);return e.forEach(e=>e._pc=this),e});const n=e.RTCPeerConnection.prototype.addTrack;n&&(e.RTCPeerConnection.prototype.addTrack=function(){const e=n.apply(this,arguments);return e._pc=this,e}),e.RTCRtpSender.prototype.getStats=function(){return this.track?this._pc.getStats(this.track):Promise.resolve(new Map)}}function W(e){if("object"!=typeof e||!e.RTCPeerConnection||!e.RTCRtpSender)return;if(e.RTCRtpSender&&"getStats"in e.RTCRtpReceiver.prototype)return;const t=e.RTCPeerConnection.prototype.getReceivers;t&&(e.RTCPeerConnection.prototype.getReceivers=function(){const e=t.apply(this,[]);return e.forEach(e=>e._pc=this),e}),p(e,"track",e=>(e.receiver._pc=e.srcElement,e)),e.RTCRtpReceiver.prototype.getStats=function(){return this._pc.getStats(this.track)}}function H(e){!e.RTCPeerConnection||"removeStream"in e.RTCPeerConnection.prototype||(e.RTCPeerConnection.prototype.removeStream=function(e){g("removeStream","removeTrack"),this.getSenders().forEach(t=>{t.track&&e.getTracks().includes(t.track)&&this.removeTrack(t)})})}function V(e){e.DataChannel&&!e.RTCDataChannel&&(e.RTCDataChannel=e.DataChannel)}function z(e){if("object"!=typeof e||!e.RTCPeerConnection)return;const t=e.RTCPeerConnection.prototype.addTransceiver;t&&(e.RTCPeerConnection.prototype.addTransceiver=function(){this.setParametersPromises=[];const e=arguments[1],n=e&&"sendEncodings"in e;n&&e.sendEncodings.forEach(e=>{if("rid"in e){if(!/^[a-z0-9]{0,16}$/i.test(e.rid))throw new TypeError("Invalid RID value provided.")}if("scaleResolutionDownBy"in e&&!(parseFloat(e.scaleResolutionDownBy)>=1))throw new RangeError("scale_resolution_down_by must be >= 1.0");if("maxFramerate"in e&&!(parseFloat(e.maxFramerate)>=0))throw new RangeError("max_framerate must be >= 0.0")});const r=t.apply(this,arguments);if(n){const{sender:t}=r,n=t.getParameters();"encodings"in n||(n.encodings=e.sendEncodings,this.setParametersPromises.push(t.setParameters(n).catch(()=>{})))}return r})}function $(e){if("object"!=typeof e||!e.RTCPeerConnection)return;const t=e.RTCPeerConnection.prototype.createOffer;e.RTCPeerConnection.prototype.createOffer=function(){return this.setParametersPromises&&this.setParametersPromises.length?Promise.all(this.setParametersPromises).then(()=>t.apply(this,arguments)).finally(()=>{this.setParametersPromises=[]}):t.apply(this,arguments)}}function J(e){if("object"!=typeof e||!e.RTCPeerConnection)return;const t=e.RTCPeerConnection.prototype.createAnswer;e.RTCPeerConnection.prototype.createAnswer=function(){return this.setParametersPromises&&this.setParametersPromises.length?Promise.all(this.setParametersPromises).then(()=>t.apply(this,arguments)).finally(()=>{this.setParametersPromises=[]}):t.apply(this,arguments)}}function Y(e){if("object"==typeof e&&e.RTCPeerConnection){if("getLocalStreams"in e.RTCPeerConnection.prototype||(e.RTCPeerConnection.prototype.getLocalStreams=function(){return this._localStreams||(this._localStreams=[]),this._localStreams}),!("addStream"in e.RTCPeerConnection.prototype)){const t=e.RTCPeerConnection.prototype.addTrack;e.RTCPeerConnection.prototype.addStream=function(e){this._localStreams||(this._localStreams=[]),this._localStreams.includes(e)||this._localStreams.push(e),e.getAudioTracks().forEach(n=>t.call(this,n,e)),e.getVideoTracks().forEach(n=>t.call(this,n,e))},e.RTCPeerConnection.prototype.addTrack=function(e){const n=arguments[1];return n&&(this._localStreams?this._localStreams.includes(n)||this._localStreams.push(n):this._localStreams=[n]),t.apply(this,arguments)}}"removeStream"in e.RTCPeerConnection.prototype||(e.RTCPeerConnection.prototype.removeStream=function(e){this._localStreams||(this._localStreams=[]);const t=this._localStreams.indexOf(e);if(-1===t)return;this._localStreams.splice(t,1);const n=e.getTracks();this.getSenders().forEach(e=>{n.includes(e.track)&&this.removeTrack(e)})})}}function K(e){if("object"==typeof e&&e.RTCPeerConnection&&("getRemoteStreams"in e.RTCPeerConnection.prototype||(e.RTCPeerConnection.prototype.getRemoteStreams=function(){return this._remoteStreams?this._remoteStreams:[]}),!("onaddstream"in e.RTCPeerConnection.prototype))){Object.defineProperty(e.RTCPeerConnection.prototype,"onaddstream",{get(){return this._onaddstream},set(e){this._onaddstream&&(this.removeEventListener("addstream",this._onaddstream),this.removeEventListener("track",this._onaddstreampoly)),this.addEventListener("addstream",this._onaddstream=e),this.addEventListener("track",this._onaddstreampoly=e=>{e.streams.forEach(e=>{if(this._remoteStreams||(this._remoteStreams=[]),this._remoteStreams.includes(e))return;this._remoteStreams.push(e);const t=new Event("addstream");t.stream=e,this.dispatchEvent(t)})})}});const t=e.RTCPeerConnection.prototype.setRemoteDescription;e.RTCPeerConnection.prototype.setRemoteDescription=function(){const e=this;return this._onaddstreampoly||this.addEventListener("track",this._onaddstreampoly=function(t){t.streams.forEach(t=>{if(e._remoteStreams||(e._remoteStreams=[]),e._remoteStreams.indexOf(t)>=0)return;e._remoteStreams.push(t);const n=new Event("addstream");n.stream=t,e.dispatchEvent(n)})}),t.apply(e,arguments)}}}function Q(e){if("object"!=typeof e||!e.RTCPeerConnection)return;const t=e.RTCPeerConnection.prototype,n=t.createOffer,r=t.createAnswer,i=t.setLocalDescription,o=t.setRemoteDescription,s=t.addIceCandidate;t.createOffer=function(e,t){const r=arguments.length>=2?arguments[2]:arguments[0],i=n.apply(this,[r]);return t?(i.then(e,t),Promise.resolve()):i},t.createAnswer=function(e,t){const n=arguments.length>=2?arguments[2]:arguments[0],i=r.apply(this,[n]);return t?(i.then(e,t),Promise.resolve()):i};let a=function(e,t,n){const r=i.apply(this,[e]);return n?(r.then(t,n),Promise.resolve()):r};t.setLocalDescription=a,a=function(e,t,n){const r=o.apply(this,[e]);return n?(r.then(t,n),Promise.resolve()):r},t.setRemoteDescription=a,a=function(e,t,n){const r=s.apply(this,[e]);return n?(r.then(t,n),Promise.resolve()):r},t.addIceCandidate=a}function X(e){const t=e&&e.navigator;if(t.mediaDevices&&t.mediaDevices.getUserMedia){const e=t.mediaDevices,n=e.getUserMedia.bind(e);t.mediaDevices.getUserMedia=e=>n(Z(e))}!t.getUserMedia&&t.mediaDevices&&t.mediaDevices.getUserMedia&&(t.getUserMedia=function(e,n,r){t.mediaDevices.getUserMedia(e).then(n,r)}.bind(t))}function Z(e){return e&&void 0!==e.video?Object.assign({},e,{video:v(e.video)}):e}function ee(e){const t=e.RTCPeerConnection;e.RTCPeerConnection=function(e,n){if(e&&e.iceServers){const t=[];for(let n=0;n<e.iceServers.length;n++){let r=e.iceServers[n];!r.hasOwnProperty("urls")&&r.hasOwnProperty("url")?(g("RTCIceServer.url","RTCIceServer.urls"),r=JSON.parse(JSON.stringify(r)),r.urls=r.url,delete r.url,t.push(r)):t.push(e.iceServers[n])}e.iceServers=t}return new t(e,n)},e.RTCPeerConnection.prototype=t.prototype,"generateCertificate"in e.RTCPeerConnection&&Object.defineProperty(e.RTCPeerConnection,"generateCertificate",{get:()=>t.generateCertificate})}function te(e){"object"==typeof e&&e.RTCTrackEvent&&"receiver"in e.RTCTrackEvent.prototype&&!("transceiver"in e.RTCTrackEvent.prototype)&&Object.defineProperty(e.RTCTrackEvent.prototype,"transceiver",{get(){return{receiver:this.receiver}}})}function ne(e){const t=e.RTCPeerConnection.prototype.createOffer;e.RTCPeerConnection.prototype.createOffer=function(e){if(e){void 0!==e.offerToReceiveAudio&&(e.offerToReceiveAudio=!!e.offerToReceiveAudio);const t=this.getTransceivers().find(e=>"audio"===e.receiver.track.kind);!1===e.offerToReceiveAudio&&t?"sendrecv"===t.direction?t.setDirection?t.setDirection("sendonly"):t.direction="sendonly":"recvonly"===t.direction&&(t.setDirection?t.setDirection("inactive"):t.direction="inactive"):!0!==e.offerToReceiveAudio||t||this.addTransceiver("audio"),void 0!==e.offerToReceiveVideo&&(e.offerToReceiveVideo=!!e.offerToReceiveVideo);const n=this.getTransceivers().find(e=>"video"===e.receiver.track.kind);!1===e.offerToReceiveVideo&&n?"sendrecv"===n.direction?n.setDirection?n.setDirection("sendonly"):n.direction="sendonly":"recvonly"===n.direction&&(n.setDirection?n.setDirection("inactive"):n.direction="inactive"):!0!==e.offerToReceiveVideo||n||this.addTransceiver("video")}return t.apply(this,arguments)}}var re=n(1),ie=n.n(re);function oe(e){if(!e.RTCIceCandidate||e.RTCIceCandidate&&"foundation"in e.RTCIceCandidate.prototype)return;const t=e.RTCIceCandidate;e.RTCIceCandidate=function(e){if("object"==typeof e&&e.candidate&&0===e.candidate.indexOf("a=")&&((e=JSON.parse(JSON.stringify(e))).candidate=e.candidate.substr(2)),e.candidate&&e.candidate.length){const n=new t(e),r=ie.a.parseCandidate(e.candidate),i=Object.assign(n,r);return i.toJSON=function(){return{candidate:i.candidate,sdpMid:i.sdpMid,sdpMLineIndex:i.sdpMLineIndex,usernameFragment:i.usernameFragment}},i}return new t(e)},e.RTCIceCandidate.prototype=t.prototype,p(e,"icecandidate",t=>(t.candidate&&Object.defineProperty(t,"candidate",{value:new e.RTCIceCandidate(t.candidate),writable:"false"}),t))}function se(e){if(!e.RTCPeerConnection)return;const t=m(e);"sctp"in e.RTCPeerConnection.prototype||Object.defineProperty(e.RTCPeerConnection.prototype,"sctp",{get(){return void 0===this._sctp?null:this._sctp}});const n=function(e){if(!e||!e.sdp)return!1;const t=ie.a.splitSections(e.sdp);return t.shift(),t.some(e=>{const t=ie.a.parseMLine(e);return t&&"application"===t.kind&&-1!==t.protocol.indexOf("SCTP")})},r=function(e){const t=e.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);if(null===t||t.length<2)return-1;const n=parseInt(t[1],10);return n!=n?-1:n},i=function(e){let n=65536;return"firefox"===t.browser&&(n=t.version<57?-1===e?16384:2147483637:t.version<60?57===t.version?65535:65536:2147483637),n},o=function(e,n){let r=65536;"firefox"===t.browser&&57===t.version&&(r=65535);const i=ie.a.matchPrefix(e.sdp,"a=max-message-size:");return i.length>0?r=parseInt(i[0].substr(19),10):"firefox"===t.browser&&-1!==n&&(r=2147483637),r},s=e.RTCPeerConnection.prototype.setRemoteDescription;e.RTCPeerConnection.prototype.setRemoteDescription=function(){if(this._sctp=null,"chrome"===t.browser&&t.version>=76){const{sdpSemantics:e}=this.getConfiguration();"plan-b"===e&&Object.defineProperty(this,"sctp",{get(){return void 0===this._sctp?null:this._sctp},enumerable:!0,configurable:!0})}if(n(arguments[0])){const e=r(arguments[0]),t=i(e),n=o(arguments[0],e);let s;s=0===t&&0===n?Number.POSITIVE_INFINITY:0===t||0===n?Math.max(t,n):Math.min(t,n);const a={};Object.defineProperty(a,"maxMessageSize",{get:()=>s}),this._sctp=a}return s.apply(this,arguments)}}function ae(e){if(!(e.RTCPeerConnection&&"createDataChannel"in e.RTCPeerConnection.prototype))return;function t(e,t){const n=e.send;e.send=function(){const r=arguments[0],i=r.length||r.size||r.byteLength;if("open"===e.readyState&&t.sctp&&i>t.sctp.maxMessageSize)throw new TypeError("Message too large (can send a maximum of "+t.sctp.maxMessageSize+" bytes)");return n.apply(e,arguments)}}const n=e.RTCPeerConnection.prototype.createDataChannel;e.RTCPeerConnection.prototype.createDataChannel=function(){const e=n.apply(this,arguments);return t(e,this),e},p(e,"datachannel",e=>(t(e.channel,e.target),e))}function ce(e){if(!e.RTCPeerConnection||"connectionState"in e.RTCPeerConnection.prototype)return;const t=e.RTCPeerConnection.prototype;Object.defineProperty(t,"connectionState",{get(){return{completed:"connected",checking:"connecting"}[this.iceConnectionState]||this.iceConnectionState},enumerable:!0,configurable:!0}),Object.defineProperty(t,"onconnectionstatechange",{get(){return this._onconnectionstatechange||null},set(e){this._onconnectionstatechange&&(this.removeEventListener("connectionstatechange",this._onconnectionstatechange),delete this._onconnectionstatechange),e&&this.addEventListener("connectionstatechange",this._onconnectionstatechange=e)},enumerable:!0,configurable:!0}),["setLocalDescription","setRemoteDescription"].forEach(e=>{const n=t[e];t[e]=function(){return this._connectionstatechangepoly||(this._connectionstatechangepoly=e=>{const t=e.target;if(t._lastConnectionState!==t.connectionState){t._lastConnectionState=t.connectionState;const n=new Event("connectionstatechange",e);t.dispatchEvent(n)}return e},this.addEventListener("iceconnectionstatechange",this._connectionstatechangepoly)),n.apply(this,arguments)}})}function ue(e){if(!e.RTCPeerConnection)return;const t=m(e);if("chrome"===t.browser&&t.version>=71)return;const n=e.RTCPeerConnection.prototype.setRemoteDescription;e.RTCPeerConnection.prototype.setRemoteDescription=function(e){return e&&e.sdp&&-1!==e.sdp.indexOf("\na=extmap-allow-mixed")&&(e.sdp=e.sdp.split("\n").filter(e=>"a=extmap-allow-mixed"!==e.trim()).join("\n")),n.apply(this,arguments)}}const le=function({window:e}={},t={shimChrome:!0,shimFirefox:!0,shimEdge:!0,shimSafari:!0}){const n=d,c=m(e),u={browserDetails:c,commonShim:a,extractVersion:l,disableLog:h,disableWarnings:f};switch(c.browser){case"chrome":if(!r||!A||!t.shimChrome)return n("Chrome shim is not included in this adapter release."),u;n("adapter.js shimming chrome."),u.browserShim=r,x(e),T(e),A(e),C(e),O(e),S(e),E(e),R(e),D(e),oe(e),ce(e),se(e),ae(e),ue(e);break;case"firefox":if(!o||!q||!t.shimFirefox)return n("Firefox shim is not included in this adapter release."),u;n("adapter.js shimming firefox."),u.browserShim=o,U(e),q(e),F(e),H(e),G(e),W(e),V(e),z(e),$(e),J(e),oe(e),ce(e),se(e),ae(e);break;case"edge":if(!i||!L||!t.shimEdge)return n("MS edge shim is not included in this adapter release."),u;n("adapter.js shimming edge."),u.browserShim=i,I(e),j(e),L(e),M(e),se(e),ae(e);break;case"safari":if(!s||!t.shimSafari)return n("Safari shim is not included in this adapter release."),u;n("adapter.js shimming safari."),u.browserShim=s,ee(e),ne(e),Q(e),Y(e),K(e),te(e),X(e),oe(e),se(e),ae(e),ue(e);break;default:n("Unsupported browser!")}return u}({window:window});t.default=le}])}));
//# sourceMappingURL=stage.min.js.map

/***/ }),

/***/ "./js/flot/jquery.flot.categories.js":
/*!*******************************************!*\
  !*** ./js/flot/jquery.flot.categories.js ***!
  \*******************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

/* Flot plugin for plotting textual data or categories.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

Consider a dataset like [["February", 34], ["March", 20], ...]. This plugin
allows you to plot such a dataset directly.

To enable it, you must specify mode: "categories" on the axis with the textual
labels, e.g.

	$.plot("#placeholder", data, { xaxis: { mode: "categories" } });

By default, the labels are ordered as they are met in the data series. If you
need a different ordering, you can specify "categories" on the axis options
and list the categories there:

	xaxis: {
		mode: "categories",
		categories: ["February", "March", "April"]
	}

If you need to customize the distances between the categories, you can specify
"categories" as an object mapping labels to values

	xaxis: {
		mode: "categories",
		categories: { "February": 1, "March": 3, "April": 4 }
	}

If you don't specify all categories, the remaining categories will be numbered
from the max value plus 1 (with a spacing of 1 between each).

Internally, the plugin works by transforming the input data through an auto-
generated mapping where the first category becomes 0, the second 1, etc.
Hence, a point like ["February", 34] becomes [0, 34] internally in Flot (this
is visible in hover and click events that return numbers rather than the
category labels). The plugin also overrides the tick generator to spit out the
categories as ticks instead of the values.

If you need to map a value back to its label, the mapping is always accessible
as "categories" on the axis object, e.g. plot.getAxes().xaxis.categories.

*/
(function ($) {
  var options = {
    xaxis: {
      categories: null
    },
    yaxis: {
      categories: null
    }
  };

  function processRawData(plot, series, data, datapoints) {
    // if categories are enabled, we need to disable
    // auto-transformation to numbers so the strings are intact
    // for later processing
    var xCategories = series.xaxis.options.mode == "categories",
        yCategories = series.yaxis.options.mode == "categories";
    if (!(xCategories || yCategories)) return;
    var format = datapoints.format;

    if (!format) {
      // FIXME: auto-detection should really not be defined here
      var s = series;
      format = [];
      format.push({
        x: true,
        number: true,
        required: true
      });
      format.push({
        y: true,
        number: true,
        required: true
      });

      if (s.bars.show || s.lines.show && s.lines.fill) {
        var autoscale = !!(s.bars.show && s.bars.zero || s.lines.show && s.lines.zero);
        format.push({
          y: true,
          number: true,
          required: false,
          defaultValue: 0,
          autoscale: autoscale
        });

        if (s.bars.horizontal) {
          delete format[format.length - 1].y;
          format[format.length - 1].x = true;
        }
      }

      datapoints.format = format;
    }

    for (var m = 0; m < format.length; ++m) {
      if (format[m].x && xCategories) format[m].number = false;
      if (format[m].y && yCategories) format[m].number = false;
    }
  }

  function getNextIndex(categories) {
    var index = -1;

    for (var v in categories) {
      if (categories[v] > index) index = categories[v];
    }

    return index + 1;
  }

  function categoriesTickGenerator(axis) {
    var res = [];

    for (var label in axis.categories) {
      var v = axis.categories[label];
      if (v >= axis.min && v <= axis.max) res.push([v, label]);
    }

    res.sort(function (a, b) {
      return a[0] - b[0];
    });
    return res;
  }

  function setupCategoriesForAxis(series, axis, datapoints) {
    if (series[axis].options.mode != "categories") return;

    if (!series[axis].categories) {
      // parse options
      var c = {},
          o = series[axis].options.categories || {};

      if ($.isArray(o)) {
        for (var i = 0; i < o.length; ++i) {
          c[o[i]] = i;
        }
      } else {
        for (var v in o) {
          c[v] = o[v];
        }
      }

      series[axis].categories = c;
    } // fix ticks


    if (!series[axis].options.ticks) series[axis].options.ticks = categoriesTickGenerator;
    transformPointsOnAxis(datapoints, axis, series[axis].categories);
  }

  function transformPointsOnAxis(datapoints, axis, categories) {
    // go through the points, transforming them
    var points = datapoints.points,
        ps = datapoints.pointsize,
        format = datapoints.format,
        formatColumn = axis.charAt(0),
        index = getNextIndex(categories);

    for (var i = 0; i < points.length; i += ps) {
      if (points[i] == null) continue;

      for (var m = 0; m < ps; ++m) {
        var val = points[i + m];
        if (val == null || !format[m][formatColumn]) continue;

        if (!(val in categories)) {
          categories[val] = index;
          ++index;
        }

        points[i + m] = categories[val];
      }
    }
  }

  function processDatapoints(plot, series, datapoints) {
    setupCategoriesForAxis(series, "xaxis", datapoints);
    setupCategoriesForAxis(series, "yaxis", datapoints);
  }

  function init(plot) {
    plot.hooks.processRawData.push(processRawData);
    plot.hooks.processDatapoints.push(processDatapoints);
  }

  $.plot.plugins.push({
    init: init,
    options: options,
    name: 'categories',
    version: '1.0'
  });
})(jQuery);

/***/ }),

/***/ "./js/flot/jquery.flot.crosshair.js":
/*!******************************************!*\
  !*** ./js/flot/jquery.flot.crosshair.js ***!
  \******************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

/* Flot plugin for showing crosshairs when the mouse hovers over the plot.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

The plugin supports these options:

	crosshair: {
		mode: null or "x" or "y" or "xy"
		color: color
		lineWidth: number
	}

Set the mode to one of "x", "y" or "xy". The "x" mode enables a vertical
crosshair that lets you trace the values on the x axis, "y" enables a
horizontal crosshair and "xy" enables them both. "color" is the color of the
crosshair (default is "rgba(170, 0, 0, 0.80)"), "lineWidth" is the width of
the drawn lines (default is 1).

The plugin also adds four public methods:

  - setCrosshair( pos )

    Set the position of the crosshair. Note that this is cleared if the user
    moves the mouse. "pos" is in coordinates of the plot and should be on the
    form { x: xpos, y: ypos } (you can use x2/x3/... if you're using multiple
    axes), which is coincidentally the same format as what you get from a
    "plothover" event. If "pos" is null, the crosshair is cleared.

  - clearCrosshair()

    Clear the crosshair.

  - lockCrosshair(pos)

    Cause the crosshair to lock to the current location, no longer updating if
    the user moves the mouse. Optionally supply a position (passed on to
    setCrosshair()) to move it to.

    Example usage:

	var myFlot = $.plot( $("#graph"), ..., { crosshair: { mode: "x" } } };
	$("#graph").bind( "plothover", function ( evt, position, item ) {
		if ( item ) {
			// Lock the crosshair to the data point being hovered
			myFlot.lockCrosshair({
				x: item.datapoint[ 0 ],
				y: item.datapoint[ 1 ]
			});
		} else {
			// Return normal crosshair operation
			myFlot.unlockCrosshair();
		}
	});

  - unlockCrosshair()

    Free the crosshair to move again after locking it.
*/
(function ($) {
  var options = {
    crosshair: {
      mode: null,
      // one of null, "x", "y" or "xy",
      color: "rgba(170, 0, 0, 0.80)",
      lineWidth: 1
    }
  };

  function init(plot) {
    // position of crosshair in pixels
    var crosshair = {
      x: -1,
      y: -1,
      locked: false
    };

    plot.setCrosshair = function setCrosshair(pos) {
      if (!pos) crosshair.x = -1;else {
        var o = plot.p2c(pos);
        crosshair.x = Math.max(0, Math.min(o.left, plot.width()));
        crosshair.y = Math.max(0, Math.min(o.top, plot.height()));
      }
      plot.triggerRedrawOverlay();
    };

    plot.clearCrosshair = plot.setCrosshair; // passes null for pos

    plot.lockCrosshair = function lockCrosshair(pos) {
      if (pos) plot.setCrosshair(pos);
      crosshair.locked = true;
    };

    plot.unlockCrosshair = function unlockCrosshair() {
      crosshair.locked = false;
    };

    function onMouseOut(e) {
      if (crosshair.locked) return;

      if (crosshair.x != -1) {
        crosshair.x = -1;
        plot.triggerRedrawOverlay();
      }
    }

    function onMouseMove(e) {
      if (crosshair.locked) return;

      if (plot.getSelection && plot.getSelection()) {
        crosshair.x = -1; // hide the crosshair while selecting

        return;
      }

      var offset = plot.offset();
      crosshair.x = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
      crosshair.y = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));
      plot.triggerRedrawOverlay();
    }

    plot.hooks.bindEvents.push(function (plot, eventHolder) {
      if (!plot.getOptions().crosshair.mode) return;
      eventHolder.mouseout(onMouseOut);
      eventHolder.mousemove(onMouseMove);
    });
    plot.hooks.drawOverlay.push(function (plot, ctx) {
      var c = plot.getOptions().crosshair;
      if (!c.mode) return;
      var plotOffset = plot.getPlotOffset();
      ctx.save();
      ctx.translate(plotOffset.left, plotOffset.top);

      if (crosshair.x != -1) {
        var adj = plot.getOptions().crosshair.lineWidth % 2 ? 0.5 : 0;
        ctx.strokeStyle = c.color;
        ctx.lineWidth = c.lineWidth;
        ctx.lineJoin = "round";
        ctx.beginPath();

        if (c.mode.indexOf("x") != -1) {
          var drawX = Math.floor(crosshair.x) + adj;
          ctx.moveTo(drawX, 0);
          ctx.lineTo(drawX, plot.height());
        }

        if (c.mode.indexOf("y") != -1) {
          var drawY = Math.floor(crosshair.y) + adj;
          ctx.moveTo(0, drawY);
          ctx.lineTo(plot.width(), drawY);
        }

        ctx.stroke();
      }

      ctx.restore();
    });
    plot.hooks.shutdown.push(function (plot, eventHolder) {
      eventHolder.unbind("mouseout", onMouseOut);
      eventHolder.unbind("mousemove", onMouseMove);
    });
  }

  $.plot.plugins.push({
    init: init,
    options: options,
    name: 'crosshair',
    version: '1.0'
  });
})(jQuery);

/***/ }),

/***/ "./js/flot/jquery.flot.js":
/*!********************************!*\
  !*** ./js/flot/jquery.flot.js ***!
  \********************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* Javascript plotting library for jQuery, version 0.8.3.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

*/
// first an inline dependency, jquery.colorhelpers.js, we inline it here
// for convenience

/* Plugin for jQuery for working with colors.
 *
 * Version 1.1.
 *
 * Inspiration from jQuery color animation plugin by John Resig.
 *
 * Released under the MIT license by Ole Laursen, October 2009.
 *
 * Examples:
 *
 *   $.color.parse("#fff").scale('rgb', 0.25).add('a', -0.5).toString()
 *   var c = $.color.extract($("#mydiv"), 'background-color');
 *   console.log(c.r, c.g, c.b, c.a);
 *   $.color.make(100, 50, 25, 0.4).toString() // returns "rgba(100,50,25,0.4)"
 *
 * Note that .scale() and .add() return the same modified object
 * instead of making a new one.
 *
 * V. 1.1: Fix error handling so e.g. parsing an empty string does
 * produce a color rather than just crashing.
 */
(function ($) {
  $.color = {};

  $.color.make = function (r, g, b, a) {
    var o = {};
    o.r = r || 0;
    o.g = g || 0;
    o.b = b || 0;
    o.a = a != null ? a : 1;

    o.add = function (c, d) {
      for (var i = 0; i < c.length; ++i) {
        o[c.charAt(i)] += d;
      }

      return o.normalize();
    };

    o.scale = function (c, f) {
      for (var i = 0; i < c.length; ++i) {
        o[c.charAt(i)] *= f;
      }

      return o.normalize();
    };

    o.toString = function () {
      if (o.a >= 1) {
        return "rgb(" + [o.r, o.g, o.b].join(",") + ")";
      } else {
        return "rgba(" + [o.r, o.g, o.b, o.a].join(",") + ")";
      }
    };

    o.normalize = function () {
      function clamp(min, value, max) {
        return value < min ? min : value > max ? max : value;
      }

      o.r = clamp(0, parseInt(o.r), 255);
      o.g = clamp(0, parseInt(o.g), 255);
      o.b = clamp(0, parseInt(o.b), 255);
      o.a = clamp(0, o.a, 1);
      return o;
    };

    o.clone = function () {
      return $.color.make(o.r, o.b, o.g, o.a);
    };

    return o.normalize();
  };

  $.color.extract = function (elem, css) {
    var c;

    do {
      c = elem.css(css).toLowerCase();
      if (c != "" && c != "transparent") break;
      elem = elem.parent();
    } while (elem.length && !$.nodeName(elem.get(0), "body"));

    if (c == "rgba(0, 0, 0, 0)") c = "transparent";
    return $.color.parse(c);
  };

  $.color.parse = function (str) {
    var res,
        m = $.color.make;
    if (res = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(str)) return m(parseInt(res[1], 10), parseInt(res[2], 10), parseInt(res[3], 10));
    if (res = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str)) return m(parseInt(res[1], 10), parseInt(res[2], 10), parseInt(res[3], 10), parseFloat(res[4]));
    if (res = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(str)) return m(parseFloat(res[1]) * 2.55, parseFloat(res[2]) * 2.55, parseFloat(res[3]) * 2.55);
    if (res = /rgba\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str)) return m(parseFloat(res[1]) * 2.55, parseFloat(res[2]) * 2.55, parseFloat(res[3]) * 2.55, parseFloat(res[4]));
    if (res = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(str)) return m(parseInt(res[1], 16), parseInt(res[2], 16), parseInt(res[3], 16));
    if (res = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(str)) return m(parseInt(res[1] + res[1], 16), parseInt(res[2] + res[2], 16), parseInt(res[3] + res[3], 16));
    var name = $.trim(str).toLowerCase();
    if (name == "transparent") return m(255, 255, 255, 0);else {
      res = lookupColors[name] || [0, 0, 0];
      return m(res[0], res[1], res[2]);
    }
  };

  var lookupColors = {
    aqua: [0, 255, 255],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    black: [0, 0, 0],
    blue: [0, 0, 255],
    brown: [165, 42, 42],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgrey: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkviolet: [148, 0, 211],
    fuchsia: [255, 0, 255],
    gold: [255, 215, 0],
    green: [0, 128, 0],
    indigo: [75, 0, 130],
    khaki: [240, 230, 140],
    lightblue: [173, 216, 230],
    lightcyan: [224, 255, 255],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    navy: [0, 0, 128],
    olive: [128, 128, 0],
    orange: [255, 165, 0],
    pink: [255, 192, 203],
    purple: [128, 0, 128],
    violet: [128, 0, 128],
    red: [255, 0, 0],
    silver: [192, 192, 192],
    white: [255, 255, 255],
    yellow: [255, 255, 0]
  };
})(jQuery); // the actual Flot code


(function ($) {
  // Cache the prototype hasOwnProperty for faster access
  var hasOwnProperty = Object.prototype.hasOwnProperty; // A shim to provide 'detach' to jQuery versions prior to 1.4.  Using a DOM
  // operation produces the same effect as detach, i.e. removing the element
  // without touching its jQuery data.
  // Do not merge this into Flot 0.9, since it requires jQuery 1.4.4+.

  if (!$.fn.detach) {
    $.fn.detach = function () {
      return this.each(function () {
        if (this.parentNode) {
          this.parentNode.removeChild(this);
        }
      });
    };
  } ///////////////////////////////////////////////////////////////////////////
  // The Canvas object is a wrapper around an HTML5 <canvas> tag.
  //
  // @constructor
  // @param {string} cls List of classes to apply to the canvas.
  // @param {element} container Element onto which to append the canvas.
  //
  // Requiring a container is a little iffy, but unfortunately canvas
  // operations don't work unless the canvas is attached to the DOM.


  function Canvas(cls, container) {
    var element = container.children("." + cls)[0];

    if (element == null) {
      element = document.createElement("canvas");
      element.className = cls;
      $(element).css({
        direction: "ltr",
        position: "absolute",
        left: 0,
        top: 0
      }).appendTo(container); // If HTML5 Canvas isn't available, fall back to [Ex|Flash]canvas

      if (!element.getContext) {
        if (window.G_vmlCanvasManager) {
          element = window.G_vmlCanvasManager.initElement(element);
        } else {
          throw new Error("Canvas is not available. If you're using IE with a fall-back such as Excanvas, then there's either a mistake in your conditional include, or the page has no DOCTYPE and is rendering in Quirks Mode.");
        }
      }
    }

    this.element = element;
    var context = this.context = element.getContext("2d"); // Determine the screen's ratio of physical to device-independent
    // pixels.  This is the ratio between the canvas width that the browser
    // advertises and the number of pixels actually present in that space.
    // The iPhone 4, for example, has a device-independent width of 320px,
    // but its screen is actually 640px wide.  It therefore has a pixel
    // ratio of 2, while most normal devices have a ratio of 1.

    var devicePixelRatio = window.devicePixelRatio || 1,
        backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    this.pixelRatio = devicePixelRatio / backingStoreRatio; // Size the canvas to match the internal dimensions of its container

    this.resize(container.width(), container.height()); // Collection of HTML div layers for text overlaid onto the canvas

    this.textContainer = null;
    this.text = {}; // Cache of text fragments and metrics, so we can avoid expensively
    // re-calculating them when the plot is re-rendered in a loop.

    this._textCache = {};
  } // Resizes the canvas to the given dimensions.
  //
  // @param {number} width New width of the canvas, in pixels.
  // @param {number} width New height of the canvas, in pixels.


  Canvas.prototype.resize = function (width, height) {
    if (width <= 0 || height <= 0) {
      throw new Error("Invalid dimensions for plot, width = " + width + ", height = " + height);
    }

    var element = this.element,
        context = this.context,
        pixelRatio = this.pixelRatio; // Resize the canvas, increasing its density based on the display's
    // pixel ratio; basically giving it more pixels without increasing the
    // size of its element, to take advantage of the fact that retina
    // displays have that many more pixels in the same advertised space.
    // Resizing should reset the state (excanvas seems to be buggy though)

    if (this.width != width) {
      element.width = width * pixelRatio;
      element.style.width = width + "px";
      this.width = width;
    }

    if (this.height != height) {
      element.height = height * pixelRatio;
      element.style.height = height + "px";
      this.height = height;
    } // Save the context, so we can reset in case we get replotted.  The
    // restore ensure that we're really back at the initial state, and
    // should be safe even if we haven't saved the initial state yet.


    context.restore();
    context.save(); // Scale the coordinate space to match the display density; so even though we
    // may have twice as many pixels, we still want lines and other drawing to
    // appear at the same size; the extra pixels will just make them crisper.

    context.scale(pixelRatio, pixelRatio);
  }; // Clears the entire canvas area, not including any overlaid HTML text


  Canvas.prototype.clear = function () {
    this.context.clearRect(0, 0, this.width, this.height);
  }; // Finishes rendering the canvas, including managing the text overlay.


  Canvas.prototype.render = function () {
    var cache = this._textCache; // For each text layer, add elements marked as active that haven't
    // already been rendered, and remove those that are no longer active.

    for (var layerKey in cache) {
      if (hasOwnProperty.call(cache, layerKey)) {
        var layer = this.getTextLayer(layerKey),
            layerCache = cache[layerKey];
        layer.hide();

        for (var styleKey in layerCache) {
          if (hasOwnProperty.call(layerCache, styleKey)) {
            var styleCache = layerCache[styleKey];

            for (var key in styleCache) {
              if (hasOwnProperty.call(styleCache, key)) {
                var positions = styleCache[key].positions;

                for (var i = 0, position; position = positions[i]; i++) {
                  if (position.active) {
                    if (!position.rendered) {
                      layer.append(position.element);
                      position.rendered = true;
                    }
                  } else {
                    positions.splice(i--, 1);

                    if (position.rendered) {
                      position.element.detach();
                    }
                  }
                }

                if (positions.length == 0) {
                  delete styleCache[key];
                }
              }
            }
          }
        }

        layer.show();
      }
    }
  }; // Creates (if necessary) and returns the text overlay container.
  //
  // @param {string} classes String of space-separated CSS classes used to
  //     uniquely identify the text layer.
  // @return {object} The jQuery-wrapped text-layer div.


  Canvas.prototype.getTextLayer = function (classes) {
    var layer = this.text[classes]; // Create the text layer if it doesn't exist

    if (layer == null) {
      // Create the text layer container, if it doesn't exist
      if (this.textContainer == null) {
        this.textContainer = $("<div class='flot-text'></div>").css({
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          'font-size': "smaller",
          color: "#545454"
        }).insertAfter(this.element);
      }

      layer = this.text[classes] = $("<div></div>").addClass(classes).css({
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      }).appendTo(this.textContainer);
    }

    return layer;
  }; // Creates (if necessary) and returns a text info object.
  //
  // The object looks like this:
  //
  // {
  //     width: Width of the text's wrapper div.
  //     height: Height of the text's wrapper div.
  //     element: The jQuery-wrapped HTML div containing the text.
  //     positions: Array of positions at which this text is drawn.
  // }
  //
  // The positions array contains objects that look like this:
  //
  // {
  //     active: Flag indicating whether the text should be visible.
  //     rendered: Flag indicating whether the text is currently visible.
  //     element: The jQuery-wrapped HTML div containing the text.
  //     x: X coordinate at which to draw the text.
  //     y: Y coordinate at which to draw the text.
  // }
  //
  // Each position after the first receives a clone of the original element.
  //
  // The idea is that that the width, height, and general 'identity' of the
  // text is constant no matter where it is placed; the placements are a
  // secondary property.
  //
  // Canvas maintains a cache of recently-used text info objects; getTextInfo
  // either returns the cached element or creates a new entry.
  //
  // @param {string} layer A string of space-separated CSS classes uniquely
  //     identifying the layer containing this text.
  // @param {string} text Text string to retrieve info for.
  // @param {(string|object)=} font Either a string of space-separated CSS
  //     classes or a font-spec object, defining the text's font and style.
  // @param {number=} angle Angle at which to rotate the text, in degrees.
  //     Angle is currently unused, it will be implemented in the future.
  // @param {number=} width Maximum width of the text before it wraps.
  // @return {object} a text info object.


  Canvas.prototype.getTextInfo = function (layer, text, font, angle, width) {
    var textStyle, layerCache, styleCache, info; // Cast the value to a string, in case we were given a number or such

    text = "" + text; // If the font is a font-spec object, generate a CSS font definition

    if (_typeof(font) === "object") {
      textStyle = font.style + " " + font.variant + " " + font.weight + " " + font.size + "px/" + font.lineHeight + "px " + font.family;
    } else {
      textStyle = font;
    } // Retrieve (or create) the cache for the text's layer and styles


    layerCache = this._textCache[layer];

    if (layerCache == null) {
      layerCache = this._textCache[layer] = {};
    }

    styleCache = layerCache[textStyle];

    if (styleCache == null) {
      styleCache = layerCache[textStyle] = {};
    }

    info = styleCache[text]; // If we can't find a matching element in our cache, create a new one

    if (info == null) {
      var element = $("<div></div>").html(text).css({
        position: "absolute",
        'max-width': width,
        top: -9999
      }).appendTo(this.getTextLayer(layer));

      if (_typeof(font) === "object") {
        element.css({
          font: textStyle,
          color: font.color
        });
      } else if (typeof font === "string") {
        element.addClass(font);
      }

      info = styleCache[text] = {
        width: element.outerWidth(true),
        height: element.outerHeight(true),
        element: element,
        positions: []
      };
      element.detach();
    }

    return info;
  }; // Adds a text string to the canvas text overlay.
  //
  // The text isn't drawn immediately; it is marked as rendering, which will
  // result in its addition to the canvas on the next render pass.
  //
  // @param {string} layer A string of space-separated CSS classes uniquely
  //     identifying the layer containing this text.
  // @param {number} x X coordinate at which to draw the text.
  // @param {number} y Y coordinate at which to draw the text.
  // @param {string} text Text string to draw.
  // @param {(string|object)=} font Either a string of space-separated CSS
  //     classes or a font-spec object, defining the text's font and style.
  // @param {number=} angle Angle at which to rotate the text, in degrees.
  //     Angle is currently unused, it will be implemented in the future.
  // @param {number=} width Maximum width of the text before it wraps.
  // @param {string=} halign Horizontal alignment of the text; either "left",
  //     "center" or "right".
  // @param {string=} valign Vertical alignment of the text; either "top",
  //     "middle" or "bottom".


  Canvas.prototype.addText = function (layer, x, y, text, font, angle, width, halign, valign) {
    var info = this.getTextInfo(layer, text, font, angle, width),
        positions = info.positions; // Tweak the div's position to match the text's alignment

    if (halign == "center") {
      x -= info.width / 2;
    } else if (halign == "right") {
      x -= info.width;
    }

    if (valign == "middle") {
      y -= info.height / 2;
    } else if (valign == "bottom") {
      y -= info.height;
    } // Determine whether this text already exists at this position.
    // If so, mark it for inclusion in the next render pass.


    for (var i = 0, position; position = positions[i]; i++) {
      if (position.x == x && position.y == y) {
        position.active = true;
        return;
      }
    } // If the text doesn't exist at this position, create a new entry
    // For the very first position we'll re-use the original element,
    // while for subsequent ones we'll clone it.


    position = {
      active: true,
      rendered: false,
      element: positions.length ? info.element.clone() : info.element,
      x: x,
      y: y
    };
    positions.push(position); // Move the element to its final position within the container

    position.element.css({
      top: Math.round(y),
      left: Math.round(x),
      'text-align': halign // In case the text wraps

    });
  }; // Removes one or more text strings from the canvas text overlay.
  //
  // If no parameters are given, all text within the layer is removed.
  //
  // Note that the text is not immediately removed; it is simply marked as
  // inactive, which will result in its removal on the next render pass.
  // This avoids the performance penalty for 'clear and redraw' behavior,
  // where we potentially get rid of all text on a layer, but will likely
  // add back most or all of it later, as when redrawing axes, for example.
  //
  // @param {string} layer A string of space-separated CSS classes uniquely
  //     identifying the layer containing this text.
  // @param {number=} x X coordinate of the text.
  // @param {number=} y Y coordinate of the text.
  // @param {string=} text Text string to remove.
  // @param {(string|object)=} font Either a string of space-separated CSS
  //     classes or a font-spec object, defining the text's font and style.
  // @param {number=} angle Angle at which the text is rotated, in degrees.
  //     Angle is currently unused, it will be implemented in the future.


  Canvas.prototype.removeText = function (layer, x, y, text, font, angle) {
    if (text == null) {
      var layerCache = this._textCache[layer];

      if (layerCache != null) {
        for (var styleKey in layerCache) {
          if (hasOwnProperty.call(layerCache, styleKey)) {
            var styleCache = layerCache[styleKey];

            for (var key in styleCache) {
              if (hasOwnProperty.call(styleCache, key)) {
                var positions = styleCache[key].positions;

                for (var i = 0, position; position = positions[i]; i++) {
                  position.active = false;
                }
              }
            }
          }
        }
      }
    } else {
      var positions = this.getTextInfo(layer, text, font, angle).positions;

      for (var i = 0, position; position = positions[i]; i++) {
        if (position.x == x && position.y == y) {
          position.active = false;
        }
      }
    }
  }; ///////////////////////////////////////////////////////////////////////////
  // The top-level container for the entire plot.


  function Plot(placeholder, data_, options_, plugins) {
    // data is on the form:
    //   [ series1, series2 ... ]
    // where series is either just the data as [ [x1, y1], [x2, y2], ... ]
    // or { data: [ [x1, y1], [x2, y2], ... ], label: "some label", ... }
    var series = [],
        options = {
      // the color theme used for graphs
      colors: ["#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed"],
      legend: {
        show: true,
        noColumns: 1,
        // number of colums in legend table
        labelFormatter: null,
        // fn: string -> string
        labelBoxBorderColor: "#ccc",
        // border color for the little label boxes
        container: null,
        // container (as jQuery object) to put legend in, null means default on top of graph
        position: "ne",
        // position of default legend container within plot
        margin: 5,
        // distance from grid edge to default legend container within plot
        backgroundColor: null,
        // null means auto-detect
        backgroundOpacity: 0.85,
        // set to 0 to avoid background
        sorted: null // default to no legend sorting

      },
      xaxis: {
        show: null,
        // null = auto-detect, true = always, false = never
        position: "bottom",
        // or "top"
        mode: null,
        // null or "time"
        font: null,
        // null (derived from CSS in placeholder) or object like { size: 11, lineHeight: 13, style: "italic", weight: "bold", family: "sans-serif", variant: "small-caps" }
        color: null,
        // base color, labels, ticks
        tickColor: null,
        // possibly different color of ticks, e.g. "rgba(0,0,0,0.15)"
        transform: null,
        // null or f: number -> number to transform axis
        inverseTransform: null,
        // if transform is set, this should be the inverse function
        min: null,
        // min. value to show, null means set automatically
        max: null,
        // max. value to show, null means set automatically
        autoscaleMargin: null,
        // margin in % to add if auto-setting min/max
        ticks: null,
        // either [1, 3] or [[1, "a"], 3] or (fn: axis info -> ticks) or app. number of ticks for auto-ticks
        tickFormatter: null,
        // fn: number -> string
        labelWidth: null,
        // size of tick labels in pixels
        labelHeight: null,
        reserveSpace: null,
        // whether to reserve space even if axis isn't shown
        tickLength: null,
        // size in pixels of ticks, or "full" for whole line
        alignTicksWithAxis: null,
        // axis number or null for no sync
        tickDecimals: null,
        // no. of decimals, null means auto
        tickSize: null,
        // number or [number, "unit"]
        minTickSize: null // number or [number, "unit"]

      },
      yaxis: {
        autoscaleMargin: 0.02,
        position: "left" // or "right"

      },
      xaxes: [],
      yaxes: [],
      series: {
        points: {
          show: false,
          radius: 3,
          lineWidth: 2,
          // in pixels
          fill: true,
          fillColor: "#ffffff",
          symbol: "circle" // or callback

        },
        lines: {
          // we don't put in show: false so we can see
          // whether lines were actively disabled
          lineWidth: 2,
          // in pixels
          fill: false,
          fillColor: null,
          steps: false // Omit 'zero', so we can later default its value to
          // match that of the 'fill' option.

        },
        bars: {
          show: false,
          lineWidth: 2,
          // in pixels
          barWidth: 1,
          // in units of the x axis
          fill: true,
          fillColor: null,
          align: "left",
          // "left", "right", or "center"
          horizontal: false,
          zero: true
        },
        shadowSize: 3,
        highlightColor: null
      },
      grid: {
        show: true,
        aboveData: false,
        color: "#545454",
        // primary color used for outline and labels
        backgroundColor: null,
        // null for transparent, else color
        borderColor: null,
        // set if different from the grid color
        tickColor: null,
        // color for the ticks, e.g. "rgba(0,0,0,0.15)"
        margin: 0,
        // distance from the canvas edge to the grid
        labelMargin: 5,
        // in pixels
        axisMargin: 8,
        // in pixels
        borderWidth: 2,
        // in pixels
        minBorderMargin: null,
        // in pixels, null means taken from points radius
        markings: null,
        // array of ranges or fn: axes -> array of ranges
        markingsColor: "#f4f4f4",
        markingsLineWidth: 2,
        // interactive stuff
        clickable: false,
        hoverable: false,
        autoHighlight: true,
        // highlight in case mouse is near
        mouseActiveRadius: 10 // how far the mouse can be away to activate an item

      },
      interaction: {
        redrawOverlayInterval: 1000 / 60 // time between updates, -1 means in same flow

      },
      hooks: {}
    },
        surface = null,
        // the canvas for the plot itself
    overlay = null,
        // canvas for interactive stuff on top of plot
    eventHolder = null,
        // jQuery object that events should be bound to
    ctx = null,
        octx = null,
        xaxes = [],
        yaxes = [],
        plotOffset = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    },
        plotWidth = 0,
        plotHeight = 0,
        hooks = {
      processOptions: [],
      processRawData: [],
      processDatapoints: [],
      processOffset: [],
      drawBackground: [],
      drawSeries: [],
      draw: [],
      bindEvents: [],
      drawOverlay: [],
      shutdown: []
    },
        plot = this; // public functions

    plot.setData = setData;
    plot.setupGrid = setupGrid;
    plot.draw = draw;

    plot.getPlaceholder = function () {
      return placeholder;
    };

    plot.getCanvas = function () {
      return surface.element;
    };

    plot.getPlotOffset = function () {
      return plotOffset;
    };

    plot.width = function () {
      return plotWidth;
    };

    plot.height = function () {
      return plotHeight;
    };

    plot.offset = function () {
      var o = eventHolder.offset();
      o.left += plotOffset.left;
      o.top += plotOffset.top;
      return o;
    };

    plot.getData = function () {
      return series;
    };

    plot.getAxes = function () {
      var res = {},
          i;
      $.each(xaxes.concat(yaxes), function (_, axis) {
        if (axis) res[axis.direction + (axis.n != 1 ? axis.n : "") + "axis"] = axis;
      });
      return res;
    };

    plot.getXAxes = function () {
      return xaxes;
    };

    plot.getYAxes = function () {
      return yaxes;
    };

    plot.c2p = canvasToAxisCoords;
    plot.p2c = axisToCanvasCoords;

    plot.getOptions = function () {
      return options;
    };

    plot.highlight = highlight;
    plot.unhighlight = unhighlight;
    plot.triggerRedrawOverlay = triggerRedrawOverlay;

    plot.pointOffset = function (point) {
      return {
        left: parseInt(xaxes[axisNumber(point, "x") - 1].p2c(+point.x) + plotOffset.left, 10),
        top: parseInt(yaxes[axisNumber(point, "y") - 1].p2c(+point.y) + plotOffset.top, 10)
      };
    };

    plot.shutdown = shutdown;

    plot.destroy = function () {
      shutdown();
      placeholder.removeData("plot").empty();
      series = [];
      options = null;
      surface = null;
      overlay = null;
      eventHolder = null;
      ctx = null;
      octx = null;
      xaxes = [];
      yaxes = [];
      hooks = null;
      highlights = [];
      plot = null;
    };

    plot.resize = function () {
      var width = placeholder.width(),
          height = placeholder.height();
      surface.resize(width, height);
      overlay.resize(width, height);
    }; // public attributes


    plot.hooks = hooks; // initialize

    initPlugins(plot);
    parseOptions(options_);
    setupCanvases();
    setData(data_);
    setupGrid();
    draw();
    bindEvents();

    function executeHooks(hook, args) {
      args = [plot].concat(args);

      for (var i = 0; i < hook.length; ++i) {
        hook[i].apply(this, args);
      }
    }

    function initPlugins() {
      // References to key classes, allowing plugins to modify them
      var classes = {
        Canvas: Canvas
      };

      for (var i = 0; i < plugins.length; ++i) {
        var p = plugins[i];
        p.init(plot, classes);
        if (p.options) $.extend(true, options, p.options);
      }
    }

    function parseOptions(opts) {
      $.extend(true, options, opts); // $.extend merges arrays, rather than replacing them.  When less
      // colors are provided than the size of the default palette, we
      // end up with those colors plus the remaining defaults, which is
      // not expected behavior; avoid it by replacing them here.

      if (opts && opts.colors) {
        options.colors = opts.colors;
      }

      if (options.xaxis.color == null) options.xaxis.color = $.color.parse(options.grid.color).scale('a', 0.22).toString();
      if (options.yaxis.color == null) options.yaxis.color = $.color.parse(options.grid.color).scale('a', 0.22).toString();
      if (options.xaxis.tickColor == null) // grid.tickColor for back-compatibility
        options.xaxis.tickColor = options.grid.tickColor || options.xaxis.color;
      if (options.yaxis.tickColor == null) // grid.tickColor for back-compatibility
        options.yaxis.tickColor = options.grid.tickColor || options.yaxis.color;
      if (options.grid.borderColor == null) options.grid.borderColor = options.grid.color;
      if (options.grid.tickColor == null) options.grid.tickColor = $.color.parse(options.grid.color).scale('a', 0.22).toString(); // Fill in defaults for axis options, including any unspecified
      // font-spec fields, if a font-spec was provided.
      // If no x/y axis options were provided, create one of each anyway,
      // since the rest of the code assumes that they exist.

      var i,
          axisOptions,
          axisCount,
          fontSize = placeholder.css("font-size"),
          fontSizeDefault = fontSize ? +fontSize.replace("px", "") : 13,
          fontDefaults = {
        style: placeholder.css("font-style"),
        size: Math.round(0.8 * fontSizeDefault),
        variant: placeholder.css("font-variant"),
        weight: placeholder.css("font-weight"),
        family: placeholder.css("font-family")
      };
      axisCount = options.xaxes.length || 1;

      for (i = 0; i < axisCount; ++i) {
        axisOptions = options.xaxes[i];

        if (axisOptions && !axisOptions.tickColor) {
          axisOptions.tickColor = axisOptions.color;
        }

        axisOptions = $.extend(true, {}, options.xaxis, axisOptions);
        options.xaxes[i] = axisOptions;

        if (axisOptions.font) {
          axisOptions.font = $.extend({}, fontDefaults, axisOptions.font);

          if (!axisOptions.font.color) {
            axisOptions.font.color = axisOptions.color;
          }

          if (!axisOptions.font.lineHeight) {
            axisOptions.font.lineHeight = Math.round(axisOptions.font.size * 1.15);
          }
        }
      }

      axisCount = options.yaxes.length || 1;

      for (i = 0; i < axisCount; ++i) {
        axisOptions = options.yaxes[i];

        if (axisOptions && !axisOptions.tickColor) {
          axisOptions.tickColor = axisOptions.color;
        }

        axisOptions = $.extend(true, {}, options.yaxis, axisOptions);
        options.yaxes[i] = axisOptions;

        if (axisOptions.font) {
          axisOptions.font = $.extend({}, fontDefaults, axisOptions.font);

          if (!axisOptions.font.color) {
            axisOptions.font.color = axisOptions.color;
          }

          if (!axisOptions.font.lineHeight) {
            axisOptions.font.lineHeight = Math.round(axisOptions.font.size * 1.15);
          }
        }
      } // backwards compatibility, to be removed in future


      if (options.xaxis.noTicks && options.xaxis.ticks == null) options.xaxis.ticks = options.xaxis.noTicks;
      if (options.yaxis.noTicks && options.yaxis.ticks == null) options.yaxis.ticks = options.yaxis.noTicks;

      if (options.x2axis) {
        options.xaxes[1] = $.extend(true, {}, options.xaxis, options.x2axis);
        options.xaxes[1].position = "top"; // Override the inherit to allow the axis to auto-scale

        if (options.x2axis.min == null) {
          options.xaxes[1].min = null;
        }

        if (options.x2axis.max == null) {
          options.xaxes[1].max = null;
        }
      }

      if (options.y2axis) {
        options.yaxes[1] = $.extend(true, {}, options.yaxis, options.y2axis);
        options.yaxes[1].position = "right"; // Override the inherit to allow the axis to auto-scale

        if (options.y2axis.min == null) {
          options.yaxes[1].min = null;
        }

        if (options.y2axis.max == null) {
          options.yaxes[1].max = null;
        }
      }

      if (options.grid.coloredAreas) options.grid.markings = options.grid.coloredAreas;
      if (options.grid.coloredAreasColor) options.grid.markingsColor = options.grid.coloredAreasColor;
      if (options.lines) $.extend(true, options.series.lines, options.lines);
      if (options.points) $.extend(true, options.series.points, options.points);
      if (options.bars) $.extend(true, options.series.bars, options.bars);
      if (options.shadowSize != null) options.series.shadowSize = options.shadowSize;
      if (options.highlightColor != null) options.series.highlightColor = options.highlightColor; // save options on axes for future reference

      for (i = 0; i < options.xaxes.length; ++i) {
        getOrCreateAxis(xaxes, i + 1).options = options.xaxes[i];
      }

      for (i = 0; i < options.yaxes.length; ++i) {
        getOrCreateAxis(yaxes, i + 1).options = options.yaxes[i];
      } // add hooks from options


      for (var n in hooks) {
        if (options.hooks[n] && options.hooks[n].length) hooks[n] = hooks[n].concat(options.hooks[n]);
      }

      executeHooks(hooks.processOptions, [options]);
    }

    function setData(d) {
      series = parseData(d);
      fillInSeriesOptions();
      processData();
    }

    function parseData(d) {
      var res = [];

      for (var i = 0; i < d.length; ++i) {
        var s = $.extend(true, {}, options.series);

        if (d[i].data != null) {
          s.data = d[i].data; // move the data instead of deep-copy

          delete d[i].data;
          $.extend(true, s, d[i]);
          d[i].data = s.data;
        } else s.data = d[i];

        res.push(s);
      }

      return res;
    }

    function axisNumber(obj, coord) {
      var a = obj[coord + "axis"];
      if (_typeof(a) == "object") // if we got a real axis, extract number
        a = a.n;
      if (typeof a != "number") a = 1; // default to first axis

      return a;
    }

    function allAxes() {
      // return flat array without annoying null entries
      return $.grep(xaxes.concat(yaxes), function (a) {
        return a;
      });
    }

    function canvasToAxisCoords(pos) {
      // return an object with x/y corresponding to all used axes
      var res = {},
          i,
          axis;

      for (i = 0; i < xaxes.length; ++i) {
        axis = xaxes[i];
        if (axis && axis.used) res["x" + axis.n] = axis.c2p(pos.left);
      }

      for (i = 0; i < yaxes.length; ++i) {
        axis = yaxes[i];
        if (axis && axis.used) res["y" + axis.n] = axis.c2p(pos.top);
      }

      if (res.x1 !== undefined) res.x = res.x1;
      if (res.y1 !== undefined) res.y = res.y1;
      return res;
    }

    function axisToCanvasCoords(pos) {
      // get canvas coords from the first pair of x/y found in pos
      var res = {},
          i,
          axis,
          key;

      for (i = 0; i < xaxes.length; ++i) {
        axis = xaxes[i];

        if (axis && axis.used) {
          key = "x" + axis.n;
          if (pos[key] == null && axis.n == 1) key = "x";

          if (pos[key] != null) {
            res.left = axis.p2c(pos[key]);
            break;
          }
        }
      }

      for (i = 0; i < yaxes.length; ++i) {
        axis = yaxes[i];

        if (axis && axis.used) {
          key = "y" + axis.n;
          if (pos[key] == null && axis.n == 1) key = "y";

          if (pos[key] != null) {
            res.top = axis.p2c(pos[key]);
            break;
          }
        }
      }

      return res;
    }

    function getOrCreateAxis(axes, number) {
      if (!axes[number - 1]) axes[number - 1] = {
        n: number,
        // save the number for future reference
        direction: axes == xaxes ? "x" : "y",
        options: $.extend(true, {}, axes == xaxes ? options.xaxis : options.yaxis)
      };
      return axes[number - 1];
    }

    function fillInSeriesOptions() {
      var neededColors = series.length,
          maxIndex = -1,
          i; // Subtract the number of series that already have fixed colors or
      // color indexes from the number that we still need to generate.

      for (i = 0; i < series.length; ++i) {
        var sc = series[i].color;

        if (sc != null) {
          neededColors--;

          if (typeof sc == "number" && sc > maxIndex) {
            maxIndex = sc;
          }
        }
      } // If any of the series have fixed color indexes, then we need to
      // generate at least as many colors as the highest index.


      if (neededColors <= maxIndex) {
        neededColors = maxIndex + 1;
      } // Generate all the colors, using first the option colors and then
      // variations on those colors once they're exhausted.


      var c,
          colors = [],
          colorPool = options.colors,
          colorPoolSize = colorPool.length,
          variation = 0;

      for (i = 0; i < neededColors; i++) {
        c = $.color.parse(colorPool[i % colorPoolSize] || "#666"); // Each time we exhaust the colors in the pool we adjust
        // a scaling factor used to produce more variations on
        // those colors. The factor alternates negative/positive
        // to produce lighter/darker colors.
        // Reset the variation after every few cycles, or else
        // it will end up producing only white or black colors.

        if (i % colorPoolSize == 0 && i) {
          if (variation >= 0) {
            if (variation < 0.5) {
              variation = -variation - 0.2;
            } else variation = 0;
          } else variation = -variation;
        }

        colors[i] = c.scale('rgb', 1 + variation);
      } // Finalize the series options, filling in their colors


      var colori = 0,
          s;

      for (i = 0; i < series.length; ++i) {
        s = series[i]; // assign colors

        if (s.color == null) {
          s.color = colors[colori].toString();
          ++colori;
        } else if (typeof s.color == "number") s.color = colors[s.color].toString(); // turn on lines automatically in case nothing is set


        if (s.lines.show == null) {
          var v,
              show = true;

          for (v in s) {
            if (s[v] && s[v].show) {
              show = false;
              break;
            }
          }

          if (show) s.lines.show = true;
        } // If nothing was provided for lines.zero, default it to match
        // lines.fill, since areas by default should extend to zero.


        if (s.lines.zero == null) {
          s.lines.zero = !!s.lines.fill;
        } // setup axes


        s.xaxis = getOrCreateAxis(xaxes, axisNumber(s, "x"));
        s.yaxis = getOrCreateAxis(yaxes, axisNumber(s, "y"));
      }
    }

    function processData() {
      var topSentry = Number.POSITIVE_INFINITY,
          bottomSentry = Number.NEGATIVE_INFINITY,
          fakeInfinity = Number.MAX_VALUE,
          i,
          j,
          k,
          m,
          length,
          s,
          points,
          ps,
          x,
          y,
          axis,
          val,
          f,
          p,
          data,
          format;

      function updateAxis(axis, min, max) {
        if (min < axis.datamin && min != -fakeInfinity) axis.datamin = min;
        if (max > axis.datamax && max != fakeInfinity) axis.datamax = max;
      }

      $.each(allAxes(), function (_, axis) {
        // init axis
        axis.datamin = topSentry;
        axis.datamax = bottomSentry;
        axis.used = false;
      });

      for (i = 0; i < series.length; ++i) {
        s = series[i];
        s.datapoints = {
          points: []
        };
        executeHooks(hooks.processRawData, [s, s.data, s.datapoints]);
      } // first pass: clean and copy data


      for (i = 0; i < series.length; ++i) {
        s = series[i];
        data = s.data;
        format = s.datapoints.format;

        if (!format) {
          format = []; // find out how to copy

          format.push({
            x: true,
            number: true,
            required: true
          });
          format.push({
            y: true,
            number: true,
            required: true
          });

          if (s.bars.show || s.lines.show && s.lines.fill) {
            var autoscale = !!(s.bars.show && s.bars.zero || s.lines.show && s.lines.zero);
            format.push({
              y: true,
              number: true,
              required: false,
              defaultValue: 0,
              autoscale: autoscale
            });

            if (s.bars.horizontal) {
              delete format[format.length - 1].y;
              format[format.length - 1].x = true;
            }
          }

          s.datapoints.format = format;
        }

        if (s.datapoints.pointsize != null) continue; // already filled in

        s.datapoints.pointsize = format.length;
        ps = s.datapoints.pointsize;
        points = s.datapoints.points;
        var insertSteps = s.lines.show && s.lines.steps;
        s.xaxis.used = s.yaxis.used = true;

        for (j = k = 0; j < data.length; ++j, k += ps) {
          p = data[j];
          var nullify = p == null;

          if (!nullify) {
            for (m = 0; m < ps; ++m) {
              val = p[m];
              f = format[m];

              if (f) {
                if (f.number && val != null) {
                  val = +val; // convert to number

                  if (isNaN(val)) val = null;else if (val == Infinity) val = fakeInfinity;else if (val == -Infinity) val = -fakeInfinity;
                }

                if (val == null) {
                  if (f.required) nullify = true;
                  if (f.defaultValue != null) val = f.defaultValue;
                }
              }

              points[k + m] = val;
            }
          }

          if (nullify) {
            for (m = 0; m < ps; ++m) {
              val = points[k + m];

              if (val != null) {
                f = format[m]; // extract min/max info

                if (f.autoscale !== false) {
                  if (f.x) {
                    updateAxis(s.xaxis, val, val);
                  }

                  if (f.y) {
                    updateAxis(s.yaxis, val, val);
                  }
                }
              }

              points[k + m] = null;
            }
          } else {
            // a little bit of line specific stuff that
            // perhaps shouldn't be here, but lacking
            // better means...
            if (insertSteps && k > 0 && points[k - ps] != null && points[k - ps] != points[k] && points[k - ps + 1] != points[k + 1]) {
              // copy the point to make room for a middle point
              for (m = 0; m < ps; ++m) {
                points[k + ps + m] = points[k + m];
              } // middle point has same y


              points[k + 1] = points[k - ps + 1]; // we've added a point, better reflect that

              k += ps;
            }
          }
        }
      } // give the hooks a chance to run


      for (i = 0; i < series.length; ++i) {
        s = series[i];
        executeHooks(hooks.processDatapoints, [s, s.datapoints]);
      } // second pass: find datamax/datamin for auto-scaling


      for (i = 0; i < series.length; ++i) {
        s = series[i];
        points = s.datapoints.points;
        ps = s.datapoints.pointsize;
        format = s.datapoints.format;
        var xmin = topSentry,
            ymin = topSentry,
            xmax = bottomSentry,
            ymax = bottomSentry;

        for (j = 0; j < points.length; j += ps) {
          if (points[j] == null) continue;

          for (m = 0; m < ps; ++m) {
            val = points[j + m];
            f = format[m];
            if (!f || f.autoscale === false || val == fakeInfinity || val == -fakeInfinity) continue;

            if (f.x) {
              if (val < xmin) xmin = val;
              if (val > xmax) xmax = val;
            }

            if (f.y) {
              if (val < ymin) ymin = val;
              if (val > ymax) ymax = val;
            }
          }
        }

        if (s.bars.show) {
          // make sure we got room for the bar on the dancing floor
          var delta;

          switch (s.bars.align) {
            case "left":
              delta = 0;
              break;

            case "right":
              delta = -s.bars.barWidth;
              break;

            default:
              delta = -s.bars.barWidth / 2;
          }

          if (s.bars.horizontal) {
            ymin += delta;
            ymax += delta + s.bars.barWidth;
          } else {
            xmin += delta;
            xmax += delta + s.bars.barWidth;
          }
        }

        updateAxis(s.xaxis, xmin, xmax);
        updateAxis(s.yaxis, ymin, ymax);
      }

      $.each(allAxes(), function (_, axis) {
        if (axis.datamin == topSentry) axis.datamin = null;
        if (axis.datamax == bottomSentry) axis.datamax = null;
      });
    }

    function setupCanvases() {
      // Make sure the placeholder is clear of everything except canvases
      // from a previous plot in this container that we'll try to re-use.
      placeholder.css("padding", 0) // padding messes up the positioning
      .children().filter(function () {
        return !$(this).hasClass("flot-overlay") && !$(this).hasClass('flot-base');
      }).remove();
      if (placeholder.css("position") == 'static') placeholder.css("position", "relative"); // for positioning labels and overlay

      surface = new Canvas("flot-base", placeholder);
      overlay = new Canvas("flot-overlay", placeholder); // overlay canvas for interactive features

      ctx = surface.context;
      octx = overlay.context; // define which element we're listening for events on

      eventHolder = $(overlay.element).unbind(); // If we're re-using a plot object, shut down the old one

      var existing = placeholder.data("plot");

      if (existing) {
        existing.shutdown();
        overlay.clear();
      } // save in case we get replotted


      placeholder.data("plot", plot);
    }

    function bindEvents() {
      // bind events
      if (options.grid.hoverable) {
        eventHolder.mousemove(onMouseMove); // Use bind, rather than .mouseleave, because we officially
        // still support jQuery 1.2.6, which doesn't define a shortcut
        // for mouseenter or mouseleave.  This was a bug/oversight that
        // was fixed somewhere around 1.3.x.  We can return to using
        // .mouseleave when we drop support for 1.2.6.

        eventHolder.bind("mouseleave", onMouseLeave);
      }

      if (options.grid.clickable) eventHolder.click(onClick);
      executeHooks(hooks.bindEvents, [eventHolder]);
    }

    function shutdown() {
      if (redrawTimeout) clearTimeout(redrawTimeout);
      eventHolder.unbind("mousemove", onMouseMove);
      eventHolder.unbind("mouseleave", onMouseLeave);
      eventHolder.unbind("click", onClick);
      executeHooks(hooks.shutdown, [eventHolder]);
    }

    function setTransformationHelpers(axis) {
      // set helper functions on the axis, assumes plot area
      // has been computed already
      function identity(x) {
        return x;
      }

      var s,
          m,
          t = axis.options.transform || identity,
          it = axis.options.inverseTransform; // precompute how much the axis is scaling a point
      // in canvas space

      if (axis.direction == "x") {
        s = axis.scale = plotWidth / Math.abs(t(axis.max) - t(axis.min));
        m = Math.min(t(axis.max), t(axis.min));
      } else {
        s = axis.scale = plotHeight / Math.abs(t(axis.max) - t(axis.min));
        s = -s;
        m = Math.max(t(axis.max), t(axis.min));
      } // data point to canvas coordinate


      if (t == identity) // slight optimization
        axis.p2c = function (p) {
          return (p - m) * s;
        };else axis.p2c = function (p) {
        return (t(p) - m) * s;
      }; // canvas coordinate to data point

      if (!it) axis.c2p = function (c) {
        return m + c / s;
      };else axis.c2p = function (c) {
        return it(m + c / s);
      };
    }

    function measureTickLabels(axis) {
      var opts = axis.options,
          ticks = axis.ticks || [],
          labelWidth = opts.labelWidth || 0,
          labelHeight = opts.labelHeight || 0,
          maxWidth = labelWidth || (axis.direction == "x" ? Math.floor(surface.width / (ticks.length || 1)) : null),
          legacyStyles = axis.direction + "Axis " + axis.direction + axis.n + "Axis",
          layer = "flot-" + axis.direction + "-axis flot-" + axis.direction + axis.n + "-axis " + legacyStyles,
          font = opts.font || "flot-tick-label tickLabel";

      for (var i = 0; i < ticks.length; ++i) {
        var t = ticks[i];
        if (!t.label) continue;
        var info = surface.getTextInfo(layer, t.label, font, null, maxWidth);
        labelWidth = Math.max(labelWidth, info.width);
        labelHeight = Math.max(labelHeight, info.height);
      }

      axis.labelWidth = opts.labelWidth || labelWidth;
      axis.labelHeight = opts.labelHeight || labelHeight;
    }

    function allocateAxisBoxFirstPhase(axis) {
      // find the bounding box of the axis by looking at label
      // widths/heights and ticks, make room by diminishing the
      // plotOffset; this first phase only looks at one
      // dimension per axis, the other dimension depends on the
      // other axes so will have to wait
      var lw = axis.labelWidth,
          lh = axis.labelHeight,
          pos = axis.options.position,
          isXAxis = axis.direction === "x",
          tickLength = axis.options.tickLength,
          axisMargin = options.grid.axisMargin,
          padding = options.grid.labelMargin,
          innermost = true,
          outermost = true,
          first = true,
          found = false; // Determine the axis's position in its direction and on its side

      $.each(isXAxis ? xaxes : yaxes, function (i, a) {
        if (a && (a.show || a.reserveSpace)) {
          if (a === axis) {
            found = true;
          } else if (a.options.position === pos) {
            if (found) {
              outermost = false;
            } else {
              innermost = false;
            }
          }

          if (!found) {
            first = false;
          }
        }
      }); // The outermost axis on each side has no margin

      if (outermost) {
        axisMargin = 0;
      } // The ticks for the first axis in each direction stretch across


      if (tickLength == null) {
        tickLength = first ? "full" : 5;
      }

      if (!isNaN(+tickLength)) padding += +tickLength;

      if (isXAxis) {
        lh += padding;

        if (pos == "bottom") {
          plotOffset.bottom += lh + axisMargin;
          axis.box = {
            top: surface.height - plotOffset.bottom,
            height: lh
          };
        } else {
          axis.box = {
            top: plotOffset.top + axisMargin,
            height: lh
          };
          plotOffset.top += lh + axisMargin;
        }
      } else {
        lw += padding;

        if (pos == "left") {
          axis.box = {
            left: plotOffset.left + axisMargin,
            width: lw
          };
          plotOffset.left += lw + axisMargin;
        } else {
          plotOffset.right += lw + axisMargin;
          axis.box = {
            left: surface.width - plotOffset.right,
            width: lw
          };
        }
      } // save for future reference


      axis.position = pos;
      axis.tickLength = tickLength;
      axis.box.padding = padding;
      axis.innermost = innermost;
    }

    function allocateAxisBoxSecondPhase(axis) {
      // now that all axis boxes have been placed in one
      // dimension, we can set the remaining dimension coordinates
      if (axis.direction == "x") {
        axis.box.left = plotOffset.left - axis.labelWidth / 2;
        axis.box.width = surface.width - plotOffset.left - plotOffset.right + axis.labelWidth;
      } else {
        axis.box.top = plotOffset.top - axis.labelHeight / 2;
        axis.box.height = surface.height - plotOffset.bottom - plotOffset.top + axis.labelHeight;
      }
    }

    function adjustLayoutForThingsStickingOut() {
      // possibly adjust plot offset to ensure everything stays
      // inside the canvas and isn't clipped off
      var minMargin = options.grid.minBorderMargin,
          axis,
          i; // check stuff from the plot (FIXME: this should just read
      // a value from the series, otherwise it's impossible to
      // customize)

      if (minMargin == null) {
        minMargin = 0;

        for (i = 0; i < series.length; ++i) {
          minMargin = Math.max(minMargin, 2 * (series[i].points.radius + series[i].points.lineWidth / 2));
        }
      }

      var margins = {
        left: minMargin,
        right: minMargin,
        top: minMargin,
        bottom: minMargin
      }; // check axis labels, note we don't check the actual
      // labels but instead use the overall width/height to not
      // jump as much around with replots

      $.each(allAxes(), function (_, axis) {
        if (axis.reserveSpace && axis.ticks && axis.ticks.length) {
          if (axis.direction === "x") {
            margins.left = Math.max(margins.left, axis.labelWidth / 2);
            margins.right = Math.max(margins.right, axis.labelWidth / 2);
          } else {
            margins.bottom = Math.max(margins.bottom, axis.labelHeight / 2);
            margins.top = Math.max(margins.top, axis.labelHeight / 2);
          }
        }
      });
      plotOffset.left = Math.ceil(Math.max(margins.left, plotOffset.left));
      plotOffset.right = Math.ceil(Math.max(margins.right, plotOffset.right));
      plotOffset.top = Math.ceil(Math.max(margins.top, plotOffset.top));
      plotOffset.bottom = Math.ceil(Math.max(margins.bottom, plotOffset.bottom));
    }

    function setupGrid() {
      var i,
          axes = allAxes(),
          showGrid = options.grid.show; // Initialize the plot's offset from the edge of the canvas

      for (var a in plotOffset) {
        var margin = options.grid.margin || 0;
        plotOffset[a] = typeof margin == "number" ? margin : margin[a] || 0;
      }

      executeHooks(hooks.processOffset, [plotOffset]); // If the grid is visible, add its border width to the offset

      for (var a in plotOffset) {
        if (_typeof(options.grid.borderWidth) == "object") {
          plotOffset[a] += showGrid ? options.grid.borderWidth[a] : 0;
        } else {
          plotOffset[a] += showGrid ? options.grid.borderWidth : 0;
        }
      }

      $.each(axes, function (_, axis) {
        var axisOpts = axis.options;
        axis.show = axisOpts.show == null ? axis.used : axisOpts.show;
        axis.reserveSpace = axisOpts.reserveSpace == null ? axis.show : axisOpts.reserveSpace;
        setRange(axis);
      });

      if (showGrid) {
        var allocatedAxes = $.grep(axes, function (axis) {
          return axis.show || axis.reserveSpace;
        });
        $.each(allocatedAxes, function (_, axis) {
          // make the ticks
          setupTickGeneration(axis);
          setTicks(axis);
          snapRangeToTicks(axis, axis.ticks); // find labelWidth/Height for axis

          measureTickLabels(axis);
        }); // with all dimensions calculated, we can compute the
        // axis bounding boxes, start from the outside
        // (reverse order)

        for (i = allocatedAxes.length - 1; i >= 0; --i) {
          allocateAxisBoxFirstPhase(allocatedAxes[i]);
        } // make sure we've got enough space for things that
        // might stick out


        adjustLayoutForThingsStickingOut();
        $.each(allocatedAxes, function (_, axis) {
          allocateAxisBoxSecondPhase(axis);
        });
      }

      plotWidth = surface.width - plotOffset.left - plotOffset.right;
      plotHeight = surface.height - plotOffset.bottom - plotOffset.top; // now we got the proper plot dimensions, we can compute the scaling

      $.each(axes, function (_, axis) {
        setTransformationHelpers(axis);
      });

      if (showGrid) {
        drawAxisLabels();
      }

      insertLegend();
    }

    function setRange(axis) {
      var opts = axis.options,
          min = +(opts.min != null ? opts.min : axis.datamin),
          max = +(opts.max != null ? opts.max : axis.datamax),
          delta = max - min;

      if (delta == 0.0) {
        // degenerate case
        var widen = max == 0 ? 1 : 0.01;
        if (opts.min == null) min -= widen; // always widen max if we couldn't widen min to ensure we
        // don't fall into min == max which doesn't work

        if (opts.max == null || opts.min != null) max += widen;
      } else {
        // consider autoscaling
        var margin = opts.autoscaleMargin;

        if (margin != null) {
          if (opts.min == null) {
            min -= delta * margin; // make sure we don't go below zero if all values
            // are positive

            if (min < 0 && axis.datamin != null && axis.datamin >= 0) min = 0;
          }

          if (opts.max == null) {
            max += delta * margin;
            if (max > 0 && axis.datamax != null && axis.datamax <= 0) max = 0;
          }
        }
      }

      axis.min = min;
      axis.max = max;
    }

    function setupTickGeneration(axis) {
      var opts = axis.options; // estimate number of ticks

      var noTicks;
      if (typeof opts.ticks == "number" && opts.ticks > 0) noTicks = opts.ticks;else // heuristic based on the model a*sqrt(x) fitted to
        // some data points that seemed reasonable
        noTicks = 0.3 * Math.sqrt(axis.direction == "x" ? surface.width : surface.height);
      var delta = (axis.max - axis.min) / noTicks,
          dec = -Math.floor(Math.log(delta) / Math.LN10),
          maxDec = opts.tickDecimals;

      if (maxDec != null && dec > maxDec) {
        dec = maxDec;
      }

      var magn = Math.pow(10, -dec),
          norm = delta / magn,
          // norm is between 1.0 and 10.0
      size;

      if (norm < 1.5) {
        size = 1;
      } else if (norm < 3) {
        size = 2; // special case for 2.5, requires an extra decimal

        if (norm > 2.25 && (maxDec == null || dec + 1 <= maxDec)) {
          size = 2.5;
          ++dec;
        }
      } else if (norm < 7.5) {
        size = 5;
      } else {
        size = 10;
      }

      size *= magn;

      if (opts.minTickSize != null && size < opts.minTickSize) {
        size = opts.minTickSize;
      }

      axis.delta = delta;
      axis.tickDecimals = Math.max(0, maxDec != null ? maxDec : dec);
      axis.tickSize = opts.tickSize || size; // Time mode was moved to a plug-in in 0.8, and since so many people use it
      // we'll add an especially friendly reminder to make sure they included it.

      if (opts.mode == "time" && !axis.tickGenerator) {
        throw new Error("Time mode requires the flot.time plugin.");
      } // Flot supports base-10 axes; any other mode else is handled by a plug-in,
      // like flot.time.js.


      if (!axis.tickGenerator) {
        axis.tickGenerator = function (axis) {
          var ticks = [],
              start = floorInBase(axis.min, axis.tickSize),
              i = 0,
              v = Number.NaN,
              prev;

          do {
            prev = v;
            v = start + i * axis.tickSize;
            ticks.push(v);
            ++i;
          } while (v < axis.max && v != prev);

          return ticks;
        };

        axis.tickFormatter = function (value, axis) {
          var factor = axis.tickDecimals ? Math.pow(10, axis.tickDecimals) : 1;
          var formatted = "" + Math.round(value * factor) / factor; // If tickDecimals was specified, ensure that we have exactly that
          // much precision; otherwise default to the value's own precision.

          if (axis.tickDecimals != null) {
            var decimal = formatted.indexOf(".");
            var precision = decimal == -1 ? 0 : formatted.length - decimal - 1;

            if (precision < axis.tickDecimals) {
              return (precision ? formatted : formatted + ".") + ("" + factor).substr(1, axis.tickDecimals - precision);
            }
          }

          return formatted;
        };
      }

      if ($.isFunction(opts.tickFormatter)) axis.tickFormatter = function (v, axis) {
        return "" + opts.tickFormatter(v, axis);
      };

      if (opts.alignTicksWithAxis != null) {
        var otherAxis = (axis.direction == "x" ? xaxes : yaxes)[opts.alignTicksWithAxis - 1];

        if (otherAxis && otherAxis.used && otherAxis != axis) {
          // consider snapping min/max to outermost nice ticks
          var niceTicks = axis.tickGenerator(axis);

          if (niceTicks.length > 0) {
            if (opts.min == null) axis.min = Math.min(axis.min, niceTicks[0]);
            if (opts.max == null && niceTicks.length > 1) axis.max = Math.max(axis.max, niceTicks[niceTicks.length - 1]);
          }

          axis.tickGenerator = function (axis) {
            // copy ticks, scaled to this axis
            var ticks = [],
                v,
                i;

            for (i = 0; i < otherAxis.ticks.length; ++i) {
              v = (otherAxis.ticks[i].v - otherAxis.min) / (otherAxis.max - otherAxis.min);
              v = axis.min + v * (axis.max - axis.min);
              ticks.push(v);
            }

            return ticks;
          }; // we might need an extra decimal since forced
          // ticks don't necessarily fit naturally


          if (!axis.mode && opts.tickDecimals == null) {
            var extraDec = Math.max(0, -Math.floor(Math.log(axis.delta) / Math.LN10) + 1),
                ts = axis.tickGenerator(axis); // only proceed if the tick interval rounded
            // with an extra decimal doesn't give us a
            // zero at end

            if (!(ts.length > 1 && /\..*0$/.test((ts[1] - ts[0]).toFixed(extraDec)))) axis.tickDecimals = extraDec;
          }
        }
      }
    }

    function setTicks(axis) {
      var oticks = axis.options.ticks,
          ticks = [];
      if (oticks == null || typeof oticks == "number" && oticks > 0) ticks = axis.tickGenerator(axis);else if (oticks) {
        if ($.isFunction(oticks)) // generate the ticks
          ticks = oticks(axis);else ticks = oticks;
      } // clean up/labelify the supplied ticks, copy them over

      var i, v;
      axis.ticks = [];

      for (i = 0; i < ticks.length; ++i) {
        var label = null;
        var t = ticks[i];

        if (_typeof(t) == "object") {
          v = +t[0];
          if (t.length > 1) label = t[1];
        } else v = +t;

        if (label == null) label = axis.tickFormatter(v, axis);
        if (!isNaN(v)) axis.ticks.push({
          v: v,
          label: label
        });
      }
    }

    function snapRangeToTicks(axis, ticks) {
      if (axis.options.autoscaleMargin && ticks.length > 0) {
        // snap to ticks
        if (axis.options.min == null) axis.min = Math.min(axis.min, ticks[0].v);
        if (axis.options.max == null && ticks.length > 1) axis.max = Math.max(axis.max, ticks[ticks.length - 1].v);
      }
    }

    function draw() {
      surface.clear();
      executeHooks(hooks.drawBackground, [ctx]);
      var grid = options.grid; // draw background, if any

      if (grid.show && grid.backgroundColor) drawBackground();

      if (grid.show && !grid.aboveData) {
        drawGrid();
      }

      for (var i = 0; i < series.length; ++i) {
        executeHooks(hooks.drawSeries, [ctx, series[i]]);
        drawSeries(series[i]);
      }

      executeHooks(hooks.draw, [ctx]);

      if (grid.show && grid.aboveData) {
        drawGrid();
      }

      surface.render(); // A draw implies that either the axes or data have changed, so we
      // should probably update the overlay highlights as well.

      triggerRedrawOverlay();
    }

    function extractRange(ranges, coord) {
      var axis,
          from,
          to,
          key,
          axes = allAxes();

      for (var i = 0; i < axes.length; ++i) {
        axis = axes[i];

        if (axis.direction == coord) {
          key = coord + axis.n + "axis";
          if (!ranges[key] && axis.n == 1) key = coord + "axis"; // support x1axis as xaxis

          if (ranges[key]) {
            from = ranges[key].from;
            to = ranges[key].to;
            break;
          }
        }
      } // backwards-compat stuff - to be removed in future


      if (!ranges[key]) {
        axis = coord == "x" ? xaxes[0] : yaxes[0];
        from = ranges[coord + "1"];
        to = ranges[coord + "2"];
      } // auto-reverse as an added bonus


      if (from != null && to != null && from > to) {
        var tmp = from;
        from = to;
        to = tmp;
      }

      return {
        from: from,
        to: to,
        axis: axis
      };
    }

    function drawBackground() {
      ctx.save();
      ctx.translate(plotOffset.left, plotOffset.top);
      ctx.fillStyle = getColorOrGradient(options.grid.backgroundColor, plotHeight, 0, "rgba(255, 255, 255, 0)");
      ctx.fillRect(0, 0, plotWidth, plotHeight);
      ctx.restore();
    }

    function drawGrid() {
      var i, axes, bw, bc;
      ctx.save();
      ctx.translate(plotOffset.left, plotOffset.top); // draw markings

      var markings = options.grid.markings;

      if (markings) {
        if ($.isFunction(markings)) {
          axes = plot.getAxes(); // xmin etc. is backwards compatibility, to be
          // removed in the future

          axes.xmin = axes.xaxis.min;
          axes.xmax = axes.xaxis.max;
          axes.ymin = axes.yaxis.min;
          axes.ymax = axes.yaxis.max;
          markings = markings(axes);
        }

        for (i = 0; i < markings.length; ++i) {
          var m = markings[i],
              xrange = extractRange(m, "x"),
              yrange = extractRange(m, "y"); // fill in missing

          if (xrange.from == null) xrange.from = xrange.axis.min;
          if (xrange.to == null) xrange.to = xrange.axis.max;
          if (yrange.from == null) yrange.from = yrange.axis.min;
          if (yrange.to == null) yrange.to = yrange.axis.max; // clip

          if (xrange.to < xrange.axis.min || xrange.from > xrange.axis.max || yrange.to < yrange.axis.min || yrange.from > yrange.axis.max) continue;
          xrange.from = Math.max(xrange.from, xrange.axis.min);
          xrange.to = Math.min(xrange.to, xrange.axis.max);
          yrange.from = Math.max(yrange.from, yrange.axis.min);
          yrange.to = Math.min(yrange.to, yrange.axis.max);
          var xequal = xrange.from === xrange.to,
              yequal = yrange.from === yrange.to;

          if (xequal && yequal) {
            continue;
          } // then draw


          xrange.from = Math.floor(xrange.axis.p2c(xrange.from));
          xrange.to = Math.floor(xrange.axis.p2c(xrange.to));
          yrange.from = Math.floor(yrange.axis.p2c(yrange.from));
          yrange.to = Math.floor(yrange.axis.p2c(yrange.to));

          if (xequal || yequal) {
            var lineWidth = m.lineWidth || options.grid.markingsLineWidth,
                subPixel = lineWidth % 2 ? 0.5 : 0;
            ctx.beginPath();
            ctx.strokeStyle = m.color || options.grid.markingsColor;
            ctx.lineWidth = lineWidth;

            if (xequal) {
              ctx.moveTo(xrange.to + subPixel, yrange.from);
              ctx.lineTo(xrange.to + subPixel, yrange.to);
            } else {
              ctx.moveTo(xrange.from, yrange.to + subPixel);
              ctx.lineTo(xrange.to, yrange.to + subPixel);
            }

            ctx.stroke();
          } else {
            ctx.fillStyle = m.color || options.grid.markingsColor;
            ctx.fillRect(xrange.from, yrange.to, xrange.to - xrange.from, yrange.from - yrange.to);
          }
        }
      } // draw the ticks


      axes = allAxes();
      bw = options.grid.borderWidth;

      for (var j = 0; j < axes.length; ++j) {
        var axis = axes[j],
            box = axis.box,
            t = axis.tickLength,
            x,
            y,
            xoff,
            yoff;
        if (!axis.show || axis.ticks.length == 0) continue;
        ctx.lineWidth = 1; // find the edges

        if (axis.direction == "x") {
          x = 0;
          if (t == "full") y = axis.position == "top" ? 0 : plotHeight;else y = box.top - plotOffset.top + (axis.position == "top" ? box.height : 0);
        } else {
          y = 0;
          if (t == "full") x = axis.position == "left" ? 0 : plotWidth;else x = box.left - plotOffset.left + (axis.position == "left" ? box.width : 0);
        } // draw tick bar


        if (!axis.innermost) {
          ctx.strokeStyle = axis.options.color;
          ctx.beginPath();
          xoff = yoff = 0;
          if (axis.direction == "x") xoff = plotWidth + 1;else yoff = plotHeight + 1;

          if (ctx.lineWidth == 1) {
            if (axis.direction == "x") {
              y = Math.floor(y) + 0.5;
            } else {
              x = Math.floor(x) + 0.5;
            }
          }

          ctx.moveTo(x, y);
          ctx.lineTo(x + xoff, y + yoff);
          ctx.stroke();
        } // draw ticks


        ctx.strokeStyle = axis.options.tickColor;
        ctx.beginPath();

        for (i = 0; i < axis.ticks.length; ++i) {
          var v = axis.ticks[i].v;
          xoff = yoff = 0;
          if (isNaN(v) || v < axis.min || v > axis.max // skip those lying on the axes if we got a border
          || t == "full" && (_typeof(bw) == "object" && bw[axis.position] > 0 || bw > 0) && (v == axis.min || v == axis.max)) continue;

          if (axis.direction == "x") {
            x = axis.p2c(v);
            yoff = t == "full" ? -plotHeight : t;
            if (axis.position == "top") yoff = -yoff;
          } else {
            y = axis.p2c(v);
            xoff = t == "full" ? -plotWidth : t;
            if (axis.position == "left") xoff = -xoff;
          }

          if (ctx.lineWidth == 1) {
            if (axis.direction == "x") x = Math.floor(x) + 0.5;else y = Math.floor(y) + 0.5;
          }

          ctx.moveTo(x, y);
          ctx.lineTo(x + xoff, y + yoff);
        }

        ctx.stroke();
      } // draw border


      if (bw) {
        // If either borderWidth or borderColor is an object, then draw the border
        // line by line instead of as one rectangle
        bc = options.grid.borderColor;

        if (_typeof(bw) == "object" || _typeof(bc) == "object") {
          if (_typeof(bw) !== "object") {
            bw = {
              top: bw,
              right: bw,
              bottom: bw,
              left: bw
            };
          }

          if (_typeof(bc) !== "object") {
            bc = {
              top: bc,
              right: bc,
              bottom: bc,
              left: bc
            };
          }

          if (bw.top > 0) {
            ctx.strokeStyle = bc.top;
            ctx.lineWidth = bw.top;
            ctx.beginPath();
            ctx.moveTo(0 - bw.left, 0 - bw.top / 2);
            ctx.lineTo(plotWidth, 0 - bw.top / 2);
            ctx.stroke();
          }

          if (bw.right > 0) {
            ctx.strokeStyle = bc.right;
            ctx.lineWidth = bw.right;
            ctx.beginPath();
            ctx.moveTo(plotWidth + bw.right / 2, 0 - bw.top);
            ctx.lineTo(plotWidth + bw.right / 2, plotHeight);
            ctx.stroke();
          }

          if (bw.bottom > 0) {
            ctx.strokeStyle = bc.bottom;
            ctx.lineWidth = bw.bottom;
            ctx.beginPath();
            ctx.moveTo(plotWidth + bw.right, plotHeight + bw.bottom / 2);
            ctx.lineTo(0, plotHeight + bw.bottom / 2);
            ctx.stroke();
          }

          if (bw.left > 0) {
            ctx.strokeStyle = bc.left;
            ctx.lineWidth = bw.left;
            ctx.beginPath();
            ctx.moveTo(0 - bw.left / 2, plotHeight + bw.bottom);
            ctx.lineTo(0 - bw.left / 2, 0);
            ctx.stroke();
          }
        } else {
          ctx.lineWidth = bw;
          ctx.strokeStyle = options.grid.borderColor;
          ctx.strokeRect(-bw / 2, -bw / 2, plotWidth + bw, plotHeight + bw);
        }
      }

      ctx.restore();
    }

    function drawAxisLabels() {
      $.each(allAxes(), function (_, axis) {
        var box = axis.box,
            legacyStyles = axis.direction + "Axis " + axis.direction + axis.n + "Axis",
            layer = "flot-" + axis.direction + "-axis flot-" + axis.direction + axis.n + "-axis " + legacyStyles,
            font = axis.options.font || "flot-tick-label tickLabel",
            tick,
            x,
            y,
            halign,
            valign; // Remove text before checking for axis.show and ticks.length;
        // otherwise plugins, like flot-tickrotor, that draw their own
        // tick labels will end up with both theirs and the defaults.

        surface.removeText(layer);
        if (!axis.show || axis.ticks.length == 0) return;

        for (var i = 0; i < axis.ticks.length; ++i) {
          tick = axis.ticks[i];
          if (!tick.label || tick.v < axis.min || tick.v > axis.max) continue;

          if (axis.direction == "x") {
            halign = "center";
            x = plotOffset.left + axis.p2c(tick.v);

            if (axis.position == "bottom") {
              y = box.top + box.padding;
            } else {
              y = box.top + box.height - box.padding;
              valign = "bottom";
            }
          } else {
            valign = "middle";
            y = plotOffset.top + axis.p2c(tick.v);

            if (axis.position == "left") {
              x = box.left + box.width - box.padding;
              halign = "right";
            } else {
              x = box.left + box.padding;
            }
          }

          surface.addText(layer, x, y, tick.label, font, null, null, halign, valign);
        }
      });
    }

    function drawSeries(series) {
      if (series.lines.show) drawSeriesLines(series);
      if (series.bars.show) drawSeriesBars(series);
      if (series.points.show) drawSeriesPoints(series);
    }

    function drawSeriesLines(series) {
      function plotLine(datapoints, xoffset, yoffset, axisx, axisy) {
        var points = datapoints.points,
            ps = datapoints.pointsize,
            prevx = null,
            prevy = null;
        ctx.beginPath();

        for (var i = ps; i < points.length; i += ps) {
          var x1 = points[i - ps],
              y1 = points[i - ps + 1],
              x2 = points[i],
              y2 = points[i + 1];
          if (x1 == null || x2 == null) continue; // clip with ymin

          if (y1 <= y2 && y1 < axisy.min) {
            if (y2 < axisy.min) continue; // line segment is outside
            // compute new intersection point

            x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
            y1 = axisy.min;
          } else if (y2 <= y1 && y2 < axisy.min) {
            if (y1 < axisy.min) continue;
            x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
            y2 = axisy.min;
          } // clip with ymax


          if (y1 >= y2 && y1 > axisy.max) {
            if (y2 > axisy.max) continue;
            x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
            y1 = axisy.max;
          } else if (y2 >= y1 && y2 > axisy.max) {
            if (y1 > axisy.max) continue;
            x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
            y2 = axisy.max;
          } // clip with xmin


          if (x1 <= x2 && x1 < axisx.min) {
            if (x2 < axisx.min) continue;
            y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
            x1 = axisx.min;
          } else if (x2 <= x1 && x2 < axisx.min) {
            if (x1 < axisx.min) continue;
            y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
            x2 = axisx.min;
          } // clip with xmax


          if (x1 >= x2 && x1 > axisx.max) {
            if (x2 > axisx.max) continue;
            y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
            x1 = axisx.max;
          } else if (x2 >= x1 && x2 > axisx.max) {
            if (x1 > axisx.max) continue;
            y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
            x2 = axisx.max;
          }

          if (x1 != prevx || y1 != prevy) ctx.moveTo(axisx.p2c(x1) + xoffset, axisy.p2c(y1) + yoffset);
          prevx = x2;
          prevy = y2;
          ctx.lineTo(axisx.p2c(x2) + xoffset, axisy.p2c(y2) + yoffset);
        }

        ctx.stroke();
      }

      function plotLineArea(datapoints, axisx, axisy) {
        var points = datapoints.points,
            ps = datapoints.pointsize,
            bottom = Math.min(Math.max(0, axisy.min), axisy.max),
            i = 0,
            top,
            areaOpen = false,
            ypos = 1,
            segmentStart = 0,
            segmentEnd = 0; // we process each segment in two turns, first forward
        // direction to sketch out top, then once we hit the
        // end we go backwards to sketch the bottom

        while (true) {
          if (ps > 0 && i > points.length + ps) break;
          i += ps; // ps is negative if going backwards

          var x1 = points[i - ps],
              y1 = points[i - ps + ypos],
              x2 = points[i],
              y2 = points[i + ypos];

          if (areaOpen) {
            if (ps > 0 && x1 != null && x2 == null) {
              // at turning point
              segmentEnd = i;
              ps = -ps;
              ypos = 2;
              continue;
            }

            if (ps < 0 && i == segmentStart + ps) {
              // done with the reverse sweep
              ctx.fill();
              areaOpen = false;
              ps = -ps;
              ypos = 1;
              i = segmentStart = segmentEnd + ps;
              continue;
            }
          }

          if (x1 == null || x2 == null) continue; // clip x values
          // clip with xmin

          if (x1 <= x2 && x1 < axisx.min) {
            if (x2 < axisx.min) continue;
            y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
            x1 = axisx.min;
          } else if (x2 <= x1 && x2 < axisx.min) {
            if (x1 < axisx.min) continue;
            y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
            x2 = axisx.min;
          } // clip with xmax


          if (x1 >= x2 && x1 > axisx.max) {
            if (x2 > axisx.max) continue;
            y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
            x1 = axisx.max;
          } else if (x2 >= x1 && x2 > axisx.max) {
            if (x1 > axisx.max) continue;
            y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
            x2 = axisx.max;
          }

          if (!areaOpen) {
            // open area
            ctx.beginPath();
            ctx.moveTo(axisx.p2c(x1), axisy.p2c(bottom));
            areaOpen = true;
          } // now first check the case where both is outside


          if (y1 >= axisy.max && y2 >= axisy.max) {
            ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.max));
            ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.max));
            continue;
          } else if (y1 <= axisy.min && y2 <= axisy.min) {
            ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.min));
            ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.min));
            continue;
          } // else it's a bit more complicated, there might
          // be a flat maxed out rectangle first, then a
          // triangular cutout or reverse; to find these
          // keep track of the current x values


          var x1old = x1,
              x2old = x2; // clip the y values, without shortcutting, we
          // go through all cases in turn
          // clip with ymin

          if (y1 <= y2 && y1 < axisy.min && y2 >= axisy.min) {
            x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
            y1 = axisy.min;
          } else if (y2 <= y1 && y2 < axisy.min && y1 >= axisy.min) {
            x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
            y2 = axisy.min;
          } // clip with ymax


          if (y1 >= y2 && y1 > axisy.max && y2 <= axisy.max) {
            x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
            y1 = axisy.max;
          } else if (y2 >= y1 && y2 > axisy.max && y1 <= axisy.max) {
            x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
            y2 = axisy.max;
          } // if the x value was changed we got a rectangle
          // to fill


          if (x1 != x1old) {
            ctx.lineTo(axisx.p2c(x1old), axisy.p2c(y1)); // it goes to (x1, y1), but we fill that below
          } // fill triangular section, this sometimes result
          // in redundant points if (x1, y1) hasn't changed
          // from previous line to, but we just ignore that


          ctx.lineTo(axisx.p2c(x1), axisy.p2c(y1));
          ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2)); // fill the other rectangle if it's there

          if (x2 != x2old) {
            ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2));
            ctx.lineTo(axisx.p2c(x2old), axisy.p2c(y2));
          }
        }
      }

      ctx.save();
      ctx.translate(plotOffset.left, plotOffset.top);
      ctx.lineJoin = "round";
      var lw = series.lines.lineWidth,
          sw = series.shadowSize; // FIXME: consider another form of shadow when filling is turned on

      if (lw > 0 && sw > 0) {
        // draw shadow as a thick and thin line with transparency
        ctx.lineWidth = sw;
        ctx.strokeStyle = "rgba(0,0,0,0.1)"; // position shadow at angle from the mid of line

        var angle = Math.PI / 18;
        plotLine(series.datapoints, Math.sin(angle) * (lw / 2 + sw / 2), Math.cos(angle) * (lw / 2 + sw / 2), series.xaxis, series.yaxis);
        ctx.lineWidth = sw / 2;
        plotLine(series.datapoints, Math.sin(angle) * (lw / 2 + sw / 4), Math.cos(angle) * (lw / 2 + sw / 4), series.xaxis, series.yaxis);
      }

      ctx.lineWidth = lw;
      ctx.strokeStyle = series.color;
      var fillStyle = getFillStyle(series.lines, series.color, 0, plotHeight);

      if (fillStyle) {
        ctx.fillStyle = fillStyle;
        plotLineArea(series.datapoints, series.xaxis, series.yaxis);
      }

      if (lw > 0) plotLine(series.datapoints, 0, 0, series.xaxis, series.yaxis);
      ctx.restore();
    }

    function drawSeriesPoints(series) {
      function plotPoints(datapoints, radius, fillStyle, offset, shadow, axisx, axisy, symbol) {
        var points = datapoints.points,
            ps = datapoints.pointsize;

        for (var i = 0; i < points.length; i += ps) {
          var x = points[i],
              y = points[i + 1];
          if (x == null || x < axisx.min || x > axisx.max || y < axisy.min || y > axisy.max) continue;
          ctx.beginPath();
          x = axisx.p2c(x);
          y = axisy.p2c(y) + offset;
          if (symbol == "circle") ctx.arc(x, y, radius, 0, shadow ? Math.PI : Math.PI * 2, false);else symbol(ctx, x, y, radius, shadow);
          ctx.closePath();

          if (fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.fill();
          }

          ctx.stroke();
        }
      }

      ctx.save();
      ctx.translate(plotOffset.left, plotOffset.top);
      var lw = series.points.lineWidth,
          sw = series.shadowSize,
          radius = series.points.radius,
          symbol = series.points.symbol; // If the user sets the line width to 0, we change it to a very 
      // small value. A line width of 0 seems to force the default of 1.
      // Doing the conditional here allows the shadow setting to still be 
      // optional even with a lineWidth of 0.

      if (lw == 0) lw = 0.0001;

      if (lw > 0 && sw > 0) {
        // draw shadow in two steps
        var w = sw / 2;
        ctx.lineWidth = w;
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        plotPoints(series.datapoints, radius, null, w + w / 2, true, series.xaxis, series.yaxis, symbol);
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        plotPoints(series.datapoints, radius, null, w / 2, true, series.xaxis, series.yaxis, symbol);
      }

      ctx.lineWidth = lw;
      ctx.strokeStyle = series.color;
      plotPoints(series.datapoints, radius, getFillStyle(series.points, series.color), 0, false, series.xaxis, series.yaxis, symbol);
      ctx.restore();
    }

    function drawBar(x, y, b, barLeft, barRight, fillStyleCallback, axisx, axisy, c, horizontal, lineWidth) {
      var left, right, bottom, top, drawLeft, drawRight, drawTop, drawBottom, tmp; // in horizontal mode, we start the bar from the left
      // instead of from the bottom so it appears to be
      // horizontal rather than vertical

      if (horizontal) {
        drawBottom = drawRight = drawTop = true;
        drawLeft = false;
        left = b;
        right = x;
        top = y + barLeft;
        bottom = y + barRight; // account for negative bars

        if (right < left) {
          tmp = right;
          right = left;
          left = tmp;
          drawLeft = true;
          drawRight = false;
        }
      } else {
        drawLeft = drawRight = drawTop = true;
        drawBottom = false;
        left = x + barLeft;
        right = x + barRight;
        bottom = b;
        top = y; // account for negative bars

        if (top < bottom) {
          tmp = top;
          top = bottom;
          bottom = tmp;
          drawBottom = true;
          drawTop = false;
        }
      } // clip


      if (right < axisx.min || left > axisx.max || top < axisy.min || bottom > axisy.max) return;

      if (left < axisx.min) {
        left = axisx.min;
        drawLeft = false;
      }

      if (right > axisx.max) {
        right = axisx.max;
        drawRight = false;
      }

      if (bottom < axisy.min) {
        bottom = axisy.min;
        drawBottom = false;
      }

      if (top > axisy.max) {
        top = axisy.max;
        drawTop = false;
      }

      left = axisx.p2c(left);
      bottom = axisy.p2c(bottom);
      right = axisx.p2c(right);
      top = axisy.p2c(top); // fill the bar

      if (fillStyleCallback) {
        c.fillStyle = fillStyleCallback(bottom, top);
        c.fillRect(left, top, right - left, bottom - top);
      } // draw outline


      if (lineWidth > 0 && (drawLeft || drawRight || drawTop || drawBottom)) {
        c.beginPath(); // FIXME: inline moveTo is buggy with excanvas

        c.moveTo(left, bottom);
        if (drawLeft) c.lineTo(left, top);else c.moveTo(left, top);
        if (drawTop) c.lineTo(right, top);else c.moveTo(right, top);
        if (drawRight) c.lineTo(right, bottom);else c.moveTo(right, bottom);
        if (drawBottom) c.lineTo(left, bottom);else c.moveTo(left, bottom);
        c.stroke();
      }
    }

    function drawSeriesBars(series) {
      function plotBars(datapoints, barLeft, barRight, fillStyleCallback, axisx, axisy) {
        var points = datapoints.points,
            ps = datapoints.pointsize;

        for (var i = 0; i < points.length; i += ps) {
          if (points[i] == null) continue;
          drawBar(points[i], points[i + 1], points[i + 2], barLeft, barRight, fillStyleCallback, axisx, axisy, ctx, series.bars.horizontal, series.bars.lineWidth);
        }
      }

      ctx.save();
      ctx.translate(plotOffset.left, plotOffset.top); // FIXME: figure out a way to add shadows (for instance along the right edge)

      ctx.lineWidth = series.bars.lineWidth;
      ctx.strokeStyle = series.color;
      var barLeft;

      switch (series.bars.align) {
        case "left":
          barLeft = 0;
          break;

        case "right":
          barLeft = -series.bars.barWidth;
          break;

        default:
          barLeft = -series.bars.barWidth / 2;
      }

      var fillStyleCallback = series.bars.fill ? function (bottom, top) {
        return getFillStyle(series.bars, series.color, bottom, top);
      } : null;
      plotBars(series.datapoints, barLeft, barLeft + series.bars.barWidth, fillStyleCallback, series.xaxis, series.yaxis);
      ctx.restore();
    }

    function getFillStyle(filloptions, seriesColor, bottom, top) {
      var fill = filloptions.fill;
      if (!fill) return null;
      if (filloptions.fillColor) return getColorOrGradient(filloptions.fillColor, bottom, top, seriesColor);
      var c = $.color.parse(seriesColor);
      c.a = typeof fill == "number" ? fill : 0.4;
      c.normalize();
      return c.toString();
    }

    function insertLegend() {
      if (options.legend.container != null) {
        $(options.legend.container).html("");
      } else {
        placeholder.find(".legend").remove();
      }

      if (!options.legend.show) {
        return;
      }

      var fragments = [],
          entries = [],
          rowStarted = false,
          lf = options.legend.labelFormatter,
          s,
          label; // Build a list of legend entries, with each having a label and a color

      for (var i = 0; i < series.length; ++i) {
        s = series[i];

        if (s.label) {
          label = lf ? lf(s.label, s) : s.label;

          if (label) {
            entries.push({
              label: label,
              color: s.color
            });
          }
        }
      } // Sort the legend using either the default or a custom comparator


      if (options.legend.sorted) {
        if ($.isFunction(options.legend.sorted)) {
          entries.sort(options.legend.sorted);
        } else if (options.legend.sorted == "reverse") {
          entries.reverse();
        } else {
          var ascending = options.legend.sorted != "descending";
          entries.sort(function (a, b) {
            return a.label == b.label ? 0 : a.label < b.label != ascending ? 1 : -1 // Logical XOR
            ;
          });
        }
      } // Generate markup for the list of entries, in their final order


      for (var i = 0; i < entries.length; ++i) {
        var entry = entries[i];

        if (i % options.legend.noColumns == 0) {
          if (rowStarted) fragments.push('</tr>');
          fragments.push('<tr>');
          rowStarted = true;
        }

        fragments.push('<td class="legendColorBox"><div style="border:1px solid ' + options.legend.labelBoxBorderColor + ';padding:1px"><div style="width:4px;height:0;border:5px solid ' + entry.color + ';overflow:hidden"></div></div></td>' + '<td class="legendLabel">' + entry.label + '</td>');
      }

      if (rowStarted) fragments.push('</tr>');
      if (fragments.length == 0) return;
      var table = '<table style="font-size:smaller;color:' + options.grid.color + '">' + fragments.join("") + '</table>';
      if (options.legend.container != null) $(options.legend.container).html(table);else {
        var pos = "",
            p = options.legend.position,
            m = options.legend.margin;
        if (m[0] == null) m = [m, m];
        if (p.charAt(0) == "n") pos += 'top:' + (m[1] + plotOffset.top) + 'px;';else if (p.charAt(0) == "s") pos += 'bottom:' + (m[1] + plotOffset.bottom) + 'px;';
        if (p.charAt(1) == "e") pos += 'right:' + (m[0] + plotOffset.right) + 'px;';else if (p.charAt(1) == "w") pos += 'left:' + (m[0] + plotOffset.left) + 'px;';
        var legend = $('<div class="legend">' + table.replace('style="', 'style="position:absolute;' + pos + ';') + '</div>').appendTo(placeholder);

        if (options.legend.backgroundOpacity != 0.0) {
          // put in the transparent background
          // separately to avoid blended labels and
          // label boxes
          var c = options.legend.backgroundColor;

          if (c == null) {
            c = options.grid.backgroundColor;
            if (c && typeof c == "string") c = $.color.parse(c);else c = $.color.extract(legend, 'background-color');
            c.a = 1;
            c = c.toString();
          }

          var div = legend.children();
          $('<div style="position:absolute;width:' + div.width() + 'px;height:' + div.height() + 'px;' + pos + 'background-color:' + c + ';"> </div>').prependTo(legend).css('opacity', options.legend.backgroundOpacity);
        }
      }
    } // interactive features


    var highlights = [],
        redrawTimeout = null; // returns the data item the mouse is over, or null if none is found

    function findNearbyItem(mouseX, mouseY, seriesFilter) {
      var maxDistance = options.grid.mouseActiveRadius,
          smallestDistance = maxDistance * maxDistance + 1,
          item = null,
          foundPoint = false,
          i,
          j,
          ps;

      for (i = series.length - 1; i >= 0; --i) {
        if (!seriesFilter(series[i])) continue;
        var s = series[i],
            axisx = s.xaxis,
            axisy = s.yaxis,
            points = s.datapoints.points,
            mx = axisx.c2p(mouseX),
            // precompute some stuff to make the loop faster
        my = axisy.c2p(mouseY),
            maxx = maxDistance / axisx.scale,
            maxy = maxDistance / axisy.scale;
        ps = s.datapoints.pointsize; // with inverse transforms, we can't use the maxx/maxy
        // optimization, sadly

        if (axisx.options.inverseTransform) maxx = Number.MAX_VALUE;
        if (axisy.options.inverseTransform) maxy = Number.MAX_VALUE;

        if (s.lines.show || s.points.show) {
          for (j = 0; j < points.length; j += ps) {
            var x = points[j],
                y = points[j + 1];
            if (x == null) continue; // For points and lines, the cursor must be within a
            // certain distance to the data point

            if (x - mx > maxx || x - mx < -maxx || y - my > maxy || y - my < -maxy) continue; // We have to calculate distances in pixels, not in
            // data units, because the scales of the axes may be different

            var dx = Math.abs(axisx.p2c(x) - mouseX),
                dy = Math.abs(axisy.p2c(y) - mouseY),
                dist = dx * dx + dy * dy; // we save the sqrt
            // use <= to ensure last point takes precedence
            // (last generally means on top of)

            if (dist < smallestDistance) {
              smallestDistance = dist;
              item = [i, j / ps];
            }
          }
        }

        if (s.bars.show && !item) {
          // no other point can be nearby
          var barLeft, barRight;

          switch (s.bars.align) {
            case "left":
              barLeft = 0;
              break;

            case "right":
              barLeft = -s.bars.barWidth;
              break;

            default:
              barLeft = -s.bars.barWidth / 2;
          }

          barRight = barLeft + s.bars.barWidth;

          for (j = 0; j < points.length; j += ps) {
            var x = points[j],
                y = points[j + 1],
                b = points[j + 2];
            if (x == null) continue; // for a bar graph, the cursor must be inside the bar

            if (series[i].bars.horizontal ? mx <= Math.max(b, x) && mx >= Math.min(b, x) && my >= y + barLeft && my <= y + barRight : mx >= x + barLeft && mx <= x + barRight && my >= Math.min(b, y) && my <= Math.max(b, y)) item = [i, j / ps];
          }
        }
      }

      if (item) {
        i = item[0];
        j = item[1];
        ps = series[i].datapoints.pointsize;
        return {
          datapoint: series[i].datapoints.points.slice(j * ps, (j + 1) * ps),
          dataIndex: j,
          series: series[i],
          seriesIndex: i
        };
      }

      return null;
    }

    function onMouseMove(e) {
      if (options.grid.hoverable) triggerClickHoverEvent("plothover", e, function (s) {
        return s["hoverable"] != false;
      });
    }

    function onMouseLeave(e) {
      if (options.grid.hoverable) triggerClickHoverEvent("plothover", e, function (s) {
        return false;
      });
    }

    function onClick(e) {
      triggerClickHoverEvent("plotclick", e, function (s) {
        return s["clickable"] != false;
      });
    } // trigger click or hover event (they send the same parameters
    // so we share their code)


    function triggerClickHoverEvent(eventname, event, seriesFilter) {
      var offset = eventHolder.offset(),
          canvasX = event.pageX - offset.left - plotOffset.left,
          canvasY = event.pageY - offset.top - plotOffset.top,
          pos = canvasToAxisCoords({
        left: canvasX,
        top: canvasY
      });
      pos.pageX = event.pageX;
      pos.pageY = event.pageY;
      var item = findNearbyItem(canvasX, canvasY, seriesFilter);

      if (item) {
        // fill in mouse pos for any listeners out there
        item.pageX = parseInt(item.series.xaxis.p2c(item.datapoint[0]) + offset.left + plotOffset.left, 10);
        item.pageY = parseInt(item.series.yaxis.p2c(item.datapoint[1]) + offset.top + plotOffset.top, 10);
      }

      if (options.grid.autoHighlight) {
        // clear auto-highlights
        for (var i = 0; i < highlights.length; ++i) {
          var h = highlights[i];
          if (h.auto == eventname && !(item && h.series == item.series && h.point[0] == item.datapoint[0] && h.point[1] == item.datapoint[1])) unhighlight(h.series, h.point);
        }

        if (item) highlight(item.series, item.datapoint, eventname);
      }

      placeholder.trigger(eventname, [pos, item]);
    }

    function triggerRedrawOverlay() {
      var t = options.interaction.redrawOverlayInterval;

      if (t == -1) {
        // skip event queue
        drawOverlay();
        return;
      }

      if (!redrawTimeout) redrawTimeout = setTimeout(drawOverlay, t);
    }

    function drawOverlay() {
      redrawTimeout = null; // draw highlights

      octx.save();
      overlay.clear();
      octx.translate(plotOffset.left, plotOffset.top);
      var i, hi;

      for (i = 0; i < highlights.length; ++i) {
        hi = highlights[i];
        if (hi.series.bars.show) drawBarHighlight(hi.series, hi.point);else drawPointHighlight(hi.series, hi.point);
      }

      octx.restore();
      executeHooks(hooks.drawOverlay, [octx]);
    }

    function highlight(s, point, auto) {
      if (typeof s == "number") s = series[s];

      if (typeof point == "number") {
        var ps = s.datapoints.pointsize;
        point = s.datapoints.points.slice(ps * point, ps * (point + 1));
      }

      var i = indexOfHighlight(s, point);

      if (i == -1) {
        highlights.push({
          series: s,
          point: point,
          auto: auto
        });
        triggerRedrawOverlay();
      } else if (!auto) highlights[i].auto = false;
    }

    function unhighlight(s, point) {
      if (s == null && point == null) {
        highlights = [];
        triggerRedrawOverlay();
        return;
      }

      if (typeof s == "number") s = series[s];

      if (typeof point == "number") {
        var ps = s.datapoints.pointsize;
        point = s.datapoints.points.slice(ps * point, ps * (point + 1));
      }

      var i = indexOfHighlight(s, point);

      if (i != -1) {
        highlights.splice(i, 1);
        triggerRedrawOverlay();
      }
    }

    function indexOfHighlight(s, p) {
      for (var i = 0; i < highlights.length; ++i) {
        var h = highlights[i];
        if (h.series == s && h.point[0] == p[0] && h.point[1] == p[1]) return i;
      }

      return -1;
    }

    function drawPointHighlight(series, point) {
      var x = point[0],
          y = point[1],
          axisx = series.xaxis,
          axisy = series.yaxis,
          highlightColor = typeof series.highlightColor === "string" ? series.highlightColor : $.color.parse(series.color).scale('a', 0.5).toString();
      if (x < axisx.min || x > axisx.max || y < axisy.min || y > axisy.max) return;
      var pointRadius = series.points.radius + series.points.lineWidth / 2;
      octx.lineWidth = pointRadius;
      octx.strokeStyle = highlightColor;
      var radius = 1.5 * pointRadius;
      x = axisx.p2c(x);
      y = axisy.p2c(y);
      octx.beginPath();
      if (series.points.symbol == "circle") octx.arc(x, y, radius, 0, 2 * Math.PI, false);else series.points.symbol(octx, x, y, radius, false);
      octx.closePath();
      octx.stroke();
    }

    function drawBarHighlight(series, point) {
      var highlightColor = typeof series.highlightColor === "string" ? series.highlightColor : $.color.parse(series.color).scale('a', 0.5).toString(),
          fillStyle = highlightColor,
          barLeft;

      switch (series.bars.align) {
        case "left":
          barLeft = 0;
          break;

        case "right":
          barLeft = -series.bars.barWidth;
          break;

        default:
          barLeft = -series.bars.barWidth / 2;
      }

      octx.lineWidth = series.bars.lineWidth;
      octx.strokeStyle = highlightColor;
      drawBar(point[0], point[1], point[2] || 0, barLeft, barLeft + series.bars.barWidth, function () {
        return fillStyle;
      }, series.xaxis, series.yaxis, octx, series.bars.horizontal, series.bars.lineWidth);
    }

    function getColorOrGradient(spec, bottom, top, defaultColor) {
      if (typeof spec == "string") return spec;else {
        // assume this is a gradient spec; IE currently only
        // supports a simple vertical gradient properly, so that's
        // what we support too
        var gradient = ctx.createLinearGradient(0, top, 0, bottom);

        for (var i = 0, l = spec.colors.length; i < l; ++i) {
          var c = spec.colors[i];

          if (typeof c != "string") {
            var co = $.color.parse(defaultColor);
            if (c.brightness != null) co = co.scale('rgb', c.brightness);
            if (c.opacity != null) co.a *= c.opacity;
            c = co.toString();
          }

          gradient.addColorStop(i / (l - 1), c);
        }

        return gradient;
      }
    }
  } // Add the plot function to the top level of the jQuery object


  $.plot = function (placeholder, data, options) {
    //var t0 = new Date();
    var plot = new Plot($(placeholder), data, options, $.plot.plugins); //(window.console ? console.log : alert)("time used (msecs): " + ((new Date()).getTime() - t0.getTime()));

    return plot;
  };

  $.plot.version = "0.8.3";
  $.plot.plugins = []; // Also add the plot function as a chainable property

  $.fn.plot = function (data, options) {
    return this.each(function () {
      $.plot(this, data, options);
    });
  }; // round to nearby lower multiple of base


  function floorInBase(n, base) {
    return base * Math.floor(n / base);
  }
})(jQuery);

/***/ }),

/***/ "./js/flot/jquery.flot.pie.js":
/*!************************************!*\
  !*** ./js/flot/jquery.flot.pie.js ***!
  \************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

/* Flot plugin for rendering pie charts.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

The plugin assumes that each series has a single data value, and that each
value is a positive integer or zero.  Negative numbers don't make sense for a
pie chart, and have unpredictable results.  The values do NOT need to be
passed in as percentages; the plugin will calculate the total and per-slice
percentages internally.

* Created by Brian Medendorp

* Updated with contributions from btburnett3, Anthony Aragues and Xavi Ivars

The plugin supports these options:

	series: {
		pie: {
			show: true/false
			radius: 0-1 for percentage of fullsize, or a specified pixel length, or 'auto'
			innerRadius: 0-1 for percentage of fullsize or a specified pixel length, for creating a donut effect
			startAngle: 0-2 factor of PI used for starting angle (in radians) i.e 3/2 starts at the top, 0 and 2 have the same result
			tilt: 0-1 for percentage to tilt the pie, where 1 is no tilt, and 0 is completely flat (nothing will show)
			offset: {
				top: integer value to move the pie up or down
				left: integer value to move the pie left or right, or 'auto'
			},
			stroke: {
				color: any hexidecimal color value (other formats may or may not work, so best to stick with something like '#FFF')
				width: integer pixel width of the stroke
			},
			label: {
				show: true/false, or 'auto'
				formatter:  a user-defined function that modifies the text/style of the label text
				radius: 0-1 for percentage of fullsize, or a specified pixel length
				background: {
					color: any hexidecimal color value (other formats may or may not work, so best to stick with something like '#000')
					opacity: 0-1
				},
				threshold: 0-1 for the percentage value at which to hide labels (if they're too small)
			},
			combine: {
				threshold: 0-1 for the percentage value at which to combine slices (if they're too small)
				color: any hexidecimal color value (other formats may or may not work, so best to stick with something like '#CCC'), if null, the plugin will automatically use the color of the first slice to be combined
				label: any text value of what the combined slice should be labeled
			}
			highlight: {
				opacity: 0-1
			}
		}
	}

More detail and specific examples can be found in the included HTML file.

*/
(function ($) {
  // Maximum redraw attempts when fitting labels within the plot
  var REDRAW_ATTEMPTS = 10; // Factor by which to shrink the pie when fitting labels within the plot

  var REDRAW_SHRINK = 0.95;

  function init(plot) {
    var canvas = null,
        target = null,
        options = null,
        maxRadius = null,
        centerLeft = null,
        centerTop = null,
        processed = false,
        ctx = null; // interactive variables

    var highlights = []; // add hook to determine if pie plugin in enabled, and then perform necessary operations

    plot.hooks.processOptions.push(function (plot, options) {
      if (options.series.pie.show) {
        options.grid.show = false; // set labels.show

        if (options.series.pie.label.show == "auto") {
          if (options.legend.show) {
            options.series.pie.label.show = false;
          } else {
            options.series.pie.label.show = true;
          }
        } // set radius


        if (options.series.pie.radius == "auto") {
          if (options.series.pie.label.show) {
            options.series.pie.radius = 3 / 4;
          } else {
            options.series.pie.radius = 1;
          }
        } // ensure sane tilt


        if (options.series.pie.tilt > 1) {
          options.series.pie.tilt = 1;
        } else if (options.series.pie.tilt < 0) {
          options.series.pie.tilt = 0;
        }
      }
    });
    plot.hooks.bindEvents.push(function (plot, eventHolder) {
      var options = plot.getOptions();

      if (options.series.pie.show) {
        if (options.grid.hoverable) {
          eventHolder.unbind("mousemove").mousemove(onMouseMove);
        }

        if (options.grid.clickable) {
          eventHolder.unbind("click").click(onClick);
        }
      }
    });
    plot.hooks.processDatapoints.push(function (plot, series, data, datapoints) {
      var options = plot.getOptions();

      if (options.series.pie.show) {
        processDatapoints(plot, series, data, datapoints);
      }
    });
    plot.hooks.drawOverlay.push(function (plot, octx) {
      var options = plot.getOptions();

      if (options.series.pie.show) {
        drawOverlay(plot, octx);
      }
    });
    plot.hooks.draw.push(function (plot, newCtx) {
      var options = plot.getOptions();

      if (options.series.pie.show) {
        draw(plot, newCtx);
      }
    });

    function processDatapoints(plot, series, datapoints) {
      if (!processed) {
        processed = true;
        canvas = plot.getCanvas();
        target = $(canvas).parent();
        options = plot.getOptions();
        plot.setData(combine(plot.getData()));
      }
    }

    function combine(data) {
      var total = 0,
          combined = 0,
          numCombined = 0,
          color = options.series.pie.combine.color,
          newdata = []; // Fix up the raw data from Flot, ensuring the data is numeric

      for (var i = 0; i < data.length; ++i) {
        var value = data[i].data; // If the data is an array, we'll assume that it's a standard
        // Flot x-y pair, and are concerned only with the second value.
        // Note how we use the original array, rather than creating a
        // new one; this is more efficient and preserves any extra data
        // that the user may have stored in higher indexes.

        if ($.isArray(value) && value.length == 1) {
          value = value[0];
        }

        if ($.isArray(value)) {
          // Equivalent to $.isNumeric() but compatible with jQuery < 1.7
          if (!isNaN(parseFloat(value[1])) && isFinite(value[1])) {
            value[1] = +value[1];
          } else {
            value[1] = 0;
          }
        } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
          value = [1, +value];
        } else {
          value = [1, 0];
        }

        data[i].data = [value];
      } // Sum up all the slices, so we can calculate percentages for each


      for (var i = 0; i < data.length; ++i) {
        total += data[i].data[0][1];
      } // Count the number of slices with percentages below the combine
      // threshold; if it turns out to be just one, we won't combine.


      for (var i = 0; i < data.length; ++i) {
        var value = data[i].data[0][1];

        if (value / total <= options.series.pie.combine.threshold) {
          combined += value;
          numCombined++;

          if (!color) {
            color = data[i].color;
          }
        }
      }

      for (var i = 0; i < data.length; ++i) {
        var value = data[i].data[0][1];

        if (numCombined < 2 || value / total > options.series.pie.combine.threshold) {
          newdata.push($.extend(data[i], {
            /* extend to allow keeping all other original data values
               and using them e.g. in labelFormatter. */
            data: [[1, value]],
            color: data[i].color,
            label: data[i].label,
            angle: value * Math.PI * 2 / total,
            percent: value / (total / 100)
          }));
        }
      }

      if (numCombined > 1) {
        newdata.push({
          data: [[1, combined]],
          color: color,
          label: options.series.pie.combine.label,
          angle: combined * Math.PI * 2 / total,
          percent: combined / (total / 100)
        });
      }

      return newdata;
    }

    function draw(plot, newCtx) {
      if (!target) {
        return; // if no series were passed
      }

      var canvasWidth = plot.getPlaceholder().width(),
          canvasHeight = plot.getPlaceholder().height(),
          legendWidth = target.children().filter(".legend").children().width() || 0;
      ctx = newCtx; // WARNING: HACK! REWRITE THIS CODE AS SOON AS POSSIBLE!
      // When combining smaller slices into an 'other' slice, we need to
      // add a new series.  Since Flot gives plugins no way to modify the
      // list of series, the pie plugin uses a hack where the first call
      // to processDatapoints results in a call to setData with the new
      // list of series, then subsequent processDatapoints do nothing.
      // The plugin-global 'processed' flag is used to control this hack;
      // it starts out false, and is set to true after the first call to
      // processDatapoints.
      // Unfortunately this turns future setData calls into no-ops; they
      // call processDatapoints, the flag is true, and nothing happens.
      // To fix this we'll set the flag back to false here in draw, when
      // all series have been processed, so the next sequence of calls to
      // processDatapoints once again starts out with a slice-combine.
      // This is really a hack; in 0.9 we need to give plugins a proper
      // way to modify series before any processing begins.

      processed = false; // calculate maximum radius and center point

      maxRadius = Math.min(canvasWidth, canvasHeight / options.series.pie.tilt) / 2;
      centerTop = canvasHeight / 2 + options.series.pie.offset.top;
      centerLeft = canvasWidth / 2;

      if (options.series.pie.offset.left == "auto") {
        if (options.legend.position.match("w")) {
          centerLeft += legendWidth / 2;
        } else {
          centerLeft -= legendWidth / 2;
        }

        if (centerLeft < maxRadius) {
          centerLeft = maxRadius;
        } else if (centerLeft > canvasWidth - maxRadius) {
          centerLeft = canvasWidth - maxRadius;
        }
      } else {
        centerLeft += options.series.pie.offset.left;
      }

      var slices = plot.getData(),
          attempts = 0; // Keep shrinking the pie's radius until drawPie returns true,
      // indicating that all the labels fit, or we try too many times.

      do {
        if (attempts > 0) {
          maxRadius *= REDRAW_SHRINK;
        }

        attempts += 1;
        clear();

        if (options.series.pie.tilt <= 0.8) {
          drawShadow();
        }
      } while (!drawPie() && attempts < REDRAW_ATTEMPTS);

      if (attempts >= REDRAW_ATTEMPTS) {
        clear();
        target.prepend("<div class='error'>Could not draw pie with labels contained inside canvas</div>");
      }

      if (plot.setSeries && plot.insertLegend) {
        plot.setSeries(slices);
        plot.insertLegend();
      } // we're actually done at this point, just defining internal functions at this point


      function clear() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        target.children().filter(".pieLabel, .pieLabelBackground").remove();
      }

      function drawShadow() {
        var shadowLeft = options.series.pie.shadow.left;
        var shadowTop = options.series.pie.shadow.top;
        var edge = 10;
        var alpha = options.series.pie.shadow.alpha;
        var radius = options.series.pie.radius > 1 ? options.series.pie.radius : maxRadius * options.series.pie.radius;

        if (radius >= canvasWidth / 2 - shadowLeft || radius * options.series.pie.tilt >= canvasHeight / 2 - shadowTop || radius <= edge) {
          return; // shadow would be outside canvas, so don't draw it
        }

        ctx.save();
        ctx.translate(shadowLeft, shadowTop);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#000"; // center and rotate to starting position

        ctx.translate(centerLeft, centerTop);
        ctx.scale(1, options.series.pie.tilt); //radius -= edge;

        for (var i = 1; i <= edge; i++) {
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
          ctx.fill();
          radius -= i;
        }

        ctx.restore();
      }

      function drawPie() {
        var startAngle = Math.PI * options.series.pie.startAngle;
        var radius = options.series.pie.radius > 1 ? options.series.pie.radius : maxRadius * options.series.pie.radius; // center and rotate to starting position

        ctx.save();
        ctx.translate(centerLeft, centerTop);
        ctx.scale(1, options.series.pie.tilt); //ctx.rotate(startAngle); // start at top; -- This doesn't work properly in Opera
        // draw slices

        ctx.save();
        var currentAngle = startAngle;

        for (var i = 0; i < slices.length; ++i) {
          slices[i].startAngle = currentAngle;
          drawSlice(slices[i].angle, slices[i].color, true);
        }

        ctx.restore(); // draw slice outlines

        if (options.series.pie.stroke.width > 0) {
          ctx.save();
          ctx.lineWidth = options.series.pie.stroke.width;
          currentAngle = startAngle;

          for (var i = 0; i < slices.length; ++i) {
            drawSlice(slices[i].angle, options.series.pie.stroke.color, false);
          }

          ctx.restore();
        } // draw donut hole


        drawDonutHole(ctx);
        ctx.restore(); // Draw the labels, returning true if they fit within the plot

        if (options.series.pie.label.show) {
          return drawLabels();
        } else return true;

        function drawSlice(angle, color, fill) {
          if (angle <= 0 || isNaN(angle)) {
            return;
          }

          if (fill) {
            ctx.fillStyle = color;
          } else {
            ctx.strokeStyle = color;
            ctx.lineJoin = "round";
          }

          ctx.beginPath();

          if (Math.abs(angle - Math.PI * 2) > 0.000000001) {
            ctx.moveTo(0, 0); // Center of the pie
          } //ctx.arc(0, 0, radius, 0, angle, false); // This doesn't work properly in Opera


          ctx.arc(0, 0, radius, currentAngle, currentAngle + angle / 2, false);
          ctx.arc(0, 0, radius, currentAngle + angle / 2, currentAngle + angle, false);
          ctx.closePath(); //ctx.rotate(angle); // This doesn't work properly in Opera

          currentAngle += angle;

          if (fill) {
            ctx.fill();
          } else {
            ctx.stroke();
          }
        }

        function drawLabels() {
          var currentAngle = startAngle;
          var radius = options.series.pie.label.radius > 1 ? options.series.pie.label.radius : maxRadius * options.series.pie.label.radius;

          for (var i = 0; i < slices.length; ++i) {
            if (slices[i].percent >= options.series.pie.label.threshold * 100) {
              if (!drawLabel(slices[i], currentAngle, i)) {
                return false;
              }
            }

            currentAngle += slices[i].angle;
          }

          return true;

          function drawLabel(slice, startAngle, index) {
            if (slice.data[0][1] == 0) {
              return true;
            } // format label text


            var lf = options.legend.labelFormatter,
                text,
                plf = options.series.pie.label.formatter;

            if (lf) {
              text = lf(slice.label, slice);
            } else {
              text = slice.label;
            }

            if (plf) {
              text = plf(text, slice);
            }

            var halfAngle = (startAngle + slice.angle + startAngle) / 2;
            var x = centerLeft + Math.round(Math.cos(halfAngle) * radius);
            var y = centerTop + Math.round(Math.sin(halfAngle) * radius) * options.series.pie.tilt;
            var html = "<span class='pieLabel' id='pieLabel" + index + "' style='position:absolute;top:" + y + "px;left:" + x + "px;'>" + text + "</span>";
            target.append(html);
            var label = target.children("#pieLabel" + index);
            var labelTop = y - label.height() / 2;
            var labelLeft = x - label.width() / 2;
            label.css("top", labelTop);
            label.css("left", labelLeft); // check to make sure that the label is not outside the canvas

            if (0 - labelTop > 0 || 0 - labelLeft > 0 || canvasHeight - (labelTop + label.height()) < 0 || canvasWidth - (labelLeft + label.width()) < 0) {
              return false;
            }

            if (options.series.pie.label.background.opacity != 0) {
              // put in the transparent background separately to avoid blended labels and label boxes
              var c = options.series.pie.label.background.color;

              if (c == null) {
                c = slice.color;
              }

              var pos = "top:" + labelTop + "px;left:" + labelLeft + "px;";
              $("<div class='pieLabelBackground' style='position:absolute;width:" + label.width() + "px;height:" + label.height() + "px;" + pos + "background-color:" + c + ";'></div>").css("opacity", options.series.pie.label.background.opacity).insertBefore(label);
            }

            return true;
          } // end individual label function

        } // end drawLabels function

      } // end drawPie function

    } // end draw function
    // Placed here because it needs to be accessed from multiple locations


    function drawDonutHole(layer) {
      if (options.series.pie.innerRadius > 0) {
        // subtract the center
        layer.save();
        var innerRadius = options.series.pie.innerRadius > 1 ? options.series.pie.innerRadius : maxRadius * options.series.pie.innerRadius;
        layer.globalCompositeOperation = "destination-out"; // this does not work with excanvas, but it will fall back to using the stroke color

        layer.beginPath();
        layer.fillStyle = options.series.pie.stroke.color;
        layer.arc(0, 0, innerRadius, 0, Math.PI * 2, false);
        layer.fill();
        layer.closePath();
        layer.restore(); // add inner stroke

        layer.save();
        layer.beginPath();
        layer.strokeStyle = options.series.pie.stroke.color;
        layer.arc(0, 0, innerRadius, 0, Math.PI * 2, false);
        layer.stroke();
        layer.closePath();
        layer.restore(); // TODO: add extra shadow inside hole (with a mask) if the pie is tilted.
      }
    } //-- Additional Interactive related functions --


    function isPointInPoly(poly, pt) {
      for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
        (poly[i][1] <= pt[1] && pt[1] < poly[j][1] || poly[j][1] <= pt[1] && pt[1] < poly[i][1]) && pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0] && (c = !c);
      }

      return c;
    }

    function findNearbySlice(mouseX, mouseY) {
      var slices = plot.getData(),
          options = plot.getOptions(),
          radius = options.series.pie.radius > 1 ? options.series.pie.radius : maxRadius * options.series.pie.radius,
          x,
          y;

      for (var i = 0; i < slices.length; ++i) {
        var s = slices[i];

        if (s.pie.show) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, 0); // Center of the pie
          //ctx.scale(1, options.series.pie.tilt);	// this actually seems to break everything when here.

          ctx.arc(0, 0, radius, s.startAngle, s.startAngle + s.angle / 2, false);
          ctx.arc(0, 0, radius, s.startAngle + s.angle / 2, s.startAngle + s.angle, false);
          ctx.closePath();
          x = mouseX - centerLeft;
          y = mouseY - centerTop;

          if (ctx.isPointInPath) {
            if (ctx.isPointInPath(mouseX - centerLeft, mouseY - centerTop)) {
              ctx.restore();
              return {
                datapoint: [s.percent, s.data],
                dataIndex: 0,
                series: s,
                seriesIndex: i
              };
            }
          } else {
            // excanvas for IE doesn;t support isPointInPath, this is a workaround.
            var p1X = radius * Math.cos(s.startAngle),
                p1Y = radius * Math.sin(s.startAngle),
                p2X = radius * Math.cos(s.startAngle + s.angle / 4),
                p2Y = radius * Math.sin(s.startAngle + s.angle / 4),
                p3X = radius * Math.cos(s.startAngle + s.angle / 2),
                p3Y = radius * Math.sin(s.startAngle + s.angle / 2),
                p4X = radius * Math.cos(s.startAngle + s.angle / 1.5),
                p4Y = radius * Math.sin(s.startAngle + s.angle / 1.5),
                p5X = radius * Math.cos(s.startAngle + s.angle),
                p5Y = radius * Math.sin(s.startAngle + s.angle),
                arrPoly = [[0, 0], [p1X, p1Y], [p2X, p2Y], [p3X, p3Y], [p4X, p4Y], [p5X, p5Y]],
                arrPoint = [x, y]; // TODO: perhaps do some mathmatical trickery here with the Y-coordinate to compensate for pie tilt?

            if (isPointInPoly(arrPoly, arrPoint)) {
              ctx.restore();
              return {
                datapoint: [s.percent, s.data],
                dataIndex: 0,
                series: s,
                seriesIndex: i
              };
            }
          }

          ctx.restore();
        }
      }

      return null;
    }

    function onMouseMove(e) {
      triggerClickHoverEvent("plothover", e);
    }

    function onClick(e) {
      triggerClickHoverEvent("plotclick", e);
    } // trigger click or hover event (they send the same parameters so we share their code)


    function triggerClickHoverEvent(eventname, e) {
      var offset = plot.offset();
      var canvasX = parseInt(e.pageX - offset.left);
      var canvasY = parseInt(e.pageY - offset.top);
      var item = findNearbySlice(canvasX, canvasY);

      if (options.grid.autoHighlight) {
        // clear auto-highlights
        for (var i = 0; i < highlights.length; ++i) {
          var h = highlights[i];

          if (h.auto == eventname && !(item && h.series == item.series)) {
            unhighlight(h.series);
          }
        }
      } // highlight the slice


      if (item) {
        highlight(item.series, eventname);
      } // trigger any hover bind events


      var pos = {
        pageX: e.pageX,
        pageY: e.pageY
      };
      target.trigger(eventname, [pos, item]);
    }

    function highlight(s, auto) {
      //if (typeof s == "number") {
      //	s = series[s];
      //}
      var i = indexOfHighlight(s);

      if (i == -1) {
        highlights.push({
          series: s,
          auto: auto
        });
        plot.triggerRedrawOverlay();
      } else if (!auto) {
        highlights[i].auto = false;
      }
    }

    function unhighlight(s) {
      if (s == null) {
        highlights = [];
        plot.triggerRedrawOverlay();
      } //if (typeof s == "number") {
      //	s = series[s];
      //}


      var i = indexOfHighlight(s);

      if (i != -1) {
        highlights.splice(i, 1);
        plot.triggerRedrawOverlay();
      }
    }

    function indexOfHighlight(s) {
      for (var i = 0; i < highlights.length; ++i) {
        var h = highlights[i];
        if (h.series == s) return i;
      }

      return -1;
    }

    function drawOverlay(plot, octx) {
      var options = plot.getOptions();
      var radius = options.series.pie.radius > 1 ? options.series.pie.radius : maxRadius * options.series.pie.radius;
      octx.save();
      octx.translate(centerLeft, centerTop);
      octx.scale(1, options.series.pie.tilt);

      for (var i = 0; i < highlights.length; ++i) {
        drawHighlight(highlights[i].series);
      }

      drawDonutHole(octx);
      octx.restore();

      function drawHighlight(series) {
        if (series.angle <= 0 || isNaN(series.angle)) {
          return;
        } //octx.fillStyle = parseColor(options.series.pie.highlight.color).scale(null, null, null, options.series.pie.highlight.opacity).toString();


        octx.fillStyle = "rgba(255, 255, 255, " + options.series.pie.highlight.opacity + ")"; // this is temporary until we have access to parseColor

        octx.beginPath();

        if (Math.abs(series.angle - Math.PI * 2) > 0.000000001) {
          octx.moveTo(0, 0); // Center of the pie
        }

        octx.arc(0, 0, radius, series.startAngle, series.startAngle + series.angle / 2, false);
        octx.arc(0, 0, radius, series.startAngle + series.angle / 2, series.startAngle + series.angle, false);
        octx.closePath();
        octx.fill();
      }
    }
  } // end init (plugin body)
  // define pie specific options and their default values


  var options = {
    series: {
      pie: {
        show: false,
        radius: "auto",
        // actual radius of the visible pie (based on full calculated radius if <=1, or hard pixel value)
        innerRadius: 0,

        /* for donut */
        startAngle: 3 / 2,
        tilt: 1,
        shadow: {
          left: 5,
          // shadow left offset
          top: 15,
          // shadow top offset
          alpha: 0.02 // shadow alpha

        },
        offset: {
          top: 0,
          left: "auto"
        },
        stroke: {
          color: "#fff",
          width: 1
        },
        label: {
          show: "auto",
          formatter: function formatter(label, slice) {
            return "<div style='font-size:x-small;text-align:center;padding:2px;color:" + slice.color + ";'>" + label + "<br/>" + Math.round(slice.percent) + "%</div>";
          },
          // formatter function
          radius: 1,
          // radius at which to place the labels (based on full calculated radius if <=1, or hard pixel value)
          background: {
            color: null,
            opacity: 0
          },
          threshold: 0 // percentage at which to hide the label (i.e. the slice is too narrow)

        },
        combine: {
          threshold: -1,
          // percentage at which to combine little slices into one larger slice
          color: null,
          // color to give the new slice (auto-generated if null)
          label: "Other" // label to give the new slice

        },
        highlight: {
          //color: "#fff",		// will add this functionality once parseColor is available
          opacity: 0.5
        }
      }
    }
  };
  $.plot.plugins.push({
    init: init,
    options: options,
    name: "pie",
    version: "1.1"
  });
})(jQuery);

/***/ }),

/***/ "./js/json-view/jquery.jsonview.js":
/*!*****************************************!*\
  !*** ./js/json-view/jquery.jsonview.js ***!
  \*****************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module.loaded, module.id, module, __webpack_require__.nmd, __webpack_require__.* */
/*! CommonJS bailout: module.exports is used directly at 155:55-69 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);
/*!
jQuery JSONView.
Licensed under the MIT License.
 */
(function (jQuery) {
  var $, Collapser, JSONFormatter, JSONView;

  JSONFormatter = function () {
    function JSONFormatter(options) {
      if (options == null) {
        options = {};
      }

      this.options = options;
    }

    JSONFormatter.prototype.htmlEncode = function (html) {
      if (html !== null) {
        return html.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      } else {
        return '';
      }
    };

    JSONFormatter.prototype.jsString = function (s) {
      s = JSON.stringify(s).slice(1, -1);
      return this.htmlEncode(s);
    };

    JSONFormatter.prototype.decorateWithSpan = function (value, className) {
      return "<span class=\"" + className + "\">" + this.htmlEncode(value) + "</span>";
    };

    JSONFormatter.prototype.valueToHTML = function (value, level) {
      var valueType;

      if (level == null) {
        level = 0;
      }

      valueType = Object.prototype.toString.call(value).match(/\s(.+)]/)[1].toLowerCase();
      return this["" + valueType + "ToHTML"].call(this, value, level);
    };

    JSONFormatter.prototype.nullToHTML = function (value) {
      return this.decorateWithSpan('null', 'null');
    };

    JSONFormatter.prototype.numberToHTML = function (value) {
      return this.decorateWithSpan(value, 'num');
    };

    JSONFormatter.prototype.stringToHTML = function (value) {
      var multilineClass, newLinePattern;

      if (/^(http|https|file):\/\/[^\s]+$/i.test(value)) {
        return "<a href=\"" + this.htmlEncode(value) + "\"><span class=\"q\">\"</span>" + this.jsString(value) + "<span class=\"q\">\"</span></a>";
      } else {
        multilineClass = '';
        value = this.jsString(value);

        if (this.options.nl2br) {
          newLinePattern = /([^>\\r\\n]?)(\\r\\n|\\n\\r|\\r|\\n)/g;

          if (newLinePattern.test(value)) {
            multilineClass = ' multiline';
            value = (value + '').replace(newLinePattern, '$1' + '<br />');
          }
        }

        return "<span class=\"string" + multilineClass + "\">\"" + value + "\"</span>";
      }
    };

    JSONFormatter.prototype.booleanToHTML = function (value) {
      return this.decorateWithSpan(value, 'bool');
    };

    JSONFormatter.prototype.arrayToHTML = function (array, level) {
      var collapsible, hasContents, index, numProps, output, value, _i, _len;

      if (level == null) {
        level = 0;
      }

      hasContents = false;
      output = '';
      numProps = array.length;

      for (index = _i = 0, _len = array.length; _i < _len; index = ++_i) {
        value = array[index];
        hasContents = true;
        output += '<li>' + this.valueToHTML(value, level + 1);

        if (numProps > 1) {
          output += ',';
        }

        output += '</li>';
        numProps--;
      }

      if (hasContents) {
        collapsible = level === 0 ? '' : ' collapsible';
        return "[<ul class=\"array level" + level + collapsible + "\">" + output + "</ul>]";
      } else {
        return '[ ]';
      }
    };

    JSONFormatter.prototype.objectToHTML = function (object, level) {
      var collapsible, hasContents, key, numProps, output, prop, value;

      if (level == null) {
        level = 0;
      }

      hasContents = false;
      output = '';
      numProps = 0;

      for (prop in object) {
        numProps++;
      }

      for (prop in object) {
        value = object[prop];
        hasContents = true;
        key = this.options.escape ? this.jsString(prop) : prop;
        output += "<li><span class=\"prop\"><span class=\"q\">\"</span>" + key + "<span class=\"q\">\"</span></span>: " + this.valueToHTML(value, level + 1);

        if (numProps > 1) {
          output += ',';
        }

        output += '</li>';
        numProps--;
      }

      if (hasContents) {
        collapsible = level === 0 ? '' : ' collapsible';
        return "{<ul class=\"obj level" + level + collapsible + "\">" + output + "</ul>}";
      } else {
        return '{ }';
      }
    };

    JSONFormatter.prototype.jsonToHTML = function (json) {
      return "<div class=\"jsonview\">" + this.valueToHTML(json) + "</div>";
    };

    return JSONFormatter;
  }();

   true && module !== null && (module.exports = JSONFormatter);

  Collapser = function () {
    function Collapser() {}

    Collapser.bindEvent = function (item, options) {
      var collapser;
      collapser = document.createElement('div');
      collapser.className = 'collapser';
      collapser.innerHTML = options.collapsed ? '+' : '-';
      collapser.addEventListener('click', function (_this) {
        return function (event) {
          return _this.toggle(event.target, options);
        };
      }(this));
      item.insertBefore(collapser, item.firstChild);

      if (options.collapsed) {
        return this.collapse(collapser);
      }
    };

    Collapser.expand = function (collapser) {
      var ellipsis, target;
      target = this.collapseTarget(collapser);

      if (target.style.display === '') {
        return;
      }

      ellipsis = target.parentNode.getElementsByClassName('ellipsis')[0];
      target.parentNode.removeChild(ellipsis);
      target.style.display = '';
      return collapser.innerHTML = '-';
    };

    Collapser.collapse = function (collapser) {
      var ellipsis, target;
      target = this.collapseTarget(collapser);

      if (target.style.display === 'none') {
        return;
      }

      target.style.display = 'none';
      ellipsis = document.createElement('span');
      ellipsis.className = 'ellipsis';
      ellipsis.innerHTML = ' &hellip; ';
      target.parentNode.insertBefore(ellipsis, target);
      return collapser.innerHTML = '+';
    };

    Collapser.toggle = function (collapser, options) {
      var action, collapsers, target, _i, _len, _results;

      if (options == null) {
        options = {};
      }

      target = this.collapseTarget(collapser);
      action = target.style.display === 'none' ? 'expand' : 'collapse';

      if (options.recursive_collapser) {
        collapsers = collapser.parentNode.getElementsByClassName('collapser');
        _results = [];

        for (_i = 0, _len = collapsers.length; _i < _len; _i++) {
          collapser = collapsers[_i];

          _results.push(this[action](collapser));
        }

        return _results;
      } else {
        return this[action](collapser);
      }
    };

    Collapser.collapseTarget = function (collapser) {
      var target, targets;
      targets = collapser.parentNode.getElementsByClassName('collapsible');

      if (!targets.length) {
        return;
      }

      return target = targets[0];
    };

    return Collapser;
  }();

  $ = jQuery;
  JSONView = {
    collapse: function collapse(el) {
      if (el.innerHTML === '-') {
        return Collapser.collapse(el);
      }
    },
    expand: function expand(el) {
      if (el.innerHTML === '+') {
        return Collapser.expand(el);
      }
    },
    toggle: function toggle(el) {
      return Collapser.toggle(el);
    }
  };
  return $.fn.JSONView = function () {
    var args, defaultOptions, formatter, json, method, options, outputDoc;
    args = arguments;

    if (JSONView[args[0]] != null) {
      method = args[0];
      return this.each(function () {
        var $this, level;
        $this = $(this);

        if (args[1] != null) {
          level = args[1];
          return $this.find(".jsonview .collapsible.level" + level).siblings('.collapser').each(function () {
            return JSONView[method](this);
          });
        } else {
          return $this.find('.jsonview > ul > li .collapsible').siblings('.collapser').each(function () {
            return JSONView[method](this);
          });
        }
      });
    } else {
      json = args[0];
      options = args[1] || {};
      defaultOptions = {
        collapsed: false,
        nl2br: false,
        recursive_collapser: false,
        escape: true
      };
      options = $.extend(defaultOptions, options);
      formatter = new JSONFormatter({
        nl2br: options.nl2br,
        escape: options.escape
      });

      if (Object.prototype.toString.call(json) === '[object String]') {
        json = JSON.parse(json);
      }

      outputDoc = formatter.jsonToHTML(json);
      return this.each(function () {
        var $this, item, items, _i, _len, _results;

        $this = $(this);
        $this.html(outputDoc);
        items = $this[0].getElementsByClassName('collapsible');
        _results = [];

        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];

          if (item.parentNode.nodeName === 'LI') {
            _results.push(Collapser.bindEvent(item.parentNode, options));
          } else {
            _results.push(void 0);
          }
        }

        return _results;
      });
    }
  };
})(jQuery);

/***/ }),

/***/ "./js/monitoring.js":
/*!**************************!*\
  !*** ./js/monitoring.js ***!
  \**************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 31:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 *
 *	ENTRY POINT WEBPACK APP
 *
 */
var stage = __webpack_require__(/*! @nodefony/stage */ "../../node_modules/@nodefony/stage/dist/stage.min.js");

__webpack_require__(/*! bootstrap */ "../../node_modules/bootstrap/dist/js/npm.js");

__webpack_require__(/*! ../less/style.less */ "./less/style.less");

__webpack_require__(/*! font-awesome/css/font-awesome.css */ "../../node_modules/font-awesome/css/font-awesome.css"); //require("../vendors/jquery.timeago/jquery.timeago.js");


__webpack_require__(/*! ./json-view/jquery.jsonview.js */ "./js/json-view/jquery.jsonview.js");

__webpack_require__(/*! ./flot/jquery.flot.js */ "./js/flot/jquery.flot.js");

__webpack_require__(/*! ./flot/jquery.flot.categories.js */ "./js/flot/jquery.flot.categories.js");

__webpack_require__(/*! ./flot/jquery.flot.pie.js */ "./js/flot/jquery.flot.pie.js");

__webpack_require__(/*! ./flot/jquery.flot.crosshair.js */ "./js/flot/jquery.flot.crosshair.js");

var smoothie = __webpack_require__(/*! ./smoothie/smoothie.js */ "./js/smoothie/smoothie.js");

__webpack_require__(/*! ../css/json-view/jquery.jsonview.css */ "./css/json-view/jquery.jsonview.css");

module.exports = function () {
  // expose  in gobal window object
  window["stage"] = stage;
  window["SmoothieChart"] = smoothie.SmoothieChart;
  window["TimeSeries"] = smoothie.TimeSeries;
  /*
   *
   *	Class Bundle App client side
   *
   *
   */

  var monitoring = function monitoring() {
    _classCallCheck(this, monitoring);

    /**
     * * * * *
     * KERNEL *
     * * * * *
     */
    //== Kernel
    var environment = $(".environment").attr("value");
    var debug = $(".debug").attr("value");
    this.kernel = new stage.appKernel("/nodefony/app", environment, {
      debug: debug,
      location: {
        html5Mode: false
      },
      onBoot: function onBoot() {},
      onDomReady: function onDomReady() {
        this.uiContainer = $(".debugContent").get(0) || $("body").get(0);
      },
      onReady: function onReady() {
        this.router.redirect(this.router.generateUrl("index"));
      },
      onGetConfigError: function onGetConfigError(module) {}
    });
  };

  return new monitoring();
}();

/***/ }),

/***/ "./js/smoothie/smoothie.js":
/*!*********************************!*\
  !*** ./js/smoothie/smoothie.js ***!
  \*********************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_exports__ */
/*! CommonJS bailout: exports is used directly at 829:43-50 */
/***/ ((__unused_webpack_module, exports) => {

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// MIT License:
//
// Copyright (c) 2010-2013, Joe Walnes
//               2013-2014, Drew Noakes
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/**
 * Smoothie Charts - http://smoothiecharts.org/
 * (c) 2010-2013, Joe Walnes
 *     2013-2014, Drew Noakes
 *
 * v1.0: Main charting library, by Joe Walnes
 * v1.1: Auto scaling of axis, by Neil Dunn
 * v1.2: fps (frames per second) option, by Mathias Petterson
 * v1.3: Fix for divide by zero, by Paul Nikitochkin
 * v1.4: Set minimum, top-scale padding, remove timeseries, add optional timer to reset bounds, by Kelley Reynolds
 * v1.5: Set default frames per second to 50... smoother.
 *       .start(), .stop() methods for conserving CPU, by Dmitry Vyal
 *       options.interpolation = 'bezier' or 'line', by Dmitry Vyal
 *       options.maxValue to fix scale, by Dmitry Vyal
 * v1.6: minValue/maxValue will always get converted to floats, by Przemek Matylla
 * v1.7: options.grid.fillStyle may be a transparent color, by Dmitry A. Shashkin
 *       Smooth rescaling, by Kostas Michalopoulos
 * v1.8: Set max length to customize number of live points in the dataset with options.maxDataSetLength, by Krishna Narni
 * v1.9: Display timestamps along the bottom, by Nick and Stev-io
 *       (https://groups.google.com/forum/?fromgroups#!topic/smoothie-charts/-Ywse8FCpKI%5B1-25%5D)
 *       Refactored by Krishna Narni, to support timestamp formatting function
 * v1.10: Switch to requestAnimationFrame, removed the now obsoleted options.fps, by Gergely Imreh
 * v1.11: options.grid.sharpLines option added, by @drewnoakes
 *        Addressed warning seen in Firefox when seriesOption.fillStyle undefined, by @drewnoakes
 * v1.12: Support for horizontalLines added, by @drewnoakes
 *        Support for yRangeFunction callback added, by @drewnoakes
 * v1.13: Fixed typo (#32), by @alnikitich
 * v1.14: Timer cleared when last TimeSeries removed (#23), by @davidgaleano
 *        Fixed diagonal line on chart at start/end of data stream, by @drewnoakes
 * v1.15: Support for npm package (#18), by @dominictarr
 *        Fixed broken removeTimeSeries function (#24) by @davidgaleano
 *        Minor performance and tidying, by @drewnoakes
 * v1.16: Bug fix introduced in v1.14 relating to timer creation/clearance (#23), by @drewnoakes
 *        TimeSeries.append now deals with out-of-order timestamps, and can merge duplicates, by @zacwitte (#12)
 *        Documentation and some local variable renaming for clarity, by @drewnoakes
 * v1.17: Allow control over font size (#10), by @drewnoakes
 *        Timestamp text won't overlap, by @drewnoakes
 * v1.18: Allow control of max/min label precision, by @drewnoakes
 *        Added 'borderVisible' chart option, by @drewnoakes
 *        Allow drawing series with fill but no stroke (line), by @drewnoakes
 * v1.19: Avoid unnecessary repaints, and fixed flicker in old browsers having multiple charts in document (#40), by @asbai
 * v1.20: Add SmoothieChart.getTimeSeriesOptions and SmoothieChart.bringToFront functions, by @drewnoakes
 * v1.21: Add 'step' interpolation mode, by @drewnoakes
 * v1.22: Add support for different pixel ratios. Also add optional y limit formatters, by @copacetic
 * v1.23: Fix bug introduced in v1.22 (#44), by @drewnoakes
 * v1.24: Fix bug introduced in v1.23, re-adding parseFloat to y-axis formatter defaults, by @siggy_sf
 * v1.25: Fix bug seen when adding a data point to TimeSeries which is older than the current data, by @Nking92
 *        Draw time labels on top of series, by @comolosabia
 *        Add TimeSeries.clear function, by @drewnoakes
 * v1.26: Add support for resizing on high device pixel ratio screens, by @copacetic
 * v1.27: Fix bug introduced in v1.26 for non whole number devicePixelRatio values, by @zmbush
 * v1.28: Add 'minValueScale' option, by @megawac
 */
;

(function (exports) {
  var Util = {
    extend: function extend() {
      arguments[0] = arguments[0] || {};

      for (var i = 1; i < arguments.length; i++) {
        for (var key in arguments[i]) {
          if (arguments[i].hasOwnProperty(key)) {
            if (_typeof(arguments[i][key]) === 'object') {
              if (arguments[i][key] instanceof Array) {
                arguments[0][key] = arguments[i][key];
              } else {
                arguments[0][key] = Util.extend(arguments[0][key], arguments[i][key]);
              }
            } else {
              arguments[0][key] = arguments[i][key];
            }
          }
        }
      }

      return arguments[0];
    }
  };
  /**
   * Initialises a new <code>TimeSeries</code> with optional data options.
   *
   * Options are of the form (defaults shown):
   *
   * <pre>
   * {
   *   resetBounds: true,        // enables/disables automatic scaling of the y-axis
   *   resetBoundsInterval: 3000 // the period between scaling calculations, in millis
   * }
   * </pre>
   *
   * Presentation options for TimeSeries are specified as an argument to <code>SmoothieChart.addTimeSeries</code>.
   *
   * @constructor
   */

  function TimeSeries(options) {
    this.options = Util.extend({}, TimeSeries.defaultOptions, options);
    this.clear();
  }

  TimeSeries.defaultOptions = {
    resetBoundsInterval: 3000,
    resetBounds: true
  };
  /**
   * Clears all data and state from this TimeSeries object.
   */

  TimeSeries.prototype.clear = function () {
    this.data = [];
    this.maxValue = Number.NaN; // The maximum value ever seen in this TimeSeries.

    this.minValue = Number.NaN; // The minimum value ever seen in this TimeSeries.
  };
  /**
   * Recalculate the min/max values for this <code>TimeSeries</code> object.
   *
   * This causes the graph to scale itself in the y-axis.
   */


  TimeSeries.prototype.resetBounds = function () {
    if (this.data.length) {
      // Walk through all data points, finding the min/max value
      this.maxValue = this.data[0][1];
      this.minValue = this.data[0][1];

      for (var i = 1; i < this.data.length; i++) {
        var value = this.data[i][1];

        if (value > this.maxValue) {
          this.maxValue = value;
        }

        if (value < this.minValue) {
          this.minValue = value;
        }
      }
    } else {
      // No data exists, so set min/max to NaN
      this.maxValue = Number.NaN;
      this.minValue = Number.NaN;
    }
  };
  /**
   * Adds a new data point to the <code>TimeSeries</code>, preserving chronological order.
   *
   * @param timestamp the position, in time, of this data point
   * @param value the value of this data point
   * @param sumRepeatedTimeStampValues if <code>timestamp</code> has an exact match in the series, this flag controls
   * whether it is replaced, or the values summed (defaults to false.)
   */


  TimeSeries.prototype.append = function (timestamp, value, sumRepeatedTimeStampValues) {
    // Rewind until we hit an older timestamp
    var i = this.data.length - 1;

    while (i >= 0 && this.data[i][0] > timestamp) {
      i--;
    }

    if (i === -1) {
      // This new item is the oldest data
      this.data.splice(0, 0, [timestamp, value]);
    } else if (this.data.length > 0 && this.data[i][0] === timestamp) {
      // Update existing values in the array
      if (sumRepeatedTimeStampValues) {
        // Sum this value into the existing 'bucket'
        this.data[i][1] += value;
        value = this.data[i][1];
      } else {
        // Replace the previous value
        this.data[i][1] = value;
      }
    } else if (i < this.data.length - 1) {
      // Splice into the correct position to keep timestamps in order
      this.data.splice(i + 1, 0, [timestamp, value]);
    } else {
      // Add to the end of the array
      this.data.push([timestamp, value]);
    }

    this.maxValue = isNaN(this.maxValue) ? value : Math.max(this.maxValue, value);
    this.minValue = isNaN(this.minValue) ? value : Math.min(this.minValue, value);
  };

  TimeSeries.prototype.dropOldData = function (oldestValidTime, maxDataSetLength) {
    // We must always keep one expired data point as we need this to draw the
    // line that comes into the chart from the left, but any points prior to that can be removed.
    var removeCount = 0;

    while (this.data.length - removeCount >= maxDataSetLength && this.data[removeCount + 1][0] < oldestValidTime) {
      removeCount++;
    }

    if (removeCount !== 0) {
      this.data.splice(0, removeCount);
    }
  };
  /**
   * Initialises a new <code>SmoothieChart</code>.
   *
   * Options are optional, and should be of the form below. Just specify the values you
   * need and the rest will be given sensible defaults as shown:
   *
   * <pre>
   * {
   *   minValue: undefined,                      // specify to clamp the lower y-axis to a given value
   *   maxValue: undefined,                      // specify to clamp the upper y-axis to a given value
   *   maxValueScale: 1,                         // allows proportional padding to be added above the chart. for 10% padding, specify 1.1.
   *   minValueScale: 1,                         // allows proportional padding to be added below the chart. for 10% padding, specify 1.1.
   *   yRangeFunction: undefined,                // function({min: , max: }) { return {min: , max: }; }
   *   scaleSmoothing: 0.125,                    // controls the rate at which y-value zoom animation occurs
   *   millisPerPixel: 20,                       // sets the speed at which the chart pans by
   *   enableDpiScaling: true,                   // support rendering at different DPI depending on the device
   *   yMinFormatter: function(min, precision) { // callback function that formats the min y value label
   *     return parseFloat(min).toFixed(precision);
   *   },
   *   yMaxFormatter: function(max, precision) { // callback function that formats the max y value label
   *     return parseFloat(max).toFixed(precision);
   *   },
   *   maxDataSetLength: 2,
   *   interpolation: 'bezier'                   // one of 'bezier', 'linear', or 'step'
   *   timestampFormatter: null,                 // optional function to format time stamps for bottom of chart
   *                                             // you may use SmoothieChart.timeFormatter, or your own: function(date) { return ''; }
   *   scrollBackwards: false,                   // reverse the scroll direction of the chart
   *   horizontalLines: [],                      // [ { value: 0, color: '#ffffff', lineWidth: 1 } ]
   *   grid:
   *   {
   *     fillStyle: '#000000',                   // the background colour of the chart
   *     lineWidth: 1,                           // the pixel width of grid lines
   *     strokeStyle: '#777777',                 // colour of grid lines
   *     millisPerLine: 1000,                    // distance between vertical grid lines
   *     sharpLines: false,                      // controls whether grid lines are 1px sharp, or softened
   *     verticalSections: 2,                    // number of vertical sections marked out by horizontal grid lines
   *     borderVisible: true                     // whether the grid lines trace the border of the chart or not
   *   },
   *   labels
   *   {
   *     disabled: false,                        // enables/disables labels showing the min/max values
   *     fillStyle: '#ffffff',                   // colour for text of labels,
   *     fontSize: 15,
   *     fontFamily: 'sans-serif',
   *     precision: 2
   *   }
   * }
   * </pre>
   *
   * @constructor
   */


  function SmoothieChart(options) {
    this.options = Util.extend({}, SmoothieChart.defaultChartOptions, options);
    this.seriesSet = [];
    this.currentValueRange = 1;
    this.currentVisMinValue = 0;
    this.lastRenderTimeMillis = 0;
  }

  SmoothieChart.defaultChartOptions = {
    millisPerPixel: 20,
    enableDpiScaling: true,
    yMinFormatter: function yMinFormatter(min, precision) {
      return parseFloat(min).toFixed(precision);
    },
    yMaxFormatter: function yMaxFormatter(max, precision) {
      return parseFloat(max).toFixed(precision);
    },
    maxValueScale: 1,
    minValueScale: 1,
    interpolation: 'bezier',
    scaleSmoothing: 0.125,
    maxDataSetLength: 2,
    scrollBackwards: false,
    grid: {
      fillStyle: '#000000',
      strokeStyle: '#777777',
      lineWidth: 1,
      sharpLines: false,
      millisPerLine: 1000,
      verticalSections: 2,
      borderVisible: true
    },
    labels: {
      fillStyle: '#ffffff',
      disabled: false,
      fontSize: 10,
      fontFamily: 'monospace',
      precision: 2
    },
    horizontalLines: []
  }; // Based on http://inspirit.github.com/jsfeat/js/compatibility.js

  SmoothieChart.AnimateCompatibility = function () {
    var requestAnimationFrame = function requestAnimationFrame(callback, element) {
      var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        return window.setTimeout(function () {
          callback(new Date().getTime());
        }, 16);
      };

      return requestAnimationFrame.call(window, callback, element);
    },
        cancelAnimationFrame = function cancelAnimationFrame(id) {
      var cancelAnimationFrame = window.cancelAnimationFrame || function (id) {
        clearTimeout(id);
      };

      return cancelAnimationFrame.call(window, id);
    };

    return {
      requestAnimationFrame: requestAnimationFrame,
      cancelAnimationFrame: cancelAnimationFrame
    };
  }();

  SmoothieChart.defaultSeriesPresentationOptions = {
    lineWidth: 1,
    strokeStyle: '#ffffff'
  };
  /**
   * Adds a <code>TimeSeries</code> to this chart, with optional presentation options.
   *
   * Presentation options should be of the form (defaults shown):
   *
   * <pre>
   * {
   *   lineWidth: 1,
   *   strokeStyle: '#ffffff',
   *   fillStyle: undefined
   * }
   * </pre>
   */

  SmoothieChart.prototype.addTimeSeries = function (timeSeries, options) {
    this.seriesSet.push({
      timeSeries: timeSeries,
      options: Util.extend({}, SmoothieChart.defaultSeriesPresentationOptions, options)
    });

    if (timeSeries.options.resetBounds && timeSeries.options.resetBoundsInterval > 0) {
      timeSeries.resetBoundsTimerId = setInterval(function () {
        timeSeries.resetBounds();
      }, timeSeries.options.resetBoundsInterval);
    }
  };
  /**
   * Removes the specified <code>TimeSeries</code> from the chart.
   */


  SmoothieChart.prototype.removeTimeSeries = function (timeSeries) {
    // Find the correct timeseries to remove, and remove it
    var numSeries = this.seriesSet.length;

    for (var i = 0; i < numSeries; i++) {
      if (this.seriesSet[i].timeSeries === timeSeries) {
        this.seriesSet.splice(i, 1);
        break;
      }
    } // If a timer was operating for that timeseries, remove it


    if (timeSeries.resetBoundsTimerId) {
      // Stop resetting the bounds, if we were
      clearInterval(timeSeries.resetBoundsTimerId);
    }
  };
  /**
   * Gets render options for the specified <code>TimeSeries</code>.
   *
   * As you may use a single <code>TimeSeries</code> in multiple charts with different formatting in each usage,
   * these settings are stored in the chart.
   */


  SmoothieChart.prototype.getTimeSeriesOptions = function (timeSeries) {
    // Find the correct timeseries to remove, and remove it
    var numSeries = this.seriesSet.length;

    for (var i = 0; i < numSeries; i++) {
      if (this.seriesSet[i].timeSeries === timeSeries) {
        return this.seriesSet[i].options;
      }
    }
  };
  /**
   * Brings the specified <code>TimeSeries</code> to the top of the chart. It will be rendered last.
   */


  SmoothieChart.prototype.bringToFront = function (timeSeries) {
    // Find the correct timeseries to remove, and remove it
    var numSeries = this.seriesSet.length;

    for (var i = 0; i < numSeries; i++) {
      if (this.seriesSet[i].timeSeries === timeSeries) {
        var set = this.seriesSet.splice(i, 1);
        this.seriesSet.push(set[0]);
        break;
      }
    }
  };
  /**
   * Instructs the <code>SmoothieChart</code> to start rendering to the provided canvas, with specified delay.
   *
   * @param canvas the target canvas element
   * @param delayMillis an amount of time to wait before a data point is shown. This can prevent the end of the series
   * from appearing on screen, with new values flashing into view, at the expense of some latency.
   */


  SmoothieChart.prototype.streamTo = function (canvas, delayMillis) {
    this.canvas = canvas;
    this.delay = delayMillis;
    this.start();
  };
  /**
   * Make sure the canvas has the optimal resolution for the device's pixel ratio.
   */


  SmoothieChart.prototype.resize = function () {
    // TODO this function doesn't handle the value of enableDpiScaling changing during execution
    if (!this.options.enableDpiScaling || !window || window.devicePixelRatio === 1) return;
    var dpr = window.devicePixelRatio;
    var width = parseInt(this.canvas.getAttribute('width'));
    var height = parseInt(this.canvas.getAttribute('height'));

    if (!this.originalWidth || Math.floor(this.originalWidth * dpr) !== width) {
      this.originalWidth = width;
      this.canvas.setAttribute('width', Math.floor(width * dpr).toString());
      this.canvas.style.width = width + 'px';
      this.canvas.getContext('2d').scale(dpr, dpr);
    }

    if (!this.originalHeight || Math.floor(this.originalHeight * dpr) !== height) {
      this.originalHeight = height;
      this.canvas.setAttribute('height', Math.floor(height * dpr).toString());
      this.canvas.style.height = height + 'px';
      this.canvas.getContext('2d').scale(dpr, dpr);
    }
  };
  /**
   * Starts the animation of this chart.
   */


  SmoothieChart.prototype.start = function () {
    if (this.frame) {
      // We're already running, so just return
      return;
    } // Renders a frame, and queues the next frame for later rendering


    var animate = function () {
      this.frame = SmoothieChart.AnimateCompatibility.requestAnimationFrame(function () {
        this.render();
        animate();
      }.bind(this));
    }.bind(this);

    animate();
  };
  /**
   * Stops the animation of this chart.
   */


  SmoothieChart.prototype.stop = function () {
    if (this.frame) {
      SmoothieChart.AnimateCompatibility.cancelAnimationFrame(this.frame);
      delete this.frame;
    }
  };

  SmoothieChart.prototype.updateValueRange = function () {
    // Calculate the current scale of the chart, from all time series.
    var chartOptions = this.options,
        chartMaxValue = Number.NaN,
        chartMinValue = Number.NaN;

    for (var d = 0; d < this.seriesSet.length; d++) {
      // TODO(ndunn): We could calculate / track these values as they stream in.
      var timeSeries = this.seriesSet[d].timeSeries;

      if (!isNaN(timeSeries.maxValue)) {
        chartMaxValue = !isNaN(chartMaxValue) ? Math.max(chartMaxValue, timeSeries.maxValue) : timeSeries.maxValue;
      }

      if (!isNaN(timeSeries.minValue)) {
        chartMinValue = !isNaN(chartMinValue) ? Math.min(chartMinValue, timeSeries.minValue) : timeSeries.minValue;
      }
    } // Scale the chartMaxValue to add padding at the top if required


    if (chartOptions.maxValue != null) {
      chartMaxValue = chartOptions.maxValue;
    } else {
      chartMaxValue *= chartOptions.maxValueScale;
    } // Set the minimum if we've specified one


    if (chartOptions.minValue != null) {
      chartMinValue = chartOptions.minValue;
    } else {
      chartMinValue -= Math.abs(chartMinValue * chartOptions.minValueScale - chartMinValue);
    } // If a custom range function is set, call it


    if (this.options.yRangeFunction) {
      var range = this.options.yRangeFunction({
        min: chartMinValue,
        max: chartMaxValue
      });
      chartMinValue = range.min;
      chartMaxValue = range.max;
    }

    if (!isNaN(chartMaxValue) && !isNaN(chartMinValue)) {
      var targetValueRange = chartMaxValue - chartMinValue;
      var valueRangeDiff = targetValueRange - this.currentValueRange;
      var minValueDiff = chartMinValue - this.currentVisMinValue;
      this.isAnimatingScale = Math.abs(valueRangeDiff) > 0.1 || Math.abs(minValueDiff) > 0.1;
      this.currentValueRange += chartOptions.scaleSmoothing * valueRangeDiff;
      this.currentVisMinValue += chartOptions.scaleSmoothing * minValueDiff;
    }

    this.valueRange = {
      min: chartMinValue,
      max: chartMaxValue
    };
  };

  SmoothieChart.prototype.render = function (canvas, time) {
    var nowMillis = new Date().getTime();

    if (!this.isAnimatingScale) {
      // We're not animating. We can use the last render time and the scroll speed to work out whether
      // we actually need to paint anything yet. If not, we can return immediately.
      // Render at least every 1/6th of a second. The canvas may be resized, which there is
      // no reliable way to detect.
      var maxIdleMillis = Math.min(1000 / 6, this.options.millisPerPixel);

      if (nowMillis - this.lastRenderTimeMillis < maxIdleMillis) {
        return;
      }
    }

    this.resize();
    this.lastRenderTimeMillis = nowMillis;
    canvas = canvas || this.canvas;
    time = time || nowMillis - (this.delay || 0); // Round time down to pixel granularity, so motion appears smoother.

    time -= time % this.options.millisPerPixel;

    var context = canvas.getContext('2d'),
        chartOptions = this.options,
        dimensions = {
      top: 0,
      left: 0,
      width: canvas.clientWidth,
      height: canvas.clientHeight
    },
        // Calculate the threshold time for the oldest data points.
    oldestValidTime = time - dimensions.width * chartOptions.millisPerPixel,
        valueToYPixel = function (value) {
      var offset = value - this.currentVisMinValue;
      return this.currentValueRange === 0 ? dimensions.height : dimensions.height - Math.round(offset / this.currentValueRange * dimensions.height);
    }.bind(this),
        timeToXPixel = function timeToXPixel(t) {
      if (chartOptions.scrollBackwards) {
        return Math.round((time - t) / chartOptions.millisPerPixel);
      }

      return Math.round(dimensions.width - (time - t) / chartOptions.millisPerPixel);
    };

    this.updateValueRange();
    context.font = chartOptions.labels.fontSize + 'px ' + chartOptions.labels.fontFamily; // Save the state of the canvas context, any transformations applied in this method
    // will get removed from the stack at the end of this method when .restore() is called.

    context.save(); // Move the origin.

    context.translate(dimensions.left, dimensions.top); // Create a clipped rectangle - anything we draw will be constrained to this rectangle.
    // This prevents the occasional pixels from curves near the edges overrunning and creating
    // screen cheese (that phrase should need no explanation).

    context.beginPath();
    context.rect(0, 0, dimensions.width, dimensions.height);
    context.clip(); // Clear the working area.

    context.save();
    context.fillStyle = chartOptions.grid.fillStyle;
    context.clearRect(0, 0, dimensions.width, dimensions.height);
    context.fillRect(0, 0, dimensions.width, dimensions.height);
    context.restore(); // Grid lines...

    context.save();
    context.lineWidth = chartOptions.grid.lineWidth;
    context.strokeStyle = chartOptions.grid.strokeStyle; // Vertical (time) dividers.

    if (chartOptions.grid.millisPerLine > 0) {
      context.beginPath();

      for (var t = time - time % chartOptions.grid.millisPerLine; t >= oldestValidTime; t -= chartOptions.grid.millisPerLine) {
        var gx = timeToXPixel(t);

        if (chartOptions.grid.sharpLines) {
          gx -= 0.5;
        }

        context.moveTo(gx, 0);
        context.lineTo(gx, dimensions.height);
      }

      context.stroke();
      context.closePath();
    } // Horizontal (value) dividers.


    for (var v = 1; v < chartOptions.grid.verticalSections; v++) {
      var gy = Math.round(v * dimensions.height / chartOptions.grid.verticalSections);

      if (chartOptions.grid.sharpLines) {
        gy -= 0.5;
      }

      context.beginPath();
      context.moveTo(0, gy);
      context.lineTo(dimensions.width, gy);
      context.stroke();
      context.closePath();
    } // Bounding rectangle.


    if (chartOptions.grid.borderVisible) {
      context.beginPath();
      context.strokeRect(0, 0, dimensions.width, dimensions.height);
      context.closePath();
    }

    context.restore(); // Draw any horizontal lines...

    if (chartOptions.horizontalLines && chartOptions.horizontalLines.length) {
      for (var hl = 0; hl < chartOptions.horizontalLines.length; hl++) {
        var line = chartOptions.horizontalLines[hl],
            hly = Math.round(valueToYPixel(line.value)) - 0.5;
        context.strokeStyle = line.color || '#ffffff';
        context.lineWidth = line.lineWidth || 1;
        context.beginPath();
        context.moveTo(0, hly);
        context.lineTo(dimensions.width, hly);
        context.stroke();
        context.closePath();
      }
    } // For each data set...


    for (var d = 0; d < this.seriesSet.length; d++) {
      context.save();
      var timeSeries = this.seriesSet[d].timeSeries,
          dataSet = timeSeries.data,
          seriesOptions = this.seriesSet[d].options; // Delete old data that's moved off the left of the chart.

      timeSeries.dropOldData(oldestValidTime, chartOptions.maxDataSetLength); // Set style for this dataSet.

      context.lineWidth = seriesOptions.lineWidth;
      context.strokeStyle = seriesOptions.strokeStyle; // Draw the line...

      context.beginPath(); // Retain lastX, lastY for calculating the control points of bezier curves.

      var firstX = 0,
          lastX = 0,
          lastY = 0;

      for (var i = 0; i < dataSet.length && dataSet.length !== 1; i++) {
        var x = timeToXPixel(dataSet[i][0]),
            y = valueToYPixel(dataSet[i][1]);

        if (i === 0) {
          firstX = x;
          context.moveTo(x, y);
        } else {
          switch (chartOptions.interpolation) {
            case "linear":
            case "line":
              {
                context.lineTo(x, y);
                break;
              }

            case "bezier":
            default:
              {
                // Great explanation of Bezier curves: http://en.wikipedia.org/wiki/Bezier_curve#Quadratic_curves
                //
                // Assuming A was the last point in the line plotted and B is the new point,
                // we draw a curve with control points P and Q as below.
                //
                // A---P
                //     |
                //     |
                //     |
                //     Q---B
                //
                // Importantly, A and P are at the same y coordinate, as are B and Q. This is
                // so adjacent curves appear to flow as one.
                //
                context.bezierCurveTo( // startPoint (A) is implicit from last iteration of loop
                Math.round((lastX + x) / 2), lastY, // controlPoint1 (P)
                Math.round(lastX + x) / 2, y, // controlPoint2 (Q)
                x, y); // endPoint (B)

                break;
              }

            case "step":
              {
                context.lineTo(x, lastY);
                context.lineTo(x, y);
                break;
              }
          }
        }

        lastX = x;
        lastY = y;
      }

      if (dataSet.length > 1) {
        if (seriesOptions.fillStyle) {
          // Close up the fill region.
          context.lineTo(dimensions.width + seriesOptions.lineWidth + 1, lastY);
          context.lineTo(dimensions.width + seriesOptions.lineWidth + 1, dimensions.height + seriesOptions.lineWidth + 1);
          context.lineTo(firstX, dimensions.height + seriesOptions.lineWidth);
          context.fillStyle = seriesOptions.fillStyle;
          context.fill();
        }

        if (seriesOptions.strokeStyle && seriesOptions.strokeStyle !== 'none') {
          context.stroke();
        }

        context.closePath();
      }

      context.restore();
    } // Draw the axis values on the chart.


    if (!chartOptions.labels.disabled && !isNaN(this.valueRange.min) && !isNaN(this.valueRange.max)) {
      var maxValueString = chartOptions.yMaxFormatter(this.valueRange.max, chartOptions.labels.precision),
          minValueString = chartOptions.yMinFormatter(this.valueRange.min, chartOptions.labels.precision),
          labelPos = chartOptions.scrollBackwards ? 0 : dimensions.width - context.measureText(maxValueString).width - 2;
      context.fillStyle = chartOptions.labels.fillStyle;
      context.fillText(maxValueString, labelPos, chartOptions.labels.fontSize);
      context.fillText(minValueString, labelPos, dimensions.height - 2);
    } // Display timestamps along x-axis at the bottom of the chart.


    if (chartOptions.timestampFormatter && chartOptions.grid.millisPerLine > 0) {
      var textUntilX = chartOptions.scrollBackwards ? context.measureText(minValueString).width : dimensions.width - context.measureText(minValueString).width + 4;

      for (var t = time - time % chartOptions.grid.millisPerLine; t >= oldestValidTime; t -= chartOptions.grid.millisPerLine) {
        var gx = timeToXPixel(t); // Only draw the timestamp if it won't overlap with the previously drawn one.

        if (!chartOptions.scrollBackwards && gx < textUntilX || chartOptions.scrollBackwards && gx > textUntilX) {
          // Formats the timestamp based on user specified formatting function
          // SmoothieChart.timeFormatter function above is one such formatting option
          var tx = new Date(t),
              ts = chartOptions.timestampFormatter(tx),
              tsWidth = context.measureText(ts).width;
          textUntilX = chartOptions.scrollBackwards ? gx + tsWidth + 2 : gx - tsWidth - 2;
          context.fillStyle = chartOptions.labels.fillStyle;

          if (chartOptions.scrollBackwards) {
            context.fillText(ts, gx, dimensions.height - 2);
          } else {
            context.fillText(ts, gx - tsWidth, dimensions.height - 2);
          }
        }
      }
    }

    context.restore(); // See .save() above.
  }; // Sample timestamp formatting function


  SmoothieChart.timeFormatter = function (date) {
    function pad2(number) {
      return (number < 10 ? '0' : '') + number;
    }

    return pad2(date.getHours()) + ':' + pad2(date.getMinutes()) + ':' + pad2(date.getSeconds());
  };

  exports.TimeSeries = TimeSeries;
  exports.SmoothieChart = SmoothieChart;
})( false ? 0 : exports);

/***/ }),

/***/ "../../node_modules/bootstrap/dist/js/npm.js":
/*!***************************************************!*\
  !*** ../../node_modules/bootstrap/dist/js/npm.js ***!
  \***************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__ */
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

// This file is autogenerated via the `commonjs` Grunt task. You can require() this file in a CommonJS environment.
__webpack_require__(/*! ../../js/transition.js */ "../../node_modules/bootstrap/js/transition.js")
__webpack_require__(/*! ../../js/alert.js */ "../../node_modules/bootstrap/js/alert.js")
__webpack_require__(/*! ../../js/button.js */ "../../node_modules/bootstrap/js/button.js")
__webpack_require__(/*! ../../js/carousel.js */ "../../node_modules/bootstrap/js/carousel.js")
__webpack_require__(/*! ../../js/collapse.js */ "../../node_modules/bootstrap/js/collapse.js")
__webpack_require__(/*! ../../js/dropdown.js */ "../../node_modules/bootstrap/js/dropdown.js")
__webpack_require__(/*! ../../js/modal.js */ "../../node_modules/bootstrap/js/modal.js")
__webpack_require__(/*! ../../js/tooltip.js */ "../../node_modules/bootstrap/js/tooltip.js")
__webpack_require__(/*! ../../js/popover.js */ "../../node_modules/bootstrap/js/popover.js")
__webpack_require__(/*! ../../js/scrollspy.js */ "../../node_modules/bootstrap/js/scrollspy.js")
__webpack_require__(/*! ../../js/tab.js */ "../../node_modules/bootstrap/js/tab.js")
__webpack_require__(/*! ../../js/affix.js */ "../../node_modules/bootstrap/js/affix.js")

/***/ }),

/***/ "../../node_modules/bootstrap/js/affix.js":
/*!************************************************!*\
  !*** ../../node_modules/bootstrap/js/affix.js ***!
  \************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

/* ========================================================================
 * Bootstrap: affix.js v3.3.7
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      = null
    this.unpin        = null
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.3.7'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var targetHeight = this.$target.height()

    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

    if (this.affixed == 'bottom') {
      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
    }

    var initializing   = this.affixed == null
    var colliderTop    = initializing ? scrollTop : position.top
    var colliderHeight = initializing ? targetHeight : height

    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

    return false
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var height       = this.$element.height()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    var scrollHeight = Math.max($(document).height(), $(document.body).height())

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

    if (this.affixed != affix) {
      if (this.unpin != null) this.$element.css('top', '')

      var affixType = 'affix' + (affix ? '-' + affix : '')
      var e         = $.Event(affixType + '.bs.affix')

      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      this.affixed = affix
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

      this.$element
        .removeClass(Affix.RESET)
        .addClass(affixType)
        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
    }

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);


/***/ }),

/***/ "../../node_modules/bootstrap/js/alert.js":
/*!************************************************!*\
  !*** ../../node_modules/bootstrap/js/alert.js ***!
  \************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

/* ========================================================================
 * Bootstrap: alert.js v3.3.7
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.3.7'

  Alert.TRANSITION_DURATION = 150

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector === '#' ? [] : selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.closest('.alert')
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);


/***/ }),

/***/ "../../node_modules/bootstrap/js/button.js":
/*!*************************************************!*\
  !*** ../../node_modules/bootstrap/js/button.js ***!
  \*************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

/* ========================================================================
 * Bootstrap: button.js v3.3.7
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.3.7'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state += 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      $el[val](data[state] == null ? this.options[state] : data[state])

      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d).prop(d, true)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d).prop(d, false)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked')) changed = false
        $parent.find('.active').removeClass('active')
        this.$element.addClass('active')
      } else if ($input.prop('type') == 'checkbox') {
        if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
        this.$element.toggleClass('active')
      }
      $input.prop('checked', this.$element.hasClass('active'))
      if (changed) $input.trigger('change')
    } else {
      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
      this.$element.toggleClass('active')
    }
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document)
    .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      var $btn = $(e.target).closest('.btn')
      Plugin.call($btn, 'toggle')
      if (!($(e.target).is('input[type="radio"], input[type="checkbox"]'))) {
        // Prevent double click on radios, and the double selections (so cancellation) on checkboxes
        e.preventDefault()
        // The target component still receive the focus
        if ($btn.is('input,button')) $btn.trigger('focus')
        else $btn.find('input:visible,button:visible').first().trigger('focus')
      }
    })
    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
    })

}(jQuery);


/***/ }),

/***/ "../../node_modules/bootstrap/js/carousel.js":
/*!***************************************************!*\
  !*** ../../node_modules/bootstrap/js/carousel.js ***!
  \***************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

/* ========================================================================
 * Bootstrap: carousel.js v3.3.7
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      = null
    this.sliding     = null
    this.interval    = null
    this.$active     = null
    this.$items      = null

    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.3.7'

  Carousel.TRANSITION_DURATION = 600

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  }

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active)
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    if (willWrap && !this.options.wrap) return active
    var delta = direction == 'prev' ? -1 : 1
    var itemIndex = (activeIndex + delta) % this.$items.length
    return this.$items.eq(itemIndex)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || this.getItemForDirection(type, $active)
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  var clickHandler = function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  }

  $(document)
    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);


/***/ }),

/***/ "../../node_modules/bootstrap/js/collapse.js":
/*!***************************************************!*\
  !*** ../../node_modules/bootstrap/js/collapse.js ***!
  \***************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

/* ========================================================================
 * Bootstrap: collapse.js v3.3.7
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */

+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.7'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);


/***/ }),

/***/ "../../node_modules/bootstrap/js/dropdown.js":
/*!***************************************************!*\
  !*** ../../node_modules/bootstrap/js/dropdown.js ***!
  \***************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

/* ========================================================================
 * Bootstrap: dropdown.js v3.3.7
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.7'

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
    })
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger($.Event('shown.bs.dropdown', relatedTarget))
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);


/***/ }),

/***/ "../../node_modules/bootstrap/js/modal.js":
/*!************************************************!*\
  !*** ../../node_modules/bootstrap/js/modal.js ***!
  \************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

/* ========================================================================
 * Bootstrap: modal.js v3.3.7
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.7'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (document !== e.target &&
            this.$element[0] !== e.target &&
            !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);


/***/ }),

/***/ "../../node_modules/bootstrap/js/popover.js":
/*!**************************************************!*\
  !*** ../../node_modules/bootstrap/js/popover.js ***!
  \**************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

/* ========================================================================
 * Bootstrap: popover.js v3.3.7
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.3.7'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);


/***/ }),

/***/ "../../node_modules/bootstrap/js/scrollspy.js":
/*!****************************************************!*\
  !*** ../../node_modules/bootstrap/js/scrollspy.js ***!
  \****************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.7
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.3.7'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);


/***/ }),

/***/ "../../node_modules/bootstrap/js/tab.js":
/*!**********************************************!*\
  !*** ../../node_modules/bootstrap/js/tab.js ***!
  \**********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

/* ========================================================================
 * Bootstrap: tab.js v3.3.7
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element)
    // jscs:enable requireDollarBeforejQueryAssignment
  }

  Tab.VERSION = '3.3.7'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
          .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
            .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
            .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);


/***/ }),

/***/ "../../node_modules/bootstrap/js/tooltip.js":
/*!**************************************************!*\
  !*** ../../node_modules/bootstrap/js/tooltip.js ***!
  \**************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

/* ========================================================================
 * Bootstrap: tooltip.js v3.3.7
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null
    this.inState    = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.3.7'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
    this.inState   = { click: false, hover: false, focus: false }

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in'
      return
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true
    }

    return false
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
    }

    if (self.isInStateTrue()) return

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      if (that.$element) { // TODO: Check whether guarding this code with this `if` is really necessary.
        that.$element
          .removeAttr('aria-describedby')
          .trigger('hidden.bs.' + that.type)
      }
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var isSvg = window.SVGElement && el instanceof window.SVGElement
    // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
    // See https://github.com/twbs/bootstrap/issues/20280
    var elOffset  = isBody ? { top: 0, left: 0 } : (isSvg ? null : $element.offset())
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    if (e) {
      self.inState.click = !self.inState.click
      if (self.isInStateTrue()) self.enter(self)
      else self.leave(self)
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
      that.$element = null
    })
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);


/***/ }),

/***/ "../../node_modules/bootstrap/js/transition.js":
/*!*****************************************************!*\
  !*** ../../node_modules/bootstrap/js/transition.js ***!
  \*****************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

/* ========================================================================
 * Bootstrap: transition.js v3.3.7
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);


/***/ }),

/***/ "./css/json-view/jquery.jsonview.css":
/*!*******************************************!*\
  !*** ./css/json-view/jquery.jsonview.css ***!
  \*******************************************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./less/style.less":
/*!*************************!*\
  !*** ./less/style.less ***!
  \*************************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "../../node_modules/font-awesome/css/font-awesome.css":
/*!************************************************************!*\
  !*** ../../node_modules/font-awesome/css/font-awesome.css ***!
  \************************************************************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./js/monitoring.js");
/******/ })()
.default;
//# sourceMappingURL=monitoring.js.map