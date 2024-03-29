// plugin Reader
const pluginReader = (function () {
  const importXmlConfig = function (file, prefix, callback, parser) {
    if (parser) {
      file = this.render(file, parser.data, parser.options);
    }
    let services = [];
    let parameters;

    this.xmlParser.parseString(file, (err, node) => {
      // console.log(require('util').inspect(node, {depth: null}));
      // console.log('\n\n');
      if (err) {
        this.log(`INJECTION xmlParser.parseString : ${err}`, "WARNING");
      }
      if (!node) {
        return node;
      }
      for (const key in node) {
        switch (key) {
        case "parameters":
          parameters = this.xmlToJson.call(this, node[key][0].parameter);
          break;
        case "services":
          services = this.xmlToJson.call(this, node[key][0].service);
          break;
        }
      }
      if (callback) {
        nomarlizeXmlJson.call(this, services, parameters, callback);
      }
    });
  };
  const nomarlizeXmlJson = function (services, parameters, callback) {
    for (const key in services) {
      for (const param in services[key]) {
        let values = null;
        switch (param) {
        case "argument":
          values = [];
          for (let elm = 0; elm < services[key][param].length; elm++) {
            if (services[key][param][elm].type && services[key][param][elm].id) {
              if (services[key][param][elm].type == "service") {
                values.push(`@${services[key][param][elm].id}`);
              }
            }
          }
          services[key].arguments = values;
          delete services[key][param];
          break;
        case "property":
          values = {};
          for (let elm = 0; elm < services[key][param].length; elm++) {
            if (services[key][param][elm].type && services[key][param][elm].id && services[key][param][elm].name) {
              if (services[key][param][elm].type == "service") {
                values[services[key][param][elm].name] = `@${services[key][param][elm].id}`;
              }
            }
          }
          services[key].properties = values;
          delete services[key][param];
          break;

        case "call":
          values = [];
          for (let elm = 0; elm < services[key][param].length; elm++) {
            const tab = [];
            for (const sparam in services[key][param][elm]) {
              switch (sparam) {
              case "method":
                tab[0] = services[key][param][elm][sparam];
                break;
              case "argument":
                const args = [];
                for (let selem = 0; selem < services[key][param][elm][sparam].length; selem++) {
                  if (services[key][param][elm][sparam][selem].type && services[key][param][elm][sparam][selem].id) {
                    if (services[key][param][elm][sparam][selem].type == "service") {
                      args.push(`@${services[key][param][elm][sparam][selem].id}`);
                    }
                  }
                }
                tab[1] = args;
                break;
              }
            }
            values.push(tab);
          }
          services[key].calls = values;
          delete services[key][param];
          break;
        case "scope":
          break;
        }
      }
    }
    if (callback) {
      renderParameters.call(this, callback, services, parameters);
    }
  };
  const renderParameters = function (callback, services, parameters) {
    if (parameters && Object.keys(parameters).length > 0 && typeof services === "object" && Object.keys(services).length > 0) {
      services = JSON.parse(this.render(JSON.stringify(services), parameters));
    }
    callback(services);
  };
  const getServicesXML = function (file, bundle, parser, callback) {
    importXmlConfig.call(this, file, "", callback, parser);
  };
  const getServicesJSON = function (file, bundle, parser, callback) {
    if (parser) {
      file = this.render(file, parser.data, parser.options);
    }
    const json = JSON.parse(file);
    if (callback) {
      renderParameters.call(this, callback, json.services, json.parameters);
    }
  };
  const getServicesYML = function (file, bundle, parser, callback) {
    if (parser) {
      file = this.render(file, parser.data, parser.options);
    }
    const json = yaml.load(file);
    if (callback) {
      renderParameters.call(this, callback, json.services, json.parameters);
    }
  };
  const javascript = function (file, bundle, parser, callback) {
    try {
      callback(this.loader.load(file, true));
    } catch (e) {
      throw e;
    }
  };
  return {
    xml: getServicesXML,
    json: getServicesJSON,
    yml: getServicesYML,
    javascript
  };
}());

const regService = new RegExp("^(.+)Service$");
const reg = /constructor\s*\((.*)\)/;

/**
 * CLASS INJECTOR
 */
class Injector extends nodefony.Service {
  constructor (name, service, container) {
    super(name, container);
    this.services = nodefony.services;
    try {
      this.getServiceClass(service);
      this.getServiceName(this.Class);
      this.classArgs = Injector.getArguments.call(this.Class);
      this.injections = this.findInjections(service.arguments);
      this.calls = this.getServiceCall(service);
      this.setParameters(`services.${this.name}`, {
        class: this.Class,
        name: this.name,
        scope: this.container.id,
        // className: this.className,
        // orderArguments: false,
        injections: service.arguments,
        calls: service.calls
      });
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  getServiceClass (service) {
    let Class = null;
    switch (nodefony.typeOf(service.class)) {
    case "array":
      Class = this.services[service.class[0]];
      break;
    case "function":
      Class = service.class;
      break;
    case "string":
      Class = this.services[service.class];
      break;
    default:
      throw new Error(`Service Name ${this.className} bad Class`);
    }
    if (!Class) {
      throw new Error(`Service Name ${this.className} class not found`);
    }
    return this.Class = Class;
  }

  getServiceName (Class) {
    let name = null;
    if (Class) {
      name = Class.name;
    } else {
      name = this.Class.name;
    }
    if (name) {
      const res = regService.exec(name);
      if (res) {
        return this.className = res[1];
      }
      return this.className = name;
    }
    return null;
  }

  getServiceCall (service) {
    let ele = null;
    if (service.calls) {
      ele = {};
      for (let i = 0; i < service.calls.length; i++) {
        let method = null;
        let args = null;
        switch (nodefony.typeOf(service.calls[i])) {
        case "array":
          method = service.calls[i][0];
          args = service.calls[i][1];
          break;
        case "object":
          method = service.calls[i].method;
          args = service.calls[i].arguments;
          break;
        default:
          this.log(service.calls, "ERROR");
          throw new Error("Service bad Calls config ");
        }
        ele[method] = this.findInjections(args);
      }
    }
    return ele;
  }

  async startService (restart) {
    try {
      const instance = await this.reflect();
      this.set(this.name, instance);
      if (this.calls) {
        for (const call in this.calls) {
          if (instance[call]) {
            await this.call(instance, instance[call], this.calls[call]);
          } else {
            this.log(`Method ${call} in service ${this.name} not found`, "ERROR");
            continue;
          }
        }
      }
      let log = "STARTED";
      if (restart) {
        log = "RESTARTED";
      }
      instance.log(log, "DEBUG");
      return instance;
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  async restartService () {
    this.log(`RESTART : ${this.name}`, "INFO");
    try {
      const service = this.get(this.name);
      if (service && service.close) {
        await service.close();
      }
      this.remove(this.name);
      return this.startService(true);
    } catch (e) {
      throw e;
    }
  }

  static getArguments () {
    const str = this.toString();
    let m = str.match(reg);
    if (m) {
      // case class
      m = m[1].replace(/\s/g, "");
      return m.split(",");
    }
    // case function
    m = str.match(new RegExp(`${this.name}\s*\((.*)\)`));
    if (m) {
      m = m[1].replace(/\s/g, "");
      return m.split(",");
    }
    throw new Error(`Service :${this.name} constructor not find`);
  }

  async reflect () {
    try {
      return await Reflect.construct(this.Class, this.injections);
    } catch (e) {
      this.log(`ERRROR SERVICE CLASS ${this.name} ${e.message}`, "ERROR");
      throw e;
    }
  }

  /* static reflectEs5(Class, args) {
    try {
      Array.prototype.unshift.call(args, Class);
      return new(Function.prototype.bind.apply(Class, args));
    } catch (e) {
      console.log("ERRROR SERVICE CLASS " + Class.name + " " + e.message, "ERROR");
      throw e;
    }
  }*/
  call (context, func, args) {
    try {
      func.apply(context, args);
    } catch (e) {
      throw e;
    }
  }

  findInjections (args) {
    const tab = [];
    if (args instanceof Array) {
      for (let elm = 0; elm < args.length; elm++) {
        switch (nodefony.typeOf(args[elm])) {
        case "string":
          let name = null;
          switch (args[elm][0]) {
          case "@":
            name = args[elm].substring(1);
            const service = this.get(name);
            if (service) {
              tab.push(service);
            } else {
              this.log(`Injection Service  : ${name} not found !!`, "ERROR");
            }
            break;
          default:
            tab.push(args[elm]);
          }
          break;
        default:
          tab.push(args[elm]);
        }
      }
    }
    return tab;
  }
}

/*
 *  CLASS INJECTION
 */
class Injection extends nodefony.Service {
  constructor (container) {
    super("injection", container, container.get("notificationsCenter"));
    this.injectors = {};

    this.reader = (function (context) {
      const func = context.get("reader").loadPlugin("injection", pluginReader);
      return function (result, bundle, parser) {
        return func(result, bundle, parser, context.nodeReader.bind(context));
      };
    }(this));
  }

  async nodeReader (jsonServices) {
    for (const lib in jsonServices) {
      if (jsonServices[lib].class) {
        if (jsonServices[lib].environment) {
          let inject = false;
          if (nodefony.typeOf(jsonServices[lib].environment) === "array") {
            let res = jsonServices[lib].environment.indexOf(process.env.NODE_ENV);
            if (res >= 0) {
              inject = true;
            }
            res = jsonServices[lib].environment.indexOf(this.kernel.type);
            if (res >= 0) {
              inject = true;
            }
          } else if (jsonServices[lib].environment === process.env.NODE_ENV) {
            inject = true;
          }
          if (!inject) {
            this.log(`environment : ${process.env.NODE_ENV} BYPASS SERVICE START : ${lib}`, "DEBUG");
            continue;
          }
        }
        try {
          const injector = this.setInjector(lib, jsonServices[lib]);
          await injector.startService();
        } catch (e) {
          throw e;
        }
      } else {
        this.log(new Error(`${lib} class not defined check services configurations`), "WARNING");
      }
    }
  }

  setInjector (name, service) {
    try {
      const injector = new Injector(name, service, this.container);
      if (this.kernel.environment === "dev" && this.kernel.type !== "CONSOLE") {
        if (this.injectors[name]) {
          this.log(`Service name : ${name} Already exist `, "WARNING");
        }
        this.injectors[name] = injector;
      }
      return injector;
    } catch (e) {
      throw e;
    }
  }

  getInjector (name) {
    if (this.injectors[name]) {
      return this.injectors[name];
    }
    return null;
  }
}

nodefony.Injection = Injection;
module.exports = Injection;
