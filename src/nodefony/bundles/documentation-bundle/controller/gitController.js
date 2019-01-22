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
   *    @Route (
   *      "/getStatus/{project}",
   *      name="documentation-git-getStatus",
   *      defaults={"project" = "nodefony"}
   *    )
   */
  getStatusAction(project) {
    return this.serviceGit.getStatus(project)
      .then((status) => {
        return this.renderJson(status);
      }).catch(e => {
        throw e;
      });
  }

  /**
   *    @Method ({"GET"})
   *    @Route (
   *      "/getCurrentBranch/{project}",
   *      name="documentation-git-getBranch",
   *      defaults={"project" = "nodefony"}
   *    )
   */
  getCurrentBranchAction(project) {
    return this.serviceGit.getCurrentBranch(project)
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
   *    @Route (
   *      "/getMostRecentCommit/{project}",
   *      name="documentation-git-getMostRecentCommit",
   *      defaults={"project" = "nodefony"}
   *     )
   */
  getMostRecentCommitAction(project) {
    let tab = [];
    return this.serviceGit.getMostRecentCommit(project)
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