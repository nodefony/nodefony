const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);

module.exports = {

  Query: {
    async outdated (obj, field, context, info) {
      const {
        bundle,
        dev
      } = field;
      let result = null;
      let stdout = null;
      let stderr = null;
      if (bundle) {
        let Bundle = context.kernel.getBundle(bundle);
        if (!Bundle) {
          Bundle = await context.kernel.getUnregistredBundle(bundle);
          if (!Bundle) {
            throw new Error(`Bundle :${bundle} not found`);
          }
        }
        try {
          res = await exec("\"npm\" --json outdated", {
            cwd: Bundle.path
          });
          stdout = res.stdout;
          stderr = res.stderr;
        } catch (e) {
          stdout = e.stdout;
          stderr = e.stderr;
        }
        if (stdout) {
          stdout = JSON.parse(stdout);
        }
        if (stderr) {
          stderr = JSON.parse(stderr);
        }
        result = {
          stdout,
          stderr
        };
        return JSON.stringify(result);
      }
      result = {};
      return JSON.stringify(result);
    }

    /* async clearCache() {

    }*/
  }

};
