class launchTask extends nodefony.Task {
  constructor (name, command) {
    super(name, command);
    this.serviceUnitTest = this.get("unitTest");
    this.serviceUnitTest.consoleMochaInit();
    this.tests = [];
  }

  showHelp () {
    this.setHelp(
      "unitest:launch:all",
      "Launch all tests Example : nodefony unitest:launch:all"
    );
    this.setHelp(
      "unitest:launch:bundle bundleName [testfile]",
      "Launch bundle tests Example: nodefony unitest:launch:bundle demoBundle responseTest.js"
    );
  }

  all () {
    this.serviceUnitTest.getNodefonyTestFiles(null, this.tests);
    for (const bundle in this.kernel.bundles) {
      this.serviceUnitTest.getBundlesTestFiles(bundle, null, this.tests);
    }
    return this.onReady()
      .then(() => 0)
      .catch((e) => this.terminate(e));
  }

  bundle (bundleName, testName) {
    bundleName = bundleName.replace("[-]?[Bb]undle", "");
    if (bundleName === "nodefony") {
      this.serviceUnitTest.getNodefonyTestFiles(testName, this.tests);
    } else {
      this.serviceUnitTest.getBundlesTestFiles(bundleName, testName, this.tests);
    }
    return this.onReady()
      .then(() => 0)
      .catch((e) => this.terminate(e));
  }

  onReady () {
    return new Promise((resolve, reject) => {
      this.serviceUnitTest.mochaAddTest(this.tests);
      return this.serviceUnitTest.mochaRunTest((failures) => {
        if (failures) {
          process.exitCode = failures ? 1 : 0;
          return reject(failures);
        }
        return resolve(true);
      });
    });
  }
}
module.exports = launchTask;
