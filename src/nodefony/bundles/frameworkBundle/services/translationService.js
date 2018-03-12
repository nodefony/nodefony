let translate = {};
let langs = [];
const reg = /^(..){1}_?(..)?$/;

/*
 *
 *
 *	PULGIN READER
 *
 *
 */
const pluginReader = function () {
  // TODO
  let getObjectTransXML = function () {};
  let getObjectTransJSON = function (file, bundle, callback, parser) {
    if (parser) {
      file = this.render(file, parser.data, parser.options);
    }
    if (callback) {
      callback(JSON.parse(file));
    }
  };
  let getObjectTransYml = function (file, bundle, callback, parser) {
    if (parser) {
      file = this.render(file, parser.data, parser.options);
    }
    if (callback) {
      callback(yaml.load(file));
    }
  };
  return {
    xml: getObjectTransXML,
    json: getObjectTransJSON,
    yml: getObjectTransYml,
    xliff: null
  };
}();

const reader = function (service) {
  let func = service.get("reader").loadPlugin("translating", pluginReader);
  return function (result, bundle, locale, domain) {
    return func(result, bundle, service.nodeReader.bind(service, locale, domain));
  };
};

const Translation = class Translation extends nodefony.Service {

  constructor(context, service) {
    super("transaltion", context.container, context.notificationsCenter);
    this.context = context;
    this.service = service;
    this.setParameters("translate", translate);
    this.defaultDomain = service.defaultDomain;
    this.defaultLocale = service.defaultLocale;
    this.langs = langs;
  }

  trans(value, args) {
    let str = null;
    try {
      str = this.getParameters("translate." + this.defaultLocale + "." + this.defaultDomain + "." + value) || value;
      if (args) {
        if (args[1]) {
          this.trans_default_domain(args[1]);
        }
        if (args[0]) {
          for (let ele in args[0]) {
            str = str.replace(ele, args[0][ele]);
          }
        }
      }
    } catch (e) {
      this.logger(e, "ERROR");
      return value;
    }
    return str;
  }

  getLangs() {
    return this.langs;
  }

  getLocale() {
    return this.defaultLocale;
  }

  trans_default_domain(domain) {
    this.defaultDomain = domain;
  }

  getTransDefaultDomain() {
    return this.defaultDomain;
  }

  getLang() {
    let Lang = null;
    let query = this.context.request.query;
    if (!this.context.session) {
      if (query) {
        Lang = query.lang;
        if (Lang) {
          this.defaultLocale = Lang;
        }
      }
    } else {
      if (query) {
        let queryGetlang = query.lang;
        if (this.context.user) {
          if (queryGetlang) {
            Lang = queryGetlang;
          } else {
            Lang = this.context.session.get("lang") ||  this.context.user.lang;
          }
        } else {
          Lang = queryGetlang || this.context.session.get("lang");
        }
      }
    }
    let res = reg.exec(Lang ||  this.defaultLocale);
    if (res) {
      if (res[2]) {
        this.defaultLocale = res[0];
      } else {
        this.defaultLocale = res[1] + "_" + res[1];
      }
    }
    if (this.context.session) {
      this.context.session.set("lang", this.defaultLocale);
    }
    if (!this.service.getParameters("translate." + this.defaultLocale)) {
      this.service.getFileLocale(this.defaultLocale);
    } else {
      if (!this.service.getParameters("translate." + this.defaultLocale + "." + this.defaultDomain)) {
        this.service.getFileLocale(this.defaultLocale);
      }
    }
    return this.defaultLocale;
  }
  handle() {
    this.service.engineTemplate.extendFilter("trans", this.trans.bind(this));
    return this.getLang();
  }
};

module.exports = class translation extends nodefony.Service {

  constructor(container) {
    super("I18N", container, container.get("notificationsCenter"));
    this.defaultLocale = this.getParameters("kernel.system.locale");
    this.engineTemplate = this.get("templating");
    this.setParameters("translate", translate);
    this.defaultDomain = "messages";
    this.reader = reader(this);
  }

  boot() {
    this.listen(this, "onBoot", () => {
      let dl = this.getParameters("bundles.App").App.locale;
      if (dl) {
        this.defaultLocale = dl;
      }
      this.getFileLocale(dl);
      this.logger("default Local APPLICATION ==> " + this.defaultLocale, "DEBUG");

      this.engineTemplate.extendFunction("getLangs", this.getLangs.bind(this));
      this.getConfigLangs(this.getParameters("bundles.App.lang"));
    });
    translate[this.defaultLocale] = {};
  }

  getConfigLangs(config) {
    for (let ele in config) {
      langs.push({
        name: config[ele],
        value: ele
      });
    }
    return langs;
  }
  getLangs() {
    return this.langs;
  }

  nodeReader(locale, domain, value) {
    if (locale) {
      if (!translate[locale]) {
        translate[locale] = {}; //nodefony.extend(true, {}, translate[this.defaultLocale]);
      }
    }
    if (domain) {
      if (!translate[locale][domain]) {
        translate[locale][domain] = nodefony.extend(true, {}, translate[this.defaultLocale][domain]);
      }
      nodefony.extend(true, translate[locale][domain], value);
    } else {
      nodefony.extend(true, translate[locale], value);
    }
  }
  createTranslation(context) {
    return new Translation(context, this);
  }
  getFileLocale(locale) {
    for (let bundle in this.kernel.bundles) {
      this.kernel.bundles[bundle].registerI18n(locale);
    }
  }
  getLocale() {
    return this.defaultLocale;
  }
};