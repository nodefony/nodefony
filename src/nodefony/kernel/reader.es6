const defaultSetting = {
  parserXml: {
    // explicitCharkey: true,
    explicitArray: true,
    explicitRoot: false,
    mergeAttrs: true
  },
  readFile: {
    encoding: "utf8"
  },
  twig: {
    "twig options": {
      async: false,
      cache: true
    },
    views: null
  },
  parse: false
};

const load = function (name, pathFile) {
  const mypath = pathFile;
  const ext = path.extname(pathFile);
  const basename = path.basename(pathFile);
  const plug = this.plugins[name];
  if (!plug) {
    this.log(`DROP FILE : ${mypath} NO PLUGIN FIND : ${name}`, "WARNING");
    return null;
  }
  const myName = Array.prototype.shift.call(arguments);
  const file = Array.prototype.shift.call(arguments);
  let txt = null;
  try {
    switch (ext) {
    case ".xml":
      txt = this.readFileSync(file);
      Array.prototype.unshift.call(arguments, txt);
      if (plug.xml) {
        return plug.xml.apply(this, arguments);
      }
      return this.pluginConfig.xml.apply(this, arguments);

      break;
    case ".json":
      txt = this.readFileSync(file);
      Array.prototype.unshift.call(arguments, txt);
      return plug.json.apply(this, arguments);
    case ".yml":
    case ".yaml":
      txt = this.readFileSync(file);
      Array.prototype.unshift.call(arguments, txt);
      if (plug.yml) {
        return plug.yml.apply(this, arguments);
      }
      return this.pluginConfig.yml.apply(this, arguments);

      break;
    case ".js":
    case ".es6":
    case ".mjs":
    case ".es7":
      Array.prototype.unshift.call(arguments, file);
      switch (true) {
      case new RegExp("^(.+)Controller.js$").test(basename):
        if (plug.annotations) {
          return plug.annotations.apply(this, arguments);
        }
        return this.pluginConfig.annotations.apply(this, arguments);

        break;
      default:
        if (plug.javascript) {
          return plug.javascript.apply(this, arguments);
        }
        return this.pluginConfig.javascript.apply(this, arguments);
      }
      break;
    default:
      this.log(`DROP FILE : ${mypath} PLUGIN ${myName} NO EXTENTION FIND : ${ext}`, "WARNING");
    }
  } catch (e) {
    throw e;
  }
  return null;
};

/**
 *  Reader node js
 *
 *  @class Reader
 *  @constructor
 *
 *  @example
 *    var container = new nodefony.Container();
 *    var reader = new nodefony.Reader(container, settings);
 *
 */
class Reader extends nodefony.Service {
  constructor (container, localSettings) {
    super("READER", container);
    this.settings = nodefony.extend(true, {}, defaultSetting, localSettings);
    this.plugins = {};
    this.container = container;
    this.xmlParser = new xmlParser(this.settings.parserXml);
    this.engine = require("twig");
    this.readConfig = this.loadPlugin("config", this.pluginConfig);
    this.loader = this.container.get("autoLoader");
    this.annotations = new nodefony.Annotations(container, this.notificationsCenter);
  }

  pluginConfig () {
    const json = function (file, bundle, callback, parser) {
      if (parser) {
        file = this.render(file, parser.data, parser.options);
      }
      try {
        const json = JSON.parse(file);
        if (callback) {
          callback(json);
        }
      } catch (e) {
        throw e;
      }
    };
    const yml = function (file, bundle, callback, parser) {
      if (parser) {
        file = this.render(file, parser.data, parser.options);
      }
      try {
        const json = yaml.load(file);
        if (callback) {
          callback(json);
        }
      } catch (e) {
        throw e;
      }
    };
    const xml = function (file, bundle, callback, parser) {
      if (parser) {
        file = this.render(file, parser.data, parser.options);
      }
      this.xmlParser.parseString(file, (error, node) => {
        if (error) {
          throw error;
        }
        if (callback) {
          callback(this.xmlToJson(node));
        }
      });
    };

    const javascript = function (file, bundle, parser, callback) {
      if (typeof bundle === "function") {
        callback = bundle;
      }
      if (typeof parser === "function") {
        callback = parser;
      }
      try {
        return callback(this.loader.load(file, true));
      } catch (e) {
        throw e;
      }
    };

    const annotations = function (file) {
      throw new Error(`Annotation is not defined for this file ${file}`);
    };

    return {
      xml,
      json,
      yml,
      javascript,
      annotations
    };
  }

  readFile (file, localSettings) {
    if (!file) {
      throw new Error("READE no file path in readFile");
    }
    return new Promise((resolve, reject) => {
      try {
        fs.readFile(file, nodefony.extend({}, this.settings.readFile, localSettings), (err, data) => {
          if (err) {
            return reject(err);
          }
          return resolve(data);
        });
      } catch (e) {
        this.log(e, "ERROR");
        return reject(e);
      }
    });
  }

  readFileSync (file, localSettings) {
    try {
      return fs.readFileSync(file, nodefony.extend({}, this.settings.readFile, localSettings));
    } catch (e) {
      this.log(e);
      throw e;
    }
  }

  /**
   *  @method render
   *
   */
  render (str, data) {
    return this.engine.twig({
      data: str
    }).render(data);
  }

  /**
   *  @method loadPlugin
   *
   */
  loadPlugin (name, plugin) {
    this.plugins[name] = plugin;
    const context = this;
    return function () {
      Array.prototype.unshift.call(arguments, name);
      return load.apply(context, arguments);
    };
  }

  /**
   *  @method xmlToJson
   *
   */
  xmlToJson (node) {
    const json = {};
    if (node instanceof Array) {
      for (let key = 0; key < node.length; key++) {
        let param = null;
        if (node[key] instanceof Object) {
          if (node[key].id) {
            json[node[key].id] = {};
            for (param in node[key]) {
              if (param !== "id") {
                if (node[key][param] instanceof Array) {
                  json[node[key].id][param] = node[key][param];
                  for (let elm = 0; elm < json[node[key].id][param].length; elm++) {
                    if (json[node[key].id][param][elm].key && json[node[key].id][param][elm]._) {
                      json[node[key].id][param][elm][json[node[key].id][param][elm].key] = json[node[key].id][param][elm]._;
                      delete json[node[key].id][param][elm].key;
                      delete json[node[key].id][param][elm]._;
                    }
                  }
                } else {
                  json[node[key].id][param] = this.xmlToJson(node[key][param]);
                }
              }
            }
          } else if (node[key].key && node[key]._) {
            json[node[key].key] = node[key]._;
          } else if (node[key].key && !node[key]._) {
            for (param in node[key]) {
              if (param !== "key") {
                json[node[key].key] = {};
                json[node[key].key][param] = this.xmlToJson(node[key][param]);
              }
            }
          } else {
            return node;
          }
        } else {
          return node;
        }
      }
      return json;
    } else if (node instanceof Object) {
      for (const mykey in node) {
        json[mykey] = this.xmlToJson(node[mykey]);
      }
      return json;
    }
    return node;

    return json;
  }
}

Reader.prototype.pluginConfig = Reader.prototype.pluginConfig();

nodefony.Reader = Reader;
module.exports = Reader;
