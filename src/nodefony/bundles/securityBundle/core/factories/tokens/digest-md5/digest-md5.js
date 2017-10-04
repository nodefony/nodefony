nodefony.register.call(nodefony.security.tokens, "Digest", function () {

  /*
   *
   *
   *	DIGEST MD5
   *
   */

  const settingsDigest = {
    private_key: "private_key",
    realm: "user@",
    max_time: 0
  };
  var lenghtTs = (new Date().getTime() + "").length;

  var reg = /^([^=]+)=(.+)$/;
  const parseAuthorization = function (str) {
    //console.log(str)
    let ret = str.replace(/Digest /g, "");
    ret = ret.replace(/"/g, "");
    ret = ret.replace(/ /g, "");
    let head = ret.split(",");
    //console.log(head)
    for (let i = 0; i < head.length; i++) {
      var res = reg.exec(head[i]);
      if (res && res[1]) {
        if (res[1] === "cnonce") {
          this[res[1]] = res[2];
        } else {
          this[res[1]] = res[2];
        }
        //console.log(this[res[1]])
      }
    }
  };


  const generateA1 = function (username, realm, password, nonce, cnonce) {
    let A1 = null;
    if (cnonce) {
      A1 = username + ":" + realm + ":" + password + ":" + nonce + ":" + cnonce;
    } else {
      A1 = username + ":" + realm + ":" + password; //+ ":" + nonce ;
    }
    let MD5 = crypto.createHash('md5');
    return MD5.update(A1).digest("hex");
  };


  const responseDigest = function (A1, nonce, noncecount, cnonce, qop, A2) {
    let res = "";
    if (qop === "auth" || qop === "auth-int") {
      res = A1 + ":" + nonce + ":" + noncecount + ":" + cnonce + ":" + qop + ":" + A2;
    } else {
      res = A1 + ":" + nonce + ":" + A2;
    }
    var MD5 = crypto.createHash('md5');
    return MD5.update(res).digest("hex");
  };

  const generateA2 = function (method, uri, entity_body, qop) {
    let A2 = "";
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
    var MD5 = crypto.createHash('md5');
    return MD5.update(A2).digest("hex");
  };

  const Digest = class Digest {

    constructor(request, response, options) {
      this.name = "Digest";
      if (!arguments.length) {
        return this.generatePasswd;
      }
      this.settings = nodefony.extend({}, settingsDigest, options);
      this.auth = false;
      this.authorization = request.headers.authorization || (request.query ? request.query.authorization : null);
      this.host = request.headers.host;
      this.secret = this.host + ":" + request.headers["user-agent"] + ":" + (request.headers.referer || request.remoteAddress);
      this.request = request;
      this.response = response;
      this.method = request.method;
    }

    generateNonce() {
      let ts = new Date().getTime();
      let SHA1 = crypto.createHash('sha1');
      return ts + SHA1.update(ts + ":" + this.secret + ":" + this.settings.private_key).digest("hex");
    }

    recalculateNonce() {
      var nonce = this.nonce.substring(lenghtTs);
      var ts = this.nonce.substring(0, lenghtTs);
      if (this.settings.max_time !== 0) {
        let tm = new Date().getTime();
        //var tmTimeout = parseInt(tm, 10);
        let tsTimeout = parseInt(ts, 10) + this.settings.max_time;
        if ((!this.auth) && tm > tsTimeout) {
          throw {
            status: 401,
            message: "Digest TIMEOUT"
          };
        }
      }
      let SHA1 = crypto.createHash('sha1');
      let res = SHA1.update(ts + ":" + this.secret + ":" + this.settings.private_key).digest("hex");
      return nonce === res;
    }


    /*recalculateResponse (A1){
    	var uri = this["digest-uri"] || this.uri ;
    	var A2 = generateA2(this.method, uri ,null,this.qop );
    	//var res = responseDigest(A1, this.nonce, this.nc, new Buffer(this.cnonce, 'base64').toString('ascii'), this.qop, A2) ;
    	var res = responseDigest(A1, this.nonce, this.nc, this.cnonce, this.qop, A2) ;
    	return res;
    };*/

    recalculateResponse(passwd) {
      var A1 = generateA1(this.username, this.settings.realm, passwd);
      var uri = this["digest-uri"] || this.uri;
      var A2 = generateA2(this.method, uri, null, this.qop);
      var res = responseDigest(A1, this.nonce, this.nc, this.cnonce, this.qop, A2);
      return res;
    }

    generateResponse() {
      this.nonce = this.generateNonce();
      let line = "";
      let obj = {
        nonce: '"' + this.nonce + '"',
        realm: this.settings.realm, //+this.host,
        qop: "auth"
      };
      let length = Object.keys(obj).length - 1;
      for (let ele in obj) {
        if (length) {
          line += ele + "=" + obj[ele] + ",";
        } else {
          line += ele + "=" + obj[ele];
        }
        length -= 1;
      }
      //return  '"'+new Buffer(line).toString('base64')+'"';
      return this.name + ' ' + line;
    }

    checkResponse(getUserPassword, callback) {
      try {
        parseAuthorization.call(this, this.authorization);
        let res = this.recalculateNonce();
        if (!res) {
          callback({
            status: 401,
            message: "Incorrect password. "
          }, null);
        }
        getUserPassword(this.username, (error, userHashToCompare) => {
          if (error) {
            callback(error, null);
            return;
          }
          //console.log(userHashToCompare)
          //console.log(this.response)
          res = this.recalculateResponse(userHashToCompare);
          //console.log(this.recalculateResponseA1(userHashToCompare) )
          if (res === this.response) {
            this.auth = true;
            return callback(null, true);
          } else {
            callback({
              status: 401,
              message: "Incorrect password. "
            }, null);
          }
        });
      } catch (e) {
        callback(e, null);
      }
    }

    generatePasswd(realm, username, passwd) {
      let Realm = realm || this.settings.realm; //+ host ;
      return generateA1(username, Realm, passwd);
    }
  };
  return Digest;
});
