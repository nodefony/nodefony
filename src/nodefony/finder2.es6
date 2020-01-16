/*
 *  CLASS Result
 *
 */
class Result extends nodefony.Result {

  constructor() {
    super();
  }
}

class Json extends nodefony.Result {

  constructor() {
    super();
  }
}


const defaultSettings = {
  path: null,
  sync: true,
  recurse: true,
  depth: -1,
  //onFinish: null,
  //onFile: null,
  seeHidden: false,
  match: null,
  exclude: null,
  followSymLink: false,
  json: false
};

const readdir = function (path, options) {
  return new Promise((resolve, reject) => {
    try {
      fs.readdir(path, options, (err, files) => {
        if (err) {
          return reject(err);
        }
        return resolve(files);
      });
    } catch (e) {
      return reject(e);
    }
  });
};

const readlink = function (path, options) {
  return new Promise((resolve, reject) => {
    try {
      fs.readlink(path, options, (err, linkString) => {
        if (err) {
          return reject(err);
        }
        return resolve(linkString);
      });
    } catch (e) {
      return reject(e);
    }
  });
};


const regSlash = /^(.*)\/$/g;
const recFind = function (file, result = new Result(), options = {}, parent = null) {
  return new Promise(async (resolve, reject) => {
    let res = null;
    try {
      res = await readdir(file.path, {
        encoding: 'utf8',
        withFileTypes: false
      }).catch(async (e) => {
        if (file.type === "symbolicLink" && options.followSymLink && options.depth - 1 !== 0) {
          res = await readlink(file.path)
            .catch((e) => {
              return reject(e);
            });
        } else {
          return reject(e);
        }
      });
      if (res && res.length) {
        //let ret = regSlash.exec(file.path);
        for (let i = 0; i < res.length; i++) {
          let ret = path.resolve(file.path, res[i]);
          result.push(new this.wrapper(ret));
        }
        return resolve(result);
      }
    } catch (e) {
      return reject(e);
    }
  });

};


class Finder extends nodefony.Events {
  constructor(settings) {
      super(settings);
      this.paths = [];
      this.settings = nodefony.extend({}, defaultSettings, settings);
      this.wrapper = nodefony.fileClass;
      if (this.settings.json) {
        this.wrapper = Json;
      }
      if (this.settings.paths) {
        this.paths = this.in(this.settings.path);
      }
    }

    in (Path) {
      const type = nodefony.typeOf(Path);
      let tab = [];
      switch (true) {
      case type === "string":
        try {
          tab.push(new this.wrapper(Path, null));
          return tab;
        } catch (e) {
          throw e;
        }
        break;
      case type === "array":
        for (let i = 0; i < Path.length; i++) {
          try {
            tab.push(new this.wrapper(Path[i], null));
          } catch (e) {
            throw e;
          }
        }
        return tab;
      case Path instanceof nodefony.fileClass:
        try {
          tab.push(new this.wrapper(Path.path, null));
          return this;
        } catch (e) {
          throw e;
        }
        break;
      default:
        return tab;
      }
    }

  async find(Path, settings) {
    let options = null;
    let paths = null;
    let result = new Result();
    let wrapper = this.wrapper;

    switch (typeof Path) {
    case "string":
      paths = this.in(Path);
      if (!settings) {
        options = this.settings;
      } else {
        options = nodefony.extend({}, defaultSettings, settings);
      }
      break;
    case "object":
      if (!settings) {
        options = this.settings;
      } else {
        options = nodefony.extend({}, defaultSettings, Path);
      }
      paths = this.in(Path.path);
      break;
    }

    if (options.json) {
      wrapper = Json;
    }

    try {
      for (let i = 0; i < paths.length; i++) {
        await recFind.call(this, paths[i], result, options)
          .catch((e) => {
            console.log(e);
            this.fire("onError", e);
            throw e;
          });
      }
    } catch (e) {
      this.fire("onError", e);
      this.fire("onFinish", null);
      throw e;
    }
    this.fire("onFinish", null, result);
    return result;
  }

  files() {
    return this.find({
      match: "File"
    });
  }

  directories() {
    return this.find({
      match: "Directory"
    });
  }

}

nodefony.Finder2 = Finder;
module.exports = Finder;