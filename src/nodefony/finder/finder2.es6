/*
 *  CLASS Result
 *
 */
const fsPromises = require('fs').promises;
const defaultSettings = {
  recurse: false,
  depth: 10,
  seeHidden: false,
  match: null,
  exclude: null,
  excludeFile: null,
  excludeDir: null,
  followSymLink: false
};

const checkExclude = function (info, options) {
  let match = null;
  let test = (options.exclude || options.excludeDir || options.excludeFile);
  if (!test) {
    return false;
  }
  if (options.exclude) {
    match = info.matchName(options.exclude);
    if (match) {
      return true;
    }
  }
  if (options.excludeDir) {
    if (info.isDirectory()) {
      match = info.matchName(options.excludeDir);
      if (match) {
        return true;
      }
    }
  }
  if (options.excludeFile) {
    if (info.isFile()) {
      match = info.matchName(options.excludeFile);
      if (match) {
        return true;
      }
    }
  }
  return false;
};

const checkMatch = function (info, options, result) {
  let match = false;
  let rec = false;
  let test = (options.matchFile || options.matchDIr || options.match);
  if (!test) {
    result.push(info);
    this.totals[info.type]++;
    this.fire("on" + info.type, info, this);
    return true;
  }
  if (options.matchDIr) {
    if (info.isDirectory()) {
      if (info.matchName(options.matchDIr)) {
        match = true;
      } else {
        return false;
      }
    }
  }
  if (options.matchFile) {
    if (info.isFile()) {
      if (info.matchName(options.matchFile)) {
        match = true;
      } else {
        match = false;
      }
    }
  }
  if (options.match) {
    let res = info.matchName(options.match);
    //console.log("match ", info.name, res)
    if (res) {
      match = true;
    } else {
      match = false;
      rec = info.type;
    }
  }
  //state match
  if (match) {
    result.push(info);
    this.totals[info.type]++;
    this.fire("on" + info.type, info, this);
    return true;
  } else {
    switch (rec) {
      // false match
    case "Directory":
    case "symbolicLink":
      result.push(info);
      this.totals[info.type]++;
      this.fire("on" + info.type, info, this);
      return true;
    default:
      // false file
      //console.log("bypass ", info.name)
      return false;
    }
  }
};

const parser = function (file, result = new nodefony.FileResult(), options = {}, depth = null, parent = null) {
  return new Promise(async (resolve, reject) => {
    if (depth === 0) {
      return resolve(result);
    }
    let res = null;
    if (parent) {
      parent.children = result;
    }
    try {
      if (file.type !== "symbolicLink") {
        res = await fsPromises.readdir(file.path, {
            encoding: 'utf8',
            withFileTypes: false
          })
          .catch(e => {
            return reject(e);
          });
      } else {
        if (options.followSymLink) {
          //console.log("symbolicLink First", file.name)
          res = await fsPromises.readlink(file.path)
            .catch((e) => {
              return reject(e);
            });
        }
      }
      //console.log(res)
      if (res && res.length) {
        for (let i = 0; i < res.length; i++) {
          const ret = path.resolve(file.path, res[i]);
          const info = new nodefony.File(ret, parent);
          // hidden file
          const hidden = info.isHidden();
          if (hidden) {
            if (!options.seeHidden) {
              continue;
            }
          }
          if (checkExclude(info, options)) {
            //console.log("EXCLUDEEEEE", info.name)
            continue;
          }
          let symLink = null;
          if (info.type === "symbolicLink" && options.followSymLink) {
            try {
              const read = path.resolve(info.dirName, await fsPromises.readlink(info.path));
              symLink = new nodefony.File(read, info);
            } catch (e) {
              this.fire("onError", e, this);
              continue;
            }
          }
          const match = checkMatch.call(this, info, options, result);
          //console.log("match state", !match, info.name, info.type)
          if (!match) {
            continue;
          }

          if (hidden) {
            this.totals.hidden++;
            this.fire("onHidden", info, this);
          }
          //console.log("PASSSS ", info.name, info.type)
          if (info.type === "File") {
            continue;
          }
          // recurse
          if (!options.recurse) {
            continue;
          }
          //console.log("RECCCCCC", info.type, info.name)
          switch (info.type) {
          case "Directory":
            //info.children = await parser.call(this, info, undefined, options, depth - 1, info);
            await parser.call(this, info, undefined, options, depth - 1, info);
            break;
          case "symbolicLink":
            if (symLink) {
              if (symLink.isDirectory()) {
                //info.children = await parser.call(this, symLink, undefined, options, depth - 1, info);
                await parser.call(this, symLink, undefined, options, depth - 1, info);
              }
            }
            break;
          }
        }
      }
      //console.log("resolve ", file.name, result.length)
      return resolve(result);
    } catch (e) {
      this.fire("onError", e);
      return reject(e);
    }
  });
};

class Finder extends nodefony.Events {

  constructor(settings) {
    super(settings);
    this.settings = nodefony.extend({}, defaultSettings, settings);
    this.totals = {
      Directory: 0,
      File: 0,
      BlockDevice: 0,
      CharacterDevice: 0,
      symbolicLink: 0,
      Fifo: 0,
      Socket: 0,
      hidden: 0
    };
  }

  clean() {
    this.removeAllListeners();
    for (let total in this.totals) {
      this.totals[total] = 0;
    }
  }

  ckeckPath(Path) {
    const type = nodefony.typeOf(Path);
    let result = new nodefony.FileResult();
    switch (true) {
    case type === "string":
      try {
        result.push(new nodefony.File(Path));
        return result;
      } catch (e) {
        throw e;
      }
      break;
    case type === "array":
      for (let i = 0; i < Path.length; i++) {
        try {
          result.push(new nodefony.File(Path[i]));
        } catch (e) {
          throw e;
        }
      }
      return result;
    case Path instanceof nodefony.fileClass:
      try {
        result.push(new nodefony.File(Path.path));
        return result;
      } catch (e) {
        throw e;
      }
      break;
    default:
      throw new Error(`Bad Path type: ${type} Accept only String, Array or fileClass`);
    }
  }

  async in(Path, settings = {}) {
    let result = null;
    try {
      result = this.ckeckPath(Path);
      this.settingsToListen(settings);
      let options = nodefony.extend({}, this.settings, settings);
      for (let i = 0; i < result.length; i++) {
        await parser.call(this, result[i], undefined, options, options.depth, result[i]);
      }
    } catch (e) {
      this.fire("onError", e);
      throw e;
    }
    this.fire("onFinish", result, this.totals, this);
    this.clean();
    return result;
  }
}

module.exports = Finder;
