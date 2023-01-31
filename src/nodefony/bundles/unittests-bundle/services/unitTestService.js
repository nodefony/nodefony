const Mocha = require("mocha");

const regFile = /^(.*)Test\.js$|^(.*)Test\.mjs$/;

module.exports = class unitTest extends nodefony.Service {
  constructor (kernel /* , options*/) {
    super("unitTest", kernel.container, kernel.notificationsCenter);
    this.bundles = this.kernel.bundles;
  }

  consoleMochaInit () {
    this.settingMocha = this.kernel.getBundle("unittests").settings.mocha.nodefony;
    this.mocha = new Mocha(this.settingMocha.console);
    this.mocha.suite.on("pre-require", (context) => {
      context.kernel = this.kernel;
    });
  }

  mochaAddTest (tests) {
    for (let i = 0; i < tests.length; i++) {
      this.mocha.addFile(tests[i].path);
    }
  }

  mochaRunTest (callback) {
    return this.mocha.run(callback);
  }

  getBundlesTestFiles (bundleName, testName, tests) {
    if (!this.bundles[bundleName]) {
      throw new Error(`${bundleName} don't exist`);
    }
    if (this.kernel.isBundleCore(bundleName) && !this.kernel.isCore) {
      return;
    }
    if (this.bundles[bundleName].findResult) {
      const results = this.bundles[bundleName].findResult.find(regFile);
      if (results.length) {
        for (let i = 0; i < results.length; i++) {
          if (testName) {
            if (results[i].name === testName) {
              results[i].bundle = bundleName;
              tests.push(results[i]);
            }
          } else {
            results[i].bundle = bundleName;
            tests.push(results[i]);
          }
        }
      }
    }
  }

  getNodefonyTestFiles (testName, tests) {
    if (this.kernel.isCore) {
      const finder = new nodefony.finder({
        path: this.kernel.nodefonyPath,
        exclude: /^bundles$|^doc$|^node_modules$|^builder$/,
        match: regFile
      });
      if (finder.result.files.length) {
        for (let i = 0; i < finder.result.files.length; i++) {
          if (testName) {
            if (finder.result.files[i].name === testName) {
              finder.result.files[i].bundle = "nodefony";
              tests.push(finder.result.files[i]);
            }
          } else {
            finder.result.files[i].bundle = "nodefony";
            tests.push(finder.result.files[i]);
          }
        }
      }
    }
  }
};
