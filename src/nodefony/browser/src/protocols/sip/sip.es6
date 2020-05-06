module.exports = function (stage) {

  'use strict';


  const byteToHex = function (byte) {
    return ('0' + byte.toString(16)).slice(-2);
  };

  const generateId = function (len) {
    var arr = new Uint8Array((len || 40) / 2);
    window.crypto.getRandomValues(arr);
    return [].map.call(arr, byteToHex).join("");
  };

  /*
   *
   *	DIGEST authenticate
   *
   *
   */
  const stringify = function (value) {
    return '"' + value + '"';
  };

  const reg = /^([^=]+)=(.+)$/;
  const parserAuthenticate = function (str) {
    var ret = str.replace(/"/g, "");
    ret = ret.replace(/Digest /g, "");
    var head = ret.split(",");
    var obj = [];
    for (var i = 0; i < head.length; i++) {
      var res = reg.exec(head[i]);
      var key = res[1].replace(/ |\n|\r/g, "");
      if (res && key) {
        obj[key] = res[2];
      }
    }
    return obj;
  };

  const MD5 = stage.crypto.md5.hex_md5_noUTF8;
  //var BASE64 = stage.crypto.base64.encode ;

  const digest = {
    generateA1: function (username, realm, password, nonce, cnonce) {
      var A1 = null;
      if (cnonce) {
        A1 = username + ":" + realm + ":" + password + ":" + nonce + ":" + cnonce;
      } else {
        A1 = username + ":" + realm + ":" + password; //+ ":" + nonce ;
      }
      //console.log(A1)
      return MD5(A1);
    },
    generateA2: function (method, uri, entity_body, qop) {
      var A2 = "";
      if (!qop || qop === "auth") {
        A2 = method + ":" + uri;
      } else if (qop === "auth-int") {
        if (entity_body) {
          var entity = MD5(entity_body);
          A2 = method + ":" + uri + ":" + entity;
        } else {
          A2 = method + ":" + uri + ":" + "d41d8cd98f00b204e9800998ecf8427e";
        }
      }
      //console.log(A2)
      return MD5(A2);
    },
    generateResponse: function (A1, nonce, noncecount, cnonce, qop, A2) {
      var res = "";
      if (qop === "auth" || qop === "auth-int") {
        res = A1 + ":" + nonce + ":" + noncecount + ":" + cnonce + ":" + qop + ":" + A2;
      } else {
        res = A1 + ":" + nonce + ":" + A2;
      }
      //console.log(res)
      return MD5(res);
    }
  };


  const authenticate = class authenticate {

    constructor(dialog, username, password) {

      this.dialog = dialog;
      this.userName = username;
      this.password = password;
      this.uri = "sip:" + this.dialog.sip.server;
      this.realm = "nodefony.com";
      this.nonce = null;
      this.cnonce = null;
      this.nonceCount = null;
      this.qop = null;
      this.algorithm = null;
      this.entity_body = null;
      this.timeout = null;
      this.unregisterSended = false;
    }

    register(message, type) {
      //console.log("AUTH REGISTER")
      //console.log(message);
      var head = message.authenticate;
      if (!head) {
        head = this.dialog.authenticate;
      } else {
        this.dialog.authenticate = head;
      }
      this.realm = head.realm;
      this.nonce = head.nonce;
      this.cnonce = head.cnonce;
      this.qop = head.qop;
      this.algorithm = head.Digestalgorithm ? head.Digestalgorithm : "md5";
      if (message.rawBody) {
        this.entity_body = message.rawBody;
      }
      switch (this.algorithm.toLowerCase()) {
      case "md5":
        this.response = this.digestMD5(message.method);
        break;
      }

      var method = "";
      if (!type) {
        method = "Authorization: ";
      } else {
        if (type === "proxy") {
          method = "Proxy-Authorization: ";
        } else {
          method = "Authorization: ";
        }
      }
      var line = "Digest username=" + stringify(this.userName) + ", realm=" + stringify(this.realm) + ", nonce=" + stringify(this.nonce) + ", uri=" + stringify(this.uri) + ", algorithm=" + this.algorithm + ", response=" + stringify(this.response);
      this.lineResponse = method + line;

      //var transac = message.transaction ;
      var transac = this.dialog.createTransaction(message.transaction.to);
      this.dialog.tagTo = null;
      //this.dialog.sip.fire("onInitCall", this.dialog.toName, this.dialog, transac);
      var request = transac.createRequest(this.dialog.body, this.dialog.bodyType);
      request.header.response = this.lineResponse;
      request.send();
      this.dialog.sip.createDialogTimeout(this.dialog);
      return transac;
    }

    unregister() {
      this.dialog.expires = 0;
      this.dialog.contact = "*";
      let trans = this.dialog.createTransaction(this.dialog.from);
      this.dialog.to = this.dialog.from;
      this.dialog.tagTo = null;
      let request = trans.createRequest();
      if (this.lineResponse) {
        request.header.response = this.lineResponse;
      }
      this.unregisterSended = true;
      request.send();
      return trans;
    }



    digestMD5(method) {
      var A1 = digest.generateA1(this.userName, this.realm, this.password, this.nonce, this.cnonce);
      var A2 = digest.generateA2(method, this.uri, this.entity_body, this.qop);
      return digest.generateResponse(A1, this.nonce, this.nonceCount, this.cnonce, this.qop, A2);
    }
  };


  /*
   *
   * CLASS PARSER HEADER SIP
   *
   *
   */
  //var regContact = /.*<(sip:.*)>(.*)|.*<(sips:.*)>(.*)/g;
  const regHeaders = {
    line: /\r\n|\r|\n/,
    headName: /: */,
    Allow: /, */,
    Via: /; */,
    CallId: /^(.*)@.*$/,
    algorithm: /= */,
    fromTo: /<sip:(.*)@(.*)>/,
    fromToG: /(.*)?<sip:(.*)@(.*)>/,
    contact: /.*<(sips?:.*)>(.*)?$/
  };

  const parsefromTo = function (type, value) {
    try {
      var sp = value.split(";");
      this.message[type + "Tag"] = null;
      var res = sp.shift();
      var res2 = regHeaders.fromTo.exec(res);
      //console.log(regHeaders.fromToG.exec(res))
      //console.log(res2)
      this.message[type + "Name"] = (res2.length > 2) ? res2[1].replace(/ |\n|\r/g, "").replace(/"/g, "") : "";
      this.message[type] = res2[1].replace(" ", "") + "@" + res2[2].replace(/ |\n|\r/g, "");
      var ret = regHeaders.fromToG.exec(res);
      if (ret && ret[1]) {
        var displayName = ret[1].replace(/"/g, "");
        //this.message[type+"Name"] = displayName ;
        this.message[type + "NameDisplay"] = displayName;
        //console.log(displayName)
      }

      for (var i = 0; i < sp.length; i++) {
        var res3 = sp[i].split("=");
        if (res3[0].replace(/ |\n|\r/g, "") === "tag") {
          this.message[type + "Tag"] = res3[1];
        } else {
          this.message[res3[0]] = res3[1];
        }
      }
      return value;
    } catch (e) {
      throw e;
    }
  };


  const headerSip = class headerSip {

    constructor(message, header) {
      this.rawHeader = {};
      this.message = message;
      this.method = null;
      this.firstLine = null;
      this.branch = null;
      this.Via = [];
      this.routes = [];
      this.recordRoutes = [];
      if (header && typeof header === "string") {
        try {
          this.parse(header);
        } catch (e) {
          //throw new Error("PARSE ERROR MESSAGE SIP", 500);
          throw e;
        }
      }
    }

    parse(header) {
      var tab = header.split(regHeaders.line);
      var type = tab.shift();
      this.firstLine = type.split(" ");
      $.each(tab, (Index, ele) => {
        var res = regHeaders.headName.exec(ele);
        var size = res[0].length;
        var headName = res.input.substr(0, res.index);
        var headValue = res.input.substr(res.index + size);
        this.rawHeader[headName] = headValue;
        var func = "set" + headName;
        if (func === "setVia") {
          var index = this.Via.push(headValue);
          this[headName][index - 1] = this[func](headValue, ele);
        } else {
          this[headName] = headValue;
          if (this[func]) {
            try {
              this[headName] = this[func](headValue);
            } catch (e) {
              this.message.sip.logger("Parse : " + headName, "ERROR");
              throw e;
            }
          }
        }
      });
      if (!this["Content-Type"]) {
        this.message.contentType = null;
      } else {
        this.message.contentType = this["Content-Type"];
      }
    }

    setFrom(value) {
      parsefromTo.call(this, "from", value);
      return value;
    }

    setTo(value) {
      parsefromTo.call(this, "to", value);
      return value;
    }

    "setWWW-Authenticate" (value) {
      this.message.authenticate = parserAuthenticate(value);
      /*var ele ={};
		  	var res = value.split(",")
		  	for (var i=0 ; i < res.length ;i++){
		  	var ret = regHeaders.algorithm.exec(res[i]);
		  	var size = ret[0].length;
		  	var headName = ret.input.substr(0,ret.index).replace(" ","");
		  	var headValue = ret.input.substr(ret.index+size).replace(/"/g,"");
		  	ele[headName] = headValue.replace(/"/g,"");
		  	}
		  	this.message.authenticate = ele ;*/
      return value;
    }

    "setProxy-Authenticate" (value) {
      this.message.authenticate = parserAuthenticate(value);
      return value;
    }

    "setRecord-Route" (value) {
      this.recordRoutes.push(value);
      return value;
    }

    "setRoute" (value) {
      this.routes.push(value);
      return value;
    }

    setDate(value) {
      try {
        this.message.date = new Date(value);
      } catch (e) {
        this.message.date = value;
      }
      return value;
    }

    "setCall-ID" (value) {
      this.message.callId = value;
      return value;
      /*this.callIdRaw = value ;
		  	var res = regHeaders.CallId.exec(value);
		  	if (res){
		  	this.message.callId =res[1];
		  	return res[1];

		  	}else{
		  	this.message.callId =value;
		  	return value;
		  	}*/
    }

    setCSeq(value) {
      var res = value.split(" ");
      this.message.cseq = parseInt(res[0], 10);
      this.message.method = res[1];
      return value;
    }

    setContact(value) {
      var parseValue = regHeaders.contact.exec(value);
      if (parseValue) {
        this.message.contact = parseValue[1];
        if (parseValue[2]) {
          var clean = parseValue[2].replace(/^;(.*)/, "$1");
          var sp = clean.split(";");
          for (var i = 0; i < sp.length; i++) {
            var res = sp[i].split("=");
            if (!res) {
              continue;
            }
            var name = res[0].toLowerCase();
            if (name === "expires") {
              this["contact-" + name] = res[1];
            }
          }
        }
      } else {
        throw new Error("Contact parse error : " + value);
      }
      return value;
    }

    setAllow(value) {
      if (value) {
        return this.Allow.split(regHeaders.Allow);
      } else {
        return this.Allow;
      }
    }

    setSupported(value) {
      if (value) {
        return this.Supported.split(regHeaders.Allow);
      } else {
        return this.Supported;
      }
    }

    setVia(value, raw) {
      if (value) {
        var res = value.split(regHeaders.Via);
        var obj = {
          line: Array.prototype.shift.call(res),
          raw: raw
        };
        for (var i = 0; i < res.length; i++) {
          var tab = res[i].split('=');
          if (tab) {
            if (tab[0] === "branch") {
              if (!this.branch) {
                this.branch = tab[1];
              }
            }
            obj[tab[0]] = tab[1];
          }
        }
        return obj;
      } else {
        return value;
      }
    }
  };


  /*
   *
   * CLASS PARSER BODY SIP
   *
   *
   *
   */
  const bodySip = class bodySip {

    constructor(message, body) {
      this.message = message;
      this.message.rawBody = body;
      this.size = this.message.contentLength;
      if (this.size !== body.length) {
        throw new Error("BAD SIZE SIP BODY ");
      }
      if (body) {
        this.parse(this.message.contentType, body);
      }
    }

    parse(type, body) {
      switch (type) {
      case "application/sdp":
        this.sdpParser(body);
        break;
      case "application/dtmf-relay":
        this.dtmfParser(body);
        break;
      default:
        this.body = body;
      }
    }

    sdpParser(body) {
      // Parser SDP
      this.body = body || "";
      if (!body) {
        this.sdp = null;
      } else {
        try {
          this.sdp = new stage.io.protocols.sdp(body);
          //console.log(this.sdp)
        } catch (e) {
          throw e;
        }
      }
    }

    dtmfParser(body) {
      // Parser DTMF
      this.body = body || "";
      if (!body) {
        this.dtmf = null;
      } else {
        // Parser dtmf
        var obj = {};
        var line = body.split("\n");
        for (var i = 0; i < line.length; i++) {
          var res = line[i].split("=");
          obj[res[0].replace(/ |\n|\r/g, "")] = res[1];
        }
        this.dtmf = obj;
      }
    }
  };


  /*
   *
   * CLASS REQUEST
   *
   *
   *
   */
  const endline = "\r\n";
  const endHeader = "\r\n\r\n";

  const sipRequest = class sipRequest {

    constructor(transaction, bodyMessage, typeBody) {
      this.transaction = transaction;
      this["request-port"] = this.transaction.dialog.sip.serverPort;

      this.type = "request";
      this.requestLine = {};
      this.buildRequestline();

      this.header = {};
      this.buildHeader();

      this.buildBody(bodyMessage || "", typeBody);
    }

    buildRequestline() {
      this.requestLine.method = this.transaction.method.toUpperCase();
      this.requestLine.version = this.transaction.dialog.sip.version;
    }

    getRequestline(uri) {
      switch (this.transaction.method) {
      case "REGISTER":
        this["request-uri"] = "sip:" + this.transaction.dialog.sip.server;
        return this.transaction.method + " " + this["request-uri"] + " " + this.requestLine.version + endline;
      case "INVITE":
      case "BYE":
      case "NOTIFY":
      case "INFO":
      case "CANCEL":
      case "ACK":
        this["request-uri"] = this.transaction.dialog["request-uri"];
        return this.transaction.method + " " + this["request-uri"] + " " + this.requestLine.version + endline;
      }
    }

    buildHeader() {
      //FIXE ME RPORT IN VIA PARSER

      let rport = this.transaction.dialog.sip.rport;
      let ip = this.transaction.dialog.sip.publicAddress;

      this.header.via = "Via: " + this.transaction.dialog.sip.via + ";" + "branch=" + this.transaction.branch;
      //if ( rport ){
      //this.header.via  = "Via: "+this.transaction.dialog.sip.version+"/"+this.transaction.dialog.sip.settings.transport+" " +ip+":"+rport+";"+"branch="+this.transaction.branch;
      //}else{
      //this.header.via  = "Via: "+this.transaction.dialog.sip.version+"/"+this.transaction.dialog.sip.settings.transport+" " +ip+":"+this["request-port"]+";"+"branch="+this.transaction.branch;
      //}
      this.header.cseq = "CSeq: " + this.transaction.dialog.cseq + " " + this.transaction.method;

      this.header.from = "From: " + this.transaction.dialog.from + ";tag=" + this.transaction.dialog.tagFrom;

      let tagTo = this.transaction.dialog.tagTo ? ";tag=" + this.transaction.dialog.tagTo : "";
      this.header.to = "To: " + this.transaction.to + tagTo;

      this.header.callId = "Call-ID: " + this.transaction.dialog.callId;
      this.header.expires = "Expires: " + this.transaction.dialog.expires;
      this.header.maxForward = "Max-Forwards: " + this.transaction.dialog.maxForward;
      this.header.userAgent = "User-Agent: " + this.transaction.dialog.sip.settings.userAgent;

      this.header.contact = "Contact: " + this.transaction.dialog.contact;

      if (this.transaction.dialog.routes && this.transaction.dialog.routes.length) {
        this.header.routes = [];
        for (let i = this.transaction.dialog.routes.length - 1; i >= 0; i--) {
          this.header.routes.push("Route: " + this.transaction.dialog.routes[i]);
        }
      }
    }

    getHeader() {
      var head = "";
      for (var line in this.header) {
        switch (stage.typeOf(this.header[line])) {
        case "string":
          head += this.header[line] + endline;
          break;
        case "array":
          for (var i = 0; i < this.header[line].length; i++) {
            head += this.header[line][i] + endline;
          }
          break;
        }
      }
      return head;
    }

    buildBody(body, type) {
      this.header.contentLength = "Content-Length: " + body.length;
      if (type) {
        this.header.contentType = "Content-Type: " + type;
      }
      this.body = body ||  "";
    }

    getBody() {
      return this.body;
    }

    getMessage() {
      //console.log(this.getRequestline() + this.getHeader() + endline + this.getBody())
      //console.log(this.getRequestline() + this.getHeader() + endline + this.getBody())
      return this.rawResponse = this.getRequestline() + this.getHeader() + endline + this.getBody();
    }

    send() {
      return this.transaction.send(this.getMessage());
    }
  };


  /*
   *
   * CLASS RESPONSE
   *
   *
   *
   */
  const codeMessage = {
    200: "OK"
  };

  const sipResponse = class sipResponse {

    constructor(message, code, messageCode, bodyMessage, typeBody) {
      this.message = message;
      this.transaction = message.transaction;
      this.dialog = message.dialog;
      this.responseLine = {};
      this.buildResponseLine(code, messageCode);
      this.header = []; // message.header.messageHeaders;
      this.buildHeader(message);
      this.buildBody(bodyMessage || "", typeBody);
    }

    buildHeader(message) {
      for (let head in message.rawHeader) {
        let i = 0;
        switch (head) {
        case "Allow":
        case "Supported":
          var ptr = "";
          for (i = 0; i < message.header[head].length; i++) {
            if (i < message.header[head].length - 1) {
              ptr += message.header[head][i] + ",";
            } else {
              ptr += message.header[head][i];
            }
          }
          this.header.push(head + ": " + ptr);
          break;
        case "Via":
          if (this.responseLine.code == "487") {
            for (i = 0; i < this.dialog[head].length; i++) {
              this.header.push(this.dialog[head][i].raw);
            }
          } else {
            for (i = 0; i < message.header[head].length; i++) {
              this.header.push(message.header[head][i].raw);
            }
          }
          break;
        case "User-Agent":
          this.header.push("User-Agent: " + this.transaction.dialog.sip.settings.userAgent);
          break;
        case "Contact":
          /*var rport = this.transaction.dialog.sip.rport ;
          var ip = this.transaction.dialog.sip.publicAddress;
          if ( rport ){
          	this.header.push( "Contact: <sip:" +this.transaction.to+"@"+ip+":"+rport+";transport="+this.transaction.dialog.sip.settings.transport.toLowerCase()+">");
          }else{
          	this.header.push( "Contact: <sip:" +this.transaction.to+"@"+ip+";transport="+this.transaction.dialog.sip.settings.transport.toLowerCase()+">");
          }*/
          this.header.push("Contact: " + this.dialog.contact);
          break;
        case "To":
          //console.log(message.header[head] )
          //console.log(this.dialog.sip.displayName )
          var ret = regHeaders.fromToG.exec(message.header[head]);
          //console.log(ret)
          if (ret && (!ret[1])) {
            //console.log("traff to")
            message.header[head] = '"' + this.dialog.sip.displayName + '"' + message.header[head];
          }
          //console.log(message.header[head])
          if (!message.header[head].match(/;tag=/)) {
            this.header.push(head + ": " + message.header[head] + (this.transaction.dialog.tagFrom ? ";tag=" + this.transaction.dialog.tagFrom : ""));
          } else {
            this.header.push(head + ": " + message.header[head]);
          }
          break;
        case "Record-Route":
          for (i = this.message.dialog.routes.length - 1; i >= 0; i--) {
            this.header.push(head + ": " + this.message.header.recordRoutes[i]);
          }
          break;
        case "CSeq":
          if (this.responseLine.code == "487" && this.dialog.method === "CANCEL") {
            this.header.push(head + ": " + message.header[head].replace("CANCEL", "INVITE"));
          } else {
            this.header.push(head + ": " + message.header[head]);
          }
          break;
        case "Content-Type":
        case "Organization":
        case "Server":
        case "Content-Length":
          break;
        default:
          this.header.push(head + ": " + message.header[head]);
        }
      }
    }

    getHeader() {
      let head = "";
      for (let line in this.header) {
        head += this.header[line] + endline;
      }
      return head;
    }

    buildBody(body, type) {
      this.header.contentLength = "Content-Length: " + body.length;
      if (type) {
        this.header.contentType = "Content-Type: " + type;
      }
      this.body = body ||  "";
    }

    getBody() {
      return this.body;
    }

    buildResponseLine(code, messageCode) {
      this.responseLine.method = this.transaction.method.toUpperCase();
      this.responseLine.version = this.transaction.dialog.sip.version;
      this.responseLine.code = code;
      this.responseLine.message = messageCode || codeMessage[code];
    }

    getResponseline() {
      if (this.responseLine.method === "ACK") {
        return this.responseLine.method + " " + "sip:" + this.transaction.from + "@" + this.transaction.dialog.sip.server + " " + this.responseLine.version + endline;
      }
      return this.responseLine.version + " " + this.responseLine.code + " " + this.responseLine.message + endline;
    }

    getMessage() {
      //console.log("RESPONSE : " +this.getResponseline() + this.getHeader() + endline + this.getBody())
      return this.rawResponse = this.getResponseline() + this.getHeader() + endline + this.getBody();
    }

    send() {
      return this.transaction.send(this.getMessage());
    }
  };


  /*
   *
   * CLASS TRANSACTION
   *
   *
   */
  const generateHex = function () {
    return Math.floor(Math.random() * 167772150000000).toString(16);
  };

  const Transaction = class Transaction {

    constructor(to, dialog) {
      this.dialog = dialog;
      if (to instanceof Message) {
        this.hydrate(to);
      } else {
        this.to = to;
        this.from = dialog.from;
        this.method = dialog.method;
        this.branch = this.generateBranchId();
      }
      this.responses = {};
      this.requests = {};
      this.interval = null;
    }

    hydrate(message) {
      this.message = message;
      if (message.type === "REQUEST") {
        this.to = this.dialog.to;
        this.from = this.dialog.from;
        this.method = this.dialog.method;
        this.branch = this.message.header.branch;
      }
      if (message.type === "RESPONSE") {
        this.to = this.dialog.to;
        this.from = this.dialog.from;
        this.method = this.dialog.method;
        this.branch = this.message.header.branch;
      }
    }

    generateBranchId() {
      let hex = generateHex();
      if (hex.length === 12) {
        return "z9hG4bK" + hex;
      } else {
        return this.generateBranchId();
      }
    }

    createRequest(body, typeBody) {
      if (this.method !== "ACK" && this.method !== "CANCEL") {
        this.dialog.incCseq();
      }
      this.request = new sipRequest(this, body || "", typeBody);
      this.message = null;
      return this.request;
    }

    createResponse(code, message, body, typeBody) {
      if (this.method === "INVITE" || this.method === "ACK") {
        switch (true) {
        case code < 200:
          this.dialog.status = this.dialog.statusCode.EARLY;
          break;
        case code < 300:
          this.dialog.status = this.dialog.statusCode.ESTABLISHED;
          break;
        default:
          this.dialog.status = this.dialog.statusCode.TERMINATED;
        }
      }
      this.response = new sipResponse(this.message, code, message, body, typeBody);
      return this.response;
    }

    send(message) {
      return this.dialog.sip.send(message);
    }

    cancel() {
      this.method = "CANCEL";
      this.dialog.routes = null;
      this.dialog.tagTo = "";
      let request = this.createRequest();
      request.send();
      this.dialog.status = this.dialog.statusCode.CANCEL;
      return request;
    }

    decline() {
      let ret = this.createResponse(
        603,
        "Declined"
      );
      ret.send();
      return ret;
    }

    clear() {
      // CLEAR INTERVAL
      if (this.interval) {
        clearInterval(this.interval);
      }
    }
  };

  /*
   *
   * CLASS DIALOG
   *
   */
  const statusCode = {
    INITIAL: 0,
    EARLY: 1, // on 1xx
    ESTABLISHED: 2, // on 200 ok
    TERMINATED: 3, // on by
    CANCEL: 4 // cancel
  };

  const Dialog = class Dialog {

    constructor(method, sip) {
      this.sip = sip;
      this.transactions = {};
      this.statusCode = statusCode;
      this.status = this.statusCode.INITIAL;
      this.routes = null;
      this.from = this.sip.from;
      this.maxForward = this.sip.settings.maxForward;
      this.expires = this.sip.settings.expires;
      this.tagFrom = this.generateTag();
      this.cseq = this.generateCseq();
      this.unregisterSended = false;
      if (method instanceof Message) {
        this.hydrate(method);
      } else {
        this.method = method;
        this.callId = this.generateCallId();
        this.status = this.statusCode.INITIAL;
        this.to = null;
        this.tagTo = null;
      }
      //this.contact = this.sip.generateContact( null, null, true) ;
      this.contact = this.sip.contact;
    }

    hydrate(message) {

      if (message.type === "REQUEST") {
        this.cseq = message.cseq;
        this.method = message.method;
        this.callId = message.callId;

        // to
        if (message.fromNameDisplay) {
          this.to = '"' + message.fromNameDisplay + '"' + "<sip:" + message.from + ">";
        } else {
          this.to = "<sip:" + message.from + ">";
        }
        this.toName = message.fromName;
        this.tagTo = message.fromTag || this.generateTag();
        //from
        this.tagFrom = message.toTag || this.tagFrom;
        if (message.toNameDisplay) {
          this.from = '"' + message.toNameDisplay + '"' + '<sip:' + message.to + '>';
        } else {
          this.from = "<sip:" + message.to + ">";
        }
        this.fromName = message.toName;


        // manage routes
        if (message.header.recordRoutes.length) {
          this.routes = message.header.recordRoutes.reverse();
        }

        // FIXME if (  ! this["request-uri"] &&  message.contact )
        if (message.contact) {
          //this["request-uri"] =  message.contact + ":" + message.rport
          this["request-uri"] = message.contact;
        }

      }
      if (message.type === "RESPONSE") {
        this.cseq = message.cseq;
        if (!this.callId) {
          this.callId = message.callId;
        }
        if (!this.to) {
          if (message.toNameDisplay) {
            this.to = '"' + message.toNameDisplay + '"' + "<sip:" + message.to + ">";
          } else {
            this.to = "<sip:" + message.to + ">";
          }
        } else {
          if (message.toNameDisplay) {
            this.to = '"' + message.toNameDisplay + '"' + "<sip:" + message.to + ">";
          }
        }

        if (message.toTag) {
          this.tagTo = message.toTag;
        }
        if (message.fromTag) {
          this.tagFrom = message.fromTag;
        }
        // FIXME if (  ! this["request-uri"] &&  message.contact )
        if (message.contact) {
          //this["request-uri"] =  message.contact + ":" + message.rport
          this["request-uri"] = message.contact;
        }

        // manage routes
        if (message.header.recordRoutes.length) {
          this.routes = message.header.recordRoutes;
        }
      }
    }

    generateCallId() {
      return generateId() + "@nodefony";
    }

    generateTag() {
      return "nodefony" + parseInt(Math.random() * 1000000000, 10);
    }

    generateCseq() {
      return 1;
    }

    incCseq() {
      this.cseq = this.cseq + 1;
      return this.cseq;
    }

    getTransaction(id) {
      if (id in this.transactions) {
        return this.transactions[id];
      }
      return null;
    }

    createTransaction(to) {
      this.currentTransaction = new Transaction(to || this.to, this);
      this.sip.logger("SIP NEW TRANSACTION :" + this.currentTransaction.branch, "DEBUG");
      this.transactions[this.currentTransaction.branch] = this.currentTransaction;
      return this.currentTransaction;
    }

    register() {
      let trans = this.createTransaction(this.from);
      this.to = this.from;
      let request = trans.createRequest();
      request.send();
      return trans;
    }

    unregister() {
      this.expires = 0;
      this.contact = "*";
      let trans = this.createTransaction(this.from);
      this.to = this.from;
      this.tagTo = null;
      let request = trans.createRequest();
      request.send();
      this.unregisterSended = true;
      return trans;
    }

    ack( /*message*/ ) {
      if (!this["request-uri"]) {
        this["request-uri"] = this.sip["request-uri"];
      }
      //this.method = "ACK" ;
      let trans = this.createTransaction();
      trans.method = "ACK";
      let request = trans.createRequest();
      request.send();
      return request;
    }

    invite(userTo, description, type) {

      if (this.status === this.statusCode.CANCEL) {
        return null;
      }
      this.sip.logger("SIP INVITE DIALOG");
      if (userTo) {
        this.to = "<sip:" + userTo + ">";
      }
      this.method = "INVITE";
      if (!this["request-uri"]) {
        this["request-uri"] = "sip:" + userTo;
      }

      if (description.sdp) {
        this.bodyType = "application/sdp";
        this.body = description.sdp;
      } else {
        this.bodyType = type;
        this.body = description;
      }
      let trans = this.createTransaction(this.to);
      let request = trans.createRequest(this.body, this.bodyType);
      request.send();
      return trans;

    }

    notify(userTo, notify, typeNotify) {
      this.method = "NOTIFY";
      if (userTo) {
        this.to = "<sip:" + userTo + ">";
      }
      if (!this["request-uri"]) {
        this["request-uri"] = "sip:" + userTo;
      }
      if (typeNotify) {
        this.bodyType = typeNotify;
      }
      if (notify) {
        this.body = notify;
      }
      let trans = this.createTransaction(this.to);
      let request = trans.createRequest(this.body, this.bodyType);
      request.send();
      return this;

    }

    info(info, typeInfo) {
      this.method = "INFO";

      if (typeInfo) {
        this.bodyType = typeInfo;
      }
      if (info) {
        this.body = info;
      }
      let trans = this.createTransaction(this.to);
      let request = trans.createRequest(this.body, this.bodyType);
      request.send();
      return this;

    }

    bye() {
      this.method = "BYE";
      let trans = this.createTransaction();
      let request = trans.createRequest();
      request.send();
      return this;

    }

    clear(id) {
      if (id) {
        if (this.transactions[id]) {
          this.transactions[id].clear();
          delete this.transactions[id];
        } else {
          throw new Error("TRANSACTION not found :" + id);
        }
      } else {
        for (let transac in this.transactions) {
          this.transactions[transac].clear();
          delete this.transactions[transac];
        }
      }
    }
  };



  /*
   *
   *	MESSAGE SIP
   *
   *
   */
  const firstline = function (firstLine) {
    let method = firstLine[0];
    let code = firstLine[1];
    if (method === "BYE" && !code) {
      code = 200;
    }
    let message = "";
    for (let i = 2; i < firstLine.length; i++) {
      message += firstLine[i] + " ";
    }
    return {
      method: method,
      code: code,
      message: message
    };
  };

  const regSIP = /\r\n\r\n/;
  const Message = class Message {

    constructor(message, sip) {
      this.sip = sip;
      if (message) {
        this.rawMessage = message;
        this.header = null;
        this.body = null;
        this.statusLine = null;
        this.contentLength = 0;
        this.code = null;
        this.statusLine = "";
        this.split = message.split(regSIP);
        if (this.split.length && this.split.length <= 2) {
          try {
            this.parseHeader();
            this.contentLength = parseInt(this.header["Content-Length"], 10);
            this.parseBody();
            this.statusLine = firstline(this.header.firstLine);
            this.code = parseInt(this.statusLine.code, 10);
            this.getType();
          } catch (e) {
            throw e;
          }

          this.rawHeader = this.header.rawHeader;
          //console.log(this.rawHeader)
        }
        this.getDialog();
        this.getTransaction();

      } else {
        throw new Error("BAD FORMAT MESSAGE SIP no message", 500);
      }
    }

    getType() {
      if (this.code) {
        if ((typeof this.code) === "number" && !isNaN(this.code)) {
          this.type = "RESPONSE";
        } else {
          throw new Error("BAD FORMAT MESSAGE SIP message code   ");
        }
      } else {
        if (this.method) {
          this.type = "REQUEST";
        } else {
          this.type = null;
          throw new Error("BAD FORMAT MESSAGE SIP message type not defined  ");
        }
      }
    }

    parseBody() {
      try {
        if (this.split[1]) {
          this.body = new bodySip(this, this.split[1]);
        } else {
          this.body = new bodySip(this, "");
        }
      } catch (e) {
        this.sip.logger("SIP parseBody Message :" + this.split[1], "ERROR");
        throw e;
      }
    }

    parseHeader() {
      if (this.split[0]) {
        try {
          this.header = new headerSip(this, this.split[0]);
        } catch (e) {
          this.sip.logger("SIP parseHeader Message :" + this.split[0], "ERROR");
          throw e;
        }
      } else {
        throw ("BAD FORMAT MESSAGE SIP no header ", 500);
      }
    }

    getContact() {
      return this.contact;
    }

    getHeader() {
      return this.header;
    }

    getBody() {
      return this.body;
    }

    getStatusLine() {
      return this.statusLine;
    }

    getCode() {
      return this.code;
    }

    getDialog() {
      if (this.header["Call-ID"]) {
        this.dialog = this.sip.getDialog(this.header["Call-ID"]);
        if (!this.dialog) {
          this.dialog = this.sip.createDialog(this);
        } else {
          this.sip.logger("SIP HYDRATE DIALOG :" + this.dialog.callId, "DEBUG");
          this.dialog.hydrate(this);
        }
        return this.dialog;
      } else {
        throw new Error("BAD FORMAT SIP MESSAGE no Call-ID", 500);
      }
    }

    getTransaction() {
      if (this.header.branch) {
        if (!this.dialog) {
          this.getDialog();
        }
        if (this.dialog) {
          this.transaction = this.dialog.getTransaction(this.header.branch);
          if (!this.transaction) {
            this.transaction = this.dialog.createTransaction(this);
          } else {
            this.sip.logger("SIP HYDRATE TRANSACTION :" + this.transaction.branch, "DEBUG");
            this.transaction.hydrate(this);
          }
        } else {
          this.transaction = null;
        }
        return this.transaction;
      } else {
        // TODO CSEQ mandatory
        this.sip.logger(this.rawMessage, "ERROR");
        throw new Error("BAD FORMAT SIP MESSAGE no Branch", 500);
      }
    }
  };

  /*
   *
   *
   *	CLASS SIP
   *
   *
   */
  // entry point response transport
  const onMessage = function (response) {

    this.logger(response, "INFO", "RECIEVE");
    let message = null;
    let res = null;
    try {
      //console.log(this.fragment)
      if (this.fragment) {
        this.lastResponse += response;
        //console.log(this.lastResponse);
      } else {
        this.lastResponse = response;
      }
      message = new Message(this.lastResponse, this);
      this.fragment = false;
    } catch (e) {
      //console.log(e);
      // bad split
      for (let i = 0; i < e.length; i++) {
        if (e[i]) {
          try {
            onMessage.call(this, e[i]);
            continue;
          } catch (e) {
            //console.log("FRAGMENTE")
            this.fragment = true;
            return;
          }
        }
      }
      this.logger(e, "ERROR");
      this.logger("SIP DROP : " + response, "ERROR");
      this.notificationsCenter.fire("onDrop", response);
      return;
    }
    this.fire("onMessage", message.rawMessage);

    switch (message.method) {
    case "REGISTER":
      this.rport = message.header.Via[0].rport;
      if (message.dialog) {
        this.clearDialogTimeout(message.dialog);
      }
      if (this.rport) {
        this["request-uri"] = "sip:" + this.userName + "@" + this.publicAddress + ":" + this.rport + ";transport=" + this.transportType;
      }
      switch (message.code) {
      case 401:
      case 407:
        if (this.registered === 200) {
          if (this.registerInterval) {
            clearInterval(this.registerInterval);
          }
          this.registerInterval = null;
        } else {

          if (this.registered === 401 || this.registered === 407) {
            if (this.registerInterval) {
              clearInterval(this.registerInterval);
            }
            this.registerInterval = null;
            this.registered = null;
            this.notificationsCenter.fire("onError", this, message);
            break;
          }
          this.registered = message.code;
        }
        delete this.authenticateRegister;
        this.authenticateRegister = null;
        this.authenticateRegister = new authenticate(message.dialog, this.userName, this.settings.password);
        this.authenticateRegister.register(message, message.code === 407 ? "proxy" : null);
        break;
      case 403:
        if (this.registerInterval) {
          clearInterval(this.registerInterval);
        }
        this.registered = message.code;
        //console.log("Forbidden (bad auth)")
        delete this.authenticateRegister;
        this.authenticateRegister = null;
        this.notificationsCenter.fire("onError", this, message);
        break;
      case 404:
        if (this.registerInterval) {
          clearInterval(this.registerInterval);
        }
        this.registered = message.code;
        delete this.authenticateRegister;
        this.authenticateRegister = null;
        this.notificationsCenter.fire("onError", this, message);
        break;
      case 200:
        if (this.registerInterval) {
          clearInterval(this.registerInterval);
        }
        if (this.authenticateRegister && this.authenticateRegister.unregisterSended) {
          this.registered = "404";
          this.notificationsCenter.fire("onUnRegister", this, message);
          this.clear();
          return;
        }
        if (message.dialog.unregisterSended) {
          this.registered = "404";
          this.notificationsCenter.fire("onUnRegister", this, message);
          this.clear();
          return;
        }
        if (this.registered === 401 || this.registered === null) {
          this.notificationsCenter.fire("onRegister", this, message);
        }
        this.registered = message.code;

        let expires = message.header["contact-expires"] ||  this.settings.expires;
        expires = parseInt(expires, 10) * 900; // 10% (ms)
        this.registerInterval = setInterval(() => {
          this.authenticateRegister.register(message);
          this.notificationsCenter.fire("onRenew", this, this.authenticateRegister, message);
        }, expires);
        break;
      default:
        this.registered = message.code;
        delete this.authenticateRegister;
        this.authenticateRegister = null;
        //console.log(message);
        this.notificationsCenter.fire("on" + message.code, this, message);
        break;
      }
      break;
    case "INVITE":
      //this.rport = message.rport || this.rport;
      if (message.dialog) {
        this.clearDialogTimeout(message.dialog);
      }
      switch (message.type) {
      case "REQUEST":
        if (message.dialog.status === message.dialog.statusCode.INITIAL) {
          this.fire("onInitCall", message.dialog.toName, message.dialog, message.transaction);
          if (message.header.Via) {
            message.dialog.Via = message.header.Via;
          }
          this.notificationsCenter.fire("onInvite", message, message.dialog);
        } else {
          //console.log(message.dialog.statusCode[message.dialog.status])
          if (message.dialog.status === message.dialog.statusCode.ESTABLISHED) {
            this.notificationsCenter.fire("onInvite", message, message.dialog);
          } else {
            let ret = message.transaction.createResponse(200, "OK");
            ret.send();
          }
        }
        break;
      case "RESPONSE":
        if (message.code >= 200) {
          message.dialog.ack(message);
        }
        switch (message.code) {
        case 407:
        case 401:
          delete this.authenticate;
          this.authenticate = null;
          this.authenticate = new authenticate(message.dialog, this.userName, this.settings.password);
          var transaction = this.authenticate.register(message, message.code === 407 ? "proxy" : null);
          this.fire("onInitCall", message.dialog.toName, message.dialog, transaction);
          break;
        case 180:
          this.notificationsCenter.fire("onRinging", this, message);
          message.dialog.status = message.dialog.statusCode.EARLY;
          break;
        case 100:
          this.notificationsCenter.fire("onTrying", this, message);
          message.dialog.status = message.dialog.statusCode.EARLY;
          break;
        case 200:
          this.notificationsCenter.fire("onCall", message);
          message.dialog.status = message.dialog.statusCode.ESTABLISHED;
          break;
        case 486:
        case 603:
          this.notificationsCenter.fire("onDecline", message);
          break;
        case 403:
          this.authenticate = false;
          this.notificationsCenter.fire("onError", this, message);
          break;
        case 487:
        case 404:
        case 477:
        case 480:
        case 484:
        case 488:
          this.notificationsCenter.fire("onError", this, message);
          break;
        case 408:
          this.notificationsCenter.fire("onTimeout", this, message);
          break;
        case 500:
          this.notificationsCenter.fire("onError", this, message);
          break;
        default:
          this.notificationsCenter.fire("on" + message.code, this, message);
          break;
        }
        break;
      default:
        // error BAD FORMAT
      }
      break;
    case "ACK":
      //console.log("ACK");
      //TODO manage interval messages timer retransmission
      break;
    case "BYE":
      switch (message.code) {
      case 200:
        //console.log("200")
        this.notificationsCenter.fire("onBye", message);
        break;
      default:
        this.notificationsCenter.fire("onBye", message);
        if (message.type === "REQUEST") {
          res = message.transaction.createResponse(200, "OK");
          res.send();
        }
      }
      break;
    case "INFO":
      switch (message.type) {
      case "REQUEST":
        //console.log("SIP   :"+ message.method + " "+" type: "+message.contentType );
        this.notificationsCenter.fire("onInfo", message);
        res = message.transaction.createResponse(200, "OK");
        res.send();
        break;
      case "RESPONSE":
        //console.log("SIP   :"+ message.method + " "+" code:"+message.code );
        this.notificationsCenter.fire("onDrop", message);
        break;
      }
      break;

    case "CANCEL":
      switch (message.type) {
      case "REQUEST":
        this.notificationsCenter.fire("onCancel", message);
        res = message.transaction.createResponse(200, "OK");
        res.send();
        message.dialog.status = message.dialog.statusCode.CANCEL;
        res = message.transaction.createResponse(487, "Request Terminated");
        res.send();
        message.dialog.status = message.dialog.statusCode.TERMINATED;

        break;
      case "RESPONSE":

        this.notificationsCenter.fire("onDrop", message);
        break;
      }
      break;
    case "REFER":
      this.logger("SIP REFER NOT ALLOWED :" + message.method, "WARNING");
      this.notificationsCenter.fire("onDrop", message);
      break;
    default:
      this.logger("SIP DROP :" + message.method + " " + " code:" + message.code, "WARNING");
      this.notificationsCenter.fire("onDrop", message);
      // TODO RESPONSE WITH METHOD NOT ALLOWED
    }
  };

  var onStart = function () {
    this.fire("onStart", this);
  };

  var onStop = function () {
    this.stop();
  };

  var defaultSettings = {
    expires: 200, // en secondes
    maxForward: 70,
    version: "SIP/2.0",
    userAgent: "nodefony",
    portServer: "5060",
    userName: "userName",
    displayName: "",
    pwd: "password",
    transport: "TCP"
  };


  // CLASS
  const SIP = class SIP extends stage.Service {

    constructor(server, transport, settings) {

      super("SIP", null, null, settings);
      this.settings = stage.extend({}, defaultSettings, settings);
      this.dialogs = {};
      this.version = this.settings.version;

      //
      this.server = server;
      this.serverPort = this.settings.portServer;

      this.authenticate = false;
      this.authenticateRegister = null;

      // REGISTER
      this.registerInterval = null;
      this.registerTimeout = {};
      this.registered = null;
      this.diagRegister = null;

      // TRANSPORT
      this.transport = transport;
      if (this.transport) {
        this.initTransport();
      }
      this.transportType = this.settings.transport.toLowerCase();

      this.contact = null;
      this.via = null;
      // IDENTIFIANT
      //  USER
      //this.userName = this.settings.userName ;
      //this.from = "<sip:"+this.userName+"@"+this.publicAddress+">" ;
      //this.contact = this.generateContact();
      //this["request-uri"] =  "sip:"+this.userName+"@"+this.publicAddress+";transport="+this.transportType ;
    }

    generateInvalid() {
      return parseInt(Math.random() * 1000000000, 10) + ".nodefony.invalid";
    }

    generateVia(addr) {
      if (this.rport) {
        return this.version + "/" + this.settings.transport + " " + addr + ";rport";
      } else {
        return this.version + "/" + this.settings.transport + " " + addr;
      }
    }

    generateContact(userName, password, force, settings) {
      if (userName) {
        this.userName = userName;
        if (settings && settings.displayName) {
          this.displayName = settings.displayName;
        } else {
          this.displayName = userName;
        }
        this.from = '"' + this.displayName + '"' + '<sip:' + this.userName + '@' + this.publicAddress + '>';
        this["request-uri"] = "sip:" + this.userName + "@" + this.publicAddress + ";transport=" + this.transportType;
        if (password) {
          this.settings.password = password;
        }
      }

      if (!this.contact || force) {
        var invalid = null;
        switch (this.transportType) {
        case "ws":
        case "wss":
          invalid = this.generateInvalid();
          this.via = this.generateVia(invalid);
          if (this.rport) {
            return '"' + this.displayName + '"' + "<sip:" + this.userName + "@" + invalid + ":" + this.rport + ";transport=" + this.transportType + ">";
          } else {
            return '"' + this.displayName + '"' + "<sip:" + this.userName + "@" + invalid + ";transport=" + this.transportType + ">";
          }
          break;
        case "tcp":
        case "udp":
          invalid = this.generateInvalid();
          this.via = this.generateVia(invalid);
          //this.via = this.generateVia(this.publicAddress);
          if (this.rport) {
            return '"' + this.displayName + '"' + "<sip:" + this.userName + "@" + invalid + ":" + this.rport + ";transport=" + this.transportType + ">";
          } else {
            return '"' + this.displayName + '"' + "<sip:" + this.userName + "@" + invalid + ";transport=" + this.transportType + ">";
          }
          break;
        default:
          throw new Error("SIP TRANSPORT TYPE NOT ALLOWED");
        }
      }
      return this.contact;
    }

    getDialog(id) {
      if (id in this.dialogs) {
        return this.dialogs[id];
      }
      return null;
    }

    initTransport(transport) {
      if (transport) {
        this.transport = transport;
      }

      // GET REMOTE IP
      if (this.transport.publicAddress) {
        this.publicAddress = this.transport.domain.hostname;
        this.publicAddress = this.server;
      } else {
        this.publicAddress = this.server;
      }

      switch (this.settings.transport) {
        // realtime nodefony
      case "TCP":
      case "UDP":
        this.transport.listen(this, "onSubscribe", function (service, message) {
          if (service === "SIP" ||  service === "OPENSIP") {
            onStart.call(this, message);
          }
        });

        this.transport.listen(this, "onUnsubscribe", function (service, message) {
          if (service === "SIP" ||  service === "OPENSIP") {
            onStop.call(this, message);
          }
        });
        this.transport.listen(this, "onMessage", function (service, message) {
          if (service === "SIP" ||  service === "OPENSIP") {
            onMessage.call(this, message);
          }
        });

        this.transport.listen(this, "onClose", function (message) {
          this.quit(message);
        });
        break;
      case "WS":
      case "WSS":
        this.transport.listen(this, "onMessage", function (message) {
          //this.notificationsCenter.fire("onMessage",message.data);
          onMessage.call(this, message.data);
        });
        this.transport.listen(this, "onError", function (message) {
          this.notificationsCenter.fire("onError", this.transport, message);
        });
        this.transport.listen(this, "onConnect", function (message) {
          this.connect(message);
        });
        this.transport.listen(this, "onClose", function (message) {
          this.quit(message);
        });
        break;
      default:
        this.fire("onError", new Error("TRANSPORT LAYER NOT DEFINED"));
      }
    }

    clear() {
      if (this.registerInterval) {
        clearInterval(this.registerInterval);
      }
      if (this.registerTimeout) {
        this.clearDialogTimeout();
        delete this.registerTimeout;
      }
      //TODO
      //clean all setinterval
      for (var dia in this.dialogs) {
        //this.dialogs[dia].unregister();
        this.dialogs[dia].clear();
      }
      this.notificationsCenter.clearNotifications();
    }

    quit(message) {
      this.fire("onQuit", this, message);
      //this.unregister();
      this.clear();
    }

    connect(message) {
      this.fire("onConnect", this, message);
    }

    createDialog(method) {
      var dialog = new Dialog(method, this);
      this.logger("SIP NEW DIALOG :" + dialog.callId, "DEBUG");
      this.dialogs[dialog.callId] = dialog;
      return dialog;
    }

    createDialogTimeout(dialog) {
      if (dialog) {
        this.registerTimeout[dialog.callId] = setTimeout(() => {
          let error = new Error(" DIALOG ID : " + dialog.callId + " TIMEOUT : " + dialog.method + "  no response ");
          this.logger(error, "ERROR");
          this.fire("onError", this, error);
        }, (parseInt(this.settings.expires, 10) * 900));
      }
    }
    clearDialogTimeout(dialog) {
      if (dialog) {
        let id = dialog.callId;
        if (this.registerTimeout[id]) {
          clearTimeout(this.registerTimeout[id]);
          delete this.registerTimeout[id];
        }
      } else {
        for (let ele in this.registerTimeout) {
          clearTimeout(this.registerTimeout[ele]);
          delete this.registerTimeout[ele];
        }
      }
    }

    register(userName, password, settings) {
      this.logger("TRY TO REGISTER SIP : " + userName + password, "DEBUG");
      this.contact = this.generateContact(userName, password, false, settings);
      this.diagRegister = this.createDialog("REGISTER");
      this.diagRegister.register();
      this.createDialogTimeout(this.diagRegister);
      return this.diagRegister;
    }

    unregister() {
      if (this.authenticateRegister && this.registered === 200) {
        return this.authenticateRegister.unregister();
      }
      if (this.diagRegister && this.registered === 200) {
        return this.diagRegister.unregister();
      }
    }

    invite(userTo, description) {
      var diagInv = this.createDialog("INVITE");
      var transaction = diagInv.invite(userTo + "@" + this.publicAddress, description);
      diagInv.toName = userTo;
      this.fire("onInitCall", userTo, diagInv, transaction);
      return diagInv;
    }

    notify(userTo, description, type) {
      var diagNotify = this.createDialog("NOTIFY");
      diagNotify.notify(userTo + "@" + this.publicAddress, description, type);
      return diagNotify;
    }

    send(data) {
      this.logger(data, "INFO", "SEND");
      this.fire("onSend", data);
      this.transport.send(data);
    }

    bye(callId) {
      for (let dialog in this.dialogs) {
        if (callId) {
          if (this.dialogs[dialog].callId === callId && this.dialogs[dialog].method !== "REGISTER" && this.dialogs[dialog].status === this.dialogs[dialog].statusCode.ESTABLISHED) {
            this.dialogs[dialog].bye();
            break;
          }
        } else {
          this.dialogs[dialog].bye();
        }
      }
    }
  };

  stage.io.protocols.sip = SIP;
  return SIP;
};