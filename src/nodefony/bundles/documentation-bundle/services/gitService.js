module.exports = class git extends nodefony.Service {

  constructor(container) {
    super("git", container, container.get("notificationsCenter"));
    this.git = this.kernel.git;
  }


  getReleases() {
    return new Promise((resolve, reject) => {
      try {
        return this.git.tags({}, (error, tags) => {
          if (error) {
            return reject(error);
          }
          return resolve(tags);
        });

      } catch (e) {
        return reject(e);
      }
    });
  }


};