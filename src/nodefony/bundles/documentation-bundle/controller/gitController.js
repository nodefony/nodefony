/**
 *    @Route ("/api/git")
 */
module.exports = class gitController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.git = this.kernel.git;
    this.serviceGit = this.get("git");
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/versions", name="documentation-git-versions")
   */
  getVersionsAction() {
    return this.serviceGit.getReleases()
      .then((tags) => {
        return this.renderJson(tags);
      }).catch(e => {
        throw e;
      });
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/getStatus", name="documentation-git-getStatus")
   */
  getStatusAction() {

    let tab = [];
    try {
      this.git.Repository.open(this.get("kernel").rootDir)
        .then((repo) => {
          repo.getStatus().then((statuses) => {
            statuses.forEach((file) => {
              let obj = {
                path: file.path(),
                type: file.status()
              };
              tab.push(obj);
            });
            this.renderJsonAsync(tab);
          });
        })
        .catch((err) => {
          if (err) {
            throw err;
          }
          this.renderJsonAsync(tab);
        }).done(function() {
          //console.log('Finished');
        });
    } catch (e) {
      throw e;
    }
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/getCurrentBranch", name="documentation-git-getBranch")
   */
  getCurrentBranchAction() {

    this.git.branch((err, BranchSummary) => {
      if (err) {
        return this.renderJsonAsync({
          error: err
        });
      }
      return this.renderJsonAsync({
        branch: BranchSummary.current
      });
    });
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/getMostRecentCommit", name="documentation-git-getMostRecentCommit")
   */
  getMostRecentCommitAction() {
    let tab = [];
    this.git.log((err, ListLogSummary) => {
      if (err) {
        throw err;
      }
      let nb = ListLogSummary.all.length;
      if (nb > 10) {
        nb = 10;
      }
      for (let i = 0; i < nb; i++) {
        tab.push({
          sha: ListLogSummary.all[i].hash,
          msg: ListLogSummary.all[i].message,
          author: ListLogSummary.all[i].author_name,
          date: ListLogSummary.all[i].date
        });
      }
      this.renderJsonAsync(tab);
    });
  }
};