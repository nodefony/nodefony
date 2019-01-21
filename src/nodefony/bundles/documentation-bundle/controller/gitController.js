/**
 *    @Route ("/api/git")
 */
module.exports = class gitController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.serviceGit = this.get("git");
    this.setJsonContext();
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/versions/{project}",
   *      name="documentation-git-versions",
   *      defaults={"project" = "nodefony"}
   *    )
   */
  getVersionsAction(project) {
    return this.serviceGit.getReleases(project)
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
    return this.serviceGit.getStatus()
      .then((status) => {
        return this.renderJson(status);
      }).catch(e => {
        throw e;
      });
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/getCurrentBranch", name="documentation-git-getBranch")
   */
  getCurrentBranchAction() {
    return this.serviceGit.getCurrentBranch()
      .then(branchName => {
        return this.renderJson({
          branch: branchName
        });
      }).catch(e => {
        throw e;
      });
  }

  /**
   *    @Method ({"GET"})
   *    @Route ("/getMostRecentCommit", name="documentation-git-getMostRecentCommit")
   */
  getMostRecentCommitAction() {
    let tab = [];
    return this.serviceGit.getMostRecentCommit()
      .then((ListLogSummary) => {
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
        return this.renderJson(tab);
      }).catch(e => {
        throw e;
      });
  }
};