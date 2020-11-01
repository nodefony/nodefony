const mkdirp = require('mkdirp');

nodefony.register.call(nodefony.session.storage, "files", function () {

  const finderGC = function (path, msMaxlifetime, context) {
    let nbSessionsDelete = 0;
    return new nodefony.finder({
      path: path,
      onFile: function (file) {
        var mtime = new Date(file.stats.mtime).getTime();
        if (mtime + msMaxlifetime < new Date().getTime()) {
          file.unlink();
          this.manager.log("FILES SESSIONS STORAGE GARBADGE COLLECTOR SESSION context : " + context + " ID : " + file.name + " DELETED");
          nbSessionsDelete++;
        }
      }.bind(this),
      onFinish: ( /*error, result*/ ) => {
        this.manager.log("FILES SESSIONS STORAGE context : " + (context || "default") + " GARBADGE COLLECTOR ==> " + nbSessionsDelete + " DELETED");
      }
    });
  };

  const fileSessionStorage = class fileSessionStorage {
    constructor(manager) {
      this.manager = manager;
      this.path = manager.settings.save_path;
      this.gc_maxlifetime = manager.settings.gc_maxlifetime;
      this.contextSessions = [];
    }

    start(id, contextSession) {
      let fileSession = null;
      let Path = null;
      if (contextSession) {
        Path = this.path + "/" + contextSession + "/" + id;
      } else {
        Path = this.path + "/default/" + id;
      }
      try {
        fileSession = new nodefony.fileClass(Path);
      } catch (e) {
        return new Promise((resolve /*, reject*/ ) => {
          return resolve({});
        });
      }
      try {
        return this.read(fileSession);
      } catch (e) {
        throw e;
      }
    }

    open(contextSession) {
      let Path = null;
      if (contextSession) {
        Path = this.path + "/" + contextSession;
        this.contextSessions.push(contextSession);
      } else {
        Path = this.path;
      }
      let res = fs.existsSync(Path);
      if (!res) {
        this.manager.log("create directory context sessions " + Path);
        try {
          mkdirp.sync(Path);
        } catch (e) {
          throw e;
        }
      } else {
        this.gc(this.gc_maxlifetime, contextSession);
        this.finder = new nodefony.finder({
          path: Path,
          recurse: false,
          onFinish: (error, result) => {
            this.manager.log("CONTEXT " + (contextSession ? contextSession : "GLOBAL") + " SESSIONS STORAGE  ==>  " + this.manager.settings.handler.toUpperCase() + " COUNT SESSIONS : " + result.length());
          }
        });
      }
      return true;
    }

    close() {
      this.gc(this.gc_maxlifetime);
      return true;
    }

    destroy(id, contextSession) {

      var fileDestroy = null;
      let Path = null;
      if (contextSession) {
        Path = this.path + "/" + contextSession + "/" + id;
      } else {
        Path = this.path + "/default/" + id;
      }
      try {
        fileDestroy = new nodefony.fileClass(Path);
      } catch (e) {
        this.manager.log("STORAGE FILE :" + Path, "DEBUG");
        return new Promise((resolve /*, reject*/ ) => {
          return resolve(id);
        });
      }
      return new Promise((resolve, reject) => {
        try {
          this.manager.log("FILES SESSIONS STORAGE DESTROY SESSION context : " + contextSession + " ID : " + fileDestroy.name + " DELETED");
          return resolve(fileDestroy.unlink());
        } catch (e) {
          return reject(id);
        }
      });
    }

    gc(maxlifetime, contextSession) {
      let msMaxlifetime = ((maxlifetime || this.gc_maxlifetime) * 1000);
      if (contextSession) {
        let Path = this.path + "/" + contextSession;
        finderGC.call(this, Path, msMaxlifetime, contextSession);
      } else {
        if (this.contextSessions.length) {
          for (let i = 0; i < this.contextSessions.length; i++) {
            finderGC.call(this, this.path + "/" + this.contextSessions[i], msMaxlifetime, this.contextSessions[i]);
          }
        }
      }
    }

    read(file) {
      return new Promise((resolve, reject) => {
        //let id = file.name;
        try {
          fs.readFile(file.path, "utf8", (err, data) => {
            if (err) {
              return reject(err);
            }
            return resolve(JSON.parse(data));
          });

        } catch (e) {
          this.manager.log("FILES SESSIONS STORAGE READ  ==> " + e, "ERROR");
          return reject(e);
        }
      });
    }

    write(fileName, serialize, contextSession) {
      let Path = null;
      if (contextSession) {
        Path = this.path + "/" + contextSession + "/" + fileName;
      } else {
        Path = this.path + "/default/" + fileName;
      }
      return new Promise((resolve, reject) => {
        try {
          fs.writeFile(Path, JSON.stringify(serialize), 'utf8', (err) => {
            if (err) {
              return reject(err);
            }
            return resolve(serialize);
          });
        } catch (e) {
          this.manager.log("FILES SESSIONS STORAGE : " + e, "ERROR");
          return reject(e);
        }
      });
    }
  };
  return fileSessionStorage;
});
