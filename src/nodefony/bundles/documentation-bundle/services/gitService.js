const promiseGit = require('simple-git/promise');
const remote = `https://github.com/nodefony/nodefony-core.git`;

module.exports = class git extends nodefony.Service {

  constructor(container) {
    super("git", container, container.get("notificationsCenter"));
    this.git = new promiseGit(this.kernel.git._baseDir);
    this.clonePath = path.resolve(__dirname, "..", "clones");
    this.nodefonyClonePath = path.resolve(this.clonePath, "nodefony-core");
    this.tags = null;
    this.cloneGit = null;
    this.currentVersion = null;
    if (this.kernel.type === "SERVER") {
      this.getTags();
      this.cloneNodefony();
    }

  }

  getClonePath() {
    return this.nodefonyClonePath;
  }

  cloneNodefony() {
    if (fs.existsSync(this.nodefonyClonePath)) {
      return this.initCloneRepo();
    }
    const Git = new promiseGit(this.clonePath);
    this.logger(`git clone nodefony documentation in ${this.clonePath}`);
    return Git
      .silent(true)
      .clone(remote)
      .then(() => {
        this.logger(`git clone ok nodefony documentation`);
        this.initCloneRepo();
      })
      .catch((err) => {
        this.logger(err, "ERROR");
      });
  }

  getTags() {
    return this.getReleases(true)
      .then((tags) => {
        return tags;
      }).catch(e => {
        throw e;
      });
  }

  initCloneRepo() {
    this.cloneGit = new promiseGit(this.nodefonyClonePath);
    return this.getCurrentBranch(this.cloneGit)
      .then((current) => {
        this.currentVersion = current;
      }).catch(e => {
        throw e;
      });

  }

  getReleases(force) {
    if (this.tags && force !== true) {
      return new Promise((resolve) => {
        return resolve(this.tags);
      });
    } else {
      return this.git.tags()
        .then((tags) => {
          this.tags = tags;
          return tags;
        }).catch(e => {
          throw e;
        });
    }
  }

  checkoutVersion(version) {
    return this.cloneGit.checkout(version)
      .then(() => {
        return this.getCurrentBranch(this.cloneGit)
          .then((current) => {
            this.currentVersion = current;
            return current;
          });
      }).catch(e => {
        throw e;
      });
  }

  getStatus(repo) {
    if (!repo) {
      repo = this.git;
    }
    return repo.status()
      .then((status) => {
        return status;
      }).catch(e => {
        throw e;
      });
  }

  getCurrentBranch(repo) {
    if (!repo) {
      repo = this.git;
    }
    return repo.branch()
      .then((BranchSummary) => {
        return BranchSummary.current;
      }).catch(e => {
        throw e;
      });
  }

  getMostRecentCommit(repo) {
    if (!repo) {
      repo = this.git;
    }
    return repo.log()
      .then((ListLogSummary) => {
        return ListLogSummary;
      }).catch(e => {
        throw e;
      });
  }

};