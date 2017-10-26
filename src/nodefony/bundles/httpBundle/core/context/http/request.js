const QS = require('qs');
const formidable = require("formidable");

module.exports = nodefony.register("Request", function () {

  // PHP LIKE
  const reg = /(.*)[\[][\]]$/;

  let settingsXml = {};
  /*let parserRequestBody = function () {
      let result = Buffer.isEncoding(this.charset);
      if (!result) {
          throw new Error("Encoding  error charset :  " + this.charset);
      }
      switch (this.request.method) {
      case "POST":
      case "PUT":
      case "DELETE":
          switch (this.contentType) {
          case "application/json":
          case "text/json":
              this.queryPost = JSON.parse(this.body.toString(this.charset));
              this.logger(" " + this.contentType + "   BUFFER SIZE : " + this.body.length, "DEBUG");
              break;
          case "application/xml":
          case "text/xml":
              let Parser = new xmlParser(settingsXml);
              Parser.parseString(this.body.toString(this.charset), (err, result) => {
                  if (err) {
                      throw err;
                  }
                  this.queryPost = result;
              });
              this.logger(" " + this.contentType + "   BUFFER SIZE : " + this.body.length, "DEBUG");
              break;
          case "multipart/alternative":
          case "multipart/related":
          case "multipart/mixed":
          case "multipart/form-data":
              let res = new nodefony.io.MultipartParser(this);
              this.queryPost = res.post;
              let queryFile = res.file;
              if (Object.keys(queryFile).length) {
                  let service = this.context.get("upload");
                  for (let file in queryFile) {
                      this.queryFile[file] = service.createUploadFile(this, queryFile[file]);
                  }
              }
              this.logger(" " + this.contentType + "   BUFFER SIZE : " + this.body.length, "DEBUG");
              //nodefony.extend( this.query, this.queryFile);
              break;
          case "application/x-www-form-urlencoded":
              this.queryPost = QS.parse(this.body.toString(this.charset));
              this.logger(" " + this.contentType + "   BUFFER SIZE : " + this.body.length, "DEBUG");
              break;
          default:
              this.queryPost = this.body.toString(this.charset);
              this.logger("Request content-type : " + this.contentType + " unknown. You must use a parser in controller to read :  " + this.contentType + " data : " + this.queryPost, "WARNING");
          }
          break;
      }
  };*/

  const acceptParser = function (acc) {
    if (!acc) {
      return [{
        type: new RegExp(".*"),
        subtype: new RegExp(".*")
      }];
    }
    let obj = {};
    try {
      let types = acc.split(",");
      for (let i = 0; i < types.length; i++) {
        let type = types[i].split(";");
        let mine = type.shift();
        let dec = mine.split("/");
        let ele1 = dec.shift();
        let ele2 = dec.shift();
        obj[mine] = {
          type: new RegExp(ele1 === "*" ? ".*" : ele1),
          subtype: new RegExp(ele2 === "*" ? ".*" : ele2)
        };
        for (let j = 0; j < type.length; j++) {
          let params = type[j].split("=");
          let name = params.shift();
          obj[mine][name] = params.shift();
        }
      }
      // sort
      let tab = [];
      let qvalue = [];
      for (let ele in obj) {
        let line = obj[ele];
        if (line.q) {
          qvalue.push(obj[ele]);
        } else {
          tab.push(obj[ele]);
        }
      }
      if (qvalue.length) {
        return tab.concat(qvalue.sort((a, b) => {
          if (a.q > b.q) {
            return -1;
          }
          if (a.q < b.q) {
            return 1;
          }
          return 0;
        }));
      }
      return tab;
    } catch (e) {
      throw e;
    }
  };

  const parse = {
    POST: true,
    PUT: true,
    DELETE: true
  };

  const Request = class Request {

    constructor(request, context) {
      this.context = context;
      this.request = request;
      this.headers = request.headers;
      this.method = this.getMethod();
      this.host = this.getHost();
      this.hostname = this.getHostName(this.host);
      this.sUrl = this.getFullUrl(request);
      this.url = this.getUrl(this.sUrl);
      if (this.url.search) {
        this.url.query = QS.parse(this.url.search.replace(/^\?/, ""));
      } else {
        this.url.query = {};
      }
      this.queryPost = {};
      this.queryFile = [];
      this.queryGet = this.url.query;
      this.query = this.url.query;
      try {
        this.accept = acceptParser(this.headers.accept);
        this.acceptHtml = this.accepts("html");
      } catch (e) {
        this.logger(e, "WARNING");
      }
      this.rawContentType = {};
      this.contentType = this.getContentType(this.request);
      this.charset = this.getCharset(this.request);
      this.domain = this.getDomain();
      this.remoteAddress = this.getRemoteAddress();
      this.data = [];
      this.dataSize = 0;
      this.request.on('data', (data) => {
        //this.data.push(data);
        this.dataSize += data.length;
      });
      try {
        if (this.method in parse) {
          this.parserRequest();
        } else {
          this.request.on("end", () => {
            this.context.fire("onRequestEnd", this);
          });
        }
      } catch (error) {
        this.request.on("end", () => {
          this.context.fire("onError", this.context.container, error);
        });
      }
    }

    createFileUpload(name, file, maxSize) {
      if (file.size > maxSize) {
        throw new Error('maxFileSize exceeded, received ' + file.size + ' bytes of file data for : ' + file.name);
      }
      let fileUpload = this.context.uploadService.createUploadFile(file);
      let index = this.queryFile.push(fileUpload);
      name = name || file.name;
      if (name !== "null" || "undefined") {
        this.queryFile[name] = this.queryFile[index - 1];
      }
      return fileUpload;
    }

    parserRequest() {
      let opt = nodefony.extend(this.context.requestSettings, {
        encoding: this.charset
      });
      this.formidable = new formidable.IncomingForm(opt);

      this.formidable.parse(this.request, (err, fields, files) => {
        if (err) {
          this.context.fire("onError", this.context.container, err);
          return err;
        }
        this.queryPost = fields;
        try {
          this.query = nodefony.extend({}, this.query, this.queryPost);
        } catch (err) {
          this.context.fire("onError", this.context.container, err);
          return err;
        }
        if (Object.keys(files).length) {
          for (let file in files) {
            try {
              if (reg.exec(file)) {
                if (nodefony.isArray(files[file])) {
                  for (let multifiles in files[file]) {
                    this.createFileUpload(multifiles, files[file][multifiles], opt.maxFileSize);
                  }
                } else {
                  if (files[file].name) {
                    this.createFileUpload(file, files[file], opt.maxFileSize);
                  }
                }
              } else {
                if (nodefony.isArray(files[file])) {
                  for (let multifiles in files[file]) {
                    this.createFileUpload(multifiles, files[file][multifiles], opt.maxFileSize);
                  }
                } else {
                  this.createFileUpload(file, files[file], opt.maxFileSize);
                }
              }
            } catch (err) {
              this.context.fire("onError", this.context.container, err);
              return err;
            }
          }
        }
        this.context.fire("onRequestEnd", this);
      });
    }

    accepts(Type) {
      let parse = null;
      let subtype = "*";
      let type = "*";
      try {
        if (Type) {
          parse = Type.split("/");
        }
        if (parse) {
          switch (parse.length) {
          case 1:
            subtype = parse.shift();
            break;
          case 2:
            type = parse.shift();
            subtype = parse.shift();
            break;
          default:
            throw new Error("request accepts method bad type format");
          }
        }
        for (let i = 0; i < this.accept.length; i++) {
          let line = this.accept[i];
          if ((type === "*" || line.type.test(type)) && (subtype === "*" || line.subtype.test(subtype))) {
            return true;
          }
          continue;
        }
        return false;
      } catch (e) {
        throw e;
      }
    }

    getHost() {
      return this.request.headers.host;
    }

    getHostName(host) {
      if (this.url && this.url.hostname) {
        return this.url.hostname;
      }
      if (host) {
        return host.split(":")[0];
      }
      return this.getHost().split(":")[0];
    }

    getUserAgent() {
      return this.request.headers['user-agent'];
    }

    getMethod() {
      return this.request.method;
    }

    clean() {
      this.data = null;
      delete this.data;
      this.body = null;
      delete this.body;
      this.queryPost = null;
      delete this.queryPost;
      this.queryFile = null;
      delete this.queryFile;
      this.queryGet = null;
      delete this.queryGet;
      this.query = null;
      delete this.query;
      this.request = null;
      delete this.request;
      this.accept = null;
      delete this.accept;
      //this.container = null ;
      //delete this.container ;
      //super.clean();
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = this.context.type + " REQUEST ";
      }
      return this.context.logger(pci, severity, msgid, msg);
    }

    getContentType(request) {
      if (request.headers["content-type"]) {
        let tab = request.headers["content-type"].split(";");
        if (tab.length > 1) {
          for (let i = 1; i < tab.length; i++) {
            if (typeof tab[i] === "string") {
              let ele = tab[i].split("=");
              let key = ele[0].replace(" ", "").toLowerCase();
              this.rawContentType[key] = ele[1];
            } else {
              continue;
            }
          }
        }
        this.extentionContentType = request.headers["content-type"];
        return tab[0];
      }
      return null;
    }

    getCharset() {
      if (this.rawContentType.charset) {
        return this.rawContentType.charset;
      }
      return "utf8";
    }

    getDomain() {
      return this.getHostName();
      //return this.host.split(":")[0];
    }

    getRemoteAddress() {
      // proxy mode
      if (this.headers && this.headers['x-forwarded-for']) {
        return this.headers['x-forwarded-for'];
      }
      if (this.request.connection && this.request.connection.remoteAddress) {
        return this.request.connection.remoteAddress;
      }
      if (this.request.socket && this.request.socket.remoteAddress) {
        return this.request.socket.remoteAddress;
      }
      if (this.request.connection && this.request.connection.socket && this.request.connection.socket.remoteAddress) {
        return this.request.connection.socket.remoteAddress;
      }
      return null;
    }

    setUrl(Url) {
      this.url = this.getUrl(Url);
    }

    getUrl(sUrl, query) {
      return url.parse(sUrl, query);
    }

    getFullUrl(request) {
      // proxy mode
      if (this.headers && this.headers['x-forwarded-for']) {
        return this.headers['x-forwarded-proto'] + "://" + this.host + request.url;
      }
      if (request.connection.encrypted) {
        return 'https://' + this.host + request.url;
      } else {
        return 'http://' + this.host + request.url;
      }
    }

    isAjax() {
      if (this.headers['x-requested-with']) {
        return ('xmlhttprequest' === this.headers['x-requested-with'].toLowerCase());
      }
      return false;
    }
  };

  return Request;
});
