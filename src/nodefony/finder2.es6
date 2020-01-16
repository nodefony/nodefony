/*
 *  CLASS Result
 *
 */
class Result extends nodefony.Result {

  constructor(res) {
    super(res);
  }

  sortByName() {
    let res = this.sort((a, b) => {
      if (a.name.toString() > b.name.toString()) {
        return 1;
      }
      if (a.name.toString() < b.name.toString()) {
        return -1;
      }
      return 0;
    });
    if (res) {
      return new Result(res);
    }
    return this;
  }

  sortByType() {
    let res = this.sort((a, b) => {
      if (a.type.toString() > b.type.toString()) {
        return 1;
      }
      if (a.type.toString() < b.type.toString()) {
        return -1;
      }
      return 0;
    });
    if (res) {
      return new Result(res);
    }
    return this;
  }


}

class Json extends nodefony.fileClass {

  constructor(path, parent = null) {
    super(path);
    this.parent = parent;
    /*if (this.parent !== null && this.parent.childrens) {
      this.parent.childrens.push(this);
    }*/
    this.childrens = [];
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

const readdir = function(path, options) {
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

const readlink = function(path, options) {
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

const getRealPath = function(path, options){
  return new Promise((resolve, reject) => {
    try {
      fs.realpath(path, options, (err, linkString) => {
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


const checkHidden = function(file, settings) {
  if (!settings.seeHidden) {
    if (file.isHidden()) {
      return true;
    }
  }
  return false;
};

const checkExclude = function(file, settings) {
  if ( settings.exclude instanceof RegExp ){
    return settings.exclude.test(file.name);
  }
  if (file.matchName(settings.exclude)) {
    return true;
  }
  if (file.matchType(settings.exclude)) {
    return true;
  }
  return false;
};

const checkMatch = function(file, settings) {
  if (settings.match) {
    if (file.matchName(settings.match)) {
      return true;
    } else {
      if (file.matchType(settings.match)) {
        return settings.match;
      }
      return false;
    }
  }
  return true;
};






const regSlash = /^(.*)\/$/g;
const recFind = function(file, result = new Result(), options = {}, depth = null, parent = null) {
  //console.log(file.type , file.name, depth)
  return new Promise(async (resolve, reject) => {
    let res = null;
    if ( parent){
      parent.childrens = result ;
    }
    try {
      res = await readdir(file.path, {
        encoding: 'utf8',
        withFileTypes: false
      }).catch(async (e) => {
        if (file.type === "symbolicLink" && options.followSymLink && depth - 1 !== 0) {
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
          let info = new this.wrapper(ret, parent);
          let match = true;
          // hidden file
          if (!options.seeHidden) {
            if (checkHidden.call(this, info, options)) {
              /*if (parent && parent.children) {
                parent.childrens.pop();
              }*/
              continue;
            }
          }
          // hidden file
          if (options.exclude) {
            if (checkExclude.call(this, info, options)) {
              /*if (parent && parent.children) {
                parent.children.pop();
              }*/
              continue;
            }
          }
          if (options.match) {
            match = checkMatch.call(this, info, options);
          }
          if (match) {
            result.push(info);
            this.fire("on" + info.type, info, this);
          }
          // recurse
          switch (info.type) {
            case "Directory":
              if (options.recurse && (depth - 1) !== 0) {
                //console.log("before enter ", info.name, depth)
                info.childrens = await recFind.call(this, info, undefined, options, depth - 1, info);
                //depth--;
                //console.log("after ", info.name, depth)
                continue;
              }
              break;
            case "symbolicLink":
              if (options.followSymLink && depth - 1 !== 0) {
                //console.log(options.followSymLink, depth)
                let obj = null ;
                try{
                  obj = new this.wrapper(await getRealPath(info.path), info);
                }catch(e){
                  continue;
                }
                if (obj.isDirectory()) {
                  info.childrens = await recFind.call(this, obj, undefined, options, depth - 1, info);
                  continue;
                }
              }
              break;
          }
        }
        return resolve(result);
      }
      return resolve(result);
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
        try {
          this.paths = this.in(this.settings.path);
        } catch (e) {
          throw e;
        }
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

  async find(Path, settings = {}) {
    let options = null;
    //let paths = null;
    let result = null ;//new Result();
    let wrapper = this.wrapper;
    let depth = settings.depth || this.settings.depth;
    if ( ! settings.exclude){
      if ( this.settings.exclude){
        settings.exclude = this.settings.exclude ;
      }
    }

    switch (typeof Path) {
      case "string":
        result = this.in(Path);
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
        result = this.in(Path.path);
        break;
    }
    if (options.json) {
      wrapper = Json;
    }
    try {
      for (let i = 0; i < result.length; i++) {
         await recFind.call(this, result[i], undefined, options, depth, result[i])
          .catch((e) => {
            this.fire("onError", e);
            throw e;
          });
        //result.push(res);
      }
    } catch (e) {
      this.fire("onError", e);
      throw e;
    }
    this.fire("onFinish", result);
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
