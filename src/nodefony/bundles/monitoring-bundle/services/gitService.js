const promiseGit = require("simple-git");
const remote = "https://github.com/nodefony/nodefony.git";
const useNodefonyVersion = `v${nodefony.version}`;

module.exports = class git extends nodefony.Service {
  constructor (container) {
    super("git", container, container.get("notificationsCenter"));
    this.project = nodefony.projectName;
    this.gitKernel = promiseGit(this.kernel.git._baseDir);
    this.clonePath = path.resolve(__dirname, "..", "clones");
    this.nodefonyClonePath = path.resolve(this.clonePath, "nodefony");
    this.tags = null;
    this.nodefonyTags = null;
    this.cloneGit = null;
    this.currentVersion = useNodefonyVersion;
    if (!fs.existsSync(this.clonePath)) {
      this.kernel.cli.mkdir(this.clonePath);
    }
    if (this.kernel.type === "SERVER" && this.kernel.isCore) {
      this.getProjectTags(true)
        .catch((err) => {
          this.log(err, "ERROR");
        });
      this.cloneNodefony()
        .then((current) => {
          this.currentVersion = current;
          return this.getNodefonyTags(true)
            .then((tags) => {
              if (useNodefonyVersion !== current) {
                this.log(`Change Documentation version to : ${useNodefonyVersion}`);
                if (tags.all.indexOf(useNodefonyVersion) >= 0) {
                  return this.checkoutVersion(useNodefonyVersion, "nodefony")
                    .then((newCurrent) => {
                      this.currentVersion = newCurrent;
                      return newCurrent;
                    })
                    .catch((err) => {
                      throw err;
                    });
                }
              }
              return current;
            })
            .catch((err) => {
              throw err;
            });
        })
        .catch((err) => {
          this.log(err, "ERROR");
        });
    }
  }

  getRepo (name) {
    if (!name) {
      return this.gitKernel;
    }
    const type = typeof name;
    if (type === "string") {
      switch (name) {
      case "nodefony":
        if (this.cloneGit) {
          return this.cloneGit;
        }
        return this.gitKernel;
      case this.project:
        return this.gitKernel;
      default:
        return this.gitKernel;
      }
    }
    return name;
  }

  getClonePath () {
    return this.nodefonyClonePath;
  }

  cloneNodefony () {
    if (fs.existsSync(this.nodefonyClonePath)) {
      return this.initCloneRepo(true);
    }
    const Git = promiseGit(this.clonePath);
    this.log(`git clone nodefony documentation in ${this.clonePath}`);
    return Git
      // .silent(true)
      .clone(remote)
      .then(() => {
        this.log("git clone ok nodefony documentation");
        return this.initCloneRepo();
      })
      .catch((err) => {
        this.log(err, "ERROR");
      });
  }

  initCloneRepo (pull) {
    this.cloneGit = promiseGit(this.nodefonyClonePath);
    if (pull) {
      return this.pull(this.cloneGit, this.currentVersion)
        .then((PullSummary) => {
          this.log(PullSummary, "DEBUG");
          return this.getCurrentBranch(this.cloneGit)
            .then((current) => {
              this.currentVersion = current;
              return current;
            })
            .catch((e) => {
              throw e;
            });
        })
        .catch((e) => {
          throw e;
        });
    }
    return this.getCurrentBranch(this.cloneGit)
      .then((current) => {
        this.currentVersion = current;
        return current;
      })
      .catch((e) => {
        throw e;
      });
  }

  getReleases (repo, force) {
    if (!repo) {
      return this.getProjectTags(force);
    } else if (typeof repo === "string") {
      switch (repo) {
      case "nodefony":
        return this.getNodefonyTags(force);
      default:
        return this.getProjectTags(force);
      }
    }
    return repo.tags()
      .then((tags) => tags)
      .catch((e) => {
        throw e;
      });
  }

  getNodefonyTags (force) {
    if (this.nodefonyTags && force !== true) {
      return new Promise((resolve) => resolve(this.nodefonyTags));
    }
    if (this.cloneGit) {
      return this.cloneGit.tags()
        .then((tags) => {
          this.nodefonyTags = tags;
          return tags;
        })
        .catch((e) => {
          throw e;
        });
    }
    return Promise.resolve(this.currentVersion);
  }

  getProjectTags (force) {
    if (this.tags && force !== true) {
      return new Promise((resolve) => resolve(this.tags));
    }
    return this.gitKernel.tags()
      .then((tags) => {
        this.tags = tags;
        return tags;
      })
      .catch((e) => {
        throw e;
      });
  }

  checkoutVersion (version, repo) {
    this.log(`Checkout Documentation :  ${version}`);
    return this.getRepo(repo).checkout(version)
      .then(() => this.getCurrentBranch(this.cloneGit)
        .then((current) => {
          this.log(`Documentation version:  ${current}`);
          this.currentVersion = current;
          return current;
        }))
      .catch((e) => {
        throw e;
      });
  }

  getStatus (repo) {
    return this.getRepo(repo).status()
      .then((status) => status)
      .catch((e) => {
        throw e;
      });
  }

  getCurrentBranch (repo) {
    return this.getRepo(repo).branch()
      .then((BranchSummary) => BranchSummary.current)
      .catch((e) => {
        throw e;
      });
  }

  getMostRecentCommit (repo) {
    return this.getRepo(repo).log()
      .then((ListLogSummary) => ListLogSummary)
      .catch((e) => {
        throw e;
      });
  }

  pull (repo, branch) {
    return this.getRepo(repo).pull(remote, branch)
      .then((PullSummary) => PullSummary)
      .catch((e) => {
        throw e;
      });
  }
};
