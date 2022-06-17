//var request = require('request');
const cheerio = require('cheerio');
const http = require('http');
const https = require('https');
const async = require("async");

const makeRequestHttp = function (link, context, callback) {
  this.log("REQUEST : " + link, "DEBUG");
  let myurl = url.parse(link);
  // cookie session
  let headers = {};
  if (context.session) {
    headers.Cookie = context.session.name + "=" + context.session.id;
  }
  var options = {
    hostname: myurl.hostname,
    port: myurl.port,
    path: myurl.path,
    method: 'GET',
    headers: headers
  };
  let wrapper = http.request;
  //console.log(options)
  let keepAliveAgent = null;
  // https
  if (myurl.protocol === "https:") {
    // keepalive if multiple request in same socket
    keepAliveAgent = new https.Agent({
      keepAlive: true
    });
    // certificat
    nodefony.extend(options, {
      key: this.serverHttps.key,
      cert: this.serverHttps.cert,
      rejectUnauthorized: false,
      requestCert: true,
      agent: keepAliveAgent
    });
    wrapper = https.request;
  } else {
    // keepalive
    keepAliveAgent = new http.Agent({
      keepAlive: true
    });
    options.agent = keepAliveAgent;
  }
  const req = wrapper(options, (res) => {
    var bodyRaw = "";
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      //this.log( chunk, "DEBUG");
      bodyRaw += chunk;
    });
    res.on('end', () => {
      parseLink.call(this, link, bodyRaw, callback);
    });
  });
  req.on('error', (e) => {
    this.log('Problem with request: ' + e.message, "ERROR");
  });
  req.end();
};

let parseLink = function (crawlUrl, body, callback) {
  let pageObject = {};
  pageObject.links = [];

  if (/^\//.test(crawlUrl)) {
    pageObject.url = this.protocol + this.base + crawlUrl;
  } else {
    pageObject.url = crawlUrl;
  }
  let $ = cheerio.load(body, {
    ignoreWhitespace: true
  });
  pageObject.title = $('title').text();
  pageObject.selector = $;

  // find link
  $('a').each((i, elem) => {
    //console.log(elem.attribs.href)
    if (elem.attribs.href === "#" || elem.attribs.href === "/") {
      return;
    }
    let href = null;
    if (/^\//.test(elem.attribs.href)) {
      href = url.parse(this.protocol + this.base + elem.attribs.href);
    } else {
      if (elem.attribs.href) {
        href = url.parse(elem.attribs.href);
      } else {
        href = null;
      }
    }
    if (href) {
      pageObject.links.push({
        linkText: $(elem).text(),
        linkUrl: href
      });
    }
  });
  callback(null, pageObject);
};

const myLoop = function (link, context, finish, recurse) {
  if (this.crawled[link]) {
    if (this.crawled[link].page) {
      finish(null, this.crawled);
      return;
    }
  }
  makeRequestHttp.call(this, link, context, (error, pageObject) => {
    if (error) {
      return;
    }
    this.crawled[pageObject.url] = [];
    this.crawled[pageObject.url].page = pageObject;
    async.eachSeries(pageObject.links, (item, cb) => {
      if (item.linkUrl) {
        // test if the url actually points to the same domain
        if (item.linkUrl.host === this.base) {
          if (!item.linkUrl.hash) {
            this.crawled[pageObject.url].push(item.linkUrl.href);
          }
        }
      }
      cb(null);
    }, (error) => {
      if (!error) {
        for (var i = 0; i < this.crawled[pageObject.url].length; i++) {
          //console.log( this.crawled[pageObject.url] )
          if (this.crawled[pageObject.url][i] in this.crawled) {
            continue;
          } else {
            recurse++;
            this.crawled[this.crawled[pageObject.url][i]] = [];
            myLoop.call(this, this.crawled[pageObject.url][i], context, () => {
              recurse--;
              if (recurse === 0) {
                //console.log("FINISH")
                finish(error, this.crawled);
              }
            }, 0);
          }
        }
      }
      if (recurse === 0) {
        //console.log( "FINISH 2" )
        finish(error, this.crawled);
      }
    });
  });
};

module.exports = class webCrawler extends nodefony.Service {

  constructor(container, kernel) {
    super("WEBCRAWLER", container, container.get("notificationsCenter"));
    this.kernel = kernel;
    this.crawled = {};
    this.elastic = null;
    this.serverHttps = this.get("httpsServer");
    this.once( "onReady", () => {
      this.elastic = this.kernel.getBundle("documentation").elastic;
    });
  }

  siteAll(urlBase, search, context, callback) {
    var recurse = 0;
    var Link = url.parse(urlBase);
    this.base = Link.host;
    this.protocol = Link.protocol ? Link.protocol + "//" : 'http://';
    if (this.elastic) {
      myLoop.call(this, urlBase, context, function ( /*error, crawled*/ ) {});
    } else {
      myLoop.call(this, urlBase, context, (error, crawled) => {
        //console.log(crawled)
        var obj = {};
        try {
          for (var page in crawled) {

            if (crawled && crawled[page] && crawled[page].page && crawled[page].page.selector) {
              var text = crawled[page].page.selector("body").text();
              if (!text) {
                continue;
              }
              //var index = text.indexOf(search) ;
              let reg = new RegExp(search, 'gi');
              let index = text.search(reg);
              if (index !== -1) {
                obj[crawled[page].page.url] = {
                  text: "..." + text.substring(index - 100, index + 100) + "...",
                  title: crawled[page].page.title
                };
              }
            }
          }
        } catch (e) {
          this.log(e, "ERROR");
        }
        callback(obj);
      }, recurse);
    }
  }
};
