const chokidar = require('chokidar');


const defaultWatcherSettings = {
  persistent: true,
  followSymlinks: true,
  cwd: '.',
  //useFsEvents:    true,
  usePolling: true,
  interval: 100,
  binaryInterval: 300,
  //alwaysStat:    false,
  //depth:    99,
  //awaitWriteFinish:  {
  //  stabilityThreshold: 2000,
  //  pollInterval: 100
  //},
  //ignorePermissionErrors: false,
  atomic: true // or a custom 'atomicity delay', in milliseconds (default 100)
};

class Watcher extends nodefony.Service {
  constructor(Path, settings, container) {
    super("WATCHER", container);
    this.chokidar = chokidar;
    this.watcher = null;
    this.path = Path;
    this.settings = nodefony.extend(true, {}, defaultWatcherSettings, settings);
    if (this.path) {
      this.watch(this.path, this.settings);
    }
  }

  watch(Path, settings) {
    try {
      if (this.watcher) {
        let error = new Error("Already watching  : " + Path);
        this.fire("onError", error);
        throw error;
      }
      if (Path) {
        this.path = Path;
      }

      if (this.path) {
        this.initialize(this.path, settings);
      } else {
        let error = new Error("WATCHER no path");
        this.fire("onError", error);
        throw error;
      }
      return this.watcher;
    } catch (e) {
      this.fire("onError", e);
      throw e;
    }
  }

  unwatch(file) {
    try {
      return this.watcher.unwatch(file);
    } catch (e) {
      this.fire("onError", e);
      this.log(e, "ERROR");
      throw e;
    }
  }

  getWatched(file) {
    if (!file) {
      if (this.watcher) {
        return this.watcher.getWatched();
      }
    }
  }

  close(removeEvents) {
    if (this.watcher) {
      this.watcher.close();
      this.fire("onClose", this.watcher);
      if (removeEvents) {
        this.removeAllListeners();
      }
      this.watcher = null;
    }
  }
  initialize(Path, settings) {
    try {
      this.watcher = this.chokidar.watch(Path, nodefony.extend(true, {}, this.settings, settings));
      this.fire("onInitialize", this.watcher, Path);
      super.log("INITIALISE WATCHING  PATH : " + Path, "DEBUG");
      this.watcher.on('all', (event, Path) => {
        this.fire("all", event, Path);
        try {
          let stats = null;
          event = event.charAt(0).toUpperCase() + event.slice(1);
          this.fire("on" + event, Path, stats, this.watcher);
        } catch (e) {
          this.fire("onError", e);
          this.log(e, "ERROR");
          throw e;
        }
      });
      return this.watcher;
    } catch (e) {
      this.fire("onError", e);
      throw e;
    }
  }
}

module.exports = Watcher;
